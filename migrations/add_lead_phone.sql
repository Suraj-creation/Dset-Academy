-- Migration: Add optional phone column to the leads table (chat widget lead capture).
-- Additive only — matches the Contact form, which already has phone (contacts.phone).
--
--   psql "postgresql://USER:PASS@HOST:5432/dset_db?sslmode=require" -f add_lead_phone.sql

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS phone TEXT;
