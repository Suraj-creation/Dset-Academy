import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  res.setHeader('Set-Cookie', [
    'dset_admin=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0',
    'dset_role=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0',
    'dset_name=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0',
  ]);
  return res.status(200).json({ ok: true });
}
