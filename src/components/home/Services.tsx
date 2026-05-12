import { motion } from 'framer-motion';
import Link from 'next/link';
import Section from '../ui/Section';

const BLUE = '#1e90ff';
const BLUE_SHADOW = 'rgba(30,144,255,0.28)';

const differentiators = [
  {
    title: 'Vertical AI, not horizontal tooling',
    problem: 'Generic AI tools are adapted to your industry. Ours are built for it from day one.',
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18" />
      </svg>
    ),
  },
  {
    title: 'Regulated-first & edge-ready',
    problem: 'Compliance controls are baked in — not bolted on. Runs on edge, cloud, or air-gapped.',
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: 'Non-API intelligence — on-premise',
    problem: 'Your models run inside your infrastructure. Your data never leaves your environment.',
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
      </svg>
    ),
  },
  {
    title: 'OT/IT convergence-native',
    problem: 'We speak SCADA, DCS, and PLC — bridging OT and IT without ripping out existing systems.',
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Platform + deployment in one model',
    problem: "You don't buy a licence and figure out the rest. One engagement, one SLA, full delivery.",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
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

const Services = () => {
  return (
    <Section bgColor="light" id="why-dset" spacing="xl">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="relative overflow-hidden rounded-[2rem] border border-[#e8e4dc] bg-[#fbfaf7] px-6 py-10 sm:px-10 sm:py-12 shadow-[0_20px_60px_rgba(15,23,42,0.09)]"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Blue top bar */}
          <div className="absolute inset-x-0 top-0 h-[6px]" style={{ backgroundColor: BLUE }} />

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
              style={{ backgroundColor: BLUE, boxShadow: `0 10px 24px ${BLUE_SHADOW}` }}
            >
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#001f3f] tracking-tight leading-tight">
              Why operators{' '}
              <span className="text-[#4f5d73] font-normal">choose DSeT</span>
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
            {differentiators.map((d, i) => (
              <motion.div
                key={d.title}
                variants={cardVariants}
                className={i === 4 ? 'sm:col-span-2 lg:col-span-1' : ''}
                whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.2, ease: 'easeOut' } }}
              >
                <div className="group flex flex-col h-full bg-white rounded-[1.15rem] border border-[#ece8e0] shadow-[0_4px_16px_rgba(15,23,42,0.07)] hover:shadow-[0_12px_28px_rgba(30,144,255,0.15)] transition-shadow duration-300 overflow-hidden">
                  <div className="h-[5px] w-full flex-shrink-0" style={{ backgroundColor: BLUE }} />
                  <div className="flex flex-col flex-1 p-5">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 flex-shrink-0"
                      style={{ backgroundColor: BLUE, boxShadow: `0 6px 16px ${BLUE_SHADOW}` }}
                    >
                      {d.icon}
                    </div>
                    <h3 className="text-[0.95rem] font-bold text-[#001f3f] mb-2 leading-snug">{d.title}</h3>
                    <p className="text-sm text-[#5a6a7a] leading-relaxed flex-1">{d.problem}</p>
                    <Link
                      href="/services"
                      className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold hover:gap-2.5 transition-all duration-200"
                      style={{ color: BLUE }}
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

          {/* Footer CTA */}
          <motion.p
            className="relative z-10 text-center text-sm text-[#9ca3af] mt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            Ready to see it in action?{' '}
            <Link href="/contact?type=demo" className="font-semibold hover:underline underline-offset-2" style={{ color: BLUE }}>
              Book a strategic demo.
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </Section>
  );
};

export default Services;
