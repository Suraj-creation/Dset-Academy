import { pgTable, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

export interface Tag { id: string; name: string; color: string; }
export interface MediaItem { id: string; type: 'image' | 'video'; url: string; }

// Shared sync-tracking columns added to every source table that can push a record to Zoho CRM.
// zohoSyncStatus: 'pending' | 'synced' | 'failed' | 'failed_permanent' | 'skipped'
const zohoSyncColumns = {
  zohoRecordId:     text('zoho_record_id'),
  zohoSyncStatus:   text('zoho_sync_status').notNull().default('pending'),
  zohoSyncedAt:     timestamp('zoho_synced_at', { withTimezone: true, mode: 'string' }),
  zohoSyncAttempts: integer('zoho_sync_attempts').notNull().default(0),
  zohoSyncError:    text('zoho_sync_error'),
};

export const contacts = pgTable('contacts', {
  id:          text('id').primaryKey(),
  name:        text('name').notNull(),
  email:       text('email').notNull(),
  phone:       text('phone'),
  company:     text('company'),
  service:     text('service'),
  message:     text('message').notNull(),
  submittedAt: timestamp('submitted_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  read:        boolean('read').notNull().default(false),
  leadScore:   integer('lead_score').notNull().default(0),
  leadStatus:  text('lead_status').notNull().default('valid'),
  ...zohoSyncColumns,
});

export const leads = pgTable('leads', {
  id:        text('id').primaryKey(),
  name:      text('name'),
  email:     text('email'),
  phone:     text('phone'),
  company:   text('company'),
  intent:    text('intent').notNull(),
  score:     text('score').notNull(),
  messages:  integer('messages').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  source:    text('source').notNull().default('chat-widget'),
  ...zohoSyncColumns,
});

export const applications = pgTable('applications', {
  id:           text('id').primaryKey(),
  jobId:        integer('job_id').notNull(),
  jobTitle:     text('job_title').notNull(),
  name:         text('name').notNull(),
  email:        text('email').notNull(),
  phone:        text('phone').notNull(),
  linkedin:     text('linkedin'),
  portfolio:    text('portfolio'),
  experience:   text('experience').notNull(),
  noticePeriod: text('notice_period').notNull(),
  source:       text('source').notNull(),
  coverNote:    text('cover_note').notNull(),
  resumeLink:   text('resume_link').notNull(),
  status:       text('status').notNull().default('new'),
  submittedAt:  timestamp('submitted_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  // Records which Zoho object this application synced to (Leads vs the Job Applications
  // custom module) in case that mapping decision changes later — see implementation plan §05.
  zohoModule:   text('zoho_module'),
  ...zohoSyncColumns,
});

export const jobs = pgTable('jobs', {
  id:          integer('id').primaryKey(),
  title:       text('title').notNull(),
  department:  text('department').notNull(),
  location:    text('location').notNull(),
  type:        text('type').notNull(),
  level:       text('level').notNull(),
  color:       text('color').notNull().default('#5e17ea'),
  description: text('description').notNull(),
  isActive:    boolean('is_active').notNull().default(true),
});

export const blogPosts = pgTable('blog_posts', {
  id:              text('id').primaryKey(),
  title:           text('title').notNull(),
  subtitle:        text('subtitle'),
  content:         text('content').notNull(),
  imageUrl:        text('image_url').notNull().default(''),
  publishedAt:     timestamp('published_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  author:          text('author').notNull().default('DSeT Team'),
  status:          text('status').notNull().default('draft'),
  tags:            jsonb('tags').$type<Tag[]>().notNull().default([]),
  metaDescription: text('meta_description'),
  slug:            text('slug').notNull().unique(),
});

export const galleryEvents = pgTable('gallery_events', {
  id:           text('id').primaryKey(),
  title:        text('title').notNull(),
  date:         text('date').notNull(),
  description:  text('description'),
  status:       text('status').notNull().default('draft'),
  coverMediaId: text('cover_media_id'),
  media:        jsonb('media').$type<MediaItem[]>().notNull().default([]),
  isFeatured:   boolean('is_featured').notNull().default(false),
});

export const whitepapers = pgTable('whitepapers', {
  id:            text('id').primaryKey(),
  title:         text('title').notNull(),
  description:   text('description').notNull(),
  category:      text('category').notNull(),
  thumbnailUrl:  text('thumbnail_url').notNull().default(''),
  pdfUrl:        text('pdf_url').notNull().default(''),
  isPublished:   boolean('is_published').notNull().default(false),
  downloadCount: integer('download_count').notNull().default(0),
  pageCount:     integer('page_count').notNull().default(0),
  readTime:      text('read_time').notNull().default(''),
  tags:          jsonb('tags').$type<string[]>().notNull().default([]),
  createdAt:     timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
});

export const whitepaperLeads = pgTable('whitepaper_leads', {
  id:              text('id').primaryKey(),
  whitepaperID:    text('whitepaper_id').notNull(),
  whitepaperTitle: text('whitepaper_title').notNull(),
  fullName:        text('full_name').notNull(),
  email:           text('email').notNull(),
  company:         text('company').notNull(),
  country:         text('country').notNull(),
  designation:     text('designation').notNull().default(''),
  purpose:         text('purpose').notNull(),
  createdAt:       timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  // Pre-existing gap fixed alongside the Zoho integration schema change (see implementation
  // plan §05): whitepapers.server.ts already computes these but the columns never existed.
  leadScore:       integer('lead_score').notNull().default(0),
  leadStatus:      text('lead_status').notNull().default('valid'),
  ...zohoSyncColumns,
});

// ── Zoho CRM integration ─────────────────────────────────────────────
// Single-row table holding the long-lived OAuth refresh token. The short-lived access token
// is never persisted here — it lives only in the in-memory cache in src/lib/zoho/auth.ts.
export const zohoOauthTokens = pgTable('zoho_oauth_tokens', {
  id:                   text('id').primaryKey(), // fixed to 'default' — single row
  refreshToken:         text('refresh_token').notNull(),
  accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true, mode: 'string' }), // informational only, not authoritative
  updatedAt:            timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
});

// Operational, mutable retry queue — one row per pending/in-flight/failed sync attempt.
export const zohoSyncQueue = pgTable('zoho_sync_queue', {
  id:            text('id').primaryKey(),
  sourceTable:   text('source_table').notNull(),   // e.g. 'contacts', 'leads', 'whitepaper_leads', 'applications', 'whatsapp_conversations'
  sourceId:      text('source_id').notNull(),      // primary key of the row in sourceTable
  zohoModule:    text('zoho_module').notNull(),    // 'Leads' — 'JobApplications' retired 2026-08, applications no longer sync to Zoho
  payload:       jsonb('payload').notNull().default({}), // pre-mapped Zoho-shaped record, computed at enqueue time
  status:        text('status').notNull().default('pending'), // 'pending' | 'processing' | 'synced' | 'failed' | 'failed_permanent'
  attempts:      integer('attempts').notNull().default(0),
  lastError:     text('last_error'),
  nextAttemptAt: timestamp('next_attempt_at', { withTimezone: true, mode: 'string' }),
  createdAt:     timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  updatedAt:     timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
});

// Append-only audit trail of every sync attempt, success or failure. Never updated after insert.
export const zohoSyncLog = pgTable('zoho_sync_log', {
  id:              text('id').primaryKey(),
  sourceTable:     text('source_table').notNull(),
  sourceId:        text('source_id').notNull(),
  zohoModule:      text('zoho_module').notNull(),
  requestPayload:  jsonb('request_payload'),
  responseStatus:  integer('response_status'),
  responseBody:    jsonb('response_body'),
  error:           text('error'),
  createdAt:       timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
});
