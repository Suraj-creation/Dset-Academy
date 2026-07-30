"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { ChevronDown, ArrowRight, Play, TrendingUp, Shield, Zap, Users, Award, Target, BarChart, CheckCircle, Star, Briefcase } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  industry: string;
  badge: string;
  gradient: string;
  accentColor: string;
  borderColor: string;
  tagColor: string;
  icon: string;
  features: string[];
  href: string;
  external?: boolean;
  status: "live" | "beta" | "coming-soon";
}

interface StatItem {
  value: string;
  label: string;
  icon: React.ReactNode;
}

interface TrustItem {
  name: string;
  logo?: string;
  industry: string;
}

const brandPalette = {
  sky:        { accent: "#1e90ff", tag: "#7cc4ff", border: "#1e90ff" },
  azure:      { accent: "#0ea5e9", tag: "#7dd3fc", border: "#0ea5e9" },
  royal:      { accent: "#2563eb", tag: "#93c5fd", border: "#2563eb" },
  cornflower: { accent: "#4f86f7", tag: "#a5c8ff", border: "#4f86f7" },
  cerulean:   { accent: "#0284c7", tag: "#6dc8f3", border: "#0284c7" },
};

const products: Product[] = [
  {
    id: "orebill",
    name: "OreBill AI™",
    tagline: "Dispatch to Invoice. Automated.",
    description:
      "Vertical AI SaaS for mineral trading and mining supply chains. Eliminates manual billing and compliance delays by automating the entire RevOps workflow — from dispatch capture to GST-compliant invoicing.",
    industry: "Mining & Mineral Trading",
    badge: "Featured",
    gradient:
      "linear-gradient(135deg, rgba(30,144,255,0.18) 0%, rgba(124,196,255,0.05) 100%)",
    accentColor: brandPalette.sky.accent,
    borderColor: brandPalette.sky.border,
    tagColor: brandPalette.sky.tag,
    icon: "⛏️",
    features: [
      "Dispatch data capture & auto-extraction",
      "Smart pricing & HSN code enrichment",
      "Automated invoice generation",
      "GST & e-waybill compliance",
      "End-to-end RevOps automation",
    ],
    href: "/product/orebill-ai",
    status: "live",
  },
  {
    id: "edgebay",
    name: "EdgeBay Intelligence",
    tagline: "AI at the Edge of Your Business",
    description:
      "Enterprise-grade AI intelligence platform delivering real-time decision making and predictive analytics directly to your operational edge. Built for speed, accuracy, and scale.",
    industry: "Enterprise AI",
    badge: "AI Platform",
    gradient:
      "linear-gradient(135deg, rgba(14,165,233,0.18) 0%, rgba(125,211,252,0.05) 100%)",
    accentColor: brandPalette.azure.accent,
    borderColor: brandPalette.azure.border,
    tagColor: brandPalette.azure.tag,
    icon: "🧠",
    features: [
      "Real-time AI inference engine",
      "Predictive analytics dashboards",
      "Edge-native deployment",
      "Enterprise system integrations",
    ],
    href: "/product/edgebay-intelligence",
    status: "live",
  },
  {
    id: "securecloud",
    name: "SecureCloud",
    tagline: "Cloud Security, Simplified.",
    description:
      "Compliance-aware cloud security platform protecting your infrastructure, data, and applications with AI-driven threat detection and layered access architecture.",
    industry: "Cloud Security",
    gradient:
      "linear-gradient(135deg, rgba(37,99,235,0.18) 0%, rgba(147,197,253,0.05) 100%)",
    accentColor: brandPalette.royal.accent,
    borderColor: brandPalette.royal.border,
    tagColor: brandPalette.royal.tag,
    badge: "Security",
    icon: "🔐",
    features: [
      "AI-driven threat detection",
      "Layered access architecture",
      "Automated compliance reporting",
      "Real-time infrastructure monitoring",
    ],
    href: "/product/securecloud",
    status: "live",
  },
  {
    id: "medicsiq",
    name: "MedicsiQ",
    tagline: "Intelligence for Healthcare Operations",
    description:
      "Healthcare operations intelligence platform that streamlines clinical workflows, patient data management, and compliance reporting — designed for modern care delivery.",
    industry: "Healthcare",
    badge: "HealthTech",
    gradient:
      "linear-gradient(135deg, rgba(79,134,247,0.18) 0%, rgba(165,200,255,0.05) 100%)",
    accentColor: brandPalette.cornflower.accent,
    borderColor: brandPalette.cornflower.border,
    tagColor: brandPalette.cornflower.tag,
    icon: "🏥",
    features: [
      "Clinical workflow automation",
      "Patient data intelligence",
      "Regulatory compliance reporting",
      "AI diagnostics support",
    ],
    href: "/product/medicsiq",
    status: "live",
  },
  {
    id: "ipas",
    name: "iPaS-RevOps",
    tagline: "Revenue Operations at Scale",
    description:
      "Enterprise revenue operations platform available on Microsoft Marketplace. Automates and optimizes your entire revenue lifecycle with deep Microsoft ecosystem integration.",
    industry: "Revenue Operations",
    badge: "Microsoft Marketplace",
    gradient:
      "linear-gradient(135deg, rgba(2,132,199,0.18) 0%, rgba(109,200,243,0.05) 100%)",
    accentColor: brandPalette.cerulean.accent,
    borderColor: brandPalette.cerulean.border,
    tagColor: brandPalette.cerulean.tag,
    icon: "📊",
    features: [
      "Revenue lifecycle automation",
      "Microsoft ecosystem integration",
      "Sales pipeline intelligence",
      "Advanced RevOps analytics",
    ],
    href: "/product/ipas-revops",
    status: "live",
  },
  {
    id: "voiceops",
    name: "VoiceOps",
    tagline: "AI-Powered Voice Conversations at Scale",
    description:
      "Conversational voice AI platform that automates outbound and inbound calls — payment collections, appointment scheduling, logistics coordination, and customer support — without human involvement.",
    industry: "Voice AI",
    badge: "Voice AI",
    gradient:
      "linear-gradient(135deg, rgba(6,182,212,0.18) 0%, rgba(103,232,249,0.05) 100%)",
    accentColor: "#06b6d4",
    borderColor: "#06b6d4",
    tagColor: "#67e8f9",
    icon: "🎙️",
    features: [
      "Automated payment collections calls",
      "Outbound & inbound voice AI",
      "Appointment scheduling & reminders",
      "Logistics coordination at scale",
    ],
    href: "/product/voiceops",
    status: "live",
  },
  {
    id: "pharmaai",
    name: "PharmaAI",
    tagline: "Pharma Market Intelligence, Cited.",
    description:
      "Zero-hallucination pharma intelligence platform delivering cited, source-linked answers on market share, brand performance, therapy areas, and molecule-level insights from licensed datasets.",
    industry: "Life Sciences",
    badge: "Pharma Intel",
    gradient:
      "linear-gradient(135deg, rgba(16,185,129,0.18) 0%, rgba(110,231,183,0.05) 100%)",
    accentColor: "#10b981",
    borderColor: "#10b981",
    tagColor: "#6ee7b7",
    icon: "🔬",
    features: [
      "Market share & brand performance",
      "Therapy area & molecule insights",
      "Deterministic, zero-hallucination answers",
      "Full audit trail with cited sources",
    ],
    href: "/product/pharmaai",
    status: "live",
  },
];

const stats: StatItem[] = [
  { value: "7", label: "AI Platforms", icon: <Zap className="w-5 h-5" /> },
  {
    value: "4",
    label: "Industries",
    icon: <Briefcase className="w-5 h-5" />,
  },
  {
    value: "99.9%",
    label: "Uptime SLA",
    icon: <Shield className="w-5 h-5" />,
  },
  { value: "24/7", label: "Support", icon: <Users className="w-5 h-5" /> },
];

const trustItems: TrustItem[] = [
  { name: "Microsoft", industry: "Technology" },
  { name: "Azure", industry: "Cloud" },
  { name: "Enterprise Clients", industry: "Various" },
  { name: "Fortune 500", industry: "Corporations" },
];

/* ─── Scroll Indicator ─── */
function ScrollIndicator() {
  return (
    <motion.div
      className="fixed bottom-8 right-8 z-40 hidden lg:flex flex-col items-center gap-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2, duration: 0.5 }}
    >
      <span className="text-xs text-gray-400 font-medium tracking-wider uppercase">
        Scroll
      </span>
      <motion.div
        className="w-px h-16 bg-gradient-to-b from-blue-400 to-transparent"
        animate={{ scaleY: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <ChevronDown className="w-4 h-4 text-blue-400 animate-bounce" />
    </motion.div>
  );
}

/* ─── Status Badge ─── */
function StatusBadge({ status }: { status: Product["status"] }) {
  const variants = {
    live: {
      bg: "bg-[#1e90ff]/20",
      border: "border-[#1e90ff]/40",
      text: "text-[#7cc4ff]",
      icon: "●",
    },
    beta: {
      bg: "bg-[#5e17ea]/20",
      border: "border-[#5e17ea]/40",
      text: "text-[#b18cff]",
      icon: "○",
    },
    "coming-soon": {
      bg: "bg-[#ff851b]/20",
      border: "border-[#ff851b]/40",
      text: "text-[#ffb067]",
      icon: "○",
    },
  };

  const style = variants[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${style.bg} ${style.border} ${style.text}`}
    >
      <span className="text-[8px]">{style.icon}</span>
      {status === "coming-soon"
        ? "Coming Soon"
        : status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

/* ─── Product Card ─── */
function ProductCard({
  product,
  onLearnMore,
  index,
}: {
  product: Product;
  onLearnMore: (p: Product) => void;
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{
        duration: 0.8,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative"
    >
      <div className="relative h-full rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2">
        {/* Background with gradient */}
        <div
          className="absolute inset-0 transition-all duration-500 group-hover:scale-105"
          style={{
            background: product.gradient,
            border: `1px solid ${product.borderColor}40`,
          }}
        />

        {/* Hover glow effect */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
          style={{
            background: `radial-gradient(circle at center, ${product.accentColor}15 0%, transparent 70%)`,
            filter: "blur(20px)",
          }}
        />

        {/* Top accent bar */}
        <div
          className="relative h-[3px] w-full z-10 flex-shrink-0"
          style={{ background: `linear-gradient(90deg, ${product.accentColor}, ${product.accentColor}50)` }}
        />

        <div className="relative p-5 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                style={{
                  background: `linear-gradient(135deg, ${product.accentColor}20, ${product.accentColor}10)`,
                  border: `1px solid ${product.accentColor}30`,
                }}
              >
                {product.icon}
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide"
                    style={{
                      background: `${product.accentColor}15`,
                      color: product.tagColor,
                      border: `1px solid ${product.accentColor}25`,
                    }}
                  >
                    {product.badge}
                  </span>
                  <StatusBadge status={product.status} />
                </div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                  {product.industry}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-1.5 text-white group-hover:text-white transition-colors">
              {product.name}
            </h3>
            <p className="text-xs font-medium mb-2" style={{ color: product.tagColor }}>
              {product.tagline}
            </p>
            <p className="text-xs leading-relaxed mb-4 text-gray-300">
              {product.description}
            </p>

            {/* Features */}
            <div className="mb-4">
              <p className="text-[10px] font-bold uppercase tracking-wider mb-2 text-gray-400">
                Key Features
              </p>
              <ul className="space-y-1.5">
                {product.features.slice(0, 3).map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                    <CheckCircle
                      className="w-3 h-3 mt-0.5 flex-shrink-0"
                      style={{ color: product.accentColor }}
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-auto">
            {product.status === "coming-soon" ? (
              <button
                onClick={() => onLearnMore(product)}
                className="w-full group/btn flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs transition-all duration-300 hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${product.accentColor}20, ${product.accentColor}10)`,
                  color: product.tagColor,
                  border: `1px solid ${product.accentColor}30`,
                }}
              >
                Learn More
                <ArrowRight className="w-3 h-3 transition-transform group-hover/btn:translate-x-1" />
              </button>
            ) : (
              <a
                href={product.href}
                target={product.external ? "_blank" : undefined}
                rel={product.external ? "noopener noreferrer" : undefined}
                className="w-full group/btn flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs transition-all duration-300 hover:scale-105 text-white"
                style={{
                  background: `linear-gradient(135deg, ${product.accentColor}, ${product.accentColor}dd)`,
                  border: `1px solid ${product.accentColor}80`,
                }}
              >
                {product.id === "ipas" ? "View on Marketplace" : "Explore Product"}
                <ArrowRight className="w-3 h-3 transition-transform group-hover/btn:translate-x-1" />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Stats Counter ─── */
function StatsCounter({ stat, index }: { stat: StatItem; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  // Extract numeric part (supports decimals like 99.9)
  const numericMatch = stat.value.match(/[\d.]+/);
  const target = numericMatch ? parseFloat(numericMatch[0]) : null;
  const prefix = stat.value.match(/^[^\d.]*/)?.[0] ?? "";
  const suffix = stat.value.match(/[^\d.]+$/)?.[0] ?? "";
  const isAnimatable = target !== null && !stat.value.includes("/");

  const [display, setDisplay] = useState(stat.value);

  useEffect(() => {
    if (!isInView || !isAnimatable || target === null) return;

    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = increment; // start from first increment so display never shows 0

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        // Show final value exactly as defined
        setDisplay(stat.value);
        clearInterval(timer);
      } else {
        const rounded = Number.isInteger(target)
          ? Math.max(1, Math.floor(current))
          : parseFloat(current.toFixed(1));
        setDisplay(`${prefix}${rounded}${suffix}`);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, isAnimatable, target, prefix, suffix, stat.value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="text-center group"
    >
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#ff851b]/20 via-[#1e90ff]/15 to-[#5e17ea]/20 border border-[#1e90ff]/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <div className="text-[#7cc4ff]">{stat.icon}</div>
      </div>
      <div
        className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#ff851b] via-[#1e90ff] to-[#b18cff] bg-clip-text text-transparent"
      >
        {display}
      </div>
      <p
        className="text-sm text-gray-400 font-medium"
      >
        {stat.label}
      </p>
    </motion.div>
  );
}

/* ─── Main Page ─── */
export default function ProductsPage() {
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  return (
    <Layout
      title="AI Platforms | DSeT — OreBill AI, EdgeBay Intelligence, SecureCloud, iPAS RevOps"
      description="DSeT's vertical AI platforms for mining, industrial, healthcare, and revenue operations. Purpose-built, edge-ready, compliance-first. Microsoft ISV Partner."
    >
      <div
        className="bg-[linear-gradient(135deg,#001f3f_0%,#002b57_52%,#001f3f_100%)] text-white overflow-x-hidden"
      >
        {/* ── HERO SECTION ── */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8">
          {/* Soft Radial Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#001f3f] via-[#002b57] to-[#001f3f]" />

          {/* Subtle Corner Glows */}
          <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-full blur-3xl" />

          {/* Minimal Grid Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%231e90ff%22%20stroke-width%3D%220.5%22%20stroke-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M0%2030h60M30%200v60%22/%3E%3C/g%3E%3C/svg%3E')] opacity-30" />

          <div className="relative z-10 max-w-6xl mx-auto text-center w-full">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 sm:mb-8 backdrop-blur-sm"
            >
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
              <span className="text-xs sm:text-sm font-semibold text-blue-300 tracking-wide">
                DSeT AI Suite
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight text-white px-2"
            >
              Enterprise AI
              <br />
              <span className="bg-[linear-gradient(120deg,#ff851b_0%,#1e90ff_48%,#5e17ea_100%)] bg-clip-text text-transparent">
                Reimagined
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-base sm:text-lg md:text-xl text-gray-300 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4"
            >
              Purpose-built AI platforms that transform industries. From
              automated revenue operations to intelligent healthcare systems —
              enterprise-grade solutions for the modern business.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-12 sm:mb-16 px-4"
            >
              <motion.a
                href="#products"
                className="w-full sm:w-auto group px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#5e17ea] to-[#1e90ff] text-white font-bold rounded-xl shadow-lg hover:shadow-[#5e17ea]/30 transition-all duration-300 hover:scale-105 text-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center justify-center gap-2">
                  Explore Solutions
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
                </span>
              </motion.a>

              <motion.button
                onClick={() =>
                  document
                    .getElementById("vision")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border border-white/20 text-gray-200 font-bold rounded-xl hover:bg-white/5 hover:border-white/30 transition-all duration-300 backdrop-blur-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Our Vision
              </motion.button>
            </motion.div>

            {/* Stats Preview */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 max-w-2xl mx-auto px-4"
            >
              {stats.slice(0, 4).map((stat, index) => (
                <div key={stat.label} className="text-center">
                  <div
                    className="text-xl sm:text-2xl font-bold text-blue-400 mb-1"
                  >
                    {stat.value}
                  </div>
                  <p
                    className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide"
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <ScrollIndicator />
        </section>

        {/* ── VISION SECTION ── */}
        <section
          id="vision"
          className="py-24 lg:py-32 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950" />

          <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="mb-8">
                  <span className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-sm font-semibold text-blue-400 mb-4">
                    Why DSeT AI
                  </span>
                  <h2
                    className="text-4xl lg:text-5xl font-black mb-6 leading-tight"
                  >
                    AI That
                    <br />
                    <span className="bg-gradient-to-r from-[#ff851b] to-[#1e90ff] bg-clip-text text-transparent">
                      Understands Industry
                    </span>
                  </h2>
                  <p
                    className="text-lg text-gray-300 leading-relaxed mb-8"
                  >
                    We're not just building AI tools — we're crafting
                    intelligent systems that understand the nuances of your
                    industry. Every platform is designed with deep domain
                    expertise, ensuring solutions that don't just work, but
                    transform how you operate.
                  </p>
                </div>

                {/* Key Points */}
                <div className="space-y-6">
                  {[
                    {
                      icon: <Target className="w-6 h-6" />,
                      title: "Industry-Specific Intelligence",
                      desc: "AI models trained on real industry data, not generic datasets.",
                    },
                    {
                      icon: <Shield className="w-6 h-6" />,
                      title: "Enterprise-Grade Security",
                      desc: "Bank-level security with compliance certifications.",
                    },
                    {
                      icon: <Zap className="w-6 h-6" />,
                      title: "Real-Time Performance",
                      desc: "Sub-second response times for critical business operations.",
                    },
                    {
                      icon: <Users className="w-6 h-6" />,
                      title: "Seamless Integration",
                      desc: "Works with your existing systems, no rip-and-replace required.",
                    },
                  ].map((point, index) => (
                    <motion.div
                      key={point.title}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="flex gap-4"
                    >
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                        {point.icon}
                      </div>
                      <div>
                        <h3
                          className="font-bold text-white mb-1"
                        >
                          {point.title}
                        </h3>
                        <p
                          className="text-gray-400 text-sm"
                        >
                          {point.desc}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Visual */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="relative">
                  {/* Main visual */}
                  <div className="relative w-full h-96 rounded-2xl overflow-hidden border border-[#1e90ff]/30 shadow-2xl">
                    <Image
                      src="/AI_industry.webp"
                      alt="AI Industry Intelligence"
                      fill
                      priority
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>

                  {/* Floating elements */}
                  <motion.div
                    className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br from-[#5e17ea]/30 to-[#ff851b]/30 border border-[#5e17ea]/40 flex items-center justify-center"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <TrendingUp className="w-8 h-8 text-[#b18cff]" />
                  </motion.div>

                  <motion.div
                    className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-gradient-to-br from-[#ff851b]/30 to-[#1e90ff]/30 border border-[#ff851b]/40 flex items-center justify-center"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  >
                    <Award className="w-6 h-6 text-[#ffb067]" />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── TRUST & STATS SECTION ── */}
        <section className="py-16 sm:py-20 lg:py-24 xl:py-32 relative overflow-hidden bg-[#0a1628]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* ✅ SAME HERO BLUE BACKGROUND */}
            <div
              className="bg-gradient-to-br from-[#001f3f] via-[#002b57] to-[#001f3f]
                    border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 shadow-xl"
            >
              {/* Stats Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-center mb-12 sm:mb-16 lg:mb-20"
              >
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-4 sm:mb-6 text-white">
                  Trusted by Industry Leaders
                </h2>

                <p className="text-base sm:text-lg text-gray-300 max-w-3xl mx-auto px-4">
                  Join hundreds of enterprises already transforming their
                  operations with DSeT AI
                </p>
              </motion.div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-12 sm:mb-16 lg:mb-20">
                {stats.map((stat, index) => (
                  <StatsCounter key={stat.label} stat={stat} index={index} />
                ))}
              </div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-center"
              >
                <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 lg:gap-8 opacity-75">
                  {trustItems.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="text-center"
                    >
                      <div
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20
                              border border-blue-400/30 flex items-center justify-center mb-2 sm:mb-3 mx-auto"
                      >
                        <Star className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
                      </div>

                      <p className="text-xs sm:text-sm font-semibold text-white mb-1">
                        {item.name}
                      </p>

                      <p className="text-xs text-gray-400 uppercase tracking-wide">
                        {item.industry}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── PRODUCTS SECTION ── */}
        <section
          id="products"
          className="py-16 sm:py-20 lg:py-24 xl:py-32 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#040c1e] via-[#060f24] to-[#040c1e]" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12 sm:mb-16"
            >
              <span className="inline-block px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-xs sm:text-sm font-semibold text-purple-400 mb-3 sm:mb-4">
                Our Platforms
              </span>
              <h2
                className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black mb-4 sm:mb-6"
              >
                <span className="text-[#ff851b]">AI Solutions</span> for
                <br />
                <span className="block bg-gradient-to-r from-[#5e17ea] to-[#1e90ff] bg-clip-text text-transparent">
                  Every Industry
                </span>
              </h2>
              <p
                className="text-base sm:text-lg text-gray-400 max-w-3xl mx-auto px-4"
              >
                Purpose-built platforms designed to solve real industry
                challenges with cutting-edge AI technology
              </p>
            </motion.div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onLearnMore={setActiveProduct}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── DEMO SECTION ── */}
      

        {/* ── CTA SECTION ── */}
        <section className="py-16 sm:py-20 lg:py-24 xl:py-32 relative overflow-hidden bg-[#050a14]">
          {/* Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1e90ff]/10 via-transparent to-[#5e17ea]/10" />

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              {/* ✅ Top Badge */}
              <div className="inline-flex rounded-full bg-[linear-gradient(90deg,#5e17ea,#1e90ff)] px-4 py-2 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-white shadow-[0_14px_28px_rgba(17,68,160,0.2)] mb-6">
                Get Started
              </div>

              {/* ✅ Heading */}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black mb-4 sm:mb-6 text-white leading-tight">
                Ready to Transform
                <span className="block bg-[linear-gradient(120deg,#ff851b_0%,#1e90ff_48%,#5e17ea_100%)] bg-clip-text text-transparent">
                  Your Business?
                </span>
              </h2>

              {/* ✅ Description */}
              <p className="text-base sm:text-lg text-[rgba(230,238,255,0.72)] mb-8 sm:mb-12 max-w-2xl mx-auto px-4 leading-relaxed">
                Join industry leaders who are already leveraging DSeT AI to
                drive innovation and growth. Let's discuss how our solutions can
                accelerate your digital transformation.
              </p>

              {/* ✅ Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                {/* Primary */}
                <motion.a
                  href="/contact"
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#5e17ea] to-[#1e90ff]
    text-white font-semibold rounded-xl shadow-2xl
    hover:shadow-blue-500/30 transition-all duration-300 text-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Your Journey
                </motion.a>

                {/* Secondary */}
                <motion.a
                  href="#vision"
                  className="px-6 sm:px-8 py-3 sm:py-4 border border-[#1e90ff]/30 text-gray-300
            font-semibold rounded-xl hover:bg-[#1e90ff]/10
            transition-all duration-300 text-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Learn More
                </motion.a>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      {/* ── MODAL ── */}
      {activeProduct && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
          style={{
            background: "rgba(1,8,20,0.92)",
            backdropFilter: "blur(20px)",
          }}
          onClick={() => setActiveProduct(null)}
        >
          <motion.div
            className="relative w-full max-w-lg rounded-2xl overflow-hidden overflow-y-auto max-h-[90vh]"
            style={{
              background: "rgba(6,14,30,0.98)",
              border: `1px solid ${activeProduct.borderColor}40`,
              boxShadow: "0 40px 100px rgba(0,0,0,0.8)",
            }}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.96, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="h-[3px]"
              style={{
                background: `linear-gradient(90deg, ${activeProduct.accentColor}, transparent)`,
              }}
            />

            <div className="p-8 sm:p-10">
              <button
                onClick={() => setActiveProduct(null)}
                className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-all"
                style={{
                  color: "rgba(180,200,255,0.4)",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                ✕
              </button>

              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">{activeProduct.icon}</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-[0.62rem] font-black uppercase tracking-[0.14em] px-2.5 py-0.5 rounded-sm"
                    style={{
                      background: `${activeProduct.accentColor}22`,
                      color: activeProduct.tagColor,
                      border: `1px solid ${activeProduct.accentColor}30`,
                    }}
                  >
                    {activeProduct.badge}
                  </span>
                  <StatusBadge status={activeProduct.status} />
                </div>
              </div>

              <h2
                className="text-3xl font-black text-white mb-1"
              >
                {activeProduct.name}
              </h2>
              <p
                className="text-sm font-semibold mb-5"
                style={{ color: activeProduct.tagColor }}
              >
                {activeProduct.tagline}
              </p>

              <p
                className="text-sm leading-relaxed mb-8 text-gray-300"
              >
                {activeProduct.description}
              </p>

              <div
                className="rounded-xl p-6 mb-8"
                style={{
                  background: `${activeProduct.accentColor}08`,
                  border: `1px solid ${activeProduct.accentColor}20`,
                }}
              >
                <p
                  className="text-[0.6rem] font-black uppercase tracking-[0.18em] mb-4"
                  style={{ color: activeProduct.tagColor }}
                >
                  Key Capabilities
                </p>
                <ul className="space-y-3">
                  {activeProduct.features.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-[13px] text-gray-300"
                    >
                      <span
                        className="mt-[5px] w-1 h-1 rounded-full flex-shrink-0"
                        style={{ background: activeProduct.accentColor }}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/contact"
                onClick={() => setActiveProduct(null)}
                className="block w-full text-center text-xs font-bold uppercase tracking-[0.14em] py-3.5 rounded-lg text-white transition-all hover:opacity-90"
                style={{
                  background: `linear-gradient(135deg, ${activeProduct.accentColor}bb, ${activeProduct.accentColor}88)`,
                  border: `1px solid ${activeProduct.accentColor}55`,
                }}
              >
                Get Early Access →
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </Layout>
  );
}
