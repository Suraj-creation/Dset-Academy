import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote, Shield, Award, Users, Globe } from 'lucide-react';

// ── Static data ───────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Rajesh Nair',
    role: 'Head of Digital Transformation',
    company: 'Tata Steel',
    avatar: 'RN',
    avatarColor: '#5e17ea',
    rating: 5,
    text: "DSeT's whitepapers on Industrial IoT transformed how our engineering team thinks about predictive maintenance. The research quality is exceptional — we've used three papers as internal training material.",
    category: 'Industrial IoT',
    highlight: 'Exceptional research quality',
  },
  {
    id: 2,
    name: 'Sarah Mitchell',
    role: 'Chief Data Officer',
    company: 'Anglo American',
    avatar: 'SM',
    avatarColor: '#1e90ff',
    rating: 5,
    text: "The AI & Machine Learning whitepaper series is among the most practical resources I've found for enterprise implementation. Not just theory — real deployment patterns that we put into practice.",
    category: 'AI & Machine Learning',
    highlight: 'Real deployment patterns',
  },
  {
    id: 3,
    name: 'Dr. Priya Sharma',
    role: 'Director of Innovation',
    company: 'Apollo Hospitals',
    avatar: 'PS',
    avatarColor: '#06b6d4',
    rating: 5,
    text: "The Healthcare AI whitepaper gave us a comprehensive roadmap for responsible AI deployment in clinical settings. The regulatory compliance sections were particularly valuable for our team.",
    category: 'Healthcare AI',
    highlight: 'Comprehensive AI roadmap',
  },
  {
    id: 4,
    name: 'Marcus Weber',
    role: 'VP Engineering',
    company: 'Siemens Energy',
    avatar: 'MW',
    avatarColor: '#10b981',
    rating: 5,
    text: "We've integrated DSeT's cloud infrastructure frameworks across three regions. The whitepapers provided the architecture blueprints our teams needed to move faster with confidence.",
    category: 'Cloud Infrastructure',
    highlight: 'Architecture blueprints',
  },
  {
    id: 5,
    name: 'Ananya Krishnan',
    role: 'Analytics Lead',
    company: 'HDFC Bank',
    avatar: 'AK',
    avatarColor: '#f59e0b',
    rating: 5,
    text: "The Data Analytics papers are meticulously researched and immediately applicable. Our BI team now references them routinely when scoping new initiatives.",
    category: 'Data Analytics',
    highlight: 'Immediately applicable',
  },
];

const CLIENT_LOGOS = [
  { name: 'Tata Steel', initials: 'TS', color: '#5e17ea' },
  { name: 'Anglo American', initials: 'AA', color: '#1e90ff' },
  { name: 'Apollo Hospitals', initials: 'AH', color: '#06b6d4' },
  { name: 'Siemens Energy', initials: 'SE', color: '#10b981' },
  { name: 'HDFC Bank', initials: 'HB', color: '#f59e0b' },
  { name: 'Infosys', initials: 'IN', color: '#ef4444' },
  { name: 'BHEL', initials: 'BH', color: '#8b5cf6' },
  { name: 'Reliance', initials: 'RL', color: '#ec4899' },
];

const TRUST_STATS = [
  { icon: Users, label: 'Enterprise Clients', value: '120+', color: '#5e17ea' },
  { icon: Globe, label: 'Countries', value: '34', color: '#06b6d4' },
  { icon: Award, label: 'Research Papers', value: '48', color: '#1e90ff' },
  { icon: Shield, label: 'ISO Certified', value: '27001', color: '#10b981' },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={11} className={i < rating ? 'text-[#f59e0b] fill-[#f59e0b]' : 'text-gray-700'} />
      ))}
    </div>
  );
}

function Avatar({ initials, color }: { initials: string; color: string }) {
  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
      style={{ background: `linear-gradient(135deg, ${color}, ${color}99)`, border: `1px solid ${color}50` }}
    >
      {initials}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function TrustSection() {
  const [active, setActive] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!autoPlay) return;
    const id = setInterval(() => setActive((a) => (a + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(id);
  }, [autoPlay]);

  const prev = () => { setAutoPlay(false); setActive((a) => (a - 1 + TESTIMONIALS.length) % TESTIMONIALS.length); };
  const next = () => { setAutoPlay(false); setActive((a) => (a + 1) % TESTIMONIALS.length); };

  const current = TESTIMONIALS[active];

  return (
    <section
      className="py-16"
      style={{ background: '#071326', borderTop: '1px solid rgba(255,255,255,0.05)' }}
      ref={ref}
    >
      <div className="container-custom">

        {/* Header */}
        <motion.div
          className="flex items-center gap-3 mb-10"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border"
            style={{ borderColor: 'rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.07)' }}
          >
            <Shield size={11} className="text-amber-400" />
            <span className="text-[11px] font-bold text-amber-400 tracking-widest uppercase">
              Trusted by Industry Leaders
            </span>
          </div>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(245,158,11,0.3), transparent)' }} />
        </motion.div>

        {/* Trust stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {TRUST_STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              className="rounded-2xl p-5 text-center"
              style={{
                background: 'linear-gradient(135deg, #0d1f38 0%, #0B1B3A 100%)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ background: `${stat.color}18`, border: `1px solid ${stat.color}25` }}
              >
                <stat.icon size={15} style={{ color: stat.color }} />
              </div>
              <p className="text-2xl font-bold text-white mb-0.5">{stat.value}</p>
              <p className="text-[11px] text-gray-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Testimonial carousel + client logos */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.45fr] gap-6">

          {/* Carousel */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-3xl overflow-hidden relative"
            style={{
              background: 'linear-gradient(135deg, #0a1a34 0%, #0d2146 100%)',
              border: '1px solid rgba(94,23,234,0.2)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
            }}
          >
            {/* Top accent */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: 'linear-gradient(90deg, #5e17ea, #1e90ff 50%, #06b6d4)' }}
            />

            <div className="p-8 sm:p-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Quote icon */}
                  <div className="mb-6">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(94,23,234,0.15)', border: '1px solid rgba(94,23,234,0.25)' }}
                    >
                      <Quote size={16} className="text-[#a78bfa]" />
                    </div>
                  </div>

                  {/* Rating */}
                  <StarRow rating={current.rating} />

                  {/* Highlight */}
                  <div
                    className="inline-block mt-3 mb-4 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide"
                    style={{ background: 'rgba(94,23,234,0.12)', color: '#c4b5fd', border: '1px solid rgba(94,23,234,0.2)' }}
                  >
                    "{current.highlight}"
                  </div>

                  {/* Quote text */}
                  <p className="text-gray-200 text-[15px] leading-relaxed mb-8">
                    "{current.text}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar initials={current.avatar} color={current.avatarColor} />
                      <div>
                        <p className="text-sm font-bold text-white">{current.name}</p>
                        <p className="text-[11px] text-gray-500">{current.role}</p>
                        <p className="text-[11px] text-gray-600">{current.company}</p>
                      </div>
                    </div>

                    {/* Category tag */}
                    <span
                      className="hidden sm:block px-2.5 py-1 rounded-full text-[10px] font-semibold"
                      style={{ background: 'rgba(6,182,212,0.1)', color: '#67e8f9', border: '1px solid rgba(6,182,212,0.2)' }}
                    >
                      {current.category}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center gap-4 mt-8 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                  onClick={prev}
                  className="p-2 rounded-lg text-gray-500 hover:text-white transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <ChevronLeft size={15} />
                </button>

                {/* Dots */}
                <div className="flex gap-2 flex-1">
                  {TESTIMONIALS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setAutoPlay(false); setActive(i); }}
                      className="transition-all duration-300"
                      style={{
                        height: 4,
                        width: i === active ? 20 : 8,
                        borderRadius: 99,
                        background: i === active ? '#5e17ea' : 'rgba(255,255,255,0.15)',
                      }}
                    />
                  ))}
                </div>

                <button
                  onClick={next}
                  className="p-2 rounded-lg text-gray-500 hover:text-white transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Client logos */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="rounded-3xl p-7"
            style={{
              background: 'linear-gradient(135deg, #0d1f38 0%, #0B1B3A 100%)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <p className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold mb-5">
              Trusted by teams at
            </p>

            <div className="grid grid-cols-2 gap-3">
              {CLIENT_LOGOS.map((logo, i) => (
                <motion.div
                  key={logo.name}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.35, delay: 0.35 + i * 0.05 }}
                  whileHover={{ scale: 1.04, y: -1 }}
                  className="flex items-center gap-2.5 p-3 rounded-xl cursor-default transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = `${logo.color}40`; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'; }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black text-white flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${logo.color}CC, ${logo.color}66)` }}
                  >
                    {logo.initials}
                  </div>
                  <span className="text-[11px] font-medium text-gray-400 truncate">{logo.name}</span>
                </motion.div>
              ))}
            </div>

            {/* Enterprise badge */}
            <motion.div
              className="mt-5 p-4 rounded-2xl text-center"
              style={{ background: 'rgba(94,23,234,0.08)', border: '1px solid rgba(94,23,234,0.15)' }}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.8 }}
            >
              <Shield size={18} className="text-[#a78bfa] mx-auto mb-2" />
              <p className="text-[11px] font-bold text-white mb-1">Enterprise Grade</p>
              <p className="text-[10px] text-gray-600">ISO 27001 · SOC 2 Type II · GDPR Compliant</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
