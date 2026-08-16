'use client';

import Reveal from './Reveal';

const skillGroups = [
  {
    category: 'Frontend & UI',
    color: 'text-[color:var(--coral)]',
    dot: 'bg-[color:var(--coral)]',
    skills: ['React', 'Next.js', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'Redux Toolkit', 'HTML5 / CSS3'],
  },
  {
    category: 'Mobile',
    color: 'text-amber-600',
    dot: 'bg-amber-500',
    skills: ['Flutter', 'Kotlin', 'Java', 'Firebase App Distribution', 'TestFlight', 'App Store Release', 'Play Store Deployment'],
  },
  {
    category: 'Backend & Data',
    color: 'text-rose-600',
    dot: 'bg-rose-500',
    skills: ['Node.js', 'Express.js', 'NestJS', 'REST APIs', 'GraphQL', 'WebSocket', 'Supabase', 'PostgreSQL', 'MongoDB', 'Redis', 'Firebase Firestore'],
  },
  {
    category: 'Cloud & DevOps',
    color: 'text-indigo-600',
    dot: 'bg-indigo-500',
    skills: ['AWS (Lambda, EC2, S3)', 'Google Cloud Platform', 'Firebase', 'Docker', 'CI/CD Pipelines', 'Git', 'GitHub / GitLab'],
  },
  {
    category: 'AI & Architecture',
    color: 'text-teal-600',
    dot: 'bg-teal-500',
    skills: ['GitHub Copilot', 'Claude', 'OpenAI GPT-4', 'Prompt Engineering', 'Microservices', 'Clean Architecture', 'Event-Driven Design', 'Multi-Tenant SaaS'],
  },
];

export default function Skills() {
  return (
    <section id="skills" className="relative py-32 px-6 max-w-5xl mx-auto">
      <Reveal className="mb-16 relative">
        <span className="numeral absolute -top-16 -left-2 text-[120px] md:text-[180px] select-none pointer-events-none opacity-70">
          04
        </span>
        <div className="relative">
          <p className="section-label mb-3">Toolkit</p>
          <h2
            className="text-4xl md:text-5xl font-bold text-[color:var(--ink)] tracking-tight"
            style={{ fontFamily: 'var(--font-grotesk)' }}
          >
            Skills &amp; Technologies
          </h2>
        </div>
      </Reveal>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {skillGroups.map((g, i) => (
          <Reveal key={g.category} delay={i * 80} threshold={0.1}>
            <div className="group relative station rounded-2xl p-5 h-full transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-orange-900/10 overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-0.5 ${g.dot} opacity-70`} />
              <h3 className={`text-xs font-bold tracking-widest uppercase mb-5 ${g.color}`}>
                {g.category}
              </h3>
              <ul className="space-y-3">
                {g.skills.map((s) => (
                  <li key={s} className="flex items-center gap-3 text-[color:var(--ink)] text-sm">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${g.dot}`} />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
