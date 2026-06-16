import { eq, desc, and, lte } from 'drizzle-orm';
import path from 'path';
import fs from 'fs/promises';
import { db } from './db';
import { blogPosts } from './schema';
import { BlogPost } from './blog';
import { deleteBlob } from './azure-blob';

type Row = typeof blogPosts.$inferSelect;

function toPost(row: Row): BlogPost {
  return {
    id:          row.id,
    title:       row.title,
    ...(row.subtitle        != null ? { subtitle: row.subtitle }               : {}),
    content:     row.content,
    imageUrl:    row.imageUrl,
    publishedAt: row.publishedAt,
    author:      row.author,
    status:      row.status as BlogPost['status'],
    tags:        (row.tags as BlogPost['tags']) ?? [],
    ...(row.metaDescription != null ? { metaDescription: row.metaDescription } : {}),
    slug:        row.slug,
  };
}

export async function getAllPostsServer(): Promise<BlogPost[]> {
  const rows = await db.select().from(blogPosts).orderBy(desc(blogPosts.publishedAt));
  return rows.map(toPost);
}

export async function getPublishedPostsServer(): Promise<BlogPost[]> {
  const rows = await db.select().from(blogPosts)
    .where(eq(blogPosts.status, 'published'))
    .orderBy(desc(blogPosts.publishedAt));
  return rows.map(toPost);
}

export async function getPostBySlugServer(slug: string): Promise<BlogPost | null> {
  const [row] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
  return row ? toPost(row) : null;
}

export async function createPostServer(post: Omit<BlogPost, 'id'>): Promise<BlogPost> {
  const id = Date.now().toString();
  try {
    const [row] = await db.insert(blogPosts).values({
      id,
      title:           post.title,
      subtitle:        post.subtitle || null,
      content:         post.content,
      imageUrl:        post.imageUrl || '',
      publishedAt:     post.publishedAt,
      author:          post.author,
      status:          post.status,
      tags:            post.tags ?? [],
      metaDescription: post.metaDescription || null,
      slug:            post.slug,
    }).returning();
    return toPost(row);
  } catch (err: any) {
    const cause = err?.cause ?? err;
    const code = cause?.code ?? err?.code;
    if (code === '23505') throw new Error('A post with this URL slug already exists. Change the slug and try again.');
    throw new Error(`DB insert failed: ${cause?.message ?? err?.message ?? String(err)} [code: ${code}]`);
  }
}

export async function updatePostServer(id: string, postUpdate: Partial<BlogPost>): Promise<BlogPost | null> {
  const set: Partial<typeof blogPosts.$inferInsert> = {};
  if (postUpdate.title           !== undefined) set.title           = postUpdate.title;
  if (postUpdate.subtitle        !== undefined) set.subtitle        = postUpdate.subtitle;
  if (postUpdate.content         !== undefined) set.content         = postUpdate.content;
  if (postUpdate.imageUrl        !== undefined) set.imageUrl        = postUpdate.imageUrl;
  if (postUpdate.publishedAt     !== undefined) set.publishedAt     = postUpdate.publishedAt;
  if (postUpdate.author          !== undefined) set.author          = postUpdate.author;
  if (postUpdate.status          !== undefined) set.status          = postUpdate.status;
  if (postUpdate.tags            !== undefined) set.tags            = postUpdate.tags;
  if (postUpdate.metaDescription !== undefined) set.metaDescription = postUpdate.metaDescription;
  if (postUpdate.slug            !== undefined) set.slug            = postUpdate.slug;
  if (Object.keys(set).length === 0) {
    const [row] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return row ? toPost(row) : null;
  }
  const [row] = await db.update(blogPosts).set(set).where(eq(blogPosts.id, id)).returning();
  return row ? toPost(row) : null;
}

export async function autoPublishDuePostsServer(): Promise<number> {
  const now = new Date().toISOString();
  const rows = await db
    .update(blogPosts)
    .set({ status: 'published' })
    .where(and(eq(blogPosts.status, 'scheduled'), lte(blogPosts.publishedAt, now)))
    .returning({ id: blogPosts.id });
  return rows.length;
}

export async function deletePostServer(id: string): Promise<string | null> {
  const rows = await db.delete(blogPosts).where(eq(blogPosts.id, id)).returning({ imageUrl: blogPosts.imageUrl, slug: blogPosts.slug });
  if (!rows[0]) return null;
  const { imageUrl, slug } = rows[0];
  if (imageUrl?.startsWith('https://')) {
    await deleteBlob(imageUrl);
  } else if (imageUrl?.startsWith('/uploads/') || imageUrl?.startsWith('/images/')) {
    const filePath = path.join(process.cwd(), 'public', imageUrl);
    try { await fs.unlink(filePath); } catch {}
  }
  return slug;
}
