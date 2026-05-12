import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '../components/layout/Layout';
import Section from '../components/ui/Section';
import { Server, GitMerge, Activity, Compass, Cpu, ArrowRight, Zap, RefreshCw, Users } from 'lucide-react';

const services = [
  {
    id: 'platform-deployment',
    icon: <Server className="w-7 h-7" />,
    title: 'Platform Deployment',
    description:
      'Deploy and configure DSeT AI platforms in your environment — cloud, on-premise, or hybrid. We handle integration, configuration, and go-live support end to end.',
    accent: '#5e17ea',
    outcomes: ['Faster time-to-value', 'Zero-disruption rollout', 'Edge & cloud ready'],
  },
  {
    id: 'ai-integration',
    icon: <GitMerge className="w-7 h-7" />,
    title: 'AI Integration & Data Modernisation',
    description:
      'Connect DSeT platforms to your existing ERP, SCADA, cloud, and data infrastructure. Modernise pipelines without ripping out legacy systems.',
    accent: '#1e90ff',
    outcomes: ['ERP & SCADA connectivity', 'Real-time data pipelines', 'Legacy-safe migration'],
  },
  {
    id: 'managed-intelligence',
    icon: <Activity className="w-7 h-7" />,
    title: 'Managed Intelligence Services',
    description:
      'Ongoing model management, monitoring, and optimisation. We keep your AI platforms performing at peak as data and operations evolve.',
    accent: '#ff851b',
    outcomes: ['Continuous model tuning', '24/7 monitoring', 'SLA-backed uptime'],
  },
  {
    id: 'advisory',
    icon: <Compass className="w-7 h-7" />,
    title: 'Platform Adoption Engineering',
    description:
      'Readiness assessments, architecture blueprints, and integration planning — so your teams go live on AI platforms fast, with zero guesswork.',
    accent: '#1e90ff',
    outcomes: ['AI readiness scoring', 'Architecture blueprints', 'Change management'],
  },
  {
    id: 'custom-ai',
    icon: <Cpu className="w-7 h-7" />,
    title: 'Custom AI Engineering',
    description:
      'Bespoke model development and feature engineering on top of DSeT\'s AI OS for industry-specific problems that off-the-shelf tools cannot solve.',
    accent: '#5e17ea',
    outcomes: ['Vertical-specific models', 'On-premise inference', 'Proprietary data moats'],
  },
];

const arcPhases = [
  {
    letter: 'A',
    title: 'Activate',
    description: 'Assess current capabilities, data maturity, and platform readiness to define the right starting point.',
    color: '#5e17ea',
    icon: <Zap className="w-7 h-7" />,
  },
  {
    letter: 'R',
    title: 'Reimagine',
    description: 'Redesign processes, operating models, and integration architecture around the AI platform.',
    color: '#1e90ff',
    icon: <RefreshCw className="w-7 h-7" />,
  },
  {
    letter: 'C',
    title: 'Co-create',
    description: 'Build, deploy, and iterate collaboratively — combining DSeT platform capabilities with your domain knowledge.',
    color: '#ff851b',
    icon: <Users className="w-7 h-7" />,
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const smoothEase = [0.22, 1, 0.36, 1] as const;

const itemVariants = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: smoothEase } },
};

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: smoothEase } },
};

const ServicesPage = () => {
  return (
    <Layout
      title="Services | DSeT — Platform Deployment, AI Integration & Managed Intelligence"
      description="DSeT delivers AI platform deployment, integration, managed intelligence, advisory, and custom AI engineering for operationally complex and regulated industries."
      jsonLd={{
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'DSeT ARC — Platform Deployment & AI Integration',
        url: 'https://dsetconsulting.com/services',
        description: 'DSeT delivers AI platform deployment, integration, managed intelligence, advisory, and custom AI engineering for operationally complex and regulated industries.',
        provider: { '@type': 'Organization', name: 'DSeT Consulting', url: 'https://dsetconsulting.com' },
        serviceType: ['Platform Deployment', 'AI Integration', 'Managed Intelligence', 'Advisory', 'Custom AI Engineering'],
        areaServed: { '@type': 'Country', name: 'India' },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'DSeT Service Offerings',
          itemListElement: [
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Platform Deployment' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'AI Integration & Data Modernisation' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Managed Intelligence Services' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Advisory for Platform Adoption' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Custom AI Engineering' } },
          ],
        },
      }}
    >

      {/* ── Hero ── */}
      <Section bgColor="light" spacing="xl">
        <div className="relative bg-gradient-to-br from-[#001f3f] via-[#002b57] to-[#001f3f] rounded-3xl shadow-2xl p-10 sm:p-16 overflow-hidden">

          {/* Grid overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%231e90ff%22%20stroke-width%3D%220.5%22%20stroke-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M0%2030h60M30%200v60%22/%3E%3C/g%3E%3C/svg%3E')] opacity-20" />

          {/* Animated orbs */}
          <motion.div
            className="absolute top-[-60px] right-[-60px] w-72 h-72 rounded-full bg-[#5e17ea]/25 blur-3xl pointer-events-none"
            animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.4, 0.25] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-[-40px] left-[-40px] w-64 h-64 rounded-full bg-[#1e90ff]/20 blur-3xl pointer-events-none"
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.35, 0.2] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-[#ff851b]/10 blur-2xl pointer-events-none"
            animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left content */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.span
                variants={fadeUp}
                className="inline-block px-4 py-2 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-[#5e17ea] to-[#1e90ff] rounded-full mb-6 shadow-lg"
              >
                How We Deliver
              </motion.span>

              <motion.h1
                variants={fadeUp}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight"
              >
                <span className="text-white">Platform-First</span>{' '}
                <span className="text-[#ff851b]">Delivery.</span>
                <span className="block bg-gradient-to-r from-[#5e17ea] to-[#1e90ff] bg-clip-text text-transparent">
                  Real Outcomes.
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-lg sm:text-xl text-gray-300 mb-8 leading-relaxed"
              >
                We don&apos;t sell hours. We deploy proprietary AI platforms and ensure they work —
                in your environment, for your operations, at the scale you need.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
                <motion.a
                  href="/contact?type=demo"
                  className="relative px-8 py-4 bg-gradient-to-r from-[#5e17ea] to-[#1e90ff] text-white font-semibold rounded-xl shadow-lg overflow-hidden group text-center"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <span className="relative z-10">Book a Strategic Demo</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#1e90ff] to-[#5e17ea] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.a>
                <motion.a
                  href="/product"
                  className="relative px-8 py-4 text-white font-medium rounded-xl text-center border-2 border-white/30 hover:border-white/60 transition-colors duration-300"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  Explore Platforms
                </motion.a>
              </motion.div>
            </motion.div>

            {/* Right image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.35, ease: smoothEase }}
              className="flex justify-center"
            >
              <motion.div
                className="w-72 h-72 rounded-3xl bg-gradient-to-br from-[#5e17ea]/20 to-[#1e90ff]/20 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-2xl"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Image
                  src="/DsET-ARC-Design.webp"
                  alt="DSeT ARC Framework"
                  width={260}
                  height={260}
                  className="object-contain h-56 w-auto"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ── 5 Services ── */}
      <Section bgColor="white" spacing="xl" id="service-offerings">
        <motion.div
          className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-[#ebe7df] bg-[#f9f7f2] px-6 py-10 shadow-[0_24px_70px_rgba(15,23,42,0.12)] sm:px-10 sm:py-14"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          <div className="absolute inset-x-0 top-0 h-2 bg-[#5e17ea]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(94,23,234,0.08)_1px,_transparent_1px)] [background-size:24px_24px] opacity-35" />
          <motion.div className="relative z-10 mb-14 text-center" variants={itemVariants}>
            <div className="mb-6 flex items-center justify-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#5e17ea] text-white shadow-[0_14px_24px_rgba(94,23,234,0.22)]">
                <Server className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold leading-tight text-[#082b57] sm:text-3xl md:text-4xl">
                <span className="tracking-tight">Service</span>{' '}
                <span className="font-medium">Offerings</span>
              </h2>
            </div>
            <p className="mx-auto max-w-3xl text-base leading-relaxed text-[#4f5d73] sm:text-lg">
              Every engagement is anchored to one or more of these delivery modes —
              chosen based on where you are in your AI platform journey.
            </p>
          </motion.div>

          <div className="relative z-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.slice(0, 3).map((service, i) => (
              <ServiceCard key={service.title} service={service} index={i} />
            ))}
          </div>
          <div className="relative z-10 mx-auto mt-4 grid max-w-2xl grid-cols-1 gap-4 md:grid-cols-2 lg:max-w-none lg:grid-cols-2 lg:px-[16.67%]">
            {services.slice(3).map((service, i) => (
              <ServiceCard key={service.title} service={service} index={i + 3} />
            ))}
          </div>
        </motion.div>
      </Section>

      {/* ── DSeT ARC Methodology ── */}
      <Section bgColor="light" spacing="xl" id="dset-arc">
        <motion.div
          className="relative bg-gradient-to-br from-[#001f3f] via-[#002b57] to-[#001f3f] rounded-3xl shadow-2xl p-10 sm:p-14 overflow-hidden max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.7, ease: smoothEase }}
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%231e90ff%22%20stroke-width%3D%220.5%22%20stroke-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M0%2030h60M30%200v60%22/%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#5e17ea]/20 to-transparent" />
          <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gradient-to-r from-[#1e90ff]/20 to-transparent" />

          <div className="relative z-10">
            {/* Section header */}
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-2 text-xs sm:text-sm font-medium text-white bg-white/10 border border-white/20 rounded-full mb-5">
                Our Methodology
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                How We Deliver —{' '}
                <span className="bg-gradient-to-r from-[#ff851b] to-[#1e90ff] bg-clip-text text-transparent">
                  DSeT ARC
                </span>
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto text-lg">
                Every engagement follows our proven Activate → Reimagine → Co-create framework
                to ensure platform adoption is structured, de-risked, and measurable.
              </p>
            </motion.div>

            {/* ARC phases */}
            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">

              {/* Connecting line (desktop only) */}
              <div className="hidden md:block absolute top-10 left-[calc(16.67%+2.5rem)] right-[calc(16.67%+2.5rem)] h-[2px] z-0">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#5e17ea] via-[#1e90ff] to-[#ff851b]"
                  initial={{ scaleX: 0, originX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.4, ease: smoothEase }}
                />
                {/* Arrow dots */}
                {[0, 1].map((n) => (
                  <motion.div
                    key={n}
                    className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white"
                    style={{ left: n === 0 ? '50%' : '100%', translateX: '-50%' }}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.9 + n * 0.15, duration: 0.3 }}
                  />
                ))}
              </div>

              {arcPhases.map((phase, i) => (
                <motion.div
                  key={phase.letter}
                  className="group relative z-10 text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.18, duration: 0.55, ease: smoothEase }}
                >
                  {/* Icon box */}
                  <motion.div
                    className="w-20 h-20 mx-auto mb-5 rounded-2xl flex items-center justify-center text-white shadow-lg border border-white/20 cursor-default"
                    style={{ backgroundColor: `${phase.color}80` }}
                    whileHover={{ scale: 1.15, rotate: 6 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  >
                    {/* Pulsing ring on hover */}
                    <motion.div
                      className="absolute w-20 h-20 rounded-2xl border-2 opacity-0 group-hover:opacity-60 transition-opacity duration-300"
                      style={{ borderColor: phase.color }}
                      animate={{ scale: [1, 1.25, 1], opacity: [0, 0.4, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: i * 0.4 }}
                    />
                    <span>{phase.icon}</span>
                  </motion.div>

                  <h3 className="text-xl font-bold text-white mb-3">{phase.title}</h3>
                  <p className="text-gray-300 leading-relaxed text-sm">{phase.description}</p>
                </motion.div>
              ))}
            </div>

            {/* Tag pills */}
            <motion.div
              className="mt-12 flex flex-wrap justify-center gap-5 text-sm text-white"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {['Human Desirability', 'Business Viability', 'Technological Feasibility'].map((tag, i) => (
                <motion.div
                  key={tag}
                  variants={fadeUp}
                  custom={i}
                  className="flex items-center px-5 py-2.5 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 hover:bg-white/10 transition-colors duration-300"
                >
                  <motion.div
                    className="w-2.5 h-2.5 rounded-full mr-2.5 flex-shrink-0"
                    style={{ backgroundColor: ['#5e17ea', '#1e90ff', '#ff851b'][i] }}
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.6 }}
                  />
                  <span className="font-medium">{tag}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </Section>

      {/* ── CTA ── */}
      <Section bgColor="white" spacing="lg">
        <motion.div
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: smoothEase }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-5 text-white">
            <span className="text-[#ff851b]">Ready to Start Your</span>{' '}
            <span className="text-[#5e17ea]">
              Platform Journey?
            </span>
          </h2>
          <p className="text-lg text-white mb-8 leading-relaxed">
            Tell us where you are and we&apos;ll match you to the right delivery model.
          </p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.a
              href="/contact?type=demo"
              variants={fadeUp}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#5e17ea] to-[#1e90ff] text-white font-semibold rounded-xl shadow-lg text-base"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
            >
              Book a Strategic Demo <ArrowRight />
            </motion.a>
            <motion.a
              href="/case-studies"
              variants={fadeUp}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-white font-semibold rounded-xl border-2 border-white/60 hover:border-white hover:bg-white/10 transition-colors duration-300 text-base"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
            >
              View Case Studies
            </motion.a>
          </motion.div>
        </motion.div>
      </Section>

    </Layout>
  );
};

function ServiceCard({ service, index }: { service: typeof services[0]; index: number }) {
  return (
    <motion.div
      id={service.id}
      variants={itemVariants}
      custom={index}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className="group relative h-full overflow-hidden rounded-[1.2rem] border border-[#ece7de] bg-white shadow-[0_12px_26px_rgba(15,23,42,0.07)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(15,23,42,0.1)]"
    >
      {/* Top accent bar animates in on scroll */}
      <motion.div
        className="h-[6px] w-full bg-[#5e17ea]"
        initial={{ scaleX: 0, originX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
      />

      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'linear-gradient(180deg, rgba(94,23,234,0.05), transparent 40%)' }}
      />

      <div className="relative z-10 flex h-full flex-col p-5">
        <motion.div
          className="mb-4 flex h-10 w-10 items-center justify-center rounded-[0.8rem] bg-[#5e17ea] text-white shadow-[0_8px_16px_rgba(94,23,234,0.14)]"
          whileHover={{ rotate: 8, scale: 1.12 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        >
          {service.icon}
        </motion.div>

        <h3 className="mb-2.5 text-lg font-bold leading-[1.3] text-[#082b57] sm:text-[1.45rem]">
          {service.title}
        </h3>

        <p className="mb-4 text-sm leading-[1.6] text-[#4f5d73]">
          {service.description}
        </p>

        <ul className="mb-4 space-y-1.5">
          {service.outcomes.map((o, oi) => (
            <motion.li
              key={o}
              className="flex items-center gap-2 text-xs text-[#4f5d73]"
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 + oi * 0.07 }}
            >
              <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#5e17ea]" />
              {o}
            </motion.li>
          ))}
        </ul>

        <div className="mt-auto border-t border-[#eee8de] pt-3">
          <Link
            href="/contact?type=demo"
            className="group/link inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#5e17ea] transition-colors duration-200 hover:text-[#4b11ca]"
          >
            Explore Solution
            <motion.span
              className="inline-flex"
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: index * 0.3 }}
            >
              <ArrowRight className="h-4 w-4" />
            </motion.span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default ServicesPage;
