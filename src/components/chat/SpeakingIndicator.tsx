'use client';

import { motion } from 'framer-motion';
import { Mic, Volume2 } from 'lucide-react';
import { WIDGET_CONFIG } from '@/lib/widgetConfig';

const BAR_COUNT = 26;

// Smooth sine-wave peaks — visually distinct from the listening waveform
const WAVE_PEAKS = Array.from({ length: BAR_COUNT }, (_, i) => {
  const p = (i / BAR_COUNT) * Math.PI * 2;
  return Math.max(4, Math.min(28, Math.abs(Math.sin(p * 2.5 + 0.4)) * 22 + 5));
});

interface SpeakingIndicatorProps {
  /** Stop AI speech only — user remains at idle */
  onStop:      () => void;
  /** Stop AI speech AND immediately start listening (barge-in) */
  onInterrupt: () => void;
}

export function SpeakingIndicator({ onStop, onInterrupt }: SpeakingIndicatorProps) {
  const { color, accentColor } = WIDGET_CONFIG;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.18 }}
      className="flex flex-col items-center gap-2 py-1.5"
    >
      {/* Animated output wave — reversed gradient vs listening waveform */}
      <div className="flex items-center justify-center gap-[3px] h-9 w-full">
        {WAVE_PEAKS.map((peak, i) => (
          <motion.div
            key={i}
            className="w-1.5 rounded-full"
            style={{ background: `linear-gradient(to top, ${accentColor}, ${color})` }}
            animate={{ height: ['3px', `${peak}px`, '3px'] }}
            transition={{
              duration: 0.85 + (i % 5) * 0.1,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'easeInOut',
              delay: i * 0.035,
            }}
          />
        ))}
      </div>

      {/* Status label */}
      <div className="flex items-center gap-1.5">
        <motion.span
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Volume2 className="w-3 h-3 text-white/50" />
        </motion.span>
        <span className="text-white/50 text-[10px] font-medium tracking-wide">AI Speaking…</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2.5">
        {/* Stop — halt speech, stay idle */}
        <button
          onClick={onStop}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/15 text-white/55 text-xs hover:text-white/80 hover:border-white/30 transition-all active:scale-95"
          title="Stop voice response"
        >
          <span className="w-2.5 h-2.5 rounded-sm bg-current block flex-shrink-0" />
          <span>Stop</span>
        </button>

        {/* Interrupt — stop speech + immediately start listening */}
        <button
          onClick={onInterrupt}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-semibold transition-all hover:scale-105 active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${color}, ${accentColor})`,
            boxShadow: `0 4px 14px ${color}55`,
          }}
          title="Interrupt and speak"
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Interrupt</span>
        </button>
      </div>
    </motion.div>
  );
}
