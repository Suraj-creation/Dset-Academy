import { NextApiRequest, NextApiResponse } from 'next';
import { isAdminRequest } from '@/lib/auth';
import { listConversations } from '@/lib/whatsappConversations.server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAdminRequest(req.cookies)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const conversations = await listConversations();
    return res.status(200).json({ conversations });
  } catch {
    return res.status(500).json({ error: 'Failed to fetch conversations' });
  }
}
