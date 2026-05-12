import { motion } from 'framer-motion';
import Link from 'next/link';
import Section from '../ui/Section';

const ORANGE = '#ff851b';
const ORANGE_SHADOW = 'rgba(255,133,27,0.28)';

const industries = [
  {
    name: 'Mining & Resources',
    problem: 'Ore billing errors and grade disputes cost millions annually.',
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    name: 'Industrial & Manufacturing',
    problem: 'Unplanned downtime destroys OEE and erodes margins.',
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    name: 'Healthcare',
    problem: 'Manual patient ops create compliance gaps and care delays.',
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    name: 'Sports & Education',
    problem: 'Performance data exists but insights never reach decisions.',
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    name: 'Secure Enterprise',
    problem: 'AI adoption stalls when sensitive data cannot leave the perimeter.',
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const cardVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
};

const IndustriesSection = () => {
  return (
    <Section bgColor="light" id="industries" spacing="xl">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="relative overflow-hidden rounded-[2rem] border border-[#e8e4dc] bg-[#fbfaf7] px-6 py-10 sm:px-10 sm:py-12 shadow-[0_20px_60px_rgba(15,23,42,0.09)]"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Orange top bar */}
          <div className="absolute inset-x-0 top-0 h-[6px]" style={{ backgroundColor: ORANGE }} />

          {/* Dot grid */}
          <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(15,23,42,0.05)_1px,_transparent_1px)] [background-size:22px_22px] opacity-40 pointer-events-none" />

          {/* Header */}
          <motion.div
            className="relative z-10 flex items-center gap-4 mb-10"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: ORANGE, boxShadow: `0 10px 24px ${ORANGE_SHADOW}` }}
            >
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#001f3f] tracking-tight leading-tight">
              Industries{' '}
              <span className="font-bold text-[#4f5d73]">We Serve</span>
            </h2>
          </motion.div>

          {/* Cards */}
          <motion.div
            className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.05 }}
          >
            {industries.map((ind, i) => (
              <motion.div
                key={ind.name}
                variants={cardVariants}
                className={i === 4 ? 'sm:col-span-2 lg:col-span-1' : ''}
                whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.2, ease: 'easeOut' } }}
              >
              <div className="group flex flex-col h-full bg-white rounded-[1.15rem] border border-[#ece8e0] shadow-[0_4px_16px_rgba(15,23,42,0.07)] hover:shadow-[0_12px_28px_rgba(255,133,27,0.15)] transition-shadow duration-300 overflow-hidden">
                  <div className="h-[5px] w-full flex-shrink-0" style={{ backgroundColor: ORANGE }} />
                  <div className="flex flex-col flex-1 p-6">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 flex-shrink-0"
                      style={{ backgroundColor: ORANGE, boxShadow: `0 10px 22px ${ORANGE_SHADOW}` }}
                    >
                      {ind.icon}
                    </div>
                    <h3 className="mb-3 text-[1.1rem] sm:text-[1.25rem] font-bold text-[#001f3f] leading-snug">{ind.name}</h3>
                    <p className="text-[0.98rem] text-[#5a6a7a] leading-relaxed flex-1">{ind.problem}</p>
                    <Link
                      href="/product"
                      className="inline-flex items-center gap-1.5 mt-5 text-base font-semibold hover:gap-2.5 transition-all duration-200"
                      style={{ color: ORANGE }}
                    >
                      Explore Solution
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Footer */}
          <motion.p
            className="relative z-10 text-center text-sm text-[#9ca3af] mt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            Don&apos;t see your industry?{' '}
            <Link href="/contact?type=demo" className="font-semibold hover:underline underline-offset-2" style={{ color: ORANGE }}>
              Let&apos;s build a custom platform.
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </Section>
  );
};

export default IndustriesSection;
