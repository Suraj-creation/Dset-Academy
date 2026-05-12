import { NextApiRequest, NextApiResponse } from 'next';
import { eq } from 'drizzle-orm';
import { isAdminRequest } from '@/lib/auth';
import { readLeads } from '@/lib/leads.server';
import { db } from '@/lib/db';
import { leads as leadsTable } from '@/lib/schema';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAdminRequest(req.cookies)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const leads = await readLeads();
      leads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return res.status(200).json({ leads });
    } catch {
      return res.status(500).json({ error: 'Failed to fetch leads' });
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id || typeof id !== 'string') return res.status(400).json({ error: 'id required' });
    try {
      await db.delete(leadsTable).where(eq(leadsTable.id, id));
      return res.status(200).json({ ok: true });
    } catch {
      return res.status(500).json({ error: 'Failed to delete lead' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
