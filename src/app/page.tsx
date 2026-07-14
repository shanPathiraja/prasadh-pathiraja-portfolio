import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Experience from '@/components/Experience';
import Projects from '@/components/Projects';
import Skills from '@/components/Skills';
import Contact from '@/components/Contact';
import WebGLScene from '@/components/WebGLScene';
import SmoothScroll from '@/components/SmoothScroll';
import ScrollProgress from '@/components/ScrollProgress';
import Cursor from '@/components/Cursor';

export default function Home() {
  return (
    <main>
      <SmoothScroll />
      <WebGLScene />
      <ScrollProgress />
      <Cursor />
      <Navbar />
      <Hero />
      <Experience />
      <Projects />
      <Skills />
      <Contact />
    </main>
  );
}
