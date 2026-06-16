export interface BlogPost {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  imageUrl: string;
  publishedAt: string;
  author: string;
  status: 'draft' | 'published' | 'scheduled';
  tags: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  metaDescription?: string;
  slug: string;
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const response = await fetch('/api/blog');
  if (!response.ok) throw new Error('Failed to fetch posts');
  return response.json();
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const posts = await getAllPosts();
  return posts
    .filter(post => post.status === 'published')
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const response = await fetch(`/api/blog?slug=${encodeURIComponent(slug)}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('Failed to fetch post');
  }
  return response.json();
}

export async function createPost(post: Omit<BlogPost, 'id'>): Promise<BlogPost> {
  const response = await fetch('/api/blog', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(post),
  });
  
  if (!response.ok) throw new Error('Failed to create post');
  return response.json();
}

export async function deletePost(id: string): Promise<boolean> {
  const response = await fetch(`/api/blog?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) throw new Error('Failed to delete post');
  return response.json().then(data => data.success);
}