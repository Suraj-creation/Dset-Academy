// Low-level Zoho CRM API client. Every outbound Zoho call in this integration goes through
// zohoRequest() so token injection, retry-on-401, and rate-limit backoff live in one place.
//
// Phase 1: ZOHO_SYNC_ENABLED defaults to "false", and no route or cron job calls any function
// in this file yet — so in practice nothing here ever reaches the network in this phase. The
// short-circuit below is the first thing that runs on every call, before any token lookup.
import { getValidAccessToken, invalidateCachedAccessToken } from './auth';
import type { ZohoApiResult } from './types';

function isZohoSyncEnabled(): boolean {
  return process.env.ZOHO_SYNC_ENABLED === 'true';
}

interface ZohoRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string; // e.g. '/crm/v3/Leads/upsert'
  body?: unknown;
}

const MAX_ATTEMPTS = 3; // 1 initial + up to 2 retries (one 401 retry, one 429 backoff)
const RATE_LIMIT_BACKOFF_MS = 2000;

export async function zohoRequest<T = unknown>({ method, path, body }: ZohoRequestOptions): Promise<ZohoApiResult<T>> {
  if (!isZohoSyncEnabled()) {
    return { ok: false, status: 0, error: 'Zoho sync disabled (ZOHO_SYNC_ENABLED is not "true")' };
  }

  const apiDomain = process.env.ZOHO_API_DOMAIN;
  if (!apiDomain) {
    return { ok: false, status: 0, error: 'ZOHO_API_DOMAIN is not configured' };
  }

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let accessToken: string;
    try {
      accessToken = await getValidAccessToken();
    } catch (err) {
      return { ok: false, status: 0, error: err instanceof Error ? err.message : 'Failed to obtain Zoho access token' };
    }

    let res: Response;
    try {
      res = await fetch(`https://${apiDomain}${path}`, {
        method,
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (err) {
      return { ok: false, status: 0, error: err instanceof Error ? err.message : 'Network error calling Zoho' };
    }

    if (res.status === 401 && attempt < MAX_ATTEMPTS) {
      invalidateCachedAccessToken(); // token may have just expired early — force a real refresh next loop
      continue;
    }

    if (res.status === 429 && attempt < MAX_ATTEMPTS) {
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_BACKOFF_MS * attempt));
      continue;
    }

    const data = await res.json().catch(() => undefined);
    if (!res.ok) {
      return { ok: false, status: res.status, data, error: `Zoho API returned ${res.status}` };
    }
    return { ok: true, status: res.status, data };
  }

  return { ok: false, status: 0, error: 'Exhausted retries calling Zoho' };
}

/** Upserts a Leads record, deduped server-side by the given field (Email, or Phone for WhatsApp). */
export function upsertLead(payload: Record<string, unknown>, duplicateCheckField: 'Email' | 'Phone') {
  return zohoRequest({
    method: 'POST',
    path: '/crm/v3/Leads/upsert',
    body: { data: [payload], duplicate_check_fields: [duplicateCheckField] },
  });
}

/**
 * Creates a record in the "Job Applications" custom module. Module API name is
 * `Job_Application` (singular) — Zoho auto-generated it from the singular label at creation
 * time, not the plural display name "Job Applications".
 *
 * NOTE: `duplicate_check_fields: ['Email', 'Job_ID']` looks like it should dedupe on that
 * pair, but Zoho's upsert dedupe only works when the listed fields are individually
 * configured as "unique" in Zoho — and neither can safely be, here. Marking Job_ID unique
 * alone was tried and reverted: it merged different candidates who applied to the same job
 * into one record. Marking Email unique alone would equally break one candidate legitimately
 * applying to two different jobs. There's no Zoho-native way to express a composite
 * (Email + Job_ID) unique key, so this field is left in as a harmless no-op and the real
 * dedupe now happens at the application level — see findSyncedJobApplicationMatch() in
 * queue.server.ts and processJobApplicationRow() in sync.ts, which decide up front whether
 * to call this (new record) or updateJobApplication() (existing record) below.
 */
export function upsertJobApplication(payload: Record<string, unknown>) {
  return zohoRequest({
    method: 'POST',
    path: '/crm/v3/Job_Application/upsert',
    body: { data: [payload], duplicate_check_fields: ['Email', 'Job_ID'] },
  });
}

/**
 * Updates a specific, already-known Job_Application record by its Zoho id — used instead of
 * upsertJobApplication() when our own Email+Job_ID lookup (queue.server.ts) already found the
 * record this submission belongs to, sidestepping Zoho's per-field-only unique constraint
 * limitation entirely.
 */
export function updateJobApplication(recordId: string, payload: Record<string, unknown>) {
  return zohoRequest({
    method: 'PUT',
    path: `/crm/v3/Job_Application/${recordId}`,
    body: { data: [payload] },
  });
}
