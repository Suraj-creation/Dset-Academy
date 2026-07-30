// Shared types for the Zoho CRM integration (src/lib/zoho/*).
// See "Zoho CRM Integration — Implementation Plan" for the approved architecture this
// mirrors. Phase 1 only: these types exist so the service layer compiles end-to-end; no
// module described here makes a live Zoho API call yet.

export type ZohoModule = 'Leads' | 'JobApplications';

export type SyncStatus = 'pending' | 'processing' | 'synced' | 'failed' | 'failed_permanent';

// Scoped to the modules currently approved for Zoho integration. WhatsApp handover and
// Whitepaper Leads are deliberately excluded — those features are still under development
// and will be wired up separately once approved (see project memory).
export type SourceTable = 'contacts' | 'leads' | 'applications';

export interface EnqueueSyncInput {
  sourceTable: SourceTable;
  sourceId: string;
  zohoModule: ZohoModule;
  /** Pre-mapped, Zoho-shaped record — computed once at enqueue time by src/lib/zoho/mappers.ts. */
  payload: Record<string, unknown>;
}

export interface SyncQueueRow {
  id: string;
  sourceTable: string;
  sourceId: string;
  zohoModule: string;
  payload: Record<string, unknown>;
  status: SyncStatus;
  attempts: number;
  lastError: string | null;
  nextAttemptAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Normalized result every src/lib/zoho/client.ts call returns — callers never see raw fetch errors. */
export interface ZohoApiResult<T = unknown> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
}

/** Zoho's own upsert response shape (subset of fields this integration reads). */
export interface ZohoUpsertResponseRecord {
  code: string; // 'SUCCESS' | 'DUPLICATE_DATA' | ...
  details?: { id?: string };
  status: 'success' | 'error';
  message?: string;
}

export interface ZohoLeadPayload {
  First_Name?: string;
  Last_Name: string;
  Email?: string;
  Phone?: string;
  Company: string;
  Description?: string;
  Lead_Source: string;
  Lead_Status?: string;
  Website_Record_ID?: string;
  Website_Intent?: string;
  Lead_Quality_Score?: number;
  Lead_Quality_Reasons?: string;
  Lead_Priority?: 'Hot' | 'Warm' | 'Cold';
  Website_Session_ID?: string;
  Chat_Message_Count?: number;
  [key: string]: unknown;
}

// LinkedIn_URL, Portfolio_URL, and Postgres_Application_ID were deliberately dropped here
// (2026-07-29 cleanup) — they don't exist as fields on the live Job_Application module (the
// 10-custom-field cap was hit before they could be created; see project memory), so Zoho was
// silently discarding them on every sync. Confirmed via a live GET on the module's field list
// before removing. Re-add only if the corresponding Zoho field is created first.
export interface ZohoJobApplicationPayload {
  Name: string; // Zoho's mandatory default primary field for every custom module
  Candidate_Name: string;
  Email: string;
  Phone: string;
  Job_Title: string;
  Job_ID: number;
  Experience: string;
  Notice_Period: string;
  Application_Source: string;
  Cover_Note: string;
  Resume_URL: string;
  Application_Status: string;
  [key: string]: unknown;
}
