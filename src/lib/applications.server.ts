import { eq, desc } from 'drizzle-orm';
import { db } from './db';
import { applications } from './schema';

export type ApplicationStatus = 'new' | 'reviewed' | 'shortlisted' | 'rejected';

export interface Application {
  id: string;
  jobId: number;
  jobTitle: string;
  name: string;
  email: string;
  phone: string;
  linkedin?: string;
  portfolio?: string;
  experience: string;
  noticePeriod: string;
  source: string;
  coverNote: string;
  resumeLink: string;
  status: ApplicationStatus;
  submittedAt: string;
}

type Row = typeof applications.$inferSelect;

function toApplication(row: Row): Application {
  return {
    id:           row.id,
    jobId:        row.jobId,
    jobTitle:     row.jobTitle,
    name:         row.name,
    email:        row.email,
    phone:        row.phone,
    linkedin:     row.linkedin  ?? undefined,
    portfolio:    row.portfolio ?? undefined,
    experience:   row.experience,
    noticePeriod: row.noticePeriod,
    source:       row.source,
    coverNote:    row.coverNote,
    resumeLink:   row.resumeLink,
    status:       row.status as ApplicationStatus,
    submittedAt:  row.submittedAt,
  };
}

export async function readApplications(): Promise<Application[]> {
  const rows = await db.select().from(applications).orderBy(desc(applications.submittedAt));
  return rows.map(toApplication);
}

export async function addApplication(data: Omit<Application, 'id' | 'status' | 'submittedAt'>): Promise<Application> {
  const id = `app_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const [row] = await db.insert(applications).values({
    id,
    jobId:        data.jobId,
    jobTitle:     data.jobTitle,
    name:         data.name,
    email:        data.email,
    phone:        data.phone,
    linkedin:     data.linkedin  ?? null,
    portfolio:    data.portfolio ?? null,
    experience:   data.experience,
    noticePeriod: data.noticePeriod,
    source:       data.source,
    coverNote:    data.coverNote,
    resumeLink:   data.resumeLink,
  }).returning();
  return toApplication(row);
}

export async function updateApplicationStatus(id: string, status: ApplicationStatus): Promise<Application | null> {
  const [row] = await db.update(applications).set({ status }).where(eq(applications.id, id)).returning();
  return row ? toApplication(row) : null;
}

export async function deleteApplication(id: string): Promise<{ deleted: boolean; resumeLink?: string }> {
  const rows = await db.delete(applications).where(eq(applications.id, id)).returning({ resumeLink: applications.resumeLink });
  if (!rows[0]) return { deleted: false };
  return { deleted: true, resumeLink: rows[0].resumeLink };
}
