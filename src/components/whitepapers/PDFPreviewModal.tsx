import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Download, FileText, Clock, Tag, ZoomIn, ZoomOut } from 'lucide-react';
import type { Whitepaper } from '@/data/whitepapers';
import { CATEGORY_META } from '@/data/whitepapers';

interface Props {
  whitepaper: Whitepaper | null;
  onClose: () => void;
  onDownload: () => void;
}

// Mock page previews for demo
function MockPDFPage({ page, total, title }: { page: number; total: number; title: string }) {
  const sections = [
    ['Executive Summary', 'This document presents comprehensive research findings...'],
    ['Introduction', 'The landscape of enterprise AI has fundamentally shifted...'],
    ['Methodology', 'Our research approach combines quantitative analysis...'],
    ['Key Findings', 'Across 200+ enterprise deployments we identified...'],
    ['Implementation Guide', 'Phase 1: Foundation setup and data pipeline...'],
    ['Case Studies', 'Global Mining Corp achieved 60% reduction in...'],
    ['Technical Architecture', 'The reference architecture consists of three layers...'],
    ['Conclusion', 'Organizations that act now will establish...'],
  ];
  const [heading, body] = sections[(page - 1) % sections.length] ?? sections[0];

  return (
    <div
      className="w-full h-full flex flex-col p-8"
      style={{ background: '#fff', color: '#111' }}
    >
      {/* PDF header bar */}
      <div className="flex items-center justify-between mb-6 pb-4" style={{ borderBottom: '2px solid #5e17ea' }}>
        <span className="text-xs font-black tracking-widest text-[#5e17ea] uppercase">DSeT Consulting</span>
        <span className="text-[10px] text-gray-400">
          Page {page} of {total}
        </span>
      </div>

      {/* Mock content */}
      {page === 1 && (
        <div className="mb-6">
          <div className="w-12 h-1 rounded mb-3" style={{ background: '#5e17ea' }} />
          <h1 className="text-lg font-black text-gray-900 leading-tight mb-2">{title}</h1>
          <p className="text-[11px] text-gray-500">DSeT Research Series · {new Date().getFullYear()}</p>
        </div>
      )}

      <h2 className="text-sm font-bold text-gray-800 mb-3">{heading}</h2>
      <div className="space-y-2 flex-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-2 rounded"
            style={{
              background: '#f0f0f0',
              width: i === 5 ? '60%' : '100%',
            }}
          />
        ))}
        {page % 2 === 0 && (
          <div
            className="mt-4 h-16 rounded-lg flex items-center justify-center"
            style={{ background: '#f8f8f8', border: '1px solid #eee' }}
          >
            <span className="text-[10px] text-gray-400">[ Figure {page} — Data visualization ]</span>
          </div>
        )}
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={`b${i}`} className="h-2 rounded mt-1" style={{ background: '#f0f0f0', width: `${75 + i * 5}%` }} />
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 flex justify-between" style={{ borderTop: '1px solid #eee' }}>
        <span className="text-[9px] text-gray-400">© {new Date().getFullYear()} DSeT Consulting Private Limited</span>
        <span className="text-[9px] text-gray-400">Confidential — For authorized use only</span>
      </div>
    </div>
  );
}

export default function PDFPreviewModal({ whitepaper, onClose, onDownload }: Props) {
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);

  const total = whitepaper?.pageCount ?? 8;
  const meta = whitepaper ? CATEGORY_META[whitepaper.category] : null;

  useEffect(() => {
    setPage(1);
    setZoom(1);
  }, [whitepaper?.id]);

  useEffect(() => {
    if (!whitepaper) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setPage((p) => Math.min(p + 1, total));
      if (e.key === 'ArrowLeft') setPage((p) => Math.max(p - 1, 1));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [whitepaper, total, onClose]);

  const THUMB_COUNT = Math.min(8, total);
  const thumbPages = Array.from({ length: THUMB_COUNT }, (_, i) => i + 1);

  return (
    <AnimatePresence>
      {whitepaper && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
            style={{
              background: '#0a1628',
              border: '1px solid rgba(255,255,255,0.09)',
              boxShadow: '0 48px 120px rgba(0,0,0,0.6)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, #5e17ea, #1e90ff 50%, #06b6d4)' }} />

            {/* ── Header ── */}
            <div
              className="flex items-center justify-between px-6 py-4 flex-shrink-0"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-center gap-3 min-w-0">
                {meta && (
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: meta.accentColor }}
                  >
                    {meta.icon}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate max-w-[360px]">{whitepaper.title}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-[11px] text-gray-500">
                      <FileText size={9} /> {whitepaper.pageCount} pages
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-gray-500">
                      <Clock size={9} /> {whitepaper.readTime}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-gray-500">
                      <Tag size={9} /> {whitepaper.category}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Zoom controls */}
                <div className="hidden sm:flex items-center gap-1">
                  <button
                    onClick={() => setZoom((z) => Math.max(0.7, z - 0.1))}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/08 transition-all"
                  >
                    <ZoomOut size={13} />
                  </button>
                  <span className="text-[11px] text-gray-500 w-10 text-center tabular-nums">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/08 transition-all"
                  >
                    <ZoomIn size={13} />
                  </button>
                </div>

                <div className="w-px h-5 bg-white/10" />

                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/08 transition-all"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* ── Body ── */}
            <div className="flex flex-1 min-h-0">
              {/* Thumbnails sidebar */}
              <div
                className="hidden sm:flex flex-col gap-2 p-3 overflow-y-auto flex-shrink-0 w-[88px]"
                style={{ background: '#060d1a', borderRight: '1px solid rgba(255,255,255,0.06)' }}
              >
                {thumbPages.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className="relative rounded-lg overflow-hidden flex-shrink-0 transition-all"
                    style={{
                      border: page === p ? '2px solid #5e17ea' : '1px solid rgba(255,255,255,0.08)',
                      background: page === p ? 'rgba(94,23,234,0.08)' : 'transparent',
                    }}
                  >
                    <div
                      className="w-full aspect-[3/4] flex items-center justify-center"
                      style={{ background: '#f5f5f5' }}
                    >
                      <span className="text-[9px] text-gray-400">{p}</span>
                    </div>
                    {page === p && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5e17ea]" />
                    )}
                  </button>
                ))}
                {total > THUMB_COUNT && (
                  <p className="text-[9px] text-gray-600 text-center py-1">+{total - THUMB_COUNT} more</p>
                )}
              </div>

              {/* Main preview */}
              <div className="flex-1 overflow-auto flex items-center justify-center p-6 bg-[#111820]">
                <motion.div
                  key={page}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    width: `${420 * zoom}px`,
                    minHeight: `${560 * zoom}px`,
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top center',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  <MockPDFPage page={page} total={total} title={whitepaper.title} />
                </motion.div>
              </div>
            </div>

            {/* ── Footer ── */}
            <div
              className="flex items-center justify-between px-6 py-4 flex-shrink-0"
              style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: '#060d1a' }}
            >
              {/* Page navigation */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/08 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={15} />
                </button>
                <span className="text-sm text-gray-400 tabular-nums">
                  <span className="text-white font-semibold">{page}</span>
                  <span className="mx-1 text-gray-600">/</span>
                  {total}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(total, p + 1))}
                  disabled={page === total}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/08 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={15} />
                </button>
              </div>

              <p className="hidden sm:block text-[11px] text-gray-600">
                Use ← → arrow keys to navigate
              </p>

              {/* Download CTA */}
              <motion.button
                onClick={() => { onClose(); onDownload(); }}
                whileHover={{ scale: 1.04, boxShadow: '0 8px 28px rgba(94,23,234,0.4)' }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #5e17ea, #1e90ff)' }}
              >
                <Download size={14} />
                Download Full Paper
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
