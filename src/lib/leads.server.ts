import { desc, sql } from 'drizzle-orm';
import { db } from './db';
import { leads } from './schema';
import type { Intent, LeadScore } from './widgetConfig';

export interface LeadData {
  id: string;
  name?: string;
  email?: string;
  company?: string;
  intent: Intent;
  score: LeadScore;
  messages: number;
  createdAt: string;
  source: string;
}

type Row = typeof leads.$inferSelect;

function toLead(row: Row): LeadData {
  return {
    id:        row.id,
    name:      row.name      ?? undefined,
    email:     row.email     ?? undefined,
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

export async function saveLead(lead: LeadData): Promise<void> {
  await db.insert(leads).values({
    id:        lead.id,
    name:      lead.name      ?? null,
    email:     lead.email     ?? null,
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
      company:  sql`excluded.company`,
      intent:   sql`excluded.intent`,
      score:    sql`excluded.score`,
      messages: sql`excluded.messages`,
    },
  });
}
