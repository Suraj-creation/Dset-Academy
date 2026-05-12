// src/components/gallery/KeyHighlightsSection.tsx

import { motion } from "framer-motion";
import { 
  GalleryEvent, 
  KEY_HIGHLIGHTS, 
  SECTION_HEADING_BASE_CLASS, 
  SECTION_HEADING_SPLIT_CLASS 
} from "./types";

import { Star, Users, Award, Camera } from "lucide-react";

interface KeyHighlightsSectionProps {
  event: GalleryEvent;
}

const highlightIcons = [Star, Users, Award, Camera];

export default function KeyHighlightsSection({ event }: KeyHighlightsSectionProps) {
  return (
    <section className="border-b border-white/8 bg-[linear-gradient(180deg,#101f3b_0%,#15284b_100%)] py-20">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 max-w-2xl"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5e17ea]">
            Key Highlights
          </p>
          <h2 className={`${SECTION_HEADING_BASE_CLASS} text-[#ff851b]`}>
            Moments that defined the{" "}
            <span className={SECTION_HEADING_SPLIT_CLASS}>event experience</span>
          </h2>
          <p className="mt-4 text-base leading-8 text-white/70">
            A curated view of the major themes, interactions, and showcase moments that shaped this event.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {KEY_HIGHLIGHTS.map((item, index) => {
            const IconComponent = highlightIcons[index];
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: index * 0.07 }}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl"
              >
                {/* Updated Icon */}
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5e17ea] to-[#1e90ff] text-white shadow-lg shadow-[#1e90ff]/10">
                  <IconComponent size={26} strokeWidth={2.75} />
                </div>

                <h3 className="mt-6 text-xl font-bold tracking-[-0.02em] text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/65">{item.text}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.18 }}
          className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          {[
            { label: "Media Captured", value: event.media.length, unit: "assets", color: "text-[#1e90ff]" },
            { label: "Photos", value: event.media.filter((m) => m.type === "image").length, unit: "images", color: "text-[#5e17ea]" },
            { label: "Videos", value: event.media.filter((m) => m.type === "video").length, unit: "recordings", color: "text-[#ff851b]" },
          ].map((stat) => (
            <div 
              key={stat.label} 
              className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(0,31,63,0.72),rgba(8,32,63,0.92))] px-6 py-5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/45">{stat.label}</p>
              <div className="mt-3 flex items-end gap-2">
                <span className={`text-4xl font-extrabold tracking-[-0.02em] ${stat.color}`}>{stat.value}</span>
                <span className="pb-1 text-xs uppercase tracking-[0.14em] text-white/35">{stat.unit}</span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}