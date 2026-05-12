-- DSeT Website — PostgreSQL Schema
-- Run this entire file in pgAdmin → Query Tool (on the dset_db database)

CREATE TABLE IF NOT EXISTS contacts (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT,
  company       TEXT,
  service       TEXT,
  message       TEXT NOT NULL,
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  read          BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS leads (
  id          TEXT PRIMARY KEY,
  name        TEXT,
  email       TEXT,
  company     TEXT,
  intent      TEXT NOT NULL,
  score       TEXT NOT NULL,
  messages    INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  source      TEXT NOT NULL DEFAULT 'chat-widget'
);

CREATE TABLE IF NOT EXISTS applications (
  id             TEXT PRIMARY KEY,
  job_id         INTEGER NOT NULL,
  job_title      TEXT NOT NULL,
  name           TEXT NOT NULL,
  email          TEXT NOT NULL,
  phone          TEXT NOT NULL,
  linkedin       TEXT,
  portfolio      TEXT,
  experience     TEXT NOT NULL,
  notice_period  TEXT NOT NULL,
  source         TEXT NOT NULL,
  cover_note     TEXT NOT NULL,
  resume_link    TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'new',
  submitted_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS jobs (
  id           INTEGER PRIMARY KEY,
  title        TEXT NOT NULL,
  department   TEXT NOT NULL,
  location     TEXT NOT NULL,
  type         TEXT NOT NULL,
  level        TEXT NOT NULL,
  color        TEXT NOT NULL DEFAULT '#5e17ea',
  description  TEXT NOT NULL,
  is_active    BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id                TEXT PRIMARY KEY,
  title             TEXT NOT NULL,
  subtitle          TEXT,
  content           TEXT NOT NULL,
  image_url         TEXT NOT NULL DEFAULT '',
  published_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  author            TEXT NOT NULL DEFAULT 'DSeT Team',
  status            TEXT NOT NULL DEFAULT 'draft',
  tags              JSONB NOT NULL DEFAULT '[]',
  meta_description  TEXT,
  slug              TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS gallery_events (
  id              TEXT PRIMARY KEY,
  title           TEXT NOT NULL,
  date            TEXT NOT NULL,
  description     TEXT,
  status          TEXT NOT NULL DEFAULT 'draft',
  cover_media_id  TEXT,
  media           JSONB NOT NULL DEFAULT '[]',
  is_featured     BOOLEAN NOT NULL DEFAULT false
);
