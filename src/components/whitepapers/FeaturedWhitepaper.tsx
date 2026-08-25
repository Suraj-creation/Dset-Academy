import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, TrendingUp, Star, Clock, FileText, ChevronRight, Eye } from 'lucide-react';
import type { Whitepaper } from '@/data/whitepapers';
import { CATEGORY_META } from '@/data/whitepapers';

interface Props {
  whitepaper: Whitepaper;
  onDownload: () => void;
  onPreview: () => void;
}

// Floating ambient particles
function FloatingParticles() {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 4,
    delay: Math.random() * 4,
    duration: 6 + Math.random() * 6,
    color: ['#5e17ea', '#1e90ff', '#06b6d4'][i % 3],
  }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full opacity-30"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, background: p.color }}
          animate={{ y: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

export default function FeaturedWhitepaper({ whitepaper, onDownload, onPreview }: Props) {
  const meta = CATEGORY_META[whitepaper.category];
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  // Mouse tracking for gradient glow
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const onMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      if (glowRef.current) {
        glowRef.current.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(94,23,234,0.18) 0%, rgba(30,144,255,0.10) 40%, transparent 65%)`;
      }
    };
    card.addEventListener('mousemove', onMove);
    return () => card.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <section
      className="py-16"
      style={{ background: 'linear-gradient(180deg, #071326 0%, #08162b 100%)' }}
    >
      <div className="container-custom">
        {/* Header */}
        <motion.div
          className="flex items-center gap-3 mb-8"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border"
            style={{ borderColor: 'rgba(30,144,255,0.3)', background: 'rgba(30,144,255,0.08)' }}
          >
            <Star size={11} className="text-[#60a5fa]" />
            <span className="text-[11px] font-bold text-[#60a5fa] tracking-widest uppercase">
              Featured Resource
            </span>
          </div>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(30,144,255,0.3), transparent)' }} />
        </motion.div>

        {/* Main featured card */}
        <motion.div
          ref={cardRef}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
          className="relative overflow-hidden rounded-3xl"
          style={{
            background: 'linear-gradient(135deg, #0a1a34 0%, #0d2146 50%, #0a1a34 100%)',
            border: '1px solid rgba(94,23,234,0.25)',
            boxShadow: '0 40px 100px rgba(0,0,0,0.45), 0 0 0 1px rgba(30,144,255,0.08)',
          }}
        >
          {/* Animated gradient glow overlay */}
          <div ref={glowRef} className="absolute inset-0 pointer-events-none transition-all duration-300" />

          {/* Top gradient border line */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: 'linear-gradient(90deg, #5e17ea, #1e90ff 50%, #06b6d4)' }}
          />

          <FloatingParticles />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_0.85fr] gap-0">
            {/* ── LEFT: Content ── */}
            <div className="p-8 sm:p-10 lg:p-12">
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-7">
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase"
                  style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)' }}
                >
                  <TrendingUp size={9} /> Trending
                </span>
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase"
                  style={{ background: 'rgba(30,144,255,0.12)', color: '#60a5fa', border: '1px solid rgba(30,144,255,0.25)' }}
                >
                  <Star size={9} /> Most Downloaded
                </span>
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium"
                  style={{ background: 'rgba(94,23,234,0.12)', color: '#a78bfa', border: '1px solid rgba(94,23,234,0.2)' }}
                >
                  {whitepaper.category}
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold text-white leading-[1.1] tracking-tight mb-5">
                {whitepaper.title}
              </h2>

              <p className="text-gray-300 text-[15px] leading-relaxed mb-8 max-w-lg">
                {whitepaper.description}
              </p>

              {/* Stat pills */}
              <div className="flex flex-wrap gap-4 mb-9">
                {[
                  { icon: Download, label: `${whitepaper.downloadCount.toLocaleString()} downloads`, color: '#5e17ea' },
                  { icon: FileText, label: `${whitepaper.pageCount} pages`, color: '#1e90ff' },
                  { icon: Clock, label: whitepaper.readTime, color: '#06b6d4' },
                ].map(({ icon: Icon, label, color }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${color}18`, border: `1px solid ${color}28` }}
                    >
                      <Icon size={12} style={{ color }} />
                    </div>
                    <span className="text-sm text-gray-300">{label}</span>
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-10">
                {whitepaper.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-md text-[11px] font-medium"
                    style={{ background: 'rgba(30,58,138,0.4)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.2)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-3">
                <motion.button
                  onClick={onDownload}
                  whileHover={{ scale: 1.04, boxShadow: '0 12px 40px rgba(94,23,234,0.45)' }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #5e17ea, #1e90ff)' }}
                >
                  <Download size={15} />
                  Download Whitepaper
                </motion.button>
                <motion.button
                  onClick={onPreview}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white/70 transition-all"
                  style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.25)'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'; }}
                >
                  <Eye size={14} />
                  Preview
                  <ChevronRight size={13} />
                </motion.button>
              </div>
            </div>

            {/* ── RIGHT: Visual panel ── */}
            <div
              className="relative hidden lg:flex flex-col items-center justify-center p-12 overflow-hidden"
              style={{ background: meta.gradient, borderLeft: '1px solid rgba(255,255,255,0.06)' }}
            >
              {/* Pulse ring */}
              <motion.div
                className="absolute w-56 h-56 rounded-full"
                style={{ background: `${meta.color}08`, border: `1px solid ${meta.color}20` }}
                animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.2, 0.5] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute w-36 h-36 rounded-full"
                style={{ background: `${meta.color}12`, border: `1px solid ${meta.color}30` }}
                animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.3, 0.6] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              />

              {/* Icon */}
              <motion.div
                className="relative z-10 text-7xl"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                {meta.icon}
              </motion.div>

              {/* Category label */}
              <div
                className="relative z-10 mt-6 px-4 py-2 rounded-full text-xs font-semibold"
                style={{ background: `${meta.color}20`, color: meta.color, border: `1px solid ${meta.color}30` }}
              >
                {whitepaper.category}
              </div>

              {/* Download count badge */}
              <motion.div
                className="absolute bottom-8 right-8 flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold"
                style={{ background: 'rgba(0,0,0,0.4)', color: '#60a5fa', border: '1px solid rgba(30,144,255,0.25)' }}
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <Download size={10} />
                {whitepaper.downloadCount.toLocaleString()}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
