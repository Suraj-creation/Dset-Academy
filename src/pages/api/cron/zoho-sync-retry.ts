import { NextApiRequest, NextApiResponse } from 'next';
import { runSyncBatch } from '@/lib/zoho/sync';

// Re-drives queued Zoho sync jobs (pending, or failed and past their backoff window).
// Same secret-protected pattern as cron/publish-scheduled and cron/whatsapp-expire-handover.
// Safe to call repeatedly / concurrently: claimPendingBatch() (queue.server.ts) claims rows
// with `FOR UPDATE SKIP LOCKED`, so two overlapping runs never process the same row twice.
const DEFAULT_BATCH_LIMIT = 20;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).end('Method Not Allowed');
  }

  const secret = req.headers['x-cron-secret'] ?? req.query.secret;
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const limitParam = Number(req.query.limit);
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : DEFAULT_BATCH_LIMIT;

  try {
    const { processed } = await runSyncBatch(limit);
    return res.status(200).json({ processed, timestamp: new Date().toISOString() });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[cron/zoho-sync-retry]', msg);
    return res.status(500).json({ error: msg });
  }
}
