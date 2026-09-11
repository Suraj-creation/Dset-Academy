import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import Section from '@/components/ui/Section';
import { productPageFont } from '@/lib/productPageTypography';
import { CheckCircle, Shield, Lock, Server, AlertCircle, Eye, ArrowRight, Cpu, Activity, Database } from 'lucide-react';

const COLOR = '#5e17ea'; // violet for SecureCloud™
const COLOR_ALT = '#1e90ff'; // sky blue accent

const capabilities = [
  {
    icon: <Lock className="w-5 h-5" />,
    title: 'Identity-First Access Control',
    desc: 'Policy-based access management with identity federation, device posture checks, and continuous session verification across all workloads.',
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: 'Continuous Compliance Monitoring',
    desc: 'Real-time posture scoring designed for regulated cloud environments — with auto-remediation workflows and structured evidence generation.',
  },
  {
    icon: <Eye className="w-5 h-5" />,
    title: 'Threat Detection & Response',
    desc: 'AI-driven anomaly detection across cloud logs, API traffic, and identity events. Alert triage with contextualised risk scoring.',
  },
  {
    icon: <Server className="w-5 h-5" />,
    title: 'Data Residency Controls',
    desc: 'Data classification and residency enforcement — ensuring sensitive workloads never leave defined geographic or jurisdictional boundaries.',
  },
  {
    icon: <Database className="w-5 h-5" />,
    title: 'Infrastructure as Code Security',
    desc: 'Shift-left security scanning for Terraform, CloudFormation, and Pulumi templates — catching misconfigurations before they reach production.',
  },
  {
    icon: <Activity className="w-5 h-5" />,
    title: 'Audit Trail & Evidence Automation',
    desc: 'Automated evidence collection for compliance audits. Cuts audit preparation time from weeks to days with structured report generation.',
  },
  {
    icon: <AlertCircle className="w-5 h-5" />,
    title: 'Supply Chain Security',
    desc: 'Container image scanning, SBOM generation, and dependency vulnerability management integrated into CI/CD pipelines.',
  },
  {
    icon: <Cpu className="w-5 h-5" />,
    title: 'Secrets & Key Management',
    desc: 'Centralised secrets vault with rotation policies, HSM integration, and access audit logging — deployable on GovCloud or private infrastructure.',
  },
];

const architectureItems = [
  {
    num: '01',
    title: 'Policy Engine',
    desc: 'Centralised policy-as-code layer that governs access, data handling, and compliance rules across all connected environments.',
  },
  {
    num: '02',
    title: 'Observability Fabric',
    desc: 'Unified log, metric, and trace aggregation from cloud APIs, identity providers, and application layers into a single security data lake.',
  },
  {
    num: '03',
    title: 'AI Risk Scoring',
    desc: 'ML models trained on government and enterprise cloud threat patterns to surface and prioritise real risks from signal noise.',
  },
  {
    num: '04',
    title: 'Remediation Automation',
    desc: 'Pre-approved playbooks that auto-resolve low-risk findings; high-risk alerts routed to human review with full context packages.',
  },
  {
    num: '05',
    title: 'Compliance Dashboard',
    desc: 'Real-time posture view mapped to selected frameworks. Exportable evidence bundles for compliance audit preparation.',
  },
];

const industries = [
  { icon: '🏛️', name: 'Public Sector', color: COLOR },
  { icon: '⚖️', name: 'Government & Defence', color: '#1e90ff' },
  { icon: '⚡', name: 'Energy & Utilities', color: '#f59e0b' },
  { icon: '🏗️', name: 'Smart Cities', color: '#22c55e' },
  { icon: '🏥', name: 'Healthcare & Pharma', color: '#ec4899' },
  { icon: '🏦', name: 'BFSI & Fintech', color: '#6366f1' },
];

const complianceBadges = [
  { label: 'Layered Access Architecture', sub: 'Identity federation, device posture, session verification', icon: <Lock className="w-5 h-5" /> },
  { label: 'India-Ready Compliance', sub: 'Designed for India regulatory reporting workflows', icon: <Shield className="w-5 h-5" /> },
  { label: 'Regulatory Readiness', sub: 'Designed for government cloud policy requirements', icon: <CheckCircle className="w-5 h-5" /> },
  { label: 'NIST CSF', sub: 'Identify, Protect, Detect, Respond, Recover', icon: <Activity className="w-5 h-5" /> },
  { label: 'CSA CCM', sub: 'Cloud Security Alliance controls mapped', icon: <Server className="w-5 h-5" /> },
];

const metrics = [
  { value: '84%', label: 'Misconfiguration Reduction', sub: 'Within 60 days of deployment' },
  { value: '70%', label: 'Audit Prep Time Cut', sub: 'From 6 weeks to 10 days' },
  { value: '<24h', label: 'Threat Response Time', sub: 'For critical cloud incidents' },
  { value: '100%', label: 'Data Residency Control', sub: 'Workload residency enforcement' },
];

export default function SecureCloudPage() {
  return (
    <Layout
      title="SecureCloud™ — Compliance-Aware Cloud Security | DSeT"
      description="SecureCloud™ is DSeT's compliance-aware cloud security platform — continuous posture monitoring, layered access controls, and AI-driven threat detection built for regulated enterprises and India-ready deployments."
      ogImage="/dset-logo-orb.png"
      jsonLd={{
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'SecureCloud™',
        applicationCategory: 'SecurityApplication',
        operatingSystem: 'Cloud, On-Premise, Air-Gapped',
        description: 'Compliance-aware cloud security platform — continuous posture monitoring, layered access controls, and AI-driven threat detection for regulated enterprises and India-ready deployments.',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
        provider: { '@type': 'Organization', name: 'DSeT Consulting', url: 'https://dsetconsulting.com' },
        url: 'https://dsetconsulting.com/product/securecloud',
        keywords: 'compliance-aware cloud security India, DevSecOps platform India, regulated cloud security platform, AI threat detection India, India-ready cloud security, enterprise cloud compliance',
      }}
      breadcrumbs={[
        { name: 'Home', href: '/' },
        { name: 'Platforms', href: '/product' },
        { name: 'SecureCloud™', href: '/product/securecloud' },
      ]}
    >
      <div className={`${productPageFont.variable} product-page-shell`}>

      {/* ── Hero ── */}
      <Section bgColor="light" spacing="xl">
        <div className="relative bg-gradient-to-br from-[#0a0118] via-[#1a0540] to-[#001f3f] rounded-3xl shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%225e17ea%22%20stroke-width%3D%220.5%22%20stroke-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M0%2030h60M30%200v60%22/%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#5e17ea]/15 to-transparent" />
          <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-r from-[#1e90ff]/10 to-transparent" />

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
                style={{ background: 'linear-gradient(90deg, #5e17ea, #1e90ff)' }}
              >
                Compliance-Aware DevSecOps Suite
              </span>
              <h1 className="product-page-display mb-5 text-white">
                SecureCloud™
              </h1>
              <p className="text-xl text-gray-300 mb-4 leading-relaxed font-light">
                Digital sovereignty and compliance — by design, not retrofit.
              </p>
              <p className="text-base text-gray-400 mb-8 leading-relaxed max-w-lg">
                SecureCloud™ is DSeT&apos;s compliance-aware cloud security platform — built for
                regulated enterprises and critical infrastructure operators who require strong
                posture monitoring, data residency controls, and deployment flexibility.
              </p>
              <ul className="space-y-3 mb-10">
                {[
                  'Layered access architecture with continuous posture monitoring',
                  'Compliance-aware posture automation for regulated cloud environments',
                  'Deployable on private cloud, private data centres, or hybrid environments',
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
                    href="/contact?type=govt-briefing&product=securecloud"
                    className="inline-flex items-center gap-2 px-7 py-3.5 text-white font-semibold rounded-xl shadow-lg text-sm"
                    style={{ background: 'linear-gradient(135deg, #5e17ea, #1e90ff)' }}
                  >
                    Request Govt Briefing <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/contact?type=demo&product=securecloud"
                    className="inline-flex items-center gap-2 px-7 py-3.5 border border-white/30 text-white font-semibold rounded-xl text-sm hover:bg-white/10 transition-colors duration-200"
                  >
                    Schedule Secure Demo
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
                src="/cloud.avif"
                alt="SecureCloud™ Compliance-Aware Platform"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0118]/70 via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#0a0118]/50 lg:via-transparent lg:to-transparent" />

              {/* Floating badge */}
              <motion.div
                className="absolute bottom-8 left-6 backdrop-blur-md bg-white/[0.08] border border-white/20 rounded-2xl p-4 shadow-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(94,23,234,0.2)' }}>
                    <Shield className="w-5 h-5" style={{ color: COLOR }} />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">Data Residency Controlled</p>
                    <p className="text-xs text-gray-400">Data never leaves your perimeter</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ── Sovereignty Statement Banner ── */}
      <Section bgColor="white" spacing="sm">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative text-center py-8 px-8 rounded-2xl overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(94,23,234,0.15), rgba(30,144,255,0.10))' }}
        >
          <div className="absolute inset-0 border border-white/[0.06] rounded-2xl" />
          <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: 'linear-gradient(90deg, #5e17ea, #1e90ff)' }} />
          <p className="relative z-10 text-xl sm:text-2xl font-bold text-white max-w-3xl mx-auto leading-relaxed">
            &ldquo;Compliance-aware deployment is not optional for regulated operators —
            it&rsquo;s a <span style={{ color: COLOR }}>design baseline.</span>
            SecureCloud™ is built from that premise.&rdquo;
          </p>
          <p className="relative z-10 text-gray-500 text-sm mt-3">DSeT Platform Engineering</p>
        </motion.div>
      </Section>

      {/* ── Metrics Bar ── */}
      <Section bgColor="light" spacing="md">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center py-6 px-4 rounded-2xl border border-white/[0.06]"
              style={{ background: 'rgba(94,23,234,0.06)' }}
            >
              <p className="text-4xl font-bold mb-1" style={{ color: COLOR }}>{s.value}</p>
              <p className="text-white font-semibold text-sm mb-1">{s.label}</p>
              <p className="text-gray-500 text-xs">{s.sub}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── Core Capabilities — Asymmetric 2-Col List ── */}
      <Section bgColor="white" spacing="xl">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 text-xs font-bold text-white rounded-full mb-4 uppercase tracking-wider" style={{ background: COLOR }}>
              Core Capabilities
            </span>
            <h2 className="product-page-section-heading text-white">
              Eight Pillars of<br />
              <span style={{ color: COLOR }}>Compliance-Aware Cloud Security</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {capabilities.map((cap, i) => (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="flex gap-5 p-6 rounded-2xl border border-white/[0.06] hover:border-white/10 transition-colors duration-200"
                style={{ background: 'rgba(94,23,234,0.04)' }}
              >
                <div
                  className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-lg"
                  style={{ background: 'rgba(94,23,234,0.2)', color: COLOR }}
                >
                  {cap.icon}
                </div>
                <div>
                  <h3 className="text-white font-bold text-base mb-1.5">{cap.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{cap.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Architecture Overview ── */}
      <Section bgColor="light" spacing="xl">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 text-xs font-bold text-white rounded-full mb-4 uppercase tracking-wider" style={{ background: COLOR_ALT }}>
              Architecture
            </span>
            <h2 className="product-page-section-heading text-white">
              Five-Layer Security Architecture<br />
              <span style={{ color: COLOR_ALT }}>Purpose-Built for Regulated Environments</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: architecture steps */}
            <div className="space-y-6">
              {architectureItems.map((item, i) => (
                <motion.div
                  key={item.num}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex gap-5"
                >
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm text-white shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${COLOR}, ${COLOR_ALT})` }}
                  >
                    {item.num}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base mb-1">{item.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Right: visual */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative h-80 sm:h-96 rounded-3xl overflow-hidden shadow-2xl"
            >
              <Image
                src="/cloud.avif"
                alt="SecureCloud™ Architecture"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0118]/80 via-[#0a0118]/30 to-transparent" />

              {/* Floating overlay pills */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 gap-2">
                {['Policy Engine Active', 'Access Controls Active', 'Security Posture: 98.4%'].map((label, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + i * 0.15 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white backdrop-blur-sm w-fit border border-white/10"
                    style={{ background: i === 0 ? 'rgba(94,23,234,0.4)' : i === 1 ? 'rgba(30,144,255,0.3)' : 'rgba(34,197,94,0.3)' }}
                  >
                    <span className={`w-2 h-2 rounded-full ${i === 2 ? 'bg-green-400' : 'bg-white'}`} />
                    {label}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ── Industry Verticals ── */}
      <Section bgColor="white" spacing="xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 text-xs font-bold text-white rounded-full mb-4 uppercase tracking-wider" style={{ background: COLOR }}>
            Industry Coverage
          </span>
          <h2 className="product-page-section-heading text-white">
            Built for Operators Who<br />
            <span style={{ color: COLOR }}>Cannot Afford to Fail</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
          {industries.map((ind, i) => (
            <motion.div
              key={ind.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-white/[0.06] text-center cursor-default"
              style={{ background: `${ind.color}0a` }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ background: `${ind.color}18` }}
              >
                {ind.icon}
              </div>
              <p className="text-white text-xs font-semibold leading-tight">{ind.name}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── Security Framework / Compliance Badges ── */}
      <Section bgColor="light" spacing="xl">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 text-xs font-bold text-white rounded-full mb-4 uppercase tracking-wider" style={{ background: COLOR }}>
              Security Framework
            </span>
            <h2 className="product-page-section-heading text-white">
              Compliance-First Architecture
            </h2>
            <p className="text-gray-400 text-lg mt-4 max-w-2xl mx-auto">
              SecureCloud™ is mapped to the frameworks that govern cloud operations for
              government and regulated enterprises in India and globally.
            </p>
          </motion.div>

          {/* Large compliance panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
            style={{ background: 'linear-gradient(135deg, rgba(94,23,234,0.12), rgba(30,144,255,0.08))' }}
          >
            <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(90deg, #5e17ea, #1e90ff)' }} />
            <div className="relative z-10 p-8 sm:p-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {complianceBadges.map((badge, i) => (
                  <motion.div
                    key={badge.label}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-4 items-start p-5 rounded-2xl border border-white/[0.08] bg-white/[0.04]"
                  >
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(94,23,234,0.2)', color: '#a78bfa' }}
                    >
                      {badge.icon}
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm mb-1">{badge.label}</h4>
                      <p className="text-gray-500 text-xs leading-relaxed">{badge.sub}</p>
                    </div>
                  </motion.div>
                ))}
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
          style={{ background: 'linear-gradient(135deg, #0a0118, #1a0540, #001f3f)' }}
        >
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(94,23,234,0.20) 0%, transparent 70%)' }} />
          <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(90deg, #5e17ea, #1e90ff)' }} />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full text-xs font-bold text-white border border-white/20" style={{ background: 'rgba(94,23,234,0.2)' }}>
              <Lock className="w-4 h-4" />
              For Government & Critical Infrastructure Operators
            </div>
            <h2 className="product-page-section-heading mb-4 text-white">
              Partner with DSeT for<br />
              <span style={{ color: '#a78bfa' }}>Compliance-Aware Cloud Security</span>
            </h2>
            <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              SecureCloud™ is not a generic CSPM tool. It is purpose-built for India&apos;s regulatory
              environment and the operational realities of government and critical infrastructure.
              Request a classified briefing or a secure demo today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/contact?type=govt-briefing&product=securecloud"
                  className="inline-flex items-center gap-2 px-8 py-4 text-white font-semibold rounded-xl shadow-lg text-base"
                  style={{ background: 'linear-gradient(135deg, #5e17ea, #1e90ff)' }}
                >
                  Request Govt Briefing <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/contact?type=demo&product=securecloud"
                  className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl text-base hover:bg-white/10 transition-colors duration-200"
                >
                  Schedule Secure Demo
                </Link>
              </motion.div>
            </div>
            <p className="mt-6 text-sm text-white/40">
              Planning a regulated cloud deployment?{' '}
              <Link href="/dset-arc-managed-intelligence-services" className="text-[#5e17ea] hover:text-[#5e17ea]/80 underline underline-offset-2 transition-colors">
                See how DSeT ARC™ handles SecureCloud™ onboarding →
              </Link>
            </p>

          </div>
        </motion.div>
      </Section>
      </div>
    </Layout>
  );
}
