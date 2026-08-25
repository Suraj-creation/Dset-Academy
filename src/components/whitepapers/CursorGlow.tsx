import { useEffect, useRef } from 'react';

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number;
    let tx = -400, ty = -400;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX - 200;
      ty = e.clientY - 200;
    };

    const tick = () => {
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${tx}px, ${ty}px)`;
      }
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    rafId = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="pointer-events-none fixed z-0 w-[400px] h-[400px] rounded-full"
      style={{
        top: 0,
        left: 0,
        background:
          'radial-gradient(circle, rgba(94,23,234,0.07) 0%, rgba(30,144,255,0.04) 45%, transparent 70%)',
        willChange: 'transform',
      }}
      aria-hidden
    />
  );
}
