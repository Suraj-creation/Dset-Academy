// src/components/events/HeroSection.tsx

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ENTERPRISE_EASE, PARTICLE_POSITIONS } from "./types";

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const STAGGER: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

interface HeroSectionProps {
  loading: boolean;
  eventCount: number;
  photoCount: number;
  videoCount: number;
}

export default function HeroSection({ loading, eventCount, photoCount, videoCount }: HeroSectionProps) {
  const stats = [
    { label: "Events", value: eventCount },
    { label: "Photos", value: photoCount },
    { label: "Videos", value: videoCount },
  ];

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(135deg,#001f3f_0%,#002b57_52%,#001f3f_100%)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(30,144,255,0.28),transparent_34%),radial-gradient(circle_at_82%_24%,rgba(255,133,27,0.14),transparent_28%),radial-gradient(circle_at_55%_78%,rgba(94,23,234,0.16),transparent_26%)] [animation:heroGlow_14s_ease-in-out_infinite_alternate]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.9),transparent)]" />

      {PARTICLE_POSITIONS.map((particle, index) => (
        <span
          key={`${particle}-${index}`}
          className={`pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-[rgba(255,255,255,0.68)] opacity-60 shadow-[0_0_26px_rgba(123,156,255,0.8)] [animation-name:floatParticle] [animation-iteration-count:infinite] [animation-timing-function:ease-in-out] ${particle}`}
        />
      ))}

      <div className="gallery-hero-shell relative z-[1] mx-auto max-w-[1280px] px-8 pb-[6.5rem] pt-[7.5rem] max-[960px]:px-5 max-[960px]:pb-16 max-[960px]:pt-24 max-sm:px-4 max-sm:pb-12 max-sm:pt-[5.25rem]">
        <motion.div
          className="gallery-hero-grid grid items-end gap-10 [grid-template-columns:minmax(0,1.15fr)_minmax(320px,0.85fr)] max-[960px]:items-start max-[960px]:gap-6 max-[960px]:[grid-template-columns:minmax(0,1fr)] max-sm:gap-5"
          variants={STAGGER}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="gallery-hero-copy max-[960px]:order-1"
            variants={FADE_UP}
            transition={{ duration: 0.8, ease: ENTERPRISE_EASE }}
          >
            <div className="inline-flex items-center gap-2.5 rounded-full border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.08)] px-[0.85rem] py-[0.55rem] text-[0.72rem] font-bold text-[rgba(255,255,255,0.8)] backdrop-blur-[14px]">
              DSeT Consulting Event Ecosystem
            </div>

            <h1 className="mt-6 mb-5 max-w-[760px] text-white text-[clamp(2.35rem,4.8vw,4.6rem)] leading-[1.05] font-bold tracking-[-0.02em]">
              Enterprise events
              <br />
              engineered for
              <span className="mt-[10px] block bg-[linear-gradient(120deg,#ff851b_0%,#1e90ff_48%,#5e17ea_100%)] bg-clip-text text-transparent">
                innovation momentum
              </span>
            </h1>

            <p className="m-0 max-w-[620px] text-[1.06rem] leading-[1.8] text-[rgba(231,240,255,0.74)]">
              Explore DSeT&apos;s event platform spanning AI showcases, executive
              roundtables, partner launches, and immersive enterprise experiences
              designed to turn conversations into transformation programs.
            </p>

            <div className="mt-7 flex flex-wrap gap-[14px]">
              <Link
                href="#featured-event"
                className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-white px-6 py-[0.95rem] text-[0.86rem] font-extrabold tracking-[0.02em] text-[#001f3f] no-underline shadow-[0_20px_44px_rgba(0,0,0,0.16)] transition-[transform,box-shadow] duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-[0_24px_52px_rgba(0,0,0,0.18)]"
              >
                Explore Featured Event
              </Link>
              <Link
                href="/contact"
                className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-[rgba(255,255,255,0.16)] bg-[rgba(255,255,255,0.08)] px-6 py-[0.95rem] text-[0.86rem] font-bold tracking-[0.02em] text-white no-underline backdrop-blur-[16px] transition-[transform,border-color] duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-[rgba(255,255,255,0.28)]"
              >
                Partner With DSeT
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="gallery-hero-side grid content-start gap-5 self-start max-[960px]:order-2"
            variants={FADE_UP}
            transition={{ duration: 0.95, delay: 0.08, ease: ENTERPRISE_EASE }}
          >
            <div className="rounded-[24px] border border-[rgba(255,255,255,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.06))] p-5 shadow-[0_20px_54px_rgba(0,0,0,0.18)] backdrop-blur-[22px]">
              <div className="text-[0.78rem] font-bold uppercase tracking-[0.12em] text-[rgba(255,255,255,0.55)]">
                Platform Signal
              </div>
              <p className="mt-4 text-[1.15rem] leading-[1.7] text-white">
                Designed with the depth of an enterprise showcase, not a simple photo archive.
              </p>
            </div>

            <div className="gallery-hero-stats grid max-w-[500px] auto-rows-min grid-cols-3 items-start gap-3 max-md:max-w-[480px] max-sm:max-w-none max-sm:grid-cols-1 max-sm:gap-2.5">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="h-fit self-start rounded-[16px] border border-[rgba(255,255,255,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.05))] px-3 py-2.5 shadow-[0_14px_28px_rgba(0,0,0,0.12)] backdrop-blur-[18px]"
                >
                  <div className="text-[clamp(1.18rem,1.9vw,1.55rem)] font-black leading-none tracking-[-0.04em] text-white">
                    {loading ? "--" : stat.value}
                  </div>
                  <div className="mt-1 text-[0.58rem] font-bold uppercase tracking-[0.12em] text-[rgba(255,255,255,0.5)]">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}