// src/components/gallery/types.ts (EventsDetailscomponents\Details)
// ─── Frontend-only types & constants ──────────────────────────────────────────
// GalleryEvent aur MediaItem events.server.ts se import karo — duplicate mat karo!

export type { GalleryEvent, MediaItem } from "@/lib/events.server";

// ─── Frontend-only Types ──────────────────────────────────────────────────────

export type MediaFilter = "all" | "image" | "video";

export const BATCH = 12;
export const SLIDESHOW_INTERVAL = 3200;

export const SECTION_HEADING_BASE_CLASS =
  "text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.02em] leading-tight";

export const SECTION_HEADING_GRADIENT_CLASS =
  "mt-4 block bg-[linear-gradient(120deg,#ff851b_0%,#1e90ff_48%,#5e17ea_100%)] bg-clip-text text-transparent";

export const SECTION_HEADING_SPLIT_CLASS =
  "bg-gradient-to-r from-[#5e17ea] to-[#1e90ff] bg-clip-text text-transparent";

export const EXPERIENCE_BLOCKS = [
  {  title: "AI Demos", text: "See solution walkthroughs, live demonstrations, and product storytelling tailored for enterprise audiences." },
  {  title: "Expert Talks", text: "Hear from strategists, architects, and transformation leaders unpacking real delivery lessons." },
  {  title: "Networking", text: "Create space for meaningful conversations with partners, customers, and technology decision-makers." },
  {  title: "Industry Insight", text: "Capture trend signals, capability launches, and strategic themes shaping the event narrative." },
] as const;

export const KEY_HIGHLIGHTS = [
  {  title: "AI demos", text: "Live platform walk-throughs and practical use cases that connect innovation with business outcomes." },
  { title: "Expert talks", text: "Keynotes, roundtables, and strategic conversations led by enterprise practitioners and advisors." },
  {  title: "Networking", text: "High-value opportunities to engage with stakeholders, partners, and future collaborators." },
  {title: "Key moments", text: "Launches, showcase moments, and curated highlights captured across photo and video media." },
] as const;

// ─── Helper ───────────────────────────────────────────────────────────────────

import type { GalleryEvent } from "@/lib/events.server";

export function getLeadMedia(event: GalleryEvent) {
  return event.media[0] ?? null;
}