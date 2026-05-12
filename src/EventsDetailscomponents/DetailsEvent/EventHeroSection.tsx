// src/components/gallery/EventHeroSection.tsx

import Link from "next/link";
import { motion } from "framer-motion";
import { GalleryEvent, getLeadMedia } from "./types";

interface EventHeroSectionProps {
  event: GalleryEvent;
  formattedDate: string;
  imageCount: number;
  videoCount: number;
  copied: boolean;
  onCopyLink: () => void;
  onWhatsApp: () => void;
}

export default function EventHeroSection({
  event,
  formattedDate,
  imageCount,
  videoCount,
  copied,
  onCopyLink,
  onWhatsApp,
}: EventHeroSectionProps) {
  const leadMedia = getLeadMedia(event);

  return (
    <section className="relative min-h-[56vw] sm:min-h-[60vh] overflow-hidden border-b border-white/10 bg-[#06111f]">
      <div className="absolute inset-0">
        {leadMedia ? (
          <>
            {leadMedia.type === "video" ? (
              <video src={leadMedia.url} autoPlay muted loop playsInline className="h-full w-full object-cover" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={leadMedia.url} alt={event.title} className="h-full w-full object-cover" />
            )}
          </>
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#001f3f] via-[#002b57] to-[#001f3f]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#020b16]/95 via-[#031225]/78 to-[#04182f]/48" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(94,23,234,0.28),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(30,144,255,0.22),transparent_24%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[56vw] sm:min-h-[60vh] max-w-7xl items-end px-4 py-8 sm:px-8 sm:py-16 lg:px-10">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-5 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[0.68rem] font-semibold tracking-[0.12em] text-white/80 backdrop-blur-xl"
          >
            <Link href="/events" className="text-white/80 no-underline transition hover:text-[#1e90ff]">
              All Events
            </Link>
            <span className="h-1 w-1 rounded-full bg-white/40" />
            <span>DSeT Event Experience</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="max-w-4xl text-3xl font-bold leading-[1.08] tracking-[-0.025em] text-white sm:text-4xl lg:text-6xl"
          >
            {event.title}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.12 }}
            className="mt-5 flex flex-wrap items-center gap-3"
          >
            <span className="rounded-full border border-[#1e90ff]/20 bg-[#1e90ff]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#b9dcff]">
              {formattedDate}
            </span>
            <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/75">
              {imageCount} Photos
            </span>
            <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/75">
              {videoCount} Videos
            </span>
          </motion.div>

          {event.description && (
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.18 }}
              className="mt-6 hidden max-w-2xl text-base leading-8 text-white/75 sm:block sm:text-lg"
            >
              {event.description}
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <button
              onClick={onCopyLink}
              className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-[#001f3f] shadow-xl transition hover:-translate-y-0.5"
            >
              {copied ? "Link Copied" : "Copy Event Link"}
            </button>
            <button
              onClick={onWhatsApp}
              className="hidden sm:inline-flex min-h-[48px] items-center justify-center rounded-full border border-white/15 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur-xl transition hover:border-[#1e90ff]/40 hover:text-[#b9dcff]"
            >
              Share on WhatsApp
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}