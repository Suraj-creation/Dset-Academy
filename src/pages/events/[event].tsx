// src/pages/events/[event].tsx

import React, { useEffect } from "react";
import { GetStaticPaths, GetStaticProps } from "next";
import { useState, useCallback, useMemo } from "react";
import Layout from "@/components/layout/Layout";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { GalleryEvent, MediaFilter, MediaItem, SECTION_HEADING_BASE_CLASS, SECTION_HEADING_GRADIENT_CLASS } from "@/EventsDetailscomponents/DetailsEvent/types";
import { getGalleryEvents, getGalleryEventById } from "@/lib/events.server";
import { useSlideshow } from "@/EventsDetailscomponents/DetailsEvent/hooks";
import EventHeroSection from "@/EventsDetailscomponents/DetailsEvent/EventHeroSection";
import AboutEventSection from "@/EventsDetailscomponents/DetailsEvent/AboutEventSection";
import ExperienceSection from "@/EventsDetailscomponents/DetailsEvent/ExperienceSection";
import KeyHighlightsSection from "@/EventsDetailscomponents/DetailsEvent/KeyHighlightsSection";
import FilterTabs from "@/EventsDetailscomponents/DetailsEvent/FilterTabs";
import MediaGrid from "@/EventsDetailscomponents/DetailsEvent/MediaGrid";
import Lightbox from "@/EventsDetailscomponents/DetailsEvent/Lightbox";

const FADE_UP: Variants = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } };
const INITIAL_COUNT = 4;

interface Props {
  event: GalleryEvent;
}

export default function EventDetailPage({ event }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<MediaFilter>("all");
  const [showAll, setShowAll] = useState(false);

  const touchStartRef = React.useRef<{ x: number; y: number } | null>(null);

  const filteredMedia = useMemo<MediaItem[]>(() => {
    if (!event) return [];
    if (filter === "all") return event.media;
    return event.media.filter((m) => m.type === filter);
  }, [event, filter]);

  const imageCount = useMemo(() => event?.media.filter((m) => m.type === "image").length ?? 0, [event]);
  const videoCount = useMemo(() => event?.media.filter((m) => m.type === "video").length ?? 0, [event]);

  const visibleMedia = useMemo(
    () => (showAll ? filteredMedia : filteredMedia.slice(0, INITIAL_COUNT)),
    [filteredMedia, showAll]
  );
  const remainingCount = filteredMedia.length - INITIAL_COUNT;

  useEffect(() => { setShowAll(false); setLightboxIndex(null); }, [filter]);

  // Slideshow
  const handleSlideshowFrame = useCallback((setter: (i: number | null) => number | null) => { setLightboxIndex(setter); }, []);
  const { isRunning: isSlideshowRunning, start: startSlideshow, stop: stopSlideshow } = useSlideshow({ total: filteredMedia.length, onFrame: handleSlideshowFrame });

  const handleSlideshowToggle = useCallback(() => {
    if (isSlideshowRunning) { stopSlideshow(); }
    else { if (lightboxIndex === null) setLightboxIndex(0); startSlideshow(); }
  }, [isSlideshowRunning, lightboxIndex, startSlideshow, stopSlideshow]);

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") { setLightboxIndex(null); stopSlideshow(); }
      if (e.key === "ArrowRight") setLightboxIndex((i) => i !== null ? Math.min(i + 1, filteredMedia.length - 1) : null);
      if (e.key === "ArrowLeft") setLightboxIndex((i) => (i !== null ? Math.max(i - 1, 0) : null));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIndex, filteredMedia.length, stopSlideshow]);

  // Share
  const handleWhatsApp = useCallback(() => {
    if (!event) return;
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out ${event.title} at this event!`);
    window.open(`https://wa.me/?text=${text}%20${url}`, "_blank");
  }, [event]);

  // Lightbox handlers
  const handleLightboxClose = useCallback(() => { setLightboxIndex(null); stopSlideshow(); }, [stopSlideshow]);
  const handleLightboxPrev = useCallback(() => { setLightboxIndex((i) => (i !== null ? Math.max(i - 1, 0) : null)); }, []);
  const handleLightboxNext = useCallback(() => { setLightboxIndex((i) => i !== null ? Math.min(i + 1, filteredMedia.length - 1) : null); }, [filteredMedia.length]);

  // Touch swipe
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartRef.current.y);
    if (Math.abs(dx) > 50 && dy < 60) {
      if (dx < 0) handleLightboxNext();
      else handleLightboxPrev();
    }
    touchStartRef.current = null;
  }, [handleLightboxNext, handleLightboxPrev]);

  const currentMedia = lightboxIndex !== null ? filteredMedia[lightboxIndex] ?? null : null;

  const formattedDate = new Date(event.date).toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <Layout
      title={`${event.title} | Events | DSeT`}
      description={event.description ?? `Photos and videos from ${event.title}`}
    >
      <>
        <div
          className="min-h-[80vh] bg-[linear-gradient(180deg,#121b30_0%,#101a2e_26%,#15284b_58%,#0f1b34_100%)]"
          onTouchStart={lightboxIndex !== null ? handleTouchStart : undefined}
          onTouchEnd={lightboxIndex !== null ? handleTouchEnd : undefined}
        >
          {/* ── Sections ── */}
          <EventHeroSection
            event={event} formattedDate={formattedDate}
            imageCount={imageCount} videoCount={videoCount}
            onWhatsApp={handleWhatsApp}
          />
          <AboutEventSection event={event} />
          <ExperienceSection />
          <KeyHighlightsSection event={event} />

          {/* ── Media Section header ── */}
          <section id="event-media" className="bg-[linear-gradient(180deg,#0e1b33_0%,#10213f_100%)] pt-20">
            <div className="mx-auto max-w-7xl px-6 sm:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
              >
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5e17ea]">Event Media</p>
                  <h2 className={`${SECTION_HEADING_BASE_CLASS} mt-4 text-white`}>
                    Explore the full{" "}
                    <span className={SECTION_HEADING_GRADIENT_CLASS}>event media collection</span>
                  </h2>
                  <p className="mt-4 text-base leading-8 text-white/70">
                    Browse photos and videos captured across keynote moments, showcases, conversations, and event storytelling highlights.
                  </p>
                </div>
                {event.media.length > 0 && (
                  <div className="w-full max-w-xl">
                    <FilterTabs
                      filter={filter} imageCount={imageCount} videoCount={videoCount}
                      totalCount={event.media.length} isSlideshowRunning={isSlideshowRunning}
                      onFilterChange={setFilter} onSlideshowToggle={handleSlideshowToggle}
                    />
                  </div>
                )}
              </motion.div>
            </div>
          </section>

          {/* ── Media Grid ── */}
          <section className="bg-[linear-gradient(180deg,#0e1b33_0%,#10213f_100%)] pb-20">
            <div className="mx-auto max-w-[1400px] px-4 pt-2 sm:px-8">
              {filteredMedia.length === 0 ? (
                <div className="px-8 py-20 text-center text-[0.875rem] text-white/60">
                  <span className="mb-[14px] block text-[32px] opacity-30 text-white/70">◈</span>
                  No media found.
                </div>
              ) : (
                <motion.div
                  variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
                  initial="hidden"
                  animate="visible"
                >
                  <MediaGrid items={visibleMedia} eventTitle={event.title} onItemClick={setLightboxIndex} />
                </motion.div>
              )}

              {/* ── Explore More / Show Less button ── */}
              {filteredMedia.length > INITIAL_COUNT && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="mt-10 flex justify-center"
                >
                  <button
                    onClick={() => setShowAll((prev) => !prev)}
                    className="group inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/8 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-xl transition-all duration-300 hover:border-[#1e90ff]/50 hover:bg-[#1e90ff]/10 hover:text-[#b9dcff]"
                  >
                    {showAll ? (
                      <>
                        <span>Show Less</span>
                        <span className="text-[0.8rem] transition-transform duration-300 group-hover:-translate-y-0.5">↑</span>
                      </>
                    ) : (
                      <>
                        <span>Explore {remainingCount} More {remainingCount === 1 ? "Photo" : "Photos"}</span>
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1e90ff]/20 text-[0.7rem] font-bold text-[#7ec8ff]">
                          {remainingCount}
                        </span>
                        <span className="text-[0.8rem] transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </div>
          </section>
        </div>

        {/* ── Lightbox ── */}
        <AnimatePresence>
          {currentMedia !== null && (
            <Lightbox
              item={currentMedia} index={lightboxIndex!} total={filteredMedia.length}
              isSlideshowRunning={isSlideshowRunning}
              onClose={handleLightboxClose} onPrev={handleLightboxPrev}
              onNext={handleLightboxNext} onSlideshowToggle={handleSlideshowToggle}
            />
          )}
        </AnimatePresence>

      </>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const events = await getGalleryEvents();
  const paths = events.map((e) => ({ params: { event: e.id } }));
  return { paths, fallback: "blocking" };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const event = await getGalleryEventById(params?.event as string);
  if (!event) return { notFound: true };
  return { props: { event: JSON.parse(JSON.stringify(event)) }, revalidate: 300 };
};
