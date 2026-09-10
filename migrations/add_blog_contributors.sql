-- Migration: Add blog post contributors column
-- Run this ONCE against your PostgreSQL database before deploying the updated code.
--
-- Connect via psql or Azure Query Editor, then run:
--   psql "postgresql://USER:PASS@HOST:5432/dset_db?sslmode=require" -f add_blog_contributors.sql
--
-- Contributors are additional people who supplied content/expertise for a post but aren't
-- the primary author (e.g. subject matter experts). Shown alongside the author, not instead
-- of it. Stored as a JSON array of plain name strings — no separate people/authors table yet.

ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS contributors JSONB NOT NULL DEFAULT '[]';
