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
