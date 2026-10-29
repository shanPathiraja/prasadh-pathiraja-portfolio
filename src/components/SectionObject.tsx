'use client';

import { useEffect, useRef } from 'react';
import type { Shape, SectionObject as Handle } from './sectionObjectGl';

/**
 * Mounts one of the raymarched objects. The renderer is pulled in on demand, so
 * none of the shader source sits in the initial bundle, and anything without
 * WebGL2 — or anyone who asked for less motion — simply gets an empty panel.
 */
export default function SectionObject({
  shape,
  className,
}: {
  shape: Shape;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let handle: Handle | null = null;
    let dead = false;

    import('./sectionObjectGl')
      .then((m) => {
        if (dead) return;
        handle = m.createSectionObject(canvas, shape);
        if (handle) canvas.dataset.on = '1';
      })
      .catch(() => {
        /* no WebGL2, or the shader wouldn't build */
      });

    return () => {
      dead = true;
      handle?.dispose();
      delete canvas.dataset.on;
    };
  }, [shape]);

  return <canvas className={className} ref={ref} aria-hidden="true" />;
}
