import { motion } from 'framer-motion';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { productPageFont } from '@/lib/productPageTypography';
import {
  ArrowRight, ArrowUpRight,
  BarChart3, Pill, Activity, Mic, Cpu, Lock,
  type LucideIcon,
} from 'lucide-react';

// ── Why general-purpose AI fails regulated industries ──────────────
const gaps = [
  {
    num: '01',
    title: 'No regulatory context',
    body: 'A general-purpose model has no built-in understanding of GST, e-waybill rules, or India data residency requirements. Every constraint has to be engineered in after the fact.',
  },
  {
    num: '02',
    title: 'No domain vocabulary',
    body: "Mining grade disputes, pharma molecule data, and clinical assessment language sit outside what a general model was trained to reason about.",
  },
  {
    num: '03',
    title: 'Unbounded integration cost',
    body: 'Connecting a general model to ERP, OT, and compliance systems is months of custom engineering — with no fixed scope and no fixed end date.',
  },
  {
    num: '04',
    title: 'Unaccountable output',
    body: "A regulated business can't operate on outputs that are usually correct. Every result needs to trace back to a defined workflow and a defined outcome.",
  },
];

// ── The six layers of a Vertical AI Platform ────────────────────────
const layers = [
  { title: 'Industry', body: 'The regulatory and operational context a business sits inside.' },
  { title: 'Platform', body: 'A domain-native system, purpose-built for that context.' },
  { title: 'Data', body: "Structured against the industry's own formats and vocabulary." },
  { title: 'Workflow', body: 'Configured to match how the operation already runs.' },
  { title: 'Compliance', body: 'Regulatory logic enforced by design, not by policy document.' },
  { title: 'Deployment', body: 'Delivered through DSeT ARC™ — fixed scope, managed operations.' },
];

// ── Industries and their failure points — no product detail here ───
const industries = [
  {
    name: 'Mining & Mineral Trading',
    problem: 'Billing and grade reconciliation cycles that run 3–5 days, dependent on manual data entry across disconnected systems.',
    response: 'A vertical platform built around the dispatch-to-invoice workflow, deployed through DSeT ARC™.',
  },
  {
    name: 'Pharma & Life Sciences',
    problem: 'Commercial teams operate on monthly, backward-looking Excel reports instead of live market intelligence.',
    response: 'Domain-native commercial intelligence, built on licensed pharma datasets and refreshed continuously.',
  },
  {
    name: 'Healthcare & Wellness',
    problem: "D2C and wellness brands lack a compliant, personalised assessment layer built for India's regulatory environment.",
    response: 'A wellness assessment platform architected for India data and consent norms from the outset.',
  },
  {
    name: 'Enterprise Voice Operations',
    problem: 'Collections and distributor outreach depend on manual, single-language calling with limited reach.',
    response: 'Multilingual voice automation deployed against defined conversion and recovery KPIs.',
  },
  {
    name: 'Industrial & Manufacturing',
    problem: 'Shop floor and OT systems remain disconnected from the data layer that could predict failure before it happens.',
    response: 'Edge AI that bridges OT and IT convergence without a rip-and-replace of existing infrastructure.',
  },
  {
    name: 'Cloud Security & Governance',
    problem: 'Compliance reporting and threat response remain manual, reactive, and difficult to audit.',
    response: 'Compliance-aware security architecture with automated reporting built into the platform.',
  },
];

type PlatformEntry = {
  name: string;
  industry: string;
  sentence: string;
  href: string;
  Icon: LucideIcon;
};

// ── Platform ecosystem — names only, detail lives on each product page ──
const platforms: PlatformEntry[] = [
  { name: 'OreBill AI™', industry: 'Mining & Mineral Trading', sentence: 'Turns dispatch data into GST-compliant invoices without manual reconciliation.', href: '/product/orebill-ai', Icon: BarChart3 },
  { name: 'PharmaAI', industry: 'Pharma & Life Sciences', sentence: 'Delivers commercial intelligence built on licensed pharma datasets.', href: '/product/pharmaai', Icon: Pill },
  { name: 'MedicsIQ', industry: 'Healthcare & Wellness', sentence: 'AI-driven wellness assessment for D2C and Ayurveda brands.', href: '/product/medicsiq', Icon: Activity },
  { name: 'VoiceOps', industry: 'Enterprise Voice Operations', sentence: 'Runs multilingual voice outreach for collections and distributor engagement.', href: '/product/voiceops', Icon: Mic },
  { name: 'EdgeBay IntelliFence', industry: 'Industrial & Manufacturing', sentence: 'Brings predictive AI to the shop floor without replacing existing systems.', href: '/product/edgebay-intelligence', Icon: Cpu },
  { name: 'SecureCloud', industry: 'Cloud Security & Governance', sentence: 'Compliance-aware threat detection for regulated cloud workloads.', href: '/product/securecloud', Icon: Lock },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Vertical AI Platforms — DSeT',
  description:
    "An explainer on what Vertical AI is, why regulated industries in India need it, and how DSeT builds and deploys Vertical AI Platforms through DSeT ARC™.",
  url: 'https://dsetconsulting.com/vertical-ai-platforms',
  about: [
    { '@type': 'Thing', name: 'Vertical AI' },
    { '@type': 'Thing', name: 'Enterprise AI for regulated industries' },
  ],
  mentions: platforms.map((p) => ({
    '@type': 'Product',
    name: p.name,
    url: `https://dsetconsulting.com${p.href}`,
  })),
};

const breadcrumbs = [
  { name: 'Home', href: '/' },
  { name: 'Vertical AI Platforms™', href: '/vertical-ai-platforms' },
];

const eyebrow = 'text-xs font-semibold tracking-[0.25em] text-white/35 uppercase mb-5';

export default function VerticalAIPlatformsPage() {
  return (
    <Layout
      title="Vertical AI Platforms — What Vertical AI Means for Regulated Industries | DSeT"
      description="Vertical AI Platforms are AI systems built for one industry's data, workflows and compliance — not general-purpose AI adapted after the fact. See why DSeT builds Vertical AI for regulated industries in India, and how DSeT ARC™ deploys it."
      keywords="Vertical AI Platforms, Vertical AI India, industry-specific AI, AI for regulated industries, enterprise AI platforms India, what is vertical AI, domain-specific AI India"
      breadcrumbs={breadcrumbs}
    >
      <div className={`${productPageFont.variable} font-[family-name:var(--font-product-page)] bg-[#001f3f] text-white overflow-x-hidden`}>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* ── HERO ── */}
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden px-6 sm:px-10 lg:px-16 pt-24 pb-20">
          <div className="absolute inset-0 bg-gradient-to-b from-[#001f3f] to-[#00121f]" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%231e90ff%22%20stroke-width%3D%220.5%22%20stroke-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M0%2030h60M30%200v60%22/%3E%3C/g%3E%3C/svg%3E')] opacity-40" />

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-xs font-semibold tracking-[0.25em] text-white/40 uppercase mb-8"
            >
              DSeT Point of View
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.1] text-white mb-6"
            >
              Vertical AI Platforms
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg sm:text-xl text-white/55 max-w-2xl mx-auto leading-relaxed mb-12"
            >
              AI built for one industry's data, workflows and compliance — not general-purpose
              intelligence adapted to fit after the fact. This is why DSeT builds Vertical AI for
              India's regulated industries, and how it gets deployed.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                href="/dset-arc-managed-intelligence-services"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#1e90ff] text-white font-semibold rounded-lg text-sm hover:bg-[#1780e6] transition-colors duration-200"
              >
                See how it's deployed — DSeT ARC™
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/product"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-white/15 text-white/70 font-medium rounded-lg text-sm hover:bg-white/5 transition-colors duration-200"
              >
                View the platform catalogue
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ── WHAT IS VERTICAL AI — DEFINITION ── */}
        <section className="py-28 sm:py-32 px-6 sm:px-10 lg:px-16 bg-[#020c1e]">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-12 gap-x-12 gap-y-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-4"
            >
              <p className={eyebrow}>Definition</p>
              <h2 className="text-3xl sm:text-4xl font-semibold text-white leading-tight">
                What is Vertical AI?
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-8"
            >
              <p className="text-2xl sm:text-3xl text-white/90 font-medium leading-snug mb-8">
                An AI system built for one industry's data, regulations and workflows —
                not a general-purpose model configured to approximate them.
              </p>
              <p className="text-white/55 text-base leading-relaxed mb-5">
                Horizontal AI is trained to be broadly capable across every domain at once. That
                breadth is its value — and its limitation. It arrives with no knowledge of GST
                filing rules, no vocabulary for mineral grade disputes, no concept of what a
                compliant clinical assessment looks like in India. Every one of those gaps has to
                be closed manually, by the team deploying it.
              </p>
              <p className="text-white/55 text-base leading-relaxed">
                Vertical AI inverts that order. The domain vocabulary, the regulatory logic, and
                the operational workflow are built into the platform before it ever reaches a
                customer — so what ships on day one is already shaped for the industry it serves.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── WHY GENERAL AI FAILS ── */}
        <section className="py-28 px-6 sm:px-10 lg:px-16 bg-[#001f3f]">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl mb-16"
            >
              <p className={eyebrow}>The Gap</p>
              <h2 className="text-3xl sm:text-4xl font-semibold text-white leading-tight">
                Why general-purpose AI fails regulated industries.
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-x-16 gap-y-14">
              {gaps.map((g, i) => (
                <motion.div
                  key={g.num}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.08 }}
                >
                  <span className="text-5xl font-light text-white/12 tabular-nums">{g.num}</span>
                  <h3 className="text-white font-semibold text-lg mt-4 mb-3">{g.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{g.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ENTERPRISE ARCHITECTURE ── */}
        <section className="py-28 px-6 sm:px-10 lg:px-16 bg-[#020c1e]">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl mb-20"
            >
              <p className={eyebrow}>Architecture</p>
              <h2 className="text-3xl sm:text-4xl font-semibold text-white leading-tight mb-4">
                How a Vertical AI Platform is constructed.
              </h2>
              <p className="text-white/45 text-base leading-relaxed">
                Six layers, assembled in the same order, for every platform DSeT builds.
              </p>
            </motion.div>

            <div className="relative">
              <div className="hidden lg:block absolute top-[5px] left-0 right-0 h-px bg-white/10" />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-12">
                {layers.map((l, i) => (
                  <motion.div
                    key={l.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    className="relative"
                  >
                    <span className="hidden lg:block w-2.5 h-2.5 rounded-full bg-[#1e90ff] mb-4 relative z-10" />
                    <p className="text-[11px] font-semibold tracking-[0.2em] text-white/30 uppercase mb-2">
                      {String(i + 1).padStart(2, '0')}
                    </p>
                    <h3 className="text-white font-semibold text-sm mb-2">{l.title}</h3>
                    <p className="text-white/45 text-xs leading-relaxed">{l.body}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── INDUSTRIES AND THEIR FAILURE POINTS ── */}
        <section className="py-28 px-6 sm:px-10 lg:px-16 bg-[#001f3f]">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl mb-16"
            >
              <p className={eyebrow}>Where It Applies</p>
              <h2 className="text-3xl sm:text-4xl font-semibold text-white leading-tight">
                Every industry fails differently
              </h2>
            </motion.div>

            <div>
              {industries.map((ind, i) => (
                <motion.div
                  key={ind.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.06 }}
                  className={`grid lg:grid-cols-12 gap-x-10 gap-y-5 py-10 border-t border-white/8 ${i === 0 ? 'border-t-0 lg:border-t' : ''}`}
                >
                  <div className="lg:col-span-3">
                    <h3 className="text-white font-semibold text-lg leading-snug">{ind.name}</h3>
                  </div>
                  <div className="lg:col-span-9 grid sm:grid-cols-2 gap-x-10 gap-y-5">
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.2em] text-white/30 uppercase mb-2">
                        The Problem
                      </p>
                      <p className="text-white/55 text-sm leading-relaxed">{ind.problem}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.2em] text-white/30 uppercase mb-2">
                        The Vertical AI Response
                      </p>
                      <p className="text-white/55 text-sm leading-relaxed">{ind.response}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHY DSeT ── */}
        <section className="py-28 px-6 sm:px-10 lg:px-16 bg-[#020c1e]">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className={`${eyebrow} !text-center`}>Why DSeT</p>
              <h2 className="text-3xl sm:text-4xl font-semibold text-white leading-tight mb-10">
                Built at the intersection of two worlds.
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-left sm:text-center space-y-6 text-white/55 text-base sm:text-lg leading-relaxed"
            >
              <p>
                DSeT is a DPIIT-recognised deeptech company built to bridge two worlds — the
                operational reality of India's regulated industries, and the technical capability
                of modern AI.
              </p>
              <p>
                Generic AI is trained to be broadly good at everything, and precisely accountable
                for nothing. When a mining company disputes a grade calculation, when a pharma
                team answers to a regulator, when a hospital handles patient data — being usually
                right is not a workable standard.
              </p>
            </motion.div>

            <motion.blockquote
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-12 border-l-2 border-[#1e90ff]/40 pl-6 text-left sm:text-center sm:border-l-0 sm:pl-0 text-white/85 text-xl sm:text-2xl font-medium leading-snug"
            >
              "Mostly right" is not good enough for a regulated industry.
            </motion.blockquote>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 text-white/55 text-base sm:text-lg leading-relaxed"
            >
              Vertical AI Platforms are how DSeT closes that gap — each one built once, for one
              industry, with the domain vocabulary, compliance logic and workflow context already
              inside it, then deployed through a single, repeatable engagement model.
            </motion.p>
          </div>
        </section>

        {/* ── DEPLOYMENT FRAMEWORK — SUMMARY ── */}
        <section className="py-24 px-6 sm:px-10 lg:px-16 bg-[#001f3f]">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className={`${eyebrow} !text-center`}>Deployment</p>
              <h2 className="text-3xl sm:text-4xl font-semibold text-white leading-tight mb-4">
                Every platform ships through one framework.
              </h2>
              <p className="text-white/50 max-w-xl mx-auto leading-relaxed">
                DSeT ARC™ is the iterative transformation framework behind every vertical
                platform — Assess, Analyze, Reimagine, Recreate, Collaborate, and Capitalize, in
                the same order, every time.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-12 flex flex-wrap justify-center gap-x-10 gap-y-4"
            >
              {['Assess', 'Analyze', 'Reimagine', 'Recreate', 'Collaborate', 'Capitalize'].map((s, i) => (
                <div key={s} className="flex items-center gap-3">
                  <span className="text-white/25 text-sm font-semibold tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-white/70 text-sm font-medium">{s}</span>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              <Link
                href="/dset-arc-managed-intelligence-services"
                className="mt-12 inline-flex items-center gap-2 text-sm font-semibold text-[#7cc4ff] hover:text-white transition-colors duration-200"
              >
                Learn about DSeT ARC™
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ── PLATFORM ECOSYSTEM ── */}
        <section className="py-28 px-6 sm:px-10 lg:px-16 bg-[#020c1e]">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl mb-14"
            >
              <p className={eyebrow}>Platform Ecosystem</p>
              <h2 className="text-3xl sm:text-4xl font-semibold text-white leading-tight mb-4">
                One framework, applied across the portfolio.
              </h2>
              <p className="text-white/45 text-base leading-relaxed">
                Each platform is documented in full on its own page.
              </p>
            </motion.div>

            <div className="border-t border-white/8">
              {platforms.map((p, i) => (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                >
                  <Link
                    href={p.href}
                    className="group flex items-center gap-5 sm:gap-6 py-6 border-b border-white/8 px-2 -mx-2 rounded-lg hover:bg-white/[0.02] transition-colors duration-200"
                  >
                    <p.Icon className="w-5 h-5 text-[#1e90ff] flex-shrink-0" />
                    <div className="flex-1 min-w-0 grid sm:grid-cols-12 sm:items-center gap-1.5 sm:gap-4">
                      <div className="sm:col-span-4">
                        <h3 className="text-white font-semibold text-sm">{p.name}</h3>
                        <p className="text-white/35 text-xs mt-0.5">{p.industry}</p>
                      </div>
                      <p className="sm:col-span-6 text-white/55 text-sm leading-relaxed">
                        {p.sentence}
                      </p>
                    </div>
                    <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-white/40 group-hover:text-[#7cc4ff] transition-colors duration-200 flex-shrink-0">
                      Explore
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-28 px-6 sm:px-10 lg:px-16 bg-[#001f3f]">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl font-semibold text-white leading-tight mb-5">
                Ready to see what Vertical AI means for your industry?
              </h2>
              <p className="text-white/55 text-base leading-relaxed mb-10">
                Book a DSeT ARC™ discovery session, or browse the full platform catalogue.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#1e90ff] text-white font-semibold rounded-lg text-sm hover:bg-[#1780e6] transition-colors duration-200"
                >
                  Book a discovery call
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/product"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/15 text-white/70 font-medium rounded-lg text-sm hover:bg-white/5 transition-colors duration-200"
                >
                  View the platform catalogue
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
