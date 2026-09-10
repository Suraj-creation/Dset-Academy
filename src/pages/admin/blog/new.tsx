import { useState, useEffect } from 'react';
import { withAuth } from '@/components/auth/withAuth';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { getAllAuthors, type Author } from '@/lib/authors';

const BlogEditor = dynamic(() => import('@/components/admin/BlogEditor'), { ssr: false });

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

const NewBlogPost = () => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [publishDateTime, setPublishDateTime] = useState(() => {
    const d = new Date(); d.setSeconds(0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [contributors, setContributors] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [authorId, setAuthorId] = useState('');
  const [aiGenerated, setAiGenerated] = useState<'no' | 'partially' | 'yes'>('no');

  useEffect(() => {
    getAllAuthors().then(list => setAuthors(list.filter(a => a.isActive))).catch(() => {});
  }, []);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugEdited) setSlug(slugify(val));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const [submitAfterSave, setSubmitAfterSave] = useState(false);

  const handleSave = async (submitForReviewAfter: boolean) => {
    if (!title.trim()) { alert('Title is required.'); return; }
    setLoading(true);
    setSubmitAfterSave(submitForReviewAfter);
    try {
      let imageUrl = '';
      if (image) {
        const fd = new FormData();
        fd.append('image', image);
        const r = await fetch('/api/upload', { method: 'POST', body: fd });
        if (!r.ok) throw new Error('Image upload failed');
        imageUrl = (await r.json()).url;
      }

      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          subtitle: subtitle.trim(),
          content,
          imageUrl,
          publishedAt: new Date(publishDateTime).toISOString(),
          author: authors.find(a => a.id === authorId)?.name || 'DSeT Consulting',
          authorId: authorId || null,
          contributors: contributors.split(',').map(c => c.trim()).filter(Boolean),
          aiGenerated,
          status: 'draft',
          tags: selectedTags.map(id => PRESET_TAGS.find(t => t.id === id)).filter(Boolean),
          metaDescription: metaDescription.trim(),
          slug: slug.trim() || slugify(title),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`${res.status}: ${err.error || 'Server error'}`);
      }
      const created = await res.json();

      if (submitForReviewAfter) {
        const reviewRes = await fetch(`/api/blog/review?id=${created.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'submit' }),
        });
        if (!reviewRes.ok) {
          const err = await reviewRes.json().catch(() => ({}));
          throw new Error(`Saved as draft, but couldn't submit for review: ${err.error || reviewRes.status}`);
        }
      }
      router.push('/admin/blog');
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Error saving post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const metaLen = metaDescription.length;

  return (
    <>
      <Head><title>New Post — DSeT Admin</title></Head>
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
            <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
              {title || 'New Post'}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => handleSave(false)}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {loading && !submitAfterSave ? 'Saving…' : 'Save Draft'}
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading && submitAfterSave ? 'Submitting…' : 'Submit for PMO Review'}
            </button>
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
              onChange={(e) => handleTitleChange(e.target.value)}
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
            <SidebarCard title="Approval Workflow">
              <div className="space-y-1.5 text-xs text-gray-500">
                <p>Draft → PMO/BA Review → Leadership Review → Ready to Publish.</p>
                <p>Save as draft to keep editing, or submit straight to PMO/BA review.</p>
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
              <p className="mt-2 text-xs text-gray-400">Used once the post is approved and published/scheduled.</p>
            </SidebarCard>

            {/* Featured Image */}
            <SidebarCard title="Featured Image">
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="" className="w-full h-36 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => { setImage(null); setImagePreview(''); }}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
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

            {/* Author */}
            <SidebarCard title="Author">
              <select
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              >
                <option value="">DSeT Consulting (default)</option>
                {authors.map(a => (
                  <option key={a.id} value={a.id}>{a.name}{a.designation ? ` — ${a.designation}` : ''}</option>
                ))}
              </select>
              {authors.length === 0 && (
                <p className="mt-1.5 text-[11px] text-gray-400">
                  No author profiles yet. <Link href="/admin/authors" className="text-blue-600 hover:underline">Add one</Link>.
                </p>
              )}
            </SidebarCard>

            {/* Contributors */}
            <SidebarCard title="Contributors">
              <input
                type="text"
                value={contributors}
                onChange={(e) => setContributors(e.target.value)}
                placeholder="e.g. Ajay, Hemant, Rakshi"
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              />
              <p className="mt-1.5 text-[11px] text-gray-400">Comma-separated names. Shown alongside the author on the published post.</p>
            </SidebarCard>

            {/* AI-generated content declaration */}
            <SidebarCard title="AI-Generated Content">
              <select
                value={aiGenerated}
                onChange={(e) => setAiGenerated(e.target.value as 'no' | 'partially' | 'yes')}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              >
                <option value="no">No — fully human-written</option>
                <option value="partially">Partially — AI-assisted</option>
                <option value="yes">Yes — primarily AI-generated</option>
              </select>
              <p className="mt-1.5 text-[11px] text-gray-400">Self-declared by you. A disclaimer badge shows on the published post if not &quot;No&quot;.</p>
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
                    onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }}
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

export default withAuth(NewBlogPost);
