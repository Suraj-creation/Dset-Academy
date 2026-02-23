# 07 — Database Guide

This document covers the current data storage approach, its limitations, and step-by-step instructions for connecting a real database. No experience with databases required — this guide starts from scratch.

---

## Current State: File-Based Storage

Right now, the project stores data in two JSON files inside `src/data/`:

| File | What it stores | Who reads it | Who writes it |
|---|---|---|---|
| `assessment.json` | The 60 questions | Frontend page | No one (static, only humans edit it) |
| `posts.json` | All blog posts | `blog.server.ts` | `blog.server.ts` (via admin UI) |

Additionally, leads captured from the assessment are stored in:
- `global.leadStore[]` — in-memory array (gone on restart)
- A JSONL file if `LEADS_FILE_PATH` env var is set

---

## Why File-Based Works Right Now

For a new consulting firm's website with low traffic, files are fine:
- Zero infrastructure cost
- No setup required
- No database credentials to manage
- Blog posts update infrequently (once a week maybe)
- Lead volume is low (tens, not thousands)

---

## When File-Based Starts Breaking

You'll need a real database when:

- **Multiple server instances** — Vercel/AWS scales your app to 2+ instances. Each has its own filesystem. Post created on Instance A doesn't appear for users hitting Instance B.
- **Concurrent writes** — Two admins saving a post at the same time? The second write overwrites the first. No locking, no transactions.
- **Large lead volume** — Thousands of leads in a JSONL file becomes hard to query and analyze.
- **Search & filtering** — "Show me all posts tagged 'AI' from last month" is impossible with JSON files without loading everything into memory.
- **Data relationships** — If you add user accounts, comments, categories — JSON files become a mess.

---

## Understanding the Current Blog Data Layer

Before migrating, understand this file:

```
src/lib/blog.server.ts
```

It has 5 functions:

```ts
getAllPostsServer()       // reads posts.json → returns BlogPost[]
getPublishedPostsServer() // getAllPostsServer() → filter + sort
getPostBySlugServer(slug) // getAllPostsServer() → find by slug
createPostServer(post)   // read → push → writeFile (full rewrite)
updatePostServer(id, data) // read → find & merge → writeFile
deletePostServer(id)     // read → filter → writeFile
```

**The migration strategy:** Replace just these 5 functions with database equivalents. Everything else stays the same. The API routes and admin UI don't need to change.

---

## Option A: PostgreSQL with Prisma (Recommended for Production)

PostgreSQL is the most popular relational database for production Next.js apps. Prisma is an ORM (Object-Relational Mapper) that makes working with PostgreSQL feel like working with TypeScript objects.

### Step 1 — Install PostgreSQL Locally

**macOS:**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Ubuntu/Linux:**
```bash
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Windows:**
Download the installer from [postgresql.org](https://www.postgresql.org/download/windows/).

### Step 2 — Create a Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Inside psql:
CREATE DATABASE dset_db;
CREATE USER dset_user WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE dset_db TO dset_user;
\q
```

### Step 3 — Install Prisma

```bash
npm install prisma @prisma/client
npx prisma init
```

This creates:
- `prisma/schema.prisma` — where you define your data models
- `.env` — adds `DATABASE_URL` placeholder

### Step 4 — Define the Schema

Open `prisma/schema.prisma` and replace its contents:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model BlogPost {
  id              String    @id @default(cuid())
  title           String
  subtitle        String?
  content         String
  imageUrl        String
  publishedAt     DateTime
  author          String
  status          String    @default("draft")  // "draft" or "published"
  slug            String    @unique
  metaDescription String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  tags            Tag[]
}

model Tag {
  id      String     @id @default(cuid())
  name    String
  color   String
  posts   BlogPost[]
}

model Lead {
  id        String   @id @default(cuid())
  name      String
  email     String
  phone     String
  company   String?
  source    String   @default("digital-assessment")
  ip        String?
  metadata  Json?
  createdAt DateTime @default(now())
}
```

### Step 5 — Set the Database URL

In `.env.local`:
```env
DATABASE_URL="postgresql://dset_user:your-password@localhost:5432/dset_db"
```

The format is: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`

### Step 6 — Run the Migration

```bash
npx prisma migrate dev --name init
```

This:
1. Reads your schema
2. Generates SQL to create the tables
3. Runs the SQL against your database
4. Saves the migration file to `prisma/migrations/`

To check it worked:
```bash
npx prisma studio
# Opens a browser UI at localhost:5555 to browse your database
```

### Step 7 — Set Up the Prisma Client

Create `src/lib/prisma.ts`:

```ts
import { PrismaClient } from '@prisma/client';

// Prevent multiple instances in development (Next.js hot reload)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

### Step 8 — Replace `blog.server.ts`

Now replace all the file I/O with Prisma queries:

```ts
// src/lib/blog.server.ts (database version)
import { prisma } from './prisma';
import { BlogPost } from './blog';  // Keep the interface

export async function getAllPostsServer(): Promise<BlogPost[]> {
  const posts = await prisma.blogPost.findMany({
    include: { tags: true },
    orderBy: { publishedAt: 'desc' },
  });
  return posts as unknown as BlogPost[];
}

export async function getPublishedPostsServer(): Promise<BlogPost[]> {
  const posts = await prisma.blogPost.findMany({
    where: { status: 'published' },
    include: { tags: true },
    orderBy: { publishedAt: 'desc' },
  });
  return posts as unknown as BlogPost[];
}

export async function getPostBySlugServer(slug: string): Promise<BlogPost | null> {
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: { tags: true },
  });
  return post as unknown as BlogPost | null;
}

export async function createPostServer(post: Omit<BlogPost, 'id'>): Promise<BlogPost> {
  const { tags, ...postData } = post as any;
  const newPost = await prisma.blogPost.create({
    data: {
      ...postData,
      publishedAt: new Date(postData.publishedAt),
      tags: {
        connectOrCreate: (tags || []).map((tag: any) => ({
          where: { id: tag.id },
          create: { name: tag.name, color: tag.color },
        })),
      },
    },
    include: { tags: true },
  });
  return newPost as unknown as BlogPost;
}

export async function updatePostServer(id: string, data: Partial<BlogPost>): Promise<BlogPost | null> {
  try {
    const updated = await prisma.blogPost.update({
      where: { id },
      data: {
        ...data,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
      },
      include: { tags: true },
    });
    return updated as unknown as BlogPost;
  } catch {
    return null;
  }
}

export async function deletePostServer(id: string): Promise<boolean> {
  try {
    await prisma.blogPost.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
```

### Step 9 — Migrate Existing Posts

If you have posts in `posts.json`, migrate them to the database:

```ts
// Run this script once: npx ts-node scripts/migrate-posts.ts
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();
const posts = JSON.parse(fs.readFileSync('src/data/posts.json', 'utf-8')).posts;

async function main() {
  for (const post of posts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        title: post.title,
        subtitle: post.subtitle,
        content: post.content,
        imageUrl: post.imageUrl,
        publishedAt: new Date(post.publishedAt),
        author: post.author,
        status: post.status,
        slug: post.slug,
        metaDescription: post.metaDescription,
      },
    });
  }
  console.log(`Migrated ${posts.length} posts`);
}

main().finally(() => prisma.$disconnect());
```

### Step 10 — Update Lead Storage

In `src/pages/api/leads.ts`, add database storage alongside (or replacing) file storage:

```ts
import { prisma } from '@/lib/prisma';

// Inside the handler, after validation:
const lead = await prisma.lead.create({
  data: {
    name: parsed.name,
    email: parsed.email,
    phone: parsed.phone,
    company: parsed.company,
    source: parsed.source || 'digital-assessment',
    ip: clientIp,
    metadata: parsed.metadata as any,
  },
});

return res.status(200).json({ success: true, id: lead.id });
```

---

## Option B: MongoDB with Mongoose

MongoDB stores data as flexible JSON-like documents. Good if you want schema flexibility.

### Step 1 — Get MongoDB

**Local:** [Download MongoDB Community](https://www.mongodb.com/try/download/community)

**Cloud (easier):** Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas) — no local installation needed.

### Step 2 — Install Mongoose

```bash
npm install mongoose
npm install -D @types/mongoose
```

### Step 3 — Create Connection

```ts
// src/lib/mongodb.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined in environment variables');
}

// Prevent re-connecting on every hot reload in dev
let cached = (global as any).mongoose;
if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
```

### Step 4 — Define Schemas

```ts
// src/models/BlogPost.ts
import mongoose, { Schema } from 'mongoose';

const TagSchema = new Schema({
  name: String,
  color: String,
});

const BlogPostSchema = new Schema({
  title: { type: String, required: true },
  subtitle: String,
  content: { type: String, required: true },
  imageUrl: String,
  publishedAt: { type: Date, required: true },
  author: { type: String, required: true },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  slug: { type: String, required: true, unique: true },
  metaDescription: String,
  tags: [TagSchema],
}, { timestamps: true });

export const BlogPostModel = mongoose.models.BlogPost || mongoose.model('BlogPost', BlogPostSchema);
```

### Step 5 — Set the Connection String

For MongoDB Atlas, the URI looks like:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dset_db?retryWrites=true&w=majority
```

For local MongoDB:
```env
MONGODB_URI=mongodb://localhost:27017/dset_db
```

### Step 6 — Replace `blog.server.ts`

```ts
// src/lib/blog.server.ts (MongoDB version)
import { connectToDatabase } from './mongodb';
import { BlogPostModel } from '../models/BlogPost';
import { BlogPost } from './blog';

export async function getAllPostsServer(): Promise<BlogPost[]> {
  await connectToDatabase();
  const posts = await BlogPostModel.find().sort({ publishedAt: -1 }).lean();
  return posts.map(p => ({ ...p, id: p._id.toString() })) as unknown as BlogPost[];
}

export async function getPublishedPostsServer(): Promise<BlogPost[]> {
  await connectToDatabase();
  const posts = await BlogPostModel.find({ status: 'published' }).sort({ publishedAt: -1 }).lean();
  return posts.map(p => ({ ...p, id: p._id.toString() })) as unknown as BlogPost[];
}

export async function getPostBySlugServer(slug: string): Promise<BlogPost | null> {
  await connectToDatabase();
  const post = await BlogPostModel.findOne({ slug }).lean();
  if (!post) return null;
  return { ...post, id: post._id.toString() } as unknown as BlogPost;
}

export async function createPostServer(post: Omit<BlogPost, 'id'>): Promise<BlogPost> {
  await connectToDatabase();
  const newPost = await BlogPostModel.create(post);
  return { ...newPost.toObject(), id: newPost._id.toString() } as unknown as BlogPost;
}

export async function updatePostServer(id: string, data: Partial<BlogPost>): Promise<BlogPost | null> {
  await connectToDatabase();
  const updated = await BlogPostModel.findByIdAndUpdate(id, data, { new: true }).lean();
  if (!updated) return null;
  return { ...updated, id: updated._id.toString() } as unknown as BlogPost;
}

export async function deletePostServer(id: string): Promise<boolean> {
  await connectToDatabase();
  const result = await BlogPostModel.findByIdAndDelete(id);
  return result !== null;
}
```

---

## Option C: SQLite with Prisma (Easiest for Local Dev)

SQLite is a file-based SQL database. No server, no installation — just a `.db` file. Perfect for development and small deployments.

### Steps:

```bash
npm install prisma @prisma/client
npx prisma init --datasource-provider sqlite
```

In `prisma/schema.prisma`, the datasource is:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

In `.env.local`:
```env
DATABASE_URL="file:./dev.db"
```

The rest is identical to the PostgreSQL steps (Step 4 onwards). SQLite uses the same Prisma schema syntax.

To switch to PostgreSQL later, you just change `provider = "sqlite"` to `provider = "postgresql"` and update `DATABASE_URL`. All your queries stay the same.

---

## Comparison

| | JSON Files | SQLite | PostgreSQL | MongoDB |
|---|---|---|---|---|
| Setup effort | None | Minimal | Moderate | Moderate |
| Local development | Easy | Easy | Medium | Easy (Atlas) |
| Multiple servers | ❌ Breaks | ❌ Breaks | ✅ Works | ✅ Works |
| Concurrent writes | ❌ Race conditions | ✅ Transactions | ✅ Transactions | ✅ Operations |
| Querying/filtering | ❌ Manual | ✅ SQL | ✅ SQL | ✅ Queries |
| Hosting cost | Free | Free | ~$7-20/month | Free tier (Atlas) |
| **Best for** | Early dev | Solo projects | Production | Flexible schemas |

**Recommendation for DSeT:**
- Right now → Keep JSON files (already working, zero cost)
- Next milestone → SQLite with Prisma (easy upgrade, same code)
- When traffic grows → Migrate to PostgreSQL (change one line in schema.prisma + update DATABASE_URL)

---

## Environment Variables Summary

```env
# PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/dset_db"

# MongoDB (Atlas)
DATABASE_URL="mongodb+srv://user:password@cluster.mongodb.net/dset_db"

# SQLite (relative to project root)
DATABASE_URL="file:./dev.db"
```

---

## Quick Checklist for Database Migration

- [ ] Install Prisma: `npm install prisma @prisma/client`
- [ ] Run `npx prisma init`
- [ ] Add your models to `prisma/schema.prisma`
- [ ] Set `DATABASE_URL` in `.env.local`
- [ ] Run `npx prisma migrate dev --name init`
- [ ] Create `src/lib/prisma.ts` with the global client
- [ ] Replace functions in `src/lib/blog.server.ts`
- [ ] Update `src/pages/api/leads.ts` to save to database
- [ ] Run the migration script for existing posts
- [ ] Test: create a post in admin, see it on `/blog`
- [ ] Run `npx prisma studio` to verify data looks correct

---

## Useful Prisma Commands

```bash
npx prisma migrate dev       # Apply schema changes, generate migration
npx prisma migrate reset     # Drop all tables, re-run all migrations (WIPES DATA)
npx prisma studio            # Visual browser for your database
npx prisma generate          # Re-generate the TypeScript client (run after schema changes)
npx prisma db push           # Push schema changes without creating a migration file (for prototyping)
```
