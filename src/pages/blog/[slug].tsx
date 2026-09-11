import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { getPublishedPostsServer, getPostBySlugServer } from '@/lib/blog.server';
import { getAllAuthorsServer } from '@/lib/authors.server';
import type { Author } from '@/lib/authors';
import { format } from 'date-fns';
import sanitizeHtml from 'sanitize-html';
import Layout from '@/components/layout/Layout';

interface BlogPost {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  imageUrl: string;
  publishedAt: string;
  author: string;
  authorId?: string | null;
  contributors?: string[];
  aiGenerated?: 'no' | 'partially' | 'yes';
  status: 'draft' | 'published';
  tags: Array<{ id: string; name: string; color: string }>;
  metaDescription?: string;
  slug: string;
}

interface Props {
  post: BlogPost;
  author: Author | null;
  preview?: boolean;
}

function readTime(content: string): number {
  const text = content.replace(/<[^>]*>/g, '');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

const PLATFORM_CTAS: Record<string, { headline: string; sub: string; cta: string; href: string }> = {
  medicsiq: {
    headline: 'See MedicsIQ™ in a Clinical Workflow',
    sub: 'A 30-minute demo mapped to your operational environment — not a generic slide deck.',
    cta: 'Book a MedicsIQ™ Demo',
    href: '/contact?type=demo&platform=medicsiq',
  },
  voiceops: {
    headline: 'Watch VoiceOps Handle a Live Call',
    sub: 'See AI-powered voice automation in action — from outbound collections to appointment scheduling.',
    cta: 'Book a VoiceOps Demo',
    href: '/contact?type=demo&platform=voiceops',
  },
  orebill: {
    headline: 'See OreBill AI™ on Real Revenue Data',
    sub: 'A focused walkthrough of how OreBill AI™ transforms billing operations at scale.',
    cta: 'Book an OreBill AI™ Demo',
    href: '/contact?type=demo&platform=orebill',
  },
  manufacturing: {
    headline: 'See IT-OT Unification on Real Factory Data',
    sub: 'Understand how KOPL Intelligence bridges your production and business systems — live.',
    cta: 'Book a Manufacturing Demo',
    href: '/contact?type=demo&platform=manufacturing',
  },
};

const DEFAULT_CTA = {
  headline: 'See These Platforms in Action',
  sub: 'A 30-minute strategic demo — mapped to your operational environment, not a generic slide deck.',
  cta: 'Book a Strategic Demo',
  href: '/contact?type=demo',
};

function getCTA(tags: BlogPost['tags']) {
  const tagNames = tags.map(t => t.name.toLowerCase());
  if (tagNames.some(n => n.includes('medicsiq'))) return PLATFORM_CTAS.medicsiq;
  if (tagNames.some(n => n.includes('voice') || n.includes('voiceops'))) return PLATFORM_CTAS.voiceops;
  if (tagNames.some(n => n.includes('orebill') || n.includes('ore'))) return PLATFORM_CTAS.orebill;
  if (tagNames.some(n => n.includes('manufactur') || n.includes('kopl') || n.includes('industrial'))) return PLATFORM_CTAS.manufacturing;
  return DEFAULT_CTA;
}

const BlogPostPage: NextPage<Props> = ({ post, author, preview }) => {
  const router = useRouter();

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Post Not Found</h1>
          <Link href="/blog" className="text-[#1e90ff] hover:underline font-medium">
            ← Back to Insights
          </Link>
        </div>
      </div>
    );
  }

  const mins = readTime(post.content);
  const cta = getCTA(post.tags);
  const accent = post.tags?.[0]?.color ?? '#5e17ea';
  const imageUrl = post.imageUrl.startsWith('http')
    ? post.imageUrl
    : post.imageUrl.startsWith('/')
    ? post.imageUrl
    : `/${post.imageUrl}`;
  const siteUrl = 'https://dsetconsulting.com';
  const canonicalUrl = `${siteUrl}/blog/${post.slug}`;
  const keywords = post.tags?.map(t => t.name).join(', ');

  // BlogPosting structured data — lets Google show rich results (author, date, image) for
  // this post in search. This is free — no paid SEO/AI-discoverability tool (e.g. Profound)
  // is needed for this baseline; see documentation/08-blog-approval-workflow.md §10.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    ...(post.subtitle ? { description: post.subtitle } : {}),
    image: imageUrl.startsWith('http') ? imageUrl : `${siteUrl}${imageUrl}`,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
    author: author
      ? { '@type': 'Person', name: author.name, ...(author.linkedinUrl ? { sameAs: [author.linkedinUrl] } : {}) }
      : { '@type': 'Organization', name: post.author },
    publisher: {
      '@type': 'Organization',
      name: 'DSeT Consulting',
      logo: { '@type': 'ImageObject', url: `${siteUrl}/dset-logo-orb.png` },
    },
    ...(post.tags?.length ? { keywords: post.tags.map(t => t.name).join(', ') } : {}),
  };

  return (
    <Layout
      title={`${post.title} | DSeT Consulting`}
      description={post.metaDescription || post.subtitle || `Read about ${post.title} on the DSeT Insights blog.`}
      keywords={keywords}
      ogImage={post.imageUrl.startsWith('http') ? undefined : imageUrl}
      jsonLd={jsonLd}
      breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Insights', href: '/blog' }, { name: post.title, href: `/blog/${post.slug}` }]}
    >
      {preview && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-50 border-b border-amber-200 py-2 px-4 text-center">
          <p className="text-amber-800 text-sm">
            Preview Mode —{' '}
            <button
              onClick={() => router.push('/admin/blog')}
              className="underline hover:text-amber-900 font-medium"
            >
              Exit Preview
            </button>
          </p>
        </div>
      )}

      {/* ── Breadcrumb ── */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#1e90ff] transition-colors duration-200 font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Insights
          </Link>
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="relative h-[45vh] min-h-[320px] w-full overflow-hidden">
        <Image
          src={imageUrl}
          alt={post.title}
          fill
          className="object-cover"
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 w-full pb-10">
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.slice(0, 3).map(tag => (
                  <span
                    key={tag.id}
                    className="px-3 py-1 rounded-full text-xs font-semibold text-white shadow-sm"
                    style={{ backgroundColor: tag.color }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight mb-3 max-w-3xl">
              {post.title}
            </h1>
            {post.subtitle && (
              <p className="text-gray-200 text-base sm:text-lg leading-relaxed mb-4 max-w-2xl line-clamp-2">
                {post.subtitle}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm text-gray-300 font-medium">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: accent }}
              >
                {post.author[0].toUpperCase()}
              </div>
              <span className="text-gray-200">{post.author}</span>
              {post.contributors && post.contributors.length > 0 && (
                <span className="text-gray-400">
                  · Contributors: {post.contributors.join(', ')}
                </span>
              )}
              <span className="text-gray-500">·</span>
              <time className="text-gray-300">{format(new Date(post.publishedAt), 'MMMM d, yyyy')}</time>
              <span className="text-gray-500">·</span>
              <span className="text-gray-300">{mins} min read</span>
              <span className="text-gray-500">·</span>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  window.open(
                    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
                    '_blank',
                    'noopener,noreferrer,width=600,height=600'
                  );
                }}
                className="inline-flex items-center gap-1.5 text-gray-400 hover:text-[#0a66c2] transition-colors duration-200"
                title="Share on LinkedIn"
                aria-label="Share on LinkedIn"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Accent divider ── */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#5e17ea]/50 to-transparent" />

      {/* ── Article content ── */}
      <div className="bg-gray-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          {post.aiGenerated && post.aiGenerated !== 'no' && (
            <div className="mb-8 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-sm">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                {post.aiGenerated === 'yes'
                  ? 'This article was primarily generated with AI assistance.'
                  : 'This article was partially written with AI assistance.'}
              </span>
            </div>
          )}
          <div
            className="tinymce-content"
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(post.content, {
                allowedTags: sanitizeHtml.defaults.allowedTags.concat([
                  'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'iframe', 'figure', 'figcaption',
                ]),
                allowedAttributes: {
                  ...sanitizeHtml.defaults.allowedAttributes,
                  img: ['src', 'alt', 'width', 'height'],
                  iframe: ['src', 'allowfullscreen', 'frameborder'],
                  '*': ['class'],
                },
              }),
            }}
          />
        </div>
      </div>

      {/* ── Author card ── */}
      {author && (
        <div className="bg-gray-950 border-t border-gray-800/60">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-start gap-4 bg-white/[0.03] border border-white/10 rounded-2xl p-5 sm:p-6">
              {author.photoUrl ? (
                <img src={author.photoUrl} alt={author.name} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-[#5e17ea] flex items-center justify-center text-white font-bold flex-shrink-0">
                  {author.name[0]?.toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white font-semibold">{author.name}</span>
                  {author.linkedinUrl && (
                    <a
                      href={author.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0a66c2] hover:text-[#4098d7] transition-colors"
                      aria-label={`${author.name} on LinkedIn`}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                  )}
                </div>
                {author.designation && (
                  <p className="text-sm text-gray-400 mt-0.5">{author.designation}</p>
                )}
                {author.bio && (
                  <p className="text-sm text-gray-300 mt-2 leading-relaxed">{author.bio}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Lead Capture ── */}
      <BlogSubscribe slug={post.slug} />

      {/* ── Share ── */}
      <div className="bg-gray-950 border-t border-gray-800/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white mb-0.5">Found this useful?</p>
              <p className="text-sm text-gray-500">Share it with your network on LinkedIn.</p>
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.open(
                  `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
                  '_blank',
                  'noopener,noreferrer,width=600,height=600'
                );
              }}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-[#0a66c2] hover:bg-[#004182] text-white text-sm font-semibold rounded-xl transition-colors duration-200 flex-shrink-0 shadow-lg"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              Share on LinkedIn
            </a>
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="bg-gray-900 border-t border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#001f3f] via-[#002b57] to-[#001f3f] shadow-2xl px-8 py-12 sm:px-14 sm:py-14 text-center">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%231e90ff%22%20stroke-width%3D%220.5%22%20stroke-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M0%2030h60M30%200v60%22/%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#5e17ea]/20 to-transparent" />
            <div className="relative z-10">
              <span className="inline-block mb-4 px-4 py-1.5 text-xs font-semibold text-white bg-white/10 rounded-full border border-white/20">
                Ready to go deeper?
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight">
                {cta.headline}
              </h2>
              <p className="text-gray-300 mb-8 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
                {cta.sub}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href={cta.href}
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-[#5e17ea] to-[#1e90ff] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity duration-200 text-sm shadow-lg"
                >
                  {cta.cta}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors duration-200 text-sm border border-white/20"
                >
                  More Insights
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

function BlogSubscribe({ slug }: { slug: string }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setState('loading');
    try {
      const res = await fetch('/api/blog-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), slug }),
      });
      setState(res.ok ? 'success' : 'error');
    } catch {
      setState('error');
    }
  };

  return (
    <div className="bg-gray-950 border-t border-gray-800/60">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/60 px-8 py-10 text-center">
          <div className="w-10 h-10 rounded-full bg-[#5e17ea]/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-5 h-5 text-[#5e17ea]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white mb-1.5">Stay ahead of the curve</h3>
          <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto">
            Get DSeT Insights delivered to your inbox — strategy, AI, and digital transformation.
          </p>

          {state === 'success' ? (
            <div className="flex items-center justify-center gap-2 text-green-400 font-medium text-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              You're subscribed! We'll be in touch.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-700/50 border border-gray-600 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5e17ea] focus:border-transparent"
              />
              <input
                type="email"
                placeholder="Work email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-700/50 border border-gray-600 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5e17ea] focus:border-transparent"
              />
              <button
                type="submit"
                disabled={state === 'loading'}
                className="px-5 py-2.5 bg-[#5e17ea] hover:bg-[#4e0fd8] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60 flex-shrink-0"
              >
                {state === 'loading' ? '…' : 'Subscribe'}
              </button>
            </form>
          )}

          {state === 'error' && (
            <p className="mt-2 text-xs text-red-400">Something went wrong. Please try again.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getPublishedPostsServer();
  return {
    paths: posts.map(post => ({ params: { slug: post.slug } })),
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params, preview = false }) => {
  const { slug } = params as { slug: string };
  const post = await getPostBySlugServer(slug);
  if (!post) return { notFound: true };
  if (post.status !== 'published' && !preview) return { notFound: true };

  let author: Author | null = null;
  if (post.authorId) {
    const allAuthors = await getAllAuthorsServer();
    author = allAuthors.find(a => a.id === post.authorId) ?? null;
  }

  return { props: { post, author, preview: preview || false }, revalidate: 300 };
};

export default BlogPostPage;
