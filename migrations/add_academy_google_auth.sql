-- DSeT Academy — Google sign-in visitors and brochure view/download tracking.
-- Named academy_* on purpose: this Neon database is shared with the Life Sciences
-- (SLSSDTR) app, which owns the unprefixed `user` / `account` / `session` tables.
-- Apply with raw SQL, never `drizzle-kit push` — push diffs against src/lib/schema.ts
-- and would try to DROP every Life Sciences table it does not know about.
-- Additive only, safe to re-run.

CREATE TABLE IF NOT EXISTS academy_users (
  id              text PRIMARY KEY,
  -- Google's stable account id (`sub`). Email can change; sub never does.
  google_sub      text NOT NULL UNIQUE,
  email           text NOT NULL,
  email_verified  boolean NOT NULL DEFAULT false,
  full_name       text,
  given_name      text,
  family_name     text,
  picture_url     text,
  locale          text,
  -- Google Workspace domain (e.g. an institution's domain); null for personal Gmail.
  hosted_domain   text,
  login_count     integer NOT NULL DEFAULT 1,
  first_seen_at   timestamptz NOT NULL DEFAULT now(),
  last_seen_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS academy_users_email_idx ON academy_users (email);

-- Append-only. One row per brochure opened in the viewer or downloaded.
CREATE TABLE IF NOT EXISTS academy_brochure_events (
  id               text PRIMARY KEY,
  user_id          text NOT NULL REFERENCES academy_users(id),
  programme_slug   text NOT NULL,
  programme_title  text NOT NULL,
  action           text NOT NULL CHECK (action IN ('view', 'download')),
  ip               text,
  user_agent       text,
  referrer         text,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS academy_brochure_events_user_idx
  ON academy_brochure_events (user_id);
CREATE INDEX IF NOT EXISTS academy_brochure_events_programme_idx
  ON academy_brochure_events (programme_slug, created_at DESC);
