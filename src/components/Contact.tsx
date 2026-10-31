import { ArrowRight, Github, Linkedin, Mail } from './Icons';
import { SOCIALS } from '@/lib/socials';

export default function Contact() {
  return (
    <section className="section contact" id="contact" data-prog>
      <div className="contact-bg" aria-hidden="true" />
      <div className="shell">
        <div className="stagger">
          <p className="eyebrow">Let&apos;s Work Together</p>
          <h2 className="h2">
            Have a <em>Project</em> in Mind?
          </h2>
          <p className="lead">
            I&apos;m always open to discussing new opportunities and exciting
            projects. Let&apos;s build something great together!
          </p>
          <a className="btn btn-primary" href={`mailto:${SOCIALS.email}`}>
            Get In Touch <ArrowRight />
          </a>

          <div className="socials stagger" data-dir="pop">
            <a href={SOCIALS.github} target="_blank" rel="noreferrer" aria-label="GitHub">
              <Github />
            </a>
            <a href={SOCIALS.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <Linkedin />
            </a>
            <a href={`mailto:${SOCIALS.email}`} aria-label="Email">
              <Mail />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
