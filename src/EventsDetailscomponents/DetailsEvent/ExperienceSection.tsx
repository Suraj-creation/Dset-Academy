// src/components/gallery/ExperienceSection.tsx

import { motion, Variants } from "framer-motion";
import { EXPERIENCE_BLOCKS } from "./types";
import { Cpu, Award, Users, TrendingUp } from "lucide-react";

const FADE_UP: Variants = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } };

export default function ExperienceSection() {
  return (
    <section className="border-b border-white/8 bg-[linear-gradient(180deg,#101f3b_0%,#13284b_100%)] py-20">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 max-w-2xl"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5e17ea]">
            What You&apos;ll Experience
          </p>
          <h2 className="mt-4 text-2xl font-semibold leading-snug tracking-[-0.015em] text-white/92 sm:text-3xl md:text-4xl">
            Built like an enterprise showcase, not a simple media dump
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4"
        >
          {/* AI Demos */}
          <motion.div
            variants={FADE_UP}
            className="group rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl transition duration-300 hover:-translate-y-1.5 hover:border-[#1e90ff]/30 hover:bg-white/[0.06]"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5e17ea] to-[#1e90ff] text-white shadow-lg shadow-[#1e90ff]/10">
              <Cpu size={28} strokeWidth={2.5} />
            </div>
            <h3 className="mt-5 text-xl font-bold tracking-[-0.02em] text-white">{EXPERIENCE_BLOCKS[0].title}</h3>
            <p className="mt-3 text-sm leading-7 text-white/65">{EXPERIENCE_BLOCKS[0].text}</p>
          </motion.div>

          {/* Expert Talks */}
          <motion.div
            variants={FADE_UP}
            className="group rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl transition duration-300 hover:-translate-y-1.5 hover:border-[#1e90ff]/30 hover:bg-white/[0.06]"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5e17ea] to-[#1e90ff] text-white shadow-lg shadow-[#1e90ff]/10">
              <Award size={28} strokeWidth={2.5} />
            </div>
            <h3 className="mt-5 text-xl font-bold tracking-[-0.02em] text-white">{EXPERIENCE_BLOCKS[1].title}</h3>
            <p className="mt-3 text-sm leading-7 text-white/65">{EXPERIENCE_BLOCKS[1].text}</p>
          </motion.div>

          {/* Networking */}
          <motion.div
            variants={FADE_UP}
            className="group rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl transition duration-300 hover:-translate-y-1.5 hover:border-[#1e90ff]/30 hover:bg-white/[0.06]"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5e17ea] to-[#1e90ff] text-white shadow-lg shadow-[#1e90ff]/10">
            <Users size={28} />
            </div>
            <h3 className="mt-5 text-xl font-bold tracking-[-0.02em] text-white">{EXPERIENCE_BLOCKS[2].title}</h3>
            <p className="mt-3 text-sm leading-7 text-white/65">{EXPERIENCE_BLOCKS[2].text}</p>
          </motion.div>

          {/* Industry Insight */}
          <motion.div
            variants={FADE_UP}
            className="group rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl transition duration-300 hover:-translate-y-1.5 hover:border-[#1e90ff]/30 hover:bg-white/[0.06]"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5e17ea] to-[#1e90ff] text-white shadow-lg shadow-[#1e90ff]/10">
              <TrendingUp size={28} />
            </div>
            <h3 className="mt-5 text-xl font-bold tracking-[-0.02em] text-white">{EXPERIENCE_BLOCKS[3].title}</h3>
            <p className="mt-3 text-sm leading-7 text-white/65">{EXPERIENCE_BLOCKS[3].text}</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}