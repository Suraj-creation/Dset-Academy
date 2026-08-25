import { NextApiRequest, NextApiResponse } from 'next';
import { exchangeCodeForToken, saveLinkedInToken } from '@/lib/linkedin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code, error, error_description } = req.query;

  if (error || !code || typeof code !== 'string') {
    const msg = encodeURIComponent(String(error_description ?? error ?? 'unknown'));
    return res.redirect(`/admin/linkedin?status=error&msg=${msg}`);
  }

  const result = await exchangeCodeForToken(code);
  if (!result.token) {
    const msg = encodeURIComponent(result.error ?? 'token exchange failed');
    return res.redirect(`/admin/linkedin?status=error&msg=${msg}`);
  }

  await saveLinkedInToken(result.token);
  return res.redirect('/admin/linkedin?status=connected');
}
