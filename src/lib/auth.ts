import crypto from 'crypto';

/**
 * SERVER-ONLY admin authentication. (Browser-side state lives in authClient.ts —
 * this module uses node:crypto and must never reach the client bundle.)
 *
 * Sessions are a signed cookie: base64url(JSON payload) + "." + HMAC-SHA256.
 * The previous scheme sent a literal `dset_admin=1`, which any visitor could
 * forge with `curl -H "Cookie: dset_admin=1"` to reach every admin endpoint —
 * HttpOnly stops a script *reading* a cookie, it does not stop an attacker
 * *sending* one. The signature is what makes the cookie unforgeable.
 */

const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? '';

export const SESSION_COOKIE = 'dset_session';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12h

export type Role = 'creator' | 'pmo' | 'leadership' | 'publisher' | 'admin';

interface AdminUser {
  username: string;
  password: string;
  role: Role;
  displayName: string;
}

export interface SessionPayload {
  u: string;   // username
  r: Role;     // role
  n: string;   // display name
  exp: number; // epoch ms
}

/**
 * Signing key. Prefer an explicit ADMIN_SESSION_SECRET; otherwise derive one
 * from the admin password so that deployments which have not set the new env
 * var keep working instead of locking every admin out. Either way the key is a
 * server-side secret the attacker does not have. If neither exists we fail
 * closed — no session can be issued or verified.
 */
function sessionSecret(): string {
  const explicit = process.env.ADMIN_SESSION_SECRET;
  if (explicit) return explicit;
  if (ADMIN_PASSWORD) {
    return crypto.createHash('sha256').update(`dset-session:${ADMIN_PASSWORD}`).digest('hex');
  }
  return '';
}

// Additional role-based users for the blog approval workflow, defined via env so no DB
// migration/user-management UI is needed yet:
//   ADMIN_USERS="soubhagya:pass123:leadership:Soubhagya,manas:pass456:pmo:Manas"
// Each entry is username:password:role:displayName (displayName optional).
// The legacy ADMIN_USERNAME/ADMIN_PASSWORD pair keeps working and is treated as role 'admin'.
function loadAdminUsers(): AdminUser[] {
  const users: AdminUser[] = [];
  if (ADMIN_PASSWORD) {
    users.push({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD, role: 'admin', displayName: ADMIN_USERNAME });
  }
  const raw = process.env.ADMIN_USERS ?? '';
  for (const entry of raw.split(',')) {
    const [username, password, role, displayName] = entry.split(':').map(s => s?.trim());
    if (!username || !password || !role) continue;
    if (!['creator', 'pmo', 'leadership', 'publisher', 'admin'].includes(role)) continue;
    users.push({ username, password, role: role as Role, displayName: displayName || username });
  }
  return users;
}

/** Constant-time compare tolerant of unequal lengths. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function validateCredentials(username: string, password: string): AdminUser | null {
  const users = loadAdminUsers();
  // Compare every candidate in constant time so a wrong username and a wrong
  // password are indistinguishable by timing.
  let match: AdminUser | null = null;
  for (const u of users) {
    if (safeEqual(u.username, username) && safeEqual(u.password, password)) match = u;
  }
  return match;
}

/** Mint a signed session cookie value for a validated user. */
export function createSessionToken(user: { username: string; role: Role; displayName: string }): string {
  const secret = sessionSecret();
  if (!secret) throw new Error('Cannot issue a session: ADMIN_SESSION_SECRET / ADMIN_PASSWORD is unset');
  const payload: SessionPayload = {
    u: user.username,
    r: user.role,
    n: user.displayName,
    exp: Date.now() + SESSION_TTL_MS,
  };
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${sig}`;
}

/** Verify a session cookie. Returns the payload, or null if forged/expired/absent. */
export function verifySessionToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const secret = sessionSecret();
  if (!secret) return null;

  const dot = token.lastIndexOf('.');
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const expected = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  if (!safeEqual(expected, sig)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as SessionPayload;
    if (typeof payload.exp !== 'number' || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

/** The Set-Cookie strings for a fresh login. Secure is set in production only (localhost is http). */
export function sessionCookieHeaders(token: string): string[] {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  const maxAge = Math.floor(SESSION_TTL_MS / 1000);
  return [
    `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict${secure}; Max-Age=${maxAge}`,
  ];
}

export function clearSessionCookieHeaders(): string[] {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return [
    `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict${secure}; Max-Age=0`,
    // Retire the old forgeable cookies from any browser still holding them.
    'dset_admin=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0',
    'dset_role=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0',
    'dset_name=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0',
  ];
}

/**
 * Server-side: is this request an authenticated admin?
 * Every admin API route funnels through here, so hardening this one function
 * hardens all of them.
 */
export function isAdminRequest(cookies: Partial<Record<string, string>>): boolean {
  return verifySessionToken(cookies[SESSION_COOKIE]) !== null;
}

/** Server-side: the logged-in user's role, or null. Used by the blog approval workflow. */
export function getRequestRole(cookies: Partial<Record<string, string>>): Role | null {
  return verifySessionToken(cookies[SESSION_COOKIE])?.r ?? null;
}

/** Server-side: the logged-in user's display name (e.g. "Soubhagya"), or null. */
export function getRequestDisplayName(cookies: Partial<Record<string, string>>): string | null {
  return verifySessionToken(cookies[SESSION_COOKIE])?.n ?? null;
}
