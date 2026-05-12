// src/components/gallery/hooks.ts
// ─── Custom Hooks ─────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from "react";
import { SLIDESHOW_INTERVAL } from "./types";

// ─── useInfiniteScroll ────────────────────────────────────────────────────────

interface UseInfiniteScrollOptions {
  total: number;
  batch: number;
}

export function useInfiniteScroll({ total, batch }: UseInfiniteScrollOptions): {
  visibleCount: number;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  reset: () => void;
} {
  const [visibleCount, setVisibleCount] = useState(batch);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const reset = useCallback(() => setVisibleCount(batch), [batch]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((c) => Math.min(c + batch, total));
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [total, batch]);

  return { visibleCount, sentinelRef, reset };
}

// ─── useSlideshow ─────────────────────────────────────────────────────────────

interface UseSlideshowOptions {
  total: number;
  onFrame: (setter: (i: number | null) => number | null) => void;
}

export function useSlideshow({ total, onFrame }: UseSlideshowOptions): {
  isRunning: boolean;
  start: () => void;
  stop: () => void;
} {
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    setIsRunning(false);
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    stop();
    setIsRunning(true);
    timerRef.current = setInterval(() => {
      onFrame((i) => {
        if (i === null) return 0;
        return i < total - 1 ? i + 1 : 0;
      });
    }, SLIDESHOW_INTERVAL);
  }, [stop, total, onFrame]);

  useEffect(() => () => stop(), [stop]);

  return { isRunning, start, stop };
}