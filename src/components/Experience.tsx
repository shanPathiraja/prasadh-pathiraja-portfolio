/* Tech stacks here are the verified ones from each project, not generic guesses. */
const experience = [
  {
    role: 'Software Engineer',
    company: 'Fcode Labs',
    period: '2022—Present',
    summary:
      'Shipping ambitious products across AI, SaaS, mobile, and enterprise operations.',
    projects: [
      ['Bevisioneers', 'AI coaching platform for young entrepreneurs.', 'Next.js · NestJS · FastAPI'],
      ['Gemlux', 'Gemstone-scanning SaaS with a custom device and cloud platform.', 'React · NestJS · AWS'],
      ['Hani', 'AI hotel and travel discovery, built natively for iOS.', 'Flutter · BLoC · NestJS'],
      ['Personal Coaching App', 'Real-time progress tracking for coaches and clients.', 'Flutter · WebSocket · AWS'],
      ['Lynq', 'Workflow and employee management for modern teams.', 'AWS Lambda · DynamoDB · WebSocket'],
      ['CPO2M3', 'Apparel ERP connecting order intake through production.', 'TypeScript · GraphQL · Microservices'],
    ],
  },
  {
    role: 'Associate Software Engineer',
    company: 'Syntax Genie',
    period: '2021—2022',
    summary:
      'Built dependable web platforms for education, research, tourism, and energy.',
    projects: [
      ['Scrapbook', 'Cloud-based learning management system.', 'React · Node.js · Firebase'],
      ['IEEE IRP Platform', 'Enterprise resource planning portal and public site.', 'React · Next.js · Spring Boot'],
      ['Meemure', 'A digital gateway to Sri Lanka’s remote mountain village.', 'React · CI/CD'],
      ['Altavision Solar', 'Automated quotation system for solar specialists.', 'React · Firebase · CI/CD'],
    ],
  },
];

export default function Experience() {
  return (
    <section className="experience section-pad" id="experience">
      <div className="section-head">
        <p className="eyebrow">02 / Where I’ve shipped</p>
        <h2>
          Production work,
          <br />
          <em>not side quests.</em>
        </h2>
        <p>Products used by real people, built with real constraints.</p>
      </div>

      <div className="experience-list">
        {experience.map((job, jobIndex) => (
          <article className="job" key={job.company}>
            <div className="job-meta">
              <span>0{jobIndex + 1}</span>
              <time>{job.period}</time>
            </div>
            <div className="job-title">
              <h3>{job.role}</h3>
              <p>@ {job.company}</p>
              <small>{job.summary}</small>
            </div>
            <div className="job-projects">
              {job.projects.map((project) => (
                <div className="experience-project" key={project[0]}>
                  <div>
                    <strong>{project[0]}</strong>
                    <span>{project[1]}</span>
                  </div>
                  <small>{project[2]}</small>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
