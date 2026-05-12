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
      { source: '/gallery',            destination: '/events',       permanent: true },
      { source: '/gallery/:path*',     destination: '/events/:path*', permanent: true },
      { source: '/admin/gallery',      destination: '/admin/events', permanent: true },
      { source: '/admin/gallery/:path*', destination: '/admin/events/:path*', permanent: true },
    ];
  },
};

export default nextConfig;
