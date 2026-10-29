'use client';

import { useEffect, useRef } from 'react';
import { ArrowRight, Mail } from './Icons';

const CHIPS = ['React', 'Node.js', 'PostgreSQL', 'AWS'];

// 48 stills over ~130vh of phone scroll is a frame every ~23px, which reads as
// continuous. Measured against the 720p cut it replaces: 1.16MB vs 1.60MB at the
// same SSIM (0.8888 vs 0.8896).
const FRAME_COUNT = 48;
const FRAME_W = 960;
const FRAME_H = 540;
const frameSrc = (i: number) => `/hero/frames/f_${String(i + 1).padStart(2, '0')}.avif`;

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!section || !stage || !video || !canvas) return;

    // Without JS, or with reduced motion, the markup stays a plain 100vh hero that
    // autoplays once. The tall pinned layout only switches on when we can drive it.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    section.dataset.scrub = 'on';
    video.pause();

    let raf = 0;
    let target = 0;
    let eased = 0;
    let visible = true;
    let faded = false;
    let dead = false;

    // --- the two ways to land on a frame --------------------------------------
    // Desktop seeks the video. Inter-frame compression gives 192 seek targets for
    // the bytes a 72-still sequence would spend on 72, and decoding is reliable.
    let seekable = false;
    const seekVideo = (p: number) => {
      if (!seekable || !video.duration) return;
      // Stop just short of the end; some decoders refuse to paint exactly at duration.
      const t = p * (video.duration - 0.05);
      if (Math.abs(video.currentTime - t) > 0.008) video.currentTime = t;
    };
    const onLoaded = () => {
      seekable = true;
      // Safari (iOS especially) won't paint a seek until the element has been activated once.
      video.play().then(() => video.pause()).catch(() => {});
    };
    if (video.readyState >= 2) onLoaded();
    else video.addEventListener('loadeddata', onLoaded, { once: true });

    // Phones paint pre-decoded stills. iOS Safari parks video seeks while the
    // compositor runs a momentum scroll, so currentTime scrubbing stalls there
    // exactly when the hero is being used.
    const ctx = canvas.getContext('2d');
    const frames: HTMLImageElement[] = [];
    let drawn = -1;
    const drawFrame = (p: number) => {
      if (!ctx) return;
      const i = Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(p * (FRAME_COUNT - 1))));
      if (i === drawn) return;
      const img = frames[i];
      if (!img?.complete || !img.naturalWidth) return;
      ctx.drawImage(img, 0, 0, FRAME_W, FRAME_H);
      drawn = i;
    };

    let render = seekVideo;

    // --- scroll driver, shared by both renderers ------------------------------
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

      render(eased);
      raf = visible ? requestAnimationFrame(tick) : 0;
    };

    // --- pick a renderer ------------------------------------------------------
    // Decoding the first still doubles as the AVIF support test, and it's a frame
    // we need anyway. Anything that can't decode it keeps the video path.
    if (window.matchMedia('(max-width: 860px)').matches) {
      const first = new Image();
      first.src = frameSrc(0);
      first
        .decode()
        .then(() => {
          if (dead) return;
          frames[0] = first;
          let loaded = 1;
          for (let i = 1; i < FRAME_COUNT; i++) {
            const img = new Image();
            img.src = frameSrc(i);
            frames[i] = img;
            img
              .decode()
              .catch(() => {})
              .then(() => {
                if (dead || ++loaded < FRAME_COUNT) return;
                // Hand over only once the whole set is in memory, so a scroll
                // mid-preload can never land on a frame that isn't there yet.
                render = drawFrame;
                drawn = -1;
                drawFrame(eased);
                stage.dataset.frames = 'on';
              });
          }
        })
        .catch(() => {
          // No AVIF: no <source> matched at this width, so point the element at
          // the 720p cut by hand rather than dropping to a static hero.
          if (dead) return;
          video.src = '/hero/hero-scrub-720.mp4';
          video.load();
        });
    }

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
      dead = true;
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
      delete section.dataset.scrub;
      delete stage.dataset.frames;
    };
  }, []);

  return (
    <section className="hero" id="home" ref={sectionRef}>
      <div className="hero-stage" ref={stageRef}>
        {/* Resting frame. Carries reduced motion and anything that can't play video. */}
        <div className="hero-bg" />

        {/* Only the 1080p cut is wired to a media query, so a phone fetches no video
            at all unless the AVIF probe above fails and asks for the 720p one. */}
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
          <source media="(min-width: 861px)" src="/hero/hero-scrub-1080.mp4" type="video/mp4" />
        </video>

        <canvas
          className="hero-frames"
          ref={canvasRef}
          width={FRAME_W}
          height={FRAME_H}
          aria-hidden="true"
        />

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
