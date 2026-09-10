export type BlogStatus =
  | 'draft'
  | 'pmo_review'
  | 'leadership_review'
  | 'ready_to_publish'
  | 'scheduled'
  | 'published'
  | 'rejected_permanently';

// Self-declared by the Creator, not an automated detector.
export type AiGenerated = 'no' | 'partially' | 'yes';

export interface BlogPost {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  imageUrl: string;
  publishedAt: string;
  author: string;
  authorId?: string | null;
  // Additional people who contributed to the post, shown alongside the author (not instead of it)
  contributors?: string[];
  aiGenerated?: AiGenerated;
  status: BlogStatus;
  tags: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  metaDescription?: string;
  slug: string;
  // Approval workflow (all optional — older posts won't have these set)
  submittedBy?: string | null;
  reviewComment?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
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

/** Submit a draft for PMO/BA review, or move a post to the next review stage. */
export async function submitForReview(id: string): Promise<BlogPost> {
  const response = await fetch(`/api/blog/review?id=${encodeURIComponent(id)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'submit' }),
  });
  if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || 'Failed to submit for review');
  return response.json();
}

/** Approve a post at whatever review stage it's currently at. */
export async function approvePost(id: string, comment?: string): Promise<BlogPost> {
  const response = await fetch(`/api/blog/review?id=${encodeURIComponent(id)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'approve', comment }),
  });
  if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || 'Failed to approve');
  return response.json();
}

/** Refer a post back to the creator for changes — sends it back to draft with a comment. */
export async function referBackPost(id: string, comment: string): Promise<BlogPost> {
  const response = await fetch(`/api/blog/review?id=${encodeURIComponent(id)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'refer_back', comment }),
  });
  if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || 'Failed to refer back');
  return response.json();
}

/** Permanently reject a post — it will never be published, regardless of edits. */
export async function rejectPostPermanently(id: string, comment: string): Promise<BlogPost> {
  const response = await fetch(`/api/blog/review?id=${encodeURIComponent(id)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'reject_permanently', comment }),
  });
  if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || 'Failed to reject');
  return response.json();
}
