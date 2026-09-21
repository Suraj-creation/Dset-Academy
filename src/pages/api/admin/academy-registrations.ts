import type { NextApiRequest, NextApiResponse } from 'next';
import { isAdminRequest } from '@/lib/auth';
import { readRegistrations } from '@/lib/academyRegistrations.server';

/**
 * Admin-only. Returns enrolment + payment records, which contain personal data
 * (name, email, mobile, institution) and payment identifiers — so this is gated
 * on the signed session cookie and is read-only. Registration and payment rows
 * are never editable or deletable over HTTP: they are financial records, and
 * the payment event log they reconcile against is append-only.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAdminRequest(req.cookies)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const registrations = await readRegistrations();
    return res.status(200).json({ registrations });
  } catch (err) {
    console.error('[admin/academy-registrations]', (err as Error).message);
    return res.status(500).json({ error: 'Failed to load registrations' });
  }
}
