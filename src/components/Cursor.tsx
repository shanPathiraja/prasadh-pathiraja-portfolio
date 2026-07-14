'use client';

import { useEffect, useRef } from 'react';

/** Soft glow that trails the pointer and swells over interactive elements. */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const dot = dotRef.current;
    const glow = glowRef.current;
    if (!dot || !glow) return;

    let x = -100, y = -100, gx = -100, gy = -100;
    let hovering = false;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const target = e.target as HTMLElement;
      hovering = !!target.closest?.('a, button, input, textarea, [data-hover]');
    };

    const loop = () => {
      gx += (x - gx) * 0.12;
      gy += (y - gy) * 0.12;
      dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${hovering ? 2.4 : 1})`;
      glow.style.transform = `translate(${gx}px, ${gy}px) translate(-50%, -50%) scale(${hovering ? 1.5 : 1})`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="hidden lg:block pointer-events-none fixed inset-0 z-[70]" aria-hidden="true">
      <div
        ref={glowRef}
        className="absolute top-0 left-0 w-64 h-64 rounded-full opacity-25 transition-[scale] duration-300"
        style={{
          background:
            'radial-gradient(circle, rgba(103,232,249,0.35) 0%, rgba(139,92,246,0.15) 40%, transparent 70%)',
        }}
      />
      <div
        ref={dotRef}
        className="absolute top-0 left-0 w-2 h-2 rounded-full bg-cyan-300 mix-blend-screen transition-transform duration-150"
      />
    </div>
  );
}
