import { NextApiRequest, NextApiResponse } from 'next';
import { autoPublishDuePostsServer } from '@/lib/blog.server';
import { postBlogToLinkedIn } from '@/lib/linkedin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).end('Method Not Allowed');
  }

  const secret = req.headers['x-cron-secret'] ?? req.query.secret;
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { count, posts } = await autoPublishDuePostsServer();

    if (posts.length > 0) {
      // Refresh the ISR cache so newly-published posts stop 404ing
      try {
        await res.revalidate('/blog');
        for (const post of posts) {
          await res.revalidate(`/blog/${post.slug}`);
        }
      } catch {}

      // Post each newly published blog to LinkedIn (fire-and-forget)
      for (const post of posts) {
        postBlogToLinkedIn(post).catch(() => {});
      }
    }

    return res.status(200).json({ published: count, timestamp: new Date().toISOString() });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
}
