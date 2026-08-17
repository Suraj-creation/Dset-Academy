// Orchestration: validate the feature flag -> map the source row -> enqueue -> attempt the
// live upsert -> persist status -> audit log.
//
// Scoped to the modules currently approved for integration: Contacts and Chat Leads only.
// Career Applications was removed here (2026-08 — company policy: never sync to Zoho CRM;
// see project memory). WhatsApp handover, Whitepaper Leads, and LinkedIn are still under
// development and are deliberately not wired here — those features' own code is untouched,
// and they will be integrated separately once approved.
import { randomUUID } from 'crypto';
import { db } from '@/lib/db';
import { zohoSyncLog } from '@/lib/schema';
import type { ContactEntry } from '@/lib/contacts.server';
import type { LeadData } from '@/lib/leads.server';
import { upsertLead } from './client';
import { enqueueSync, claimPendingBatch, markSynced, markFailed } from './queue.server';
import { contactToZohoLead, chatLeadToZohoLead } from './mappers';
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
 * Processes one queued sync job (Contacts, Chat Leads) via Zoho's own upsert dedupe, records
 * the outcome in zoho_sync_log, and updates the queue + source-table status. Called both
 * inline (one best-effort attempt right after enqueueing) and by the retry cron
 * (src/pages/api/cron/zoho-sync-retry.ts) on a claimed batch.
 */
async function processQueueRow(row: SyncQueueRow): Promise<void> {
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

/**
 * Entry point the retry cron (src/pages/api/cron/zoho-sync-retry.ts) calls on a schedule.
 */
export async function runSyncBatch(limit = 20): Promise<{ processed: number }> {
  if (!isZohoSyncEnabled()) return { processed: 0 };
  const batch = await claimPendingBatch(limit);
  for (const row of batch) {
    await processQueueRow(row);
  }
  return { processed: batch.length };
}
