import { NextApiRequest, NextApiResponse } from 'next';
import { getAllPostsServer, createPostServer, updatePostServer, deletePostServer, getPostBySlugServer } from '@/lib/blog.server';
import { isAdminRequest } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        if (req.query.slug) {
          const post = await getPostBySlugServer(req.query.slug as string);
          if (!post) {
            return res.status(404).json({ error: 'Post not found' });
          }
          return res.status(200).json(post);
        }
        const posts = await getAllPostsServer();
        return res.status(200).json(posts);

      case 'POST':
        if (!isAdminRequest(req.cookies)) return res.status(401).json({ error: 'Unauthorized' });
        const newPost = await createPostServer(req.body);
        try {
          await res.revalidate('/blog');
          if (newPost?.slug) await res.revalidate(`/blog/${newPost.slug}`);
        } catch {}
        return res.status(201).json(newPost);

      case 'PUT':
        if (!isAdminRequest(req.cookies)) return res.status(401).json({ error: 'Unauthorized' });
        const { id: updateId } = req.query;
        const updatedPost = await updatePostServer(updateId as string, req.body);
        if (!updatedPost) {
          return res.status(404).json({ error: 'Post not found' });
        }
        try {
          await res.revalidate('/blog');
          if (updatedPost.slug) await res.revalidate(`/blog/${updatedPost.slug}`);
        } catch {}
        return res.status(200).json(updatedPost);

      case 'DELETE':
        if (!isAdminRequest(req.cookies)) return res.status(401).json({ error: 'Unauthorized' });
        const { id } = req.query;
        const deletedSlug = await deletePostServer(id as string);
        try {
          await res.revalidate('/blog');
          if (deletedSlug) await res.revalidate(`/blog/${deletedSlug}`);
        } catch {}
        return res.status(200).json({ success: !!deletedSlug });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Blog API Error:', error);
    const detail = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ error: detail });
  }
}