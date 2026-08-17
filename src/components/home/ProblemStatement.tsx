import { motion } from 'framer-motion';
import Link from 'next/link';
import Section from '../ui/Section';

const problems = [
  {
    industry: 'Mining & Resources',
    icon: '⛏️',
    pain: 'Manual billing cycles of 3–5 days per dispatch, grade disputes that delay payment for weeks, and no single view of ore volumes, permits, and receivables.',
    solution: 'OreBill AI™ automates dispatch-to-invoice in one workflow — with i3MS-linked document processing and grade reconciliation built in.',
    accent: '#ff851b',
    href: '/product/orebill-ai',
  },
  {
    industry: 'Pharma & Life Sciences',
    icon: '💊',
    pain: 'Commercial teams flying blind on market share, brand performance, and competitor movements — waiting for monthly Excel reports that are already stale.',
    solution: 'PharmaAI delivers deterministic commercial intelligence on licensed pharma datasets — molecule-level, field-force-ready, refreshed continuously.',
    accent: '#ff851b',
    href: '/product/pharmaai',
  },
  {
    industry: 'Enterprise Voice Operations',
    icon: '🎙️',
    pain: 'Collections teams spending 60–70% of time on first-contact attempts that go unanswered. Distributor follow-ups done manually in multiple regional languages.',
    solution: 'VoiceOps runs AI-driven outreach in regional languages — collections, distributor engagement, and payment follow-up at scale.',
    accent: '#ff851b',
    href: '/product/voiceops',
  },
];

export default function ProblemStatement() {
  return (
    <Section bgColor="dark" id="problem">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#ff851b]/10 border border-[#ff851b]/20 text-[#ffb067] text-sm font-semibold mb-4">
            Why Vertical AI
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Generic AI doesn't know your industry.<br />
            <span className="bg-gradient-to-r from-[#ff851b] to-[#1e90ff] bg-clip-text text-transparent">
              Ours was built for it.
            </span>
          </h2>
          <p className="text-white/55 max-w-2xl mx-auto text-lg">
            Regulated industries have operational problems that horizontal AI tools were never designed to solve — and the integration tax is too high to make generic tools work.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {problems.map((p, i) => (
            <motion.div
              key={p.industry}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group relative rounded-2xl border border-white/10 bg-white/[0.02] p-6 flex flex-col hover:border-white/20 transition-all duration-300"
            >
              {/* Top accent */}
              <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl" style={{ background: `linear-gradient(90deg, ${p.accent}, ${p.accent}30)` }} />

              <div className="flex items-center gap-3 mb-5">
                <span className="text-2xl">{p.icon}</span>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: p.accent }}>{p.industry}</p>
              </div>

              {/* Pain */}
              <div className="mb-5 p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-red-400/60 mb-2">The Problem</p>
                <p className="text-white/50 text-sm leading-relaxed">{p.pain}</p>
              </div>

              {/* Solution */}
              <div className="mb-6 p-4 rounded-xl flex-1" style={{ background: `${p.accent}08`, border: `1px solid ${p.accent}20` }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: `${p.accent}80` }}>The Solution</p>
                <p className="text-white/70 text-sm leading-relaxed">{p.solution}</p>
              </div>

              <Link
                href={p.href}
                className="inline-flex items-center gap-1.5 text-xs font-semibold transition-all duration-300 group-hover:gap-2.5"
                style={{ color: p.accent }}
              >
                Explore platform
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 text-center"
        >
          <Link
            href="/vertical-ai-platforms"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[#1e90ff]/30 text-[#7cc4ff] text-sm font-semibold hover:bg-[#1e90ff]/10 transition-all duration-300"
          >
            See all 7 vertical platforms →
          </Link>
        </motion.div>
      </div>
    </Section>
  );
}
