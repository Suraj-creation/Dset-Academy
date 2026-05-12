import { motion } from 'framer-motion';
import Link from 'next/link';
import Layout from '../components/layout/Layout';
import Section from '../components/ui/Section';
import { ArrowRight, Zap, Shield, Activity, Award, Lock } from 'lucide-react';

// ─── Data ─────────────────────────────────────────────────
const industries = [
  {
    id: 'mining',
    icon: '⛏️',
    name: 'Mining & Mineral Logistics',
    tagline: 'From pit to invoice — fully automated.',
    color: '#ff851b',
    challenges: [
      'Manual ore billing causes reconciliation delays of 3–5 days per cycle',
      'Grade disputes between pit-to-plant and third-party weighbridge data',
      'Revenue leakage due to undetected discrepancies in dispatch records',
    ],
    platforms: ['OreBill AI™', 'EdgeBay Intelligence'],
    stat: { value: '60%', label: 'reduction in billing reconciliation time' },
    cta: 'See DSeT in Mining',
  },
  {
    id: 'industrial',
    icon: '🏭',
    name: 'Industrial & Manufacturing / OT',
    tagline: 'Real-time intelligence at the operational edge.',
    color: '#1e90ff',
    challenges: [
      'OT/IT data silos prevent real-time visibility into production anomalies',
      'Unplanned downtime from reactive maintenance — no predictive layer',
      'SCADA and ERP systems generate data that never reaches decision-makers',
    ],
    platforms: ['EdgeBay Intelligence', 'iPaS-RevOps'],
    stat: { value: '40%', label: 'reduction in unplanned downtime with edge AI' },
    cta: 'See DSeT in Industrial',
  },
  {
    id: 'healthcare',
    icon: '🏥',
    name: 'Healthcare & Pharma',
    tagline: 'Clinical intelligence that runs where data lives.',
    color: '#ff851b',
    challenges: [
      'Fragmented patient data across systems delays clinical decision-making',
      'Regulatory compliance (HIPAA, CDSCO) adds overhead to every workflow',
      'Manual reporting consumes clinical staff bandwidth needed for patient care',
    ],
    platforms: ['MedicsIQ', 'SecureCloud'],
    stat: { value: '70%', label: 'faster compliance reporting with MedicsIQ' },
    cta: 'See DSeT in Healthcare',
  },
  {
    id: 'sports-education',
    icon: '🎓',
    name: 'Sports & Education Infrastructure',
    tagline: 'Performance data turned into institutional advantage.',
    color: '#5e17ea',
    challenges: [
      'Athlete and student performance data sits in disconnected tools',
      'No unified intelligence layer to support coaching or academic decisions',
      'Infrastructure spend lacks data-driven justification and ROI tracking',
    ],
    platforms: ['EdgeBay Intelligence', 'iPaS-RevOps'],
    stat: { value: '3×', label: 'improvement in data-driven programme decisions' },
    cta: 'See DSeT in Education',
  },
  {
    id: 'enterprise',
    icon: '🔐',
    name: 'Secure Enterprise / BFSI',
    tagline: 'Compliance-first AI for regulated environments.',
    color: '#5e17ea',
    challenges: [
      'Cloud adoption stalled by PCI-DSS, data sovereignty, and audit obligations',
      'Security tools flag violations but provide no remediation pathways',
      'Revenue operations spread across disconnected CRMs, billing, and AR systems',
    ],
    platforms: ['SecureCloud', 'iPaS-RevOps'],
    stat: { value: '84%', label: 'reduction in critical cloud misconfigurations' },
    cta: 'See DSeT in Enterprise',
  },
];

const platformColors: Record<string, string> = {
  'OreBill AI™':         '#ff851b',
  'EdgeBay Intelligence': '#1e90ff',
  'SecureCloud':          '#5e17ea',
  'MedicsIQ':             '#22c55e',
  'iPaS-RevOps':          '#0ea5e9',
};

const platformHrefs: Record<string, string> = {
  'OreBill AI™':         '/product/orebill-ai',
  'EdgeBay Intelligence': '/product/edgebay-intelligence',
  'SecureCloud':          '/product/securecloud',
  'MedicsIQ':             '/product/medicsiq',
  'iPaS-RevOps':          '/product/ipas-revops',
};

// ─── Animation ────────────────────────────────────────────
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
};

const sectionIcons = [
  <Zap key="zap" className="w-8 h-8" />,
  <Activity key="activity" className="w-8 h-8" />,
  <Shield key="shield" className="w-8 h-8" />,
  <Award key="award" className="w-8 h-8" />,
  <Lock key="lock" className="w-8 h-8" />,
];

// ─── Page ─────────────────────────────────────────────────
export default function IndustriesPage() {
  return (
    <Layout
      title="Industries | DSeT — AI Platforms for Mining, Healthcare, Industrial & More"
      description="DSeT builds vertical AI platforms for Mining, Industrial OT, Healthcare, Sports & Education, and Secure Enterprise. Purpose-built for operationally complex environments."
      jsonLd={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Industries — DSeT Vertical AI Platforms',
        url: 'https://dsetconsulting.com/industries',
        description: 'DSeT builds vertical AI platforms for Mining, Industrial OT, Healthcare, Sports & Education, and Secure Enterprise.',
        provider: { '@type': 'Organization', name: 'DSeT Consulting', url: 'https://dsetconsulting.com' },
        about: [
          { '@type': 'Thing', name: 'Mining & Mineral Logistics AI' },
          { '@type': 'Thing', name: 'Industrial OT Edge AI' },
          { '@type': 'Thing', name: 'Healthcare AI Compliance' },
          { '@type': 'Thing', name: 'Secure Enterprise Cloud' },
        ],
      }}
    >
      {/* ── Hero ── */}
      <Section bgColor="light" spacing="xl">
        <div className="relative bg-gradient-to-br from-[#001f3f] via-[#002b57] to-[#001f3f] rounded-3xl shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%231e90ff%22%20stroke-width%3D%220.5%22%20stroke-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M0%2030h60M30%200v60%22/%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#5e17ea]/20 to-transparent" />
          <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gradient-to-r from-[#1e90ff]/20 to-transparent" />

          <motion.div
            className="relative z-10 px-8 py-16 sm:px-16 sm:py-20 max-w-4xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block mb-6 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#5e17ea] to-[#1e90ff] rounded-full shadow">
              Industries
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Built for Industries That{' '}
              <span className="bg-gradient-to-r from-[#ff851b] to-[#1e90ff] bg-clip-text text-transparent">
                Can&apos;t Afford to Fail
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-2xl">
              DSeT platforms are purpose-built for operationally complex, regulated, and
              edge-heavy environments — not adapted from generic AI tools.
            </p>
          </motion.div>
        </div>
      </Section>

      {/* ── Industry Cards ── */}
      <Section bgColor="light" spacing="xl">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="flex flex-col gap-8"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.05 }}
          >
            {industries.map((ind, i) => (
              <motion.div
                key={ind.id}
                id={ind.id}
                variants={fadeUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <div className="relative overflow-hidden rounded-[2rem] border border-[#e8e4dc] bg-[#fbfaf7] shadow-[0_20px_60px_rgba(15,23,42,0.09)]">
                  {/* Top color bar */}
                  <div className="h-[6px] w-full" style={{ backgroundColor: ind.color }} />
                  {/* Dot grid */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(15,23,42,0.04)_1px,_transparent_1px)] [background-size:22px_22px] opacity-40 pointer-events-none" />

                  <div className="relative z-10 p-7 sm:p-10">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">

                      {/* Left content */}
                      <div>
                        {/* Header */}
                        <div className="flex items-center gap-4 mb-6">
                          <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-lg text-white"
                            style={{ backgroundColor: ind.color }}
                          >
                            {sectionIcons[i]}
                          </div>
                          <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-[#001f3f] leading-tight">
                              {ind.name}
                            </h2>
                            <p className="text-sm text-[#5a6a7a] mt-0.5">{ind.tagline}</p>
                          </div>
                        </div>

                        {/* Challenges */}
                        <div className="mb-6">
                          <p className="text-[0.65rem] font-bold text-[#9ca3af] uppercase tracking-widest mb-3">
                            Key Challenges
                          </p>
                          <ul className="space-y-2.5">
                            {ind.challenges.map((c) => (
                              <li key={c} className="flex items-start gap-2.5">
                                <span
                                  className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-[7px]"
                                  style={{ backgroundColor: ind.color }}
                                />
                                <span className="text-sm text-[#374151] leading-relaxed">{c}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Platform chips */}
                        <div>
                          <p className="text-[0.65rem] font-bold text-[#9ca3af] uppercase tracking-widest mb-2.5">
                            Relevant Platforms
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {ind.platforms.map((p) => (
                              <Link
                                key={p}
                                href={platformHrefs[p] ?? '/product'}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white transition-opacity hover:opacity-80"
                                style={{ backgroundColor: platformColors[p] ?? '#5e17ea' }}
                              >
                                {p}
                                <ArrowRight className="w-3 h-3" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right: stat + CTA */}
                      <div className="flex flex-col gap-4">
                        {/* Stat card */}
                        <div
                          className="relative overflow-hidden rounded-2xl p-6 text-white"
                          style={{ backgroundColor: ind.color }}
                        >
                          <div className="absolute inset-0 bg-white/5 pointer-events-none" />
                          <p className="relative text-3xl font-bold leading-none mb-1">{ind.stat.value}</p>
                          <p className="relative text-sm text-white/80 leading-snug">{ind.stat.label}</p>
                        </div>

                        {/* CTA */}
                        <Link
                          href="/contact?type=demo"
                          className="group flex items-center justify-between gap-2 p-4 bg-white rounded-2xl border border-[#ece8e0] shadow-[0_4px_16px_rgba(15,23,42,0.07)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.12)] transition-all duration-200"
                        >
                          <span
                            className="text-sm font-bold leading-tight"
                            style={{ color: ind.color }}
                          >
                            {ind.cta}
                          </span>
                          <span
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0 group-hover:translate-x-0.5 transition-transform duration-200"
                            style={{ backgroundColor: ind.color }}
                          >
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        </Link>
                      </div>

                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ── Bottom CTA ── */}
      <Section bgColor="light" spacing="lg">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#001f3f] via-[#002b57] to-[#001f3f] px-8 py-14 sm:px-16 text-center max-w-5xl mx-auto shadow-2xl"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%231e90ff%22%20stroke-width%3D%220.5%22%20stroke-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M0%2030h60M30%200v60%22/%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#5e17ea]/20 to-transparent" />

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
              Don&apos;t see your industry?{' '}
              <span className="bg-gradient-to-r from-[#ff851b] to-[#1e90ff] bg-clip-text text-transparent">
                Talk to us.
              </span>
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-xl mx-auto leading-relaxed">
              DSeT&apos;s AI OS can be adapted to any operationally complex or regulated environment.
              Tell us your challenge.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/contact?type=demo"
                  className="inline-block px-8 py-4 bg-gradient-to-r from-[#5e17ea] to-[#1e90ff] text-white font-semibold rounded-xl shadow-lg text-base hover:shadow-xl transition-shadow duration-300"
                >
                  Book a Strategic Demo
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/product"
                  className="inline-flex items-center gap-2 px-8 py-4 border border-white/20 text-white font-semibold rounded-xl text-base hover:bg-white/10 transition-all duration-300"
                >
                  Explore Platforms <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </Section>

    </Layout>
  );
}
