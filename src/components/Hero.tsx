import { ArrowRight, Mail } from './Icons';

const CHIPS = ['React', 'Node.js', 'PostgreSQL', 'AWS'];

export default function Hero() {
  return (
    <section className="hero" id="home">
      {/* Final frame of the shot. Carries reduced-motion and any case where the video can't play. */}
      <div className="hero-bg" />

      {/* The shot itself: pulls back from the monogram to the whole room, then holds. */}
      <video
        className="hero-video"
        autoPlay
        muted
        playsInline
        preload="auto"
        poster="/hero/hero-poster.webp"
        aria-hidden="true"
      >
        <source media="(max-width: 860px)" src="/hero/hero-720.mp4" type="video/mp4" />
        <source src="/hero/hero-1080.mp4" type="video/mp4" />
      </video>

      <div className="hero-scrim" aria-hidden="true" />

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
