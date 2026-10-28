import { ArrowRight, Mail } from './Icons';

const CHIPS = ['React', 'Node.js', 'PostgreSQL', 'AWS'];

export default function Hero() {
  return (
    <section className="hero" id="home">
      {/* Resting frame */}
      <div className="hero-bg" />
      {/* Intro frame: holds on the glowing monogram, then scales and dissolves away */}
      <div className="hero-intro" aria-hidden="true" />

      <div className="hero-in shell">
        <div className="hero-copy">
          <p className="hello">Hello, I&apos;m</p>
          <h1>
            Buddhika Prasadh
            <br />
            <span>Pathiraja</span>
          </h1>
          <p className="hero-role">Full-Stack Software Engineer</p>
          <p className="lead">
            I build modern web and mobile applications that solve real problems
            and create meaningful experiences.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#projects">
              View My Projects <ArrowRight />
            </a>
            <a className="btn btn-ghost" href="#contact">
              <Mail /> Contact Me
            </a>
          </div>
        </div>
      </div>

      <p className="hand hero-note">
        Code
        <br />
        Build
        <br />
        Improve
        <br />
        Repeat
      </p>

      <div className="scroll-cue">
        <span>Scroll Down</span>
        <i />
      </div>

      <div className="hero-chips" aria-hidden="true">
        {CHIPS.map((c) => (
          <b key={c}>{c}</b>
        ))}
      </div>
    </section>
  );
}
