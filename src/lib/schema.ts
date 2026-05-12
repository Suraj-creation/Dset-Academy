import { pgTable, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

export interface Tag { id: string; name: string; color: string; }
export interface MediaItem { id: string; type: 'image' | 'video'; url: string; }

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
});

export const leads = pgTable('leads', {
  id:        text('id').primaryKey(),
  name:      text('name'),
  email:     text('email'),
  company:   text('company'),
  intent:    text('intent').notNull(),
  score:     text('score').notNull(),
  messages:  integer('messages').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  source:    text('source').notNull().default('chat-widget'),
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
