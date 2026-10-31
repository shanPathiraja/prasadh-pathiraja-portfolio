'use client';

import { useEffect, useState } from 'react';
import { Download } from './Icons';
import { SOCIALS } from '@/lib/socials';

export const NAV = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'contact', label: 'Contact' },
];


export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('home');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const spy = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' }
    );
    NAV.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) spy.observe(el);
    });

    // Entrance animations live in Motion.tsx, which observes each group
    // on its own rather than whole sections.

    return () => {
      window.removeEventListener('scroll', onScroll);
      spy.disconnect();
    };
  }, []);

  return (
    <header className={`nav${scrolled ? ' scrolled' : ''}`}>
      <div className="shell">
        <div className="nav-in">
          <a className="brand" href="#home" aria-label="Buddhika Prasadh Pathiraja, home">
            <span className="brand-mark">BP</span>
            <span className="brand-text">
              <strong>Buddhika Prasadh Pathiraja</strong>
              <span>Full-Stack Software Engineer</span>
            </span>
          </a>

          <nav className="nav-links">
            {NAV.map((n) => (
              <a key={n.id} href={`#${n.id}`} className={active === n.id ? 'active' : ''}>
                {n.label}
              </a>
            ))}
          </nav>

          <a className="btn btn-ghost" href={`mailto:${SOCIALS.email}`}>
            <Download /> Download CV
          </a>

          <button
            className="nav-toggle"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
              {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>

        {open && (
          <nav className="nav-mobile">
            {NAV.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                className={active === n.id ? 'active' : ''}
                onClick={() => setOpen(false)}
              >
                {n.label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
