import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { productPageFont } from '@/lib/productPageTypography';

const highlights = [
  'OT-IT data fusion for unified situational awareness',
  'Edge AI powered by Intel OpenVINO + NVIDIA CUDA',
  'Predictive safety, compliance, and equipment intelligence',
];

const overviewSections = [
  {
    title: 'Unified Edge Intelligence',
    body:
      'EdgeBay IntelliFence fuses industrial control systems, safety sensors, and video streams with IT data lakes to deliver continuous edge intelligence for operators and command centers.',
  },
  {
    title: 'Predictive Safety & Compliance',
    body:
      'The platform detects hazards, worker exposure, and equipment anomalies in real time, orchestrating alerts, workflows, and compliance reporting even in low-connectivity environments.',
  },
  {
    title: 'Mission-Critical Reliability',
    body:
      'Designed for rugged environments, IntelliFence maintains analytics continuity offline, synchronizing with cloud when available to keep stakeholders aligned.',
  },
];

const features = [
  {
    title: 'Industrial Edge AI Engine',
    body:
      'Optimized inference pipelines leverage Intel OpenVINO and NVIDIA CUDA cores for millisecond-level responses across harsh industrial edge deployments.',
  },
  {
    title: 'Sensor + Camera Fusion',
    body:
      'Correlate SCADA signals, PLC telemetry, LiDAR, thermal feeds, and machine vision streams for contextual intelligence.',
  },
  {
    title: 'Predictive Maintenance',
    body:
      'Monitor asset vibration, torque, temperature, and utilization patterns to forecast failures before they impact uptime.',
  },
  {
    title: 'Worker Safety & Awareness',
    body:
      'Track worker zones, PPE compliance, and critical safety thresholds with automated escalation to supervisors.',
  },
  {
    title: 'Real-time Alerts & Automation',
    body:
      'Deliver actionable alerts via dashboards, SMS, and OT workflows, triggering automated mitigation protocols.',
  },
  {
    title: 'Integration APIs & Secure OT Connectivity',
    body:
      'Hardened connectors for MODBUS, OPC-UA, MQTT, and REST integrate safely with enterprise systems.',
  },
];

const technicalStack = [
  'Intel OpenVINO',
  'NVIDIA CUDA',
  'Edge Nodes + Cloud Integration',
  'Secure OT Connectors',
  'Ruggedized Hardware',
];

const industries = [
  {
    name: 'Mining',
    image: '/EdgeBy1.webp',
    alt: 'Mining operations supported by EdgeBay IntelliFence',
    useCases: [
      'Hazard zone detection & geofencing',
      'Haul truck & vehicle proximity intelligence',
      'Conveyor health monitoring & predictive shutdowns',
    ],
  },
  {
    name: 'Manufacturing',
    image: '/EdgeBy2.avif',
    alt: 'Manufacturing operations supported by EdgeBay IntelliFence',
    useCases: [
      'Predictive breakdown alerts for critical assets',
      'Worker safety assurance & PPE analytics',
      'Quality deviation detection on production lines',
    ],
  },
  {
    name: 'Utilities',
    image: '/EdgeBy3.avif',
    alt: 'Utilities operations supported by EdgeBay IntelliFence',
    useCases: [
      'Grid substation heat & arc detection',
      'Plant monitoring for emissions & compliance',
      'Incident detection across distributed assets',
    ],
  },
];

const valueDelivered = [
  'Reduce Downtime',
  'Improve Worker & Site Safety',
  'Lower Operational Risk',
  'Real-time Situational Awareness',
  'Offline-first Resilience',
];

const faqs = [
  {
    q: 'What industries does EdgeBay IntelliFence serve?',
    a: 'Mining, manufacturing, and utilities — any environment with high OT asset density, safety-critical operations, or continuous regulatory monitoring requirements. The platform is built for harsh environments where generic IoT tools cannot operate reliably.',
  },
  {
    q: 'Can EdgeBay IntelliFence operate without internet connectivity?',
    a: 'Yes. EdgeBay IntelliFence is offline-first by design. Analytics continuity is maintained locally at the edge node, and when connectivity is restored, data synchronises automatically to cloud or command-centre dashboards — no gaps in the operational record.',
  },
  {
    q: 'How does EdgeBay IntelliFence connect to our existing OT and SCADA systems?',
    a: 'Through hardened connectors for MODBUS, OPC-UA, MQTT, and REST. No rip-and-replace of existing SCADA or PLC infrastructure is required — EdgeBay IntelliFence integrates alongside your current stack without disrupting live operations.',
  },
  {
    q: 'What is the typical deployment timeline for EdgeBay IntelliFence?',
    a: 'Pilot deployment timelines depend on site complexity and the number of OT data sources involved. DSeT ARC™ handles the full discovery-to-deployment sequence, including sensor mapping, inference tuning, and operator training, and gives you a firm project timeline before configuration begins.',
  },
  {
    q: 'What hardware does EdgeBay IntelliFence run on?',
    a: 'EdgeBay IntelliFence runs on ruggedised edge nodes using Intel OpenVINO and NVIDIA CUDA inference pipelines — built for harsh industrial environments that don\'t have dedicated data-centre infrastructure on site.',
  },
  {
    q: 'Is EdgeBay IntelliFence delivered through DSeT ARC™?',
    a: 'Yes. EdgeBay IntelliFence engagements are structured through DSeT ARC™ — from initial digital assessment and OT data mapping through deployment, tuning, and ongoing managed intelligence. You\'re not handed a product and left to run it alone.',
  },
];

const deploymentArchitecture = [
  'Industrial Edge Nodes',
  'AI Inference Pipelines',
  'Command Center Dashboards',
  'Optional Cloud Sync',
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-white/10 py-6 first:border-t-0 first:pt-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-start justify-between gap-6 text-left"
      >
        <span className="text-base font-semibold text-white sm:text-lg">{q}</span>
        <span className="mt-1 flex-shrink-0 text-[#88dbff]">
          <svg className="h-5 w-5 transition-transform duration-300" style={{ transform: open ? 'rotate(45deg)' : 'rotate(0deg)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="mt-4 text-base leading-8 text-slate-300">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function EdgeBayIntellifencePage() {
  return (
    <Layout
      title="EdgeBay IntelliFence — Industrial Edge AI for Mining & Manufacturing | DSeT"
      description="EdgeBay IntelliFence is DSeT's industrial edge AI platform — OT-IT convergence, predictive maintenance, and real-time safety intelligence for mining, manufacturing, and utilities in India."
      ogImage="/images/edgebay.png"
      jsonLd={{
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'EdgeBay IntelliFence',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Edge, Cloud, Hybrid, Air-Gapped',
        description: 'Industrial Edge AI platform that fuses OT-IT sensor, control, and IT telemetry for predictive safety, compliance, and uptime at the industrial edge.',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
        provider: { '@type': 'Organization', name: 'DSeT Consulting', url: 'https://dsetconsulting.com' },
        url: 'https://dsetconsulting.com/product/edgebay-intelligence',
        image: 'https://dsetconsulting.com/images/edgebay.png',
        keywords: 'industrial edge AI India, IIoT platform India, OT IT convergence India, predictive maintenance AI India, edge computing manufacturing India, industrial AI for mining India, SCADA analytics platform, edge AI for utilities India, EdgeBay IntelliFence, shop floor AI India',
      }}
      breadcrumbs={[
        { name: 'Home', href: '/' },
        { name: 'Platforms', href: '/product' },
        { name: 'EdgeBay IntelliFence', href: '/product/edgebay-intelligence' },
      ]}
    >
      <div className={`${productPageFont.variable} product-page-shell relative overflow-hidden bg-[#020816] text-white`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(79,172,254,0.24),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(0,242,254,0.18),transparent_26%),linear-gradient(180deg,#06101f_0%,#040914_38%,#020611_100%)]" />
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(123,176,255,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(123,176,255,0.09)_1px,transparent_1px)] [background-size:72px_72px]" />

        <main className="relative z-10">
          <section className="px-4 pb-18 pt-8 sm:px-6 md:px-10 lg:px-14 xl:px-20">
            <div className="mx-auto max-w-[1440px]">
              <div className="relative overflow-hidden rounded-[36px] border border-white/12 bg-white/6 shadow-[0_40px_140px_rgba(8,27,58,0.55)] backdrop-blur-xl">
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(97,189,255,0.16),transparent_32%,transparent_65%,rgba(92,234,255,0.14))]" />
                <div className="grid min-h-[720px] items-center gap-10 px-6 py-10 sm:px-8 md:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-14 lg:py-14">
                  <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="relative z-10 max-w-2xl"
                  >
                    <div className="product-page-kicker inline-flex items-center gap-3 rounded-full border border-[#78c8ff]/30 bg-[#78c8ff]/10 px-4 py-2 text-[#d8f4ff]">
                      <span className="h-2 w-2 rounded-full bg-[#88ecff]" />
                      Industrial Edge AI Platform
                    </div>

                    <h1 className="product-page-display mt-7 text-white">
                      EdgeBay IntelliFence
                    </h1>

                    <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
                      Real-time OT-IT edge intelligence for mining, manufacturing, and utilities. Fuse sensor, control, and IT telemetry for predictive safety, compliance, and uptime at the edge.
                    </p>

                    <div className="mt-8 space-y-4 border-l border-white/12 pl-5">
                      {highlights.map((item) => (
                        <div key={item} className="flex items-start gap-3 text-sm leading-7 text-slate-200 sm:text-base">
                          <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[#8de7ff] shadow-[0_0_18px_rgba(141,231,255,0.9)]" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-10 flex flex-wrap items-center gap-4">
                      <Link
                        href="/contact?type=demo&product=edgebay"
                        className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#5cc5ff_0%,#7cecff_55%,#9be7ff_100%)] px-8 text-sm font-semibold text-slate-950 transition-transform duration-300 hover:-translate-y-0.5"
                      >
                        Request Demo
                      </Link>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="relative"
                  >
                    <div className="absolute -left-8 top-10 h-40 w-40 rounded-full bg-[#45b9ff]/25 blur-3xl" />
                    <div className="absolute -right-6 bottom-10 h-44 w-44 rounded-full bg-[#7af1ff]/20 blur-3xl" />

                    <div className="relative overflow-hidden rounded-[30px] border border-white/14 bg-slate-950/35 p-3 shadow-[0_30px_120px_rgba(7,20,43,0.55)] backdrop-blur-2xl">
                      <div className="relative aspect-[1.02/1.08] overflow-hidden rounded-[24px]">
                        <Image
                          src="/images/edgebay.png"
                          alt="Industrial edge analytics control center with monitoring systems"
                          fill
                          priority
                          sizes="(max-width: 1024px) 100vw, 46vw"
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,8,22,0.12)_0%,rgba(2,8,22,0.18)_38%,rgba(2,8,22,0.68)_100%)]" />
                      </div>

                      <div className="pointer-events-none absolute left-7 right-7 top-7 flex justify-between gap-4">
                        <div className="rounded-full border border-white/16 bg-slate-950/45 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.28em] text-[#dff7ff] backdrop-blur-xl">
                          Industrial edge analytics control center with monitoring systems
                        </div>
                      </div>

                      <div className="pointer-events-none absolute bottom-7 left-7 right-7">
                        <div className="max-w-sm rounded-[24px] border border-white/14 bg-white/8 p-5 backdrop-blur-xl">
                          <div className="text-xs uppercase tracking-[0.34em] text-[#9ceaff]">
                            Edge-native AI orchestration with live video analytics
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </section>

          <section className="px-4 py-20 sm:px-6 md:px-10 lg:px-14 xl:px-20">
            <div className="mx-auto max-w-[1320px]">
              <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
                <div>
                  <div className="product-page-kicker text-[#88dbff]">EdgeBay IntelliFence</div>
                  <h2 className="product-page-section-heading mt-5 text-white">
                    Continuous edge intelligence for industrial operations
                  </h2>
                </div>

                <div className="space-y-10">
                  {overviewSections.map((section, index) => (
                    <motion.div
                      key={section.title}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.35 }}
                      transition={{ duration: 0.55, delay: index * 0.08 }}
                      className="border-t border-white/10 pt-8 first:border-t-0 first:pt-0"
                    >
                      <div className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr] lg:gap-10">
                        <h3 className="product-page-subheading text-white">
                          {section.title}
                        </h3>
                        <p className="text-base leading-8 text-slate-300 sm:text-lg">{section.body}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="px-4 py-20 sm:px-6 md:px-10 lg:px-14 xl:px-20">
            <div className="mx-auto max-w-[1320px]">
              <div className="border-y border-white/10 py-12">
                <div className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr]">
                  <div>
                    <div className="product-page-kicker text-[#88dbff]">Key Features</div>
                    <h2 className="product-page-section-heading mt-5 text-white">
                      Edge AI engineered for harsh industrial environments
                    </h2>
                  </div>

                  <div>
                    {features.map((feature, index) => (
                      <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, x: 22 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.25 }}
                        transition={{ duration: 0.45, delay: index * 0.06 }}
                        className="grid gap-4 border-t border-white/10 py-7 first:border-t-0 first:pt-0 lg:grid-cols-[88px_1fr]"
                      >
                        <div className="text-sm font-medium tracking-[0.3em] text-[#8bdfff]">
                          {String(index + 1).padStart(2, '0')}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white sm:text-2xl">
                            {feature.title}
                          </h3>
                          <p className="mt-3 max-w-3xl text-base leading-8 text-slate-300">{feature.body}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="px-4 py-20 sm:px-6 md:px-10 lg:px-14 xl:px-20">
            <div className="mx-auto max-w-[1320px]">
              <div className="rounded-[34px] border border-white/10 bg-white/[0.04] px-6 py-10 backdrop-blur-xl sm:px-8 lg:px-10">
                <div className="product-page-kicker text-[#88dbff]">Technical Stack</div>
                <div className="mt-8 flex flex-wrap gap-3">
                  {technicalStack.map((item) => (
                    <div
                      key={item}
                      className="rounded-full border border-white/12 bg-[linear-gradient(135deg,rgba(126,216,255,0.14),rgba(255,255,255,0.05))] px-5 py-3 text-sm font-medium text-slate-100 backdrop-blur-xl sm:text-base"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="px-4 py-20 sm:px-6 md:px-10 lg:px-14 xl:px-20">
            <div className="mx-auto max-w-[1320px]">
              <div className="product-page-kicker text-[#88dbff]">Industries & Use Cases</div>

              <div className="mt-10 space-y-20">
                {industries.map((industry, index) => (
                  <motion.div
                    key={industry.name}
                    initial={{ opacity: 0, y: 26 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.55 }}
                    className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${index % 2 === 1 ? 'lg:[&>div:first-child]:order-2 lg:[&>div:last-child]:order-1' : ''}`}
                  >
                    <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.04] p-3 backdrop-blur-xl">
                      <div className="relative aspect-[1.22/1] overflow-hidden rounded-[24px]">
                        <Image
                          src={industry.image}
                          alt={industry.alt}
                          fill
                          sizes="(max-width: 1024px) 100vw, 48vw"
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,8,22,0.06),rgba(2,8,22,0.62))]" />
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-6 lg:border-t-0 lg:border-l lg:pl-10 lg:pt-0">
                      <h3 className="product-page-subheading text-white sm:text-4xl">
                        {industry.name}
                      </h3>
                      <div className="mt-6 space-y-4">
                        {industry.useCases.map((useCase) => (
                          <div key={useCase} className="flex items-start gap-3 text-base leading-8 text-slate-300">
                            <span className="mt-3 h-1.5 w-8 rounded-full bg-[linear-gradient(90deg,#5cc5ff,#8ae7ff)]" />
                            <span>{useCase}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <section className="px-4 py-20 sm:px-6 md:px-10 lg:px-14 xl:px-20">
            <div className="mx-auto max-w-[1320px] border-y border-white/10 py-12">
              <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
                <div>
                  <div className="product-page-kicker text-[#88dbff]">Value Delivered</div>
                </div>
                <div className="flex flex-wrap gap-x-8 gap-y-5">
                  {valueDelivered.map((item) => (
                    <div key={item} className="product-page-subheading text-white">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="px-4 py-20 sm:px-6 md:px-10 lg:px-14 xl:px-20">
            <div className="mx-auto max-w-[1320px]">
              <div className="grid gap-12 lg:grid-cols-[0.74fr_1.26fr]">
                <div>
                  <div className="product-page-kicker text-[#88dbff]">Deployment Architecture</div>
                  <h2 className="product-page-section-heading mt-5 text-white">
                    Edge-native deployment from site to cloud
                  </h2>
                </div>

                <div className="relative">
                  <div className="absolute left-3 top-0 hidden h-full w-px bg-[linear-gradient(180deg,rgba(92,197,255,0.8),rgba(146,236,255,0.1))] lg:block" />
                  <div className="space-y-8">
                    {deploymentArchitecture.map((item, index) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, x: 18 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.45, delay: index * 0.06 }}
                        className="relative border-b border-white/10 pb-6 pl-0 last:border-b-0 last:pb-0 lg:pl-12"
                      >
                        <div className="absolute left-0 top-1 hidden h-6 w-6 rounded-full border border-[#82e5ff]/40 bg-[#0b233e] shadow-[0_0_24px_rgba(130,229,255,0.25)] lg:block" />
                        <div className="text-sm font-medium tracking-[0.3em] text-[#8bdfff]">
                          {String(index + 1).padStart(2, '0')}
                        </div>
                        <div className="product-page-subheading mt-3 text-white">
                          {item}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="px-4 py-20 sm:px-6 md:px-10 lg:px-14 xl:px-20">
            <div className="mx-auto max-w-[1320px]">
              <div className="grid gap-12 lg:grid-cols-[0.74fr_1.26fr]">
                <div>
                  <div className="product-page-kicker text-[#88dbff]">FAQ</div>
                  <h2 className="product-page-section-heading mt-5 text-white">
                    Common questions
                  </h2>
                </div>
                <div>
                  {faqs.map((item) => (
                    <FAQItem key={item.q} q={item.q} a={item.a} />
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="px-4 pb-24 pt-20 sm:px-6 md:px-10 lg:px-14 xl:px-20">
            <div className="mx-auto max-w-[1320px]">
              <div className="relative overflow-hidden rounded-[36px] border border-white/12 bg-white/[0.05] px-6 py-12 shadow-[0_28px_100px_rgba(8,27,58,0.45)] backdrop-blur-2xl sm:px-8 lg:px-12 lg:py-14">
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(94,209,255,0.18),transparent_30%,transparent_65%,rgba(255,255,255,0.05))]" />
                <div className="relative z-10 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
                  <div>
                    <div className="product-page-kicker text-[#88dbff]">Take the next step</div>
                    <h2 className="product-page-section-heading mt-5 text-white">
                      Activate your edge intelligence roadmap
                    </h2>
                  </div>

                  <div className="flex flex-wrap gap-4 lg:justify-end">
                    <Link
                      href="/contact?type=consultation&product=edgebay"
                      className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#5cc5ff_0%,#7cecff_55%,#9be7ff_100%)] px-7 text-sm font-semibold text-slate-950 transition-transform duration-300 hover:-translate-y-0.5"
                    >
                      Book Consultation
                    </Link>
                    <Link
                      href="/digital-assessment"
                      className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/14 bg-white/6 px-7 text-sm font-semibold text-white backdrop-blur-xl transition-colors duration-300 hover:bg-white/10"
                    >
                      Explore Digital Assessment
                    </Link>
                    <Link
                      href="/contact?type=demo&product=edgebay"
                      className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/14 bg-white/6 px-7 text-sm font-semibold text-white backdrop-blur-xl transition-colors duration-300 hover:bg-white/10"
                    >
                      Request a Demo
                    </Link>
                    <Link
                      href="/dset-arc-managed-intelligence-services"
                      className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/14 bg-white/6 px-7 text-sm font-semibold text-white/60 backdrop-blur-xl transition-colors duration-300 hover:bg-white/10 hover:text-white"
                    >
                      How We Deploy (DSeT ARC™)
                    </Link>
                  </div>

                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </Layout>
  );
}
