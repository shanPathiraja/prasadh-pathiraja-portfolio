'use client';

import { useEffect } from 'react';

/**
 * Scroll motion for everything below the hero. Mounted once, renders nothing.
 *
 * Two jobs:
 *
 *  - Entrances. Every .stagger (and the legacy .reveal) is observed on its own
 *    rather than per section, because Projects and Experience are tall enough
 *    that a section-level trigger fires the bottom cards while they are still
 *    a screen away, and the cascade is then over before you reach it.
 *
 *  - Scroll position. Each [data-prog] section gets a --sp custom property:
 *    0 as its top edge enters the viewport, 1 as its bottom edge leaves. The
 *    stylesheet reads that for the slow drifts (headings, the project columns,
 *    the contact backdrop). Writes happen on a rAF, so a burst of scroll
 *    events collapses into one layout read per frame.
 *
 * Reduced motion skips the whole thing; the stylesheet has a matching block
 * that leaves the content in its resting state.
 */
export default function Motion() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const pending = new Set(document.querySelectorAll<HTMLElement>('.stagger, .reveal'));
    const show = (el: Element) => {
      el.classList.add('in-view');
      pending.delete(el as HTMLElement);
      io.unobserve(el);
    };

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && show(e.target)),
      // A touch into the viewport, and not counting the last slice of it, so a
      // group starts moving just after it has cleared the fold.
      { threshold: 0.12, rootMargin: '0px 0px -7% 0px' }
    );
    pending.forEach((el) => io.observe(el));

    const tracked = Array.from(document.querySelectorAll<HTMLElement>('[data-prog]'));
    let raf = 0;

    const doc = document.documentElement;
    const hero = document.querySelector('.hero');

    const write = () => {
      raf = 0;
      const vh = window.innerHeight;

      // Page progress for the background field, measured from the foot of the
      // hero rather than the top of the document: the hero is 480vh of the
      // scroll on its own, and counting it would leave the content sections
      // sharing the back half of the range.
      const start = hero ? hero.getBoundingClientRect().bottom + window.scrollY : 0;
      const span = doc.scrollHeight - vh - start;
      const pp = span > 0 ? (window.scrollY - start) / span : 0;
      doc.style.setProperty('--pp', (pp < 0 ? 0 : pp > 1 ? 1 : pp).toFixed(4));

      // A group that ends up above the viewport without ever having been
      // inside it — a deep link to #contact, a restored scroll position — gets
      // no intersection callback at all, because "below the fold" and "above
      // it" are the same non-intersecting state. Those are simply shown.
      for (const el of pending) {
        if (el.getBoundingClientRect().bottom < 0) show(el);
      }

      for (const el of tracked) {
        const r = el.getBoundingClientRect();
        const p = (vh - r.top) / (vh + r.height);
        el.style.setProperty('--sp', (p < 0 ? 0 : p > 1 ? 1 : p).toFixed(4));
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(write);
    };

    write();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    // The jump to a #hash can land after this effect has already run, and it
    // does not always reach the listener above, so take one more look once the
    // page has settled.
    window.addEventListener('load', onScroll);
    const settle = window.setTimeout(onScroll, 600);

    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      clearTimeout(settle);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('load', onScroll);
    };
  }, []);

  return null;
}
