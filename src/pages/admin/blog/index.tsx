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
  status: 'draft' | 'published';
  tags: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  metaDescription?: string;
  slug: string;
}

const AdminBlog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const { logout } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const postsData = await getAllPosts();
      setPosts(postsData);
    } catch {
      // posts stays empty on error
    }
  };

  const handleDelete = async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(postId);
        await fetchPosts();
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    setPosts([]);
  };

  return (
    <>
      <Head>
        <title>Blog Admin | DSeT Consulting</title>
      </Head>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-6">
              <h1 className="text-3xl font-bold text-gray-900">Blog Posts</h1>
              <nav className="hidden sm:flex items-center gap-1">
                <Link href="/admin/events"  className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors">Events</Link>
                <span className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-900 bg-gray-100">Blog</span>
                <Link href="/admin/careers" className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors">Careers</Link>
                <Link href="/admin/leads"   className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors">Leads</Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/admin/blog/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create New Post
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <input
                type="text"
                placeholder="Search posts..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">All Posts</option>
                <option value="published">Published</option>
                <option value="draft">Drafts</option>
              </select>
            </div>
            <div>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
              >
                <option value="">All Tags</option>
                {Array.from(new Set(posts.flatMap(post => post.tags?.map(tag => tag.id) || []))).map(tagId => {
                  const tag = posts.find(post => post.tags?.find(t => t.id === tagId))?.tags?.find(t => t.id === tagId);
                  return tag ? (
                    <option key={tag.id} value={tag.id}>{tag.name}</option>
                  ) : null;
                })}
              </select>
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              {posts
                .filter(post => 
                  (statusFilter === 'all' || post.status === statusFilter) &&
                  (selectedTag === '' || post.tags?.some(tag => tag.id === selectedTag)) &&
                  (post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   post.content.toLowerCase().includes(searchTerm.toLowerCase()))
                )
                .map((post) => (
                <li key={post.id}>
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {post.title}
                          </h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            post.status === 'published' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {post.status === 'published' ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-4">
                          <p className="text-sm text-gray-500">
                            {new Date(post.publishedAt).toLocaleDateString()}
                          </p>
                          <div className="flex gap-1">
                            {post.tags?.map(tag => (
                              <span
                                key={tag.id}
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                                style={{
                                  backgroundColor: `${tag.color}20`,
                                  color: tag.color
                                }}
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Preview
                        </Link>
                        <Link
                          href={`/admin/blog/edit/${post.id}`}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
              {posts.length === 0 && (
                <li className="px-4 py-8 text-center text-gray-500">
                  No blog posts yet. Create your first post!
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default withAuth(AdminBlog);