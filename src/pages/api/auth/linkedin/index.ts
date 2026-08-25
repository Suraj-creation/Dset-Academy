import { NextApiRequest, NextApiResponse } from 'next';
import { isAdminRequest } from '@/lib/auth';
import { getAuthUrl } from '@/lib/linkedin';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAdminRequest(req.cookies)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return res.redirect(getAuthUrl());
}
