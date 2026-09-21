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
