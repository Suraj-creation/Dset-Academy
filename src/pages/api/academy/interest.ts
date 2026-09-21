import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { isAdminRequest } from '@/lib/auth';
import {
  createInterestRegistration,
  readInterestRegistrations,
  markInterestContacted,
} from '@/lib/academyInterest.server';
import { sendInterestNotification } from '@/lib/academyEmail.server';

/**
 * General interest signups for programmes with no published fee (institutional,
 * interest-list, custom cohort, "coming next"). No payment involved — this is the
 * non-Razorpay sibling of /api/academy/create-order.
 */

declare global {
  var academyInterestAttempts: Map<string, number[]> | undefined;
}

const bodySchema = z.object({
  programmeTitle: z.string().trim().min(1),
  fullName:       z.string().trim().min(2, 'Please enter your full name'),
  email:          z.email('Please enter a valid email address'),
  mobile:         z.string().trim().min(8, 'Please enter a valid mobile number').max(20),
  role:           z.string().trim().min(1, 'Please select a role'),
  institution:    z.string().trim().max(200).optional(),
  consent:        z.literal(true, { message: 'Consent is required to continue' }),
});

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 10;

/** Same shape as create-order's limiter: blocked attempts are never recorded, or the
 * window could never drain and a genuine retry would stay locked out indefinitely. */
function rateLimit(ip: string): boolean {
  const now = Date.now();
  global.academyInterestAttempts = global.academyInterestAttempts ?? new Map();
  const recent = (global.academyInterestAttempts.get(ip) ?? [])
    .filter(t => now - t < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX) {
    global.academyInterestAttempts.set(ip, recent);
    return true;
  }
  recent.push(now);
  global.academyInterestAttempts.set(ip, recent);
  return false;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    if (!isAdminRequest(req.cookies)) return res.status(401).json({ error: 'Unauthorized' });
    const registrations = await readInterestRegistrations();
    return res.status(200).json({ registrations });
  }

  if (req.method === 'PATCH') {
    if (!isAdminRequest(req.cookies)) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.query;
    if (!id || typeof id !== 'string') return res.status(400).json({ error: 'id required' });
    const updated = await markInterestContacted(id);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json(updated);
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip = String(req.headers['x-forwarded-for'] ?? req.socket.remoteAddress ?? 'unknown').split(',')[0].trim();
  if (rateLimit(ip)) {
    return res.status(429).json({ error: 'Too many attempts. Please try again in a few minutes.' });
  }

  let data: z.infer<typeof bodySchema>;
  try {
    data = bodySchema.parse(req.body);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.issues.map(i => i.message).join(', ') });
    }
    return res.status(400).json({ error: 'Invalid request' });
  }

  try {
    const registration = await createInterestRegistration({
      programmeTitle: data.programmeTitle,
      fullName: data.fullName,
      email: data.email,
      mobile: data.mobile,
      role: data.role,
      institution: data.institution ?? null,
      consent: data.consent,
    });

    // Fire-and-forget — an SMTP hiccup must never fail the applicant's submission,
    // which is already safely in the database.
    sendInterestNotification(registration).catch(e =>
      console.error('[academy/interest] notification email failed:', e.message));

    return res.status(200).json({
      success: true,
      registrationId: registration.id,
      programmeTitle: registration.programmeTitle,
    });
  } catch (err) {
    console.error('[academy/interest]', (err as Error).message);
    return res.status(500).json({ error: 'Could not submit your details. Please try again.' });
  }
}
