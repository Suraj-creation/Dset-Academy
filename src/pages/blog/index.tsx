import { GetStaticProps, NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getPublishedPostsServer } from '@/lib/blog.server';
import { format } from 'date-fns';
import Layout from '@/components/layout/Layout';
import Section from '@/components/ui/Section';

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

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardAnim = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

const TAG_ACCENT = (tags: BlogPost['tags']) =>
  tags?.[0]?.color ?? '#5e17ea';

const Blog: NextPage<Props> = ({ posts }) => {
  const [featured, ...rest] = posts;

  return (
    <Layout
      title="Insights & Perspectives | DSeT Consulting"
      description="Analysis, perspectives, and platform intelligence from DSeT — covering industrial AI, revenue operations, cloud compliance, and deeptech transformation."
    >
      {/* ── Hero ── */}
      <Section bgColor="light" spacing="xl">
        <div className="relative bg-gradient-to-br from-[#001f3f] via-[#002b57] to-[#001f3f] rounded-3xl shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%231e90ff%22%20stroke-width%3D%220.5%22%20stroke-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M0%2030h60M30%200v60%22/%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#5e17ea]/20 to-transparent" />
          <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gradient-to-r from-[#1e90ff]/20 to-transparent" />

          <motion.div
            className="relative z-10 px-8 py-16 sm:px-16 sm:py-20 max-w-4xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block mb-6 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#5e17ea] to-[#1e90ff] rounded-full shadow">
              Insights & Perspectives
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
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
      </Section>

      {posts.length === 0 ? (
        /* ── Empty State ── */
        <Section bgColor="white" spacing="xl">
          <div className="max-w-2xl mx-auto text-center px-4">
            <div className="relative overflow-hidden rounded-[2rem] border border-[#e8e4dc] bg-[#fbfaf7] shadow-[0_20px_60px_rgba(15,23,42,0.09)] p-12">
              <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(15,23,42,0.05)_1px,_transparent_1px)] [background-size:22px_22px] opacity-30 pointer-events-none" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-[#5e17ea]/10 to-[#1e90ff]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-[#1e90ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-[#0f172a] mb-4">Articles Coming Soon</h2>
                <p className="text-[#6b7280] mb-8 leading-relaxed">
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
        </Section>
      ) : (
        <>
          {/* ── Featured Post ── */}
          {featured && (
            <Section bgColor="white" spacing="xl">
              <div className="max-w-5xl mx-auto">
                <p className="text-xs font-bold text-[#9ca3af] uppercase tracking-wider mb-5">Latest Article</p>
                <motion.div
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <Link href={`/blog/${featured.slug}`} className="block group">
                    <div className="relative overflow-hidden rounded-[2rem] border border-[#e8e4dc] bg-[#fbfaf7] shadow-[0_20px_60px_rgba(15,23,42,0.09)]">
                      <div className="h-[6px] w-full" style={{ backgroundColor: TAG_ACCENT(featured.tags) }} />
                      <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(15,23,42,0.05)_1px,_transparent_1px)] [background-size:22px_22px] opacity-30 pointer-events-none" />
                      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-0">
                        <div className="relative h-56 md:h-auto min-h-[280px] overflow-hidden rounded-bl-none rounded-br-none md:rounded-bl-[calc(2rem-1px)] md:rounded-br-none md:rounded-tl-none md:rounded-tr-none">
                          <Image
                            src={
                              featured.imageUrl.startsWith('http')
                                ? featured.imageUrl
                                : featured.imageUrl.startsWith('/')
                                ? featured.imageUrl
                                : `/${featured.imageUrl}`
                            }
                            alt={featured.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            priority
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                        </div>
                        <div className="p-8 sm:p-10 flex flex-col justify-center">
                          <div className="flex flex-wrap gap-2 mb-4">
                            {featured.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag.id}
                                className="px-3 py-1 text-xs font-semibold rounded-full text-white"
                                style={{ backgroundColor: tag.color }}
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                          <h2 className="text-xl sm:text-2xl font-bold text-[#0f172a] mb-3 leading-tight group-hover:text-[#5e17ea] transition-colors duration-200">
                            {featured.title}
                          </h2>
                          {featured.subtitle && (
                            <p className="text-[#6b7280] text-sm leading-relaxed mb-6 line-clamp-3">
                              {featured.subtitle}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#e8e4dc]">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                style={{ backgroundColor: TAG_ACCENT(featured.tags) }}
                              >
                                {featured.author[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-[#374151]">{featured.author}</p>
                                <p className="text-xs text-[#9ca3af]">
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
            </Section>
          )}

          {/* ── Post Grid ── */}
          {rest.length > 0 && (
            <Section bgColor="light" spacing="xl">
              <div className="max-w-5xl mx-auto">
                <p className="text-xs font-bold text-[#9ca3af] uppercase tracking-wider mb-7">All Articles</p>
                <motion.div
                  className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  variants={container}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.05 }}
                >
                  {rest.map((post) => {
                    const accent = TAG_ACCENT(post.tags);
                    return (
                      <motion.div
                        key={post.id}
                        variants={cardAnim}
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      >
                        <Link href={`/blog/${post.slug}`} className="block group h-full">
                          <div className="relative overflow-hidden rounded-2xl border border-[#e8e4dc] bg-[#fbfaf7] shadow-[0_8px_30px_rgba(15,23,42,0.07)] h-full flex flex-col">
                            <div className="h-[5px] w-full flex-shrink-0" style={{ backgroundColor: accent }} />
                            <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(15,23,42,0.04)_1px,_transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none" />

                            <div className="relative h-44 overflow-hidden flex-shrink-0">
                              <Image
                                src={
                                  post.imageUrl.startsWith('http')
                                    ? post.imageUrl
                                    : post.imageUrl.startsWith('/')
                                    ? post.imageUrl
                                    : `/${post.imageUrl}`
                                }
                                alt={post.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            </div>

                            <div className="relative z-10 p-5 flex flex-col flex-1">
                              <div className="flex flex-wrap gap-1.5 mb-3">
                                {post.tags.slice(0, 2).map((tag) => (
                                  <span
                                    key={tag.id}
                                    className="px-2.5 py-0.5 text-xs font-semibold rounded-full text-white"
                                    style={{ backgroundColor: tag.color }}
                                  >
                                    {tag.name}
                                  </span>
                                ))}
                              </div>

                              <h2 className="text-sm sm:text-base font-bold text-[#0f172a] mb-2 line-clamp-2 leading-snug group-hover:text-[#5e17ea] transition-colors duration-200">
                                {post.title}
                              </h2>

                              {post.subtitle && (
                                <p className="text-xs text-[#6b7280] line-clamp-2 leading-relaxed mb-4 flex-1">
                                  {post.subtitle}
                                </p>
                              )}

                              <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#ece8e0]">
                                <span className="text-xs text-[#9ca3af]">
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
            </Section>
          )}
        </>
      )}

      {/* ── CTA ── */}
      <Section bgColor="white" spacing="xl">
        <motion.div
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
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
      </Section>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  try {
    const posts = await getPublishedPostsServer();
    return {
      props: { posts },
      revalidate: 60,
    };
  } catch {
    return {
      props: { posts: [] },
      revalidate: 60,
    };
  }
};

export default Blog;
