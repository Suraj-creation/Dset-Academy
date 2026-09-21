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

// status: 'draft' | 'pmo_review' | 'leadership_review' | 'ready_to_publish' | 'published' | 'scheduled' | 'rejected_permanently'
// A "refer back" at any review stage sends the post back to 'draft' with a comment so the
// creator can revise it. A "reject permanently" sends it to 'rejected_permanently' instead —
// a dead end; it will never be published (see blog.server.ts reviewPostServer).
export const blogPosts = pgTable('blog_posts', {
  id:              text('id').primaryKey(),
  title:           text('title').notNull(),
  subtitle:        text('subtitle'),
  content:         text('content').notNull(),
  imageUrl:        text('image_url').notNull().default(''),
  publishedAt:     timestamp('published_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  // Free-text fallback (kept for backward compatibility with posts created before author
  // profiles existed). New posts should also set authorId so bio/photo/designation show.
  author:          text('author').notNull().default('DSeT Team'),
  authorId:        text('author_id'),
  // Additional people who contributed to the post but aren't the primary author (e.g. subject
  // matter experts who supplied the content). Shown alongside the author, not in place of it.
  contributors:    jsonb('contributors').$type<string[]>().notNull().default([]),
  // Self-declared by the Creator — no automatic AI/plagiarism detection is run (that would
  // require a paid third-party API). 'no' | 'partially' | 'yes'. Shown as a disclaimer badge
  // on the published post when not 'no'.
  aiGenerated:     text('ai_generated').notNull().default('no'),
  status:          text('status').notNull().default('draft'),
  tags:            jsonb('tags').$type<Tag[]>().notNull().default([]),
  metaDescription: text('meta_description'),
  slug:            text('slug').notNull().unique(),
  // Approval workflow (additive — existing posts default to nulls and keep working unchanged)
  submittedBy:     text('submitted_by'),
  reviewComment:   text('review_comment'),
  reviewedBy:      text('reviewed_by'),
  reviewedAt:      timestamp('reviewed_at', { withTimezone: true, mode: 'string' }),
});

// A curated author profile a Publisher/Admin maintains — Creators pick from this list when
// writing a post rather than typing a free-text author name, keeping bios/photos consistent
// and preventing anyone from publishing under an author identity that isn't set up here.
export const authors = pgTable('authors', {
  id:           text('id').primaryKey(),
  name:         text('name').notNull(),
  designation:  text('designation').notNull().default(''),
  bio:          text('bio').notNull().default(''),
  photoUrl:     text('photo_url').notNull().default(''),
  linkedinUrl:  text('linkedin_url'),
  isActive:     boolean('is_active').notNull().default(true),
  createdAt:    timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
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

export const whatsappConversations = pgTable('whatsapp_conversations', {
  id:                  text('id').primaryKey(), // wa_id (customer phone, digits only, e.g. 9198xxxxxxxx)
  customerName:        text('customer_name'),
  status:              text('status').notNull().default('bot'), // 'bot' | 'human' | 'closed'
  lastInboundAt:       timestamp('last_inbound_at', { withTimezone: true, mode: 'string' }),
  lastOutboundAt:      timestamp('last_outbound_at', { withTimezone: true, mode: 'string' }),
  handoverRequestedAt: timestamp('handover_requested_at', { withTimezone: true, mode: 'string' }),
  createdAt:           timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  ...zohoSyncColumns,
});

export const whatsappMessages = pgTable('whatsapp_messages', {
  id:             text('id').primaryKey(), // Meta wamid, or generated uuid for outbound-before-ack
  conversationId: text('conversation_id').notNull(),
  direction:      text('direction').notNull(), // 'inbound' | 'outbound'
  messageType:    text('message_type').notNull().default('text'),
  content:        text('content').notNull().default(''),
  mediaUrl:       text('media_url'),
  status:         text('status').notNull().default('received'), // 'received' | 'sent' | 'delivered' | 'read' | 'failed'
  aiHandled:      boolean('ai_handled').notNull().default(false),
  createdAt:      timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
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

// Generic single-row-per-key settings store. Currently used to persist the LinkedIn OAuth
// access token (see src/lib/linkedin.ts). Pre-existing gap fixed alongside the blog approval
// workflow change: this table was imported by linkedin.ts but never actually defined here.
export const appSettings = pgTable('app_settings', {
  key:   text('key').primaryKey(),
  value: text('value').notNull(),
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

// DSeT Academy cohort enrolment. Every amount column is an integer in PAISE
// (₹1 = 100 paise) — Razorpay's API is denominated in paise, so storing paise
// keeps the DB, the charge and the reconciliation report on one unit with no
// float rounding anywhere. programmeTitle and the amounts are snapshotted at
// registration time so a later price change never rewrites a past enrolment.
export const academyRegistrations = pgTable('academy_registrations', {
  id:                text('id').primaryKey(),
  programmeSlug:     text('programme_slug').notNull(),
  programmeTitle:    text('programme_title').notNull(),
  fullName:          text('full_name').notNull(),
  email:             text('email').notNull(),
  mobile:            text('mobile').notNull(),
  role:              text('role').notNull(),
  institution:       text('institution'),
  consent:           boolean('consent').notNull().default(false),
  baseAmount:        integer('base_amount').notNull(),
  gstAmount:         integer('gst_amount').notNull(),
  totalAmount:       integer('total_amount').notNull(),
  currency:          text('currency').notNull().default('INR'),
  razorpayOrderId:   text('razorpay_order_id').unique(),
  razorpayPaymentId: text('razorpay_payment_id'),
  razorpaySignature: text('razorpay_signature'),
  // 'created' | 'paid' | 'failed' | 'refunded'
  paymentStatus:     text('payment_status').notNull().default('created'),
  // 'pending' | 'confirmed' | 'cancelled' — only ever 'confirmed' after a verified payment
  enrollmentStatus:  text('enrollment_status').notNull().default('pending'),
  failureReason:     text('failure_reason'),
  paidAt:            timestamp('paid_at', { withTimezone: true, mode: 'string' }),
  createdAt:         timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  updatedAt:         timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  // Fetched from the Razorpay Payments API after the signature check — proof the
  // payment was really captured, plus what it cost to collect.
  paymentMethod:     text('payment_method'),
  amountCaptured:    integer('amount_captured'),
  razorpayFee:       integer('razorpay_fee'),
  razorpayTax:       integer('razorpay_tax'),
  payerEmail:        text('payer_email'),
  payerContact:      text('payer_contact'),
  amountMismatch:    boolean('amount_mismatch').notNull().default(false),
});

// Append-only payment audit trail. Never updated after insert — a payment can
// always be reconciled against Razorpay from the raw payloads kept here, even
// if the registration row was edited afterwards.
export const academyPaymentEvents = pgTable('academy_payment_events', {
  id:                text('id').primaryKey(),
  registrationId:    text('registration_id'),
  eventType:         text('event_type').notNull(),
  // Razorpay's x-razorpay-event-id. UNIQUE, so a webhook redelivery is recorded once.
  razorpayEventId:   text('razorpay_event_id').unique(),
  razorpayOrderId:   text('razorpay_order_id'),
  razorpayPaymentId: text('razorpay_payment_id'),
  status:            text('status'),
  amount:            integer('amount'),
  payload:           jsonb('payload'),
  createdAt:         timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
});
