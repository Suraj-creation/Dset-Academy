import { NextApiRequest, NextApiResponse } from 'next';
import { validateCredentials, createSessionToken, sessionCookieHeaders } from '@/lib/auth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, password } = req.body ?? {};

  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ ok: false });
  }

  const user = validateCredentials(username, password);
  if (!user) return res.status(401).json({ ok: false });

  // A single HMAC-signed HttpOnly cookie now carries identity, role and expiry.
  // The old dset_admin/dset_role/dset_name cookies were plain unsigned values and
  // are deliberately no longer issued or trusted.
  try {
    const token = createSessionToken(user);
    res.setHeader('Set-Cookie', sessionCookieHeaders(token));
  } catch (err) {
    console.error('[admin/login] cannot issue session:', (err as Error).message);
    return res.status(500).json({ ok: false, error: 'Session signing is not configured' });
  }

  return res.status(200).json({ ok: true, role: user.role, displayName: user.displayName });
}
