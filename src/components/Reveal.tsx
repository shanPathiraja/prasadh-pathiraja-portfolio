'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  delay?: number; // ms
  direction?: 'up' | 'left' | 'right' | 'none';
  threshold?: number;
  className?: string;
};

const HIDDEN: Record<NonNullable<Props['direction']>, string> = {
  up: 'translate-y-10',
  left: '-translate-x-10',
  right: 'translate-x-10',
  none: 'scale-[0.97]',
};

export default function Reveal({
  children,
  delay = 0,
  direction = 'up',
  threshold = 0.15,
  className = '',
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out will-change-transform ${
        visible
          ? 'opacity-100 translate-x-0 translate-y-0 scale-100 blur-0'
          : `opacity-0 blur-[6px] ${HIDDEN[direction]}`
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
