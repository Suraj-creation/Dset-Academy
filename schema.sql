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

-- status: 'draft' | 'pmo_review' | 'leadership_review' | 'ready_to_publish' | 'published' | 'scheduled' | 'rejected_permanently'
-- "Refer back" at any review stage sends the post back to 'draft' with a comment so the
-- creator can revise it. "Reject permanently" sends it to 'rejected_permanently' instead —
-- a dead end; it will never be published.
CREATE TABLE IF NOT EXISTS blog_posts (
  id                TEXT PRIMARY KEY,
  title             TEXT NOT NULL,
  subtitle          TEXT,
  content           TEXT NOT NULL,
  image_url         TEXT NOT NULL DEFAULT '',
  published_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  author            TEXT NOT NULL DEFAULT 'DSeT Team',
  author_id         TEXT,
  contributors      JSONB NOT NULL DEFAULT '[]',
  ai_generated      TEXT NOT NULL DEFAULT 'no',
  status            TEXT NOT NULL DEFAULT 'draft',
  tags              JSONB NOT NULL DEFAULT '[]',
  meta_description  TEXT,
  slug              TEXT NOT NULL UNIQUE,
  submitted_by      TEXT,
  review_comment    TEXT,
  reviewed_by       TEXT,
  reviewed_at       TIMESTAMPTZ
);

-- A curated author profile a Publisher/Admin maintains — Creators pick from this list when
-- writing a post rather than typing a free-text author name, keeping bios/photos consistent
-- and preventing anyone from publishing under an author identity that isn't set up here.
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

-- Generic single-row-per-key settings store. Currently used to persist the LinkedIn OAuth
-- access token. Pre-existing gap: linkedin.ts imported this table before it was ever defined.
CREATE TABLE IF NOT EXISTS app_settings (
  key    TEXT PRIMARY KEY,
  value  TEXT NOT NULL
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

CREATE TABLE IF NOT EXISTS whatsapp_conversations (
  id                     TEXT PRIMARY KEY,
  customer_name          TEXT,
  status                 TEXT NOT NULL DEFAULT 'bot',
  last_inbound_at        TIMESTAMPTZ,
  last_outbound_at       TIMESTAMPTZ,
  handover_requested_at  TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id               TEXT PRIMARY KEY,
  conversation_id  TEXT NOT NULL REFERENCES whatsapp_conversations(id),
  direction        TEXT NOT NULL,
  message_type     TEXT NOT NULL DEFAULT 'text',
  content          TEXT NOT NULL DEFAULT '',
  media_url        TEXT,
  status           TEXT NOT NULL DEFAULT 'received',
  ai_handled       BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_conversation ON whatsapp_messages (conversation_id, created_at);
