import { useState, useEffect } from 'react';
import { withAuth } from '@/components/auth/withAuth';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';

const BlogEditor = dynamic(() => import('@/components/admin/BlogEditor'), { ssr: false });

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

const PRESET_TAGS = [
  { id: 'ai', name: 'AI & ML', color: '#2563eb' },
  { id: 'digital-transformation', name: 'Digital Transformation', color: '#7c3aed' },
  { id: 'business', name: 'Business Strategy', color: '#059669' },
  { id: 'leadership', name: 'Leadership', color: '#dc2626' },
  { id: 'technology', name: 'Technology', color: '#0891b2' },
  { id: 'innovation', name: 'Innovation', color: '#d97706' },
];

function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const EditBlogPost = () => {
  const router = useRouter();
  const id = router.query.id as string | undefined;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [publishDateTime, setPublishDateTime] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [metaDescription, setMetaDescription] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'scheduled'>('draft');
  const [slug, setSlug] = useState('');
  const [fetchLoading, setFetchLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      try {
        const posts = await getAllPosts();
        const found = posts.find(p => p.id === id);
        if (!found) { router.push('/admin/blog'); return; }
        setPost(found);
        setTitle(found.title);
        setSubtitle(found.subtitle || '');
        setContent(found.content);
        setPublishDateTime(found.publishedAt.slice(0, 16));
        setImagePreview(found.imageUrl);
        setSelectedTags(found.tags?.map(t => t.id) || []);
        setMetaDescription(found.metaDescription || '');
        setStatus(found.status);
        setSlug(found.slug);
      } catch {
        router.push('/admin/blog');
      } finally {
        setFetchLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const isFuture = publishDateTime ? new Date(publishDateTime) > new Date() : false;

  const handleSave = async (saveAs: 'draft' | 'published' | 'scheduled') => {
    if (!title.trim()) { alert('Title is required.'); return; }
    setLoading(true);
    try {
      let imageUrl = post?.imageUrl || '';
      if (image) {
        const fd = new FormData();
        fd.append('image', image);
        const r = await fetch('/api/upload', { method: 'POST', body: fd });
        if (!r.ok) throw new Error('Image upload failed');
        imageUrl = (await r.json()).url;
      }

      const res = await fetch(`/api/blog?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...post,
          title: title.trim(),
          subtitle: subtitle.trim() || null,
          content,
          imageUrl,
          publishedAt: new Date(publishDateTime).toISOString(),
          status: saveAs,
          tags: selectedTags.map(tid => PRESET_TAGS.find(t => t.id === tid)).filter(Boolean),
          metaDescription: metaDescription.trim() || null,
          slug: slug.trim() || slugify(title),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`${res.status}: ${err.error || 'Server error'}`);
      }
      router.push('/admin/blog');
    } catch (err) {
      console.error(err);
      alert('Error saving post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const metaLen = metaDescription.length;

  if (fetchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9fafb]">
        <div className="text-gray-400 text-sm">Loading post…</div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <>
      <Head><title>Edit Post — DSeT Admin</title></Head>
      <div className="min-h-screen bg-[#f9fafb] flex flex-col">

        {/* ── Sticky top bar ─────────────────────────────────────── */}
        <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/admin/blog" className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <span className="text-sm text-gray-400 hidden sm:block">Blog Posts</span>
            <span className="text-gray-300 hidden sm:block">/</span>
            <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">{title}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {status === 'published' ? 'Published' : 'Draft'}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href={`/blog/${slug}`}
              target="_blank"
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors hidden sm:flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Preview
            </Link>
            <button
              onClick={() => handleSave('draft')}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Save Draft
            </button>
            {isFuture ? (
              <button
                onClick={() => handleSave('scheduled')}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Scheduling…' : 'Schedule'}
              </button>
            ) : (
              <button
                onClick={() => handleSave(status)}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Saving…' : 'Update'}
              </button>
            )}
          </div>
        </div>

        {/* ── Main layout ─────────────────────────────────────────── */}
        <div className="flex flex-1 max-w-7xl mx-auto w-full px-5 py-8 gap-7 items-start">

          {/* Left: writing area */}
          <div className="flex-1 min-w-0 bg-white rounded-xl border border-gray-200 shadow-sm p-8 space-y-4">
            <input
              type="text"
              placeholder="Post title…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-3xl font-bold text-gray-900 placeholder-gray-300 bg-transparent border-0 outline-none focus:ring-0 leading-snug"
            />
            <input
              type="text"
              placeholder="Subtitle (optional)"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full text-base text-gray-500 placeholder-gray-300 bg-transparent border-0 outline-none focus:ring-0"
            />
            <div className="border-t border-gray-100 pt-4">
              <BlogEditor value={content} onChange={setContent} />
            </div>
          </div>

          {/* Right: sidebar */}
          <div className="w-[268px] flex-shrink-0 space-y-4">

            {/* Status */}
            <SidebarCard title="Status">
              <div className="space-y-1">
                {(['draft', 'published'] as const).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${status === s ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s === 'published' ? 'bg-green-500' : 'bg-amber-400'}`} />
                    {s === 'published' ? 'Published' : 'Draft'}
                    {status === s && (
                      <svg className="w-3.5 h-3.5 ml-auto text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </SidebarCard>

            {/* Publish Date & Time */}
            <SidebarCard title="Publish Date & Time">
              <input
                type="datetime-local"
                value={publishDateTime}
                onChange={(e) => setPublishDateTime(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              />
              {isFuture && (
                <p className="mt-2 text-xs text-purple-600 font-medium">Will auto-publish at scheduled time</p>
              )}
            </SidebarCard>

            {/* Featured Image */}
            <SidebarCard title="Featured Image">
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="" className="w-full h-36 object-cover rounded-lg" />
                  <label className="absolute bottom-2 right-2 bg-white rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors border border-gray-200">
                    Change
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                  <svg className="w-6 h-6 text-gray-300 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs text-gray-400">Click to upload image</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              )}
            </SidebarCard>

            {/* Tags */}
            <SidebarCard title="Tags">
              <div className="space-y-1">
                {PRESET_TAGS.map(tag => {
                  const active = selectedTags.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => setSelectedTags(prev =>
                        active ? prev.filter(i => i !== tag.id) : [...prev, tag.id]
                      )}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors text-left ${active ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color }} />
                      {tag.name}
                      {active && (
                        <svg className="w-3.5 h-3.5 ml-auto text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </SidebarCard>

            {/* SEO */}
            <SidebarCard title="SEO">
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">URL Slug</label>
                  <div className="text-xs text-gray-400 mb-1 font-mono truncate">/blog/{slug || '…'}</div>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="post-url-slug"
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 font-mono"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs text-gray-500">Meta Description</label>
                    <span className={`text-xs font-medium ${metaLen > 160 ? 'text-red-500' : metaLen > 140 ? 'text-amber-500' : 'text-gray-400'}`}>
                      {metaLen}/160
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Brief summary for search engines…"
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-700"
                  />
                </div>
              </div>
            </SidebarCard>

          </div>
        </div>
      </div>
    </>
  );
};

function SidebarCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{title}</p>
      {children}
    </div>
  );
}

export default withAuth(EditBlogPost);
