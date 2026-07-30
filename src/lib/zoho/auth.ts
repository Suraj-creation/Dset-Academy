// OAuth token storage/retrieval for the Zoho CRM integration.
//
// Refresh token: persisted in the zoho_oauth_tokens table (single row) — long-lived, must
// survive redeploys/restarts.
// Access token: NEVER written to Postgres. It lives only in the module-level cache below,
// which is wiped whenever the server process restarts and simply re-derived from the
// refresh token on next use. Never import this file from client-side code.
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { zohoOauthTokens } from '@/lib/schema';

const TOKEN_ROW_ID = 'default';
const REFRESH_BUFFER_MS = 5 * 60 * 1000;

interface CachedAccessToken {
  token: string;
  expiresAt: number; // epoch ms
}

// Module-level only — never persisted, never sent to the browser.
let cachedAccessToken: CachedAccessToken | null = null;

function isZohoSyncEnabled(): boolean {
  return process.env.ZOHO_SYNC_ENABLED === 'true';
}

export async function getStoredRefreshToken(): Promise<string | null> {
  const rows = await db
    .select({ refreshToken: zohoOauthTokens.refreshToken })
    .from(zohoOauthTokens)
    .where(eq(zohoOauthTokens.id, TOKEN_ROW_ID))
    .limit(1);
  return rows[0]?.refreshToken ?? null;
}

/** Called by the (future, Phase 2+) admin OAuth callback route once a code is exchanged. */
export async function saveRefreshToken(refreshToken: string): Promise<void> {
  const now = new Date().toISOString();
  await db
    .insert(zohoOauthTokens)
    .values({ id: TOKEN_ROW_ID, refreshToken, updatedAt: now })
    .onConflictDoUpdate({
      target: zohoOauthTokens.id,
      set: { refreshToken, updatedAt: now },
    });
}

async function recordAccessTokenExpiry(expiresAtIso: string): Promise<void> {
  // Informational only (monitoring signal: "when did we last successfully refresh") — the
  // access token value itself is never written here, only its expiry timestamp.
  await db
    .update(zohoOauthTokens)
    .set({ accessTokenExpiresAt: expiresAtIso, updatedAt: new Date().toISOString() })
    .where(eq(zohoOauthTokens.id, TOKEN_ROW_ID));
}

/** Forces the next getValidAccessToken() call to refresh rather than reuse the cache. */
export function invalidateCachedAccessToken(): void {
  cachedAccessToken = null;
}

/**
 * Returns a valid access token, refreshing via the stored refresh token if the in-memory
 * cache is missing or within REFRESH_BUFFER_MS of expiring. Throws if sync is disabled,
 * unconfigured, or the refresh call fails — src/lib/zoho/client.ts is responsible for
 * catching this and turning it into a normalized { ok: false } result, never an unhandled
 * rejection reaching a visitor-facing request.
 *
 * Nothing in Phase 1 calls this function — no route or cron job is wired up to it yet.
 */
export async function getValidAccessToken(): Promise<string> {
  if (!isZohoSyncEnabled()) {
    throw new Error('Zoho sync is disabled (ZOHO_SYNC_ENABLED is not "true")');
  }

  const now = Date.now();
  if (cachedAccessToken && cachedAccessToken.expiresAt - REFRESH_BUFFER_MS > now) {
    return cachedAccessToken.token;
  }

  return refreshAccessToken();
}

async function refreshAccessToken(): Promise<string> {
  const clientId = process.env.ZOHO_CLIENT_ID;
  const clientSecret = process.env.ZOHO_CLIENT_SECRET;
  const accountsDomain = process.env.ZOHO_ACCOUNTS_DOMAIN;

  if (!clientId || !clientSecret || !accountsDomain) {
    throw new Error('Zoho OAuth is not configured (ZOHO_CLIENT_ID / ZOHO_CLIENT_SECRET / ZOHO_ACCOUNTS_DOMAIN missing)');
  }

  const refreshToken = await getStoredRefreshToken();
  if (!refreshToken) {
    throw new Error('No Zoho refresh token on file — the one-time admin OAuth connect flow has not been run yet');
  }

  const res = await fetch(`https://${accountsDomain}/oauth/v2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  const data = (await res.json().catch(() => ({}))) as { access_token?: string; expires_in?: number; error?: string };
  if (!res.ok || !data.access_token) {
    throw new Error(`Zoho token refresh failed: ${data.error ?? res.statusText}`);
  }

  const expiresAt = Date.now() + (data.expires_in ?? 3600) * 1000;
  cachedAccessToken = { token: data.access_token, expiresAt };
  await recordAccessTokenExpiry(new Date(expiresAt).toISOString()).catch(() => {});

  return data.access_token;
}
