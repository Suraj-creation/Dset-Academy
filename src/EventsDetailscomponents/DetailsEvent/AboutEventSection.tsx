// src/components/gallery/AboutEventSection.tsx

import { motion } from "framer-motion";
import { GalleryEvent, SECTION_HEADING_BASE_CLASS, SECTION_HEADING_GRADIENT_CLASS } from "./types";

interface AboutEventSectionProps {
  event: GalleryEvent;
}

export default function AboutEventSection({ event }: AboutEventSectionProps) {
  return (
    <section className="border-b border-white/8 bg-[linear-gradient(180deg,#101f3b_0%,#15284b_100%)] py-20">
      <div className="mx-auto max-w-3xl px-6 text-center sm:px-8">
        <div className="rounded-[32px] border border-white/10 bg-[rgba(10,18,41,0.6)] p-8 shadow-2xl backdrop-blur-xl">
          <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5e17ea]">
            About the Event
          </p>
          <h2 className={`${SECTION_HEADING_BASE_CLASS} mt-4 text-white`}>
            An event story designed for{" "}
            <span className={SECTION_HEADING_GRADIENT_CLASS}>innovation momentum</span>
          </h2>
          <p className="mt-6 text-base leading-8 text-white/70 sm:text-lg">
            {event.description ??
              "This event brought together leaders, partners, and technology teams for a premium showcase of innovation, insight, and collaboration."}
          </p>
        </motion.div>
      </div>
    </div>
  </section>
  );
}