'use client';

import { useState, useEffect } from 'react';

const links = ['About', 'Experience', 'Projects', 'Skills', 'Contact'];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState('about');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sections = links
      .map((l) => document.getElementById(l.toLowerCase()))
      .filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <nav className="fixed top-5 left-0 right-0 z-50 flex justify-center px-4">
        <div
          className={`flex items-center gap-1 px-2 py-2 rounded-full border transition-all duration-300 ${
            scrolled
              ? 'bg-[#050510]/90 border-white/10 backdrop-blur-xl shadow-lg shadow-violet-950/40'
              : 'bg-[#050510]/50 border-white/[0.06] backdrop-blur-md'
          }`}
        >
          {/* Logo */}
          <a
            href="#about"
            className="relative w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold mr-1 text-white bg-gradient-to-br from-cyan-500/20 via-violet-500/20 to-fuchsia-500/20 border border-white/15"
          >
            PP
          </a>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center">
            {links.map((l) => {
              const isActive = active === l.toLowerCase();
              return (
                <li key={l}>
                  <a
                    href={`#${l.toLowerCase()}`}
                    className={`text-sm transition-colors duration-200 px-4 py-1.5 rounded-full ${
                      isActive
                        ? 'text-white bg-white/10'
                        : 'text-white/50 hover:text-white/90 hover:bg-white/5'
                    }`}
                  >
                    {l}
                  </a>
                </li>
              );
            })}
          </ul>

          {/* CTA */}
          <a
            href="#contact"
            className="hidden md:flex ml-1 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 hover:brightness-110 text-white text-sm font-medium transition-all duration-200"
          >
            Hire Me
          </a>

          {/* Mobile toggle */}
          <button
            className="md:hidden px-3 py-1.5 text-white/60 hover:text-white transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 bg-current transition-transform duration-200 ${menuOpen ? 'rotate-45 translate-y-[5px]' : ''}`} />
            <span className={`block w-5 h-0.5 bg-current mt-1 transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-current mt-1 transition-transform duration-200 ${menuOpen ? '-rotate-45 -translate-y-[9px]' : ''}`} />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed top-20 left-4 right-4 z-40 bg-[#050510]/95 border-white/10 backdrop-blur-xl border rounded-2xl shadow-xl shadow-black/50 px-4 py-3 flex flex-col gap-1 md:hidden">
          {links.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              className="text-white/70 hover:text-white hover:bg-white/5 transition-all px-3 py-2.5 rounded-xl text-sm"
              onClick={() => setMenuOpen(false)}
            >
              {l}
            </a>
          ))}
          <a
            href="#contact"
            className="mt-1 px-3 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 text-white text-sm font-medium transition-colors text-center"
            onClick={() => setMenuOpen(false)}
          >
            Hire Me
          </a>
        </div>
      )}
    </>
  );
}
