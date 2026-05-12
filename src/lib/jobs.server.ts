import { eq, asc, max, sql } from 'drizzle-orm';
import { db } from './db';
import { jobs } from './schema';

export interface JobWithStatus {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  level: string;
  color: string;
  description: string;
  isActive: boolean;
}

const SEED_JOBS: JobWithStatus[] = [
  { id: 1, title: 'AI/ML Engineer - Mining & Industrial',    department: 'Engineering',     location: 'Bengaluru, India',    type: 'Full-time',  level: 'Mid-Senior', color: '#ff851b', description: 'Build and deploy vertical AI models for OreBill AI and EdgeBay platforms with real-world OT/IT data from mining and industrial environments.', isActive: true },
  { id: 2, title: 'Full Stack Engineer (Next.js / Node)',    department: 'Engineering',     location: 'Bengaluru, India',    type: 'Full-time',  level: 'Mid-Level',  color: '#1e90ff', description: 'Build platform UIs and APIs for our vertical AI products, including real-time dashboards, agentic workflows, and enterprise integrations.',    isActive: true },
  { id: 3, title: 'Product Manager - Vertical AI Platforms', department: 'Product',         location: 'Bengaluru, India',    type: 'Full-time',  level: 'Senior',     color: '#5e17ea', description: "Own the roadmap for one of DSeT's vertical platforms and work across engineering, sales, and customers to shape products that solve operational problems.", isActive: true },
  { id: 4, title: 'DevOps / Platform Engineer',             department: 'Infrastructure',  location: 'Bengaluru / Remote',  type: 'Full-time',  level: 'Mid-Level',  color: '#0ea5e9', description: 'Manage cloud, edge, and hybrid infrastructure for AI platform deployments across Azure, Docker, Kubernetes, and on-premise environments.',   isActive: true },
  { id: 5, title: 'Enterprise Sales Executive',             department: 'Sales',           location: 'Bengaluru, India',    type: 'Full-time',  level: 'Senior',     color: '#22c55e', description: 'Drive enterprise pipeline for DSeT AI platforms in mining, industrial, and healthcare sectors with a strong B2B SaaS or enterprise software sales motion.', isActive: true },
  { id: 6, title: 'Intern - AI/ML & Data Engineering',      department: 'Engineering',     location: 'Bengaluru, India',    type: 'Internship', level: 'Fresher',    color: '#a855f7', description: 'Work on real AI platform problems with full mentorship from the core team across OreBill AI, EdgeBay, and MedicsIQ pipelines.',                isActive: true },
];

type Row = typeof jobs.$inferSelect;

function toJob(row: Row): JobWithStatus {
  return {
    id:          row.id,
    title:       row.title,
    department:  row.department,
    location:    row.location,
    type:        row.type,
    level:       row.level,
    color:       row.color,
    description: row.description,
    isActive:    row.isActive,
  };
}

async function seedIfEmpty(): Promise<void> {
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(jobs);
  if (count === 0) {
    await db.insert(jobs).values(SEED_JOBS);
  }
}

export async function readJobs(): Promise<JobWithStatus[]> {
  await seedIfEmpty();
  const rows = await db.select().from(jobs).orderBy(asc(jobs.id));
  return rows.map(toJob);
}

export async function getActiveJobs(): Promise<JobWithStatus[]> {
  await seedIfEmpty();
  const rows = await db.select().from(jobs).where(eq(jobs.isActive, true)).orderBy(asc(jobs.id));
  return rows.map(toJob);
}

export async function getNextJobId(): Promise<number> {
  const [result] = await db.select({ maxId: max(jobs.id) }).from(jobs);
  return (result.maxId ?? 0) + 1;
}

export async function createJob(job: JobWithStatus): Promise<JobWithStatus> {
  const [row] = await db.insert(jobs).values(job).returning();
  return toJob(row);
}

export async function updateJob(id: number, data: Partial<Omit<JobWithStatus, 'id'>>): Promise<JobWithStatus | null> {
  const set: Partial<typeof jobs.$inferInsert> = {};
  if (data.title !== undefined)       set.title       = data.title;
  if (data.department !== undefined)  set.department  = data.department;
  if (data.location !== undefined)    set.location    = data.location;
  if (data.type !== undefined)        set.type        = data.type;
  if (data.level !== undefined)       set.level       = data.level;
  if (data.color !== undefined)       set.color       = data.color;
  if (data.description !== undefined) set.description = data.description;
  if (data.isActive !== undefined)    set.isActive    = data.isActive;
  if (Object.keys(set).length === 0) {
    const [row] = await db.select().from(jobs).where(eq(jobs.id, id));
    return row ? toJob(row) : null;
  }
  const [row] = await db.update(jobs).set(set).where(eq(jobs.id, id)).returning();
  return row ? toJob(row) : null;
}

export async function deleteJob(id: number): Promise<boolean> {
  const rows = await db.delete(jobs).where(eq(jobs.id, id)).returning({ id: jobs.id });
  return rows.length > 0;
}
