'use client';

import { useEffect, useRef } from 'react';
import { ArrowRight, Mail } from './Icons';

const CHIPS = ['React', 'Node.js', 'PostgreSQL', 'AWS'];

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const video = videoRef.current;
    if (!section || !stage || !video) return;

    // Without JS, or with reduced motion, the markup stays a plain 100vh hero that
    // autoplays once. The tall pinned layout only switches on when we can drive it.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    section.dataset.scrub = 'on';
    video.pause();

    let raf = 0;
    let target = 0;
    let eased = 0;
    let seekable = false;
    let visible = true;
    let faded = false;

    const onLoaded = () => {
      seekable = true;
      // Safari (iOS especially) won't paint a seek until the element has been activated once.
      video.play().then(() => video.pause()).catch(() => {});
    };
    if (video.readyState >= 2) onLoaded();
    else video.addEventListener('loadeddata', onLoaded, { once: true });

    const measure = () => {
      const travel = section.offsetHeight - stage.offsetHeight;
      const scrolled = -section.getBoundingClientRect().top;
      target = travel > 0 ? Math.min(1, Math.max(0, scrolled / travel)) : 0;
    };

    const tick = () => {
      // Ease toward the scroll position so a flung scroll still reads as a camera move.
      eased += (target - eased) * 0.12;
      if (Math.abs(target - eased) < 0.0004) eased = target;
      stage.style.setProperty('--p', eased.toFixed(4));

      // Once the copy has faded out it must stop catching clicks, since the stage stays pinned.
      const nowFaded = eased > 0.6;
      if (nowFaded !== faded) {
        faded = nowFaded;
        if (faded) stage.dataset.faded = 'on';
        else delete stage.dataset.faded;
      }

      if (seekable && video.duration) {
        // Stop just short of the end; some decoders refuse to paint exactly at duration.
        const t = eased * (video.duration - 0.05);
        if (Math.abs(video.currentTime - t) > 0.008) video.currentTime = t;
      }
      raf = visible ? requestAnimationFrame(tick) : 0;
    };

    // Only burn frames while the hero is actually on screen.
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !raf) raf = requestAnimationFrame(tick);
      },
      { rootMargin: '10% 0px' },
    );
    io.observe(section);

    measure();
    eased = target;
    raf = requestAnimationFrame(tick);
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
      delete section.dataset.scrub;
    };
  }, []);

  return (
    <section className="hero" id="home" ref={sectionRef}>
      <div className="hero-stage" ref={stageRef}>
        {/* Resting frame. Carries reduced motion and anything that can't play video. */}
        <div className="hero-bg" />

        <video
          className="hero-video"
          ref={videoRef}
          autoPlay
          muted
          playsInline
          preload="auto"
          poster="/hero/hero-poster.webp"
          aria-hidden="true"
        >
          <source media="(max-width: 860px)" src="/hero/hero-scrub-720.mp4" type="video/mp4" />
          <source src="/hero/hero-scrub-1080.mp4" type="video/mp4" />
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

        {/* Each of these is a parallax shell wrapping its own entrance animation: a CSS
            animation owns transform/opacity outright, so the two can't share an element. */}
        <div className="hero-note">
          <p className="hand">
            Code
            <br />
            Build
            <br />
            Improve
            <br />
            Repeat
          </p>
        </div>

        <div className="scroll-cue">
          <div className="scroll-cue-in">
            <span>Scroll Down</span>
            <i />
          </div>
        </div>

        <div className="hero-chips" aria-hidden="true">
          <div className="hero-chips-in">
            {CHIPS.map((c) => (
              <b key={c}>{c}</b>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
