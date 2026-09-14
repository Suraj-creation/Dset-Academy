// Buffer GraphQL API integration — pushes a published blog post into Buffer as a DRAFT
// (saveToDraft: true) for LinkedIn. It does NOT auto-share — someone still has to open the
// Buffer app and click "Share Now" (or schedule it). This is deliberate: the approval chain
// already covers the content decision, Buffer is only used here as a queue/handoff so a
// human does the final social-posting action.
//
// Setup required before this works (see BUFFER_ACCESS_TOKEN / channel id below):
//   1. Create a free Buffer account, connect the LinkedIn Company Page.
//   2. Get an API access token at https://publish.buffer.com/settings/api
//   3. Query the `channels` GraphQL endpoint (or Buffer's UI) to find the LinkedIn channelId.
// Both go into env vars — nothing is hardcoded.

const BUFFER_API_URL = 'https://api.buffer.com';
const ACCESS_TOKEN = process.env.BUFFER_ACCESS_TOKEN;
const LINKEDIN_CHANNEL_ID = process.env.BUFFER_LINKEDIN_CHANNEL_ID;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://dsetconsulting.com';

interface BufferPostResult {
  channel: 'linkedin';
  ok: boolean;
  postId?: string;
  error?: string;
}

async function createDraftPost(channelId: string, text: string): Promise<{ ok: boolean; postId?: string; error?: string }> {
  const query = `
    mutation CreateDraftPost($input: CreatePostInput!) {
      createPost(input: $input) {
        ... on PostActionSuccess {
          post { id }
        }
        ... on MutationError {
          message
        }
      }
    }
  `;

  const res = await fetch(BUFFER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      query,
      variables: {
        input: {
          text,
          channelId,
          schedulingType: 'automatic',
          mode: 'addToQueue',
          saveToDraft: true,
        },
      },
    }),
  });

  const data = await res.json().catch(() => null);
  const result = data?.data?.createPost;

  if (result?.post?.id) return { ok: true, postId: result.post.id };
  const message = result?.message || data?.errors?.[0]?.message || `HTTP ${res.status}`;
  return { ok: false, error: message };
}

/**
 * Sends a published blog post to Buffer as a draft on the LinkedIn channel, if configured.
 * Returns an empty array (no-op) when Buffer isn't set up yet, so publishing never breaks.
 */
export async function sendPostToBuffer(post: {
  title: string;
  slug: string;
  metaDescription?: string | null;
}): Promise<BufferPostResult[]> {
  if (!ACCESS_TOKEN || !LINKEDIN_CHANNEL_ID) return [];

  const url = `${BASE_URL}/blog/${post.slug}`;
  const text = `${post.title}\n\n${post.metaDescription ?? ''}\n\nRead more → ${url}\n\n#DSeT #DigitalTransformation #AI #Strategy`;

  const outcome = await createDraftPost(LINKEDIN_CHANNEL_ID, text);
  return [{ channel: 'linkedin', ...outcome }];
}
