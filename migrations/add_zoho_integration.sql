-- Migration: Zoho CRM integration foundation (Phase 1)
-- Additive only — no existing column is renamed, retyped, or dropped.
-- Run this ONCE against your Azure PostgreSQL database before deploying the updated code.
--
-- Connect via psql or Azure Query Editor, then run:
--   psql "postgresql://USER:PASS@HOST:5432/dset_db?sslmode=require" -f add_zoho_integration.sql

-- ── Sync-tracking columns on every source table that can push a record to Zoho ────────────
ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS zoho_record_id     TEXT,
  ADD COLUMN IF NOT EXISTS zoho_sync_status   TEXT    NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS zoho_synced_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS zoho_sync_attempts INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS zoho_sync_error    TEXT;

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS zoho_record_id     TEXT,
  ADD COLUMN IF NOT EXISTS zoho_sync_status   TEXT    NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS zoho_synced_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS zoho_sync_attempts INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS zoho_sync_error    TEXT;

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS zoho_module        TEXT,
  ADD COLUMN IF NOT EXISTS zoho_record_id     TEXT,
  ADD COLUMN IF NOT EXISTS zoho_sync_status   TEXT    NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS zoho_synced_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS zoho_sync_attempts INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS zoho_sync_error    TEXT;

ALTER TABLE whatsapp_conversations
  ADD COLUMN IF NOT EXISTS zoho_record_id     TEXT,
  ADD COLUMN IF NOT EXISTS zoho_sync_status   TEXT    NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS zoho_synced_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS zoho_sync_attempts INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS zoho_sync_error    TEXT;

-- whitepaper_leads also gets lead_score/lead_status — a pre-existing gap (whitepapers.server.ts
-- already computes these but the columns never existed here; see implementation plan §05).
ALTER TABLE whitepaper_leads
  ADD COLUMN IF NOT EXISTS lead_score         INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lead_status        TEXT    NOT NULL DEFAULT 'valid',
  ADD COLUMN IF NOT EXISTS zoho_record_id     TEXT,
  ADD COLUMN IF NOT EXISTS zoho_sync_status   TEXT    NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS zoho_synced_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS zoho_sync_attempts INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS zoho_sync_error    TEXT;

CREATE INDEX IF NOT EXISTS idx_contacts_zoho_sync_status             ON contacts               (zoho_sync_status);
CREATE INDEX IF NOT EXISTS idx_leads_zoho_sync_status                ON leads                  (zoho_sync_status);
CREATE INDEX IF NOT EXISTS idx_applications_zoho_sync_status         ON applications           (zoho_sync_status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_zoho_sync_status ON whatsapp_conversations (zoho_sync_status);
CREATE INDEX IF NOT EXISTS idx_whitepaper_leads_zoho_sync_status     ON whitepaper_leads       (zoho_sync_status);

-- ── New tables ──────────────────────────────────────────────────────────────────────────
-- Single-row store for the OAuth refresh token. The short-lived access token is NEVER
-- written here — it lives only in an in-memory cache in src/lib/zoho/auth.ts.
CREATE TABLE IF NOT EXISTS zoho_oauth_tokens (
  id                        TEXT PRIMARY KEY,
  refresh_token             TEXT NOT NULL,
  access_token_expires_at   TIMESTAMPTZ,
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Operational retry queue — one row per pending/in-flight/failed sync attempt.
CREATE TABLE IF NOT EXISTS zoho_sync_queue (
  id               TEXT PRIMARY KEY,
  source_table     TEXT NOT NULL,
  source_id        TEXT NOT NULL,
  zoho_module      TEXT NOT NULL,
  payload          JSONB NOT NULL DEFAULT '{}',
  status           TEXT NOT NULL DEFAULT 'pending',
  attempts         INTEGER NOT NULL DEFAULT 0,
  last_error       TEXT,
  next_attempt_at  TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_zoho_sync_queue_status_next_attempt
  ON zoho_sync_queue (status, next_attempt_at);

-- Idempotency/dedup backstop: only one PENDING or PROCESSING queue row may exist at a time
-- for a given source record. Application code (src/lib/zoho/queue.server.ts) checks for an
-- existing pending/processing row before inserting; this partial unique index is the
-- database-level safety net against a race producing two.
CREATE UNIQUE INDEX IF NOT EXISTS idx_zoho_sync_queue_source_unique_active
  ON zoho_sync_queue (source_table, source_id)
  WHERE status IN ('pending', 'processing');

-- Append-only audit trail of every sync attempt, success or failure.
CREATE TABLE IF NOT EXISTS zoho_sync_log (
  id                TEXT PRIMARY KEY,
  source_table      TEXT NOT NULL,
  source_id         TEXT NOT NULL,
  zoho_module       TEXT NOT NULL,
  request_payload   JSONB,
  response_status   INTEGER,
  response_body     JSONB,
  error             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_zoho_sync_log_source ON zoho_sync_log (source_table, source_id, created_at);
