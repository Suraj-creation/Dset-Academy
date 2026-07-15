import type { NextConfig } from "next";
import path from "path";

const securityHeaders = [
  { key: 'X-Content-Type-Options',    value: 'nosniff' },
  { key: 'X-Frame-Options',           value: 'SAMEORIGIN' },
  { key: 'X-XSS-Protection',          value: '1; mode=block' },
  { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',        value: 'camera=(), microphone=(self), geolocation=()' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  productionBrowserSourceMaps: false,
  devIndicators: false,
  experimental: {
    optimizePackageImports: ['react-icons', 'lucide-react', 'date-fns'],
  },
  turbopack: {
    resolveAlias: {
      'framer-motion': './src/lib/motion.tsx',
    },
  },
  webpack(config) {
    config.resolve.alias['framer-motion'] = path.resolve('./src/lib/motion.tsx');
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'dsetmediastorage.blob.core.windows.net',
      },
    ],
    qualities: [75, 100],
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
    ];
  },
  async redirects() {
    return [
      // Gallery → Events (legacy)
      { source: '/gallery',              destination: '/events',        permanent: true },
      { source: '/gallery/:path*',       destination: '/events/:path*', permanent: true },
      { source: '/admin/gallery',        destination: '/admin/events',  permanent: true },
      { source: '/admin/gallery/:path*', destination: '/admin/events/:path*', permanent: true },
      // SEO keyword-rich slugs → category and product pages
      { source: '/vertical-ai-platforms-india',          destination: '/vertical-ai-platforms',                    permanent: true },
      { source: '/industry-specific-ai-india',           destination: '/vertical-ai-platforms',                    permanent: true },
      { source: '/domain-ai-platforms-india',            destination: '/vertical-ai-platforms',                    permanent: true },
      { source: '/managed-ai-deployment-india',          destination: '/dset-arc-managed-intelligence-services',   permanent: true },
      { source: '/ai-platform-deployment-services',      destination: '/dset-arc-managed-intelligence-services',   permanent: true },
      { source: '/orebillai-mining-billing-automation', destination: '/product/orebill-ai',        permanent: true },
      { source: '/pharma-market-intelligence-ai',       destination: '/product/pharmaai',           permanent: true },
      { source: '/medicsiq-wellness-ai-platform',       destination: '/product/medicsiq',           permanent: true },
      { source: '/voiceops-enterprise-voice-ai',        destination: '/product/voiceops',           permanent: true },
      { source: '/secure-cloud-ai-compliance',          destination: '/product/securecloud',        permanent: true },
      { source: '/edgebay-industrial-edge-ai',          destination: '/product/edgebay-intelligence', permanent: true },
      // Old service sub-pages → main services page (404 fix)
      { source: '/services/process-automation',   destination: '/services', permanent: true },
      { source: '/services/agile-methodologies',  destination: '/services', permanent: true },
      { source: '/services/cloud-architecture',   destination: '/services', permanent: true },
      { source: '/services/digital-strategy',     destination: '/services', permanent: true },
      { source: '/services/smb-transformation',   destination: '/services', permanent: true },
      { source: '/services/cx-optimization',      destination: '/services', permanent: true },
      { source: '/services/process-management',   destination: '/services', permanent: true },
      { source: '/services/data-analytics',       destination: '/services', permanent: true },
      // Old about page variant → current about page (404 fix)
      { source: '/about-us-two',                  destination: '/about',    permanent: true },
      { source: '/about-us-two/',                 destination: '/about',    permanent: true },
      // Old WordPress pages → relevant current pages (404 fix)
      { source: '/startup-consulting',            destination: '/services', permanent: true },
      { source: '/startup-consulting/',           destination: '/services', permanent: true },
    ];
  },
};

export default nextConfig;
