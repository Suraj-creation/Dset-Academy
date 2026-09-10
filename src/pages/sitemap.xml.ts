import { GetServerSideProps } from 'next';
import { getPublishedPostsServer } from '@/lib/blog.server';

const SITE_URL = 'https://dsetconsulting.com';

// Static marketing pages — unchanged from the old public/sitemap.xml, just moved here so blog
// post URLs (fetched live below) can be merged in without needing a rebuild/manual edit every
// time a post is published.
const STATIC_PAGES: Array<{ path: string; priority: string; changefreq: string }> = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/about', priority: '0.9', changefreq: 'monthly' },
  { path: '/services', priority: '0.9', changefreq: 'monthly' },
  { path: '/vertical-ai-platforms', priority: '0.95', changefreq: 'monthly' },
  { path: '/dset-arc-managed-intelligence-services', priority: '0.9', changefreq: 'monthly' },
  { path: '/product', priority: '0.9', changefreq: 'monthly' },
  { path: '/product/orebill-ai', priority: '0.8', changefreq: 'monthly' },
  { path: '/product/pharmaai', priority: '0.8', changefreq: 'monthly' },
  { path: '/product/medicsiq', priority: '0.8', changefreq: 'monthly' },
  { path: '/product/voiceops', priority: '0.8', changefreq: 'monthly' },
  { path: '/product/securecloud', priority: '0.8', changefreq: 'monthly' },
  { path: '/product/edgebay-intelligence', priority: '0.8', changefreq: 'monthly' },
  { path: '/product/ipas-revops', priority: '0.7', changefreq: 'monthly' },
  { path: '/industries', priority: '0.8', changefreq: 'monthly' },
  { path: '/case-studies', priority: '0.8', changefreq: 'monthly' },
  { path: '/blog', priority: '0.8', changefreq: 'weekly' },
  { path: '/careers', priority: '0.7', changefreq: 'weekly' },
  { path: '/events', priority: '0.7', changefreq: 'weekly' },
  { path: '/contact', priority: '0.7', changefreq: 'monthly' },
  { path: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
  { path: '/terms-of-service', priority: '0.3', changefreq: 'yearly' },
];

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const posts = await getPublishedPostsServer().catch(() => []);
  const today = new Date().toISOString().slice(0, 10);

  const staticEntries = STATIC_PAGES.map(
    (p) =>
      `  <url><loc>${SITE_URL}${p.path}</loc><lastmod>${today}</lastmod><priority>${p.priority}</priority><changefreq>${p.changefreq}</changefreq></url>`
  );

  const postEntries = posts.map((post) => {
    const lastmod = new Date(post.publishedAt).toISOString().slice(0, 10);
    return `  <url><loc>${SITE_URL}/blog/${escapeXml(post.slug)}</loc><lastmod>${lastmod}</lastmod><priority>0.6</priority><changefreq>monthly</changefreq></url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...staticEntries, ...postEntries].join('\n')}\n</urlset>\n`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
  res.write(xml);
  res.end();

  return { props: {} };
};

export default function Sitemap() {
  return null;
}
