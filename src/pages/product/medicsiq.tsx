import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import Section from '@/components/ui/Section';
import { productPageFont } from '@/lib/productPageTypography';
import { CheckCircle, Activity, Shield, Cpu, Layers, ArrowRight, Eye, Users, TrendingUp, Lock } from 'lucide-react';

const COLOR = '#22c55e'; // emerald/green for MedicsIQ
const COLOR_ALT = '#0ea5e9'; // sky blue accent

const features = [
  {
    num: '01',
    name: 'AI-Powered Skin & Hair Analysis',
    desc: 'Camera vision model optimised for India-centric skin tones and hair types — analysing 12+ biomarkers including hydration, sebum, melanin, texture, and scalp health from a single photo capture in under 3 seconds.',
  },
  {
    num: '02',
    name: 'Personalised Product Recommendations',
    desc: 'Maps each skin and hair analysis result to any product catalogue — delivering ingredient-level justification for every recommendation across any brand or SKU library.',
  },
  {
    num: '03',
    name: 'Voice Chat AI Assistant',
    desc: 'Conversational voice AI with regional language support for intuitive product discovery, consumer onboarding, and personalized routine building — making wellness accessible across language barriers.',
  },
  {
    num: '04',
    name: 'Overall Wellness Tracker',
    desc: 'Monitors holistic user wellness metrics across multiple sessions to contextualize product efficacy, track routine improvements, and reveal measurable progress over time.',
  },
  {
    num: '05',
    name: 'Optimized Edge Deployment',
    desc: 'AI inference targeted directly on edge devices — maximising privacy, reducing latency, and enabling offline capabilities for kiosk and retail environments without cloud dependency.',
  },
  {
    num: '06',
    name: 'Transparent Recommendation Logic',
    desc: 'Every recommendation surfaces ingredient-level rationale, compatibility matching, and the underlying biomarker evidence — so advisors and consumers understand exactly why each product was suggested.',
  },
];

const narrativeRows = [
  {
    label: 'AI Skin Analysis',
    heading: 'Precision skin intelligence from a smartphone camera.',
    body: 'MedicsIQ\'s vision layer analyses facial skin across 12+ skin and scalp biomarkers — hydration, sebum production, melanin distribution, texture uniformity, and more. Results are generated in under 3 seconds and presented in a structured assessment report for brands and consumers.',
    image: '/skin_care.jpg',
    imageAlt: 'AI Skin Analysis',
    flipped: false,
  },
  {
    label: 'Product Mapping & Commerce',
    heading: 'Recommendations tied directly to any product catalogue.',
    body: 'MedicsIQ is built to bridge wellness assessment output with commerce. Each skin report maps to your product SKUs — with ingredient-level rationale, ingredient compatibility notes, and usage protocols. The platform is multi-brand ready, supporting white-label deployments across any product ecosystem.',
    image: '/Naural_product.avif',
    imageAlt: 'Product Mapping & Commerce',
    flipped: true,
  },
  {
    label: 'Scalable Wellness Intelligence',
    heading: 'Aggregate insights across thousands of sessions.',
    body: 'At scale, MedicsIQ becomes a population-level wellness intelligence layer. Wellness brands and retail chains see anonymised aggregate data — which skin concerns are most prevalent, which product protocols yield the best outcomes, and where geographic or demographic patterns emerge. This converts wellness data into brand strategy.',
    image: '/Ai_face.webp',
    imageAlt: 'AI Wellness Intelligence',
    flipped: false,
  },
];

const integrationPoints = [
  {
    icon: <Cpu className="w-5 h-5" />,
    title: 'Multi-Brand SKU Mapping Engine',
    desc: 'Each skin biomarker output is cross-referenced with your full product taxonomy in real-time — supporting any brand catalogue or SKU library.',
  },
  {
    icon: <Layers className="w-5 h-5" />,
    title: 'Ingredient Intelligence Layer',
    desc: 'AI surfaces active ingredient compatibility and usage guidance — supporting both wellness advisor review and consumer explanation across any product range.',
  },
  {
    icon: <Activity className="w-5 h-5" />,
    title: 'Protocol-Driven Workflows',
    desc: 'Branded usage protocols auto-generated per recommendation, ready for print or digital consumer handoff — white-label customisable per deployment.',
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    title: 'Commerce Analytics Feed',
    desc: 'Recommendation acceptance rates, product conversion data, and protocol adherence metrics piped into your BI stack or analytics platform.',
  },
];

const useCases = [
  {
    icon: '👤',
    title: 'Consumer Wellness',
    desc: 'Mobile apps and web portals for consumer self-serve skin and hair scanning, voice-assisted consultations, and instant purchasing — driving acquisition, engagement, and repeat purchase for any D2C wellness brand.',
    color: COLOR,
  },
  {
    icon: '🏪',
    title: 'Retail & Experience Centers',
    desc: 'Point-of-sale interaction layer to guide consumers to the right products and reduce buying hesitation. MedicsIQ turns every retail touchpoint into a personalised wellness consultation that converts.',
    color: COLOR_ALT,
  },
  {
    icon: '🛍️',
    title: 'Beauty-Tech Retail & Edge Kiosks',
    desc: 'Edge-powered interactive kiosks or QR-triggered experiences that convert browsers into buyers using localized processing. Regional language voice support makes every kiosk interaction feel natural and personal.',
    color: '#a855f7',
  },
];

const valueStats = [
  { value: '<3s', label: 'Assessment Time', sub: 'Real-time results' },
  { value: '12+', label: 'Skin Biomarkers', sub: 'Skin and scalp analysed per session' },
  { value: '3', label: 'Deployment Models', sub: 'SaaS, API and kiosk' },
  { value: '∞', label: 'Brand Support', sub: 'Multi-brand and white-label ready' },
];

const compliance = [
  { icon: <Lock className="w-5 h-5" />, label: 'Privacy-First Architecture', sub: 'No biometric data retained without explicit consent' },
  { icon: <Eye className="w-5 h-5" />, label: 'Explainable AI', sub: 'Every output surfaced with supporting biomarker evidence' },
  { icon: <Shield className="w-5 h-5" />, label: 'Expert Validation', sub: 'Model accuracy benchmarked against skincare and wellness expert assessments' },
  { icon: <Users className="w-5 h-5" />, label: 'User Consent Workflows', sub: 'Built-in digital consent capture aligned with PDPA/GDPR requirements' },
  { icon: <CheckCircle className="w-5 h-5" />, label: 'GDPR / PDPA Compliant', sub: 'Data handling protocols aligned with international privacy regulations' },
];

export default function MedicsIQPage() {
  return (
    <Layout
      title="MedicsIQ — AI Skin, Scalp & Wellness Assessment Platform | DSeT"
      description="MedicsIQ by DSeT is an AI skin, scalp and wellness assessment platform for D2C brands, Ayurveda brands, and wellness retailers. Computer vision, 12+ biomarkers, instant product recommendations."
      ogImage="/Derma_clinic.jpg"
      jsonLd={{
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'MedicsIQ',
        applicationCategory: 'HealthApplication',
        operatingSystem: 'Cloud, Edge',
        description: 'AI skin, scalp and wellness assessment platform — combining computer vision, biomarker analysis, and multi-brand product recommendation intelligence for D2C, Ayurveda and wellness brands.',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
        provider: { '@type': 'Organization', name: 'DSeT Consulting', url: 'https://dsetconsulting.com' },
        url: 'https://dsetconsulting.com/product/medicsiq',
        image: 'https://dsetconsulting.com/Derma_clinic.jpg',
        keywords: 'AI skin analysis India, scalp wellness assessment, D2C skincare AI, Ayurveda wellness platform, skin biomarker analysis, white-label wellness AI, multi-brand skincare recommendation, beauty tech platform India',
      }}
      breadcrumbs={[
        { name: 'Home', href: '/' },
        { name: 'Platforms', href: '/product' },
        { name: 'MedicsIQ', href: '/product/medicsiq' },
      ]}
    >
      <div className={`${productPageFont.variable} product-page-shell`}>

      {/* ── Hero ── */}
      <Section bgColor="light" spacing="xl">
        <div className="relative bg-gradient-to-br from-[#001f3f] via-[#002b57] to-[#001a2e] rounded-3xl shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%2222c55e%22%20stroke-width%3D%220.5%22%20stroke-opacity%3D%220.08%22%3E%3Cpath%20d%3D%22M0%2030h60M30%200v60%22/%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#22c55e]/10 to-transparent" />
          <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gradient-to-r from-[#0ea5e9]/10 to-transparent" />

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
                style={{ background: 'linear-gradient(90deg, #22c55e, #0ea5e9)' }}
              >
                AI Skin, Hair & Wellness Platform
              </span>
              <h1 className="product-page-display mb-5 text-white">
                MedicsIQ
              </h1>
              <p className="text-xl text-gray-300 mb-4 leading-relaxed font-light">
                AI-Powered Precision Wellness at Consumer Scale
              </p>
              <p className="text-base text-gray-400 mb-8 leading-relaxed max-w-lg">
                MedicsIQ combines computer vision, skin and scalp assessment, and recommendation intelligence
                into a single platform — built for D2C brands, Ayurveda brands, wellness retailers,
                and consumer-facing experiences.
              </p>
              <ul className="space-y-3 mb-10">
                {[
                  '<3 second assessment time',
                  '12+ skin and scalp biomarkers',
                  'SaaS, API and kiosk deployment models',
                  'Product mapping and commerce integration',
                  'Multi-brand and white-label ready',
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
                    href="/contact?type=demo&product=medicsiq"
                    className="inline-flex items-center gap-2 px-7 py-3.5 text-white font-semibold rounded-xl shadow-lg text-sm"
                    style={{ background: 'linear-gradient(135deg, #22c55e, #0ea5e9)' }}
                  >
                    Request a Demo <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/contact?type=demo&product=medicsiq"
                    className="inline-flex items-center gap-2 px-7 py-3.5 border border-white/30 text-white font-semibold rounded-xl text-sm hover:bg-white/10 transition-colors duration-200"
                  >
                    Learn More
                  </Link>
                </motion.div>
              </div>
            </motion.div>

            {/* Right: Image */}
            <motion.div
              className="relative w-full h-80 lg:h-[600px] overflow-hidden rounded-b-3xl lg:rounded-l-none lg:rounded-r-3xl"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <Image
                src="/skin_care.jpg"
                alt="MedicsIQ Skin Analysis Platform"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#001f3f]/60 via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#001f3f]/40 lg:via-transparent lg:to-transparent" />

              {/* Floating stat badge */}
              <motion.div
                className="absolute bottom-8 left-6 backdrop-blur-md bg-white/[0.08] border border-white/20 rounded-2xl p-4 shadow-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#22c55e20' }}>
                    <Activity className="w-5 h-5" style={{ color: COLOR }} />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">12+ Biomarkers</p>
                    <p className="text-xs text-gray-400">Analysed in &lt;3 seconds</p>
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
              style={{ background: 'rgba(34, 197, 94, 0.05)' }}
            >
              <p className="text-4xl font-bold mb-1" style={{ color: COLOR }}>{s.value}</p>
              <p className="text-white font-semibold text-sm mb-1">{s.label}</p>
              <p className="text-gray-500 text-xs">{s.sub}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── What MedicsIQ Does — Alternating Narrative ── */}
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
            What <span style={{ color: COLOR }}>MedicsIQ</span> Does
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
              {/* Image */}
              <div className="relative h-72 sm:h-96 rounded-3xl overflow-hidden shadow-2xl lg:[direction:ltr]">
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
                  style={{ background: i === 1 ? '#a855f7' : COLOR }}
                >
                  {row.label}
                </div>
              </div>

              {/* Text */}
              <div className="lg:[direction:ltr]">
                <div
                  className="inline-block w-12 h-1 rounded-full mb-5"
                  style={{ background: i === 1 ? '#a855f7' : COLOR }}
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

      {/* ── Key Features — Numbered List ── */}
      <Section bgColor="white" spacing="xl">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 text-xs font-bold text-white rounded-full mb-4 uppercase tracking-wider" style={{ background: COLOR }}>
              Key Features
            </span>
            <h2 className="product-page-section-heading text-white">
              Built for Precision Wellness.<br />
              <span style={{ color: COLOR }}>Designed for Consumer Scale.</span>
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

      {/* ── Product & Commerce Integration ── */}
      <Section bgColor="light" spacing="xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 text-xs font-bold text-white rounded-full mb-4 uppercase tracking-wider" style={{ background: '#a855f7' }}>
            Product &amp; Commerce Integration
          </span>
          <h2 className="product-page-section-heading text-white">
            Wellness Intelligence Meets<br />
            <span style={{ color: '#a855f7' }}>Product Commerce</span>
          </h2>
          <p className="text-gray-400 text-lg mt-4 max-w-2xl mx-auto">
            MedicsIQ integrates with any product ecosystem — turning every skin analysis into a
            conversion-ready recommendation across multiple brands and catalogues.
          </p>
        </motion.div>

        {/* Glassmorphism panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
          style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.12), rgba(34,197,94,0.08), rgba(14,165,233,0.10))' }}
        >
          <div className="absolute inset-0 backdrop-blur-sm" />
          <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(90deg, #22c55e, #a855f7, #0ea5e9)' }} />

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
                    style={{ background: 'rgba(168,85,247,0.2)' }}
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

      {/* ── Use Cases — Horizontal Strips ── */}
      <Section bgColor="white" spacing="xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 text-xs font-bold text-white rounded-full mb-4 uppercase tracking-wider" style={{ background: COLOR_ALT }}>
            Use Cases
          </span>
          <h2 className="product-page-section-heading text-white">
            Where <span style={{ color: COLOR_ALT }}>MedicsIQ</span> Deploys
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

      {/* ── Technology Stack ── */}
      <Section bgColor="light" spacing="xl">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 text-xs font-bold text-white rounded-full mb-4 uppercase tracking-wider" style={{ background: COLOR }}>
              Technology
            </span>
            <h2 className="product-page-section-heading text-white">
              Architecture Built for<br />
              <span style={{ color: COLOR }}>Wellness Deployment</span>
            </h2>
          </motion.div>

          {/* Architecture flow diagram */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden border border-white/10 p-8 sm:p-12"
            style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.06), rgba(14,165,233,0.06))' }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              {[
                { step: '1', label: 'Capture', desc: 'Photo input via mobile app, kiosk, or clinic tablet' },
                { step: '2', label: 'Analyse', desc: '12+ biomarker AI model runs on edge or cloud inference' },
                { step: '3', label: 'Recommend', desc: 'Skin report + SKU mapping delivered in under 3 seconds' },
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

      {/* ── Compliance ── */}
      <Section bgColor="white" spacing="xl">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 text-xs font-bold text-white rounded-full mb-4 uppercase tracking-wider" style={{ background: '#0ea5e9' }}>
              Compliance & Ethics
            </span>
            <h2 className="product-page-section-heading text-white">
              Responsible AI at Every Layer
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
                  style={{ background: 'rgba(14,165,233,0.15)', color: COLOR_ALT }}
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
      <Section bgColor="light" spacing="lg">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative text-center max-w-4xl mx-auto rounded-3xl overflow-hidden py-16 px-8"
          style={{ background: 'linear-gradient(135deg, #001f3f, #002b57)' }}
        >
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(34,197,94,0.12) 0%, transparent 70%)' }} />
          <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(90deg, #22c55e, #0ea5e9)' }} />

          <div className="relative z-10">
            <h2 className="product-page-section-heading mb-4 text-white">
              Ready to Transform<br />
              <span style={{ color: COLOR }}>Skin &amp; Wellness Intelligence?</span>
            </h2>
            <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              Whether you&apos;re a wellness brand, an Ayurveda brand, a D2C company, or a retail
              platform — MedicsIQ gives you precision wellness AI at consumer scale.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/contact?type=demo&product=medicsiq"
                  className="inline-flex items-center gap-2 px-8 py-4 text-white font-semibold rounded-xl shadow-lg text-base"
                  style={{ background: 'linear-gradient(135deg, #22c55e, #0ea5e9)' }}
                >
                  Request a Demo <ArrowRight className="w-4 h-4" />
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
              Deploying for your brand?{' '}
              <Link href="/dset-arc-managed-intelligence-services" className="text-[#a855f7] hover:text-[#a855f7]/80 underline underline-offset-2 transition-colors">
                See how DSeT ARC™ takes MedicsIQ from discovery to go-live →
              </Link>
            </p>

          </div>
        </motion.div>
      </Section>
      </div>
    </Layout>
  );
}
