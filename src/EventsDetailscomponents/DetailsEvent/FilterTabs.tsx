// src/components/gallery/FilterTabs.tsx

import { MediaFilter } from "./types";

interface FilterTabsProps {
  filter: MediaFilter;
  imageCount: number;
  videoCount: number;
  totalCount: number;
  isSlideshowRunning: boolean;
  onFilterChange: (f: MediaFilter) => void;
  onSlideshowToggle: () => void;
}

export default function FilterTabs({
  filter,
  imageCount,
  videoCount,
  totalCount,
  isSlideshowRunning,
  onFilterChange,
  onSlideshowToggle,
}: FilterTabsProps) {
  const tabs = (
    [
      { key: "all", label: "All Media", count: totalCount },
      { key: "image", label: "Photos", count: imageCount },
      { key: "video", label: "Videos", count: videoCount },
    ] as const
  ).filter((t) => t.key === "all" || t.count > 0) as {
    key: MediaFilter;
    label: string;
    count: number;
  }[];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tabs.map((tab) => {
        const active = filter === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onFilterChange(tab.key)}
            className={`inline-flex cursor-pointer items-center gap-[7px] rounded-[4px] border px-[14px] py-[6px] text-[0.8rem] font-semibold tracking-[0.02em] transition-all duration-200 ease-out ${
              active
                ? "border-white/15 bg-white/10 text-white"
                : "border-white/10 bg-white/[0.04] text-white/60"
            }`}
          >
            {tab.label}
            <span
              className={`rounded-[3px] bg-[rgba(255,255,255,0.12)] px-[6px] py-[1px] text-[9px] ${
                active ? "text-[rgba(255,255,255,0.8)]" : "text-white/45"
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}

      {imageCount > 0 && (
        <button
          onClick={onSlideshowToggle}
          className={`ml-auto inline-flex cursor-pointer items-center gap-[6px] rounded-[4px] border px-[14px] py-[6px] text-[0.75rem] font-semibold uppercase tracking-[0.04em] transition-all duration-200 ease-out ${
            isSlideshowRunning
              ? "border-[#ff851b40] bg-[#ff851b14] text-[#ff851b]"
              : "border-white/10 bg-white/[0.04] text-white/60"
          }`}
        >
          {isSlideshowRunning ? "⏹ Stop" : "▶ Slideshow"}
        </button>
      )}
    </div>
  );
}