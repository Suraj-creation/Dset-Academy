import { eq, desc } from 'drizzle-orm';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { db } from './db';
import { galleryEvents } from './schema';
import { deleteBlob } from './azure-blob';

export interface MediaItem { id: string; type: 'image' | 'video'; url: string; }

export interface GalleryEvent {
  id: string;
  title: string;
  date: string;
  description?: string;
  status: 'published' | 'draft';
  coverMediaId?: string;
  media: MediaItem[];
  isFeatured?: boolean;
}

type Row = typeof galleryEvents.$inferSelect;

function toEvent(row: Row): GalleryEvent {
  return {
    id:           row.id,
    title:        row.title,
    date:         row.date,
    description:  row.description  ?? undefined,
    status:       row.status as GalleryEvent['status'],
    coverMediaId: row.coverMediaId ?? undefined,
    media:        (row.media as MediaItem[]) ?? [],
    isFeatured:   row.isFeatured,
  };
}

export const getGalleryEvents = async (includeAll = false): Promise<GalleryEvent[]> => {
  const rows = includeAll
    ? await db.select().from(galleryEvents).orderBy(desc(galleryEvents.date))
    : await db.select().from(galleryEvents).where(eq(galleryEvents.status, 'published')).orderBy(desc(galleryEvents.date));
  return rows.map(toEvent);
};

export const getGalleryEventById = async (id: string): Promise<GalleryEvent | null> => {
  const [row] = await db.select().from(galleryEvents).where(eq(galleryEvents.id, id));
  return row ? toEvent(row) : null;
};

export const addGalleryEvent = async (eventData: Omit<GalleryEvent, 'id'>): Promise<GalleryEvent> => {
  const id = uuidv4();
  const [row] = await db.insert(galleryEvents).values({
    id,
    title:        eventData.title,
    date:         eventData.date,
    description:  eventData.description  ?? null,
    status:       eventData.status       ?? 'draft',
    coverMediaId: eventData.coverMediaId ?? null,
    media:        eventData.media        ?? [],
    isFeatured:   false,
  }).returning();
  return toEvent(row);
};

export const updateGalleryEvent = async (id: string, updates: Partial<GalleryEvent>): Promise<GalleryEvent | null> => {
  if (updates.isFeatured === true) return setFeaturedEvent(id);
  const set: Partial<typeof galleryEvents.$inferInsert> = {};
  if (updates.title        !== undefined) set.title        = updates.title;
  if (updates.date         !== undefined) set.date         = updates.date;
  if (updates.description  !== undefined) set.description  = updates.description;
  if (updates.status       !== undefined) set.status       = updates.status;
  if (updates.coverMediaId !== undefined) set.coverMediaId = updates.coverMediaId;
  if (Object.keys(set).length === 0) return getGalleryEventById(id);
  const [row] = await db.update(galleryEvents).set(set).where(eq(galleryEvents.id, id)).returning();
  return row ? toEvent(row) : null;
};

export const deleteGalleryEvent = async (id: string): Promise<boolean> => {
  const rows = await db.delete(galleryEvents).where(eq(galleryEvents.id, id)).returning({ id: galleryEvents.id });
  return rows.length > 0;
};

export const addMediaToEvent = async (eventId: string, media: Omit<MediaItem, 'id'>): Promise<GalleryEvent | null> => {
  const event = await getGalleryEventById(eventId);
  if (!event) return null;
  const newItem: MediaItem = { id: uuidv4(), ...media };
  const [row] = await db.update(galleryEvents)
    .set({ media: [...event.media, newItem] })
    .where(eq(galleryEvents.id, eventId))
    .returning();
  return row ? toEvent(row) : null;
};

export const removeMediaFromEvent = async (eventId: string, mediaId: string): Promise<GalleryEvent | null> => {
  const event = await getGalleryEventById(eventId);
  if (!event) return null;
  const item = event.media.find((m) => m.id === mediaId);
  if (item) {
    if (item.url.startsWith('https://')) {
      await deleteBlob(item.url);
    } else {
      try {
        const absPath = path.join(process.cwd(), 'public', item.url);
        if (fs.existsSync(absPath)) fs.unlinkSync(absPath);
      } catch {}
    }
  }
  const newMedia  = event.media.filter((m) => m.id !== mediaId);
  const newCover  = event.coverMediaId === mediaId ? null : (event.coverMediaId ?? null);
  const [row] = await db.update(galleryEvents)
    .set({ media: newMedia, coverMediaId: newCover })
    .where(eq(galleryEvents.id, eventId))
    .returning();
  return row ? toEvent(row) : null;
};

export const setCoverMedia = async (eventId: string, mediaId: string): Promise<GalleryEvent | null> => {
  const event = await getGalleryEventById(eventId);
  if (!event || !event.media.some((m) => m.id === mediaId)) return null;
  const [row] = await db.update(galleryEvents)
    .set({ coverMediaId: mediaId })
    .where(eq(galleryEvents.id, eventId))
    .returning();
  return row ? toEvent(row) : null;
};

export const reorderMediaInEvent = async (eventId: string, orderedIds: string[]): Promise<GalleryEvent | null> => {
  const event = await getGalleryEventById(eventId);
  if (!event) return null;
  const mediaMap = new Map(event.media.map((m) => [m.id, m]));
  const reordered = orderedIds.flatMap((id) => (mediaMap.has(id) ? [mediaMap.get(id)!] : []));
  const [row] = await db.update(galleryEvents)
    .set({ media: reordered })
    .where(eq(galleryEvents.id, eventId))
    .returning();
  return row ? toEvent(row) : null;
};

export const setFeaturedEvent = async (eventId: string): Promise<GalleryEvent | null> => {
  const existing = await getGalleryEventById(eventId);
  if (!existing) return null;
  await db.update(galleryEvents).set({ isFeatured: false }).where(eq(galleryEvents.isFeatured, true));
  const [row] = await db.update(galleryEvents)
    .set({ isFeatured: true })
    .where(eq(galleryEvents.id, eventId))
    .returning();
  return row ? toEvent(row) : null;
};
