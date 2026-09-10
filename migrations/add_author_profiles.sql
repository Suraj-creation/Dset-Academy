-- Migration: Add author profiles (bio, photo, designation, LinkedIn) + link blog_posts to them
-- Run this ONCE against your PostgreSQL database before deploying the updated code.
--
-- Connect via psql or Azure Query Editor, then run:
--   psql "postgresql://USER:PASS@HOST:5432/dset_db?sslmode=require" -f add_author_profiles.sql
--
-- Author profiles are maintained by a Publisher/Admin (see /admin/authors). Creators pick
-- from this list when writing a post rather than typing a free-text author name — this keeps
-- bios/photos consistent and stops anyone publishing under an identity that isn't set up here.
-- The existing free-text `author` column on blog_posts is kept for backward compatibility
-- with posts created before this feature existed; new posts should also set author_id.

CREATE TABLE IF NOT EXISTS authors (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  designation   TEXT NOT NULL DEFAULT '',
  bio           TEXT NOT NULL DEFAULT '',
  photo_url     TEXT NOT NULL DEFAULT '',
  linkedin_url  TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS author_id TEXT;
