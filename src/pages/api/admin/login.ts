import { NextApiRequest, NextApiResponse } from 'next';
import { validateCredentials } from '@/lib/auth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, password } = req.body ?? {};

  if (!username || !password) {
    return res.status(400).json({ ok: false });
  }

  const user = validateCredentials(username, password);
  if (user) {
    // Set the admin cookies server-side so they're always trusted.
    // dset_admin keeps every existing admin check working exactly as before;
    // dset_role and dset_name are new and only consulted by the blog approval workflow
    // (dset_name lets review history show a real person's name, e.g. "Approved by Soubhagya").
    res.setHeader('Set-Cookie', [
      'dset_admin=1; Path=/; HttpOnly; SameSite=Strict',
      `dset_role=${user.role}; Path=/; HttpOnly; SameSite=Strict`,
      `dset_name=${encodeURIComponent(user.displayName)}; Path=/; HttpOnly; SameSite=Strict`,
    ]);
    return res.status(200).json({ ok: true, role: user.role, displayName: user.displayName });
  }

  return res.status(401).json({ ok: false });
}
