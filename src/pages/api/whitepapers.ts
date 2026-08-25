import type { NextApiRequest, NextApiResponse } from 'next';
import { isAdminRequest } from '@/lib/auth';
import {
  getAllWhitepapers,
  getPublishedWhitepapers,
  createWhitepaper,
  updateWhitepaper,
  deleteWhitepaper,
} from '@/lib/whitepapers.server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const admin = isAdminRequest(req.cookies);
      const data  = admin ? await getAllWhitepapers() : await getPublishedWhitepapers();
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      if (!isAdminRequest(req.cookies)) return res.status(401).json({ error: 'Unauthorized' });
      const { id: _id, downloadCount: _dl, createdAt: _ca, ...data } = req.body;
      void _id; void _dl; void _ca;
      if (!data.title || !data.description || !data.category) {
        return res.status(400).json({ error: 'title, description, and category are required' });
      }
      const wp = await createWhitepaper({
        ...data,
        thumbnailUrl: data.thumbnailUrl ?? '',
        pdfUrl:       data.pdfUrl       ?? '',
        isPublished:  data.isPublished  ?? false,
        pageCount:    Number(data.pageCount) || 0,
        readTime:     data.readTime     ?? '',
        tags:         Array.isArray(data.tags) ? data.tags : [],
      });
      return res.status(201).json(wp);
    }

    if (req.method === 'PUT') {
      if (!isAdminRequest(req.cookies)) return res.status(401).json({ error: 'Unauthorized' });
      const { id, ...data } = req.body;
      if (!id) return res.status(400).json({ error: 'id is required' });
      const update: Record<string, unknown> = {};
      if (data.title        !== undefined) update.title        = data.title;
      if (data.description  !== undefined) update.description  = data.description;
      if (data.category     !== undefined) update.category     = data.category;
      if (data.thumbnailUrl !== undefined) update.thumbnailUrl = data.thumbnailUrl;
      if (data.pdfUrl       !== undefined) update.pdfUrl       = data.pdfUrl;
      if (data.isPublished  !== undefined) update.isPublished  = data.isPublished;
      if (data.pageCount    !== undefined) update.pageCount    = Number(data.pageCount) || 0;
      if (data.readTime     !== undefined) update.readTime     = data.readTime;
      if (data.tags         !== undefined) update.tags         = Array.isArray(data.tags) ? data.tags : [];
      const wp = await updateWhitepaper(id as string, update);
      if (!wp) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json(wp);
    }

    if (req.method === 'DELETE') {
      if (!isAdminRequest(req.cookies)) return res.status(401).json({ error: 'Unauthorized' });
      const { id } = req.query;
      if (!id || typeof id !== 'string') return res.status(400).json({ error: 'id is required' });
      const ok = await deleteWhitepaper(id);
      if (!ok) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[api/whitepapers]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
