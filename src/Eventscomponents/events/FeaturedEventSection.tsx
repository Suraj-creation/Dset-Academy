// src/components/events/FeaturedEventSection.tsx

import Link from "next/link";
import { motion } from "framer-motion";
import {
  GalleryEvent,
  ENTERPRISE_EASE,
  EVENT_THEME_CLASS_MAP,
  getCoverMedia,
  getEventType,
  formatEventDate,
  getEventSummary,
} from "./types";

interface FeaturedEventSectionProps {
  event: GalleryEvent | null;
}

export default function FeaturedEventSection({
  event,
}: FeaturedEventSectionProps) {
  // ✅ Safety check
  if (!event) return null;

  const coverMedia = getCoverMedia(event);
  const type = getEventType(event.title || "");
  const theme = EVENT_THEME_CLASS_MAP[type];

  const { label } = formatEventDate(event.date || "");

  return (
    <section
      id="featured-event"
      className="relative z-[2] mx-auto mt-[-2.75rem] max-w-[1280px] px-8 max-sm:px-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.85, ease: ENTERPRISE_EASE }}
      >
        <Link
          href={`/events/${event.id}`}
          className="featured-event-card group relative grid min-h-[320px] sm:min-h-[420px] lg:min-h-[520px] [grid-template-columns:minmax(0,1fr)] overflow-hidden rounded-[36px] border border-[rgba(123,156,255,0.26)] bg-[linear-gradient(135deg,rgba(0,31,63,0.92),rgba(0,18,36,0.98))] no-underline shadow-[0_36px_90px_rgba(0,24,49,0.24)] transition-all duration-500 hover:translate-y-[-8px] hover:scale-[1.01]"
        >
          {/* ✅ MEDIA */}
          {coverMedia ? (
            coverMedia.type === "video" ? (
              <video
                className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition"
                src={coverMedia.url}
                muted
                autoPlay
                loop
                playsInline
              />
            ) : (
              <img
                className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition"
                src={coverMedia.url}
                alt={event.title}
              />
            )
          ) : (
            // ✅ fallback background
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-black" />
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,10,20,0.9)_0%,rgba(0,20,40,0.55)_42%,rgba(0,0,0,0.2)_100%)]" />
          <div className={`absolute inset-0 ${theme.featuredGlow}`} />

          {/* CONTENT */}
          <div className="relative z-[1] flex flex-col justify-between gap-4 p-4 sm:gap-7 sm:p-[2.4rem]">
            
            {/* Top Tags */}
            <div className="flex gap-2.5">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white">
                ⭐ Featured Event
              </span>

              <span className={`rounded-full px-3 py-1 text-xs text-white ${theme.pill}`}>
                {type}
              </span>
            </div>

            {/* Middle */}
            <div className="max-w-[620px]">
              <div className="mb-3 text-xs text-gray-300">
                {label}
              </div>

              <h2 className="text-white text-3xl font-bold">
                {event.title}
              </h2>

              <p className="mt-3 text-gray-300">
                {getEventSummary(event)}
              </p>
            </div>

            {/* Bottom */}
            <div className="flex items-center gap-4">
              <span className="bg-white text-black px-5 py-2 rounded-full text-sm font-semibold">
                Explore Event →
              </span>

              <span className="text-xs text-gray-400">
                Event storytelling experience
              </span>
            </div>

          </div>
        </Link>
      </motion.div>
    </section>
  );
}