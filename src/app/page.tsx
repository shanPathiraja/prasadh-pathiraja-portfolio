import Nav from '@/components/Nav';
import Motion from '@/components/Motion';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Skills from '@/components/Skills';
import Projects from '@/components/Projects';
import Experience from '@/components/Experience';
import Contact from '@/components/Contact';
import SiteFooter from '@/components/SiteFooter';

export default function Home() {
  return (
    <>
      {/* One field behind the whole document. Fixed, so it does not restart at
          every section — that is the entire point of it. */}
      <div className="bg-flow" aria-hidden="true">
        <i className="bg-aurora" />
        <i className="bg-aurora-2" />
        <i className="bg-beams" />
        <i className="bg-stars" />
        <i className="bg-stars-far" />
        <i className="bg-grain" />
      </div>
      <Nav />
      <Motion />
      <main>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Contact />
      </main>
      <SiteFooter />
    </>
  );
}
