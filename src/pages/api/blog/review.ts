import { NextApiRequest, NextApiResponse } from 'next';
import { reviewPostServer, getAllPostsServer } from '@/lib/blog.server';
import { getRequestRole, getRequestDisplayName } from '@/lib/auth';

// Which role is allowed to act on a post sitting at a given status.
// 'admin' can always act (same unrestricted access the single admin login always had).
const SUBMIT_ALLOWED: Record<string, string[]> = {
  draft: ['creator', 'admin'],
};
const REVIEW_ALLOWED: Record<string, string[]> = {
  pmo_review: ['pmo', 'admin'],
  leadership_review: ['leadership', 'admin'],
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const role = getRequestRole(req.cookies);
  if (!role) return res.status(401).json({ error: 'Unauthorized' });
  // Falls back to the role label for legacy sessions with no dset_name cookie set.
  const actorName = getRequestDisplayName(req.cookies) || role;

  const id = req.query.id as string;
  if (!id) return res.status(400).json({ error: 'Missing post id' });

  const { action, comment } = req.body ?? {};
  if (action !== 'submit' && action !== 'approve' && action !== 'refer_back' && action !== 'reject_permanently') {
    return res.status(400).json({ error: 'action must be submit, approve, refer_back, or reject_permanently' });
  }
  if ((action === 'refer_back' || action === 'reject_permanently') && !comment?.trim()) {
    return res.status(400).json({ error: 'A comment is required when referring back or rejecting a post' });
  }

  try {
    const posts = await getAllPostsServer();
    const post = posts.find(p => p.id === id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const allowedRoles = action === 'submit' ? SUBMIT_ALLOWED[post.status] : REVIEW_ALLOWED[post.status];
    if (!allowedRoles) {
      return res.status(409).json({ error: `Post status "${post.status}" does not accept this action` });
    }
    if (role !== 'admin' && !allowedRoles.includes(role)) {
      return res.status(403).json({ error: `Your role (${role}) cannot ${action} a post at this stage` });
    }

    const updated = await reviewPostServer(id, action, actorName, comment);
    if (!updated) return res.status(404).json({ error: 'Post not found' });

    return res.status(200).json(updated);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ error: detail });
  }
}
