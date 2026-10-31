import { Code, Server, Phone, Cloud, Database, Beaker } from './Icons';

const CATS = [
  { icon: <Code />, title: 'Frontend', items: 'React, Next.js, TypeScript, Redux Toolkit, Tailwind CSS' },
  { icon: <Server />, title: 'Backend', items: 'NestJS, Express.js, Node.js, Python FastAPI, REST, GraphQL' },
  { icon: <Phone />, title: 'Mobile', items: 'Flutter (BLoC), Kotlin, Java, TestFlight, Play Store' },
  { icon: <Cloud />, title: 'Cloud & DevOps', items: 'AWS (Lambda, EC2, S3), Google Cloud, Firebase, Docker, CI/CD' },
  { icon: <Database />, title: 'Database', items: 'PostgreSQL, MongoDB, Redis, Firestore, Supabase' },
  { icon: <Beaker />, title: 'AI & Architecture', items: 'RAG pipelines, Microservices, Clean architecture, Multi-tenant SaaS' },
];

export default function Skills() {
  return (
    <section className="section" id="skills" data-prog>
      <div className="shell tech-grid">
        {/* 3D object pulled for now — see the note in About.
            <SectionObject shape="lattice" className="tech-visual reveal" /> */}

        <div className="stagger">
          <p className="eyebrow">Tech Stack</p>
          <h2 className="h2">
            Technologies I <em>Work With</em>
          </h2>

          <div className="tech-cats stagger" style={{ marginTop: '2.4rem' }}>
            {CATS.map((c) => (
              <div className="tech-cat" key={c.title}>
                <h3>
                  <i>{c.icon}</i>
                  {c.title}
                </h3>
                <p>{c.items}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
