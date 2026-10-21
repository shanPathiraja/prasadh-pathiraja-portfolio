'use client';

import { useEffect, useState } from 'react';

export const navItems = [
  { id: 'home', label: 'Start', number: '01' },
  { id: 'experience', label: 'Experience', number: '02' },
  { id: 'work', label: 'Selected work', number: '03' },
  { id: 'skills', label: 'Skills', number: '04' },
  { id: 'contact', label: 'Contact', number: '05' },
];

export const SOCIALS = {
  github: 'https://github.com/shanPathiraja',
  linkedin: 'https://www.linkedin.com/in/prasadh-pathiraja-a64b7aba/',
  email: 'prasadh.pathiraja@gmail.com',
};

export default function Nav() {
  const [active, setActive] = useState('home');

  useEffect(() => {
    // Which section the side rail highlights
    const spy = new IntersectionObserver(
      (entries) =>
        entries.forEach(
          (entry) => entry.isIntersecting && setActive(entry.target.id)
        ),
      { rootMargin: '-35% 0px -55% 0px' }
    );
    navItems.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) spy.observe(el);
    });

    // Adds .in-view so the CSS entrance transitions fire once per section
    const reveal = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            reveal.unobserve(entry.target);
          }
        }),
      { threshold: 0.12 }
    );
    document
      .querySelectorAll('main section:not(.hero)')
      .forEach((section) => reveal.observe(section));

    return () => {
      spy.disconnect();
      reveal.disconnect();
    };
  }, []);

  return (
    <>
      <header className="mobile-header">
        <a className="monogram" href="#home" aria-label="Prasadh Pathiraja, home">
          PP<span>.</span>
        </a>
        <a className="availability-mini" href="#contact">
          <i /> Available
        </a>
      </header>

      <aside className="side-nav" aria-label="Primary navigation">
        <a className="monogram" href="#home" aria-label="Prasadh Pathiraja, home">
          PP<span>.</span>
        </a>
        <nav>
          {navItems.map((item) => (
            <a
              className={active === item.id ? 'active' : ''}
              href={`#${item.id}`}
              key={item.id}
            >
              <span>{item.number}</span>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="side-socials">
          <a href={SOCIALS.github} target="_blank" rel="noreferrer" aria-label="GitHub">
            GH
          </a>
          <a href={SOCIALS.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
            IN
          </a>
        </div>
      </aside>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navItems.map((item) => (
          <a
            className={active === item.id ? 'active' : ''}
            href={`#${item.id}`}
            key={item.id}
          >
            <span>{item.number}</span>
            {item.label.split(' ')[0]}
          </a>
        ))}
      </nav>
    </>
  );
}
