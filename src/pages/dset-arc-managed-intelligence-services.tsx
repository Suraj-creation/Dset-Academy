import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { productPageFont } from '@/lib/productPageTypography';
import {
  ArrowRight, CheckCircle, ChevronDown,
  BarChart3, Pill, Activity, Mic, Cpu, Lock, TrendingUp,
  type LucideIcon,
} from 'lucide-react';

const phases = [
  {
    step: '01',
    title: 'Assess',
    accent: '#ff851b',
    objective: 'Establish the true operational baseline before recommending anything.',
    outcome: 'Operational & Compliance Baseline',
    support: 'Workflows, systems, data sources and regulatory obligations are mapped as they actually run today — not as they appear on paper.',
  },
  {
    step: '02',
    title: 'Analyze',
    accent: '#1e90ff',
    objective: 'Turn the baseline into a defensible business case.',
    outcome: 'Gap & Opportunity Analysis',
    support: 'Data quality, integration complexity and workforce readiness are quantified, so the deployment plan is built on evidence, not assumption.',
  },
  {
    step: '03',
    title: 'Reimagine',
    accent: '#5e17ea',
    objective: 'Design the target operating model before touching a system.',
    outcome: 'Target Operating Model',
    support: 'Workflows, decision rights and system architecture are redesigned around AI — not patched onto the process that already exists.',
  },
  {
    step: '04',
    title: 'Recreate',
    accent: '#10b981',
    objective: 'Build the platform the reimagined model actually needs.',
    outcome: 'Production-Ready Configuration',
    support: 'Integrations, workflows, access controls and domain-specific rules are built and validated ahead of go-live.',
  },
  {
    step: '05',
    title: 'Collaborate',
    accent: '#06b6d4',
    objective: 'Go live with your teams, not in front of them.',
    outcome: 'Validated Go-Live',
    support: 'The platform is deployed on secure, India-resident infrastructure and validated against agreed KPIs, with your teams embedded throughout.',
  },
  {
    step: '06',
    title: 'Capitalize',
    accent: '#a855f7',
    objective: 'Compound the return as the business evolves.',
    outcome: 'Managed Operations',
    support: 'DSeT monitors, tunes and supports the platform on an ongoing basis, so performance keeps improving after go-live — not just at launch.',
  },
];

const notARC = [
  { label: 'Open-ended consulting retainer' },
  { label: 'Custom AI development from scratch' },
  { label: 'Hourly advisory with no deliverables' },
  { label: 'Platform licensing without deployment' },
];

const isARC = [
  { label: 'Defined-scope, milestone-driven engagement' },
  { label: 'Vertical AI platform + enterprise configuration' },
  { label: 'KPI-accountable go-live milestone' },
  { label: 'Managed post-launch operations included' },
];

type PlatformEntry = {
  name: string;
  industry: string;
  Icon: LucideIcon;
  accent: string;
  href: string;
};

const platforms: PlatformEntry[] = [
  { name: 'OreBill AI™',           industry: 'Mining & Mineral Trading',          Icon: BarChart3,  accent: '#f59e0b', href: '/product/orebill-ai' },
  { name: 'PharmaAI',              industry: 'Pharma Commercial Intelligence',     Icon: Pill,       accent: '#10b981', href: '/product/pharmaai' },
  { name: 'MedicsIQ™',             industry: 'AI Wellness Assessment',             Icon: Activity,   accent: '#a855f7', href: '/product/medicsiq' },
  { name: 'VoiceOps',              industry: 'Enterprise Voice Automation',        Icon: Mic,        accent: '#1e90ff', href: '/product/voiceops' },
  { name: 'EdgeBay IntelliFence™', industry: 'Industrial Edge AI',                 Icon: Cpu,        accent: '#06b6d4', href: '/product/edgebay-intelligence' },
  { name: 'SecureCloud™',           industry: 'Compliance-Aware Cloud Security',    Icon: Lock,       accent: '#2563eb', href: '/product/securecloud' },
  { name: 'iPaS-RevOps™',          industry: 'Revenue Operations Automation',      Icon: TrendingUp, accent: '#0284c7', href: '/product/ipas-revops' },
];

const faqs = [
  {
    q: 'Is DSeT ARC™ a product or a service?',
    a: 'DSeT ARC™ is an iterative transformation framework, not a shrink-wrapped product or an open-ended advisory retainer. It\'s the structured path — Assess, Analyze, Reimagine, Recreate, Collaborate, and Capitalize — through which every DSeT vertical AI platform is deployed and run inside your environment, so you end up with a live production system, not a slide deck.',
  },
  {
    q: 'What does "defined scope" mean in a DSeT ARC™ engagement?',
    a: 'Before any configuration work starts, we document exactly what will be built, which systems will be integrated, and the KPIs the platform will be measured against at go-live. That scope is fixed during Assess and Analyze and documented in your deployment brief upfront — no scope creep, no open-ended billing, no surprises at handover.',
  },
  {
    q: 'Does DSeT build custom AI models, or configure existing platforms?',
    a: 'DSeT ARC™ pairs the domain-specific AI capability already built into our vertical platforms with enterprise configuration — workflow rules, integrations, and access controls specific to your organisation, built out during the Recreate phase. You\'re not commissioning a model from scratch, and you\'re not stuck with a one-size-fits-all tool either.',
  },
  {
    q: 'Where is our data hosted during a DSeT ARC™ engagement?',
    a: 'Default production deployments run on India-hosted cloud infrastructure to meet common data residency requirements. The exact architecture — cloud, hybrid, or on-premises — is scoped during Assess and Analyze against your organisation\'s compliance and tenancy needs.',
  },
  {
    q: 'What happens after a DSeT ARC™ platform goes live?',
    a: 'Capitalize is where the return compounds — it\'s included in every engagement, not sold separately. DSeT monitors platform health, runs quarterly optimisation cycles, and gives you a priority support channel. If a regulatory change affects the platform, it\'s handled inside a tuning cycle — not billed as new project scope.',
  },
  {
    q: 'What are the four channels that underpin DSeT ARC™?',
    a: 'Every DSeT ARC™ phase is designed around the four channels that actually carry work inside an enterprise: People (the teams who own and use the platform), Process (the workflows and decision rights it must fit), Physical Channels (on-site systems, hardware, and operational touchpoints), and Digital Channels (software, data, and integration surfaces). Designing against all four — not just the technology — is what keeps a deployment from becoming shelfware.',
  },
];

function FAQItem({ faq }: { faq: { q: string; a: string } }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-200"
      >
        <span className="text-white font-semibold text-sm sm:text-base pr-4">{faq.q}</span>
        <ChevronDown className={`w-5 h-5 text-[#1e90ff] flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="px-6 pb-5 pt-1">
              <p className="text-white/60 text-sm leading-relaxed">{faq.a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'DSeT ARC™ — Managed Intelligence Services',
  provider: { '@type': 'Organization', name: 'DSeT Consulting', url: 'https://dsetconsulting.com' },
  description: 'DSeT ARC™ is DSeT\'s iterative transformation framework — Assess, Analyze, Reimagine, Recreate, Collaborate, Capitalize — for deploying vertical AI platforms across mining, pharma, healthcare, voice, industrial edge, and cloud security, with India-hosted deployment options.',
  areaServed: 'IN',
  serviceType: 'AI Platform Deployment and Managed Operations',
  url: 'https://dsetconsulting.com/dset-arc-managed-intelligence-services',
};

const breadcrumbs = [
  { name: 'Home', href: '/' },
  { name: 'DSeT ARC™', href: '/dset-arc-managed-intelligence-services' },
];

export default function DSetARCPage() {
  return (
    <Layout
      title="DSeT ARC™ — Managed Intelligence Services for Vertical AI Deployment | DSeT"
      description="DSeT ARC™ is DSeT's iterative transformation framework for deploying vertical AI platforms — Assess, Analyze, Reimagine, Recreate, Collaborate, Capitalize — with India-hosted cloud deployment options."
      keywords="DSeT ARC framework, DSeT ARC managed intelligence, vertical AI deployment India, AI platform deployment services India, managed AI services India, enterprise AI deployment Azure India, AI transformation framework India"
      breadcrumbs={breadcrumbs}
    >
      <div className={`${productPageFont.variable} font-[family-name:var(--font-product-page)] bg-[#001f3f] text-white overflow-x-hidden`}>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* ── HERO ── */}
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="absolute inset-0 bg-gradient-to-br from-[#001f3f] via-[#002b57] to-[#000d1a]" />
          <div className="absolute top-0 right-0 w-1/3 h-full bg-[#5e17ea]/6 blur-3xl rounded-full" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%231e90ff%22%20stroke-width%3D%220.5%22%20stroke-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M0%2030h60M30%200v60%22/%3E%3C/g%3E%3C/svg%3E')] opacity-30" />

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5e17ea]/10 border border-[#5e17ea]/20 mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#5e17ea]" />
              <span className="text-xs font-bold text-[#b18cff] tracking-widest uppercase">
                Managed Intelligence
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-5"
            >
              <span className="bg-gradient-to-r from-[#5e17ea] via-[#1e90ff] to-[#06b6d4] bg-clip-text text-transparent">
                DSeT ARC™
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-white/65 font-medium mb-5"
            >
              Enterprise AI deployment framework for operational workflows
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-white/50 text-base max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              DSeT ARC™ is DSeT's iterative transformation framework — Assess, Analyze, Reimagine,
              Recreate, Collaborate, and Capitalize — for taking vertical AI platforms into live
              production. It connects domain workflows, enterprise data and AI capabilities into a
              system your teams actually run, underpinned by the people, process, and physical and
              digital channels that carry work inside your organisation.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#5e17ea] to-[#1e90ff] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity duration-200"
                onClick={() => {
                  if (typeof window !== 'undefined' && (window as any).dataLayer) {
                    (window as any).dataLayer.push({ event: 'cta_click', cta_label: 'book_arc_discovery_call', cta_location: 'arc_hero' });
                  }
                }}
              >
                Book a discovery session
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#framework"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/15 text-white/70 font-medium rounded-xl hover:bg-white/5 transition-colors duration-200"
              >
                Explore platforms
              </a>
            </motion.div>

            {/* Feature chips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="mt-12 flex flex-wrap justify-center gap-3"
            >
              {[
                'Workflow-focused deployment',
                'Enterprise-ready architecture',
                'Managed AI operations',
                'Vertical AI platforms',
              ].map((label) => (
                <span
                  key={label}
                  className="px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] text-white/50 text-sm font-medium"
                >
                  {label}
                </span>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── WHAT ARC™ IS AND ISN'T ── */}
        <section className="py-20 bg-[#020c1e] px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                What DSeT ARC™ is.{' '}
                <span className="text-white/35">And what it isn't.</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="rounded-2xl border border-white/8 bg-white/[0.02] p-8"
              >
                <h3 className="text-white/35 font-semibold text-sm uppercase tracking-widest mb-6">Not this</h3>
                <ul className="space-y-4">
                  {notARC.map((item) => (
                    <li key={item.label} className="flex items-center gap-3 text-white/35 text-sm">
                      <span className="w-4 h-4 rounded border border-white/15 flex-shrink-0" />
                      {item.label}
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.08 }}
                className="rounded-2xl border border-[#1e90ff]/20 bg-[#1e90ff]/5 p-8"
              >
                <h3 className="text-white font-semibold text-sm uppercase tracking-widest mb-6">This</h3>
                <ul className="space-y-4">
                  {isARC.map((item) => (
                    <li key={item.label} className="flex items-center gap-3 text-white/80 text-sm">
                      <CheckCircle className="w-4 h-4 text-[#1e90ff] flex-shrink-0" />
                      {item.label}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── THE ARC™ FRAMEWORK ── */}
        <section id="framework" className="py-28 sm:py-32 px-6 sm:px-10 lg:px-16 bg-[#020c1e]">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl mb-20 sm:mb-28"
            >
              <p className="text-xs font-semibold tracking-[0.25em] text-white/35 uppercase mb-6">
                The ARC™ Framework
              </p>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-[1.1] mb-6">
                An iterative path from first assessment to compounding return.
              </h2>
              <p className="text-white/45 text-lg leading-relaxed">
                Every DSeT ARC™ engagement runs through the same six phases — Assess, Analyze, Reimagine, Recreate, Collaborate, and Capitalize — underpinned by the People, Process, Physical Channels, and Digital Channels that carry real work inside your organisation. What changes is the platform and the operational context — never the structure.
              </p>
            </motion.div>

            <div>
              {phases.map((phase, i) => (
                <motion.div
                  key={phase.step}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.08 }}
                  className={`grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-8 py-12 sm:py-14 border-t border-white/8 ${i === 0 ? 'border-t-0 lg:border-t' : ''}`}
                >
                  <div className="lg:col-span-4 flex flex-row lg:flex-col items-baseline lg:items-start gap-6 lg:gap-5">
                    <span className="text-6xl sm:text-7xl font-light tabular-nums text-white/12 leading-none">
                      {phase.step}
                    </span>
                    <div>
                      <motion.span
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.08 + 0.2 }}
                        className="block w-10 h-px mb-4 origin-left"
                        style={{ backgroundColor: phase.accent }}
                      />
                      <h3 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                        {phase.title}
                      </h3>
                    </div>
                  </div>

                  <div className="lg:col-span-8 grid sm:grid-cols-2 gap-x-10 gap-y-8">
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.2em] text-white/35 uppercase mb-3">
                        Objective
                      </p>
                      <p className="text-white/70 text-lg leading-relaxed">
                        {phase.objective}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.2em] text-white/35 uppercase mb-3">
                        Outcome
                      </p>
                      <p className="text-xl font-medium mb-3" style={{ color: phase.accent }}>
                        {phase.outcome}
                      </p>
                      <p className="text-white/45 text-sm leading-relaxed">
                        {phase.support}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PLATFORMS ON ARC™ ── */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#001f3f]">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-14"
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#ff851b]/10 border border-[#ff851b]/15 text-[#ffb067] text-sm font-semibold mb-4">
                Platforms
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                Vertical AI platforms powered through one deployment framework.
              </h2>
              <p className="text-white/45 max-w-xl mx-auto">
                All seven DSeT vertical platforms are deployed and operated through DSeT ARC™ — same framework, industry-specific configuration.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {platforms.map((p, i) => (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.06 }}
                >
                  <Link href={p.href}>
                    <div
                      className="flex items-center gap-4 p-5 rounded-xl border transition-colors duration-200 hover:bg-white/[0.04] cursor-pointer"
                      style={{ borderColor: `${p.accent}18`, background: `${p.accent}04` }}
                    >
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${p.accent}14`, border: `1px solid ${p.accent}25` }}
                      >
                        <p.Icon className="w-5 h-5" style={{ color: p.accent }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-sm">{p.name}</h3>
                        <p className="text-white/35 text-xs mt-0.5 truncate">{p.industry}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/20 flex-shrink-0" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#020c1e]">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Common questions</h2>
              <p className="text-white/45">Everything you need to know before a discovery session.</p>
            </motion.div>

            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <motion.div
                  key={faq.q}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                >
                  <FAQItem faq={faq} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#001f3f] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#5e17ea]/8 via-transparent to-[#1e90ff]/8" />

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-xs font-bold text-[#b18cff] uppercase tracking-widest mb-5">
                Book a Discovery Session
              </p>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5">
                Ready to scope your deployment?
              </h2>

              <p className="text-white/55 text-base mb-10 leading-relaxed max-w-xl mx-auto">
                A discovery session is a structured call where we map your workflows, identify
                integration points and define the right deployment approach. You leave with
                a clear picture of scope and outcomes.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#5e17ea] to-[#1e90ff] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity duration-200"
                  onClick={() => {
                    if (typeof window !== 'undefined' && (window as any).dataLayer) {
                      (window as any).dataLayer.push({ event: 'cta_click', cta_label: 'book_arc_discovery_call', cta_location: 'arc_cta' });
                    }
                  }}
                >
                  Book a DSeT ARC™ discovery session
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/vertical-ai-platforms"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/15 text-white/70 font-medium rounded-xl hover:bg-white/5 transition-colors duration-200"
                >
                  Explore all platforms
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
