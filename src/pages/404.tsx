import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Home } from 'lucide-react';
import Layout from '@/components/layout/Layout';

export default function NotFound() {
  return (
    <Layout
      title="Page Not Found | DSeT"
      description="The page you're looking for doesn't exist."
    >
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #001f3f, #0a1628)' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-lg"
        >
          <p className="text-[120px] font-extrabold leading-none" style={{ background: 'linear-gradient(135deg, #1e90ff, #5e17ea)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            404
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-2 mb-4">
            Page not found
          </h1>
          <p className="text-gray-400 mb-10 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #1e90ff, #5e17ea)' }}
            >
              <Home className="w-4 h-4" /> Back to Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white border border-white/20 hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Go Back
            </button>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
