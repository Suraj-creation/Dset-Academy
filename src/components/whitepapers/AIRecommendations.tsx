import { motion } from 'framer-motion';
import { Sparkles, Download, Clock, ChevronRight, TrendingUp } from 'lucide-react';
import type { Whitepaper } from '@/data/whitepapers';
import { CATEGORY_META } from '@/data/whitepapers';

interface Props {
  whitepapers: Whitepaper[];
  activeCategory: string;
  searchQuery: string;
  savedIds: Set<string>;
  downloadedIds: Set<string>;
  onDownload: (wp: Whitepaper) => void;
  onPreview: (wp: Whitepaper) => void;
}

const REASON_MAP: Record<string, string> = {
  'AI & Machine Learning': 'Matches your AI interest',
  'Industrial IoT':        'Popular in your sector',
  'Mining Technology':     'Trending this week',
  'Healthcare AI':         'Based on your recent views',
  'Data Analytics':        'Complements your downloads',
  'Cloud Infrastructure':  'Recommended by peers',
};

export default function AIRecommendations({
  whitepapers, activeCategory, searchQuery, downloadedIds, onDownload, onPreview,
}: Props) {
  // Build a scored recommendation list
  const scored = whitepapers
    .filter((w) => w.isPublished && !downloadedIds.has(w.id))
    .map((w) => {
      let score = w.downloadCount;
      if (activeCategory !== 'All' && w.category === activeCategory) score += 500;
      const q = searchQuery.toLowerCase();
      if (q && (w.title.toLowerCase().includes(q) || w.tags.some((t) => t.toLowerCase().includes(q)))) {
        score += 300;
      }
      return { ...w, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  if (scored.length === 0) return null;

  return (
    <section
      className="py-16"
      style={{ background: '#08162b', borderTop: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="container-custom">
        {/* Header */}
        <motion.div
          className="flex items-center gap-3 mb-10"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border"
            style={{ borderColor: 'rgba(6,182,212,0.3)', background: 'rgba(6,182,212,0.07)' }}
          >
            <Sparkles size={11} className="text-cyan-400" />
            <span className="text-[11px] font-bold text-cyan-400 tracking-widest uppercase">
              Recommended For You
            </span>
          </div>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(6,182,212,0.3), transparent)' }} />
          <p className="text-[11px] text-gray-600 hidden sm:block">
            Based on your activity
          </p>
        </motion.div>

        {/* Recommendation cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {scored.map((wp, i) => {
            const meta = CATEGORY_META[wp.category];
            const reason = REASON_MAP[wp.category] ?? 'Recommended for you';

            return (
              <motion.div
                key={wp.id}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.55, delay: i * 0.09 }}
                className="group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer"
                style={{
                  background: 'linear-gradient(180deg, #112240 0%, #0B1B3A 100%)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.28)',
                  transition: 'border-color 0.3s, box-shadow 0.3s, transform 0.3s',
                }}
                whileHover={{
                  y: -4,
                  boxShadow: '0 24px 56px rgba(0,0,0,0.45), 0 0 0 1px rgba(6,182,212,0.22)',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(6,182,212,0.22)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; }}
              >
                {/* AI tag ribbon */}
                <div
                  className="absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold z-10"
                  style={{ background: 'rgba(6,182,212,0.15)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.25)' }}
                >
                  <Sparkles size={8} />
                  AI Pick
                </div>

                {/* Header visual */}
                <div
                  className="relative h-[130px] flex-shrink-0 overflow-hidden"
                  style={{ background: `linear-gradient(135deg, #0a1628 0%, #1e3270 52%, #312e81 100%)` }}
                >
                  {/* Grid texture */}
                  <div
                    className="absolute inset-0 opacity-[0.05]"
                    style={{
                      backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='0.5'%3E%3Cpath d='M0 15h30M15 0v30'/%3E%3C/g%3E%3C/svg%3E\")",
                    }}
                  />
                  {/* Glow on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: 'radial-gradient(ellipse at 40% 50%, rgba(6,182,212,0.18) 0%, transparent 65%)' }}
                  />

                  {/* Category icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-300 group-hover:scale-110"
                      style={{
                        background: 'rgba(255,255,255,0.07)',
                        border: '1px solid rgba(255,255,255,0.13)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                      }}
                    >
                      {meta.icon}
                    </div>
                  </div>

                  {/* Trending indicator */}
                  {i === 0 && (
                    <div className="absolute bottom-2.5 right-3 flex items-center gap-1 text-[9px] font-bold text-emerald-400">
                      <TrendingUp size={9} />
                      Top Pick
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="flex flex-col flex-1 p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  {/* Reason chip */}
                  <div
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold mb-3 self-start"
                    style={{ background: 'rgba(6,182,212,0.08)', color: '#67e8f9', border: '1px solid rgba(6,182,212,0.15)' }}
                  >
                    {reason}
                  </div>

                  {/* Title */}
                  <h3 className="text-[13px] font-semibold text-white leading-snug line-clamp-2 mb-2 group-hover:text-cyan-300 transition-colors duration-200">
                    {wp.title}
                  </h3>

                  {/* Meta */}
                  <div className="flex items-center gap-3 text-[10px] text-gray-600 mb-3">
                    <span className="flex items-center gap-1"><Download size={9} /> {wp.downloadCount}</span>
                    <span className="flex items-center gap-1"><Clock size={9} /> {wp.readTime}</span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4 flex-1">
                    {wp.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 rounded-md text-[9px] font-medium"
                        style={{ background: 'rgba(30,58,138,0.4)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.2)' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => onDownload(wp)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-semibold text-white transition-all"
                      style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', border: '1px solid rgba(59,130,246,0.25)' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, #1e40af, #2563eb)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, #1d4ed8, #3b82f6)'; }}
                    >
                      <Download size={11} />
                      Get
                    </button>
                    <button
                      onClick={() => onPreview(wp)}
                      className="px-2.5 py-2 rounded-lg text-gray-400 hover:text-white transition-all"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
                    >
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
