import { desc, eq } from 'drizzle-orm';
import { db } from './db';
import { academyBrochureEvents, academyUsers } from './schema';

export interface BrochureEventRow {
  id: string;
  action: string;
  programmeSlug: string;
  programmeTitle: string;
  createdAt: string;
  name: string | null;
  email: string;
  hostedDomain: string | null;
}

/** Admin's live "who opened/downloaded what" feed — capped, newest first. Bulk reporting
 * goes through view_export_brochure_downloads (src/lib/export.server.ts) instead. */
export async function readBrochureEvents(limit = 500): Promise<BrochureEventRow[]> {
  const rows = await db.select({
    id: academyBrochureEvents.id,
    action: academyBrochureEvents.action,
    programmeSlug: academyBrochureEvents.programmeSlug,
    programmeTitle: academyBrochureEvents.programmeTitle,
    createdAt: academyBrochureEvents.createdAt,
    name: academyUsers.fullName,
    email: academyUsers.email,
    hostedDomain: academyUsers.hostedDomain,
  })
    .from(academyBrochureEvents)
    .innerJoin(academyUsers, eq(academyUsers.id, academyBrochureEvents.userId))
    .orderBy(desc(academyBrochureEvents.createdAt))
    .limit(limit);
  return rows;
}
