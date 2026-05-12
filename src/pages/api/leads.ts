import { NextApiRequest, NextApiResponse } from 'next';
import { readLeads } from '@/lib/leads.server';
import { isAdminRequest } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAdminRequest(req.cookies)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const leads = await readLeads();
    return res.status(200).json({ success: true, leads });
  } catch {
    return res.status(500).json({ error: 'Failed to fetch leads' });
  }
}
