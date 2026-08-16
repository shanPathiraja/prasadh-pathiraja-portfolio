'use client';

import { useState, useEffect } from 'react';

const links = ['About', 'Experience', 'Projects', 'Skills', 'Contact'];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 px-5 md:px-8">
        <div
          className={`flex items-center justify-between transition-all duration-300 ${
            scrolled ? 'py-3' : 'py-5'
          }`}
        >
          {/* Brand */}
          <a href="#about" className="flex items-center gap-2.5 group">
            <span className="w-8 h-8 rounded-lg bg-[color:var(--ink)] text-[color:var(--bg)] flex items-center justify-center text-xs font-bold tracking-tight">
              PP
            </span>
            <span
              className="text-sm font-semibold tracking-tight text-[color:var(--ink)] hidden sm:block"
              style={{ fontFamily: 'var(--font-grotesk)' }}
            >
              Prasadh Pathiraja
            </span>
          </a>

          <div
            className={`hidden md:flex items-center gap-1 rounded-full px-2 py-1.5 transition-all duration-300 ${
              scrolled ? 'station' : 'bg-transparent'
            }`}
          >
            {links.map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase()}`}
                className="text-sm text-[color:var(--ink-soft)] hover:text-[color:var(--ink)] transition-colors px-3.5 py-1.5 rounded-full hover:bg-white/50"
              >
                {l}
              </a>
            ))}
          </div>

          {/* CTA */}
          <a
            href="#contact"
            className="hidden md:inline-flex px-5 py-2 rounded-full bg-[color:var(--ink)] text-[color:var(--bg)] text-sm font-semibold hover:bg-[color:var(--coral)] transition-colors duration-200"
          >
            Let’s talk
          </a>

          {/* Mobile toggle */}
          <button
            className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1 text-[color:var(--ink)]"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 bg-current transition-transform duration-200 ${menuOpen ? 'rotate-45 translate-y-[6px]' : ''}`} />
            <span className={`block w-5 h-0.5 bg-current transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-current transition-transform duration-200 ${menuOpen ? '-rotate-45 -translate-y-[6px]' : ''}`} />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed top-16 left-4 right-4 z-40 station rounded-2xl px-4 py-3 flex flex-col gap-1 md:hidden">
          {links.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              className="text-[color:var(--ink-soft)] hover:text-[color:var(--ink)] hover:bg-white/50 transition-all px-3 py-2.5 rounded-xl text-sm"
              onClick={() => setMenuOpen(false)}
            >
              {l}
            </a>
          ))}
          <a
            href="#contact"
            className="mt-1 px-3 py-2.5 rounded-xl bg-[color:var(--ink)] text-[color:var(--bg)] text-sm font-semibold text-center"
            onClick={() => setMenuOpen(false)}
          >
            Let’s talk
          </a>
        </div>
      )}
    </>
  );
}
