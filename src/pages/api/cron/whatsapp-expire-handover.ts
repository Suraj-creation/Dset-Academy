import { NextApiRequest, NextApiResponse } from 'next';
import { expireStaleHandovers } from '@/lib/whatsappConversations.server';

// Auto-resets conversations stuck in 'human' back to 'bot' after a period of
// inactivity, so a thread doesn't stay silenced forever if an agent forgets
// to close it out. Same secret-protected pattern as cron/publish-scheduled.
const DEFAULT_EXPIRY_HOURS = 24;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).end('Method Not Allowed');
  }

  const secret = req.headers['x-cron-secret'] ?? req.query.secret;
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const hoursParam = Number(req.query.hours);
  const hours = Number.isFinite(hoursParam) && hoursParam > 0 ? hoursParam : DEFAULT_EXPIRY_HOURS;

  try {
    const count = await expireStaleHandovers(hours);
    return res.status(200).json({ expired: count, hours, timestamp: new Date().toISOString() });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[cron/whatsapp-expire-handover]', msg);
    return res.status(500).json({ error: msg });
  }
}
