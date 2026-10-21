import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import Experience from '@/components/Experience';
import Work from '@/components/Work';
import Skills from '@/components/Skills';
import Contact from '@/components/Contact';
import SiteFooter from '@/components/SiteFooter';

export default function Home() {
  return (
    <div className="site-shell">
      <Nav />
      <main>
        <Hero />
        <Experience />
        <Work />
        <Skills />
        <Contact />
      </main>
      <SiteFooter />
    </div>
  );
}
