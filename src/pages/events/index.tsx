// src/pages/events/index.tsx

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { GetStaticProps } from "next";
import Layout from "@/components/layout/Layout";
import { motion, Variants } from "framer-motion";
import { FilterType, GalleryEvent, getCoverMedia, getEventType } from "@/Eventscomponents/events/types";
import HeroSection from "@/Eventscomponents/events/HeroSection";
import FeaturedEventSection from "@/Eventscomponents/events/FeaturedEventSection";
import ExperienceSection from "@/Eventscomponents/events/ExperienceSection";
import FilterBar from "@/Eventscomponents/events/FilterBar";
import EmptyState from "@/Eventscomponents/events/EmptyState";
import EventCard from "@/Eventscomponents/events/EventCard";
import { getGalleryEvents } from "@/lib/events.server";


const ENTERPRISE_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const STAGGER: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

interface Props {
  events: GalleryEvent[];
}

export default function EventsPage({ events }: Props) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce: update debouncedSearch 300ms after typing stops
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [search]);

  const featuredEvent = useMemo(() => {
    const explicitFeatured = events.find((event) => event.isFeatured);
    if (explicitFeatured) return explicitFeatured;

    const eventWithMedia = events.find((event) => getCoverMedia(event));
    return eventWithMedia ?? events[0] ?? null;
  }, [events]);

  const eventTypes = useMemo(() => {
    const types = events.map((event) => getEventType(event.title));
    return ["all", ...Array.from(new Set(types))];
  }, [events]);

  const filtered = useMemo(() => {
    const loweredSearch = debouncedSearch.toLowerCase();
    return events.filter((event) => {
      const matchesFilter = filter === "all" || getEventType(event.title) === filter;
      const matchesSearch =
        event.title.toLowerCase().includes(loweredSearch) ||
        (event.description?.toLowerCase().includes(loweredSearch) ?? false);
      return matchesFilter && matchesSearch;
    });
  }, [events, filter, debouncedSearch]);

  const totalPhotos = useMemo(
    () => events.reduce((count, event) => count + event.media.filter((item) => item.type === "image").length, 0),
    [events]
  );

  const totalVideos = useMemo(
    () => events.reduce((count, event) => count + event.media.filter((item) => item.type === "video").length, 0),
    [events]
  );

  const handleFilterChange = useCallback((filterValue: FilterType) => setFilter(filterValue), []);
  const handleSearchChange = useCallback((searchValue: string) => setSearch(searchValue), []);
  const hasActiveFilters = filter !== "all" || debouncedSearch.length > 0;

  return (
    <Layout
      title="Events | DSeT Consulting"
      description="Explore DSeT Consulting's event ecosystem, featured showcases, conferences, summits, and launches."
      jsonLd={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Events — DSeT Consulting',
        url: 'https://dsetconsulting.com/events',
        description: "Explore DSeT Consulting's event ecosystem, featured showcases, conferences, summits, and launches.",
        provider: { '@type': 'Organization', name: 'DSeT Consulting', url: 'https://dsetconsulting.com' },
      }}
    >
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes heroGlow {
          0% { transform: scale(1) translate3d(0, 0, 0); opacity: 0.88; }
          100% { transform: scale(1.08) translate3d(0, -12px, 0); opacity: 1; }
        }
        @keyframes floatParticle {
          0% { transform: translate3d(0, 0, 0) scale(0.96); opacity: 0.24; }
          50% { transform: translate3d(0, -20px, 0) scale(1.06); opacity: 0.72; }
          100% { transform: translate3d(0, 0, 0) scale(0.96); opacity: 0.24; }
        }
      `}</style>

      <div className="bg-[linear-gradient(180deg,#121b30_0%,#101a2e_26%,#15284b_58%,#0f1b34_100%)]">

        {/* ── Hero ── */}
        <HeroSection loading={false} eventCount={events.length} photoCount={totalPhotos} videoCount={totalVideos} />

        {/* ── Featured Event ── */}
        <FeaturedEventSection event={featuredEvent} />

        {/* ── Experience Section ── */}
        <ExperienceSection />

        {/* ── Filter Bar ── */}
        <FilterBar
          eventTypes={eventTypes}
          filter={filter}
          search={search}
          filteredCount={filtered.length}
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearchChange}
        />

        {/* ── Events Grid ── */}
        <section className="px-8 pb-24 pt-10 max-sm:px-4">
          <div className="mx-auto max-w-[1280px] rounded-[36px] border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(135deg,rgba(7,50,95,0.92),rgba(0,31,63,0.96),rgba(31,47,143,0.9))] p-8 shadow-[0_30px_80px_rgba(0,18,45,0.24)] max-md:p-6">
            {filtered.length > 0 && (
              <div className="mb-[1.8rem] flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="text-[0.74rem] font-extrabold uppercase tracking-[0.16em] text-[#5e17ea]">Event Collection</div>
                  <h2 className="mt-3 text-white text-[clamp(1.8rem,3vw,2.6rem)] leading-[1.08] font-bold tracking-[-0.02em]">
                    {filter === "all" ? "Browse every event story" : `${filter} experiences`}
                  </h2>
                </div>
                <p className="m-0 max-w-[420px] text-[0.92rem] leading-[1.7] text-[rgba(226,235,255,0.78)]">
                  A collection of enterprise moments, keynote sessions, launches, and partner engagements captured across the DSeT ecosystem.
                </p>
              </div>
            )}

            {filtered.length === 0 && <EmptyState hasFilters={hasActiveFilters} />}

            {filtered.length > 0 && (
              <motion.div
                variants={STAGGER}
                initial="hidden"
                animate="visible"
                className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))] sm:gap-4 sm:[grid-template-columns:repeat(auto-fit,minmax(235px,1fr))] lg:[grid-template-columns:repeat(auto-fit,minmax(250px,1fr))]"
              >
                {filtered.map((event, index) => (
                  <EventCard key={event.id} event={event} index={index} />
                ))}
              </motion.div>
            )}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="px-8 pb-24 max-sm:px-4">
            <div className="relative mx-auto max-w-[1280px] overflow-hidden rounded-[34px] border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(135deg,#0b4276_0%,#06325f_52%,#1f2f8f_100%)] p-[2.6rem] shadow-[0_32px_90px_rgba(0,18,45,0.28)]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_22%,rgba(30,144,255,0.24),transparent_28%),radial-gradient(circle_at_85%_78%,rgba(94,23,234,0.18),transparent_24%),radial-gradient(circle_at_56%_16%,rgba(255,133,27,0.12),transparent_18%)]" />
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.75, ease: ENTERPRISE_EASE }}
                className="relative z-[1] flex flex-wrap items-center justify-between gap-6"
              >
                <div className="max-w-[620px]">
                  <div className="inline-flex rounded-full bg-[linear-gradient(90deg,#5e17ea,#1e90ff)] px-4 py-2 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-white shadow-[0_14px_28px_rgba(17,68,160,0.2)]">
                    Collaboration Opportunity
                  </div>
                  <h2 className="mt-5 mb-3 text-white text-[clamp(1.8rem,3vw,2.85rem)] leading-[1.08] font-bold tracking-[-0.02em]">
                    Ready to shape the next
                    <span className="block bg-[linear-gradient(120deg,#ff851b_0%,#1e90ff_48%,#5e17ea_100%)] bg-clip-text text-transparent">
                      enterprise event experience?
                    </span>
                  </h2>
                  <p className="m-0 text-[0.98rem] leading-[1.8] text-[rgba(230,238,255,0.72)]">
                    Partner with DSeT Consulting on AI showcases, technology launches, or executive forums built to move markets and relationships.
                  </p>
                </div>
                <Link
                  href="/contact"
                  className="inline-flex min-h-[54px] items-center justify-center rounded-full bg-white px-[1.45rem] py-[0.95rem] text-[0.86rem] font-extrabold tracking-[0.03em] text-[#001f3f] no-underline shadow-[0_20px_48px_rgba(0,0,0,0.16)]"
                >
                  Get In Touch
                </Link>
              </motion.div>
            </div>
          </section>
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  try {
    const events = await getGalleryEvents();
    return { props: { events: JSON.parse(JSON.stringify(events)) }, revalidate: 30 };
  } catch {
    return { props: { events: [] }, revalidate: 30 };
  }
};
