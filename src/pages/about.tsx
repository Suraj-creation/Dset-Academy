import { motion } from 'framer-motion';
import Link from 'next/link';
import Layout from '../components/layout/Layout';
import Section from '../components/ui/Section';
import {
  ArrowRight,
  CheckCircle,
  Shield,
  Cpu,
  Zap,
  Layers,
  TrendingUp,
  Globe,
  Award,
  Users,
} from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const platforms = [
  { name: 'OreBill AI™',          industry: 'Mining & Mineral Logistics',      color: '#ff851b', href: '/product/orebill-ai' },
  { name: 'EdgeBay IntelliFence', industry: 'Industrial / OT Edge AI',           color: '#1e90ff', href: '/product/edgebay-intelligence' },
  { name: 'SecureCloud',          industry: 'Compliance-first Cloud Security',   color: '#5e17ea', href: '/product/securecloud' },
  { name: 'iPaS-RevOps',          industry: 'Revenue Operations Automation',     color: '#0ea5e9', href: '/product/ipas-revops' },
  { name: 'MedicsIQ',             industry: 'AI Dermatology & Wellness',          color: '#22c55e', href: '/product/medicsiq' },
];

const capabilities = [
  {
    icon: <Cpu className="w-6 h-6" />,
    title: 'Vertical AI Platforms',
    desc: 'Purpose-built AI for mining, industrial operations, healthcare, and secure enterprise — not horizontal tools adapted from generic AI.',
    color: '#ff851b',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Regulated-First Architecture',
    desc: 'Every platform is designed from the ground up for compliance — GST, PCI-DSS, GDPR and India regulatory requirements. Compliance is a feature, not a retrofit.',
    color: '#5e17ea',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Edge & Hybrid Deployment',
    desc: 'Deploy at the industrial edge, in the cloud, or hybrid. Our platforms operate in low-connectivity and air-gapped environments.',
    color: '#1e90ff',
  },
  {
    icon: <Layers className="w-6 h-6" />,
    title: 'Non-API Intelligence',
    desc: 'Built to extract intelligence from PDF-driven government systems, legacy ERP, and OT networks — without waiting for API access.',
    color: '#0ea5e9',
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: 'OT/IT Convergence',
    desc: 'Bridge SCADA, PLC, and sensor data with enterprise IT systems — giving plant managers and C-suite a unified intelligence layer.',
    color: '#22c55e',
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: 'Platform + Deployment',
    desc: "DSeT ARC delivers end-to-end — platform configuration, integration, change management, and ongoing intelligence services.",
    color: '#a855f7',
  },
];

const differentiators = [
  {
    icon: <Award className="w-7 h-7" />,
    title: 'Deeptech, Not Consulting',
    desc: 'We build proprietary AI platforms — not slide decks or POCs. Every engagement ships working software.',
  },
  {
    icon: <Cpu className="w-7 h-7" />,
    title: 'Proven in Complex Environments',
    desc: 'Deployed in ₹100 Cr+ monthly ore flow environments, industrial edge networks, and regulated financial operations.',
  },
  {
    icon: <Users className="w-7 h-7" />,
    title: 'Microsoft ISV Partner',
    desc: 'iPaS-RevOps is live on Microsoft Marketplace. Our platforms meet enterprise procurement and compliance standards.',
  },
  {
    icon: <Shield className="w-7 h-7" />,
    title: 'Execution Over Dashboards',
    desc: "OreBill AI doesn't show billing data — it generates invoices. EdgeBay doesn't alert — it acts. Agentic execution, not analytics.",
  },
];

export default function AboutPage() {
  return (
    <Layout
      title="About DSeT | Vertical AI Platform Company for Regulated Industries"
      description="DSeT builds proprietary AI platforms for mining, industrial operations, healthcare, and secure enterprise — deployable at the edge, cloud, or hybrid."
      jsonLd={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'DSeT Consulting',
        url: 'https://dsetconsulting.com',
        logo: 'https://dsetconsulting.com/DSeTC_logo2.png',
        description: 'DSeT is a deeptech AI platform company building proprietary vertical AI platforms for mining, industrial operations, healthcare, and secure enterprise.',
        foundingLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: 'Bengaluru', addressRegion: 'Karnataka', addressCountry: 'IN' } },
        sameAs: [
          'https://www.linkedin.com/company/dset-consulting',
          'https://x.com/cmdset10x',
          'https://www.facebook.com/DSeTConsulting/',
        ],
        knowsAbout: ['Vertical AI', 'Mining AI', 'Industrial Edge AI', 'Healthcare AI', 'Cloud Security', 'Revenue Operations'],
      }}
    >
      {/* ── Hero ── */}
      <Section bgColor="light" spacing="xl">
        <div className="relative bg-gradient-to-br from-[#001f3f] via-[#002b57] to-[#001f3f] rounded-3xl shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%221e90ff%22%20stroke-width%3D%220.5%22%20stroke-opacity%3D%220.08%22%3E%3Cpath%20d%3D%22M0%2030h60M30%200v60%22/%3E%3C/g%3E%3C/svg%3E')] opacity-40" />
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#5e17ea]/8 to-transparent" />
          <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gradient-to-r from-[#1e90ff]/5 to-transparent" />

          <div className="relative z-10 px-8 py-16 sm:px-14 sm:py-20 max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <span
                className="inline-block mb-5 px-4 py-1.5 text-xs font-bold text-white rounded-full tracking-wider uppercase bg-gradient-to-r from-[#5e17ea] to-[#1e90ff]"
              >
                About DSeT
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight tracking-[-0.03em]">
                <span className="bg-gradient-to-r from-[#ff851b] to-[#1e90ff] bg-clip-text text-transparent">
                  Building Vertical AI Platforms
                </span>
                <br className="hidden sm:block" />
                <span className="text-white">for the Real World</span>
              </h1>
              <p className="text-lg text-gray-300 leading-relaxed mb-8 max-w-2xl mx-auto">
                DSeT is a deeptech AI platform company. We build proprietary, industry-specific AI platforms
                for mining, industrial operations, healthcare, and secure enterprise — designed for regulated,
                edge, and hybrid environments where generic tools fail.
              </p>
              <ul className="space-y-3 mb-10 inline-flex flex-col items-start text-left">
                {[
                  '5+ vertical AI platforms in market or active pilot',
                  'Deployed in environments processing ₹100 Cr+ monthly flows',
                  'Microsoft ISV Partner — enterprise-grade from day one',
                ].map((pt) => (
                  <li key={pt} className="flex items-start gap-3 text-gray-300 text-sm">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#1e90ff]" />
                    {pt}
                  </li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/product"
                    className="inline-flex items-center gap-2 px-7 py-3.5 text-white font-semibold rounded-xl shadow-lg text-sm bg-gradient-to-br from-[#5e17ea] to-[#1e90ff]"
                  >
                    Explore Our Platforms <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/contact?type=demo"
                    className="inline-flex items-center gap-2 px-7 py-3.5 border border-white/30 text-white font-semibold rounded-xl text-sm hover:bg-white/10 transition-colors duration-200"
                  >
                    Book a Strategic Demo
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ── Vision & Mission ── */}
      <Section bgColor="white" spacing="xl">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="inline-block px-4 py-1.5 text-xs font-bold text-white rounded-full mb-4 uppercase tracking-wider bg-[#5e17ea]">
              Vision &amp; Mission
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-[-0.04em]">
              <span className="text-white">Why </span>
              <span className="bg-gradient-to-r from-[#5e17ea] to-[#1e90ff] bg-clip-text text-transparent">DSeT </span>
              <span className="text-[#ff851b]">Exists</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-8 rounded-3xl border border-white/[0.08]"
              style={{ background: 'linear-gradient(135deg, rgba(94,23,234,0.10), rgba(0,31,63,0.4))' }}
            >
              <div className="inline-block px-3 py-1 text-xs font-bold text-white rounded-full mb-5 uppercase tracking-wider bg-[#5e17ea]">
                Vision
              </div>
              <p className="text-white text-xl font-semibold leading-relaxed">
                "To become the defining vertical AI platform company for operationally complex and regulated industries globally."
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-8 rounded-3xl border border-white/[0.08]"
              style={{ background: 'linear-gradient(135deg, rgba(30,144,255,0.10), rgba(0,31,63,0.4))' }}
            >
              <div className="inline-block px-3 py-1 text-xs font-bold text-white rounded-full mb-5 uppercase tracking-wider bg-[#1e90ff]">
                Mission
              </div>
              <p className="text-gray-300 text-lg leading-relaxed">
                DSeT builds proprietary AI platforms that bring real-time intelligence to mining, industrial
                operations, healthcare, and secure enterprise environments — deployable at the edge, in the
                cloud, or in hybrid infrastructure.
              </p>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ── Why Now ── */}
      <Section bgColor="light" spacing="xl">
        <div className="relative bg-gradient-to-br from-[#001f3f] via-[#002b57] to-[#001f3f] rounded-3xl shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%221e90ff%22%20stroke-width%3D%220.5%22%20stroke-opacity%3D%220.08%22%3E%3Cpath%20d%3D%22M0%2030h60M30%200v60%22/%3E%3C/g%3E%3C/svg%3E')] opacity-40" />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ff851b] to-[#1e90ff]" />
          <div className="relative z-10 px-8 py-14 sm:px-14 sm:py-16">
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <span className="inline-block px-4 py-1.5 text-xs font-bold text-white rounded-full mb-6 uppercase tracking-wider bg-[#ff851b]">
                  Why Now
                </span>
                <h2 className="text-4xl font-bold text-white mb-6 leading-tight tracking-[-0.03em]">
                  Regulated industries are<br />
                  <span className="text-[#1e90ff]">finally AI-ready.</span>
                </h2>
                <p className="text-gray-300 text-lg leading-relaxed mb-5">
                  Mining operations, industrial facilities, and regulated enterprises have been running on manual
                  workflows, PDF-driven government systems, and legacy ERP for decades — not because they lacked
                  ambition, but because no one built AI that actually worked in their environment.
                </p>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Edge compute, agentic AI, and hybrid deployment architectures have changed this calculus. DSeT
                  was built specifically to close this gap — with platforms that execute, not just analyse.
                </p>
              </motion.div>

              <div className="space-y-4">
                {[
                  { label: 'AI Platforms in market or active pilot',      value: '5+' },
                  { label: 'Industries served with live deployments',     value: '4' },
                  { label: 'Monthly revenue flows managed by OreBill AI', value: '₹100 Cr+' },
                  { label: 'Microsoft ISV partner status',                value: '✓' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-5 p-5 rounded-2xl border border-white/[0.10] bg-white/[0.05]"
                  >
                    <p className="text-3xl font-bold text-[#1e90ff] min-w-[90px]">{stat.value}</p>
                    <p className="text-gray-300 text-sm leading-relaxed">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Platform Capabilities ── */}
      <Section bgColor="light" spacing="xl">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="relative overflow-hidden rounded-[2rem] border border-[#e8e4dc] bg-[#fbfaf7] px-6 py-10 sm:px-10 sm:py-12 shadow-[0_20px_60px_rgba(15,23,42,0.09)]"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Orange top bar */}
            <div className="absolute inset-x-0 top-0 h-[6px] bg-[#ff851b]" />
            {/* Dot grid */}
            <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(15,23,42,0.05)_1px,_transparent_1px)] [background-size:22px_22px] opacity-40 pointer-events-none" />
            {/* Header */}
            <motion.div
              className="relative z-10 flex items-center gap-3 mb-8"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#ff851b', boxShadow: '0 10px 24px rgba(255,133,27,0.28)' }}
              >
                <Cpu className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#001f3f] tracking-tight leading-tight">
                Platform{' '}
                <span className="text-[#4f5d73] font-normal">Capabilities</span>
              </h2>
            </motion.div>
            {/* Cards */}
            <motion.div
              className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.05 }}
            >
              {capabilities.map((cap) => (
                <motion.div
                  key={cap.title}
                  variants={item}
                  whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.2, ease: 'easeOut' } }}
                >
                  <div className="group flex flex-col h-full bg-white rounded-[1.15rem] border border-[#ece8e0] shadow-[0_4px_16px_rgba(15,23,42,0.07)] hover:shadow-[0_12px_28px_rgba(255,133,27,0.15)] transition-shadow duration-300 overflow-hidden">
                    <div className="h-[5px] w-full flex-shrink-0 bg-[#ff851b]" />
                    <div className="flex flex-col flex-1 p-6">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 flex-shrink-0 text-white"
                        style={{ backgroundColor: '#ff851b', boxShadow: '0 6px 16px rgba(255,133,27,0.28)' }}
                      >
                        {cap.icon}
                      </div>
                      <h3 className="text-[0.95rem] font-bold text-[#001f3f] mb-2 leading-snug">{cap.title}</h3>
                      <p className="text-sm text-[#5a6a7a] leading-relaxed flex-1">{cap.desc}</p>
                      <Link
                        href="/product"
                        className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold hover:gap-2.5 transition-all duration-200 text-[#ff851b]"
                      >
                        Explore More
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </Section>

      {/* ── Our Platforms ── */}
      <Section bgColor="light" spacing="xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 text-xs font-bold text-white rounded-full mb-4 uppercase tracking-wider bg-[#5e17ea]">
            Our Platforms
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-[-0.04em]">
            <span className="text-[#ff851b]">Vertical AI</span>{' '}
            <span className="bg-gradient-to-r from-[#5e17ea] to-[#1e90ff] bg-clip-text text-transparent">Platforms</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
          {platforms.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
            >
              <Link
                href={p.href}
                className="flex flex-col items-center text-center p-5 rounded-2xl border border-white/[0.08] hover:border-white/20 transition-all duration-300 hover:-translate-y-1 group"
                style={{ background: `${p.color}08` }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-base font-bold text-white mb-3 shadow"
                  style={{ background: `linear-gradient(135deg, ${p.color}, ${p.color}99)` }}
                >
                  {p.name.charAt(0)}
                </div>
                <h3 className="text-white font-bold text-xs mb-1">{p.name}</h3>
                <p className="text-gray-500 text-xs leading-snug">{p.industry}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── Why DSeT ── */}
      <Section bgColor="light" spacing="xl">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="relative overflow-hidden rounded-[2rem] border border-[#e8e4dc] bg-[#fbfaf7] px-6 py-10 sm:px-10 sm:py-12 shadow-[0_20px_60px_rgba(15,23,42,0.09)]"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Blue top bar */}
            <div className="absolute inset-x-0 top-0 h-[6px] bg-[#1e90ff]" />
            {/* Dot grid */}
            <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(15,23,42,0.05)_1px,_transparent_1px)] [background-size:22px_22px] opacity-40 pointer-events-none" />
            {/* Header */}
            <motion.div
              className="relative z-10 flex items-center gap-3 mb-8"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#1e90ff', boxShadow: '0 10px 24px rgba(30,144,255,0.28)' }}
              >
                <Award className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#001f3f] tracking-tight leading-tight">
                What Makes Us{' '}
                <span className="text-[#4f5d73] font-normal">Different</span>
              </h2>
            </motion.div>
            {/* Cards */}
            <motion.div
              className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.05 }}
            >
              {differentiators.map((d) => (
                <motion.div
                  key={d.title}
                  variants={item}
                  whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.2, ease: 'easeOut' } }}
                >
                  <div className="group flex flex-col h-full bg-white rounded-[1.15rem] border border-[#ece8e0] shadow-[0_4px_16px_rgba(15,23,42,0.07)] hover:shadow-[0_12px_28px_rgba(30,144,255,0.15)] transition-shadow duration-300 overflow-hidden">
                    <div className="h-[5px] w-full flex-shrink-0 bg-[#1e90ff]" />
                    <div className="flex flex-col flex-1 p-6">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 flex-shrink-0 text-white"
                        style={{ backgroundColor: '#1e90ff', boxShadow: '0 6px 16px rgba(30,144,255,0.28)' }}
                      >
                        {d.icon}
                      </div>
                      <h3 className="text-[0.95rem] font-bold text-[#001f3f] mb-2 leading-snug">{d.title}</h3>
                      <p className="text-sm text-[#5a6a7a] leading-relaxed flex-1">{d.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </Section>

      {/* ── Leadership ── */}
      <Section bgColor="white" spacing="xl">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 text-xs font-bold text-white rounded-full mb-4 uppercase tracking-wider bg-[#5e17ea]">
              Leadership
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-[-0.04em]">
              <span className="text-white">The Team </span>
              <span className="bg-gradient-to-r from-[#5e17ea] to-[#1e90ff] bg-clip-text text-transparent">Behind DSeT</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-[2rem] border border-[#e8e4dc] bg-[#fbfaf7] shadow-[0_20px_60px_rgba(15,23,42,0.09)]"
          >
            <div className="absolute inset-x-0 top-0 h-[6px] bg-gradient-to-r from-[#5e17ea] to-[#1e90ff]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(15,23,42,0.04)_1px,_transparent_1px)] [background-size:22px_22px] opacity-40 pointer-events-none" />

            <div className="relative z-10 p-8 sm:p-12">
              <div className="flex flex-col sm:flex-row gap-8 items-start">

                {/* Avatar */}
                <div className="flex-shrink-0 flex flex-col items-center gap-3">
                  <img
                    src="/Ceo_img.jpg"
                    alt="Chinmaya Mishra — Founder & CEO, DSeT"
                    className="w-24 h-24 rounded-2xl object-cover shadow-lg"
                    style={{ border: '3px solid rgba(94,23,234,0.25)' }}
                  />
                  <a
                    href="https://www.linkedin.com/in/chinmaya-mishra"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-white transition-opacity hover:opacity-80 bg-[#0077b5]"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    LinkedIn
                  </a>
                </div>

                {/* Bio */}
                <div className="flex-1">
                  <div className="mb-1">
                    <h3 className="text-2xl font-bold text-[#001f3f] leading-tight">Chinmaya Mishra</h3>
                    <p className="text-sm font-medium mt-0.5 text-[#5e17ea]">Founder &amp; CEO — DSeT Consulting Private Limited</p>
                  </div>

                  <div className="mt-4 space-y-3 text-[#374151] text-sm leading-relaxed">
                    <p>
                      DSeT was founded on a single conviction — that the world&apos;s most operationally complex industries
                      deserve AI platforms built specifically for them, not adapted from generic tools.
                    </p>
                    <p>
                      With deep experience in industrial operations, enterprise technology, and AI platform architecture,
                      our founder leads DSeT&apos;s mission to build proprietary vertical AI platforms for mining, industrial OT,
                      healthcare, and secure enterprise environments.
                    </p>
                    <p>
                      DSeT is a Microsoft ISV Partner, DPIIT-recognised startup, and STPI-registered company — with platforms
                      actively deployed across regulated, edge, and hybrid environments in India.
                    </p>
                  </div>

                  {/* Highlights */}
                  <div className="mt-6 flex flex-wrap gap-2">
                    {[
                      'Microsoft ISV Partner',
                      'DPIIT Recognised Startup',
                      'STPI Registered',
                      'Vertical AI Specialist',
                    ].map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full text-xs font-semibold border"
                        style={{ color: '#5e17ea', borderColor: 'rgba(94,23,234,0.25)', background: 'rgba(94,23,234,0.06)' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
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
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(94,23,234,0.10) 0%, transparent 70%)' }} />
          <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(90deg, #5e17ea, #1e90ff)' }} />
          <div className="relative z-10">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4" style={{ letterSpacing: '-0.04em' }}>
              Ready to See a Platform<br />
              <span className="text-[#1e90ff]">Working on Your Data?</span>
            </h2>
            <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              Book a 30-minute strategic demo. We&apos;ll map your operational environment to the right DSeT
              platform and show you outcomes on your own data — not a generic slideshow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/contact?type=demo"
                  className="inline-flex items-center gap-2 px-8 py-4 text-white font-semibold rounded-xl shadow-lg text-base"
                  style={{ background: 'linear-gradient(135deg, #5e17ea, #1e90ff)' }}
                >
                  Book a Strategic Demo <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/product"
                  className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl text-base hover:bg-white/10 transition-colors duration-200"
                >
                  Explore All Platforms
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </Section>
    </Layout>
  );
}
