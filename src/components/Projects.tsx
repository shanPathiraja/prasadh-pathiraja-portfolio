import Image from 'next/image';
import { ArrowRight } from './Icons';

/* Verified stacks and live URLs for each deployed site. */
const PROJECTS = [
  {
    name: 'Creative Paradise',
    blurb: 'WebGL studio site — ripple cursor, scroll-driven 3D scenes.',
    tags: ['Next.js', 'R3F', 'GLSL'],
    href: 'https://creative-paradise-webgl.vercel.app',
    shot: '/previews/creative-paradise.webp',
  },
  {
    name: 'Wilpattu Wilds',
    blurb: 'Safari lodge and tour booking built on a 3D jungle canvas.',
    tags: ['Next.js', 'Three.js', 'Lenis'],
    href: 'https://wilpattu-travels.vercel.app',
    shot: '/previews/wilpattu.webp',
  },
  {
    name: 'Nexus',
    blurb: 'Digital agency site — case studies and process narrative.',
    tags: ['Next.js', 'TypeScript', 'Tailwind'],
    href: 'https://nexus-agency-liard.vercel.app',
    shot: '/previews/nexus.webp',
  },
  {
    name: 'FitTrack',
    blurb: 'Product site for an AI fitness app with adaptive plans.',
    tags: ['Next.js', 'Tailwind'],
    href: 'https://fittrack-app-nine.vercel.app',
    shot: '/previews/fittrack.webp',
  },
];

export default function Projects() {
  return (
    <section className="section projects" id="projects" data-prog>
      <div className="shell">
        <div className="proj-head stagger">
          <div>
            <p className="eyebrow">Featured Projects</p>
            <h2 className="h2">
              Some Things <em>I&apos;ve Built</em>
            </h2>
          </div>
          <a className="link-more" href="https://github.com/shanPathiraja" target="_blank" rel="noreferrer">
            View All Projects <ArrowRight />
          </a>
        </div>

        <div className="proj-grid stagger">
          {PROJECTS.map((p) => (
            <a
              className="proj"
              key={p.name}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="proj-shot">
                <Image
                  src={p.shot}
                  alt={`${p.name} website`}
                  width={900}
                  height={563}
                  sizes="(max-width: 720px) 100vw, (max-width: 980px) 50vw, 280px"
                />
                <span className="proj-go">
                  <ArrowRight />
                </span>
              </div>
              <div className="proj-body">
                <h3>{p.name}</h3>
                <p>{p.blurb}</p>
                <div className="proj-tags">
                  {p.tags.map((t) => (
                    <small key={t}>{t}</small>
                  ))}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
