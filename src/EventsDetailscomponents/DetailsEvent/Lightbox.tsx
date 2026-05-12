// src/components/gallery/Lightbox.tsx

import { motion, Variants } from "framer-motion";
import { MediaItem } from "./types";

const FADE_UP: Variants = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } };
const FADE_IN: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };

interface LightboxProps {
  item: MediaItem;
  index: number;
  total: number;
  isSlideshowRunning: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSlideshowToggle: () => void;
}

export default function Lightbox({
  item,
  index,
  total,
  isSlideshowRunning,
  onClose,
  onPrev,
  onNext,
  onSlideshowToggle,
}: LightboxProps) {
  const hasPrev = index > 0;
  const hasNext = index < total - 1;

  return (
    <motion.div
      variants={FADE_IN}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={{ duration: 0.25 }}
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[rgba(0,0,0,0.96)]"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        variants={FADE_UP}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.28 }}
        className="relative"
      >
        {item.type === "video" ? (
          <video
            src={item.url}
            controls
            autoPlay
            className="block max-h-[80vh] max-w-[90vw] rounded-[6px] outline-none"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.url}
            alt=""
            className="block max-h-[80vh] max-w-[90vw] rounded-[6px]"
          />
        )}
      </motion.div>

      {/* Type badge */}
      <div
        className={`fixed left-1/2 top-[18px] z-[10001] -translate-x-1/2 rounded-[4px] border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${
          item.type === "video"
            ? "border-[#ff851b40] bg-[#ff851b14] text-[#ff851b]"
            : "border-[#1e90ff40] bg-[#1e90ff14] text-[#8cc9ff]"
        }`}
      >
        {item.type === "video" ? "Video" : "Photo"}
      </div>

      {/* Close */}
      <button
        onClick={onClose}
        className="fixed right-4 top-4 z-[10000] flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/10 text-[16px] text-white/75 transition-colors duration-200 hover:bg-white/15"
      >
        ✕
      </button>

      {/* Prev */}
      {hasPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="fixed left-[14px] top-1/2 z-[10000] flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/10 text-[22px] text-white/75"
        >
          ‹
        </button>
      )}

      {/* Next */}
      {hasNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="fixed right-[14px] top-1/2 z-[10000] flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/10 text-[22px] text-white/75"
        >
          ›
        </button>
      )}

      {/* Bottom bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed bottom-5 left-1/2 z-[10000] flex -translate-x-1/2 items-center gap-[10px]"
      >
        <span className="rounded-[4px] bg-[rgba(0,0,0,0.6)] px-3 py-1 text-[11px] font-semibold tracking-[0.04em] text-white/75">
          {index + 1} / {total}
        </span>
        <button
          onClick={onSlideshowToggle}
          className={`rounded-[4px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.07)] px-3 py-1 text-[11px] font-semibold ${
            isSlideshowRunning ? "text-[#ff851b]" : "text-white/60"
          }`}
        >
          {isSlideshowRunning ? "⏹ Stop" : "▶ Slideshow"}
        </button>
      </div>

      {/* Download */}
      {item.type === "image" && (
        <a
          href={item.url}
          download
          onClick={(e) => e.stopPropagation()}
          className="fixed bottom-5 right-4 z-[10000] inline-flex items-center gap-[5px] rounded-[4px] border border-white/10 bg-white/10 px-[14px] py-[5px] text-[11px] font-semibold text-white/75 no-underline"
        >
          ⬇ Download
        </a>
      )}
    </motion.div>
  );
}