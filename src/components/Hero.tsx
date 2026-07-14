'use client';

import Reveal from './Reveal';

/* Aurora palette interpolated per letter — background-clip:text breaks on
   animated children, so we bake the gradient into per-letter colors. */
const STOPS: [number, number, number][] = [
  [103, 232, 249], // cyan
  [139, 92, 246],  // violet
  [232, 121, 249], // fuchsia
];

function letterColor(t: number) {
  const seg = t * (STOPS.length - 1);
  const i = Math.min(STOPS.length - 2, Math.floor(seg));
  const f = seg - i;
  const c = STOPS[i].map((v, k) => Math.round(v + (STOPS[i + 1][k] - v) * f));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

function Cascade({
  text,
  from = 0,
  gradient = false,
}: {
  text: string;
  from?: number;
  gradient?: boolean;
}) {
  const last = Math.max(1, text.length - 1);
  return (
    <span aria-label={text}>
      {text.split('').map((ch, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="letter"
          style={{
            animationDelay: `${from + i * 55}ms`,
            ...(gradient
              ? {
                  color: letterColor(i / last),
                  textShadow: '0 0 32px rgba(139, 92, 246, 0.45)',
                }
              : {}),
          }}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}

export default function Hero() {
  return (
    <section
      id="about"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <div className="relative z-10 text-center max-w-3xl mx-auto px-6 pt-24">
        <Reveal delay={0} threshold={0}>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass text-white/70 text-xs font-medium mb-10 tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Available for new projects
          </div>
        </Reveal>

        <h1
          className="text-5xl md:text-[76px] font-bold leading-[1.06] tracking-tight mb-6 text-white"
          style={{ fontFamily: 'var(--font-grotesk)', perspective: '600px' }}
        >
          <Cascade text="Prasadh" from={150} />
          <br />
          <Cascade text="Pathiraja" from={550} gradient />
        </h1>

        <Reveal delay={900} threshold={0}>
          <p className="text-base md:text-lg font-medium tracking-[0.25em] uppercase mb-5 text-cyan-300/90">
            Full Stack Engineer
          </p>
        </Reveal>

        <Reveal delay={1050} threshold={0}>
          <p className="text-white/50 text-base md:text-lg max-w-xl mx-auto mb-12 leading-relaxed">
            4+ years building production applications end-to-end — frontend, backend, and
            everything between. Biased toward code the team can actually maintain.
          </p>
        </Reveal>

        <Reveal delay={1200} threshold={0}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#experience"
              className="glow-cta px-8 py-3.5 rounded-full bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 hover:brightness-110 hover:scale-[1.03] active:scale-[0.98] text-white text-sm font-semibold transition-all duration-200"
            >
              View My Work
            </a>
            <a
              href="#contact"
              className="px-8 py-3.5 rounded-full glass text-white/70 hover:text-white hover:border-white/25 text-sm font-semibold transition-all duration-200"
            >
              Get In Touch
            </a>
          </div>
        </Reveal>
      </div>

      <Reveal
        delay={1500}
        threshold={0}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2 text-white/30 text-xs float-slow">
          <span className="tracking-[0.35em] text-[10px]">SCROLL</span>
          <div className="w-px h-10 bg-gradient-to-b from-cyan-400/50 to-transparent" />
        </div>
      </Reveal>
    </section>
  );
}
