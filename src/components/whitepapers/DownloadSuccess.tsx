import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X, FileDown } from 'lucide-react';

interface DownloadSuccessProps {
  show: boolean;
  title: string;
  onClose: () => void;
}

const COLORS = ['#5e17ea', '#1e90ff', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#34d399'];

function Confetti({ count = 24 }: { count?: number }) {
  const particles = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 360;
    const radius = 120 + Math.random() * 80;
    const x = Math.cos((angle * Math.PI) / 180) * radius;
    const y = Math.sin((angle * Math.PI) / 180) * radius - 60;
    return { x, y, color: COLORS[i % COLORS.length], delay: i * 0.025, size: 5 + Math.random() * 5 };
  });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible" aria-hidden>
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-sm"
          style={{
            width: p.size,
            height: p.size,
            background: p.color,
            left: '50%',
            top: '30%',
          }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{
            x: p.x,
            y: p.y,
            opacity: 0,
            rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
            scale: 0,
          }}
          transition={{ duration: 1.1 + Math.random() * 0.4, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

export default function DownloadSuccess({ show, title, onClose }: DownloadSuccessProps) {
  const close = useCallback(onClose, [onClose]);

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(close, 5500);
    return () => clearTimeout(t);
  }, [show, close]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40, transition: { duration: 0.25 } }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="fixed bottom-6 left-1/2 z-[200] w-[360px] sm:w-[400px] rounded-2xl overflow-visible"
          style={{
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #0d1f38, #112240)',
            border: '1px solid rgba(16,185,129,0.35)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.55), 0 0 40px rgba(16,185,129,0.08)',
          }}
        >
          {/* Confetti burst */}
          <Confetti />

          {/* Drain progress bar */}
          <motion.div
            className="absolute top-0 left-0 h-[2px] rounded-t-2xl"
            style={{ background: 'linear-gradient(90deg, #10b981, #06b6d4)' }}
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 5.5, ease: 'linear' }}
          />

          <div className="relative p-5 pt-6">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 380, damping: 16, delay: 0.08 }}
                className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}
              >
                <CheckCircle size={20} className="text-emerald-400" />
              </motion.div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 }}
                  className="text-sm font-bold text-white mb-0.5"
                >
                  Download Started!
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 }}
                  className="text-xs text-gray-400 truncate max-w-[240px]"
                >
                  {title}
                </motion.p>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-white/08 transition-all flex-shrink-0"
              >
                <X size={13} />
              </button>
            </div>

            {/* Fill progress bar */}
            <div
              className="mt-4 h-1 rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #10b981, #06b6d4)' }}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.4, ease: 'easeInOut', delay: 0.2 }}
              />
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="flex items-center gap-1.5 mt-2"
            >
              <FileDown size={10} className="text-emerald-500" />
              <p className="text-[10px] text-gray-500">File is being prepared for download…</p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
