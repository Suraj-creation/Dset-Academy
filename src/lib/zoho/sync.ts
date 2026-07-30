// Orchestration: validate the feature flag -> map the source row -> enqueue -> attempt the
// live upsert -> persist status -> audit log. This is the module later phases will import
// from the approved form-handling routes (api/contact.ts, api/widget/chat.ts,
// api/applications.ts) — see the implementation plan §06 for the exact trigger point in each.
//
// Scoped to the modules currently approved for integration: Contacts, Chat Leads, and
// Applications. WhatsApp handover, Whitepaper Leads, and LinkedIn are still under
// development and are deliberately not wired here — those features' own code is untouched,
// and they will be integrated separately once approved (see project memory).
//
// Nothing currently imports this file, so none of the functions below are reachable from a
// real request yet. They're written now so wiring them up later is a one-line addition per
// route, not a redesign.
import { randomUUID } from 'crypto';
import { db } from '@/lib/db';
import { zohoSyncLog } from '@/lib/schema';
import type { ContactEntry } from '@/lib/contacts.server';
import type { LeadData } from '@/lib/leads.server';
import type { Application } from '@/lib/applications.server';
import { upsertLead, upsertJobApplication, updateJobApplication } from './client';
import { enqueueSync, claimPendingBatch, markSynced, markFailed, findSyncedJobApplicationMatch, withJobApplicationLock } from './queue.server';
import { contactToZohoLead, chatLeadToZohoLead, applicationToZohoJobApplication } from './mappers';
import type { SourceTable, SyncQueueRow, ZohoModule, ZohoUpsertResponseRecord } from './types';

function isZohoSyncEnabled(): boolean {
  return process.env.ZOHO_SYNC_ENABLED === 'true';
}

async function logAttempt(row: SyncQueueRow, responseStatus: number | null, responseBody: unknown, error?: string): Promise<void> {
  try {
    await db.insert(zohoSyncLog).values({
      id: randomUUID(),
      sourceTable: row.sourceTable,
      sourceId: row.sourceId,
      zohoModule: row.zohoModule,
      requestPayload: row.payload,
      responseStatus: responseStatus ?? undefined,
      responseBody: (responseBody as object | undefined) ?? undefined,
      error: error ?? undefined,
      createdAt: new Date().toISOString(),
    });
  } catch {
    // Audit logging must never itself break the sync flow.
  }
}

/** Pulls the Zoho-assigned record id out of a create/update/upsert response, or undefined. */
function extractRecordId(data: unknown): string | undefined {
  const records = (data as { data?: ZohoUpsertResponseRecord[] } | undefined)?.data;
  return records?.[0]?.details?.id;
}

/**
 * Processes one queued Leads sync job (Contacts, Chat Leads) via Zoho's own upsert dedupe —
 * unaffected by the Job Application dedupe rework below.
 */
async function processLeadRow(row: SyncQueueRow): Promise<void> {
  // Email is the dedupe key everywhere except WhatsApp, which has no email identity.
  const duplicateCheckField: 'Email' | 'Phone' = row.payload.Email ? 'Email' : row.payload.Phone ? 'Phone' : 'Email';
  const result = await upsertLead(row.payload, duplicateCheckField);

  await logAttempt(row, result.status, result.data, result.ok ? undefined : result.error);

  if (!result.ok) {
    await markFailed(row.id, result.error ?? `Zoho API call failed with status ${result.status}`);
    return;
  }
  const zohoRecordId = extractRecordId(result.data);
  if (!zohoRecordId) {
    await markFailed(row.id, 'Zoho response did not include a record id');
    return;
  }
  await markSynced(row.id, zohoRecordId);
}

/**
 * Processes one queued Job Application sync job. Zoho's own upsert dedupe can't safely
 * enforce the approved Email+Job_ID composite key (see client.ts), so the real dedupe check
 * happens here: look up whether another application row with the same normalized email+jobId
 * has already synced, and if so, target that exact Zoho record with a direct update instead
 * of creating a new one. The lookup + Zoho call + write-back all happen under a per-key
 * advisory lock so two near-simultaneous submissions for the same email+jobId can't both miss
 * each other and create two records.
 */
async function processJobApplicationRow(row: SyncQueueRow): Promise<void> {
  const email = typeof row.payload.Email === 'string' ? row.payload.Email : '';
  const jobId = Number(row.payload.Job_ID);

  const run = async (): Promise<void> => {
    const existingMatch = email && Number.isFinite(jobId)
      ? await findSyncedJobApplicationMatch(email, jobId, row.sourceId)
      : null;

    const result = existingMatch
      ? await updateJobApplication(existingMatch.zohoRecordId, row.payload)
      : await upsertJobApplication(row.payload);

    await logAttempt(row, result.status, result.data, result.ok ? undefined : result.error);

    if (!result.ok) {
      await markFailed(row.id, result.error ?? `Zoho API call failed with status ${result.status}`);
      return;
    }

    // A direct update's response doesn't need re-parsing for the id — we already know it.
    const zohoRecordId = existingMatch ? existingMatch.zohoRecordId : extractRecordId(result.data);
    if (!zohoRecordId) {
      await markFailed(row.id, 'Zoho response did not include a record id');
      return;
    }
    await markSynced(row.id, zohoRecordId);
  };

  if (!email || !Number.isFinite(jobId)) {
    // Missing identity to dedupe on — fall through without the lock rather than lock on a
    // meaningless key; behaves exactly as before this change (plain upsert, best effort).
    await run();
    return;
  }
  await withJobApplicationLock(email, jobId, run);
}

/**
 * Processes one queued sync job: calls the appropriate Zoho upsert, records the outcome in
 * zoho_sync_log, and updates the queue + source-table status. Exported so the future cron
 * retry route (Phase 2+) can call it directly on a claimed batch; not invoked by anything
 * else in Phase 1.
 */
async function processQueueRow(row: SyncQueueRow): Promise<void> {
  if (row.zohoModule === 'JobApplications') {
    await processJobApplicationRow(row);
    return;
  }
  await processLeadRow(row);
}

/** Enqueues a job and makes one best-effort inline attempt; never throws to the caller. */
async function syncRecord(sourceTable: SourceTable, sourceId: string, zohoModule: ZohoModule, payload: Record<string, unknown>): Promise<void> {
  if (!isZohoSyncEnabled()) return; // fully inert while disabled — no DB write, no network call

  try {
    const row = await enqueueSync({ sourceTable, sourceId, zohoModule, payload });
    await processQueueRow(row); // best-effort; failures remain queued for the (future) cron sweep
  } catch {
    // Matches the existing sendMail().catch(() => {}) convention — a Zoho hiccup must never
    // surface to whatever caller (a form handler) triggered this.
  }
}

export async function syncContactToZoho(contact: ContactEntry, extra?: { intent?: string }): Promise<void> {
  await syncRecord('contacts', contact.id, 'Leads', contactToZohoLead(contact, extra));
}

export async function syncChatLeadToZoho(lead: LeadData): Promise<void> {
  if (!lead.email) return; // no reliable identity yet — never sync an uncaptured session
  await syncRecord('leads', lead.id, 'Leads', chatLeadToZohoLead(lead));
}

export async function syncApplicationToZoho(application: Application): Promise<void> {
  await syncRecord('applications', application.id, 'JobApplications', applicationToZohoJobApplication(application));
}

/**
 * Entry point the future cron retry route (Phase 2+) will call on a schedule. Not wired to
 * any route in Phase 1.
 */
export async function runSyncBatch(limit = 20): Promise<{ processed: number }> {
  if (!isZohoSyncEnabled()) return { processed: 0 };
  const batch = await claimPendingBatch(limit);
  for (const row of batch) {
    await processQueueRow(row);
  }
  return { processed: batch.length };
}
