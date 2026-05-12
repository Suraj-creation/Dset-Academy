// src/components/events/ExperienceSection.tsx

import { motion, Variants } from "framer-motion";
import { ENTERPRISE_EASE, EXPERIENCE_CARDS } from "./types";
import { Cpu, Users, PlayCircle, Wifi, TrendingUp, Award } from "lucide-react";

const FADE_UP: Variants = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
const STAGGER: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

export default function ExperienceSection() {
  return (
    <section className="relative px-8 pb-8 pt-[6.5rem] max-sm:px-4">
      <div className="relative mx-auto max-w-[1280px] overflow-hidden rounded-[36px] border border-[rgba(255,255,255,0.1)] bg-[linear-gradient(135deg,#0b4276_0%,#06325f_50%,#1f2f8f_100%)] p-12 shadow-[0_32px_80px_rgba(0,18,45,0.26)] backdrop-blur-[20px] max-md:p-8 max-sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(30,144,255,0.22),transparent_24%),radial-gradient(circle_at_84%_18%,rgba(94,23,234,0.2),transparent_24%),radial-gradient(circle_at_50%_86%,rgba(255,133,27,0.12),transparent_22%)]" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.75, ease: ENTERPRISE_EASE }}
          className="relative z-[1] mb-10 max-w-[680px]"
        >
          <div className="inline-flex rounded-full bg-[linear-gradient(90deg,#5e17ea,#1e90ff)] px-4 py-2 text-[0.75rem] font-extrabold uppercase tracking-[0.12em] text-white shadow-[0_16px_30px_rgba(17,68,160,0.22)]">
            What You&apos;ll Experience
          </div>
          <h2 className="mt-5 mb-3 text-[clamp(2rem,4vw,3.25rem)] leading-[1.08] font-bold tracking-[-0.02em] text-white">
            Enterprise-caliber experiences built around
            <span className="block bg-[linear-gradient(120deg,#ff851b_0%,#1e90ff_48%,#5e17ea_100%)] bg-clip-text text-transparent">
              outcomes
            </span>
          </h2>
          <p className="m-0 text-[1rem] leading-[1.8] text-[rgba(232,239,255,0.82)]">
            Every DSeT event is designed to feel strategic, immersive, and relevant
            to technology leaders navigating AI, data, cloud, and transformation.
          </p>
        </motion.div>

        <motion.div
          variants={STAGGER}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]"
        >
          {/* AI Innovation */}
          <motion.div
            variants={FADE_UP}
            transition={{ duration: 0.65, delay: 0 * 0.05, ease: ENTERPRISE_EASE }}
            className="experience-card relative overflow-hidden rounded-[28px] border border-[rgba(255,255,255,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.06))] p-[1.7rem] shadow-[0_18px_42px_rgba(0,18,45,0.16)] backdrop-blur-[18px] transition-[transform,box-shadow,border-color] duration-[550ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] [will-change:transform] hover:translate-y-[-8px] hover:border-[rgba(255,255,255,0.2)] hover:shadow-[0_26px_56px_rgba(5,25,72,0.24)]"
          >
            <div className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#5e17ea,#1e90ff)] text-white shadow-[0_18px_38px_rgba(0,31,63,0.18)]">
              <Cpu size={28} strokeWidth={2.5} />
            </div>
            <h3 className="mb-[0.6rem] mt-[1.15rem] text-[1.02rem] font-bold tracking-[-0.02em] text-white">
              {EXPERIENCE_CARDS[0].title}
            </h3>
            <p className="m-0 text-[0.88rem] leading-[1.75] text-[rgba(226,235,255,0.8)]">
              {EXPERIENCE_CARDS[0].description}
            </p>
          </motion.div>

          {/* Industry Leaders */}
          <motion.div
            variants={FADE_UP}
            transition={{ duration: 0.65, delay: 1 * 0.05, ease: ENTERPRISE_EASE }}
            className="experience-card relative overflow-hidden rounded-[28px] border border-[rgba(255,255,255,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.06))] p-[1.7rem] shadow-[0_18px_42px_rgba(0,18,45,0.16)] backdrop-blur-[18px] transition-[transform,box-shadow,border-color] duration-[550ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] [will-change:transform] hover:translate-y-[-8px] hover:border-[rgba(255,255,255,0.2)] hover:shadow-[0_26px_56px_rgba(5,25,72,0.24)]"
          >
            <div className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#5e17ea,#1e90ff)] text-white shadow-[0_18px_38px_rgba(0,31,63,0.18)]">
              <Users size={28} strokeWidth={2.5} />
            </div>
            <h3 className="mb-[0.6rem] mt-[1.15rem] text-[1.02rem] font-bold tracking-[-0.02em] text-white">
              {EXPERIENCE_CARDS[1].title}
            </h3>
            <p className="m-0 text-[0.88rem] leading-[1.75] text-[rgba(226,235,255,0.8)]">
              {EXPERIENCE_CARDS[1].description}
            </p>
          </motion.div>

          {/* Live Demos */}
          <motion.div
            variants={FADE_UP}
            transition={{ duration: 0.65, delay: 2 * 0.05, ease: ENTERPRISE_EASE }}
            className="experience-card relative overflow-hidden rounded-[28px] border border-[rgba(255,255,255,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.06))] p-[1.7rem] shadow-[0_18px_42px_rgba(0,18,45,0.16)] backdrop-blur-[18px] transition-[transform,box-shadow,border-color] duration-[550ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] [will-change:transform] hover:translate-y-[-8px] hover:border-[rgba(255,255,255,0.2)] hover:shadow-[0_26px_56px_rgba(5,25,72,0.24)]"
          >
            <div className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#5e17ea,#1e90ff)] text-white shadow-[0_18px_38px_rgba(0,31,63,0.18)]">
              <PlayCircle size={28} strokeWidth={2.5} />
            </div>
            <h3 className="mb-[0.6rem] mt-[1.15rem] text-[1.02rem] font-bold tracking-[-0.02em] text-white">
              {EXPERIENCE_CARDS[2].title}
            </h3>
            <p className="m-0 text-[0.88rem] leading-[1.75] text-[rgba(226,235,255,0.8)]">
              {EXPERIENCE_CARDS[2].description}
            </p>
          </motion.div>

          {/* Strategic Networking */}
          <motion.div
            variants={FADE_UP}
            transition={{ duration: 0.65, delay: 3 * 0.05, ease: ENTERPRISE_EASE }}
            className="experience-card relative overflow-hidden rounded-[28px] border border-[rgba(255,255,255,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.06))] p-[1.7rem] shadow-[0_18px_42px_rgba(0,18,45,0.16)] backdrop-blur-[18px] transition-[transform,box-shadow,border-color] duration-[550ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] [will-change:transform] hover:translate-y-[-8px] hover:border-[rgba(255,255,255,0.2)] hover:shadow-[0_26px_56px_rgba(5,25,72,0.24)]"
          >
            <div className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#5e17ea,#1e90ff)] text-white shadow-[0_18px_38px_rgba(0,31,63,0.18)]">
              <Wifi size={28} strokeWidth={2.5} />
            </div>
            <h3 className="mb-[0.6rem] mt-[1.15rem] text-[1.02rem] font-bold tracking-[-0.02em] text-white">
              {EXPERIENCE_CARDS[3].title}
            </h3>
            <p className="m-0 text-[0.88rem] leading-[1.75] text-[rgba(226,235,255,0.8)]">
              {EXPERIENCE_CARDS[3].description}
            </p>
          </motion.div>

          {/* Actionable Insights */}
          <motion.div
            variants={FADE_UP}
            transition={{ duration: 0.65, delay: 4 * 0.05, ease: ENTERPRISE_EASE }}
            className="experience-card relative overflow-hidden rounded-[28px] border border-[rgba(255,255,255,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.06))] p-[1.7rem] shadow-[0_18px_42px_rgba(0,18,45,0.16)] backdrop-blur-[18px] transition-[transform,box-shadow,border-color] duration-[550ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] [will-change:transform] hover:translate-y-[-8px] hover:border-[rgba(255,255,255,0.2)] hover:shadow-[0_26px_56px_rgba(5,25,72,0.24)]"
          >
            <div className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#5e17ea,#1e90ff)] text-white shadow-[0_18px_38px_rgba(0,31,63,0.18)]">
              <TrendingUp size={28} strokeWidth={2.5} />
            </div>
            <h3 className="mb-[0.6rem] mt-[1.15rem] text-[1.02rem] font-bold tracking-[-0.02em] text-white">
              {EXPERIENCE_CARDS[4].title}
            </h3>
            <p className="m-0 text-[0.88rem] leading-[1.75] text-[rgba(226,235,255,0.8)]">
              {EXPERIENCE_CARDS[4].description}
            </p>
          </motion.div>

          {/* Executive Experience */}
          <motion.div
            variants={FADE_UP}
            transition={{ duration: 0.65, delay: 5 * 0.05, ease: ENTERPRISE_EASE }}
            className="experience-card relative overflow-hidden rounded-[28px] border border-[rgba(255,255,255,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.06))] p-[1.7rem] shadow-[0_18px_42px_rgba(0,18,45,0.16)] backdrop-blur-[18px] transition-[transform,box-shadow,border-color] duration-[550ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] [will-change:transform] hover:translate-y-[-8px] hover:border-[rgba(255,255,255,0.2)] hover:shadow-[0_26px_56px_rgba(5,25,72,0.24)]"
          >
            <div className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#5e17ea,#1e90ff)] text-white shadow-[0_18px_38px_rgba(0,31,63,0.18)]">
              <Award size={28} strokeWidth={2.5} />
            </div>
            <h3 className="mb-[0.6rem] mt-[1.15rem] text-[1.02rem] font-bold tracking-[-0.02em] text-white">
              {EXPERIENCE_CARDS[5].title}
            </h3>
            <p className="m-0 text-[0.88rem] leading-[1.75] text-[rgba(226,235,255,0.8)]">
              {EXPERIENCE_CARDS[5].description}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}