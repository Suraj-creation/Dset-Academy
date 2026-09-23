import crypto from 'crypto';
import { eq, sql } from 'drizzle-orm';
import { db } from './db';
import { academyUsers } from './schema';

/**
 * SERVER-ONLY. Google sign-in for /academy visitors — entirely separate from the admin
 * session in src/lib/auth.ts (different cookie, different secret, different table).
 *
 * The browser gets a Google ID token from Google Identity Services and posts it here;
 * we verify it with Google, upsert the visitor, and issue our own signed HttpOnly cookie
 * so later requests (brochure view/download) never have to trust the browser.
 */

export const ACADEMY_COOKIE = 'dset_academy_user';
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export type AcademyUserRow = typeof academyUsers.$inferSelect;

export interface AcademyPublicUser {
  name: string | null;
  email: string;
  picture: string | null;
}

interface TokenPayload {
  id: string;  // academy_users.id
  exp: number; // epoch ms
}

interface GoogleClaims {
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
  givenName: string | null;
  familyName: string | null;
  picture: string | null;
  locale: string | null;
  hostedDomain: string | null;
}

export function googleClientId(): string {
  return process.env.GOOGLE_CLIENT_ID ?? '';
}

// Fail closed: with no secret, no session can be issued or verified.
function secret(): string {
  return process.env.ACADEMY_AUTH_SECRET ?? '';
}

/**
 * Verify a Google ID token. tokeninfo checks the signature and expiry on Google's side;
 * we still check the audience ourselves, or a token minted for any other site would pass.
 * ponytail: one network hop per sign-in via tokeninfo; switch to local JWKS verification
 * if sign-in volume ever makes this a latency or quota problem.
 */
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleClaims | null> {
  const clientId = googleClientId();
  if (!clientId || !idToken) return null;

  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
  if (!res.ok) return null;
  const c = await res.json() as Record<string, string | undefined>;

  if (c.aud !== clientId) return null;
  if (c.iss !== 'accounts.google.com' && c.iss !== 'https://accounts.google.com') return null;
  if (!c.sub || !c.email || Number(c.exp) * 1000 < Date.now()) return null;

  return {
    sub: c.sub,
    email: c.email.toLowerCase(),
    emailVerified: c.email_verified === 'true',
    name: c.name ?? null,
    givenName: c.given_name ?? null,
    familyName: c.family_name ?? null,
    picture: c.picture ?? null,
    locale: c.locale ?? null,
    hostedDomain: c.hd ?? null,
  };
}

/** Insert on first sign-in; refresh profile, bump login_count and last_seen_at after that. */
export async function upsertAcademyUser(g: GoogleClaims): Promise<AcademyUserRow> {
  const profile = {
    email: g.email,
    emailVerified: g.emailVerified,
    fullName: g.name,
    givenName: g.givenName,
    familyName: g.familyName,
    pictureUrl: g.picture,
    locale: g.locale,
    hostedDomain: g.hostedDomain,
  };
  const [row] = await db.insert(academyUsers)
    .values({ id: `ausr_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`, googleSub: g.sub, ...profile })
    .onConflictDoUpdate({
      target: academyUsers.googleSub,
      set: { ...profile, loginCount: sql`${academyUsers.loginCount} + 1`, lastSeenAt: sql`now()` },
    })
    .returning();
  return row;
}

function sign(body: string): string {
  return crypto.createHmac('sha256', secret()).update(body).digest('base64url');
}

export function createAcademyToken(userId: string): string {
  if (!secret()) throw new Error('ACADEMY_AUTH_SECRET is unset — cannot issue an academy session');
  const body = Buffer.from(JSON.stringify({ id: userId, exp: Date.now() + TTL_MS } satisfies TokenPayload)).toString('base64url');
  return `${body}.${sign(body)}`;
}

function verifyAcademyToken(token: string | undefined): TokenPayload | null {
  if (!token || !secret()) return null;
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const given = Buffer.from(token.slice(dot + 1));
  const expected = Buffer.from(sign(body));
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as TokenPayload;
    return typeof p.exp === 'number' && Date.now() < p.exp && typeof p.id === 'string' ? p : null;
  } catch {
    return null;
  }
}

/** The signed-in visitor for this request, or null. Hits the DB so a deleted user is logged out. */
export async function getAcademyUser(cookies: Partial<Record<string, string>>): Promise<AcademyUserRow | null> {
  const p = verifyAcademyToken(cookies[ACADEMY_COOKIE]);
  if (!p) return null;
  const [row] = await db.select().from(academyUsers).where(eq(academyUsers.id, p.id)).limit(1);
  return row ?? null;
}

export function toPublicUser(u: AcademyUserRow): AcademyPublicUser {
  return { name: u.fullName, email: u.email, picture: u.pictureUrl };
}

// Lax, not Strict: a visitor arriving from a shared link must still be recognised.
export function academyCookieHeader(token: string): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${ACADEMY_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax${secure}; Max-Age=${Math.floor(TTL_MS / 1000)}`;
}

export function clearAcademyCookieHeader(): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${ACADEMY_COOKIE}=; Path=/; HttpOnly; SameSite=Lax${secure}; Max-Age=0`;
}
