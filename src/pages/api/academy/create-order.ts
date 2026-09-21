import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { getProgram } from '@/lib/academyPrograms';
import { createRazorpayOrder, getRazorpayConfig } from '@/lib/razorpay';
import {
  createRegistration,
  newRegistrationId,
  logPaymentEvent,
} from '@/lib/academyRegistrations.server';

/**
 * Step 1 of enrolment: create a Razorpay order for a cohort seat.
 *
 * The request carries a programme SLUG, never a price. The amount is resolved
 * server-side from src/lib/academyPrograms.ts, so a tampered request cannot buy
 * a ₹60,180 seat for ₹1.
 */

declare global {
  var academyOrderAttempts: Map<string, number[]> | undefined;
}

const bodySchema = z.object({
  programmeSlug: z.string().min(1),
  fullName:      z.string().trim().min(2, 'Please enter your full name'),
  email:         z.email('Please enter a valid email address'),
  mobile:        z.string().trim().min(8, 'Please enter a valid mobile number').max(20),
  role:          z.string().trim().min(1, 'Please select a role'),
  institution:   z.string().trim().max(200).optional(),
  consent:       z.literal(true, { message: 'Consent is required to register' }),
});

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
// Generous on purpose: a real person retries after a declined card, a wrong OTP
// or a dismissed checkout. An unpaid Razorpay order costs nothing, so this only
// needs to stop bulk automated abuse, not honest retries.
const RATE_LIMIT_MAX = 10;

function rateLimit(ip: string): { limited: boolean; retryAfterSec: number } {
  const now = Date.now();
  global.academyOrderAttempts = global.academyOrderAttempts ?? new Map();
  const recent = (global.academyOrderAttempts.get(ip) ?? [])
    .filter(t => now - t < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX) {
    // Deliberately do NOT record this attempt. Recording a blocked request would
    // push the window forward on every retry, so the caller could never drain
    // out of the limit and would stay locked out indefinitely.
    global.academyOrderAttempts.set(ip, recent);
    const retryAfterSec = Math.max(1, Math.ceil((RATE_LIMIT_WINDOW_MS - (now - recent[0])) / 1000));
    return { limited: true, retryAfterSec };
  }

  recent.push(now);
  global.academyOrderAttempts.set(ip, recent);
  return { limited: false, retryAfterSec: 0 };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { keyId, configured } = getRazorpayConfig();
  if (!configured) {
    return res.status(503).json({
      error: 'Payments are not available yet. Please contact the Academy team.',
    });
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

  // Price comes from the server catalogue, never from the request body.
  const program = getProgram(data.programmeSlug);
  if (!program) {
    return res.status(400).json({ error: 'That programme is not open for online payment.' });
  }

  // Rate limit only what is about to hit Razorpay. Validation failures above are
  // cheap and usually just typos — charging them against the budget would lock
  // someone out for mistyping their email.
  const ip = String(req.headers['x-forwarded-for'] ?? req.socket.remoteAddress ?? 'unknown')
    .split(',')[0].trim();
  const { limited, retryAfterSec } = rateLimit(ip);
  if (limited) {
    const mins = Math.ceil(retryAfterSec / 60);
    res.setHeader('Retry-After', String(retryAfterSec));
    return res.status(429).json({
      error: `Too many payment attempts from this device. Please try again in ${mins} minute${mins === 1 ? '' : 's'}.`,
      retryAfterSec,
    });
  }

  const registrationId = newRegistrationId();

  try {
    const order = await createRazorpayOrder({
      amount: program.totalAmount,
      currency: program.currency,
      receipt: registrationId,
      notes: {
        registrationId,
        programme: program.title,
        email: data.email,
      },
    });

    await createRegistration({
      id: registrationId,
      programmeSlug: program.slug,
      programmeTitle: program.title,
      fullName: data.fullName,
      email: data.email,
      mobile: data.mobile,
      role: data.role,
      institution: data.institution ?? null,
      consent: data.consent,
      baseAmount: program.baseAmount,
      gstAmount: program.gstAmount,
      totalAmount: program.totalAmount,
      currency: program.currency,
      razorpayOrderId: order.id,
    });

    await logPaymentEvent({
      registrationId,
      eventType: 'order_created',
      razorpayOrderId: order.id,
      status: order.status,
      amount: program.totalAmount,
      payload: order,
    });

    // key_id is a public, publishable identifier — key_secret never leaves the server.
    return res.status(200).json({
      registrationId,
      orderId: order.id,
      amount: program.totalAmount,
      currency: program.currency,
      keyId,
      programmeTitle: program.title,
    });
  } catch (err) {
    console.error('[academy/create-order]', (err as Error).message);
    return res.status(502).json({ error: 'Could not start the payment. Please try again.' });
  }
}
