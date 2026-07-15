import { motion } from 'framer-motion';
import Link from 'next/link';
import Layout from '../components/layout/Layout';
import Section from '../components/ui/Section';

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  live:     { label: 'Live',         color: 'bg-green-100 text-green-700' },
  pilot:    { label: 'Active Pilot', color: 'bg-blue-100 text-blue-700' },
  upcoming: { label: 'Upcoming',     color: 'bg-amber-100 text-amber-700' },
};

const caseStudies = [
  {
    id: 'kopl-intelligence',
    industry: 'Industrial Manufacturing',
    client: 'KOPL — Industrial Manufacturing, India',
    platform: 'KOPL Intelligence',
    platformColor: '#0a3d62',
    icon: '🏭',
    status: 'live',
    problem:
      'A persistent IT-OT disconnect forced teams to manually export spreadsheets to correlate business logic with machine sensor data — creating massive "time-to-insight" delays. By the time an anomaly was diagnosed, the opportunity to prevent it had already passed.',
    solution:
      'Built KOPL Intelligence — a real-time, voice-enabled IT-OT bridge. Users talk to production data in plain language and instantly receive data-backed answers, charts, and root-cause analyses on batch behaviour and process trends.',
    outcomes: [
      'Manual data reconciliation eliminated — hours of work now completed in seconds',
      'AI instantly flags bottlenecks (temperature drops, pressure spikes) in real time',
      'Non-technical floor managers make rapid, confident decisions via voice interface',
    ],
    tags: ['IT-OT Convergence', 'Manufacturing', 'Voice AI', 'LLM', 'Edge Intelligence'],
  },
  {
    id: 'orebill-ai-mining',
    industry: 'Mining & Mineral Logistics',
    client: 'Regional Mining Operator, India',
    platform: 'OreBill AI',
    platformColor: '#ff851b',
    icon: '⛏️',
    status: 'pilot',
    problem:
      'Manual ore billing processes led to reconciliation delays of 3–5 days per cycle, with systematic revenue leakage due to grade dispute resolution gaps between pit-to-plant and third-party weighbridge data.',
    solution:
      'Deployed OreBill AI to automate weighbridge intelligence, real-time grade reconciliation, and ERP sync — eliminating manual data entry and dispute cycles across the logistics chain.',
    outcomes: [
      'Billing reconciliation time reduced by 60% (from 5 days to <2 days)',
      'Revenue leakage reduced by ₹1.2Cr annually through automated dispute detection',
      'Weighbridge data discrepancy rate dropped from 12% to <1.5%',
    ],
    tags: ['Mining', 'Revenue Intelligence', 'ERP Integration', 'Edge Deployment'],
  },
  {
    id: 'securecloud-pci',
    industry: 'Secure Enterprise / BFSI',
    client: 'Financial Services Provider, South Asia',
    platform: 'SecureCloud',
    platformColor: '#5e17ea',
    icon: '🔐',
    status: 'live',
    problem:
      'Cloud adoption was stalled by compliance obligations under PCI-DSS and data sovereignty requirements. Existing tools flagged violations but provided no actionable remediation pathways, leaving the security team in a reactive posture.',
    solution:
      'Implemented SecureCloud for continuous cloud posture management — automated policy enforcement, real-time compliance scoring, and prioritised remediation workflows across multi-cloud infrastructure.',
    outcomes: [
      'Compliance audit preparation time cut by 70% (from 6 weeks to 10 days)',
      'Critical misconfiguration incidents reduced by 84% within 60 days of deployment',
      'Achieved PCI-DSS Level 1 readiness for cloud workloads within one quarter',
    ],
    tags: ['PCI-DSS', 'Cloud Security', 'Compliance Automation', 'Multi-cloud'],
  },
  {
    id: 'ipas-revops',
    industry: 'B2B SaaS / Revenue Operations',
    client: 'Mid-Market SaaS Company, APAC',
    platform: 'iPaS-RevOps',
    platformColor: '#1e90ff',
    icon: '📊',
    status: 'live',
    problem:
      'The revenue team operated across three disconnected CRMs, an unintegrated billing platform, and manual AR follow-up cycles — resulting in a 23% AR overdue rate and no unified pipeline visibility for leadership.',
    solution:
      'Deployed iPaS-RevOps to unify pipeline data, automate AR follow-up sequences, and provide real-time revenue forecasting with deal velocity analytics and churn risk scoring.',
    outcomes: [
      'AR overdue rate reduced from 23% to 8% within 90 days',
      '340+ hours/month recovered from manual follow-up and reporting processes',
      'Revenue forecast accuracy improved from ±31% to ±9% quarter-on-quarter',
    ],
    tags: ['Revenue Operations', 'AR Automation', 'CRM Integration', 'Forecasting'],
  },
  {
    id: 'medicsiq-dermatology',
    industry: 'Healthcare & Dermatology',
    client: 'Natura Sparsh — D2C Wellness & Dermatology Clinics',
    platform: 'MedicsIQ',
    platformColor: '#006d77',
    icon: '🩺',
    status: 'live',
    problem:
      'Dermatology clinics and D2C wellness brands lacked clinical-grade skin intelligence at scale — patient intake was manual, product recommendations were generic, and there was no bridge between clinical analysis and personalized product mapping.',
    solution:
      'Deployed MedicsIQ — an AI skin analysis platform trained on 500K+ dermatology images. It analyses 12 skin biomarkers in under 3 seconds, maps results to Natura Sparsh SKUs with ingredient-level rationale, and automates clinical intake with CDSCO-aligned documentation.',
    outcomes: [
      '12-biomarker AI skin analysis delivered in under 3 seconds per session',
      '70% reduction in clinical intake overhead through digital consent and intake automation',
      '30–40% reduction in per-patient consultation time for dermatology clinics',
    ],
    tags: ['Dermatology', 'Computer Vision', 'Clinical AI', 'Wellness', 'MedicsIQ'],
  },
  {
    id: 'digital-ops-sports',
    industry: 'Sports & Education',
    client: 'PCI — Paralympic Committee of India',
    platform: 'Azure-Powered Web Platform',
    platformColor: '#f59e0b',
    icon: '🏆',
    status: 'live',
    problem:
      'PCI\'s existing website was outdated, unresponsive, and fragmented — unable to serve athletes, coaches, and the broader para-sports community effectively. Content was scattered, infrastructure was unstable, and there was no scalable foundation for future digital growth.',
    solution:
      'After an initial assessment, a completely new future-ready website was architected and delivered — built on Microsoft Azure for reliability and scale. The platform was designed for speed, accessibility, and seamless cross-device experience, with all sections restructured, verified content integrated, and a unified ecosystem connecting athletes, coaches, and the PCI community.',
    outcomes: [
      'Successful public launch establishing a stable, modern, and scalable digital foundation',
      'Azure-powered infrastructure ensuring reliability, auto-scaling, and AI-readiness',
      'Unified platform connecting athletes, coaches, and the PCI community across all devices',
      '20+ pages redesigned and rebuilt — fully responsive with real data integration',
    ],
    tags: ['Sports Tech', 'Azure', 'Web Platform', 'Digital Transformation', 'PCI'],
  },
];

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const cardAnim = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function CaseStudiesPage() {
  return (
    <Layout
      title="Case Studies | DSeT — AI Platforms in the Field"
      description="Real-world deployments of DSeT AI platforms — OreBill AI, SecureCloud, and iPaS-RevOps. Measurable outcomes across mining, enterprise security, and revenue operations."
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
              Case Studies
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Platforms Deployed.{' '}
              <span className="bg-gradient-to-r from-[#ff851b] to-[#1e90ff] bg-clip-text text-transparent">
                Results Measured.
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-2xl">
              Real-world deployments across mining, enterprise security, and revenue operations.
              Each case study reflects a live or pilot engagement — no stock metrics, no invented outcomes.
            </p>
          </motion.div>
        </div>
      </Section>

      {/* ── Case Study Cards ── */}
      <Section bgColor="white" spacing="xl">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="flex flex-col gap-8"
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.05 }}
          >
            {caseStudies.map((cs) => (
              <motion.div
                key={cs.id}
                variants={cardAnim}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <div className="relative overflow-hidden rounded-[2rem] border border-[#e8e4dc] bg-[#fbfaf7] shadow-[0_20px_60px_rgba(15,23,42,0.09)]">
                  {/* Top color bar */}
                  <div className="h-[6px] w-full" style={{ backgroundColor: cs.platformColor }} />

                  {/* Dot grid */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(15,23,42,0.05)_1px,_transparent_1px)] [background-size:22px_22px] opacity-30 pointer-events-none" />

                  <div className="relative z-10 p-7 sm:p-10">
                    {/* Header row */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-lg"
                          style={{ backgroundColor: cs.platformColor }}
                        >
                          {cs.icon}
                        </div>
                        <div>
                          <span
                            className="inline-block px-3 py-1 text-xs font-bold text-white rounded-full mb-1"
                            style={{ backgroundColor: cs.platformColor }}
                          >
                            {cs.platform}
                          </span>
                          <p className="text-xs text-[#9ca3af] font-medium">{cs.client}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                        {cs.status && STATUS_BADGE[cs.status] && (
                          <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full ${STATUS_BADGE[cs.status].color}`}>
                            {STATUS_BADGE[cs.status].label}
                          </span>
                        )}
                        <span className="inline-block px-3 py-1.5 text-xs font-semibold text-[#5a6a7a] bg-[#f3f4f6] rounded-full border border-[#e5e7eb]">
                          {cs.industry}
                        </span>
                      </div>
                    </div>

                    {/* Problem / Solution */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-7">
                      <div>
                        <h3 className="text-xs font-bold text-[#9ca3af] uppercase tracking-wider mb-2">Challenge</h3>
                        <p className="text-sm text-[#4b5563] leading-relaxed">{cs.problem}</p>
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-[#9ca3af] uppercase tracking-wider mb-2">Solution</h3>
                        <p className="text-sm text-[#4b5563] leading-relaxed">{cs.solution}</p>
                      </div>
                    </div>

                    {/* Outcomes */}
                    <div className="mb-7">
                      <h3 className="text-xs font-bold text-[#9ca3af] uppercase tracking-wider mb-3">Outcomes</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {cs.outcomes.map((outcome, i) => (
                          <div
                            key={i}
                            className="flex gap-2.5 bg-white rounded-xl p-4 border border-[#ece8e0] shadow-[0_2px_8px_rgba(15,23,42,0.05)]"
                          >
                            <span
                              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                              style={{ backgroundColor: `${cs.platformColor}20`, color: cs.platformColor }}
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                            <p className="text-xs text-[#374151] leading-relaxed font-medium">{outcome}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tags + CTA */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex flex-wrap gap-2">
                        {cs.tags.map((tag) => (
                          <span key={tag} className="px-2.5 py-1 text-xs text-[#6b7280] bg-[#f9fafb] border border-[#e5e7eb] rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <Link
                        href="/contact?type=demo"
                        className="inline-flex items-center gap-2 text-sm font-semibold whitespace-nowrap hover:gap-3 transition-all duration-200"
                        style={{ color: cs.platformColor }}
                      >
                        Discuss a Similar Challenge
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ── CTA ── */}
      <Section bgColor="light" spacing="lg">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
            <span className="text-[#ff851b]">Have a similar </span>
            <span className="text-[#5e17ea]">operational challenge?</span>
          </h2>
          <p className="text-lg text-white mb-8 leading-relaxed">
            Book a strategic demo and we&apos;ll map your specific environment to the right DSeT platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/contact?type=demo"
                className="inline-block min-w-[240px] px-8 py-4 bg-gradient-to-r from-[#5e17ea] to-[#1e90ff] text-white font-semibold rounded-md shadow-lg text-base text-center overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                Book a Strategic Demo
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/product"
                className="inline-block px-8 py-4 border-2 border-white/40 text-white font-semibold rounded-xl text-base hover:bg-white hover:text-[#001f3f] transition-all duration-300"
              >
                Explore Platforms
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </Section>

    </Layout>
  );
}
