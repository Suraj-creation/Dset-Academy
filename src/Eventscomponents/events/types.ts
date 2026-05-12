// src/components/events/types.ts
// ─── Frontend-only types & constants ──────────────────────────────────────────
// GalleryEvent aur MediaItem events.server.ts se import karo — duplicate mat karo!

export type { GalleryEvent, MediaItem } from "@/lib/events.server";

// ─── Frontend-only Types ──────────────────────────────────────────────────────

export type EventType =
  | "Summit"
  | "Conference"
  | "Product Launch"
  | "Workshop"
  | "Webinar"
  | "Exhibition"
  | "Awards"
  | "Event";

export type FilterType = "all" | EventType;

// ─── Constants ────────────────────────────────────────────────────────────────

export const EVENT_TYPE_MAP: Record<string, EventType> = {
  summit: "Summit",
  conference: "Conference",
  conf: "Conference",
  launch: "Product Launch",
  workshop: "Workshop",
  webinar: "Webinar",
  expo: "Exhibition",
  exhibition: "Exhibition",
  award: "Awards",
};

export const EVENT_THEME_CLASS_MAP: Record<
  EventType,
  {
    featuredGlow: string;
    cardGlow: string;
    pill: string;
    pillBorder: string;
    dateBg: string;
    dateBorder: string;
    accentText: string;
  }
> = {
  Summit: {
    featuredGlow: "bg-[radial-gradient(circle_at_18%_50%,rgba(94,23,234,0.22),transparent_30%)]",
    cardGlow: "bg-[radial-gradient(circle_at_14%_18%,rgba(94,23,234,0.24),transparent_20%)]",
    pill: "bg-[#5e17ea22]", pillBorder: "border-[#5e17ea4d]",
    dateBg: "bg-[#5e17ea14]", dateBorder: "border-[#5e17ea30]",
    accentText: "text-[#5e17ea]",
  },
  Conference: {
    featuredGlow: "bg-[radial-gradient(circle_at_18%_50%,rgba(30,144,255,0.22),transparent_30%)]",
    cardGlow: "bg-[radial-gradient(circle_at_14%_18%,rgba(30,144,255,0.24),transparent_20%)]",
    pill: "bg-[#1e90ff22]", pillBorder: "border-[#1e90ff4d]",
    dateBg: "bg-[#1e90ff14]", dateBorder: "border-[#1e90ff30]",
    accentText: "text-[#1e90ff]",
  },
  "Product Launch": {
    featuredGlow: "bg-[radial-gradient(circle_at_18%_50%,rgba(255,133,27,0.22),transparent_30%)]",
    cardGlow: "bg-[radial-gradient(circle_at_14%_18%,rgba(255,133,27,0.24),transparent_20%)]",
    pill: "bg-[#ff851b22]", pillBorder: "border-[#ff851b4d]",
    dateBg: "bg-[#ff851b14]", dateBorder: "border-[#ff851b30]",
    accentText: "text-[#ff851b]",
  },
  Workshop: {
    featuredGlow: "bg-[radial-gradient(circle_at_18%_50%,rgba(30,144,255,0.18),transparent_30%)]",
    cardGlow: "bg-[radial-gradient(circle_at_14%_18%,rgba(30,144,255,0.22),transparent_20%)]",
    pill: "bg-[#1e90ff22]", pillBorder: "border-[#1e90ff4d]",
    dateBg: "bg-[#1e90ff14]", dateBorder: "border-[#1e90ff30]",
    accentText: "text-[#1e90ff]",
  },
  Webinar: {
    featuredGlow: "bg-[radial-gradient(circle_at_18%_50%,rgba(94,23,234,0.2),transparent_30%)]",
    cardGlow: "bg-[radial-gradient(circle_at_14%_18%,rgba(94,23,234,0.22),transparent_20%)]",
    pill: "bg-[#5e17ea22]", pillBorder: "border-[#5e17ea4d]",
    dateBg: "bg-[#5e17ea14]", dateBorder: "border-[#5e17ea30]",
    accentText: "text-[#5e17ea]",
  },
  Exhibition: {
    featuredGlow: "bg-[radial-gradient(circle_at_18%_50%,rgba(30,144,255,0.2),transparent_30%)]",
    cardGlow: "bg-[radial-gradient(circle_at_14%_18%,rgba(30,144,255,0.22),transparent_20%)]",
    pill: "bg-[#1e90ff22]", pillBorder: "border-[#1e90ff4d]",
    dateBg: "bg-[#1e90ff14]", dateBorder: "border-[#1e90ff30]",
    accentText: "text-[#1e90ff]",
  },
  Awards: {
    featuredGlow: "bg-[radial-gradient(circle_at_18%_50%,rgba(255,133,27,0.2),transparent_30%)]",
    cardGlow: "bg-[radial-gradient(circle_at_14%_18%,rgba(255,133,27,0.22),transparent_20%)]",
    pill: "bg-[#ff851b22]", pillBorder: "border-[#ff851b4d]",
    dateBg: "bg-[#ff851b14]", dateBorder: "border-[#ff851b30]",
    accentText: "text-[#ff851b]",
  },
  Event: {
    featuredGlow: "bg-[radial-gradient(circle_at_18%_50%,rgba(0,31,63,0.18),transparent_30%)]",
    cardGlow: "bg-[radial-gradient(circle_at_14%_18%,rgba(0,31,63,0.16),transparent_20%)]",
    pill: "bg-[#001f3f22]", pillBorder: "border-[#001f3f30]",
    dateBg: "bg-[#001f3f10]", dateBorder: "border-[#001f3f20]",
    accentText: "text-[#001f3f]",
  },
};

export const ENTERPRISE_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const PARTICLE_POSITIONS = [
  "top-[14%] left-[10%] [animation-delay:0s] [animation-duration:11s]",
  "top-[28%] left-[78%] [animation-delay:1.4s] [animation-duration:13s]",
  "top-[68%] left-[12%] [animation-delay:2.2s] [animation-duration:12s]",
  "top-[72%] left-[84%] [animation-delay:0.8s] [animation-duration:15s]",
  "top-[44%] left-[58%] [animation-delay:1.8s] [animation-duration:10s]",
  "top-[18%] left-[54%] [animation-delay:2.8s] [animation-duration:14s]",
] as const;

export const EXPERIENCE_CARDS = [
  { title: "AI Innovation", description: "See production AI platforms, automation programs, and emerging enterprise use cases translated into real business impact." },
  { title: "Industry Leaders", description: "Hear from CXOs, architects, and transformation leaders shaping the next generation of digital operating models." },
  { title: "Live Demos", description: "Experience solution walk-throughs, product launches, and hands-on showcases built for enterprise-scale outcomes." },
  { title: "Strategic Networking", description: "Build relationships with partners, customers, and decision-makers across the AI, cloud, and data ecosystem." },
  { title: "Actionable Insights", description: "Leave with research-backed perspectives, delivery lessons, and roadmap signals you can carry into planning cycles." },
  { title: "Executive Experience", description: "Discover curated event environments designed to feel premium, focused, and aligned to enterprise buying journeys." },
] as const;

// ─── Helper Functions ─────────────────────────────────────────────────────────

import type { GalleryEvent } from "@/lib/events.server";

export function getEventType(title: string): EventType {
  const lower = title.toLowerCase();
  for (const [keyword, type] of Object.entries(EVENT_TYPE_MAP)) {
    if (lower.includes(keyword)) return type;
  }
  return "Event";
}

export function formatEventDate(dateStr: string) {
  const date = new Date(dateStr);
  return {
    day: date.toLocaleDateString("en-IN", { day: "2-digit" }),
    month: date.toLocaleDateString("en-IN", { month: "short" }),
    year: date.toLocaleDateString("en-IN", { year: "numeric" }),
    label: date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
  };
}

export function getCoverMedia(event: GalleryEvent) {
  if (event.coverMediaId) {
    return event.media.find((item) => item.id === event.coverMediaId) ?? event.media[0] ?? null;
  }
  return event.media[0] ?? null;
}

export function getEventSummary(event: GalleryEvent): string {
  if (event.description?.trim()) return event.description.trim();
  const type = getEventType(event.title);
  return `Explore highlights, sessions, and media from this ${type.toLowerCase()} in DSeT Consulting's enterprise event ecosystem.`;
}