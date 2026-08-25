import { NextApiRequest, NextApiResponse } from 'next';
import { isAdminRequest } from '@/lib/auth';

// Exchanges the one-time `code` from the Embedded Signup JS SDK popup for a
// user access token, then (if a WABA ID was captured from the popup's
// postMessage event) subscribes our app to that WABA so its webhooks start
// flowing to /api/whatsapp/webhook.
//
// This does NOT write anything to .env / the database / any persisted
// config — it only returns the exchanged token + IDs so an admin can review
// them and manually decide what (if anything) to promote to real config.
// Nothing here can silently repoint the app at a different number.

function apiVersion(): string {
  return process.env.WHATSAPP_API_VERSION ?? 'v22.0';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAdminRequest(req.cookies)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, wabaId } = req.body as { code?: string; wabaId?: string };
  if (!code) return res.status(400).json({ error: 'code is required' });

  const appId     = process.env.NEXT_PUBLIC_META_APP_ID;
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appId || !appSecret) {
    return res.status(500).json({ error: 'NEXT_PUBLIC_META_APP_ID / WHATSAPP_APP_SECRET not configured' });
  }

  try {
    // Step 1: exchange the one-time code for a short-lived user access token.
    const tokenRes = await fetch(
      `https://graph.facebook.com/${apiVersion()}/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&code=${encodeURIComponent(code)}`,
    );
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      return res.status(400).json({ error: 'Token exchange failed', details: tokenData });
    }

    const shortLivedToken = tokenData.access_token as string;

    // Step 2: exchange for a long-lived token (recommended for anything beyond quick testing).
    const longRes = await fetch(
      `https://graph.facebook.com/${apiVersion()}/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${encodeURIComponent(shortLivedToken)}`,
    );
    const longData = await longRes.json();
    const accessToken = longRes.ok && longData.access_token ? longData.access_token : shortLivedToken;

    let subscribeResult: unknown = null;
    if (wabaId) {
      // Step 3: subscribe our app to the WABA that was just connected, so its
      // webhooks (messages, and once Coexistence is active: history,
      // smb_app_state_sync, smb_message_echoes) start reaching our webhook.
      const subRes = await fetch(`https://graph.facebook.com/${apiVersion()}/${wabaId}/subscribed_apps`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      subscribeResult = await subRes.json();
    }

    return res.status(200).json({
      ok: true,
      wabaId: wabaId ?? null,
      accessTokenPreview: `${accessToken.slice(0, 12)}...${accessToken.slice(-6)}`, // never echo the full token back
      accessToken, // shown once on the admin page for the operator to copy if they choose to
      subscribeResult,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[whatsapp/admin/embedded-signup-exchange]', msg);
    return res.status(500).json({ error: msg });
  }
}
