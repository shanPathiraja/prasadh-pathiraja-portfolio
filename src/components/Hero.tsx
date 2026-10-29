'use client';

import { useEffect, useRef } from 'react';
import type { HeroLogo } from './heroLogo';
import { ArrowRight, Mail } from './Icons';

const CHIPS = ['React', 'Node.js', 'PostgreSQL', 'AWS'];

// The pinned stage runs two acts. The footage scrubs across the first, then the
// monogram resolves out of the last frame — overlapping slightly, so the logo is
// already forming as the shot settles rather than popping in after it.
// Act two is deliberately longer than its animation: the mark arrives at centre
// halfway through and the remainder is a still hold, which is the only way it
// stays put under the scroll, since the stage unpins the moment travel runs out.
// Radians the mark turns per pixel-per-frame of scroll speed. Driven by speed
// rather than by distance scrolled: tie it to absolute position and the mark
// sits permanently edge-on once you are deep in the page, which is no good for
// something that now watermarks every section. This way it tumbles while the
// page moves and falls back to square when it stops.
const SPIN_PER_SPEED = 0.022;
// Hard ceiling on the turn, in radians. Past a quarter turn the mark presents
// its dark side walls to camera, which sweeps across as a shadow — the thing
// that read as too much. Saturated rather than clipped, so a hard flick eases
// into the limit instead of hitting a wall.
const SPIN_MAX = 0.62;

const SCRUB_END = 0.60;
const LOGO_START = 0.56;

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
  const logoRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const logoCanvas = logoRef.current;
    if (!section || !stage || !video || !canvas || !logoCanvas) return;

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
    let logoLive = false;
    let spin = 0;
    let speed = 0;
    let lastY = window.scrollY;
    let mx = 0;
    let my = 0;
    let mxTarget = 0;
    let myTarget = 0;
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

    // --- the monogram ---------------------------------------------------------
    // Pulled in only once the scrub is most of the way through, so neither the
    // shader source nor the SDF bake competes with the frames for the main thread.
    let logo: HeroLogo | null = null;
    let logoAsked = false;
    const small = window.matchMedia('(max-width: 860px)').matches;
    const wantLogo = () => {
      if (logoAsked) return;
      logoAsked = true;
      import('./heroLogo')
        .then((m) =>
          m.createHeroLogo(logoCanvas, {
            steps: small ? 42 : 56,
            maxDpr: small ? 1.25 : 1.75,
          }),
        )
        .then((made) => {
          if (dead) made?.dispose();
          else if (made) {
            logo = made;
            logoCanvas.dataset.on = '1';
            // Landed below the hero: there is no entrance to play, so arrive
            // resolved rather than easing up from wherever eased had stalled.
            if (!visible) eased = target;
            // The loop stops itself when the hero is off screen and no logo is up
            // yet. Land past the hero before this import resolves and that has
            // already happened, so the mark would never draw a single frame.
            if (!raf) raf = requestAnimationFrame(tick);
          }
        })
        .catch(() => {
          /* no WebGL2, or the shader wouldn't build: the hero just ends on the shot */
        });
    };

    // --- scroll driver, shared by both renderers ------------------------------
    const measure = () => {
      const travel = section.offsetHeight - stage.offsetHeight;
      const scrolled = -section.getBoundingClientRect().top;
      target = travel > 0 ? Math.min(1, Math.max(0, scrolled / travel)) : 0;
      // Asked for off target, never off eased. eased only moves while the loop
      // runs, and the loop stops when the hero is off screen with no mark up —
      // so asking off eased lets it stall below the threshold that would have
      // created the mark, with nothing able to advance it. target comes
      // straight from scroll position and is always current.
      if (!logoAsked && target > LOGO_START - 0.22) wantLogo();
    };

    const tick = () => {
      // Ease toward the scroll position so a flung scroll still reads as a camera move.
      eased += (target - eased) * 0.12;
      if (Math.abs(target - eased) < 0.0004) eased = target;
      stage.style.setProperty('--p', eased.toFixed(4));

      // Once the copy has faded out it must stop catching clicks, since the stage stays pinned.
      const nowFaded = eased > 0.5;
      if (nowFaded !== faded) {
        faded = nowFaded;
        if (faded) stage.dataset.faded = 'on';
        else delete stage.dataset.faded;
      }

      // Act one: the footage, finished well before the stage unpins.
      render(Math.min(1, eased / SCRUB_END));

      // Act two: the monogram, warmed up a little ahead of its entrance.
      const logoP = (eased - LOGO_START) / (1 - LOGO_START);
      // Scroll speed, smoothed over a few frames so a trackpad's jitter does not
      // read as a shove, then eased into the angle the letters are driven to.
      const y = window.scrollY;
      // Clamp the per-frame delta: a jump — an anchor link, a scrollbar drag,
      // scroll restoration — lands thousands of pixels in one frame, which the
      // filter would otherwise read as a colossal flick and fling the mark.
      const dy = Math.max(-140, Math.min(140, y - lastY));
      speed = speed * 0.85 + dy * 0.15;
      lastY = y;
      const want = SPIN_MAX * Math.tanh((speed * SPIN_PER_SPEED) / SPIN_MAX);
      spin += (want - spin) * 0.15;

      // Eased well below the pointer's own rate, so the mark trails the cursor
      // rather than snapping to it.
      mx += (mxTarget - mx) * 0.08;
      my += (myTarget - my) * 0.08;
      logo?.render(Math.max(0, logoP), performance.now() / 1000, spin, mx, my);

      // Once the mark is up it is fixed to the viewport and outlives the hero,
      // so the loop has to keep running after the section stops intersecting —
      // otherwise the orbits freeze on whatever frame the handover caught.
      // Deliberately not gated on logoP: that is derived from eased, which only
      // this loop advances, so gating on it lets the loop stop at a value it
      // then has no way to climb out of. render() no-ops below zero anyway.
      logoLive = !!logo;
      raf = visible || logoLive ? requestAnimationFrame(tick) : 0;
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
        if ((visible || logoLive) && !raf) raf = requestAnimationFrame(tick);
      },
      { rootMargin: '10% 0px' },
    );
    io.observe(section);

    measure();
    eased = target;
    raf = requestAnimationFrame(tick);
    // Listened for on the window, not the canvas: the canvas is behind the page
    // content and takes no pointer events, so it never sees the cursor itself.
    const onPointer = (e: PointerEvent) => {
      mxTarget = (e.clientX / window.innerWidth) * 2 - 1;
      myTarget = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    window.addEventListener('pointermove', onPointer, { passive: true });

    return () => {
      dead = true;
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
      window.removeEventListener('pointermove', onPointer);
      logo?.dispose();
      delete section.dataset.scrub;
      delete stage.dataset.frames;
      delete logoCanvas.dataset.on;
    };
  }, []);

  return (
    <>
      {/* Deliberately outside the section: the mark is fixed to the viewport and
          has to outlive the hero, and the stage is both sticky and
          overflow-hidden, which is exactly what clips a fixed descendant. */}
      <canvas className="hero-logo" ref={logoRef} aria-hidden="true" />

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
    </>
  );
}
