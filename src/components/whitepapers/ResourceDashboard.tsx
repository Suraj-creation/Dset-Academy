import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, BookOpen, Clock, TrendingUp, Star, Eye,
  BarChart2, Bookmark, User, ChevronRight, CheckCircle, FileText,
} from 'lucide-react';
import type { Whitepaper } from '@/data/whitepapers';
import { CATEGORY_META } from '@/data/whitepapers';

// ── Mock data ────────────────────────────────────────────────────────────────

const MOCK_USER = { name: 'Alex R.', role: 'AI Engineer', avatar: 'AR', downloads: 7, saved: 4 };

const MOCK_RECENT: Array<{ id: string; title: string; category: string; timeAgo: string }> = [
  { id: 'wp-004', title: 'LLM Integration Patterns for Enterprise Applications', category: 'AI & Machine Learning', timeAgo: '2h ago' },
  { id: 'wp-001', title: 'AI-Driven Predictive Maintenance in Industrial Mining', category: 'Mining Technology', timeAgo: 'Yesterday' },
  { id: 'wp-003', title: 'Responsible AI in Healthcare', category: 'Healthcare AI', timeAgo: '3d ago' },
];

const MOCK_READING: Array<{ id: string; title: string; progress: number; color: string }> = [
  { id: 'wp-004', title: 'LLM Integration Patterns', progress: 62, color: '#5e17ea' },
  { id: 'wp-002', title: 'Industrial IoT Architecture', progress: 38, color: '#1e90ff' },
  { id: 'wp-005', title: 'Modern Data Lakehouse Architecture', progress: 15, color: '#06b6d4' },
];

const MOCK_HISTORY: Array<{ title: string; date: string; size: string }> = [
  { title: 'LLM Integration Patterns', date: 'May 18', size: '2.4 MB' },
  { title: 'Predictive Maintenance', date: 'May 15', size: '1.8 MB' },
  { title: 'Responsible AI in Healthcare', date: 'May 12', size: '3.1 MB' },
  { title: 'Industrial IoT Architecture', date: 'May 8', size: '2.2 MB' },
];

const MONTHLY_STATS = [28, 42, 35, 58, 72, 88, 64, 95, 78, 112, 89, 134];
const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

// ── Sub-components ────────────────────────────────────────────────────────────

const CARD_STYLE = {
  background: 'linear-gradient(135deg, #0d1f38 0%, #0B1B3A 100%)',
  border: '1px solid rgba(255,255,255,0.07)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.28)',
};

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 12px 36px rgba(0,0,0,0.38), 0 0 0 1px rgba(94,23,234,0.14)' }}
      transition={{ duration: 0.25 }}
      className={`rounded-2xl p-5 ${className}`}
      style={CARD_STYLE}
    >
      {children}
    </motion.div>
  );
}

function StatCounter({ value, label, icon: Icon, color }: { value: number; label: string; icon: React.ElementType; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18`, border: `1px solid ${color}28` }}
      >
        <Icon size={15} style={{ color }} />
      </div>
      <div>
        <p className="text-lg font-bold text-white tabular-nums leading-none">{value}</p>
        <p className="text-[11px] text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function MiniBarChart() {
  const max = Math.max(...MONTHLY_STATS);
  return (
    <div className="flex items-end gap-[3px] h-14">
      {MONTHLY_STATS.map((v, i) => (
        <motion.div
          key={i}
          className="flex-1 rounded-sm cursor-pointer group relative"
          style={{ background: `linear-gradient(180deg, #5e17ea, #1e90ff)`, opacity: 0.7, minWidth: 0 }}
          initial={{ height: 0 }}
          whileInView={{ height: `${(v / max) * 100}%` }}
          whileHover={{ opacity: 1, scaleX: 1.15 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.04 }}
          title={`${MONTHS[i]}: ${v}`}
        />
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  savedIds: Set<string>;
  downloadedIds: Set<string>;
  whitepapers: Whitepaper[];
  onDownload: (wp: Whitepaper) => void;
}

export default function ResourceDashboard({ savedIds, downloadedIds, whitepapers, onDownload }: Props) {
  const [activeTab, setActiveTab] = useState<'recent' | 'history'>('recent');
  const saved = whitepapers.filter((w) => savedIds.has(w.id));
  const recommended = whitepapers.filter((w) => w.isPublished).slice(0, 3);

  return (
    <section
      className="py-16"
      style={{ background: '#071326', borderTop: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="container-custom">
        {/* Section header */}
        <motion.div
          className="flex items-center gap-3 mb-10"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border"
            style={{ borderColor: 'rgba(94,23,234,0.3)', background: 'rgba(94,23,234,0.08)' }}
          >
            <BarChart2 size={11} className="text-[#a78bfa]" />
            <span className="text-[11px] font-bold text-[#a78bfa] tracking-widest uppercase">
              Resource Center
            </span>
          </div>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(94,23,234,0.3), transparent)' }} />
        </motion.div>

        {/* Dashboard grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

          {/* ── Welcome card (spans 2 cols on xl) ── */}
          <motion.div
            className="xl:col-span-2 relative overflow-hidden rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            style={{
              background: 'linear-gradient(135deg, #1a0a3a 0%, #0d1f38 50%, #0a1628 100%)',
              border: '1px solid rgba(94,23,234,0.25)',
              boxShadow: '0 4px 24px rgba(94,23,234,0.12)',
            }}
          >
            {/* Top line */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px]" style={{ background: 'linear-gradient(90deg, #5e17ea, #1e90ff 60%, transparent)' }} />
            {/* Corner glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-20" style={{ background: '#5e17ea' }} />

            <div className="relative z-10 flex items-start gap-4">
              {/* Avatar */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black text-white flex-shrink-0 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #5e17ea, #1e90ff)' }}
              >
                {MOCK_USER.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-medium mb-0.5">Welcome back</p>
                <h3 className="text-xl font-bold text-white">{MOCK_USER.name}</h3>
                <p className="text-sm text-[#a78bfa]">{MOCK_USER.role}</p>
              </div>
            </div>

            {/* Stats row */}
            <div
              className="relative z-10 mt-6 grid grid-cols-3 gap-4 pt-5"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <StatCounter value={downloadedIds.size || MOCK_USER.downloads} label="Downloaded" icon={Download} color="#5e17ea" />
              <StatCounter value={savedIds.size || MOCK_USER.saved} label="Saved" icon={Bookmark} color="#1e90ff" />
              <StatCounter value={MOCK_RECENT.length} label="Viewed" icon={Eye} color="#06b6d4" />
            </div>

            {/* Download activity mini chart */}
            <div className="relative z-10 mt-5">
              <p className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold mb-2">Monthly Activity</p>
              <MiniBarChart />
            </div>
          </motion.div>

          {/* ── Reading Progress ── */}
          <motion.div
            className="rounded-2xl p-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={CARD_STYLE}
          >
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={13} className="text-[#5e17ea]" />
              <p className="text-xs font-bold text-white">Continue Reading</p>
            </div>
            <div className="space-y-4">
              {MOCK_READING.map((item) => (
                <div key={item.id}>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="text-[12px] text-gray-300 leading-snug line-clamp-1 flex-1">{item.title}</p>
                    <span className="text-[11px] font-bold flex-shrink-0" style={{ color: item.color }}>{item.progress}%</span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: item.color }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.progress}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Recommended Papers (mini) ── */}
          <motion.div
            className="rounded-2xl p-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            style={CARD_STYLE}
          >
            <div className="flex items-center gap-2 mb-4">
              <Star size={13} className="text-[#f59e0b]" />
              <p className="text-xs font-bold text-white">Recommended</p>
            </div>
            <div className="space-y-3">
              {recommended.map((wp) => {
                const m = CATEGORY_META[wp.category];
                return (
                  <div key={wp.id} className="flex items-center gap-3 group cursor-pointer">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                      style={{ background: m.accentColor }}
                    >
                      {m.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-gray-300 leading-snug line-clamp-1 group-hover:text-white transition-colors">{wp.title}</p>
                      <p className="text-[10px] text-gray-600 mt-0.5">{wp.downloadCount} downloads</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* ── Recent / History tabs (spans 2 cols) ── */}
          <motion.div
            className="md:col-span-2 rounded-2xl p-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={CARD_STYLE}
          >
            {/* Tab header */}
            <div className="flex items-center gap-1 mb-5">
              {(['recent', 'history'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-3.5 py-1.5 rounded-lg text-[12px] font-semibold capitalize transition-all"
                  style={
                    activeTab === tab
                      ? { background: 'rgba(94,23,234,0.18)', color: '#a78bfa' }
                      : { color: 'rgba(255,255,255,0.38)' }
                  }
                >
                  {tab === 'recent' ? 'Recently Viewed' : 'Download History'}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'recent' && (
                <motion.div
                  key="recent"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2"
                >
                  {MOCK_RECENT.map((item, i) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer group"
                      style={{ background: 'rgba(255,255,255,0.02)' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; }}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #5e17ea40, #1e90ff40)' }}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12.5px] text-gray-300 truncate group-hover:text-white transition-colors">{item.title}</p>
                        <p className="text-[10px] text-gray-600 mt-0.5">{item.category}</p>
                      </div>
                      <span className="text-[10px] text-gray-600 flex-shrink-0">{item.timeAgo}</span>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'history' && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        {['Document', 'Date', 'Size'].map((h) => (
                          <th key={h} className="pb-2 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="space-y-1">
                      {MOCK_HISTORY.map((item, i) => (
                        <tr
                          key={i}
                          className="group cursor-pointer"
                          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
                        >
                          <td className="py-2.5 pr-4">
                            <div className="flex items-center gap-2">
                              <CheckCircle size={11} className="text-emerald-500 flex-shrink-0" />
                              <span className="text-[12.5px] text-gray-300 truncate max-w-[180px] group-hover:text-white transition-colors">
                                {item.title}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 pr-4 text-[11px] text-gray-500 whitespace-nowrap">{item.date}</td>
                          <td className="py-2.5 text-[11px] text-gray-500 whitespace-nowrap">{item.size}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── Saved resources ── */}
          <motion.div
            className="md:col-span-2 rounded-2xl p-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.25 }}
            style={CARD_STYLE}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bookmark size={13} className="text-[#1e90ff]" />
                <p className="text-xs font-bold text-white">Saved Resources</p>
              </div>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(30,144,255,0.12)', color: '#60a5fa' }}
              >
                {saved.length > 0 ? saved.length : 0}
              </span>
            </div>

            {saved.length === 0 ? (
              <div className="py-6 text-center">
                <Bookmark size={22} className="text-gray-700 mx-auto mb-2" />
                <p className="text-xs text-gray-600">
                  Bookmark whitepapers to save them here
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {saved.map((wp) => {
                  const m = CATEGORY_META[wp.category];
                  return (
                    <div key={wp.id} className="flex items-center gap-3 group">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                        style={{ background: m.accentColor }}
                      >
                        {m.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-gray-300 truncate group-hover:text-white transition-colors">{wp.title}</p>
                      </div>
                      <motion.button
                        onClick={() => onDownload(wp)}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-shrink-0 p-1.5 rounded-lg transition-colors"
                        style={{ background: 'rgba(30,144,255,0.1)', color: '#60a5fa' }}
                      >
                        <Download size={11} />
                      </motion.button>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* ── Mini analytics widgets row ── */}
          {[
            { label: 'Avg Read Time', value: '16 min', icon: Clock, color: '#5e17ea', sub: 'per whitepaper' },
            { label: 'Completion Rate', value: '73%', icon: TrendingUp, color: '#10b981', sub: '+8% this month' },
            { label: 'Papers Shared', value: '12', icon: FileText, color: '#1e90ff', sub: 'via link' },
            { label: 'Hours Saved', value: '8.4', icon: Star, color: '#f59e0b', sub: 'vs manual research' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.3 + i * 0.06 }}
              whileHover={{ y: -3, boxShadow: `0 12px 32px rgba(0,0,0,0.35), 0 0 0 1px ${stat.color}22` }}
              className="relative overflow-hidden rounded-2xl p-5"
              style={{
                background: 'linear-gradient(135deg, #0d1f38 0%, #0B1B3A 100%)',
                border: `1px solid ${stat.color}18`,
              }}
            >
              {/* corner glow */}
              <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-xl" style={{ background: stat.color, opacity: 0.09 }} />
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${stat.color}18`, border: `1px solid ${stat.color}25` }}
              >
                <stat.icon size={14} style={{ color: stat.color }} />
              </div>
              <p className="text-2xl font-bold text-white tabular-nums mb-0.5">{stat.value}</p>
              <p className="text-[11px] font-semibold text-gray-400">{stat.label}</p>
              <p className="text-[10px] text-gray-600 mt-0.5">{stat.sub}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
