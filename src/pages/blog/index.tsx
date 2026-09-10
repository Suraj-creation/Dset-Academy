import { GetServerSideProps, NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getPublishedPostsServer, autoPublishDuePostsServer } from '@/lib/blog.server';
import { format } from 'date-fns';
import Layout from '@/components/layout/Layout';

interface BlogPost {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  imageUrl: string;
  publishedAt: string;
  author: string;
  tags: Array<{ id: string; name: string; color: string }>;
  slug: string;
}

interface Props {
  posts: BlogPost[];
}

const cardAnim = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const TAG_ACCENT = (tags: BlogPost['tags']) => tags?.[0]?.color ?? '#5e17ea';

const imageUrl = (url: string) =>
  url.startsWith('http') ? url : url.startsWith('/') ? url : `/${url}`;

const Blog: NextPage<Props> = ({ posts }) => {
  const [featured, ...rest] = posts;

  return (
    <Layout
      title="Insights & Perspectives | DSeT Consulting"
      description="Analysis, perspectives, and platform intelligence from DSeT — covering industrial AI, revenue operations, cloud compliance, and deeptech transformation."
      keywords="vertical AI platforms, industrial AI, mining AI, pharma intelligence, revenue operations, cloud compliance, DSeT Consulting blog"
      breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Insights', href: '/blog' }]}
    >
      {/* ── Hero ── */}
      <div className="bg-gray-950 py-16 sm:py-24">
        <div className="container-custom">
          <div className="relative bg-gradient-to-br from-[#001f3f] via-[#002b57] to-[#001f3f] rounded-3xl shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%231e90ff%22%20stroke-width%3D%220.5%22%20stroke-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M0%2030h60M30%200v60%22/%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#5e17ea]/20 to-transparent" />
            <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gradient-to-r from-[#1e90ff]/20 to-transparent" />
            <motion.div
              className="relative z-10 px-8 py-14 sm:px-16 sm:py-20 max-w-4xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <span className="inline-block mb-5 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#5e17ea] to-[#1e90ff] rounded-full shadow">
                Insights & Perspectives
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight">
                Intelligence from{' '}
                <span className="bg-gradient-to-r from-[#ff851b] to-[#1e90ff] bg-clip-text text-transparent">
                  the Platform Team.
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-2xl">
                Analysis, perspectives, and applied learnings on industrial AI, revenue operations,
                cloud compliance, and deeptech transformation — written by practitioners, not generalists.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {posts.length === 0 ? (
        /* ── Empty State ── */
        <div className="bg-gray-950 py-16 sm:py-20">
          <div className="container-custom">
            <div className="max-w-5xl mx-auto">
              <div className="relative overflow-hidden rounded-[2rem] border border-gray-800 bg-gray-900 shadow-2xl px-8 py-12 sm:px-16 sm:py-14 text-center">
                <div className="max-w-xl mx-auto">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#5e17ea]/20 to-[#1e90ff]/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-[#1e90ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">Articles Coming Soon</h2>
                  <p className="text-gray-400 mb-8 leading-relaxed">
                    The DSeT platform team is preparing in-depth perspectives on industrial AI, revenue operations,
                    and regulated-industry transformation. Check back shortly.
                  </p>
                  <Link
                    href="/contact"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#5e17ea] to-[#1e90ff] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity duration-200 text-sm"
                  >
                    Get in Touch
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* ── Featured Post ── */}
          {featured && (
            <div className="bg-gray-950 py-12 sm:py-16">
              <div className="container-custom">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Latest Article</p>
                <motion.div
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="max-w-5xl"
                >
                  <Link href={`/blog/${featured.slug}`} className="block group">
                    <div
                      className="relative overflow-hidden rounded-2xl border bg-gray-900 shadow-2xl"
                      style={{ borderColor: TAG_ACCENT(featured.tags) + '40' }}
                    >
                      <div className="h-[5px] w-full" style={{ backgroundColor: TAG_ACCENT(featured.tags) }} />
                      <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* Image */}
                        <div className="relative h-56 md:h-auto min-h-[280px] overflow-hidden">
                          <Image
                            src={imageUrl(featured.imageUrl)}
                            alt={featured.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            priority
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        </div>
                        {/* Text */}
                        <div className="p-8 sm:p-10 flex flex-col justify-center">
                          <div className="flex flex-wrap gap-2 mb-4">
                            {featured.tags.slice(0, 2).map(tag => (
                              <span
                                key={tag.id}
                                className="px-3 py-1 text-xs font-semibold rounded-full text-white"
                                style={{ backgroundColor: tag.color }}
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 leading-tight group-hover:text-[#1e90ff] transition-colors duration-200">
                            {featured.title}
                          </h2>
                          {featured.subtitle && (
                            <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3">
                              {featured.subtitle}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-800">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                style={{ backgroundColor: TAG_ACCENT(featured.tags) }}
                              >
                                {featured.author[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-200">{featured.author}</p>
                                <p className="text-xs text-gray-500">
                                  {format(new Date(featured.publishedAt), 'MMM d, yyyy')}
                                </p>
                              </div>
                            </div>
                            <span
                              className="inline-flex items-center gap-1 text-sm font-semibold group-hover:gap-2 transition-all duration-200"
                              style={{ color: TAG_ACCENT(featured.tags) }}
                            >
                              Read article
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                              </svg>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              </div>
            </div>
          )}

          {/* ── Post Grid ── */}
          {rest.length > 0 && (
            <div className="bg-gray-900 py-12 sm:py-16">
              <div className="container-custom">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-8">All Articles</p>
                <motion.div
                  className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl"
                  variants={container}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.05 }}
                >
                  {rest.map(post => {
                    const accent = TAG_ACCENT(post.tags);
                    return (
                      <motion.div
                        key={post.id}
                        variants={cardAnim}
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      >
                        <Link href={`/blog/${post.slug}`} className="block group h-full">
                          <div
                            className="relative overflow-hidden rounded-2xl border bg-gray-950 shadow-lg h-full flex flex-col"
                            style={{ borderColor: accent + '30' }}
                          >
                            <div className="h-[4px] w-full flex-shrink-0" style={{ backgroundColor: accent }} />
                            <div className="relative h-44 overflow-hidden flex-shrink-0">
                              <Image
                                src={imageUrl(post.imageUrl)}
                                alt={post.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                            </div>
                            <div className="p-5 flex flex-col flex-1">
                              <div className="flex flex-wrap gap-1.5 mb-3">
                                {post.tags.slice(0, 2).map(tag => (
                                  <span
                                    key={tag.id}
                                    className="px-2.5 py-0.5 text-xs font-semibold rounded-full text-white"
                                    style={{ backgroundColor: tag.color }}
                                  >
                                    {tag.name}
                                  </span>
                                ))}
                              </div>
                              <h2 className="text-sm sm:text-base font-bold text-white mb-2 line-clamp-2 leading-snug group-hover:text-[#1e90ff] transition-colors duration-200">
                                {post.title}
                              </h2>
                              {post.subtitle && (
                                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-4 flex-1">
                                  {post.subtitle}
                                </p>
                              )}
                              <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-800">
                                <span className="text-xs text-gray-500">
                                  {format(new Date(post.publishedAt), 'MMM d, yyyy')}
                                </span>
                                <span
                                  className="inline-flex items-center gap-1 text-xs font-semibold group-hover:gap-1.5 transition-all duration-200"
                                  style={{ color: accent }}
                                >
                                  Read
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                  </svg>
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── CTA ── */}
      <div className="bg-gray-950 py-16 sm:py-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl mx-auto"
          >
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#001f3f] via-[#002b57] to-[#001f3f] shadow-2xl px-8 py-12 sm:px-16 sm:py-14 text-center">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%231e90ff%22%20stroke-width%3D%220.5%22%20stroke-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M0%2030h60M30%200v60%22/%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
              <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#5e17ea]/20 to-transparent" />
              <div className="relative z-10">
                <span className="inline-block mb-4 px-4 py-1.5 text-xs font-semibold text-white bg-white/10 rounded-full border border-white/20">
                  Ready to go deeper?
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight">
                  See These Platforms{' '}
                  <span className="bg-gradient-to-r from-[#ff851b] to-[#1e90ff] bg-clip-text text-transparent">
                    in Action.
                  </span>
                </h2>
                <p className="text-gray-300 mb-8 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
                  A 30-minute strategic demo — mapped to your operational environment,
                  not a generic slide deck.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/contact?type=demo"
                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-[#5e17ea] to-[#1e90ff] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity duration-200 text-sm shadow-lg"
                  >
                    Book a Strategic Demo
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  <Link
                    href="/case-studies"
                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors duration-200 text-sm border border-white/20"
                  >
                    View Case Studies
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  autoPublishDuePostsServer().catch(() => {});
  try {
    const posts = await getPublishedPostsServer();
    return { props: { posts } };
  } catch {
    return { props: { posts: [] } };
  }
};

export default Blog;
