import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, ArrowRight, BarChart2 } from 'lucide-react';

interface PromoBannerProps {
  onVisibilityChange?: (visible: boolean) => void;
}

const PromoBanner = ({ onVisibilityChange }: PromoBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    onVisibilityChange?.(isVisible);
  }, [isVisible, onVisibilityChange]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-r from-[#5e17ea] via-[#1e90ff] to-[#5e17ea] text-white relative overflow-hidden fixed top-0 left-0 right-0 z-[60]"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%220.5%22%20stroke-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M0%2030h60M30%200v60%22/%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-16 -translate-y-16 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full translate-x-12 translate-y-12 animate-pulse delay-1000"></div>
        
        <div className="relative z-10 py-3">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <BarChart2 className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 min-w-0">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-white/25 text-white backdrop-blur-sm tracking-wide">
                    NEW
                  </span>
                  <span className="font-bold text-white text-sm sm:text-base">
                    Free Digital Maturity Assessment
                  </span>
                </div>
                <p className="text-sm text-white/90 hidden sm:block">
                  — Discover your organization's digital transformation readiness in 15 minutes
                </p>
              </div>
            </div>

            {/* CTA and Close */}
            <div className="flex items-center space-x-3 flex-shrink-0">
              <Link
                href="/digital-assessment"
                className="hidden sm:inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg text-sm transition-all duration-300 backdrop-blur-sm hover:scale-105 group"
              >
                <Target className="w-4 h-4 mr-2" />
                Take Assessment
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>

              <button
                onClick={() => setIsVisible(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-300 group flex-shrink-0"
                aria-label="Close banner"
              >
                <X className="w-4 h-4 text-white/80 group-hover:text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile-optimized version */}
        <div className="block sm:hidden relative z-10 pb-3">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-xs text-white/90 mb-2">
              Discover your digital transformation readiness
            </p>
            <Link
              href="/digital-assessment"
              className="inline-flex items-center justify-center w-full px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg text-sm transition-all duration-300 backdrop-blur-sm"
            >
              <Target className="w-4 h-4 mr-2" />
              Take Free Assessment
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PromoBanner;