// Sync queue service: creates sync jobs, tracks their pending/processing/synced/failed state,
// and mirrors the outcome back onto the originating source-table row. This is the durable
// layer sitting under src/lib/zoho/sync.ts — see the implementation plan §01/§04 for why a
// queue exists on top of a plain fire-and-forget call (crash/outage safety + retries).
import { randomUUID } from 'crypto';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { zohoSyncQueue, contacts, leads } from '@/lib/schema';
import type { EnqueueSyncInput, SourceTable, SyncQueueRow } from './types';

function maxSyncAttempts(): number {
  return Number(process.env.ZOHO_MAX_SYNC_ATTEMPTS ?? 5);
}

// Backoff schedule for retries: +2min, +10min, +30min, +2hr, +6hr (matches the approved plan §04).
const BACKOFF_MINUTES = [2, 10, 30, 120, 360];

function toQueueRow(row: typeof zohoSyncQueue.$inferSelect): SyncQueueRow {
  return {
    id: row.id,
    sourceTable: row.sourceTable,
    sourceId: row.sourceId,
    zohoModule: row.zohoModule,
    payload: row.payload as Record<string, unknown>,
    status: row.status as SyncQueueRow['status'],
    attempts: row.attempts,
    lastError: row.lastError,
    nextAttemptAt: row.nextAttemptAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * Enqueues a sync job. Idempotent: if a PENDING or PROCESSING row already exists for this
 * exact (sourceTable, sourceId), its payload is refreshed in place instead of inserting a
 * duplicate. A partial unique index (migrations/add_zoho_integration.sql) is the
 * database-level backstop against a race producing two active rows for the same record.
 */
export async function enqueueSync(input: EnqueueSyncInput): Promise<SyncQueueRow> {
  const existing = await db
    .select()
    .from(zohoSyncQueue)
    .where(
      and(
        eq(zohoSyncQueue.sourceTable, input.sourceTable),
        eq(zohoSyncQueue.sourceId, input.sourceId),
        inArray(zohoSyncQueue.status, ['pending', 'processing']),
      ),
    )
    .limit(1);

  const now = new Date().toISOString();

  if (existing[0]) {
    const [updated] = await db
      .update(zohoSyncQueue)
      .set({ payload: input.payload, updatedAt: now })
      .where(eq(zohoSyncQueue.id, existing[0].id))
      .returning();
    return toQueueRow(updated);
  }

  const [inserted] = await db
    .insert(zohoSyncQueue)
    .values({
      id: randomUUID(),
      sourceTable: input.sourceTable,
      sourceId: input.sourceId,
      zohoModule: input.zohoModule,
      payload: input.payload,
      status: 'pending',
      attempts: 0,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return toQueueRow(inserted);
}

/**
 * Atomically claims up to `limit` eligible rows (pending, or failed and due for retry) and
 * marks them "processing" so two concurrent callers can't double-process the same row.
 * Nothing calls this in Phase 1 — the cron retry sweep that will is a later phase.
 */
export async function claimPendingBatch(limit: number): Promise<SyncQueueRow[]> {
  const nowIso = new Date().toISOString();
  // Raw SQL returns literal (snake_case) column names, not the camelCase keys toQueueRow()
  // expects (that mapping only happens automatically via Drizzle's query-builder methods,
  // e.g. enqueueSync()'s `.returning()`). Every column but `payload`/`status`/`attempts` must
  // be aliased explicitly here, or toQueueRow() silently reads them as undefined — which
  // previously caused sourceTable/sourceId/zohoModule to come back null (breaking module
  // dispatch, source-row status updates, and the audit log) despite the call still returning
  // a 200. Found by testing this code path for the first time (nothing called it before).
  const result = await db.execute(sql`
    UPDATE zoho_sync_queue
    SET status = 'processing', updated_at = ${nowIso}
    WHERE id IN (
      SELECT id FROM zoho_sync_queue
      WHERE status IN ('pending', 'failed')
        AND (next_attempt_at IS NULL OR next_attempt_at <= ${nowIso})
      ORDER BY created_at
      LIMIT ${limit}
      FOR UPDATE SKIP LOCKED
    )
    RETURNING
      id,
      source_table AS "sourceTable",
      source_id AS "sourceId",
      zoho_module AS "zohoModule",
      payload,
      status,
      attempts,
      last_error AS "lastError",
      next_attempt_at AS "nextAttemptAt",
      created_at AS "createdAt",
      updated_at AS "updatedAt";
  `);
  const rows = (result as unknown as { rows: (typeof zohoSyncQueue.$inferSelect)[] }).rows;
  return rows.map(toQueueRow);
}

// normalizeEmail(), findSyncedJobApplicationMatch(), and withJobApplicationLock() were removed
// here (2026-08 — company policy: Career Applications no longer sync to Zoho CRM at all; that
// whole dedupe/locking system existed solely to serve the Job Application Zoho sync — see
// project memory).

async function updateSourceZohoFields(
  sourceTable: SourceTable,
  sourceId: string,
  fields: {
    zohoRecordId?: string | null;
    zohoSyncStatus: string;
    zohoSyncedAt?: string | null;
    zohoSyncAttempts?: number;
    zohoSyncError?: string | null;
  },
): Promise<void> {
  switch (sourceTable) {
    case 'contacts':
      await db.update(contacts).set(fields).where(eq(contacts.id, sourceId));
      return;
    case 'leads':
      await db.update(leads).set(fields).where(eq(leads.id, sourceId));
      return;
  }
}

export async function markSynced(queueId: string, zohoRecordId: string): Promise<void> {
  const now = new Date().toISOString();
  const [row] = await db
    .update(zohoSyncQueue)
    .set({ status: 'synced', updatedAt: now })
    .where(eq(zohoSyncQueue.id, queueId))
    .returning();
  if (!row) return;

  await updateSourceZohoFields(row.sourceTable as SourceTable, row.sourceId, {
    zohoRecordId,
    zohoSyncStatus: 'synced',
    zohoSyncedAt: now,
    zohoSyncError: null,
  });
}

export async function markFailed(queueId: string, errorMessage: string): Promise<void> {
  const [row] = await db.select().from(zohoSyncQueue).where(eq(zohoSyncQueue.id, queueId)).limit(1);
  if (!row) return;

  const attempts = row.attempts + 1;
  const permanent = attempts >= maxSyncAttempts();
  const backoffMinutes = BACKOFF_MINUTES[Math.min(attempts - 1, BACKOFF_MINUTES.length - 1)];
  const nextAttemptAt = permanent ? null : new Date(Date.now() + backoffMinutes * 60_000).toISOString();
  const status = permanent ? 'failed_permanent' : 'failed';
  const now = new Date().toISOString();

  await db
    .update(zohoSyncQueue)
    .set({ status, attempts, lastError: errorMessage, nextAttemptAt, updatedAt: now })
    .where(eq(zohoSyncQueue.id, queueId));

  await updateSourceZohoFields(row.sourceTable as SourceTable, row.sourceId, {
    zohoSyncStatus: status,
    zohoSyncAttempts: attempts,
    zohoSyncError: errorMessage,
  });
}
