import { useState, useMemo, useRef } from 'react';
import { GetServerSideProps } from 'next';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import LeadCaptureModal, { type LeadSubmission } from '@/components/whitepapers/LeadCaptureModal';
import CursorGlow from '@/components/whitepapers/CursorGlow';
import DownloadSuccess from '@/components/whitepapers/DownloadSuccess';
import FeaturedWhitepaper from '@/components/whitepapers/FeaturedWhitepaper';
import PDFPreviewModal from '@/components/whitepapers/PDFPreviewModal';
import {
  Download, Clock, FileText, Search,
  Users, ArrowRight, ChevronRight, Bookmark,
} from 'lucide-react';
import {
  WHITEPAPER_CATEGORIES, CATEGORY_META,
  type Whitepaper, type WhitepaperCategory,
} from '@/data/whitepapers';
import type { WhitepaperRecord } from '@/lib/whitepapers.server';

// ── SSR ────────────────────────────────────────────────────────────────────

export const getServerSideProps: GetServerSideProps = async () => {
  const { getPublishedWhitepapers } = await import('@/lib/whitepapers.server');
  const whitepapers = await getPublishedWhitepapers();
  return { props: { whitepapers } };
};

// ── Page ──────────────────────────────────────────────────────────────────

interface Props { whitepapers: WhitepaperRecord[]; }

export default function WhitepapersPage({ whitepapers: initialWhitepapers }: Props) {
  const [activeCategory, setActiveCategory] = useState<WhitepaperCategory | 'All'>('All');
  const [searchQuery,    setSearchQuery]     = useState('');
  const [selectedWp,     setSelectedWp]      = useState<Whitepaper | null>(null);
  const [savedIds,       setSavedIds]        = useState<Set<string>>(new Set());
  const [previewWp,      setPreviewWp]       = useState<Whitepaper | null>(null);
  const [showSuccess,    setShowSuccess]     = useState(false);
  const [successTitle,   setSuccessTitle]    = useState('');

  const published = initialWhitepapers as Whitepaper[];

  // Dynamic stats from real data
  const totalDownloads = published.reduce((sum, w) => sum + w.downloadCount, 0);
  const uniqueCategories = new Set(published.map((w) => w.category)).size;
  const STATS = [
    { value: `${published.length}+`, label: 'Research Papers', color: '#5e17ea' },
    { value: String(uniqueCategories), label: 'Topic Areas', color: '#1e90ff' },
    { value: totalDownloads.toLocaleString(), label: 'Total Downloads', color: '#06b6d4' },
    { value: '100%', label: 'Free to Access', color: '#10b981' },
  ];

  const featuredWp = useMemo(
    () => [...published].sort((a, b) => b.downloadCount - a.downloadCount)[0],
    [published],
  );

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return published.filter((w) => {
      const matchCat    = activeCategory === 'All' || w.category === activeCategory;
      const matchSearch = !q ||
        w.title.toLowerCase().includes(q) ||
        w.description.toLowerCase().includes(q) ||
        w.tags.some((t) => t.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [published, activeCategory, searchQuery]);

  const categoryCounts = useMemo(() => {
    const c: Record<string, number> = { All: published.length };
    WHITEPAPER_CATEGORIES.forEach((cat) => { c[cat] = published.filter((w) => w.category === cat).length; });
    return c;
  }, [published]);

  const handleSaveToggle = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleLeadSuccess = (lead: LeadSubmission) => {
    const wp = published.find((w) => w.id === lead.whitepaperID);
    if (wp) { setSuccessTitle(wp.title); setShowSuccess(true); }
  };

  return (
    <Layout
      title="Whitepapers & Resources — DSeT Consulting"
      description="Download free research papers, technical guides, and industry insights from DSeT's AI and industrial intelligence practice."
    >
      <CursorGlow />

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <section
        className="relative isolate overflow-hidden pt-28 pb-16 sm:pb-20 lg:min-h-[620px] lg:pb-24"
        style={{ background: 'linear-gradient(135deg, #08162b 0%, #071326 48%, #0B1B3A 100%)' }}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#5e17ea] via-[#1e90ff] to-[#06b6d4]" />

        {/* Subtle grid background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.055]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(30,144,255,0.42) 1px, transparent 1px), linear-gradient(90deg, rgba(30,144,255,0.42) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'linear-gradient(90deg, rgba(0,0,0,0.55), transparent 72%)',
          }}
        />

        {/* Full-bleed abstract visual on the right */}
        <HeroAbstractVisual />

        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-[0.92fr_1.08fr] gap-10 items-center">

            {/* Left — Text ──────────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65 }}
              className="max-w-2xl"
            >
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 mb-5 px-3.5 py-1.5 rounded-full border border-[#5e17ea]/30 bg-[#5e17ea]/10">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5e17ea] animate-pulse" />
                <span className="text-[12px] font-semibold text-[#a78bfa] tracking-wide uppercase">
                  DSeT Research Library
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.06] tracking-tight mb-5 text-white">
                Whitepapers &amp;{' '}
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(90deg, #8b5cf6, #1e90ff 58%, #06b6d4)' }}
                >
                  Resources
                </span>
              </h1>

              <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-xl">
                In-depth technical guides, AI implementation frameworks, and industry
                research from DSeT&apos;s engineering practice, created for enterprise teams
                moving from pilots to production.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <button
                  onClick={() =>
                    document.getElementById('resources-grid')?.scrollIntoView({ behavior: 'smooth' })
                  }
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white transition-all shadow-lg hover:shadow-[0_8px_30px_rgba(94,23,234,0.45)]"
                  style={{ background: 'linear-gradient(135deg, #5e17ea, #1e90ff)' }}
                >
                  Browse All Resources <ArrowRight size={15} />
                </button>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white/70 border border-white/15 hover:border-white/30 hover:text-white transition-all"
                >
                  Request Custom Research <ChevronRight size={15} />
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-5">
                {['No paywall', 'Expert-authored guides', 'Updated regularly'].map((item, i) => (
                  <span key={i} className="flex items-center gap-2 text-sm text-gray-400">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold"
                      style={{ background: 'linear-gradient(135deg, #5e17ea, #1e90ff)' }}
                    >
                      &#10003;
                    </span>
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Right column — spacer (visual is absolute-positioned) */}
            <div className="hidden lg:block" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* ══ FEATURED WHITEPAPER ══════════════════════════════════════════ */}
      {featuredWp && (
        <FeaturedWhitepaper
          whitepaper={featuredWp}
          onDownload={() => setSelectedWp(featuredWp)}
          onPreview={() => setPreviewWp(featuredWp)}
        />
      )}

      {/* ══ STATS STRIP ══════════════════════════════════════════════════ */}
      <section
        style={{
          background: 'rgba(7,19,38,0.98)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/[0.07]">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="flex flex-col items-center justify-center py-8 px-6 text-center"
              >
                <div className="text-3xl font-bold mb-1" style={{ color: s.color }}>
                  {s.value}
                </div>
                <div className="text-xs text-gray-400 font-medium">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SEARCH + FILTERS ══════════════════════════════════════════════ */}
      <section
        id="resources-grid"
        className="py-10"
        style={{
          background: '#0B1B3A',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="container-custom">
          {/* Search bar */}
          <div className="max-w-xl mx-auto mb-7">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search by topic, technology, or industry…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 text-sm rounded-xl text-white placeholder-gray-500 transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(94,23,234,0.5)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 3px rgba(94,23,234,0.12)';
                }}
                onBlur={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.10)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {(['All', ...WHITEPAPER_CATEGORIES] as const).map((cat) => {
              const count    = categoryCounts[cat as string] ?? 0;
              if (count === 0 && cat !== 'All') return null;
              const isActive = activeCategory === cat;
              const color    = cat === 'All' ? '#5e17ea' : CATEGORY_META[cat as WhitepaperCategory]?.color;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat as WhitepaperCategory | 'All')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium transition-all border"
                  style={
                    isActive
                      ? { background: color, borderColor: color, color: '#fff' }
                      : {
                          background: 'rgba(255,255,255,0.04)',
                          borderColor: 'rgba(255,255,255,0.12)',
                          color: 'rgba(255,255,255,0.60)',
                        }
                  }
                >
                  {cat}
                  {!isActive && (
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.40)' }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {(searchQuery || activeCategory !== 'All') && (
            <p className="text-center text-xs text-gray-500 mt-5">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
              {activeCategory !== 'All' && (
                <> in <strong className="text-gray-300">{activeCategory}</strong></>
              )}
              {searchQuery && <> matching &ldquo;{searchQuery}&rdquo;</>}
              {' — '}
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                className="text-[#5e17ea] hover:underline"
              >
                Clear
              </button>
            </p>
          )}
        </div>
      </section>

      {/* ══ CARDS GRID ═══════════════════════════════════════════════════ */}
      <section className="py-14" style={{ background: '#071326' }}>
        <div className="container-custom">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((wp, i) => (
                <WhitepaperCard
                  key={wp.id}
                  whitepaper={wp}
                  index={i}
                  saved={savedIds.has(wp.id)}
                  onDownload={() => setSelectedWp(wp)}
                  onSave={() => handleSaveToggle(wp.id)}
                  onPreview={() => setPreviewWp(wp)}
                />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center">
              <p className="text-gray-500 text-sm mb-3">No whitepapers match your search.</p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                className="text-[#5e17ea] text-sm hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ══ CTA STRIP ════════════════════════════════════════════════════ */}
      <section
        className="py-16"
        style={{
          background: 'linear-gradient(135deg, #0a1628 0%, #0f1e3a 100%)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="container-custom max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-[#5e17ea] mb-3">
              Need something specific?
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Get tailored insights for your industry
            </h2>
            <p className="text-gray-400 text-base leading-relaxed mb-8">
              Our engineering and consulting team delivers bespoke research, technology
              assessments, and implementation blueprints for enterprise engagements.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold text-white shadow-lg transition-all hover:shadow-[0_8px_30px_rgba(94,23,234,0.4)]"
                style={{ background: 'linear-gradient(135deg, #5e17ea, #1e90ff)' }}
              >
                Talk to an Expert <ChevronRight size={15} />
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white/70 border border-white/15 hover:border-white/30 hover:text-white transition-all"
              >
                Read the Blog
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Global overlays ─────────────────────────────────────────────── */}

      {selectedWp && (
        <LeadCaptureModal
          whitepaper={selectedWp}
          onClose={() => setSelectedWp(null)}
          onSuccess={handleLeadSuccess}
        />
      )}

      <PDFPreviewModal
        whitepaper={previewWp}
        onClose={() => setPreviewWp(null)}
        onDownload={() => previewWp && setSelectedWp(previewWp)}
      />

      <DownloadSuccess
        show={showSuccess}
        title={successTitle}
        onClose={() => setShowSuccess(false)}
      />

    </Layout>
  );
}

// ── Hero right-side layered artwork — DSeT purple / blue / cyan ──────────

function HeroAbstractVisual() {
  return (
    <div className="pointer-events-none absolute -right-[18vw] top-[-96px] bottom-[-150px] z-0 hidden w-[72vw] select-none overflow-visible lg:block">
      <motion.div
        initial={{ opacity: 0, x: 80 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
        className="absolute inset-0"
      >
        {/* Outermost blurred ambient glow */}
        <div
          className="absolute right-[-6%] top-0 h-[94%] w-[82%] blur-2xl"
          style={{
            background:
              'linear-gradient(140deg, rgba(94,23,234,0.36) 0%, rgba(30,144,255,0.25) 46%, rgba(6,182,212,0.22) 100%)',
            clipPath: 'polygon(24% 0, 100% 0, 100% 86%, 64% 100%, 10% 66%, 0 24%)',
            borderRadius: '36% 0 0 58% / 24% 0 0 52%',
          }}
        />
        {/* Main solid shape */}
        <div
          className="absolute right-[2%] top-[8%] h-[74%] w-[76%]"
          style={{
            background:
              'linear-gradient(132deg, rgba(94,23,234,0.72), rgba(30,144,255,0.52) 52%, rgba(6,182,212,0.36))',
            clipPath: 'polygon(30% 0, 100% 0, 100% 74%, 70% 94%, 18% 82%, 0 38%)',
            borderRadius: '42% 0 0 62% / 28% 0 0 58%',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.16), 0 44px 120px rgba(0,0,0,0.28)',
          }}
        />
        {/* Glassmorphism overlay */}
        <div
          className="absolute right-[10%] top-[16%] h-[64%] w-[70%] opacity-80"
          style={{
            background:
              'linear-gradient(122deg, rgba(255,255,255,0.16), rgba(30,144,255,0.18) 28%, rgba(94,23,234,0.22) 58%, rgba(6,182,212,0.16))',
            clipPath: 'polygon(18% 4%, 100% 0, 92% 82%, 50% 100%, 0 72%, 10% 28%)',
            border: '1px solid rgba(255,255,255,0.13)',
            borderRadius: '42% 0 0 52% / 24% 0 0 48%',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        />
        {/* Diagonal light band — upper */}
        <div
          className="absolute right-[24%] top-[20%] h-[54%] w-[66%] rotate-[-9deg] opacity-90 blur-[1px]"
          style={{
            background:
              'linear-gradient(100deg, transparent 0%, rgba(6,182,212,0.34) 19%, rgba(30,144,255,0.40) 46%, rgba(94,23,234,0.26) 72%, transparent 100%)',
            clipPath: 'polygon(0 38%, 74% 0, 100% 22%, 22% 100%)',
          }}
        />
        {/* Diagonal light band — lower */}
        <div
          className="absolute right-[18%] bottom-[10%] h-[38%] w-[72%] rotate-[8deg] opacity-75"
          style={{
            background:
              'linear-gradient(105deg, transparent 4%, rgba(94,23,234,0.32) 28%, rgba(30,144,255,0.38) 58%, rgba(6,182,212,0.24) 86%, transparent 100%)',
            clipPath: 'polygon(0 40%, 78% 0, 100% 24%, 18% 100%)',
            filter: 'blur(0.2px)',
          }}
        />
        {/* Grid mesh overlay */}
        <div
          className="absolute right-[20%] top-[2%] h-[88%] w-[58%] opacity-[0.18]"
          style={{
            backgroundImage:
              'linear-gradient(120deg, rgba(255,255,255,0.55) 1px, transparent 1px), linear-gradient(28deg, rgba(255,255,255,0.32) 1px, transparent 1px)',
            backgroundSize: '34px 34px, 42px 42px',
            clipPath: 'polygon(34% 0, 100% 6%, 88% 86%, 42% 100%, 0 56%, 12% 18%)',
          }}
        />
        {/* Bottom bloom */}
        <div
          className="absolute bottom-[14%] right-[8%] h-[34%] w-[56%] blur-3xl"
          style={{
            background:
              'linear-gradient(110deg, rgba(6,182,212,0.28), rgba(30,144,255,0.22), rgba(94,23,234,0.18))',
            clipPath: 'polygon(0 28%, 100% 0, 80% 68%, 18% 100%)',
          }}
        />
        {/* Shimmer lines */}
        <div className="absolute right-[31%] top-[13%] h-px w-[34%] rotate-[-24deg] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <div className="absolute right-[20%] top-[58%] h-px w-[42%] rotate-[-24deg] bg-gradient-to-r from-transparent via-cyan-200/25 to-transparent" />
      </motion.div>
    </div>
  );
}

// ── Whitepaper Card ───────────────────────────────────────────────────────

interface CardProps {
  whitepaper: Whitepaper;
  index: number;
  saved: boolean;
  onDownload: () => void;
  onSave: () => void;
  onPreview: () => void;
}

function WhitepaperCard({ whitepaper: wp, index, saved, onDownload, onSave, onPreview }: CardProps) {
  const { icon } = CATEGORY_META[wp.category];
  const cardRef = useRef<HTMLElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-6px)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) cardRef.current.style.transform = '';
  };

  return (
    <motion.article
      ref={cardRef}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.55, delay: index * 0.09 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group flex flex-col rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #112240 0%, #0B1B3A 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.28)',
        transition: 'border-color 0.3s, box-shadow 0.3s, transform 0.18s ease-out',
        willChange: 'transform',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(59,130,246,0.28)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 24px 64px rgba(0,0,0,0.48), 0 0 0 1px rgba(59,130,246,0.26)';
      }}
    >
      {/* ── Header strip ─────────────────────────────────────────────── */}
      <div
        className="relative h-[175px] flex-shrink-0 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a1628 0%, #1e3270 52%, #312e81 100%)' }}
      >
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='0.5'%3E%3Cpath d='M0 15h30M15 0v30'/%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        {/* Radial glow revealed on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background:
              'radial-gradient(ellipse at 35% 45%, rgba(59,130,246,0.22) 0%, transparent 65%)',
          }}
        />
        {/* Top shimmer line on hover */}
        <div
          className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.65), transparent)' }}
        />

        {/* Category icon — centered, frosted glass */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-[30px] transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1.5"
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.14)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              boxShadow: '0 4px 18px rgba(0,0,0,0.32)',
            }}
          >
            {icon}
          </div>
        </div>

        {/* Category pill */}
        <div
          className="absolute top-4 left-4 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider"
          style={{
            background: 'rgba(99,102,241,0.22)',
            color: '#a5b4fc',
            border: '1px solid rgba(99,102,241,0.28)',
            backdropFilter: 'blur(6px)',
          }}
        >
          {wp.category}
        </div>

        {/* Top-right: bookmark */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); onSave(); }}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all backdrop-blur-sm"
            style={{
              background: saved ? 'rgba(94,23,234,0.3)' : 'rgba(0,0,0,0.35)',
              border: saved ? '1px solid rgba(94,23,234,0.5)' : '1px solid rgba(255,255,255,0.12)',
            }}
            title={saved ? 'Remove bookmark' : 'Bookmark'}
          >
            <Bookmark
              size={12}
              style={{ color: saved ? '#a78bfa' : 'rgba(255,255,255,0.4)' }}
              fill={saved ? '#a78bfa' : 'none'}
            />
          </button>
        </div>

        {/* Download count */}
        <div
          className="absolute bottom-3 right-4 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] text-white/45"
          style={{ background: 'rgba(0,0,0,0.35)' }}
        >
          <Download size={9} />
          {wp.downloadCount.toLocaleString()}
        </div>
      </div>

      {/* ── Card body ─────────────────────────────────────────────────── */}
      <div
        className="flex flex-col flex-1 p-5"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        {/* Meta row */}
        <div className="flex items-center gap-4 text-[11px] text-gray-500 mb-3">
          <span className="flex items-center gap-1.5"><FileText size={10} /> {wp.pageCount} pages</span>
          <span className="flex items-center gap-1.5"><Clock size={10} /> {wp.readTime}</span>
          <span className="flex items-center gap-1.5 ml-auto"><Users size={10} /> {wp.downloadCount}</span>
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-semibold text-white leading-snug line-clamp-2 mb-2 transition-colors duration-200 group-hover:text-blue-300">
          {wp.title}
        </h3>

        {/* Description */}
        <p className="text-[13px] text-gray-400 leading-relaxed line-clamp-3 flex-1 mb-4">
          {wp.description}
        </p>

        {/* Tags — muted blue/indigo */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {wp.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-md text-[10px] font-medium"
              style={{
                background: 'rgba(30,58,138,0.40)',
                color: '#93c5fd',
                border: '1px solid rgba(59,130,246,0.20)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={onDownload}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-[13px] font-semibold text-white transition-all duration-200"
            style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', border: '1px solid rgba(59,130,246,0.25)' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, #1e40af, #2563eb)';
              (e.currentTarget as HTMLElement).style.transform = 'scale(1.015)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, #1d4ed8, #3b82f6)';
              (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
            }}
          >
            <Download size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            Download Whitepaper
          </button>
          <button
            onClick={onPreview}
            className="px-3 py-2.5 rounded-xl text-gray-400 hover:text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            title="Quick preview"
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
