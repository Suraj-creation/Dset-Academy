-- Migration: Add AI-generated content declaration to blog posts
-- Run this ONCE against your PostgreSQL database before deploying the updated code.
--
-- Connect via psql or Azure Query Editor, then run:
--   psql "postgresql://USER:PASS@HOST:5432/dset_db?sslmode=require" -f add_ai_generated_declaration.sql
--
-- This is a self-declaration by the Creator, not an automated detector — no plagiarism/AI
-- detection API is integrated (those are paid third-party services: Copyleaks, Originality.ai,
-- PlagiarismCheck.org, etc., none with a usable free tier for this). Values: 'no' | 'partially' | 'yes'.
-- Shown as a disclaimer badge on the published post whenever it isn't 'no'.

ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS ai_generated TEXT NOT NULL DEFAULT 'no';
