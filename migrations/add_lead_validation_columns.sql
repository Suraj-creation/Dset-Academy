-- Migration: Add lead scoring and status columns
-- Run this ONCE against your Azure PostgreSQL database before deploying the updated code.
--
-- Connect via psql or Azure Query Editor, then run:
--   psql "postgresql://USER:PASS@HOST:5432/dset_db?sslmode=require" -f add_lead_validation_columns.sql

-- Add to contacts table
ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS lead_score  INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lead_status TEXT    NOT NULL DEFAULT 'valid';

-- Add to whitepaper_leads table
ALTER TABLE whitepaper_leads
  ADD COLUMN IF NOT EXISTS lead_score  INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lead_status TEXT    NOT NULL DEFAULT 'valid';

-- Optional: add an index for fast admin filtering by status
CREATE INDEX IF NOT EXISTS idx_contacts_lead_status        ON contacts         (lead_status);
CREATE INDEX IF NOT EXISTS idx_whitepaper_leads_lead_status ON whitepaper_leads (lead_status);
