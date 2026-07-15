import { eq, desc } from 'drizzle-orm';
import { db } from './db';
import { contacts } from './schema';
import type { LeadStatus } from './leadValidation';

export interface ContactEntry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service?: string;
  message: string;
  submittedAt: string;
  read: boolean;
  leadScore: number;
  leadStatus: LeadStatus;
}

type Row = typeof contacts.$inferSelect;

function toContact(row: Row): ContactEntry {
  return {
    id:          row.id,
    name:        row.name,
    email:       row.email,
    phone:       row.phone    ?? undefined,
    company:     row.company  ?? undefined,
    service:     row.service  ?? undefined,
    message:     row.message,
    submittedAt: row.submittedAt,
    read:        row.read,
    leadScore:   row.leadScore,
    leadStatus:  (row.leadStatus as LeadStatus) ?? 'valid',
  };
}

export async function readContacts(): Promise<ContactEntry[]> {
  const rows = await db.select().from(contacts).orderBy(desc(contacts.submittedAt));
  return rows.map(toContact);
}

export async function addContact(
  data: Omit<ContactEntry, 'id' | 'submittedAt' | 'read'>,
): Promise<ContactEntry> {
  const id = `c_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const [row] = await db.insert(contacts).values({
    id,
    name:        data.name,
    email:       data.email,
    phone:       data.phone    ?? null,
    company:     data.company  ?? null,
    service:     data.service  ?? null,
    message:     data.message,
    leadScore:   data.leadScore,
    leadStatus:  data.leadStatus,
  }).returning();
  return toContact(row);
}

export async function markContactRead(id: string): Promise<ContactEntry | null> {
  const [row] = await db.update(contacts).set({ read: true }).where(eq(contacts.id, id)).returning();
  return row ? toContact(row) : null;
}

export async function deleteContact(id: string): Promise<boolean> {
  const rows = await db.delete(contacts).where(eq(contacts.id, id)).returning({ id: contacts.id });
  return rows.length > 0;
}
