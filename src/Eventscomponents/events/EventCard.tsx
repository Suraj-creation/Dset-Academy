// src/components/events/EventCard.tsx

import { useMemo } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
  GalleryEvent, ENTERPRISE_EASE, EVENT_THEME_CLASS_MAP,
  getCoverMedia, getEventType, formatEventDate, getEventSummary,
} from "./types";

const FADE_UP: Variants = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

interface EventCardProps {
  event: GalleryEvent;
  index: number;
}

export default function EventCard({ event, index }: EventCardProps) {
  const type = getEventType(event.title);
  const theme = EVENT_THEME_CLASS_MAP[type];
  const coverMedia = useMemo(() => getCoverMedia(event), [event]);
  const { day, month, year, label } = formatEventDate(event.date);
  const imageCount = event.media.filter((item) => item.type === "image").length;
  const videoCount = event.media.filter((item) => item.type === "video").length;

  return (
    <motion.article
      variants={FADE_UP}
      transition={{ duration: 0.68, delay: index * 0.05, ease: ENTERPRISE_EASE }}
      className="event-card group relative overflow-hidden rounded-[22px] border border-[rgba(204,216,233,0.82)] bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(243,247,253,0.68))] shadow-[0_18px_42px_rgba(0,31,63,0.08)] backdrop-blur-[20px] transition-[transform,box-shadow,border-color] duration-[550ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] [will-change:transform] hover:translate-y-[-5px] hover:border-[rgba(134,173,255,0.62)] hover:shadow-[0_24px_52px_rgba(0,31,63,0.12),0_0_0_1px_rgba(134,173,255,0.18)] max-sm:rounded-[18px]"
    >
      <div className="relative h-40 overflow-hidden bg-[linear-gradient(135deg,rgba(0,31,63,0.08),rgba(123,156,255,0.16))] sm:h-44">
        {coverMedia ? (
          <>
            {coverMedia.type === "video" ? (
              <video
                className="event-card-media block h-full w-full object-cover transition-transform duration-[850ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.08]"
                src={coverMedia.url}
                muted
                playsInline
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="event-card-media block h-full w-full object-cover transition-transform duration-[850ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.08]"
                src={coverMedia.url}
                alt={event.title}
                loading="lazy"
              />
            )}
            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,10,20,0.72)_0%,rgba(0,10,20,0.18)_44%,transparent_72%)]" />
          </>
        ) : (
          <div className="event-card-media h-full w-full bg-[radial-gradient(circle_at_32%_24%,rgba(123,156,255,0.38),transparent_26%),linear-gradient(135deg,rgba(0,31,63,0.88),rgba(0,43,87,0.82))] transition-transform duration-[850ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.08]" />
        )}

        <div className={`pointer-events-none absolute inset-0 ${theme.cardGlow}`} />

        <div className="absolute left-3 top-3 z-[1] flex flex-wrap gap-2 sm:left-4 sm:top-4">
          <span className="rounded-full border border-[rgba(255,255,255,0.16)] bg-[rgba(255,255,255,0.14)] px-3 py-[0.4rem] text-[0.66rem] font-extrabold uppercase tracking-[0.08em] text-white backdrop-blur-[14px] sm:text-[0.68rem]">
            {type}
          </span>
        </div>

        {(imageCount > 0 || videoCount > 0) && (
          <div className="absolute right-3 top-3 z-[1] flex flex-wrap justify-end gap-2 sm:right-4 sm:top-4">
            {imageCount > 0 && (
              <span className="rounded-full bg-[rgba(0,0,0,0.42)] px-2.5 py-[0.38rem] text-[0.66rem] font-bold text-white backdrop-blur-[14px] sm:text-[0.68rem]">
                {imageCount} Photos
              </span>
            )}
            {videoCount > 0 && (
              <span className="rounded-full bg-[rgba(0,0,0,0.42)] px-2.5 py-[0.38rem] text-[0.66rem] font-bold text-white backdrop-blur-[14px] sm:text-[0.68rem]">
                {videoCount} Videos
              </span>
            )}
          </div>
        )}
      </div>

      <div className="px-3.5 pb-3.5 pt-3.5 sm:px-4 sm:pb-4 sm:pt-4">
        <div className="mb-2.5 flex items-center gap-2.5">
          <div className={`min-w-[46px] rounded-[14px] border px-1.5 py-1.5 text-center sm:min-w-[50px] ${theme.dateBg} ${theme.dateBorder}`}>
            <div className={`text-[1rem] font-black leading-none sm:text-[1.08rem] ${theme.accentText}`}>{day}</div>
            <div className="mt-1 text-[0.58rem] font-extrabold uppercase tracking-[0.12em] text-[#7890ad] sm:text-[0.62rem]">{month}</div>
          </div>
          <div>
            <div className="text-[0.66rem] font-extrabold uppercase tracking-[0.12em] text-[#7b8ea8] sm:text-[0.68rem]">{year}</div>
            <div className="mt-1 text-[0.74rem] font-semibold text-[#5d7391] sm:text-[0.78rem]">{label}</div>
          </div>
        </div>

        <h3 className="m-0 text-[0.98rem] font-extrabold leading-[1.25] tracking-[-0.01em] text-[#001f3f] sm:text-[1.02rem]">
          {event.title}
        </h3>

        <p className="mb-3 mt-2.5 overflow-hidden text-[0.8rem] leading-[1.65] text-[#647993] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] sm:text-[0.84rem]">
          {getEventSummary(event)}
        </p>

        <Link
          href={`/events/${event.id}`}
          className="inline-flex min-h-[36px] items-center justify-center rounded-full border border-[rgba(189,205,228,0.9)] bg-[rgba(255,255,255,0.88)] px-3.5 py-[0.65rem] text-[0.72rem] font-extrabold tracking-[0.04em] text-[#001f3f] no-underline shadow-[0_10px_24px_rgba(0,31,63,0.06)] sm:min-h-[38px] sm:text-[0.74rem]"
        >
          View Gallery
        </Link>
      </div>
    </motion.article>
  );
}