type ProjectType = 'creative' | 'wild' | 'nexus' | 'fit' | 'solara';

type Project = {
  name: string;
  tagline: string;
  description: string;
  tech: string[];
  href: string;
  className: string;
  type: ProjectType;
};

/* Tech lists are the verified stacks of each deployed site. */
const featured: Project[] = [
  {
    name: 'Creative Paradise',
    tagline: 'We will design your idea',
    description:
      'A WebGL reimagining of a Sri Lankan design studio — GPU water-ripple cursor, scroll-driven 3D scenes, and a 28-piece gallery rendered on the canvas.',
    tech: ['Next.js', 'React Three Fiber', 'GLSL', 'Lenis'],
    href: 'https://creative-paradise-webgl.vercel.app',
    className: 'project--creative project--wide',
    type: 'creative',
  },
  {
    name: 'Wilpattu Wilds',
    tagline: 'Into the wild heart of Sri Lanka',
    description:
      'A safari lodge and tour booking experience for Sri Lanka’s largest national park, built around an immersive 3D jungle canvas.',
    tech: ['Next.js', 'React Three Fiber', 'Three.js', 'Lenis'],
    href: 'https://wilpattu-travels.vercel.app',
    className: 'project--wild project--wide',
    type: 'wild',
  },
  {
    name: 'Nexus',
    tagline: 'We make brands win',
    description:
      'A sharp digital home for a full-service agency — case studies, services, and a five-stage process narrative.',
    tech: ['Next.js', 'TypeScript', 'Tailwind'],
    href: 'https://nexus-agency-liard.vercel.app',
    className: 'project--nexus',
    type: 'nexus',
  },
  {
    name: 'FitTrack',
    tagline: 'Train smarter, not harder',
    description:
      'Product site for an AI fitness app: adaptive plans, camera form analysis, recovery scoring, and tiered pricing.',
    tech: ['Next.js', 'Tailwind', 'Product site'],
    href: 'https://fittrack-app-nine.vercel.app',
    className: 'project--fit',
    type: 'fit',
  },
  {
    name: 'Solara',
    tagline: 'Stop managing tasks. Start finishing them.',
    description:
      'Marketing site for an AI task-intelligence platform — priority engine, smart scheduling, and team analytics.',
    tech: ['Next.js', 'Tailwind', 'SaaS'],
    href: 'https://solara-saas.vercel.app',
    className: 'project--solara',
    type: 'solara',
  },
];

function BrowserBar({ domain }: { domain: string }) {
  return (
    <div className="browser-bar">
      <span />
      <span />
      <span />
      <b>{domain}</b>
    </div>
  );
}

function ProjectVisual({ type }: { type: ProjectType }) {
  if (type === 'creative') {
    return (
      <div className="visual visual-creative">
        <BrowserBar domain="creative-paradise-webgl.vercel.app" />
        <div className="creative-canvas">
          <small>INDEPENDENT CREATIVE STUDIO / COLOMBO</small>
          <strong>
            IDEAS NEED
            <br />
            <i>ROOM</i> TO PLAY.
          </strong>
          <div className="creative-orbit">
            <span>CP</span>
          </div>
        </div>
      </div>
    );
  }
  if (type === 'wild') {
    return (
      <div className="visual visual-wild">
        <BrowserBar domain="wilpattu-travels.vercel.app" />
        <div className="wild-canvas">
          <div className="sun" />
          <div className="land land-back" />
          <div className="land land-front" />
          <small>WILPATTU / SRI LANKA</small>
          <strong>
            Answer the
            <br />
            call of the wild.
          </strong>
          <b className="wild-stamp">
            EST.
            <br />
            2024
          </b>
        </div>
      </div>
    );
  }
  if (type === 'nexus') {
    return (
      <div className="visual visual-nexus">
        <BrowserBar domain="nexus-agency.vercel.app" />
        <div className="nexus-canvas">
          <small>NEXUS®</small>
          <strong>
            BRANDS
            <br />
            THAT MOVE
          </strong>
          <div className="nexus-ball">N</div>
        </div>
      </div>
    );
  }
  if (type === 'fit') {
    return (
      <div className="visual visual-fit">
        <BrowserBar domain="fittrack-app-nine.vercel.app" />
        <div className="fit-canvas">
          <div>
            <small>WEEKLY LOAD</small>
            <strong>82%</strong>
          </div>
          <div className="fit-chart">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <b>5 DAY STREAK</b>
        </div>
      </div>
    );
  }
  return (
    <div className="visual visual-solara">
      <BrowserBar domain="solara-saas.vercel.app" />
      <div className="solara-canvas">
        <small>GOOD MORNING, PRASADH</small>
        <strong>
          Make space
          <br />
          for what matters.
        </strong>
        <div className="task">
          <i /> Prepare product review <b>10:30</b>
        </div>
        <div className="task">
          <i /> Ship portfolio update <b>14:00</b>
        </div>
      </div>
    </div>
  );
}

export default function Work() {
  return (
    <section className="work section-pad" id="work">
      <div className="section-head section-head-light">
        <p className="eyebrow">03 / Selected work</p>
        <h2>
          Five builds.
          <br />
          <em>One standard.</em>
        </h2>
        <p>Strategy, systems, interface, and engineering — connected.</p>
      </div>

      <div className="project-grid">
        {featured.map((project, index) => (
          <article className={`project-card ${project.className}`} key={project.name}>
            <a
              className="project-link"
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit the ${project.name} site`}
            >
              <ProjectVisual type={project.type} />
              <div className="project-info">
                <div className="project-number">0{index + 1}</div>
                <div>
                  <p>{project.tagline}</p>
                  <h3>{project.name}</h3>
                  <span>{project.description}</span>
                  <div className="tags">
                    {project.tech.map((tag) => (
                      <small key={tag}>{tag}</small>
                    ))}
                  </div>
                </div>
                <div className="project-arrow">
                  <span aria-hidden="true">↗</span>
                </div>
              </div>
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
