-- Migration: Add blog post approval workflow columns
-- Run this ONCE against your Azure PostgreSQL database before deploying the updated code.
--
-- Connect via psql or Azure Query Editor, then run:
--   psql "postgresql://USER:PASS@HOST:5432/dset_db?sslmode=require" -f add_blog_approval_workflow.sql
--
-- New status values used by the app (existing 'draft' | 'published' | 'scheduled' still work):
--   'pmo_review' | 'leadership_review' | 'ready_to_publish' | 'rejected_permanently'
-- "Refer back" at any review stage sends the post back to 'draft' with a comment so the
-- creator can revise it. "Reject permanently" sends it to 'rejected_permanently' instead —
-- it will never be published. No enum/CHECK constraint exists on status (plain TEXT column),
-- so no migration is needed to add new status string values going forward.

ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS submitted_by   TEXT,
  ADD COLUMN IF NOT EXISTS review_comment TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_by    TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_at    TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts (status);

-- Pre-existing gap fixed alongside this change: src/lib/linkedin.ts has always imported an
-- 'appSettings' table that was never actually created, so LinkedIn token storage/auto-post
-- has been silently broken. Creating it here so LinkedIn auto-post works again.
CREATE TABLE IF NOT EXISTS app_settings (
  key    TEXT PRIMARY KEY,
  value  TEXT NOT NULL
);
