import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getPublishedPostsServer, getPostBySlugServer } from '@/lib/blog.server';
import { format } from 'date-fns';
import sanitizeHtml from 'sanitize-html';

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

interface Props {
  post: BlogPost;
  preview?: boolean;
}

const BlogPost: NextPage<Props> = ({ post, preview }) => {
  const router = useRouter();

  // Show loading state for preview mode
  if (router.isFallback) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Post Not Found</h1>
          <Link href="/blog" className="text-blue-400 hover:text-blue-300">
            Return to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{post.title} | DSeT Consulting Blog</title>
        <meta
          name="description"
          content={post.metaDescription || post.subtitle || `Read about ${post.title}`}
        />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.metaDescription || post.subtitle || ''} />
        {post.imageUrl && <meta property="og:image" content={post.imageUrl} />}
      </Head>

      {preview && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-50 py-2 px-4 text-center">
          <p className="text-yellow-800">
            Preview Mode - 
            <button
              onClick={() => router.push('/admin/blog')}
              className="ml-2 text-yellow-900 underline hover:text-yellow-700"
            >
              Exit Preview
            </button>
          </p>
        </div>
      )}

      <article className={`min-h-screen bg-gray-900 ${preview ? 'pt-12' : ''}`}>
        {/* Hero Section */}
        <div className="relative h-[70vh] min-h-[500px] w-full bg-gradient-to-b from-gray-900 to-gray-800">
          <Image
            src={post.imageUrl.startsWith('http') ? post.imageUrl : post.imageUrl.startsWith('/') ? post.imageUrl : `/${post.imageUrl}`}
            alt={post.title}
            fill
            className="object-cover mix-blend-overlay opacity-90"
            priority
            quality={100}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
            <div className="container mx-auto px-4 h-full flex items-end pb-16">
              <div className="max-w-3xl">
                {post.tags && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {post.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="px-4 py-1.5 rounded-full text-sm font-medium bg-gray-800/90 shadow-lg"
                        style={{ color: tag.color }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
                <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white leading-tight">{post.title}</h1>
                {post.subtitle && (
                  <p className="text-xl md:text-2xl text-gray-100 mb-6 leading-relaxed">{post.subtitle}</p>
                )}
                <div className="flex items-center text-sm text-gray-200 font-medium">
                  <span>{post.author}</span>
                  <span className="mx-3">•</span>
                  <time>{format(new Date(post.publishedAt), 'MMMM d, yyyy')}</time>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <div 
              className="tinymce-content"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content, {
                allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'h3', 'iframe']),
                allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, img: ['src', 'alt', 'width', 'height'], iframe: ['src', 'allowfullscreen', 'frameborder'] },
              }) }} 
            />
          </div>
        </div>
      </article>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getPublishedPostsServer();
  
  const paths = posts.map(post => ({
    params: { slug: post.slug }
  }));

  return {
    paths,
    fallback: true // Enable preview mode
  };
};

export const getStaticProps: GetStaticProps = async ({ params, preview = false }) => {
  const { slug } = params as { slug: string };
  
  const post = await getPostBySlugServer(slug);
  
  if (!post) {
    return {
      notFound: true
    };
  }

  // Only show published posts unless in preview mode
  if (post.status !== 'published' && !preview) {
    return {
      notFound: true
    };
  }

  return {
    props: {
      post,
      preview: preview || false
    },
    revalidate: 60
  };
};

export default BlogPost;