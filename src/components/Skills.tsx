const skills: [string, string[]][] = [
  ['Frontend & UI', ['React', 'Next.js', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'Redux Toolkit', 'HTML5 / CSS3']],
  ['Mobile', ['Flutter', 'Kotlin', 'Java', 'Firebase App Distribution', 'TestFlight', 'App Store', 'Play Store']],
  ['Backend & Data', ['Node.js', 'Express.js', 'NestJS', 'REST APIs', 'GraphQL', 'WebSocket', 'PostgreSQL', 'MongoDB', 'Redis']],
  ['Cloud & DevOps', ['AWS (Lambda, EC2, S3)', 'Google Cloud Platform', 'Firebase', 'Docker', 'CI/CD Pipelines', 'Git']],
  ['AI & Architecture', ['RAG pipelines', 'OpenAI GPT-4', 'Prompt engineering', 'Microservices', 'Clean architecture', 'Multi-tenant SaaS']],
];

export default function Skills() {
  return (
    <section className="skills section-pad" id="skills">
      <div className="skills-intro">
        <p className="eyebrow">04 / The toolkit</p>
        <h2>
          Wide enough to
          <br />
          see the system.
          <br />
          <em>
            Deep enough
            <br />
            to build it.
          </em>
        </h2>
        <p>
          I choose tools for the problem, not the trend. The constant is
          thoughtful architecture and a product that feels right.
        </p>
      </div>

      <div className="skill-list">
        {skills.map((group, index) => (
          <article className="skill-row" key={group[0]}>
            <span>0{index + 1}</span>
            <div>
              <h3>{group[0]}</h3>
              <p>{group[1].join(' · ')}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
