import { desc, eq } from 'drizzle-orm';
import { db } from './db';
import { academyInterestRegistrations } from './schema';

export type InterestRow = typeof academyInterestRegistrations.$inferSelect;

function newId(): string {
  return `aint_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export async function createInterestRegistration(data: {
  programmeTitle: string;
  fullName: string;
  email: string;
  mobile: string;
  role: string;
  institution?: string | null;
  location?: string | null;
  country?: string | null;
  department?: string | null;
  courseName?: string | null;
  currentYear?: string | null;
  subjectSpecialization?: string | null;
  companyName?: string | null;
  companyType?: string | null;
  otherProfessionDetail?: string | null;
  consent: boolean;
}): Promise<InterestRow> {
  const [row] = await db.insert(academyInterestRegistrations).values({
    id: newId(),
    programmeTitle: data.programmeTitle,
    fullName: data.fullName,
    email: data.email,
    mobile: data.mobile,
    role: data.role,
    institution: data.institution ?? null,
    location: data.location ?? null,
    country: data.country ?? null,
    department: data.department ?? null,
    courseName: data.courseName ?? null,
    currentYear: data.currentYear ?? null,
    subjectSpecialization: data.subjectSpecialization ?? null,
    companyName: data.companyName ?? null,
    companyType: data.companyType ?? null,
    otherProfessionDetail: data.otherProfessionDetail ?? null,
    consent: data.consent,
  }).returning();
  return row;
}

export async function readInterestRegistrations(): Promise<InterestRow[]> {
  return db.select().from(academyInterestRegistrations)
    .orderBy(desc(academyInterestRegistrations.createdAt));
}

export async function markInterestContacted(id: string): Promise<InterestRow | null> {
  const [row] = await db.update(academyInterestRegistrations)
    .set({ contacted: true })
    .where(eq(academyInterestRegistrations.id, id))
    .returning();
  return row ?? null;
}
