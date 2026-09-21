import { NextApiRequest, NextApiResponse } from 'next';
import { clearSessionCookieHeaders } from '@/lib/auth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Clears the signed session and also expires the legacy dset_admin/role/name cookies.
  res.setHeader('Set-Cookie', clearSessionCookieHeaders());
  return res.status(200).json({ ok: true });
}
