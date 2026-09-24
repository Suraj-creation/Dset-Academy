import type { NextApiRequest, NextApiResponse } from 'next';
import {
  verifyGoogleIdToken, exchangeGoogleCode, upsertAcademyUser, createAcademyToken, getAcademyUser, toPublicUser,
  academyCookieHeader, clearAcademyCookieHeader, googleClientId,
} from '@/lib/academyAuth.server';

/**
 * Academy visitor session.
 *   GET    -> { user | null, clientId } — the page asks this on load (the cookie is HttpOnly).
 *   POST   -> { credential } Google ID token, or { code } from the popup -> verified, stored, session cookie set.
 *   DELETE -> sign out.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'private, no-store');

  if (req.method === 'GET') {
    const user = await getAcademyUser(req.cookies).catch(() => null);
    return res.status(200).json({ user: user ? toPublicUser(user) : null, clientId: googleClientId() || null });
  }

  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', clearAcademyCookieHeader());
    return res.status(200).json({ ok: true });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // A cross-site form cannot send application/json without a CORS preflight we never
  // grant, so this blocks login-CSRF (signing a visitor in as someone else).
  if (!String(req.headers['content-type'] ?? '').includes('application/json')) {
    return res.status(415).json({ error: 'Unsupported content type' });
  }

  try {
    // An ID token (One Tap / Continue button), or a popup authorization code to exchange for one.
    const idToken = typeof req.body?.credential === 'string'
      ? req.body.credential
      : typeof req.body?.code === 'string' ? await exchangeGoogleCode(req.body.code) : null;
    const claims = idToken ? await verifyGoogleIdToken(idToken) : null;
    if (!claims) return res.status(401).json({ error: 'Google sign-in could not be verified. Please try again.' });

    const user = await upsertAcademyUser(claims);
    res.setHeader('Set-Cookie', academyCookieHeader(createAcademyToken(user.id)));
    return res.status(200).json({ user: toPublicUser(user) });
  } catch (err) {
    console.error('[academy/auth]', (err as Error).message);
    return res.status(500).json({ error: 'Sign-in failed. Please try again.' });
  }
}
