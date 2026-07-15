'use client';

import Image from 'next/image';
import { useRef, type MouseEvent } from 'react';
import Reveal from './Reveal';

type Project = {
  name: string;
  tagline: string;
  description: string;
  tags: string[];
  href: string;
  image: string;
  /** Accent tint, matched to the aurora palette used by the particle field. */
  accent: { text: string; glow: string; ring: string };
  featured?: boolean;
};

const ACCENTS = {
  cyan: {
    text: 'text-cyan-300',
    glow: 'rgba(103, 232, 249, 0.9)',
    ring: 'hover:border-cyan-400/50',
  },
  emerald: {
    text: 'text-emerald-300',
    glow: 'rgba(52, 211, 153, 0.9)',
    ring: 'hover:border-emerald-400/50',
  },
  violet: {
    text: 'text-violet-300',
    glow: 'rgba(139, 92, 246, 0.9)',
    ring: 'hover:border-violet-400/50',
  },
  fuchsia: {
    text: 'text-fuchsia-300',
    glow: 'rgba(232, 121, 249, 0.9)',
    ring: 'hover:border-fuchsia-400/50',
  },
  amber: {
    text: 'text-amber-300',
    glow: 'rgba(251, 191, 36, 0.9)',
    ring: 'hover:border-amber-400/50',
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
    image: '/previews/creative-paradise.webp',
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
    image: '/previews/wilpattu.webp',
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
    image: '/previews/nexus.webp',
    accent: ACCENTS.violet,
  },
  {
    name: 'FitTrack',
    tagline: 'Train smarter, not harder',
    description:
      'Product site for an AI fitness app: adaptive workout plans, camera form analysis, recovery scoring, and tiered pricing.',
    tags: ['Next.js', 'Tailwind', 'Product Site'],
    href: 'https://fittrack-app-nine.vercel.app',
    image: '/previews/fittrack.webp',
    accent: ACCENTS.fuchsia,
  },
  {
    name: 'Solara',
    tagline: 'Stop managing tasks. Start finishing them.',
    description:
      'SaaS marketing site for an AI task-intelligence platform — priority engine, smart scheduling, and team analytics.',
    tags: ['Next.js', 'Tailwind', 'SaaS'],
    href: 'https://solara-saas.vercel.app',
    image: '/previews/solara.webp',
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
      className={`group panel relative flex flex-col h-full rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/60 ${project.accent.ring}`}
    >
      {/* Live site preview */}
      <div className="relative overflow-hidden border-b border-white/10 bg-black/40">
        <Image
          src={project.image}
          alt={`Screenshot of the ${project.name} website`}
          width={900}
          height={563}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 480px"
          className="w-full h-auto aspect-[16/10] object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        />
        {/* Fade the shot into the card body */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090916] via-[#090916]/10 to-transparent" />
        {/* Accent wash on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay"
          style={{ background: `linear-gradient(to top, transparent, ${project.accent.glow})` }}
        />
      </div>

      {/* Pointer spotlight over the body */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(320px circle at var(--mx, 50%) var(--my, 50%), ${project.accent.glow.replace('0.9)', '0.10)')}, transparent 70%)`,
        }}
      />

      <div className="relative flex flex-col flex-1 p-5">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <h3
              className="text-lg font-bold text-white"
              style={{ fontFamily: 'var(--font-grotesk)' }}
            >
              {project.name}
            </h3>
            <p className={`text-sm mt-0.5 ${project.accent.text}`}>{project.tagline}</p>
          </div>
          <span className="flex-shrink-0 mt-1 text-white/40 group-hover:text-white transition-colors">
            <ArrowIcon />
          </span>
        </div>

        <p
          className={`text-white/60 leading-relaxed mb-5 ${
            project.featured ? 'text-sm' : 'text-[13px]'
          }`}
        >
          {project.description}
        </p>

        <div className="mt-auto flex flex-wrap gap-1.5">
          {project.tags.map((t) => (
            <span
              key={t}
              className="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.07] border border-white/12 text-white/60"
            >
              {t}
            </span>
          ))}
        </div>
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
        <p className="text-white/55 max-w-md">
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
