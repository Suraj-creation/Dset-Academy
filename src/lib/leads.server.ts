import { desc, sql } from 'drizzle-orm';
import { db } from './db';
import { leads } from './schema';
import type { Intent, LeadScore } from './widgetConfig';

export interface LeadData {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  intent: Intent;
  score: LeadScore;
  messages: number;
  createdAt: string;
  source: string;
  /** Every distinct topic/intent raised across the whole session (see src/pages/api/widget/chat.ts).
   *  In-memory only, computed fresh from the frontend's running conversation state — never
   *  persisted to Postgres (saveLead()/toLead() intentionally don't touch it) since its only
   *  purpose is building buildLeadSummary() at the moment a lead is captured/synced. */
  topics?: Intent[];
}

type Row = typeof leads.$inferSelect;

function toLead(row: Row): LeadData {
  return {
    id:        row.id,
    name:      row.name      ?? undefined,
    email:     row.email     ?? undefined,
    phone:     row.phone     ?? undefined,
    company:   row.company   ?? undefined,
    intent:    row.intent    as Intent,
    score:     row.score     as LeadScore,
    messages:  row.messages,
    createdAt: row.createdAt,
    source:    row.source,
  };
}

export async function readLeads(): Promise<LeadData[]> {
  const rows = await db.select().from(leads).orderBy(desc(leads.createdAt));
  return rows.map(toLead);
}

// Shared with src/pages/api/widget/chat.ts (internal notification email) and
// src/lib/zoho/mappers.ts (Zoho Lead Description) — one summary sentence, one place.
// Kept in sync with the actual `Intent` union in widgetConfig.ts (not the older
// support/careers categories, which extractIntent() never actually produces).
const INTENT_TOPICS: Record<string, string> = {
  services:            "DSeT's services",
  demo:                'scheduling a product demo',
  pricing:             'pricing and commercial terms',
  consulting:          'AI transformation consulting',
  contact:             'connecting with the DSeT team',
  product_orebill:     'OreBill AI™ (mining billing & dispatch)',
  product_edgebay:     'EdgeBay IntelliFence™ (OT/IoT data)',
  product_securecloud: 'SecureCloud™ (cloud security & compliance)',
  product_medicsiq:    'MedicsIQ™ (healthcare operations)',
  product_revops:      'iPaS-RevOps™ (revenue operations)',
  product_voiceops:    'VoiceOps (voice/call automation)',
  product_pharmaai:    'PharmaAI (pharma commercial intelligence)',
  general:             "DSeT's products and services",
  // 'confidential' deliberately has no entry — a probe for internal info is never a sales
  // topic and must never be surfaced as one in a CRM-facing summary.
};

// Topics that shouldn't stand alone as "what this lead is interested in" — "general" is a
// non-answer and "confidential" is an internal-info probe; neither belongs in a topics list.
const NON_TOPIC_INTENTS = new Set<string>(['general', 'confidential']);

/**
 * One-line summary of a chat lead for the internal notification email and the Zoho Lead
 * Description. Prefers `lead.topics` (every distinct topic raised across the session) so a
 * multi-topic conversation reads as "EdgeBay IntelliFence™, pricing and commercial terms"
 * rather than only whatever the single final `intent` happened to be; falls back to that
 * single intent when no topics list is available (e.g. an older/partial LeadData).
 */
export function buildLeadSummary(lead: LeadData): string {
  const distinctTopics = Array.from(new Set(lead.topics ?? [lead.intent]))
    .filter((t) => !NON_TOPIC_INTENTS.has(t))
    .map((t) => INTENT_TOPICS[t] ?? t);

  const topicPhrase = distinctTopics.length > 0
    ? distinctTopics.join(', ')
    : (INTENT_TOPICS[lead.intent] ?? lead.intent);

  const name  = lead.name ?? 'An anonymous visitor';
  const n     = lead.messages;
  const withContact = lead.email ? ' and shared their contact details' : '';
  return `${name} reached out via the website chat widget showing interest in ${topicPhrase}. They exchanged ${n} message${n !== 1 ? 's' : ''} with the DSeT Bot${withContact}.`;
}

export async function saveLead(lead: LeadData): Promise<void> {
  await db.insert(leads).values({
    id:        lead.id,
    name:      lead.name      ?? null,
    email:     lead.email     ?? null,
    phone:     lead.phone     ?? null,
    company:   lead.company   ?? null,
    intent:    lead.intent,
    score:     lead.score,
    messages:  lead.messages,
    createdAt: lead.createdAt,
    source:    lead.source,
  }).onConflictDoUpdate({
    target: leads.id,
    set: {
      name:     sql`excluded.name`,
      email:    sql`excluded.email`,
      phone:    sql`excluded.phone`,
      company:  sql`excluded.company`,
      intent:   sql`excluded.intent`,
      score:    sql`excluded.score`,
      messages: sql`excluded.messages`,
    },
  });
}
