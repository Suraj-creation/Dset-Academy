// src/components/events/EmptyState.tsx

import { motion } from "framer-motion";
import { ENTERPRISE_EASE } from "./types";

interface EmptyStateProps {
  hasFilters: boolean;
}

export default function EmptyState({ hasFilters }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: ENTERPRISE_EASE }}
      className="mx-auto max-w-[720px] rounded-[32px] border border-[rgba(206,217,234,0.72)] bg-[linear-gradient(180deg,rgba(255,255,255,0.8),rgba(244,248,253,0.72))] px-8 py-[4.5rem] text-center shadow-[0_26px_64px_rgba(0,31,63,0.08)] backdrop-blur-[20px]"
    >
      <div className="mx-auto mb-[18px] flex h-[68px] w-[68px] items-center justify-center rounded-[22px] bg-[linear-gradient(135deg,#001f3f,#3a6bbb)] text-[0.82rem] font-extrabold tracking-[0.08em] text-white shadow-[0_20px_46px_rgba(0,31,63,0.18)]">
        DSeT
      </div>
      <h3 className="m-0 text-[1.25rem] font-black tracking-[-0.03em] text-[#001f3f]">
        No events found
      </h3>
      <p className="mt-[0.85rem] text-[0.95rem] leading-[1.8] text-[#6b809a]">
        {hasFilters
          ? "Try adjusting the active search or event-type filters to surface more results."
          : "This collection will populate as new events are published."}
      </p>
    </motion.div>
  );
}