-- DSeT Academy — general interest signups (no payment involved).
-- These are for programmes with no published fee yet (institutional cohorts,
-- interest-list, custom cohorts, "coming next"). Kept in a separate table from
-- academy_registrations on purpose: that table's revenue/paid-status reporting
-- in /admin/academy-registrations would be corrupted by rows that were never
-- meant to carry a payment.
-- Additive only, safe to re-run.

CREATE TABLE IF NOT EXISTS academy_interest_registrations (
  id               text PRIMARY KEY,
  programme_title  text NOT NULL,
  full_name        text NOT NULL,
  email            text NOT NULL,
  mobile           text NOT NULL,
  role             text NOT NULL,
  institution      text,
  consent          boolean NOT NULL DEFAULT false,
  -- Lets the admin view track outreach without a separate CRM.
  contacted        boolean NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS academy_interest_registrations_created_at_idx
  ON academy_interest_registrations (created_at DESC);
