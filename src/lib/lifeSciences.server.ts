import { pool } from './db';
import crypto from 'crypto';

/* ─── DSeT slug → SLSSDTR programId mapping ─────────────────── */
/**
 * Maps DSeT Academy programme slugs to the canonical SLSSDTR `program_enquiry.programId` values.
 * Used to ensure cross-portal referrals land in the correct Life Sciences programme bucket.
 */
export const DSET_TO_SLSSDTR_PROGRAM_MAP: Record<string, string> = {
  'pharmaai-student':                  'student-ai',
  'ai-faculty-mastery':                'faculty-ai',
  'entrepreneur-mastery':              'entrepreneur-ai',
  'ai-educator-mastery':               'train-the-trainer',
  'ai-mastery-life-science-healthcare': 'train-the-trainer',
};

/**
 * Resolves a DSeT slug to the SLSSDTR programId.
 * Falls back to the input value if no explicit mapping exists (allows pass-through).
 */
export function resolveSLSSDTRProgramId(dsetSlugOrTitle: string): string {
  return DSET_TO_SLSSDTR_PROGRAM_MAP[dsetSlugOrTitle] ?? dsetSlugOrTitle;
}

export interface LifeSciencesEnquiryInput {
  programId: string;
  name: string;
  email: string;
  phone?: string | null;
  organization?: string | null;
  message?: string | null;
  source?: string;
  externalSystem?: string;
  externalReference?: string | null;
  location?: string | null;
  country?: string | null;
  role?: string | null;
  department?: string | null;
  courseName?: string | null;
  currentYear?: string | null;
  subjectSpecialization?: string | null;
  companyName?: string | null;
  companyType?: string | null;
  metadata?: Record<string, any> | null;
}

/**
 * Inserts or updates an enquiry in Neon's `program_enquiry` table.
 * Fully compatible with Life Sciences (SLSSDTR) schema and constraints.
 *
 * If `programId` matches a DSeT slug in DSET_TO_SLSSDTR_PROGRAM_MAP it is
 * automatically resolved to the canonical SLSSDTR programId before insertion.
 */
export async function recordLifeSciencesEnquiry(input: LifeSciencesEnquiryInput) {
  const id = crypto.randomUUID();
  const now = new Date();
  const source = input.source || 'DSET_ACADEMY';
  const externalSystem = input.externalSystem || 'DSET_ACADEMY';
  const message = input.message || `Referral from DSeT Academy for program: ${input.programId}`;

  // Auto-resolve DSeT slug to SLSSDTR canonical programId
  const programId = resolveSLSSDTRProgramId(input.programId);

  const query = `
    INSERT INTO program_enquiry (
      id,
      "programId",
      name,
      email,
      phone,
      organization,
      message,
      status,
      "createdAt",
      "updatedAt",
      source,
      external_system,
      external_reference,
      location,
      country,
      role,
      department,
      course_name,
      current_year,
      subject_specialization,
      company_name,
      company_type,
      metadata
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, 'NEW', $8, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
    )
    ON CONFLICT (id) DO UPDATE SET
      "updatedAt" = $8,
      source = EXCLUDED.source,
      external_reference = EXCLUDED.external_reference,
      metadata = EXCLUDED.metadata
    RETURNING *;
  `;

  const values = [
    id,
    programId,
    input.name,
    input.email,
    input.phone ?? null,
    input.organization ?? input.companyName ?? null,
    message,
    now,
    source,
    externalSystem,
    input.externalReference ?? null,
    input.location ?? null,
    input.country ?? null,
    input.role ?? null,
    input.department ?? null,
    input.courseName ?? null,
    input.currentYear ?? null,
    input.subjectSpecialization ?? null,
    input.companyName ?? null,
    input.companyType ?? null,
    input.metadata ? JSON.stringify(input.metadata) : null,
  ];

  const res = await pool.query(query, values);
  return res.rows[0];
}

/**
 * Checks if a programme slug/title is affiliated with Life Sciences / Healthcare.
 */
export function isLifeSciencesAffiliated(programSlugOrTitle: string): boolean {
  const normalized = programSlugOrTitle.toLowerCase();
  return (
    normalized.includes('life-science') ||
    normalized.includes('life science') ||
    normalized.includes('pharma') ||
    normalized.includes('healthcare') ||
    normalized.includes('biotech') ||
    normalized.includes('clinical') ||
    normalized.includes('medical')
  );
}
