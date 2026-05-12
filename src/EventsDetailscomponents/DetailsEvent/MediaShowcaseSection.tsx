// src/components/gallery/MediaShowcaseSection.tsx

import { motion } from "framer-motion";
import { GalleryEvent } from "./types";

interface MediaShowcaseSectionProps {
  event: GalleryEvent;
  onMediaClick: (mediaId: string) => void;
}

export default function MediaShowcaseSection({ event, onMediaClick }: MediaShowcaseSectionProps) {
  const showcaseItems = event.media.slice(0, 2);
  if (showcaseItems.length === 0) return null;

  return (
    <section className="border-b border-white/8 bg-[linear-gradient(180deg,#0e1b33_0%,#10213f_100%)] py-20">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 max-w-2xl"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5e17ea]">
            Media Showcase
          </p>
          <h2 className="mt-4 text-white text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.02em] leading-tight">
            Featured media moments from the{" "}
            <span className="text-3xl sm:text-4xl md:text-5xl font-semibold bg-[linear-gradient(120deg,#ff851b_0%,#1e90ff_48%,#5e17ea_100%)] bg-clip-text text-transparent">
              event
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {showcaseItems.map((item, index) => (
            <motion.button
              key={item.id}
              type="button"
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
              onClick={() => onMediaClick(item.id)}
              className="group relative h-[240px] sm:h-[320px] overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(0,31,63,0.82),rgba(6,50,95,0.74))] text-left shadow-2xl shadow-black/20"
            >
              {item.type === "video" ? (
                <video src={item.url} muted playsInline className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.url} alt={`${event.title} showcase ${index + 1}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#020a14]/90 via-[#020a14]/45 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1e90ff]">
                  {item.type === "video" ? "Featured Video" : "Featured Photo"}
                </p>
                <p className="mt-3 max-w-xl text-sm leading-7 text-white/75">
                  A premium visual moment captured during the event experience.
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}