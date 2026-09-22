import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { recordLifeSciencesEnquiry } from '@/lib/lifeSciences.server';
import { isAdminRequest } from '@/lib/auth';

/* ─── Rate limiter ──────────────────────────────────────────── */
declare global {
  var referralAttempts: Map<string, number[]> | undefined;
}

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 10;

function rateLimit(ip: string): boolean {
  const now = Date.now();
  global.referralAttempts = global.referralAttempts ?? new Map();
  const recent = (global.referralAttempts.get(ip) ?? []).filter(
    t => now - t < RATE_LIMIT_WINDOW_MS,
  );
  if (recent.length >= RATE_LIMIT_MAX) {
    global.referralAttempts.set(ip, recent);
    return true; // blocked
  }
  recent.push(now);
  global.referralAttempts.set(ip, recent);
  return false; // allowed
}

/* ─── Auth helper ───────────────────────────────────────────── */
/**
 * Two-tier auth:
 *  1. Bearer token in Authorization header (for server-to-server calls, e.g. SLSSDTR → DSeT)
 *  2. Admin session cookie (for admin dashboard manual referrals)
 *
 * If neither LIFESCI_INTEGRATION_TOKEN nor a valid admin session is present → 401.
 */
function isAuthorised(req: NextApiRequest): boolean {
  const token = process.env.LIFESCI_INTEGRATION_TOKEN;

  const authHeader = req.headers['authorization'] ?? '';
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    const supplied = authHeader.slice(7).trim();
    if (token && supplied === token) return true;
  }

  // Fallback: admin cookie
  if (isAdminRequest(req.cookies)) return true;

  return false;
}

/* ─── Schema ────────────────────────────────────────────────── */
const referralSchema = z.object({
  programId:             z.string().trim().min(1, 'Program identifier is required'),
  name:                  z.string().trim().min(2, 'Name is required'),
  email:                 z.string().trim().email('Valid email is required'),
  phone:                 z.string().trim().optional(),
  organization:          z.string().trim().optional(),
  message:               z.string().trim().optional(),
  registrationId:        z.string().trim().optional(),
  location:              z.string().trim().optional(),
  country:               z.string().trim().optional(),
  role:                  z.string().trim().optional(),
  department:            z.string().trim().optional(),
  courseName:            z.string().trim().optional(),
  currentYear:           z.string().trim().optional(),
  subjectSpecialization: z.string().trim().optional(),
  companyName:           z.string().trim().optional(),
  companyType:           z.string().trim().optional(),
});

/* ─── Handler ───────────────────────────────────────────────── */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Auth check first (before rate limiting — avoids leaking slot count to unauthenticated callers)
  if (!isAuthorised(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Rate limit (per IP, post-auth)
  const ip = String(
    req.headers['x-forwarded-for'] ?? req.socket.remoteAddress ?? 'unknown',
  )
    .split(',')[0]
    .trim();
  if (rateLimit(ip)) {
    return res.status(429).json({ error: 'Too many referral requests. Please try again later.' });
  }

  let rawData = req.body;
  if (typeof rawData === 'string') {
    try {
      rawData = JSON.parse(rawData);
    } catch {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
  }

  let data: z.infer<typeof referralSchema>;
  try {
    data = referralSchema.parse(rawData);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.issues.map(i => i.message).join(', ') });
    }
    return res.status(400).json({ error: 'Invalid referral payload' });
  }

  try {
    const enquiry = await recordLifeSciencesEnquiry({
      programId:             data.programId,
      name:                  data.name,
      email:                 data.email,
      phone:                 data.phone,
      organization:          data.organization || data.companyName,
      message:               data.message || `Referral via DSeT Academy for ${data.programId}`,
      source:                'DSET_ACADEMY',
      externalSystem:        'DSET_ACADEMY',
      externalReference:     data.registrationId || null,
      location:              data.location,
      country:               data.country,
      role:                  data.role,
      department:            data.department,
      courseName:            data.courseName,
      currentYear:           data.currentYear,
      subjectSpecialization: data.subjectSpecialization,
      companyName:           data.companyName,
      companyType:           data.companyType,
    });

    return res.status(200).json({
      success:           true,
      enquiryId:         enquiry.id,
      programId:         enquiry.programId,
      externalReference: enquiry.external_reference,
    });
  } catch (err) {
    console.error('[academy/refer-to-lifesci]', (err as Error).message);
    return res.status(500).json({ error: 'Failed to record Life Sciences referral' });
  }
}
