import { motion } from 'framer-motion';
import Link from 'next/link';
import Section from '../ui/Section';

const industries = [
  {
    name: 'Mining & Resources',
    platform: 'OreBill AI',
    description: 'Automate ore billing, grade tracking, and waste management with AI-driven operations across the full mining lifecycle.',
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    ),
    tag: 'Ore | Grade | Billing',
  },
  {
    name: 'Industrial & Manufacturing',
    platform: 'EdgeBay Intelligence',
    description: 'Edge-native IoT intelligence for predictive maintenance, OEE optimisation, and real-time operational visibility on the shop floor.',
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    tag: 'IoT | Predictive | OEE',
  },
  {
    name: 'Healthcare',
    platform: 'HealthOS AI',
    description: 'Intelligent patient operations, diagnostic decision support, and compliance-first data management for modern healthcare providers.',
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    ),
    tag: 'Patient Ops | Diagnostics | Compliance',
  },
  {
    name: 'Sports & Education',
    platform: 'iPaS-RevOps',
    description: 'Performance analytics for athletes and institutions, from player tracking and injury prediction to student outcome intelligence.',
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    tag: 'Performance | Analytics | RevOps',
  },
  {
    name: 'Secure Enterprise',
    platform: 'SecureCloud',
    description: 'Compliance-aware AI infrastructure, data residency controls, and enterprise security for organisations operating in regulated environments.',
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
    tag: 'Compliance-Aware | Data Residency | Security',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.11 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const themePalette = {
  orange: {
    accent: '#ff851b',
    accentSoft: 'rgba(255,133,27,0.1)',
    accentBorder: 'rgba(255,133,27,0.22)',
    accentShadow: '0 14px 28px rgba(255,133,27,0.22)',
  },
  blue: {
    accent: '#1e90ff',
    accentSoft: 'rgba(30,144,255,0.1)',
    accentBorder: 'rgba(30,144,255,0.22)',
    accentShadow: '0 14px 28px rgba(30,144,255,0.2)',
  },
} as const;

const TransformationNarrative = () => {
  return (
    <Section bgColor="light" id="industries" spacing="xl">
      <div className="mx-auto max-w-7xl">
        <motion.div
          className="relative overflow-hidden rounded-[2rem] border border-[#ebe7df] bg-[#fbfaf7] px-6 py-10 shadow-[0_24px_70px_rgba(15,23,42,0.12)] sm:px-10 sm:py-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-[#ff851b] via-[#ff851b] to-[#1e90ff]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(15,23,42,0.06)_1px,_transparent_1px)] [background-size:24px_24px] opacity-35" />

          <motion.div
            className="relative z-10 mb-14 text-center"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ff851b] text-white shadow-[0_14px_28px_rgba(255,133,27,0.24)]">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold leading-tight text-[#082b57] sm:text-3xl md:text-4xl">
                <span className="tracking-tight">Transformation</span>{' '}
                <span className="font-medium">Narrative</span>
              </h2>
            </div>

            <p className="mx-auto max-w-3xl text-base leading-relaxed text-[#4f5d73] sm:text-lg">
              Industry cards ko reference style mein refresh kiya gaya hai, jahan orange aur blue highlight cards clean white panel ke andar show hote hain.
            </p>
          </motion.div>

          <motion.div
            className="relative z-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {industries.map((ind, i) => {
              const theme = i % 2 === 0 ? themePalette.orange : themePalette.blue;

              return (
                <motion.div
                  key={ind.name}
                  variants={cardVariants}
                  className={i === 4 ? 'sm:col-span-2 lg:col-span-1' : ''}
                  whileHover={{ y: -6, transition: { duration: 0.22 } }}
                >
                  <div className="group relative flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-[#ece7de] bg-white shadow-[0_12px_26px_rgba(15,23,42,0.07)] transition-all duration-300 hover:shadow-[0_18px_36px_rgba(15,23,42,0.11)]">
                    <div className="h-[6px] w-full" style={{ backgroundColor: theme.accent }} />

                    <div
                      className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{ background: `linear-gradient(180deg, ${theme.accentSoft}, transparent 40%)` }}
                    />

                    <div className="relative z-10 flex h-full flex-col p-6 sm:p-7">
                      <motion.div
                        className="mb-5 flex h-14 w-14 items-center justify-center rounded-[1rem] text-white"
                        style={{
                          backgroundColor: theme.accent,
                          boxShadow: theme.accentShadow,
                        }}
                        whileHover={{ rotate: 8, scale: 1.08 }}
                        transition={{ type: 'spring', stiffness: 280, damping: 16 }}
                      >
                        {ind.icon}
                      </motion.div>

                      <div
                        className="mb-4 inline-flex w-fit items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]"
                        style={{
                          backgroundColor: theme.accentSoft,
                          color: theme.accent,
                          border: `1px solid ${theme.accentBorder}`,
                        }}
                      >
                        {ind.platform}
                      </div>

                      <h3 className="mb-3 text-xl font-bold leading-[1.35] text-[#082b57] sm:text-[1.7rem]">
                        {ind.name}
                      </h3>

                      <p className="mb-5 text-base leading-[1.8] text-[#4f5d73]">
                        {ind.description}
                      </p>

                      <p className="mb-5 text-xs font-medium uppercase tracking-[0.16em] text-[#7a8799]">
                        {ind.tag}
                      </p>

                      <div className="mt-auto border-t border-[#eee8de] pt-4">
                        <Link
                          href="/product"
                          className="inline-flex items-center gap-2 text-base font-semibold transition-colors duration-200"
                          style={{ color: theme.accent }}
                        >
                          Explore Solution
                          <motion.svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            animate={{ x: [0, 4, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.18 }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </motion.svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </Section>
  );
};

export default TransformationNarrative;
