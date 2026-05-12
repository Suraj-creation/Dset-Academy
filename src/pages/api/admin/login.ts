import { NextApiRequest, NextApiResponse } from 'next';
import { validateCredentials } from '@/lib/auth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, password } = req.body ?? {};

  if (!username || !password) {
    return res.status(400).json({ ok: false });
  }

  if (validateCredentials(username, password)) {
    // Set the admin cookie server-side so it's always trusted
    res.setHeader('Set-Cookie', 'dset_admin=1; Path=/; HttpOnly; SameSite=Strict');
    return res.status(200).json({ ok: true });
  }

  return res.status(401).json({ ok: false });
}
