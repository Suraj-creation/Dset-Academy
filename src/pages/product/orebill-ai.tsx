import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import Section from '@/components/ui/Section';
import { productPageFont } from '@/lib/productPageTypography';
import { CheckCircle, Activity, Zap, Shield, Database, BarChart2, ArrowRight, TrendingUp, Cloud, Server, Monitor, Lock, FileText, DollarSign } from 'lucide-react';

const COLOR = '#ff851b';
const COLOR_ALT = '#f59e0b';

const features = [
  {
    num: '01',
    name: 'Extraction Agent',
    desc: 'Reads i3MS PDFs and government portal documents automatically — structures invoice-ready data and flags permit-to-dispatch mismatches before billing begins.',
  },
  {
    num: '02',
    name: 'Billing Agent',
    desc: 'Applies PO logic and contractual terms to structured dispatch data — generates invoices instantly and pushes them directly to your ERP, Zoho, or SAP stack.',
  },
  {
    num: '03',
    name: 'Compliance Agent',
    desc: 'Runs GST validation and e-waybill autogeneration on every invoice — maintaining audit-ready records without manual intervention at any step.',
  },
  {
    num: '04',
    name: 'Revenue Agent',
    desc: 'Tracks every invoice from issuance to payment — AI-driven follow-ups via Voice, WhatsApp, and Email with VoiceOps collections that convert receivables into predictable cash.',
  },
];

// Row 1 has no image — uses an agent pipeline visual
// Row 2 uses /mining.avif
// Row 3 has no image — uses a stats visual
const narrativeRows = [
  {
    label: 'Dispatch Automation',
    heading: 'From permit to invoice — without a single manual step.',
    body: 'OreBill AI™ processes i3MS-linked documents and government dispatch data to capture permit information the moment it is issued. The platform validates, enriches, and structures this data against your pricing rules and contractual terms — removing the 3–5 day reconciliation backlog that plagues manual billing cycles.',
    image: '',
    imageAlt: '',
    flipped: false,
  },
  {
    label: 'Grade Reconciliation',
    heading: 'End grade disputes before they become payment delays.',
    body: "Mineral grade discrepancies between pit-to-plant measurements, third-party lab reports, and buyer assay results are the leading cause of invoice rejections in ore trading. OreBill AI™'s reconciliation engine cross-validates all three data sources in real time — flagging conflicts and generating audit-ready evidence before the invoice is issued.",
    image: '/images/manufacturing.jpg',
    imageAlt: 'Industrial operations grade reconciliation',
    flipped: true,
  },
  {
    label: 'Revenue Intelligence',
    heading: 'Real-time visibility from dispatch to cash collection.',
    body: 'OreBill AI™ aggregates dispatch, invoice, and payment data across all sites and buyers into a single RevOps dashboard. Finance teams see cycle times, outstanding receivables, leakage flags, and compliance status — in real time, not at month-end. This converts billing data into a strategic financial intelligence layer.',
    image: '',
    imageAlt: '',
    flipped: false,
  },
];

const integrationPoints = [
  {
    icon: <Database className="w-5 h-5" />,
    title: 'ERP Integration',
    desc: 'Native connectors for SAP, Oracle ERP, and Tally — dispatch and invoice data flows directly into your existing financial stack.',
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: 'GST & e-Waybill API',
    desc: 'Direct integration with government compliance portals — invoices are e-waybill-registered and GST-filed without manual intervention.',
  },
  {
    icon: <Activity className="w-5 h-5" />,
    title: 'Weighbridge & RFID Systems',
    desc: 'Plug-in adapters for major weighbridge hardware and RFID readers — no middleware required, no data re-entry.',
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    title: 'BI & Analytics Feed',
    desc: 'Structured revenue, dispatch, and reconciliation data piped directly into your BI stack — Azure Synapse, Google BigQuery, or Tableau.',
  },
];

const useCases = [
  {
    icon: '⚡',
    title: 'Before & After OreBill AI™',
    desc: 'Before: 3-day billing cycles, Excel + CA dependency, manual follow-ups, and collections stuck in 30–45 day cycles. After: Same-day billing, fully automated workflows, AI-driven collections, and real-time visibility — from permit to payment, across every site.',
    color: COLOR,
  },
  {
    icon: '🏗️',
    title: 'Built for Non-API Govt Ecosystems',
    desc: 'Not ERP. Not automation. Execution. OreBill AI™ is purpose-built for i3MS-linked, PDF-driven government workflows — with an agentic execution layer that works on live operational data, built for high-volume mining environments.',
    color: COLOR_ALT,
  },
  {
    icon: '🎙️',
    title: 'VoiceOps AI Collection Engine',
    desc: 'AI agents call, remind, and follow up automatically via Voice, WhatsApp, and Email — tracking customer intent and payment probability with intelligent escalation. No missed collections. Receivables converted into predictable cash, automatically.',
    color: '#f97316',
  },
];

const valueStats = [
  { value: 'Same Day', label: 'Billing Cycle', sub: 'From 3-day manual to instant' },
  { value: '30–40%', label: 'Faster Collections', sub: 'AI-driven follow-up sequences' },
  { value: '₹15–35 Cr', label: 'Faster Cash Realisation', sub: 'Working capital unlocked per cycle' },
  { value: '10–15x', label: 'ROI', sub: 'Payback in under 30 days' },
];

const compliance = [
  { icon: <Lock className="w-5 h-5" />, label: 'GST-Compliant Invoicing', sub: 'Every invoice generated meets GST filing requirements — no manual review required' },
  { icon: <Shield className="w-5 h-5" />, label: 'e-Waybill Integration', sub: 'Automatic e-waybill registration for every qualifying dispatch' },
  { icon: <BarChart2 className="w-5 h-5" />, label: 'Audit-Ready Evidence Packs', sub: 'Timestamped dispatch, grade, and invoice records packaged for statutory audits' },
  { icon: <CheckCircle className="w-5 h-5" />, label: 'Data Sovereignty Options', sub: 'On-premise or private cloud deployment for full control over financial data' },
  { icon: <Activity className="w-5 h-5" />, label: 'Role-Based Access Control', sub: 'Finance, operations, and management roles with granular data access policies' },
];

// ── Inline visuals for non-image narrative rows ─────────────────

function AgentPipelineVisual() {
  const agents = [
    { icon: <FileText className="w-5 h-5" />, label: 'Extraction', sub: 'Reads i3MS PDFs' },
    { icon: <Zap className="w-5 h-5" />, label: 'Billing', sub: 'Applies PO logic' },
    { icon: <Shield className="w-5 h-5" />, label: 'Compliance', sub: 'GST + e-Waybill' },
    { icon: <DollarSign className="w-5 h-5" />, label: 'Revenue', sub: 'VoiceOps AI' },
  ];
  return (
    <div
      className="h-72 sm:h-96 rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center justify-center p-8 gap-5"
      style={{ background: 'linear-gradient(135deg, rgba(0,31,63,0.7), rgba(0,43,87,0.5))' }}
    >
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">4 Autonomous Agents</p>
      <div className="w-full grid grid-cols-2 gap-4">
        {agents.map((a, idx) => (
          <div
            key={a.label}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-white/10"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow"
              style={{ background: `linear-gradient(135deg, ${COLOR}, ${COLOR_ALT})` }}
            >
              {a.icon}
            </div>
            <p className="text-white font-bold text-sm">{a.label}</p>
            <p className="text-gray-500 text-xs text-center">{a.sub}</p>
            {idx < 3 && (
              <div className="absolute" />
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2">
        <div className="h-px w-10 bg-orange-500/40" />
        <span className="text-[11px] text-gray-500 uppercase tracking-widest">Dispatch → Invoice → Cash</span>
        <div className="h-px w-10 bg-orange-500/40" />
      </div>
    </div>
  );
}

function RevenueStatsVisual() {
  const stats = [
    { value: 'Same Day', label: 'Billing' },
    { value: '30–40%', label: 'Faster Cash' },
    { value: '₹15–35 Cr', label: 'Unlocked' },
    { value: '10–15x', label: 'ROI' },
  ];
  return (
    <div
      className="h-72 sm:h-96 rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center justify-center p-8 gap-6"
      style={{ background: 'linear-gradient(135deg, rgba(0,31,63,0.7), rgba(0,43,87,0.5))' }}
    >
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Revenue Outcomes</p>
      <div className="grid grid-cols-2 gap-4 w-full">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center justify-center p-5 rounded-2xl border border-white/10 text-center"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <p className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: COLOR_ALT }}>{s.value}</p>
            <p className="text-gray-400 text-xs font-medium">{s.label}</p>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-gray-500 uppercase tracking-widest">Starting ₹1.5 Lakhs / month</p>
    </div>
  );
}

export default function OreBillAIPage() {
  return (
    <Layout
      title="OreBill AI™ — Mining Billing Automation Platform | DSeT"
      description="OreBill AI™ is DSeT's vertical AI platform for mining and mineral trading — automating i3MS document processing, grade reconciliation, and GST-compliant invoicing from dispatch to cash."
      ogImage="/images/mining.jpg"
      jsonLd={{
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'OreBill AI™',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Cloud, Edge, Hybrid',
        description: 'Vertical AI platform for mining billing automation — i3MS-linked workflows, grade reconciliation, GST-compliant invoicing and AI-driven collections.',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR', priceSpecification: { '@type': 'UnitPriceSpecification', priceType: 'https://schema.org/InvoicePrice' } },
        provider: { '@type': 'Organization', name: 'DSeT Consulting', url: 'https://dsetconsulting.com' },
        url: 'https://dsetconsulting.com/product/orebill-ai',
        image: 'https://dsetconsulting.com/images/mining.jpg',
        keywords: 'mining billing automation India, ore billing software, i3MS billing automation, mineral dispatch invoicing, GST invoicing mining',
      }}
      breadcrumbs={[
        { name: 'Home', href: '/' },
        { name: 'Platforms', href: '/product' },
        { name: 'OreBill AI™', href: '/product/orebill-ai' },
      ]}
    >
      <div className={`${productPageFont.variable} product-page-shell`}>

      {/* ── Hero ── */}
      <Section bgColor="light" spacing="xl">
        <div className="relative bg-gradient-to-br from-[#001f3f] via-[#002b57] to-[#001a2e] rounded-3xl shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22ffffff%22%20stroke-width%3D%220.5%22%20stroke-opacity%3D%220.04%22%3E%3Cpath%20d%3D%22M0%2030h60M30%200v60%22/%3E%3C/g%3E%3C/svg%3E')] opacity-60" />
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#ff851b]/5 to-transparent" />
          <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gradient-to-r from-white/[0.02] to-transparent" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-0 items-center">
            {/* Left: Text */}
            <motion.div
              className="px-8 py-16 sm:px-14 sm:py-20"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <span
                className="inline-block mb-5 px-4 py-1.5 text-xs font-bold text-white rounded-full shadow tracking-wider uppercase"
                style={{ background: 'linear-gradient(90deg, #ff851b, #f59e0b)' }}
              >
                Mining &amp; Mineral Billing Automation
              </span>
              <h1 className="product-page-display mb-5 text-white">
                OreBill AI™
              </h1>
              <p className="text-xl text-gray-300 mb-4 leading-relaxed font-light">
                High-volume ore dispatch. Cash realisation still manual.
              </p>
              <p className="text-base text-gray-400 mb-8 leading-relaxed max-w-lg">
                OreBill AI™ deploys four autonomous agents — Extraction, Billing, Compliance, and Revenue —
                to eliminate 30–45 day collection cycles, unlock ₹15–35 Cr in working capital, and
                deliver same-day invoicing from the moment a permit is issued.
              </p>
              <ul className="space-y-3 mb-10">
                {[
                  'Same-day billing — from i3MS document processing to GST-compliant invoice automatically',
                  'VoiceOps AI collections — Voice, WhatsApp & Email follow-up agents',
                  '10–15x ROI, payback in under 30 days — starting ₹1.5 Lakhs/month',
                ].map((pt) => (
                  <li key={pt} className="flex items-start gap-3 text-gray-300 text-sm">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: COLOR }} />
                    {pt}
                  </li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/contact?type=demo&product=orebill"
                    className="inline-flex items-center gap-2 px-7 py-3.5 text-white font-semibold rounded-xl shadow-lg text-sm"
                    style={{ background: 'linear-gradient(135deg, #ff851b, #f59e0b)' }}
                  >
                    Request a Demo <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/contact?type=pilot&product=orebill"
                    className="inline-flex items-center gap-2 px-7 py-3.5 border border-white/30 text-white font-semibold rounded-xl text-sm hover:bg-white/10 transition-colors duration-200"
                  >
                    Talk to Our Mining Team
                  </Link>
                </motion.div>
              </div>
            </motion.div>

            {/* Right: Image — mining operations photo */}
            <motion.div
              className="relative w-full h-80 lg:h-[600px] overflow-hidden rounded-b-3xl lg:rounded-l-none lg:rounded-r-3xl"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <Image
                src="/images/mining.jpg"
                alt="Mining operations — OreBill AI™ automates billing from dispatch to invoice"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#001f3f]/70 via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#001f3f]/50 lg:via-transparent lg:to-transparent" />

              {/* Floating stat badge */}
              <motion.div
                className="absolute bottom-8 left-6 backdrop-blur-md bg-white/[0.08] border border-white/20 rounded-2xl p-4 shadow-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#ff851b20' }}>
                    <Zap className="w-5 h-5" style={{ color: COLOR }} />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">10–15x ROI</p>
                    <p className="text-xs text-gray-400">Payback in under 30 days</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ── Value Stats Bar ── */}
      <Section bgColor="white" spacing="md">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {valueStats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center py-6 px-4 rounded-2xl border border-white/[0.06] backdrop-blur-sm"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <p className="text-4xl font-bold mb-1" style={{ color: COLOR }}>{s.value}</p>
              <p className="text-white font-semibold text-sm mb-1">{s.label}</p>
              <p className="text-gray-500 text-xs">{s.sub}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── Platform Capabilities — Alternating Narrative ── */}
      <Section bgColor="light" spacing="xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 text-xs font-bold text-white rounded-full mb-4 uppercase tracking-wider" style={{ background: COLOR }}>
            Platform Capabilities
          </span>
          <h2 className="product-page-section-heading text-white">
            What <span style={{ color: COLOR }}>OreBill AI™</span> Does
          </h2>
        </motion.div>

        <div className="space-y-24">
          {narrativeRows.map((row, i) => (
            <motion.div
              key={row.label}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${row.flipped ? 'lg:[direction:rtl]' : ''}`}
            >
              {/* Visual side */}
              <div className="lg:[direction:ltr]">
                {row.image ? (
                  <div className="relative h-72 sm:h-96 rounded-3xl overflow-hidden shadow-2xl">
                    <Image
                      src={row.image}
                      alt={row.imageAlt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#001f3f]/50 to-transparent" />
                    <div
                      className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full text-white text-xs font-bold uppercase tracking-wider"
                      style={{ background: COLOR_ALT }}
                    >
                      {row.label}
                    </div>
                  </div>
                ) : i === 0 ? (
                  <AgentPipelineVisual />
                ) : (
                  <RevenueStatsVisual />
                )}
              </div>

              {/* Text side */}
              <div className="lg:[direction:ltr]">
                <div
                  className="inline-block w-12 h-1 rounded-full mb-5"
                  style={{ background: i === 1 ? COLOR_ALT : COLOR }}
                />
                <h3 className="product-page-subheading mb-5 text-white sm:text-4xl">
                  {row.heading}
                </h3>
                <p className="text-base sm:text-lg leading-8 text-gray-300">
                  {row.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── Key Features — 4 Agents ── */}
      <Section bgColor="white" spacing="xl">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 text-xs font-bold text-white rounded-full mb-4 uppercase tracking-wider" style={{ background: COLOR }}>
              Autonomous Agents
            </span>
            <h2 className="product-page-section-heading text-white">
              4 Autonomous Agents.<br />
              <span style={{ color: COLOR }}>One End-to-End Execution Layer.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
            {features.map((f, i) => (
              <motion.div
                key={f.num}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="flex gap-5"
              >
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm text-white shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${COLOR}, ${COLOR_ALT})` }}
                >
                  {f.num}
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-2">{f.name}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Integration Ecosystem ── */}
      <Section bgColor="light" spacing="xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 text-xs font-bold text-white rounded-full mb-4 uppercase tracking-wider" style={{ background: '#f97316' }}>
            Integration Ecosystem
          </span>
          <h2 className="product-page-section-heading text-white">
            Connects to Your<br />
            <span style={{ color: '#f97316' }}>Existing Stack</span>
          </h2>
          <p className="text-gray-400 text-lg mt-4 max-w-2xl mx-auto">
            OreBill AI™ plugs into your weighbridge hardware, ERP, and government compliance portals —
            no middleware, no rip-and-replace.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
          style={{ background: 'linear-gradient(135deg, rgba(0,31,63,0.6), rgba(0,43,87,0.4))' }}
        >
          <div className="absolute inset-0 backdrop-blur-sm" />
          <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(90deg, #ff851b, #f59e0b, #f97316)' }} />

          <div className="relative z-10 p-8 sm:p-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {integrationPoints.map((pt, i) => (
                <motion.div
                  key={pt.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4 p-5 rounded-2xl border border-white/[0.08] bg-white/[0.04]"
                >
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white"
                    style={{ background: 'rgba(255,133,27,0.14)' }}
                  >
                    {pt.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm mb-1">{pt.title}</h3>
                    <p className="text-gray-400 text-xs leading-relaxed">{pt.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </Section>

      {/* ── Why Teams Choose OreBill AI™ ── */}
      <Section bgColor="white" spacing="xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 text-xs font-bold text-white rounded-full mb-4 uppercase tracking-wider" style={{ background: COLOR_ALT }}>
            Why OreBill AI™
          </span>
          <h2 className="product-page-section-heading text-white">
            Why Teams Choose <span style={{ color: COLOR_ALT }}>OreBill AI™</span>
          </h2>
        </motion.div>

        <div className="max-w-5xl mx-auto space-y-5">
          {useCases.map((uc, i) => (
            <motion.div
              key={uc.title}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex items-start gap-6 p-7 rounded-2xl border border-white/[0.06]"
              style={{ background: `linear-gradient(135deg, ${uc.color}0d, rgba(0,31,63,0.4))` }}
            >
              <div
                className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg"
                style={{ background: `${uc.color}20`, border: `1px solid ${uc.color}30` }}
              >
                {uc.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-white font-bold text-xl">{uc.title}</h3>
                  <div className="flex-1 h-px" style={{ background: `${uc.color}30` }} />
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{uc.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── Architecture Flow ── */}
      <Section bgColor="light" spacing="xl">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 text-xs font-bold text-white rounded-full mb-4 uppercase tracking-wider" style={{ background: COLOR }}>
              How It Works
            </span>
            <h2 className="product-page-section-heading text-white">
              Four Steps.<br />
              <span style={{ color: COLOR }}>Zero Manual Work.</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden border border-white/10 p-8 sm:p-12"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              {[
                { step: '1', label: 'Capture', desc: 'i3MS PDF, RFID & dispatch data extracted automatically' },
                { step: '2', label: 'Reconcile', desc: 'Grade AI cross-validates all data sources in real time' },
                { step: '3', label: 'Enrich', desc: 'HSN codes, pricing rules, and contractual terms applied' },
                { step: '4', label: 'Invoice', desc: 'GST-compliant invoice and e-waybill generated in seconds' },
              ].map((s) => (
                <div key={s.step} className="flex flex-col items-center">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4 shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${COLOR}, ${COLOR_ALT})` }}
                  >
                    {s.step}
                  </div>
                  <h4 className="text-white font-bold mb-2">{s.label}</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ── Deployment Modes ── */}
      <Section bgColor="white" spacing="xl">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 text-xs font-bold text-white rounded-full mb-4 uppercase tracking-wider" style={{ background: COLOR_ALT }}>
              Deployment
            </span>
            <h2 className="product-page-section-heading text-white">
              Deploy Where Your Data Lives
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { icon: <Cloud className="w-5 h-5" />, label: 'Cloud SaaS', sub: 'Multi-tenant on Azure / GCP with full data isolation per site' },
              { icon: <Server className="w-5 h-5" />, label: 'On-Premise', sub: 'Deploy within your data centre for full financial data sovereignty' },
              { icon: <Monitor className="w-5 h-5" />, label: 'Hybrid', sub: 'Edge data capture on-site, AI reconciliation and invoicing in cloud' },
            ].map((c, i) => (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex gap-4 p-5 rounded-2xl border border-white/[0.06] bg-white/[0.03]"
              >
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(245,158,11,0.15)', color: COLOR_ALT }}
                >
                  {c.icon}
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm mb-1">{c.label}</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">{c.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Compliance ── */}
      <Section bgColor="light" spacing="xl">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 text-xs font-bold text-white rounded-full mb-4 uppercase tracking-wider" style={{ background: COLOR }}>
              Compliance &amp; Governance
            </span>
            <h2 className="product-page-section-heading text-white">
              Built for Regulated Financial Operations
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {compliance.map((c, i) => (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex gap-4 p-5 rounded-2xl border border-white/[0.06] bg-white/[0.03]"
              >
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(255,133,27,0.15)', color: COLOR }}
                >
                  {c.icon}
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm mb-1">{c.label}</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">{c.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── CTA ── */}
      <Section bgColor="white" spacing="lg">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative text-center max-w-4xl mx-auto rounded-3xl overflow-hidden py-16 px-8"
          style={{ background: 'linear-gradient(135deg, #001f3f, #002b57)' }}
        >
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(255,133,27,0.07) 0%, transparent 70%)' }} />
          <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(90deg, #ff851b, #f59e0b)' }} />

          <div className="relative z-10">
            <h2 className="product-page-section-heading mb-4 text-white">
              See YOUR Data Converted to<br />
              <span style={{ color: COLOR }}>Invoices &amp; Cash</span>
            </h2>
            <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              From invoice delays to predictable cash flow — start with a pilot on your live data:
              real invoices, GST + e-waybill integration, collection tracking, and measurable cash
              acceleration from day one.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/contact?type=demo&product=orebill"
                  className="inline-flex items-center gap-2 px-8 py-4 text-white font-semibold rounded-xl shadow-lg text-base"
                  style={{ background: 'linear-gradient(135deg, #ff851b, #f59e0b)' }}
                >
                  Start 14-Day Pilot <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/vertical-ai-platforms"
                  className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl text-base hover:bg-white/10 transition-colors duration-200"
                >
                  See All Platforms
                </Link>
              </motion.div>
            </div>
            <p className="mt-6 text-sm text-white/40">
              Deploying this platform?{' '}
              <Link href="/dset-arc-managed-intelligence-services" className="text-[#ff851b] hover:text-[#ff851b]/80 underline underline-offset-2 transition-colors">
                See how DSeT ARC™ takes OreBill AI™ from discovery to go-live →
              </Link>
            </p>

          </div>
        </motion.div>
      </Section>
      </div>
    </Layout>
  );
}
