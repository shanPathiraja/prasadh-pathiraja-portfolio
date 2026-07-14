'use client';

import Reveal from './Reveal';

export default function Projects() {
  return (
    <section id="projects" className="relative py-28 px-6 max-w-5xl mx-auto">
      <Reveal className="mb-16">
        <p className="section-label mb-3">Portfolio</p>
        <h2
          className="text-4xl md:text-5xl font-bold text-white tracking-tight"
          style={{ fontFamily: 'var(--font-grotesk)' }}
        >
          Featured Projects
        </h2>
      </Reveal>

      <Reveal delay={100}>
        <div className="gradient-border">
          <div className="flex flex-col items-center justify-center py-24 rounded-[1.25rem]">
            <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center mb-5 float-slow">
              <svg className="w-7 h-7 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="text-white/60 text-base font-medium mb-2">Projects coming soon</p>
            <p className="text-white/30 text-sm max-w-xs text-center">
              Personal and open-source projects will be showcased here shortly.
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
