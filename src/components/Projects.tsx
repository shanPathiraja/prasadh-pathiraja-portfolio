'use client';

import { useRef, type MouseEvent } from 'react';
import Reveal from './Reveal';

type Project = {
  name: string;
  tagline: string;
  description: string;
  tags: string[];
  href: string;
  /** Accent tint, matched to the aurora palette used by the particle field. */
  accent: { text: string; glow: string; ring: string };
  featured?: boolean;
};

const ACCENTS = {
  cyan: {
    text: 'text-cyan-300',
    glow: 'rgba(103, 232, 249, 0.16)',
    ring: 'group-hover:border-cyan-400/40',
  },
  emerald: {
    text: 'text-emerald-300',
    glow: 'rgba(52, 211, 153, 0.16)',
    ring: 'group-hover:border-emerald-400/40',
  },
  violet: {
    text: 'text-violet-300',
    glow: 'rgba(139, 92, 246, 0.18)',
    ring: 'group-hover:border-violet-400/40',
  },
  fuchsia: {
    text: 'text-fuchsia-300',
    glow: 'rgba(232, 121, 249, 0.16)',
    ring: 'group-hover:border-fuchsia-400/40',
  },
  amber: {
    text: 'text-amber-300',
    glow: 'rgba(251, 191, 36, 0.16)',
    ring: 'group-hover:border-amber-400/40',
  },
} as const;

const projects: Project[] = [
  {
    name: 'Creative Paradise',
    tagline: 'We will design your idea',
    description:
      'A WebGL reimagining of a Sri Lankan design studio site — GPU water-ripple cursor, scroll-driven 3D scenes, and a 28-piece portfolio gallery rendered on the canvas.',
    tags: ['Next.js', 'React Three Fiber', 'GLSL', 'Lenis', 'Tailwind'],
    href: 'https://creative-paradise-webgl.vercel.app',
    accent: ACCENTS.cyan,
    featured: true,
  },
  {
    name: 'Wilpattu Wilds',
    tagline: 'Into the wild heart of Sri Lanka',
    description:
      'Safari lodge and tour booking experience for Sri Lanka’s largest national park, built around an immersive 3D jungle canvas with layered parallax depth.',
    tags: ['Next.js', 'React Three Fiber', 'Three.js', 'Lenis', 'Tailwind'],
    href: 'https://wilpattu-travels.vercel.app',
    accent: ACCENTS.emerald,
    featured: true,
  },
  {
    name: 'Nexus',
    tagline: 'We make brands win',
    description:
      'Full-service digital agency site — case-study portfolio, service breakdown, and a five-stage process narrative.',
    tags: ['Next.js', 'TypeScript', 'Tailwind'],
    href: 'https://nexus-agency-liard.vercel.app',
    accent: ACCENTS.violet,
  },
  {
    name: 'FitTrack',
    tagline: 'Train smarter, not harder',
    description:
      'Product site for an AI fitness app: adaptive workout plans, camera form analysis, recovery scoring, and tiered pricing.',
    tags: ['Next.js', 'Tailwind', 'Product Site'],
    href: 'https://fittrack-app-nine.vercel.app',
    accent: ACCENTS.fuchsia,
  },
  {
    name: 'Solara',
    tagline: 'Stop managing tasks. Start finishing them.',
    description:
      'SaaS marketing site for an AI task-intelligence platform — priority engine, smart scheduling, and team analytics.',
    tags: ['Next.js', 'Tailwind', 'SaaS'],
    href: 'https://solara-saas.vercel.app',
    accent: ACCENTS.amber,
  },
];

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H8m9 0v9" />
    </svg>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const ref = useRef<HTMLAnchorElement>(null);

  // Spotlight follows the pointer across the card surface
  const onMouseMove = (e: MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  return (
    <a
      ref={ref}
      href={project.href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseMove={onMouseMove}
      className={`group relative flex flex-col h-full glass rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 ${project.accent.ring} hover:shadow-2xl hover:shadow-black/40`}
    >
      {/* Pointer spotlight */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(340px circle at var(--mx, 50%) var(--my, 50%), ${project.accent.glow}, transparent 70%)`,
        }}
      />
      {/* Top accent hairline */}
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-40 group-hover:opacity-90 transition-opacity duration-300"
        style={{
          background: `linear-gradient(90deg, transparent, ${project.accent.glow.replace(/0\.\d+\)/, '0.9)')}, transparent)`,
        }}
      />

      <div className="relative flex items-start justify-between gap-4 mb-3">
        <div>
          <h3
            className="text-lg font-bold text-white"
            style={{ fontFamily: 'var(--font-grotesk)' }}
          >
            {project.name}
          </h3>
          <p className={`text-sm mt-1 ${project.accent.text}`}>{project.tagline}</p>
        </div>
        <span
          className={`flex-shrink-0 mt-1 text-white/30 group-hover:text-white/80 transition-colors ${project.accent.text.replace('text-', 'group-hover:text-')}`}
        >
          <ArrowIcon />
        </span>
      </div>

      <p
        className={`relative text-white/50 leading-relaxed mb-5 ${
          project.featured ? 'text-sm' : 'text-[13px]'
        }`}
      >
        {project.description}
      </p>

      <div className="relative mt-auto flex flex-wrap gap-1.5">
        {project.tags.map((t) => (
          <span
            key={t}
            className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/50"
          >
            {t}
          </span>
        ))}
      </div>
    </a>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="relative py-28 px-6 max-w-5xl mx-auto">
      <Reveal className="mb-16">
        <p className="section-label mb-3">Portfolio</p>
        <h2
          className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4"
          style={{ fontFamily: 'var(--font-grotesk)' }}
        >
          Featured Projects
        </h2>
        <p className="text-white/45 max-w-md">
          Personal builds exploring WebGL, motion, and product design on the web.
        </p>
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {projects.map((p, i) => (
          <Reveal
            key={p.name}
            delay={i * 80}
            threshold={0.08}
            className={p.featured ? 'lg:col-span-3' : 'lg:col-span-2'}
          >
            <ProjectCard project={p} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
