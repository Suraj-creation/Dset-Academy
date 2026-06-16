import { useState, useEffect } from 'react';
import Head from 'next/head';
import { getAllPosts, deletePost } from '@/lib/blog';
import { useAuth } from '@/context/AuthContext';
import { withAuth } from '@/components/auth/withAuth';
import Link from 'next/link';

interface BlogPost {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  imageUrl: string;
  publishedAt: string;
  author: string;
  status: 'draft' | 'published' | 'scheduled';
  tags: Array<{ id: string; name: string; color: string }>;
  metaDescription?: string;
  slug: string;
}

const AdminBlog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'scheduled'>('all');
  const [deleting, setDeleting] = useState<string | null>(null);
  const { logout } = useAuth();

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      setPosts(await getAllPosts());
    } catch {
      // stays empty
    }
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    setDeleting(postId);
    try {
      await deletePost(postId);
      await fetchPosts();
    } catch {
      alert('Failed to delete post.');
    } finally {
      setDeleting(null);
    }
  };

  const filtered = posts.filter(p =>
    (statusFilter === 'all' || p.status === statusFilter) &&
    (p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (p.subtitle ?? '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const published = posts.filter(p => p.status === 'published').length;
  const drafts = posts.filter(p => p.status === 'draft').length;
  const scheduled = posts.filter(p => p.status === 'scheduled').length;

  return (
    <>
      <Head><title>Blog — DSeT Admin</title></Head>
      <div className="min-h-screen bg-[#f9fafb]">

        {/* ── Top bar ──────────────────────────────────────────── */}
        <div className="bg-white border-b border-gray-200 px-5 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <Link href="/admin" className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-lg font-bold text-gray-900">Blog Posts</h1>
              <nav className="hidden md:flex items-center gap-0.5 ml-2">
                {[
                  { label: 'Events', href: '/admin/events' },
                  { label: 'Careers', href: '/admin/careers' },
                  { label: 'Leads', href: '/admin/leads' },
                  { label: 'Contacts', href: '/admin/contacts' },
                ].map(l => (
                  <Link key={l.href} href={l.href} className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                href="/admin/blog/new"
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Post
              </Link>
              <button
                onClick={() => { logout(); }}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-5 py-6 space-y-5">

          {/* ── Stats row ────────────────────────────────────────── */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Total Posts', value: posts.length, color: 'text-gray-900' },
              { label: 'Published', value: published, color: 'text-green-600' },
              { label: 'Scheduled', value: scheduled, color: 'text-purple-600' },
              { label: 'Drafts', value: drafts, color: 'text-amber-600' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{s.label}</p>
                <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* ── Filters ──────────────────────────────────────────── */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search posts…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              />
            </div>
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
              {(['all', 'published', 'scheduled', 'draft'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${statusFilter === s ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  {s === 'all' ? 'All' : s === 'published' ? 'Published' : s === 'scheduled' ? 'Scheduled' : 'Drafts'}
                </button>
              ))}
            </div>
          </div>

          {/* ── Post list ────────────────────────────────────────── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {filtered.length === 0 ? (
              <div className="py-16 text-center">
                <svg className="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm text-gray-400">
                  {searchTerm || statusFilter !== 'all' ? 'No posts match your filters.' : 'No posts yet. Create your first post!'}
                </p>
                {!searchTerm && statusFilter === 'all' && (
                  <Link href="/admin/blog/new" className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                    Create Post
                  </Link>
                )}
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {filtered.map((post) => (
                  <li key={post.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group">
                    {/* Thumbnail */}
                    {post.imageUrl ? (
                      <img src={post.imageUrl} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0 bg-gray-100" />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                        </svg>
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900 truncate">{post.title}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide flex-shrink-0 ${post.status === 'published' ? 'bg-green-100 text-green-700' : post.status === 'scheduled' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'}`}>
                          {post.status === 'scheduled' ? `Scheduled` : post.status}
                        </span>
                      </div>
                      {post.subtitle && (
                        <p className="text-xs text-gray-400 truncate mt-0.5">{post.subtitle}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="text-xs text-gray-400">
                          {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <div className="flex gap-1 flex-wrap">
                          {post.tags?.slice(0, 3).map(tag => (
                            <span
                              key={tag.id}
                              className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                              style={{ backgroundColor: `${tag.color}18`, color: tag.color }}
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Preview"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Link>
                      <Link
                        href={`/admin/blog/edit?id=${post.id}`}
                        className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
                        disabled={deleting === post.id}
                        className="px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
                      >
                        {deleting === post.id ? '…' : 'Delete'}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default withAuth(AdminBlog);
