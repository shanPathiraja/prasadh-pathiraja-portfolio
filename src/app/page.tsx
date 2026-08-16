import Navbar from '@/components/Navbar';
import StationRail from '@/components/StationRail';
import Hero from '@/components/Hero';
import Experience from '@/components/Experience';
import Projects from '@/components/Projects';
import Skills from '@/components/Skills';
import Contact from '@/components/Contact';
import WebGLScene from '@/components/WebGLScene';
import SmoothScroll from '@/components/SmoothScroll';
import Cursor from '@/components/Cursor';

export default function Home() {
  return (
    <main>
      <SmoothScroll />
      <WebGLScene />
      <Cursor />
      <Navbar />
      <StationRail />
      <Hero />
      <Experience />
      <Projects />
      <Skills />
      <Contact />
    </main>
  );
}
