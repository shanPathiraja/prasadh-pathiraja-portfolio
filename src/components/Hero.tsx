'use client';

import Reveal from './Reveal';

/* Keyed to the 3D model: denim shirt → terracotta → desk timber. */
const STOPS: [number, number, number][] = [
  [47, 111, 178],  // denim
  [217, 140, 106], // clay
  [181, 112, 63],  // wood
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
            ...(gradient ? { color: letterColor(i / last) } : {}),
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
      className="relative min-h-screen flex items-center justify-center md:justify-end overflow-hidden px-6 md:px-12"
    >
      <div className="relative z-10 w-full max-w-xl md:mr-[5vw] text-left station rounded-3xl p-8 md:p-10 border-l-4 border-l-[color:var(--coral)]">
        <Reveal delay={0} threshold={0}>
          <div className="inline-flex items-center gap-2 text-[color:var(--ink-soft)] text-xs font-semibold mb-6 tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Available for new projects
          </div>
        </Reveal>

        <h1
          className="text-5xl md:text-[72px] font-bold leading-[0.95] tracking-tight mb-6 text-[color:var(--ink)]"
          style={{ fontFamily: 'var(--font-grotesk)', perspective: '600px' }}
        >
          <Cascade text="Prasadh" from={150} />
          <br />
          <Cascade text="Pathiraja" from={550} gradient />
        </h1>

        <Reveal delay={900} threshold={0}>
          <p className="text-sm md:text-base font-semibold tracking-[0.3em] uppercase mb-6 text-[color:var(--coral)]">
            Full Stack Engineer
          </p>
        </Reveal>

        <Reveal delay={1050} threshold={0}>
          <p className="text-[color:var(--ink-soft)] text-base md:text-lg max-w-lg mb-10 leading-relaxed">
            4+ years building production applications end-to-end — frontend, backend, and
            everything between. Biased toward code the team can actually maintain.
          </p>
        </Reveal>

        <Reveal delay={1200} threshold={0}>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#experience"
              className="glow-cta px-8 py-3.5 rounded-full bg-[color:var(--coral)] hover:brightness-105 hover:scale-[1.03] active:scale-[0.98] text-white text-sm font-semibold transition-all duration-200"
            >
              Explore my work
            </a>
            <a
              href="#contact"
              className="px-8 py-3.5 rounded-full station text-[color:var(--ink)] hover:border-[color:var(--coral)] text-sm font-semibold transition-all duration-200"
            >
              Get in touch
            </a>
          </div>
        </Reveal>
      </div>

      <Reveal
        delay={1500}
        threshold={0}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2 text-[color:var(--ink-soft)] text-xs float-slow">
          <span className="tracking-[0.35em] text-[10px]">SCROLL TO TRAVEL</span>
          <div className="w-px h-10 bg-gradient-to-b from-[color:var(--coral)] to-transparent" />
        </div>
      </Reveal>
    </section>
  );
}
