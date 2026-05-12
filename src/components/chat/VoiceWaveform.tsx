'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { WIDGET_CONFIG } from '@/lib/widgetConfig';

const BAR_COUNT = 26;

// Sine-based fallback heights — no Math.random() at render time
const FALLBACK_PEAKS = Array.from({ length: BAR_COUNT }, (_, i) => {
  const p = (i / BAR_COUNT) * Math.PI * 4;
  return Math.max(5, Math.min(32, Math.sin(p * 1.4) * 10 + Math.sin(p * 2.9) * 7 + Math.sin(p * 0.7) * 4 + 16));
});

interface VoiceWaveformProps {
  transcript: string;
  onConfirm:  () => void;   // ✓ stop + send
  onCancel:   () => void;   // ✗ stop + discard
}

export function VoiceWaveform({ transcript, onConfirm, onCancel }: VoiceWaveformProps) {
  const [amplitudes, setAmplitudes] = useState<number[]>(() => Array(BAR_COUNT).fill(0));
  const [hasRealData, setHasRealData] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef   = useRef<MediaStream | null>(null);
  const rafRef      = useRef<number>(0);
  const aliveRef    = useRef(true);

  useEffect(() => {
    aliveRef.current = true;

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        if (!aliveRef.current) { stream.getTracks().forEach(t => t.stop()); return; }

        streamRef.current = stream;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const AudioCtx = window.AudioContext ?? (window as any).webkitAudioContext as typeof AudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.78;
        ctx.createMediaStreamSource(stream).connect(analyser);

        const data = new Uint8Array(analyser.frequencyBinCount);
        setHasRealData(true);

        const tick = () => {
          if (!aliveRef.current) return;
          analyser.getByteFrequencyData(data);
          setAmplitudes(
            Array.from({ length: BAR_COUNT }, (_, i) => {
              const bin = Math.floor((i / BAR_COUNT) * data.length * 0.55);
              return data[bin] / 255;
            }),
          );
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch {
        // STT provider already holds the mic — CSS fallback will animate
      }
    })();

    return () => {
      aliveRef.current = false;
      cancelAnimationFrame(rafRef.current);
      if (audioCtxRef.current?.state !== 'closed') audioCtxRef.current?.close();
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const { color, accentColor } = WIDGET_CONFIG;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.18 }}
      className="flex flex-col items-center gap-2 py-1.5"
    >
      {/* Live transcript preview */}
      <div className="w-full min-h-[18px] px-1 text-center">
        {transcript ? (
          <p className="text-white/70 text-xs italic leading-snug line-clamp-2">{transcript}</p>
        ) : (
          <p className="text-white/30 text-[10px]">Start speaking…</p>
        )}
      </div>

      {/* Waveform bars */}
      <div className="flex items-center justify-center gap-[3px] h-9 w-full">
        {Array.from({ length: BAR_COUNT }, (_, i) => (
          <motion.div
            key={i}
            className="w-1.5 rounded-full"
            style={{ background: `linear-gradient(to top, ${color}, ${accentColor})` }}
            animate={
              hasRealData
                ? { height: `${Math.max(3, amplitudes[i] * 34)}px`, opacity: 0.45 + amplitudes[i] * 0.55 }
                : { height: ['3px', `${FALLBACK_PEAKS[i]}px`, '3px'], opacity: [0.38, 0.88, 0.38] }
            }
            transition={
              hasRealData
                ? { duration: 0.07, ease: 'linear' }
                : {
                    duration: 0.65 + (i % 7) * 0.09,
                    repeat: Infinity,
                    repeatType: 'mirror',
                    ease: 'easeInOut',
                    delay: (i % 6) * 0.055,
                  }
            }
          />
        ))}
      </div>

      {/* Listening label */}
      <div className="flex items-center gap-1.5">
        <motion.span
          className="w-1.5 h-1.5 rounded-full bg-red-400"
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span className="text-white/50 text-[10px] font-medium tracking-wide">Listening…</span>
      </div>

      {/* Action buttons: ✗ Cancel  |  ✓ Send */}
      <div className="flex items-center gap-3 mt-0.5">
        {/* ✗ Discard */}
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/15 text-white/55 text-xs hover:text-white/80 hover:border-white/30 transition-all"
          title="Cancel — discard recording"
        >
          <X className="w-3.5 h-3.5" />
          <span>Cancel</span>
        </button>

        {/* ✓ Send */}
        <button
          onClick={onConfirm}
          disabled={!transcript.trim()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{
            background: transcript.trim()
              ? `linear-gradient(135deg, ${color}, ${accentColor})`
              : 'rgba(255,255,255,0.08)',
            boxShadow: transcript.trim() ? `0 4px 14px ${color}55` : 'none',
          }}
          title="Send — confirm and send recording"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </div>
    </motion.div>
  );
}
