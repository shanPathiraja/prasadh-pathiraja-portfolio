'use client';

import { useEffect, useState } from 'react';

const stations = [
  { id: 'about', label: 'Intro', n: '01' },
  { id: 'experience', label: 'Experience', n: '02' },
  { id: 'projects', label: 'Work', n: '03' },
  { id: 'skills', label: 'Toolkit', n: '04' },
  { id: 'contact', label: 'Contact', n: '05' },
];

export default function StationRail() {
  const [active, setActive] = useState('about');

  useEffect(() => {
    const els = stations
      .map((s) => document.getElementById(s.id))
      .filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <nav
      aria-label="Sections"
      className="hidden lg:flex fixed right-8 top-1/2 -translate-y-1/2 z-40 flex-col gap-1"
    >
      {stations.map((s) => {
        const on = active === s.id;
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="group flex items-center justify-end gap-3 py-1.5"
          >
            <span
              className={`text-[11px] font-semibold tracking-wide transition-all duration-300 ${
                on
                  ? 'text-[color:var(--coral)] opacity-100 translate-x-0'
                  : 'text-[color:var(--ink-soft)] opacity-0 -translate-x-2 group-hover:opacity-70 group-hover:translate-x-0'
              }`}
            >
              {s.label}
            </span>
            <span
              className={`relative flex items-center justify-center rounded-full transition-all duration-300 ${
                on ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5'
              }`}
            >
              <span
                className={`absolute inset-0 rounded-full transition-all duration-300 ${
                  on
                    ? 'bg-[color:var(--coral)] shadow-[0_0_12px_rgba(255,107,92,0.6)]'
                    : 'bg-[color:var(--ink-soft)]/40 group-hover:bg-[color:var(--ink-soft)]/70'
                }`}
              />
            </span>
          </a>
        );
      })}
    </nav>
  );
}
