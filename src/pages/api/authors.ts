import { NextApiRequest, NextApiResponse } from 'next';
import { getAllAuthorsServer, createAuthorServer, updateAuthorServer, deleteAuthorServer } from '@/lib/authors.server';
import { isAdminRequest, getRequestRole } from '@/lib/auth';

// Only a Publisher/Admin maintains the author roster — Creators pick from it, they don't add
// to it, so bios/photos stay consistent and nobody can publish under an ad-hoc identity.
const MANAGE_ROLES = ['publisher', 'admin'];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET': {
        if (!isAdminRequest(req.cookies)) return res.status(401).json({ error: 'Unauthorized' });
        const authors = await getAllAuthorsServer();
        return res.status(200).json(authors);
      }

      case 'POST': {
        const role = getRequestRole(req.cookies);
        if (!role || !MANAGE_ROLES.includes(role)) return res.status(403).json({ error: 'Only a publisher can manage authors' });
        if (!req.body?.name?.trim()) return res.status(400).json({ error: 'Name is required' });
        const created = await createAuthorServer(req.body);
        return res.status(201).json(created);
      }

      case 'PUT': {
        const role = getRequestRole(req.cookies);
        if (!role || !MANAGE_ROLES.includes(role)) return res.status(403).json({ error: 'Only a publisher can manage authors' });
        const { id } = req.query;
        const updated = await updateAuthorServer(id as string, req.body);
        if (!updated) return res.status(404).json({ error: 'Author not found' });
        return res.status(200).json(updated);
      }

      case 'DELETE': {
        const role = getRequestRole(req.cookies);
        if (!role || !MANAGE_ROLES.includes(role)) return res.status(403).json({ error: 'Only a publisher can manage authors' });
        const { id } = req.query;
        const success = await deleteAuthorServer(id as string);
        return res.status(200).json({ success });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ error: detail });
  }
}
