import { NextApiRequest, NextApiResponse } from 'next';
import { isAdminRequest } from '@/lib/auth';
import { setConversationStatus } from '@/lib/whatsappConversations.server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAdminRequest(req.cookies)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { waId } = req.body as { waId?: string };
  if (!waId) return res.status(400).json({ error: 'waId required' });

  try {
    await setConversationStatus(waId, 'bot', null);
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(500).json({ error: 'Failed to reset conversation status' });
  }
}
