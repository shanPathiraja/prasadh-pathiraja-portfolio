export default function Hero() {
  return (
    <section className="hero section-pad" id="home">
      <div className="hero-grid-bg" aria-hidden="true" />

      <div className="hero-top">
        <p className="eyebrow">Full Stack Engineer / Sri Lanka</p>
        <div className="availability">
          <i /> Available for new projects
        </div>
      </div>

      <div className="hero-content">
        <h1>
          Prasadh
          <br />
          <span>Pathiraja</span>
        </h1>
        <div className="hero-aside" aria-hidden="true">
          <div className="code-window">
            <small>prasadh.ts</small>
            <p>
              <span>01</span> const engineer = {'{'}
            </p>
            <p>
              <span>02</span> &nbsp;craft: <b>&apos;end-to-end&apos;</b>,
            </p>
            <p>
              <span>03</span> &nbsp;bias: <b>&apos;maintainable&apos;</b>,
            </p>
            <p>
              <span>04</span> &nbsp;years: <b>4+</b>
            </p>
            <p>
              <span>05</span> {'}'}
            </p>
          </div>
        </div>
      </div>

      <div className="hero-bottom">
        <p>
          4+ years building production applications end-to-end — frontend,
          backend, and everything between.{' '}
          <strong>Biased toward code the team can actually maintain.</strong>
        </p>
        <div className="hero-actions">
          <a className="button button-dark" href="#work">
            View selected work <span aria-hidden="true">→</span>
          </a>
          <a className="button button-line" href="#contact">
            Get in touch <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
