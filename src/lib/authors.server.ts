import { eq, desc } from 'drizzle-orm';
import { db } from './db';
import { authors } from './schema';
import { Author } from './authors';
import { deleteBlob } from './azure-blob';

type Row = typeof authors.$inferSelect;

function toAuthor(row: Row): Author {
  return {
    id:          row.id,
    name:        row.name,
    designation: row.designation,
    bio:         row.bio,
    photoUrl:    row.photoUrl,
    linkedinUrl: row.linkedinUrl ?? null,
    isActive:    row.isActive,
  };
}

export async function getAllAuthorsServer(): Promise<Author[]> {
  const rows = await db.select().from(authors).orderBy(desc(authors.createdAt));
  return rows.map(toAuthor);
}

export async function getActiveAuthorsServer(): Promise<Author[]> {
  const all = await getAllAuthorsServer();
  return all.filter(a => a.isActive);
}

export async function createAuthorServer(author: Omit<Author, 'id'>): Promise<Author> {
  const id = Date.now().toString();
  const [row] = await db.insert(authors).values({
    id,
    name:         author.name,
    designation:  author.designation || '',
    bio:          author.bio || '',
    photoUrl:     author.photoUrl || '',
    linkedinUrl:  author.linkedinUrl || null,
    isActive:     author.isActive ?? true,
  }).returning();
  return toAuthor(row);
}

export async function updateAuthorServer(id: string, update: Partial<Author>): Promise<Author | null> {
  const set: Partial<typeof authors.$inferInsert> = {};
  if (update.name        !== undefined) set.name        = update.name;
  if (update.designation !== undefined) set.designation = update.designation;
  if (update.bio         !== undefined) set.bio         = update.bio;
  if (update.photoUrl    !== undefined) set.photoUrl    = update.photoUrl;
  if (update.linkedinUrl !== undefined) set.linkedinUrl = update.linkedinUrl;
  if (update.isActive    !== undefined) set.isActive    = update.isActive;
  if (Object.keys(set).length === 0) {
    const [row] = await db.select().from(authors).where(eq(authors.id, id));
    return row ? toAuthor(row) : null;
  }
  const [row] = await db.update(authors).set(set).where(eq(authors.id, id)).returning();
  return row ? toAuthor(row) : null;
}

export async function deleteAuthorServer(id: string): Promise<boolean> {
  const rows = await db.delete(authors).where(eq(authors.id, id)).returning({ photoUrl: authors.photoUrl });
  if (!rows[0]) return false;
  if (rows[0].photoUrl?.startsWith('https://')) {
    await deleteBlob(rows[0].photoUrl);
  }
  return true;
}
