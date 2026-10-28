import Image from 'next/image';
import { Pin, Briefcase, Mail, Clock } from './Icons';
import { SOCIALS } from './Nav';

const FACTS = [
  { icon: <Pin />, label: 'Location', value: 'Colombo, Sri Lanka' },
  { icon: <Briefcase />, label: 'Experience', value: '4+ Years' },
  { icon: <Mail />, label: 'Email', value: SOCIALS.email },
  { icon: <Clock />, label: 'Availability', value: 'Open to new opportunities' },
];

export default function About() {
  return (
    <section className="section about" id="about">
      <div className="shell about-grid">
        <div className="reveal">
          <p className="eyebrow">About Me</p>
          <h2 className="h2">
            Crafting Digital
            <br />
            <em>Experiences</em>
          </h2>
          <p className="lead" style={{ marginTop: '1.4rem', maxWidth: '32rem' }}>
            I&apos;m a Full-Stack Software Engineer with 4+ years of experience
            building scalable web and mobile applications. I turn ideas into
            reliable, high-performance products using modern technologies and
            clean architecture.
          </p>

          <div className="about-facts">
            {FACTS.map((f) => (
              <div className="fact" key={f.label}>
                <i>{f.icon}</i>
                <span>{f.label}</span>
                {f.value}
              </div>
            ))}
          </div>
        </div>

        <div className="about-visual reveal">
          <Image
            src="/hero/desk.webp"
            alt="Workspace overlooking the city at dusk"
            width={1672}
            height={941}
            sizes="(max-width: 980px) 100vw, 560px"
          />
        </div>
      </div>
    </section>
  );
}
