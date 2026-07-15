import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import Section from '@/components/ui/Section';
import { ArrowRight, CheckCircle, Zap, Shield, Activity, Cpu, Database, TrendingUp, Cloud, Server, Monitor, Lock, BarChart2, Target, Users } from 'lucide-react';

// ─── Icon map (string key → JSX, resolved at render time) ────
const iconMap: Record<string, React.ReactNode> = {
  Database:    <Database className="w-5 h-5" />,
  Zap:         <Zap className="w-5 h-5" />,
  CheckCircle: <CheckCircle className="w-5 h-5" />,
  Activity:    <Activity className="w-5 h-5" />,
  BarChart2:   <BarChart2 className="w-5 h-5" />,
  TrendingUp:  <TrendingUp className="w-5 h-5" />,
  Cpu:         <Cpu className="w-5 h-5" />,
  Monitor:     <Monitor className="w-5 h-5" />,
  Shield:      <Shield className="w-5 h-5" />,
  Lock:        <Lock className="w-5 h-5" />,
  Cloud:       <Cloud className="w-5 h-5" />,
  Server:      <Server className="w-5 h-5" />,
  Target:      <Target className="w-5 h-5" />,
  Users:       <Users className="w-5 h-5" />,
};

// ─── Types ────────────────────────────────────────────────────
interface Feature    { icon: string; name: string; desc: string }
interface DeployMode { icon: string; label: string; desc: string }
interface Metric     { value: string; label: string; context: string }
interface Buyer      { role: string; company: string; trigger: string }
interface Vertical   { name: string; icon: string; bullets: string[] }

interface PlatformData {
  slug:         string;
  name:         string;
  tagline:      string;
  industry:     string;
  color:        string;
  status:       string;
  problem:      string;
  narrative:    { challenge: string; approach: string; outcome: string };
  features:     Feature[];
  metrics:      Metric[];
  buyers:       Buyer[];
  deployModes:  DeployMode[];
  integrations: string[];
  verticals?:   Vertical[];
  externalHref?: string;
}

// ─── All platform data (plain JSON — no JSX) ─────────────────
const platforms: PlatformData[] = [
  {
    slug:     'orebill-ai',
    name:     'OreBill AI™',
    tagline:  'Dispatch to Invoice. Automated.',
    industry: 'Mining & Mineral Logistics',
    color:    '#ff851b',
    status:   'Pilot',
    problem:  'Mining and mineral trading companies lose 3–5 days per billing cycle to manual reconciliation — matching weighbridge data, grade reports, and dispatch records by hand. Revenue leakage from undetected discrepancies goes unnoticed until audits. OreBill AI eliminates this entirely.',
    narrative: {
      challenge: 'Manual ore billing creates reconciliation delays of 3–5 days per cycle. Grade disputes between pit-to-plant and third-party weighbridge data cause invoice rejections, delayed payments, and revenue leakage that only surfaces during quarterly audits.',
      approach:  'OreBill AI captures dispatch data automatically from weighbridges and RFID systems, enriches it with HSN codes and pricing rules, and generates GST-compliant invoices end-to-end — with real-time grade reconciliation across all data sources.',
      outcome:   '60% reduction in billing cycle time, near-zero manual reconciliation, and real-time revenue visibility from dispatch to payment — replacing 3 FTEs worth of manual billing work per site.',
    },
    features: [
      { icon: 'Database',    name: 'Dispatch Data Capture',       desc: 'Auto-extracts data from weighbridges, RFID tags, and dispatch slips — no manual entry.' },
      { icon: 'Zap',         name: 'Smart Pricing Engine',         desc: 'Enriches dispatch records with HSN codes, grade-based pricing, and contractual terms.' },
      { icon: 'CheckCircle', name: 'Automated Invoice Generation', desc: 'Generates GST-compliant, e-waybill-integrated invoices in seconds, not days.' },
      { icon: 'Activity',    name: 'Grade Reconciliation AI',      desc: 'Cross-validates pit-to-plant, third-party lab, and buyer grade data in real time.' },
      { icon: 'BarChart2',   name: 'Revenue Leakage Detection',    desc: 'Flags discrepancies between dispatch, invoice, and payment records automatically.' },
      { icon: 'TrendingUp',  name: 'End-to-End RevOps Visibility', desc: 'Live dashboard from dispatch to cash collection — across multiple sites and buyers.' },
    ],
    metrics: [
      { value: '60%',   label: 'Reduction in billing cycle time',         context: 'From 3–5 days to under 24 hours per cycle' },
      { value: '~0',    label: 'Manual reconciliation errors',             context: 'Automated cross-validation across all data sources' },
      { value: '3 FTE', label: 'Billing staff hours saved per site/month', context: 'Redeploy finance team to higher-value work' },
    ],
    buyers: [
      { role: 'Head of Finance / CFO',            company: 'Mining or mineral trading company', trigger: 'Reconciliation delays, revenue leakage, audit findings' },
      { role: 'VP Operations',                    company: 'Multi-site mining operator',        trigger: 'Dispatch-to-invoice cycle too slow, manual errors' },
      { role: 'IT / Digital Transformation Lead', company: 'Mining conglomerate',              trigger: 'ERP integration, legacy billing system replacement' },
    ],
    deployModes: [
      { icon: 'Cloud',   label: 'Cloud',      desc: 'SaaS deployment on Azure / GCP with multi-tenant isolation' },
      { icon: 'Server',  label: 'On-Premise', desc: 'Deploy within your data centre for full data sovereignty' },
      { icon: 'Monitor', label: 'Hybrid',     desc: 'Edge data capture on-site, AI inference in cloud' },
    ],
    integrations: ['SAP', 'Oracle ERP', 'Tally', 'Azure', 'Google Cloud', 'Weighbridge Systems', 'GST Portal', 'e-Waybill API'],
  },
  {
    slug:        'edgebay-intelligence',
    name:        'EdgeBay IntelliFence',
    tagline:     'Real-time OT-IT edge intelligence for mining, manufacturing, and utilities.',
    industry:    'Industrial & Manufacturing / OT',
    color:       '#1e90ff',
    status:      'Live',
    externalHref:'https://dsetconsulting.com/edgebay-intellifence',
    problem:     'Industrial operations generate vast streams of OT data from SCADA systems, PLCs, safety sensors, and cameras — but this data never reaches decision-makers in time. OT and IT remain siloed, safety hazards go undetected, and maintenance stays reactive. EdgeBay IntelliFence fuses sensor, control, and IT telemetry at the edge for predictive safety, compliance, and uptime — across mining, manufacturing, and utilities.',
    narrative: {
      challenge: 'EdgeBay IntelliFence fuses industrial control systems, safety sensors, and video streams with IT data lakes to deliver continuous edge intelligence for operators and command centres — closing the OT-IT gap without requiring cloud round-trips.',
      approach:  'The platform detects hazards, worker exposure, and equipment anomalies in real time, orchestrating automated alerts, escalation workflows, and compliance reporting — even in low-connectivity and air-gapped environments.',
      outcome:   'Designed for the harshest industrial environments, IntelliFence maintains full analytics continuity offline and synchronises with cloud when available — keeping plant managers, safety officers, and command centres aligned at all times.',
    },
    features: [
      { icon: 'Cpu',      name: 'Industrial Edge AI Engine',       desc: 'Optimised inference pipelines leveraging Intel OpenVINO and NVIDIA CUDA for millisecond-level responses across harsh industrial edge deployments.' },
      { icon: 'Activity', name: 'Sensor + Camera Fusion',          desc: 'Correlates SCADA signals, PLC telemetry, LiDAR, thermal feeds, and machine vision streams for deep contextual operational intelligence.' },
      { icon: 'Zap',      name: 'Predictive Maintenance',          desc: 'Monitors asset vibration, torque, temperature, and utilisation patterns to forecast equipment failures before they impact uptime.' },
      { icon: 'Shield',   name: 'Worker Safety & Awareness',       desc: 'Tracks worker zones, PPE compliance, and critical safety thresholds with automated escalation to supervisors and safety command centres.' },
      { icon: 'Server',   name: 'Hardened Edge Analytics',         desc: 'Hardens advanced analytics for mission-critical OT networks — delivering actionable intelligence without compromising network security or sovereignty.' },
      { icon: 'Database', name: 'OT-IT Data Fusion',               desc: 'Bridges SCADA, PLC, MES, and IT data lakes into a unified operational picture for plant managers and enterprise dashboards simultaneously.' },
    ],
    metrics: [
      { value: '<10ms', label: 'Edge inference latency',                  context: 'AI decisions at the edge — no cloud round-trip required' },
      { value: '40%',   label: 'Reduction in unplanned downtime',         context: 'Predictive maintenance alerts replace reactive repair cycles' },
      { value: '3×',    label: 'Faster hazard detection vs. SCADA-only',  context: 'Sensor fusion detects what threshold-based systems miss' },
    ],
    buyers: [
      { role: 'Head of Operations / Plant Manager', company: 'Mining or manufacturing site',      trigger: 'Safety incidents, unplanned downtime, manual hazard monitoring' },
      { role: 'OT / Automation Engineer',           company: 'Process plant or utility operator', trigger: 'OT-IT integration, SCADA data not reaching command centres' },
      { role: 'Chief Safety Officer / HSSE Lead',   company: 'Mining, manufacturing, or utility', trigger: 'PPE compliance, worker zone safety, regulatory reporting' },
    ],
    deployModes: [
      { icon: 'Cpu',    label: 'Edge (Air-gapped)', desc: 'Full inference on local gateways — works offline with zero cloud dependency' },
      { icon: 'Monitor',label: 'Hybrid',            desc: 'Edge inference on-site with cloud aggregation for multi-site command visibility' },
      { icon: 'Server', label: 'On-Premise Server', desc: 'Deploy within plant network — no external connectivity required for analytics' },
    ],
    integrations: ['Siemens SCADA', 'Rockwell Automation', 'Schneider Electric', 'OPC-UA', 'MQTT', 'Azure IoT Hub', 'Intel OpenVINO', 'NVIDIA CUDA', 'Ignition SCADA', 'SAP PM'],
    verticals: [
      {
        name:    'Mining',
        icon:    'Target',
        bullets: [
          'Hazard zone detection & geofencing',
          'Haul truck & vehicle proximity intelligence',
          'Conveyor health monitoring & predictive shutdowns',
        ],
      },
      {
        name:    'Manufacturing',
        icon:    'Cpu',
        bullets: [
          'Predictive breakdown alerts for critical assets',
          'Worker safety assurance & PPE analytics',
          'Quality deviation detection on production lines',
        ],
      },
      {
        name:    'Utilities',
        icon:    'Zap',
        bullets: [
          'Grid substation heat & arc detection',
          'Plant monitoring for emissions & compliance',
          'Incident detection across distributed assets',
        ],
      },
    ],
  },
  {
    slug:        'securecloud',
    name:        'SecureCloud',
    tagline:     'Compliance-First Cloud Security Intelligence.',
    industry:    'Secure Enterprise / BFSI',
    color:       '#5e17ea',
    status:      'Live',
    externalHref:'https://dsetconsulting.com/securecloud',
    problem:     'Cloud adoption in regulated industries is stalled by compliance complexity. Security tools flag violations but provide no remediation pathway. Teams spend weeks preparing for audits manually. SecureCloud automates posture management, remediation, and audit reporting end-to-end.',
    narrative: {
      challenge: 'PCI-DSS, data sovereignty, and audit obligations make cloud adoption painful for regulated enterprises. Security tools generate alerts without context or remediation guidance. Critical misconfigurations go unresolved for weeks.',
      approach:  'SecureCloud continuously scans multi-cloud infrastructure against PCI-DSS, ISO 27001, HIPAA, and RBI guidelines — auto-remediating low-risk misconfigurations and generating board-ready audit reports without manual intervention.',
      outcome:   '84% reduction in critical cloud misconfigurations, audit preparation cut from weeks to hours, and a continuous compliance posture that satisfies both security teams and external auditors.',
    },
    features: [
      { icon: 'Shield',   name: 'Continuous Posture Management', desc: 'Real-time scanning against PCI-DSS, ISO 27001, RBI, and custom frameworks.' },
      { icon: 'Zap',      name: 'Auto-Remediation Engine',       desc: 'Automatically fixes low-risk misconfigurations — IAM policies, encryption gaps, open ports.' },
      { icon: 'Lock',     name: 'Layered Access Architecture Audit', desc: 'Validates network segmentation, access controls, and identity policies.' },
      { icon: 'BarChart2',name: 'Audit-Ready Reporting',         desc: 'Generates compliance evidence reports in the exact format auditors require.' },
      { icon: 'Activity', name: 'Real-Time Threat Detection',    desc: 'AI correlates cloud logs, network traffic, and config changes to flag threats.' },
      { icon: 'Cloud',    name: 'Multi-Cloud Coverage',          desc: 'Single pane of glass across AWS, Azure, and GCP with unified compliance scoring.' },
    ],
    metrics: [
      { value: '84%', label: 'Reduction in critical misconfigurations', context: 'Measured across pilot deployments in regulated enterprises' },
      { value: '90%', label: 'Faster audit preparation',               context: 'From weeks of manual evidence collection to hours' },
      { value: '24/7',label: 'Continuous compliance monitoring',       context: 'Always audit-ready — no more point-in-time snapshots' },
    ],
    buyers: [
      { role: 'CISO / Head of Information Security', company: 'Bank, NBFC, or insurance company',   trigger: 'Audit findings, compliance failures, cloud security gaps' },
      { role: 'Cloud Architect / DevSecOps Lead',    company: 'Regulated enterprise on multi-cloud', trigger: 'Misconfiguration incidents, manual compliance overhead' },
      { role: 'CTO / VP Technology',                 company: 'BFSI or government enterprise',      trigger: 'RBI / SEBI cloud guidelines, data sovereignty mandates' },
    ],
    deployModes: [
      { icon: 'Cloud',   label: 'Cloud (SaaS)', desc: 'Connect via read-only API — no agents, no data egress' },
      { icon: 'Server',  label: 'On-Premise',   desc: 'Deploy scanner within your VPC for full data sovereignty' },
      { icon: 'Monitor', label: 'Hybrid',        desc: 'On-premise scanner with cloud-based dashboard and reporting' },
    ],
    integrations: ['AWS', 'Azure', 'Google Cloud', 'Jira', 'ServiceNow', 'Splunk', 'Azure Sentinel', 'PagerDuty'],
  },
  {
    slug:        'ipas-revops',
    name:        'iPaS-RevOps',
    tagline:     'Revenue Operations Intelligence at Scale.',
    industry:    'Enterprise / SaaS / Revenue Operations',
    color:       '#1e90ff',
    status:      'Microsoft Marketplace',
    externalHref:'https://marketplace.microsoft.com/en-us/product/saas/dsetconsultingprivatelimited1729840340804.ipas-revops-live',
    problem:     'Enterprise revenue operations are spread across disconnected CRMs, billing systems, and AR tools — creating blind spots in pipeline visibility, delayed invoicing, and revenue leakage. iPaS-RevOps unifies the entire revenue lifecycle on one AI-powered platform.',
    narrative: {
      challenge: 'Revenue teams work across disconnected CRMs, billing tools, and AR systems. Pipeline data is stale, AR follow-up is manual, and revenue forecasting is based on gut feel. Deals slip through the cracks.',
      approach:  'iPaS-RevOps integrates with your existing CRM, ERP, and billing systems — automating AR follow-up sequences, deal velocity scoring, and revenue forecasting with real-time data.',
      outcome:   'Faster pipeline-to-revenue conversion, automated AR recovery, and accurate revenue forecasting — available natively on Microsoft Marketplace for seamless enterprise procurement.',
    },
    features: [
      { icon: 'TrendingUp', name: 'Revenue Lifecycle Automation',  desc: 'Automates pipeline tracking, billing triggers, AR follow-up, and renewal management.' },
      { icon: 'BarChart2',  name: 'Real-Time Revenue Forecasting', desc: 'AI-powered forecasting with deal velocity, churn risk, and pipeline health scoring.' },
      { icon: 'Users',      name: 'AR Intelligence & Collections', desc: 'Automated AR aging analysis and personalised follow-up sequences that recover revenue.' },
      { icon: 'Target',     name: 'Deal Intelligence',             desc: 'Scores every opportunity by close probability, deal velocity, and risk signals.' },
      { icon: 'Database',   name: 'CRM & ERP Unification',         desc: 'Connects Salesforce, HubSpot, SAP, and Microsoft Dynamics into one revenue view.' },
      { icon: 'Zap',        name: 'Microsoft Ecosystem Native',    desc: 'Built for Azure — available on Microsoft Marketplace for enterprise procurement.' },
    ],
    metrics: [
      { value: '35%', label: 'Improvement in AR recovery rate',           context: 'Automated follow-up sequences replace manual collections' },
      { value: '2×',  label: 'Faster pipeline-to-revenue conversion',     context: 'Deal intelligence and automation reduce cycle time' },
      { value: '95%', label: 'Forecast accuracy vs. traditional methods',  context: 'AI forecasting vs. spreadsheet-based projections' },
    ],
    buyers: [
      { role: 'Chief Revenue Officer / VP Sales', company: 'B2B SaaS or enterprise software company', trigger: 'Revenue leakage, AR gaps, inaccurate forecasting' },
      { role: 'Head of Finance / CFO',            company: 'Mid-to-large enterprise',                 trigger: 'AR aging issues, billing delays, revenue visibility' },
      { role: 'Revenue Operations Manager',       company: 'Sales-led or product-led growth company', trigger: 'Disconnected tools, manual RevOps processes' },
    ],
    deployModes: [
      { icon: 'Cloud',   label: 'Microsoft Marketplace', desc: 'One-click procurement via Azure Marketplace — enterprise billing integrated' },
      { icon: 'Monitor', label: 'Cloud (SaaS)',           desc: 'Direct SaaS deployment with SSO and enterprise security controls' },
      { icon: 'Server',  label: 'On-Premise',             desc: 'Deploy within your infrastructure for data sovereignty requirements' },
    ],
    integrations: ['Salesforce', 'HubSpot', 'Microsoft Dynamics', 'SAP', 'Oracle', 'Zoho CRM', 'Azure', 'QuickBooks'],
  },
  {
    slug:        'medicsiq',
    name:        'MedicsiQ',
    tagline:     'Clinical Intelligence. Compliance Automated.',
    industry:    'Healthcare & Pharma',
    color:       '#ff851b',
    status:      'Live',
    externalHref:'https://dsetconsulting.com/medicsiq',
    problem:     'Hospitals and pharma companies drown in fragmented patient data, manual compliance reporting, and regulatory overhead — consuming the bandwidth of clinical staff who should be focused on patient outcomes. MedicsiQ brings AI-powered intelligence to clinical operations while keeping compliance automated.',
    narrative: {
      challenge: 'Patient data is fragmented across EMR systems, lab platforms, and insurance portals. HIPAA, CDSCO, and NABH compliance creates manual reporting overhead. Clinical staff spend hours on documentation that should take minutes.',
      approach:  'MedicsiQ unifies patient data across systems, automates compliance reporting against HIPAA, CDSCO, and NABH frameworks, and provides AI-assisted clinical decision support — deployable within hospital infrastructure for full data sovereignty.',
      outcome:   '70% faster compliance reporting, reduced clinical documentation time, and real-time patient intelligence — without sending patient data outside the hospital network.',
    },
    features: [
      { icon: 'Activity',  name: 'Clinical Workflow Automation', desc: 'Automates documentation, discharge summaries, and care pathway tracking.' },
      { icon: 'Database',  name: 'Patient Data Unification',     desc: 'Connects EMR, LIS, RIS, and insurance systems into a single patient view.' },
      { icon: 'Shield',    name: 'Regulatory Compliance AI',     desc: 'Auto-generates HIPAA, CDSCO, and NABH compliance reports on demand.' },
      { icon: 'Target',    name: 'AI Diagnostics Support',       desc: 'Flags clinical anomalies and suggests evidence-based care pathways.' },
      { icon: 'Lock',      name: 'On-Premise Data Sovereignty',  desc: 'Patient data never leaves your hospital network — full HIPAA-compliant deployment.' },
      { icon: 'BarChart2', name: 'Operations Intelligence',      desc: 'Bed utilisation, OT scheduling, and resource planning dashboards for administrators.' },
    ],
    metrics: [
      { value: '70%',  label: 'Faster compliance reporting',              context: 'HIPAA, CDSCO, NABH reports generated automatically' },
      { value: '50%',  label: 'Reduction in clinical documentation time', context: 'AI-assisted notes and auto-populated forms' },
      { value: '100%', label: 'Patient data stays on-premise',            context: 'Zero data egress — full sovereignty guaranteed' },
    ],
    buyers: [
      { role: 'Medical Director / CMO',       company: 'Hospital or healthcare system',   trigger: 'Clinical efficiency, documentation burden, care quality' },
      { role: 'Compliance / Quality Manager', company: 'Hospital or pharma company',      trigger: 'NABH accreditation, CDSCO audits, HIPAA compliance' },
      { role: 'CTO / Head of Hospital IT',    company: 'Multi-specialty hospital or HMO', trigger: 'EMR integration, data sovereignty, digital health roadmap' },
    ],
    deployModes: [
      { icon: 'Server',  label: 'On-Premise',    desc: 'Full deployment within hospital network — no patient data leaves' },
      { icon: 'Cloud',   label: 'Private Cloud', desc: 'Dedicated single-tenant cloud environment with HIPAA-grade controls' },
      { icon: 'Monitor', label: 'Hybrid',         desc: 'Clinical data on-premise, analytics and dashboards in private cloud' },
    ],
    integrations: ['HL7 / FHIR', 'Epic EMR', 'Cerner', 'Meditech', 'HMIS', 'Lab Information Systems', 'Insurance APIs', 'ABDM (Ayushman Bharat)'],
  },
];

// ─── Animations ───────────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
};
const stagger = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const statusStyle: Record<string, string> = {
  'Live':                  'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'Pilot':                 'bg-[#ff851b]/15 text-[#ff851b] border-[#ff851b]/30',
  'Microsoft Marketplace': 'bg-[#1e90ff]/15 text-[#1e90ff] border-[#1e90ff]/30',
  'Roadmap':               'bg-white/10 text-white/60 border-white/20',
};

// ─── Page Component ───────────────────────────────────────────
export default function PlatformPage({ platform }: { platform: PlatformData | undefined }) {
  if (!platform) return null;
  const { color } = platform;

  return (
    <Layout
      title={`${platform.name} | DSeT — Vertical AI Platform for ${platform.industry}`}
      description={platform.problem.slice(0, 155)}
    >

      {/* ── Hero ── */}
      <Section bgColor="light" spacing="xl">
        <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-gradient-to-br from-[#001f3f] via-[#002b57] to-[#001f3f]">
          {/* Grid overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%231e90ff%22%20stroke-width%3D%220.5%22%20stroke-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M0%2030h60M30%200v60%22/%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
          {/* Side glows */}
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#5e17ea]/20 to-transparent" />
          <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gradient-to-r to-transparent"
            style={{ backgroundImage: `linear-gradient(to right, ${color}22, transparent)` }} />

          <motion.div
            className="relative z-10 px-8 py-16 sm:px-16 sm:py-20 max-w-4xl"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          >
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-white/40 mb-6">
              <Link href="/product" className="hover:text-white/70 transition-colors">Platforms</Link>
              <span>/</span>
              <span className="text-white/60">{platform.name}</span>
            </div>

            {/* Status + industry badges */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <span className={`text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border ${statusStyle[platform.status] ?? ''}`}>
                {platform.status}
              </span>
              <span className="text-[11px] font-semibold px-3 py-1.5 rounded-full text-white/60 bg-white/[0.07] border border-white/10">
                {platform.industry}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              {platform.name}
            </h1>
            <p className="text-xl sm:text-2xl font-semibold mb-5 bg-gradient-to-r bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(135deg, ${color}, #1e90ff)` }}>
              {platform.tagline}
            </p>
            <p className="text-base text-gray-300 leading-relaxed mb-10 max-w-2xl">{platform.problem}</p>

            <div className="flex flex-wrap gap-3">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link href="/contact?type=demo"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white"
                  style={{ background: `linear-gradient(135deg, ${color} 0%, #5e17ea 100%)`, boxShadow: `0 8px 24px ${color}40` }}>
                  Book a Platform Demo <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
              <Link href="/contact?type=brief"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-white border border-white/20 hover:bg-white/10 transition-all duration-200">
                Download Solution Brief
              </Link>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ── Metrics ── */}
      <Section bgColor="white" spacing="sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {platform.metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden bg-[#fbfaf7] rounded-2xl border border-[#e8e4dc] p-7 shadow-[0_8px_32px_rgba(15,23,42,0.09)] text-center"
            >
              <div className="absolute top-0 left-0 right-0 h-[4px]"
                style={{ backgroundImage: `linear-gradient(135deg, ${color}, #5e17ea)` }} />
              <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(15,23,42,0.04)_1px,_transparent_1px)] [background-size:22px_22px] opacity-30 pointer-events-none" />
              <div className="relative z-10 mt-2">
                <p className="text-4xl font-extrabold bg-clip-text text-transparent mb-2"
                  style={{ backgroundImage: `linear-gradient(135deg, ${color}, #5e17ea)` }}>
                  {m.value}
                </p>
                <p className="text-sm font-bold text-[#001f3f] mb-1">{m.label}</p>
                <p className="text-xs text-[#9ca3af] leading-snug">{m.context}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── Narrative: Challenge → Approach → Outcome ── */}
      <Section bgColor="light" spacing="xl">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55 }}
        >
          <p className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest mb-3">How It Works</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Challenge → Approach → Outcome</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { label: 'The Challenge', text: platform.narrative.challenge, num: '01', c: '#ff851b' },
            { label: 'DSeT Approach', text: platform.narrative.approach,  num: '02', c: color },
            { label: 'The Outcome',   text: platform.narrative.outcome,   num: '03', c: '#5e17ea' },
          ].map((n, i) => (
            <motion.div
              key={n.label}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="relative bg-[#fbfaf7] rounded-[1.5rem] border border-[#e8e4dc] p-7 shadow-[0_20px_60px_rgba(15,23,42,0.09)] overflow-hidden"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(15,23,42,0.04)_1px,_transparent_1px)] [background-size:22px_22px] opacity-40 pointer-events-none" />
              <div className="relative z-10">
                <div className="h-[4px] w-12 rounded-full mb-6" style={{ backgroundColor: n.c }} />
                <p className="text-[2.5rem] font-extrabold leading-none mb-3 select-none" style={{ color: n.c + '33' }}>{n.num}</p>
                <p className="text-[0.65rem] font-bold text-[#9ca3af] uppercase tracking-widest mb-2">{n.label}</p>
                <p className="text-sm text-[#374151] leading-relaxed">{n.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── Features ── */}
      <Section bgColor="white" spacing="xl">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55 }}
        >
          <p className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest mb-3">Capabilities</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">What {platform.name} Does</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {platform.features.map((f, i) => (
            <motion.div
              key={f.name}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="relative overflow-hidden bg-[#fbfaf7] rounded-[1.5rem] border border-[#e8e4dc] shadow-[0_20px_60px_rgba(15,23,42,0.09)]"
            >
              {/* Top color bar */}
              <div className="h-[5px] w-full" style={{ backgroundColor: color }} />
              {/* Dot grid */}
              <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(15,23,42,0.04)_1px,_transparent_1px)] [background-size:22px_22px] opacity-30 pointer-events-none" />
              <div className="relative z-10 p-6">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg"
                  style={{ backgroundColor: color }}>
                  {iconMap[f.icon]}
                </div>
                <h3 className="text-sm font-bold text-[#001f3f] mb-2">{f.name}</h3>
                <p className="text-xs text-[#5a6a7a] leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── Industry Applications (shown only when verticals data exists) ── */}
      {platform.verticals && platform.verticals.length > 0 && (
        <Section bgColor="light" spacing="xl">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            <p className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest mb-3">Industry Applications</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Purpose-built for{' '}
              <span className="bg-gradient-to-r from-[#ff851b] to-[#1e90ff] bg-clip-text text-transparent">
                Mission-Critical Operations
              </span>
            </h2>
            <p className="text-gray-400 mt-3 max-w-2xl mx-auto text-base">
              IntelliFence adapts to the unique operational risks of each industry — delivering precision analytics from the pit to the plant.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {platform.verticals.map((v, i) => {
              const vColors = ['#ff851b', '#1e90ff', '#5e17ea'];
              const vc = vColors[i] ?? color;
              return (
                <motion.div
                  key={v.name}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="relative overflow-hidden bg-[#fbfaf7] rounded-[1.5rem] border border-[#e8e4dc] shadow-[0_20px_60px_rgba(15,23,42,0.09)]">
                  {/* Top color bar */}
                  <div className="h-[5px] w-full" style={{ backgroundColor: vc }} />
                  {/* Dot grid */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(15,23,42,0.04)_1px,_transparent_1px)] [background-size:22px_22px] opacity-30 pointer-events-none" />
                  <div className="relative z-10 p-7">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-lg"
                        style={{ backgroundColor: vc }}>
                        {iconMap[v.icon]}
                      </div>
                      <h3 className="text-base font-bold text-[#001f3f]">{v.name}</h3>
                    </div>
                    {/* Bullets */}
                    <ul className="space-y-3">
                      {v.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-[7px]"
                            style={{ backgroundColor: vc }} />
                          <span className="text-sm text-[#374151] leading-relaxed">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Section>
      )}

      {/* ── Ideal Buyer + Deployment ── */}
      <Section bgColor="light" spacing="xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Buyers */}
          <div>
            <p className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest mb-3">Ideal Buyer</p>
            <h2 className="text-2xl font-bold text-white mb-6">Who Uses {platform.name}</h2>
            <div className="space-y-4">
              {platform.buyers.map((b) => (
                <motion.div key={b.role}
                  initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  className="relative overflow-hidden bg-[#fbfaf7] rounded-2xl border border-[#e8e4dc] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.09)]">
                  <div className="absolute left-0 top-0 bottom-0 w-[4px] rounded-l-2xl" style={{ backgroundColor: color }} />
                  <div className="flex items-start gap-3 pl-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white flex-shrink-0 mt-0.5 shadow"
                      style={{ backgroundColor: color }}>
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#001f3f]">{b.role}</p>
                      <p className="text-xs text-[#5a6a7a] mb-1">{b.company}</p>
                      <p className="text-xs text-[#9ca3af]">Trigger: {b.trigger}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Deploy modes */}
          <div>
            <p className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest mb-3">Deployment</p>
            <h2 className="text-2xl font-bold text-white mb-6">How It Deploys</h2>
            <div className="space-y-4">
              {platform.deployModes.map((d) => (
                <motion.div key={d.label}
                  initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  className="relative overflow-hidden bg-[#fbfaf7] rounded-2xl border border-[#e8e4dc] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.09)]">
                  <div className="absolute left-0 top-0 bottom-0 w-[4px] rounded-l-2xl" style={{ backgroundColor: color }} />
                  <div className="flex items-start gap-3 pl-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white flex-shrink-0 mt-0.5 shadow"
                      style={{ backgroundColor: color }}>
                      {iconMap[d.icon]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#001f3f]">{d.label}</p>
                      <p className="text-xs text-[#5a6a7a] leading-relaxed">{d.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </Section>

      {/* ── Integrations ── */}
      <Section bgColor="white" spacing="md">
        <p className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest mb-5 text-center">
          Works With
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {platform.integrations.map((intg) => (
            <span key={intg}
              className="px-4 py-2 bg-[#fbfaf7] rounded-full border border-[#e8e4dc] text-sm text-[#374151] font-medium shadow-sm hover:shadow-md transition-shadow duration-200">
              {intg}
            </span>
          ))}
        </div>
      </Section>

      {/* ── CTA ── */}
      <Section bgColor="light" spacing="lg">
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#001f3f] via-[#002b57] to-[#001f3f] px-8 py-14 sm:px-16 text-center max-w-5xl mx-auto shadow-2xl"
        >
          {/* Grid overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%231e90ff%22%20stroke-width%3D%220.5%22%20stroke-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M0%2030h60M30%200v60%22/%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#5e17ea]/20 to-transparent" />
          <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gradient-to-r to-transparent"
            style={{ backgroundImage: `linear-gradient(to right, ${color}22, transparent)` }} />

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
              Ready to deploy{' '}
              <span className="bg-clip-text text-transparent"
                style={{ backgroundImage: `linear-gradient(135deg, ${color}, #1e90ff)` }}>
                {platform.name}
              </span>?
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-xl mx-auto leading-relaxed">
              Book a strategic demo and we&apos;ll map the platform to your specific environment and data.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link href="/contact?type=demo"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-bold text-white shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${color} 0%, #5e17ea 100%)`, boxShadow: `0 8px 28px ${color}40` }}>
                  Book a Demo <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link href="/product"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-semibold text-white border border-white/20 hover:bg-white/10 transition-all duration-300">
                  View All Platforms <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </Section>

    </Layout>
  );
}

// ─── Static Generation ────────────────────────────────────────
// dedicated product pages are excluded from the dynamic route
const DEDICATED_SLUGS = ['medicsiq', 'securecloud', 'edgebay-intelligence', 'ipas-revops', 'orebill-ai'];

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: platforms
    .filter((p) => !DEDICATED_SLUGS.includes(p.slug))
    .map((p) => ({ params: { slug: p.slug } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const platform = platforms.find((p) => p.slug === params?.slug);
  if (!platform) return { notFound: true };
  return { props: { platform } };
};
