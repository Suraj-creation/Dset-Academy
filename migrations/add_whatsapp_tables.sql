-- Migration: Add WhatsApp Cloud API conversation/message tables
-- Run this ONCE against your Azure PostgreSQL database before deploying the WhatsApp integration.
--
-- Connect via psql or Azure Query Editor, then run:
--   psql "postgresql://USER:PASS@HOST:5432/dset_db?sslmode=require" -f add_whatsapp_tables.sql

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
CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_status   ON whatsapp_conversations (status);
