import { NextApiRequest, NextApiResponse } from 'next';
import { getRequestRole } from '@/lib/auth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const role = getRequestRole(req.cookies);
  if (!role) return res.status(401).json({ role: null });
  return res.status(200).json({ role });
}
