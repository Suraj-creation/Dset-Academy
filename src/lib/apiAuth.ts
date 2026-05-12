import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Call this in any admin API route before allowing mutations.
 * Returns true if the request is authenticated, false + sends 401 if not.
 */
export function requireAdminAuth(req: NextApiRequest, res: NextApiResponse): boolean {
  const token = req.headers['x-admin-token'] as string | undefined;
  const expected = process.env.ADMIN_API_TOKEN ?? process.env.ADMIN_PASSWORD ?? '';
  if (!token || token !== expected) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}
