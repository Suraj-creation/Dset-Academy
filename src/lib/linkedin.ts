import { eq } from 'drizzle-orm';
import { db } from './db';
import { appSettings } from './schema';

const CLIENT_ID     = process.env.LINKEDIN_CLIENT_ID!;
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET!;
const COMPANY_ID    = process.env.LINKEDIN_COMPANY_ID!;
const BASE_URL      = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://dsetconsulting.com';
export const REDIRECT_URI = `${BASE_URL}/api/auth/linkedin/callback`;

export function getAuthUrl(): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: 'w_member_social w_organization_social',
    state: 'dset-linkedin',
  });
  return `https://www.linkedin.com/oauth/v2/authorization?${params}`;
}

export async function exchangeCodeForToken(code: string): Promise<{ token: string | null; error?: string }> {
  const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });
  const data = await res.json();
  if (data.access_token) return { token: data.access_token };
  return { token: null, error: data.error_description ?? data.error ?? `HTTP ${res.status}` };
}

export async function getLinkedInToken(): Promise<string | null> {
  try {
    const rows = await db.select().from(appSettings).where(eq(appSettings.key, 'linkedin_access_token'));
    return rows[0]?.value ?? null;
  } catch {
    return null;
  }
}

export async function saveLinkedInToken(token: string): Promise<void> {
  await db.insert(appSettings)
    .values({ key: 'linkedin_access_token', value: token })
    .onConflictDoUpdate({ target: appSettings.key, set: { value: token } });
}

export async function postBlogToLinkedIn(post: {
  title: string;
  slug: string;
  metaDescription?: string | null;
}): Promise<boolean> {
  const token = await getLinkedInToken();
  if (!token || !COMPANY_ID) return false;

  const url = `${BASE_URL}/blog/${post.slug}`;
  const commentary = `${post.title}\n\n${post.metaDescription ?? ''}\n\nRead more → ${url}\n\n#DSeT #DigitalTransformation #AI #Strategy`;

  const body = {
    author: `urn:li:organization:${COMPANY_ID}`,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text: commentary },
        shareMediaCategory: 'ARTICLE',
        media: [{
          status: 'READY',
          originalUrl: url,
          title: { text: post.title },
          ...(post.metaDescription ? { description: { text: post.metaDescription } } : {}),
        }],
      },
    },
    visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
  };

  const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(body),
  });

  return res.status === 201;
}
