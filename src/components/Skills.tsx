'use client';

import Reveal from './Reveal';

const skillGroups = [
  {
    category: 'Frontend & UI',
    color: 'text-cyan-300',
    bar: 'from-cyan-400/60',
    skills: ['React', 'Next.js', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'Redux Toolkit', 'HTML5 / CSS3'],
  },
  {
    category: 'Mobile',
    color: 'text-orange-300',
    bar: 'from-orange-400/60',
    skills: ['Flutter', 'Kotlin', 'Java', 'Firebase App Distribution', 'TestFlight', 'App Store Release', 'Play Store Deployment'],
  },
  {
    category: 'Backend & Data',
    color: 'text-fuchsia-300',
    bar: 'from-fuchsia-400/60',
    skills: ['Node.js', 'Express.js', 'NestJS', 'REST APIs', 'GraphQL', 'WebSocket', 'Supabase', 'PostgreSQL', 'MongoDB', 'Redis', 'Firebase Firestore'],
  },
  {
    category: 'Cloud & DevOps',
    color: 'text-violet-300',
    bar: 'from-violet-400/60',
    skills: ['AWS (Lambda, EC2, S3)', 'Google Cloud Platform', 'Firebase', 'Docker', 'CI/CD Pipelines', 'Git', 'GitHub / GitLab'],
  },
  {
    category: 'AI & Architecture',
    color: 'text-emerald-300',
    bar: 'from-emerald-400/60',
    skills: ['GitHub Copilot', 'Claude', 'OpenAI GPT-4', 'Prompt Engineering', 'Microservices', 'Clean Architecture', 'Event-Driven Design', 'Multi-Tenant SaaS'],
  },
];

export default function Skills() {
  return (
    <section id="skills" className="relative py-28 px-6 max-w-5xl mx-auto">
      <Reveal className="mb-16">
        <p className="section-label mb-3">Toolkit</p>
        <h2
          className="text-4xl md:text-5xl font-bold text-white tracking-tight"
          style={{ fontFamily: 'var(--font-grotesk)' }}
        >
          Skills &amp; Technologies
        </h2>
      </Reveal>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {skillGroups.map((g, i) => (
          <Reveal key={g.category} delay={i * 80} threshold={0.1}>
            <div className="group relative glass rounded-2xl p-5 h-full transition-all duration-300 hover:-translate-y-1.5 hover:border-white/20 hover:shadow-xl hover:shadow-violet-950/30 overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${g.bar} to-transparent`} />
              <h3 className={`text-xs font-bold tracking-widest uppercase mb-5 ${g.color}`}>
                {g.category}
              </h3>
              <ul className="space-y-3">
                {g.skills.map((s) => (
                  <li key={s} className="flex items-center gap-3 text-white/70 text-sm">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 bg-current ${g.color}`} />
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
