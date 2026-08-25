import { eq, desc, sql } from 'drizzle-orm';
import { db } from './db';
import { whitepapers, whitepaperLeads } from './schema';
import { MOCK_WHITEPAPERS } from '@/data/whitepapers';
import type { LeadStatus } from './leadValidation';

type WpRow   = typeof whitepapers.$inferSelect;
type LeadRow = typeof whitepaperLeads.$inferSelect;

export interface WhitepaperRecord {
  id:            string;
  title:         string;
  description:   string;
  category:      string;
  thumbnailUrl:  string;
  pdfUrl:        string;
  isPublished:   boolean;
  downloadCount: number;
  pageCount:     number;
  readTime:      string;
  tags:          string[];
  createdAt:     string;
}

export interface WhitepaperLeadRecord {
  id:              string;
  whitepaperID:    string;
  whitepaperTitle: string;
  fullName:        string;
  email:           string;
  company:         string;
  country:         string;
  designation:     string;
  purpose:         string;
  createdAt:       string;
  leadScore:       number;
  leadStatus:      LeadStatus;
}

function toWp(row: WpRow): WhitepaperRecord {
  return {
    id:            row.id,
    title:         row.title,
    description:   row.description,
    category:      row.category,
    thumbnailUrl:  row.thumbnailUrl,
    pdfUrl:        row.pdfUrl,
    isPublished:   row.isPublished,
    downloadCount: row.downloadCount,
    pageCount:     row.pageCount,
    readTime:      row.readTime,
    tags:          row.tags,
    createdAt:     row.createdAt,
  };
}

function toLead(row: LeadRow): WhitepaperLeadRecord {
  return {
    id:              row.id,
    whitepaperID:    row.whitepaperID,
    whitepaperTitle: row.whitepaperTitle,
    fullName:        row.fullName,
    email:           row.email,
    company:         row.company,
    country:         row.country,
    designation:     row.designation,
    purpose:         row.purpose,
    createdAt:       row.createdAt,
    leadScore:       row.leadScore ?? 0,
    leadStatus:      ((row.leadStatus ?? 'valid') as LeadStatus),
  };
}

async function seedIfEmpty(): Promise<void> {
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(whitepapers);
  if (count === 0) {
    await db.insert(whitepapers).values(
      MOCK_WHITEPAPERS.map((w) => ({
        id:            w.id,
        title:         w.title,
        description:   w.description,
        category:      w.category,
        thumbnailUrl:  w.thumbnailUrl,
        pdfUrl:        w.pdfUrl,
        isPublished:   w.isPublished,
        downloadCount: w.downloadCount,
        pageCount:     w.pageCount,
        readTime:      w.readTime,
        tags:          w.tags,
      })),
    );
  }
}

export async function getAllWhitepapers(): Promise<WhitepaperRecord[]> {
  await seedIfEmpty();
  const rows = await db.select().from(whitepapers).orderBy(desc(whitepapers.createdAt));
  return rows.map(toWp);
}

export async function getPublishedWhitepapers(): Promise<WhitepaperRecord[]> {
  await seedIfEmpty();
  const rows = await db
    .select()
    .from(whitepapers)
    .where(eq(whitepapers.isPublished, true))
    .orderBy(desc(whitepapers.createdAt));
  return rows.map(toWp);
}

export async function getWhitepaperById(id: string): Promise<WhitepaperRecord | null> {
  const [row] = await db.select().from(whitepapers).where(eq(whitepapers.id, id));
  return row ? toWp(row) : null;
}

export async function createWhitepaper(
  data: Omit<WhitepaperRecord, 'downloadCount' | 'createdAt'>,
): Promise<WhitepaperRecord> {
  const id = `wp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const [row] = await db
    .insert(whitepapers)
    .values({ ...data, id, downloadCount: 0 })
    .returning();
  return toWp(row);
}

export async function updateWhitepaper(
  id: string,
  data: Partial<Omit<WhitepaperRecord, 'id' | 'createdAt' | 'downloadCount'>>,
): Promise<WhitepaperRecord | null> {
  const set: Partial<typeof whitepapers.$inferInsert> = {};
  if (data.title        !== undefined) set.title        = data.title;
  if (data.description  !== undefined) set.description  = data.description;
  if (data.category     !== undefined) set.category     = data.category;
  if (data.thumbnailUrl !== undefined) set.thumbnailUrl = data.thumbnailUrl;
  if (data.pdfUrl       !== undefined) set.pdfUrl       = data.pdfUrl;
  if (data.isPublished  !== undefined) set.isPublished  = data.isPublished;
  if (data.pageCount    !== undefined) set.pageCount    = data.pageCount;
  if (data.readTime     !== undefined) set.readTime     = data.readTime;
  if (data.tags         !== undefined) set.tags         = data.tags;
  if (Object.keys(set).length === 0) {
    const [row] = await db.select().from(whitepapers).where(eq(whitepapers.id, id));
    return row ? toWp(row) : null;
  }
  const [row] = await db.update(whitepapers).set(set).where(eq(whitepapers.id, id)).returning();
  return row ? toWp(row) : null;
}

export async function deleteWhitepaper(id: string): Promise<boolean> {
  const rows = await db.delete(whitepapers).where(eq(whitepapers.id, id)).returning({ id: whitepapers.id });
  return rows.length > 0;
}

export async function incrementDownloadCount(id: string): Promise<void> {
  await db
    .update(whitepapers)
    .set({ downloadCount: sql`${whitepapers.downloadCount} + 1` })
    .where(eq(whitepapers.id, id));
}

export async function getAllLeads(): Promise<WhitepaperLeadRecord[]> {
  const rows = await db.select().from(whitepaperLeads).orderBy(desc(whitepaperLeads.createdAt));
  return rows.map(toLead);
}

export async function createLead(
  data: Omit<WhitepaperLeadRecord, 'id' | 'createdAt'>,
): Promise<WhitepaperLeadRecord> {
  const id = `wl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const [row] = await db.insert(whitepaperLeads).values({ ...data, id }).returning();
  return toLead(row);
}

export async function deleteLead(id: string): Promise<boolean> {
  const rows = await db.delete(whitepaperLeads).where(eq(whitepaperLeads.id, id)).returning({ id: whitepaperLeads.id });
  return rows.length > 0;
}
