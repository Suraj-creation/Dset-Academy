import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { TrendingUp, Download, Users, BarChart2, Globe, Zap } from 'lucide-react';
import { WHITEPAPER_CATEGORIES, CATEGORY_META } from '@/data/whitepapers';
import type { Whitepaper } from '@/data/whitepapers';

const MONTHLY = [
  { m: 'Jan', v: 52 }, { m: 'Feb', v: 78 }, { m: 'Mar', v: 94 },
  { m: 'Apr', v: 67 }, { m: 'May', v: 120 }, { m: 'Jun', v: 145 },
  { m: 'Jul', v: 98 }, { m: 'Aug', v: 162 }, { m: 'Sep', v: 134 },
  { m: 'Oct', v: 178 }, { m: 'Nov', v: 145 }, { m: 'Dec', v: 190 },
];

const TOP_COUNTRIES = [
  { name: 'India', pct: 38, flag: '🇮🇳' },
  { name: 'United States', pct: 24, flag: '🇺🇸' },
  { name: 'Germany', pct: 12, flag: '🇩🇪' },
  { name: 'Australia', pct: 8, flag: '🇦🇺' },
  { name: 'South Africa', pct: 6, flag: '🇿🇦' },
  { name: 'Others', pct: 12, flag: '🌍' },
];

const CIRCUMFERENCE = 2 * Math.PI * 36;
const BAR_MAX_PX = 96;

function AnimCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref as React.RefObject<HTMLElement>, { once: true });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const DURATION = 1600;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min((now - start) / DURATION, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.floor(eased * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target]);

  return <span ref={ref}>{value.toLocaleString()}{suffix}</span>;
}

function BarChart() {
  const max = Math.max(...MONTHLY.map((d) => d.v));
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref as React.RefObject<HTMLElement>, { once: true });

  return (
    <div ref={ref} className="flex items-end gap-1 w-full" style={{ height: 128 }}>
      {MONTHLY.map((d, i) => {
        const barH = Math.round((d.v / max) * BAR_MAX_PX);
        return (
          <div key={d.m} className="flex-1 flex flex-col items-center gap-0.5">
            <div
              className="w-full rounded-t-sm cursor-pointer flex-shrink-0"
              title={`${d.m}: ${d.v}`}
              style={{
                background: 'linear-gradient(180deg, #5e17ea, #1e90ff)',
                opacity: 0.8,
                height: inView ? barH : 0,
                transition: `height 0.55s cubic-bezier(0.16,1,0.3,1) ${i * 0.05}s`,
              }}
            />
            <span className="text-[8px] text-gray-700 flex-shrink-0">{d.m}</span>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, d) => s + d.value, 0);
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref as unknown as React.RefObject<HTMLElement>, { once: true });
  let offset = 0;

  return (
    <div className="flex items-center gap-5">
      <svg ref={ref} viewBox="0 0 100 100" className="w-20 h-20 -rotate-90 flex-shrink-0">
        <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
        {segments.map((seg, i) => {
          const pct = seg.value / total;
          const dashFull = pct * CIRCUMFERENCE;
          const dashOffset = -(offset * CIRCUMFERENCE);
          offset += pct;
          return (
            <circle
              key={i}
              cx="50" cy="50" r="36"
              fill="none"
              stroke={seg.color}
              strokeWidth="10"
              strokeDasharray={`${inView ? dashFull : 0} ${CIRCUMFERENCE}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="butt"
              style={{ transition: `stroke-dasharray 0.8s cubic-bezier(0.16,1,0.3,1) ${i * 0.12}s` }}
            />
          );
        })}
      </svg>
      <div className="space-y-1 flex-1 min-w-0">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: seg.color }} />
              <span className="text-[10px] text-gray-400 truncate">{seg.label.split(' ')[0]}</span>
            </div>
            <span className="text-[10px] font-semibold text-white tabular-nums">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressBar({ pct, delay }: { pct: number; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref as React.RefObject<HTMLElement>, { once: true });
  return (
    <div ref={ref} className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
      <div
        className="h-full rounded-full"
        style={{
          background: 'linear-gradient(90deg, #5e17ea, #1e90ff)',
          width: inView ? `${pct}%` : '0%',
          transition: `width 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
        }}
      />
    </div>
  );
}

interface Props {
  whitepapers: Whitepaper[];
}

export default function AnalyticsSection({ whitepapers }: Props) {
  const published = whitepapers.filter((w) => w.isPublished);
  const totalDownloads = whitepapers.reduce((s, w) => s + w.downloadCount, 0);

  const categorySegments = WHITEPAPER_CATEGORIES
    .map((cat) => ({
      label: cat,
      value: whitepapers.filter((w) => w.category === cat && w.isPublished).length,
      color: CATEGORY_META[cat].color,
    }))
    .filter((s) => s.value > 0);

  const STYLE = {
    background: 'linear-gradient(135deg, #0d1f38 0%, #0B1B3A 100%)',
    border: '1px solid rgba(255,255,255,0.07)',
  };

  return (
    <section
      className="py-16"
      style={{ background: '#071326', borderTop: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="container-custom">
        <motion.div
          className="flex items-center gap-3 mb-10"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border"
            style={{ borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.07)' }}
          >
            <BarChart2 size={11} className="text-emerald-400" />
            <span className="text-[11px] font-bold text-emerald-400 tracking-widest uppercase">
              Platform Analytics
            </span>
          </div>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(16,185,129,0.3), transparent)' }} />
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Downloads', value: totalDownloads, suffix: '', icon: Download, color: '#5e17ea' },
            { label: 'Published Papers', value: published.length, suffix: '', icon: BarChart2, color: '#1e90ff' },
            { label: 'Global Readers', value: 1240, suffix: '+', icon: Users, color: '#06b6d4' },
            { label: 'Countries Reached', value: 34, suffix: '', icon: Globe, color: '#10b981' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              className="relative overflow-hidden rounded-2xl p-5"
              style={STYLE}
            >
              <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-xl" style={{ background: stat.color, opacity: 0.1 }} />
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${stat.color}18`, border: `1px solid ${stat.color}25` }}
              >
                <stat.icon size={14} style={{ color: stat.color }} />
              </div>
              <p className="text-2xl font-bold text-white mb-0.5">
                <AnimCounter target={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-[11px] text-gray-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          <motion.div
            className="lg:col-span-2 rounded-2xl p-6"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={STYLE}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold mb-0.5">Downloads</p>
                <p className="text-base font-bold text-white">Monthly Trend</p>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                <TrendingUp size={12} />
                +42% YTD
              </div>
            </div>
            <BarChart />
          </motion.div>

          <motion.div
            className="rounded-2xl p-6"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.18 }}
            style={STYLE}
          >
            <div className="mb-5">
              <p className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold mb-0.5">Distribution</p>
              <p className="text-base font-bold text-white">By Domain</p>
            </div>
            <DonutChart segments={categorySegments} />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <motion.div
            className="rounded-2xl p-6"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.22 }}
            style={STYLE}
          >
            <div className="flex items-center gap-2 mb-5">
              <Globe size={13} className="text-[#06b6d4]" />
              <p className="text-sm font-bold text-white">Global Reach</p>
            </div>
            <div className="space-y-3">
              {TOP_COUNTRIES.map((c, i) => (
                <div key={c.name} className="flex items-center gap-3">
                  <span className="text-base flex-shrink-0">{c.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] text-gray-300">{c.name}</span>
                      <span className="text-[11px] font-bold text-gray-400 tabular-nums">{c.pct}%</span>
                    </div>
                    <ProgressBar pct={c.pct} delay={i * 0.08} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="rounded-2xl p-6"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.28 }}
            style={STYLE}
          >
            <div className="flex items-center gap-2 mb-5">
              <Zap size={13} className="text-[#f59e0b]" />
              <p className="text-sm font-bold text-white">Engagement Metrics</p>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Avg. Time on Page', value: '7m 42s', delta: '+12%', color: '#5e17ea' },
                { label: 'Return Reader Rate', value: '64%', delta: '+5%', color: '#10b981' },
                { label: 'Share Rate', value: '18%', delta: '+3%', color: '#1e90ff' },
                { label: 'Completion Rate', value: '73%', delta: '+8%', color: '#f59e0b' },
              ].map((m) => (
                <div key={m.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-1.5 h-8 rounded-full" style={{ background: m.color }} />
                    <div>
                      <p className="text-[12.5px] text-gray-300">{m.label}</p>
                      <span className="text-[10px] font-semibold" style={{ color: '#34d399' }}>
                        {m.delta} vs last month
                      </span>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-white tabular-nums">{m.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
