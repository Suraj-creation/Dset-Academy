import type { NextApiRequest, NextApiResponse } from 'next';
import { isAdminRequest } from '@/lib/auth';
import { readBrochureEvents } from '@/lib/academyBrochureEvents.server';

/** Admin-only. Who viewed or downloaded which brochure — read-only, same session
 * cookie as every other admin endpoint on this page. */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAdminRequest(req.cookies)) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const events = await readBrochureEvents();
    return res.status(200).json({ events });
  } catch (err) {
    console.error('[admin/brochure-events]', (err as Error).message);
    return res.status(500).json({ error: 'Failed to load brochure activity' });
  }
}
