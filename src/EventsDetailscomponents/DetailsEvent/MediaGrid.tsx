// src/components/gallery/MediaGrid.tsx

import { motion, Variants } from "framer-motion";
import { MediaItem } from "./types";

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
};

interface MediaGridProps {
  items: MediaItem[];
  eventTitle: string;
  onItemClick: (idx: number) => void;
}

export default function MediaGrid({ items, eventTitle, onItemClick }: MediaGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {items.map((item, idx) => (
        <motion.div
          key={item.id}
          className="group relative aspect-[4/3] overflow-hidden rounded-[12px] border border-white/10 bg-[linear-gradient(180deg,rgba(0,31,63,0.82),rgba(6,50,95,0.74))] shadow-[0_18px_42px_rgba(0,18,45,0.16)]"
          variants={FADE_UP}
          transition={{ delay: idx * 0.03, duration: 0.45, ease: "easeOut" }}
          onClick={() => onItemClick(idx)}
          whileHover={{ scale: 1.012 }}
        >
          {item.type === "video" ? (
            <>
              <video
                src={item.url}
                muted
                playsInline
                className="block h-full w-full object-cover object-top transition-transform duration-[450ms] ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.3)]">
                <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[rgba(255,255,255,0.92)] pl-[3px] text-[15px] text-[#001f3f]">
                  ▶
                </div>
              </div>
            </>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.url}
              alt={`${eventTitle} — ${idx + 1}`}
              loading="lazy"
              className="media-grid-visual block h-full w-full object-cover object-top"
            />
          )}

          <div
            className={`absolute bottom-2 left-2 rounded-[3px] border bg-[rgba(0,0,0,0.65)] px-[7px] py-[2px] text-[9px] font-bold uppercase tracking-[0.08em] backdrop-blur-[8px] ${
              item.type === "video"
                ? "border-[#ff851b40] text-[#ff851b]"
                : "border-[#1e90ff40] text-[#8cc9ff]"
            }`}
          >
            {item.type === "video" ? "Video" : "Photo"}
          </div>

          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.28)]"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.18 }}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.1)] text-[14px] text-white">
              ⤢
            </div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}