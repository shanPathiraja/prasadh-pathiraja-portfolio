const JOBS = [
  {
    role: 'Software Engineer',
    company: 'Fcode Labs (Pvt) Ltd',
    period: '2022 — Present',
    summary:
      'Full-stack JavaScript/TypeScript features end-to-end across several client-facing products, with deliberate build-vs-buy calls favouring maintainable code.',
    projects: [
      ['Bevisioneers', 'AI coaching platform for young entrepreneurs.', 'Next.js · NestJS · FastAPI'],
      ['Gemlux', 'Gemstone-scanning SaaS with a custom device and cloud platform.', 'React · NestJS · AWS'],
      ['Hani', 'AI hotel and travel discovery, built natively for iOS.', 'Flutter · BLoC · NestJS'],
      ['Personal Coaching App', 'Real-time progress tracking for coaches and clients.', 'Flutter · WebSocket · AWS'],
      ['Lynq', 'Workflow and employee management platform.', 'AWS Lambda · DynamoDB'],
      ['CPO2M3', 'Apparel ERP connecting order intake through production.', 'TypeScript · GraphQL'],
    ],
  },
  {
    role: 'Associate Software Engineer',
    company: 'Syntax Genie (Pvt) Ltd',
    period: '2021 — 2022',
    summary:
      'Full-stack JavaScript and Java development across enterprise, education and energy domains, building custom components and REST APIs.',
    projects: [
      ['Scrapbook', 'Cloud-based learning management system.', 'React · Node.js · Firebase'],
      ['IEEE IRP Platform', 'Enterprise resource planning portal and public site.', 'React · Next.js · Spring Boot'],
      ['Meemure', 'Client website for a remote mountain village.', 'React · CI/CD'],
      ['Altavision Solar', 'Automated solar quotation system.', 'React · Firebase · CI/CD'],
    ],
  },
];

export default function Experience() {
  return (
    <section className="section" id="experience" data-prog>
      <div className="shell">
        <div className="stagger">
          <p className="eyebrow">Career</p>
          <h2 className="h2">
            Where I&apos;ve <em>Shipped</em>
          </h2>
        </div>

        <div className="exp-list stagger">
          {JOBS.map((j) => (
            <article className="exp card" key={j.company}>
              <div className="exp-top">
                <h3>
                  {j.role} <b>@ {j.company}</b>
                </h3>
                <time>{j.period}</time>
              </div>
              <p>{j.summary}</p>
              <div className="exp-projects stagger" data-dir="left">
                {j.projects.map((p) => (
                  <div className="exp-proj" key={p[0]}>
                    <strong>{p[0]}</strong>
                    <span>{p[1]}</span>
                    <small>{p[2]}</small>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
