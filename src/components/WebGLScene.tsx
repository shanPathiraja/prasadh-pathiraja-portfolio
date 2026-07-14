'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/* ------------------------------------------------------------------ */
/* Shaders                                                             */
/* ------------------------------------------------------------------ */

const PARTICLE_VERT = /* glsl */ `
  attribute vec3 aGalaxy;
  attribute vec3 aHelix;
  attribute vec3 aWave;
  attribute vec3 aShell;
  attribute vec3 aKnot;
  attribute vec3 aSeed;

  uniform float uProgress;   // 0..4 across the five sections
  uniform float uTime;
  uniform vec2  uMouse;      // view-space coords at particle depth
  uniform float uPixelRatio;

  varying vec3  vColor;
  varying float vAlpha;

  float ease(float t) { return t * t * (3.0 - 2.0 * t); }

  void main() {
    float s1 = ease(clamp(uProgress,        0.0, 1.0));
    float s2 = ease(clamp(uProgress - 1.0,  0.0, 1.0));
    float s3 = ease(clamp(uProgress - 2.0,  0.0, 1.0));
    float s4 = ease(clamp(uProgress - 3.0,  0.0, 1.0));

    vec3 pos = aGalaxy;
    pos = mix(pos, aHelix, s1);
    pos = mix(pos, aWave,  s2);
    pos = mix(pos, aShell, s3);
    pos = mix(pos, aKnot,  s4);

    // Rolling ocean displacement — strongest while in the wave formation
    float waveAmt = s2 * (1.0 - s3);
    pos.y += waveAmt * (sin(pos.x * 0.55 + uTime * 1.3) + cos(pos.z * 0.8 + uTime * 0.9)) * 1.15;

    // Gentle per-particle breathing so nothing is ever static
    pos += 0.16 * vec3(
      sin(uTime * 0.6 + aSeed.x * 30.0),
      cos(uTime * 0.5 + aSeed.y * 30.0),
      sin(uTime * 0.7 + aSeed.z * 30.0)
    );

    // Whole-system swirl; the galaxy spins faster, later shapes drift slowly
    float spin = uTime * 0.05 + (1.0 - s1) * uTime * 0.10;
    float ca = cos(spin), sa = sin(spin);
    pos.xz = mat2(ca, -sa, sa, ca) * pos.xz;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);

    // Mouse repulsion in view space
    float d = distance(mv.xy, uMouse);
    float rep = smoothstep(3.2, 0.0, d);
    mv.xy += normalize(mv.xy - uMouse + vec2(0.0001)) * rep * 1.5;

    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.4 + aSeed.x * 2.6) * uPixelRatio * (15.0 / -mv.z);

    // Aurora palette that shifts as you travel through the site
    vec3 c0 = vec3(0.30, 0.83, 0.96); // cyan     — hero galaxy
    vec3 c1 = vec3(0.58, 0.40, 0.98); // violet   — experience helix
    vec3 c2 = vec3(0.94, 0.36, 0.93); // fuchsia  — projects wave
    vec3 c3 = vec3(0.99, 0.72, 0.32); // amber    — skills shell
    vec3 c4 = vec3(0.30, 0.92, 0.70); // emerald  — contact knot
    vec3 col = c0;
    col = mix(col, c1, s1);
    col = mix(col, c2, s2);
    col = mix(col, c3, s3);
    col = mix(col, c4, s4);
    col += (aSeed - 0.5) * 0.28;

    vColor = col;
    vAlpha = 0.5 + aSeed.y * 0.5;
  }
`;

const PARTICLE_FRAG = /* glsl */ `
  varying vec3  vColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    a *= a;
    gl_FragColor = vec4(vColor, a * vAlpha);
  }
`;

const NEBULA_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.9999, 1.0);
  }
`;

const NEBULA_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
  uniform vec2  uRes;
  varying vec2  vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = p * 2.03 + vec2(11.3, 7.9);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0);

    float t = uTime * 0.02;
    float n1 = fbm(uv * 1.5 + vec2(t, -t * 0.6) + uProgress * 0.55);
    float n2 = fbm(uv * 2.6 - vec2(t * 0.8, t) - uProgress * 0.35);

    vec3 base = vec3(0.012, 0.012, 0.035);

    // Two drifting aurora glows whose hues track scroll progress
    float p = uProgress * 0.25;
    vec3 glowA = mix(vec3(0.05, 0.25, 0.38), vec3(0.30, 0.08, 0.38), p);
    vec3 glowB = mix(vec3(0.24, 0.07, 0.40), vec3(0.42, 0.16, 0.10), p);

    vec3 col = base;
    col += glowA * smoothstep(0.45, 0.9, n1) * 0.85;
    col += glowB * smoothstep(0.5, 0.95, n2) * 0.7;

    // Sparse pin-prick starfield
    float star = step(0.9985, hash(floor((vUv * uRes) / 2.0)));
    col += star * 0.5 * (0.4 + 0.6 * sin(uTime * 2.0 + hash(vUv * 91.7) * 30.0));

    // Vignette
    col *= 1.0 - dot(uv, uv) * 0.55;

    gl_FragColor = vec4(col, 1.0);
  }
`;

/* ------------------------------------------------------------------ */
/* Formation generators                                                */
/* ------------------------------------------------------------------ */

function gauss() {
  return Math.random() + Math.random() + Math.random() - 1.5;
}

function buildFormations(count: number) {
  const galaxy = new Float32Array(count * 3);
  const helix = new Float32Array(count * 3);
  const wave = new Float32Array(count * 3);
  const shell = new Float32Array(count * 3);
  const knot = new Float32Array(count * 3);
  const seed = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const j = i * 3;

    // Spiral galaxy — 3 arms
    {
      const arm = i % 3;
      const r = Math.pow(Math.random(), 0.6) * 11;
      const ang = r * 0.42 + arm * ((Math.PI * 2) / 3) + (Math.random() - 0.5) * 0.55;
      galaxy[j] = Math.cos(ang) * r;
      galaxy[j + 1] = gauss() * 0.8 * (1 - r / 14);
      galaxy[j + 2] = Math.sin(ang) * r * 0.72;
    }

    // Double helix with scattered dust
    {
      if (Math.random() < 0.16) {
        helix[j] = gauss() * 5;
        helix[j + 1] = gauss() * 6;
        helix[j + 2] = gauss() * 5;
      } else {
        const strand = i % 2;
        const y = (Math.random() * 2 - 1) * 8;
        const a = y * 0.9 + strand * Math.PI;
        const r = 3 + (Math.random() - 0.5) * 0.5;
        helix[j] = Math.cos(a) * r;
        helix[j + 1] = y;
        helix[j + 2] = Math.sin(a) * r;
      }
    }

    // Flat field — the vertex shader rolls waves through it
    {
      wave[j] = (Math.random() * 2 - 1) * 13;
      wave[j + 1] = (Math.random() - 0.5) * 0.6;
      wave[j + 2] = (Math.random() * 2 - 1) * 9;
    }

    // Fibonacci sphere shells (outer + inner core)
    {
      const k = i + 0.5;
      const phi = Math.acos(1 - (2 * k) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * k;
      const r = i % 5 === 0 ? 2.8 : 5.6;
      shell[j] = Math.cos(theta) * Math.sin(phi) * r;
      shell[j + 1] = Math.cos(phi) * r;
      shell[j + 2] = Math.sin(theta) * Math.sin(phi) * r;
    }

    // Trefoil knot
    {
      const t = Math.random() * Math.PI * 2;
      const s = 1.9;
      const cx = (2 + Math.cos(3 * t)) * Math.cos(2 * t) * s;
      const cy = (2 + Math.cos(3 * t)) * Math.sin(2 * t) * s;
      const cz = Math.sin(3 * t) * s * 1.4;
      knot[j] = cx + gauss() * 0.45;
      knot[j + 1] = cy * 0.75 + gauss() * 0.45;
      knot[j + 2] = cz + gauss() * 0.45;
    }

    seed[j] = Math.random();
    seed[j + 1] = Math.random();
    seed[j + 2] = Math.random();
  }

  return { galaxy, helix, wave, shell, knot, seed };
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const SECTION_IDS = ['about', 'experience', 'projects', 'skills', 'contact'];

export default function WebGLScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
    } catch {
      return; // WebGL unavailable — page still works without the backdrop
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x050510, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 5, 17);

    /* Nebula backdrop — fullscreen quad drawn behind everything */
    const nebulaUniforms = {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uRes: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    };
    const nebula = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({
        vertexShader: NEBULA_VERT,
        fragmentShader: NEBULA_FRAG,
        uniforms: nebulaUniforms,
        depthWrite: false,
        depthTest: false,
      })
    );
    nebula.renderOrder = -1;
    nebula.frustumCulled = false;
    scene.add(nebula);

    /* Morphing particle system */
    const isMobile = window.innerWidth < 768;
    const COUNT = isMobile ? 9000 : 26000;
    const forms = buildFormations(COUNT);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(forms.galaxy, 3));
    geometry.setAttribute('aGalaxy', new THREE.BufferAttribute(forms.galaxy, 3));
    geometry.setAttribute('aHelix', new THREE.BufferAttribute(forms.helix, 3));
    geometry.setAttribute('aWave', new THREE.BufferAttribute(forms.wave, 3));
    geometry.setAttribute('aShell', new THREE.BufferAttribute(forms.shell, 3));
    geometry.setAttribute('aKnot', new THREE.BufferAttribute(forms.knot, 3));
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(forms.seed, 3));

    const particleUniforms = {
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(999, 999) },
      uPixelRatio: { value: dpr },
    };
    const particles = new THREE.Points(
      geometry,
      new THREE.ShaderMaterial({
        vertexShader: PARTICLE_VERT,
        fragmentShader: PARTICLE_FRAG,
        uniforms: particleUniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    particles.frustumCulled = false;
    scene.add(particles);

    /* Scroll → formation progress (0..4), based on section positions.
       `?p=N` pins the progress — handy for previewing a formation. */
    const forcedParam = new URLSearchParams(window.location.search).get('p');
    const forcedProgress = forcedParam === null ? null : parseFloat(forcedParam);
    let targetProgress = 0;
    const computeProgress = () => {
      if (forcedProgress !== null && !Number.isNaN(forcedProgress)) {
        targetProgress = Math.min(4, Math.max(0, forcedProgress));
        return;
      }
      const probe = window.scrollY + window.innerHeight * 0.5;
      const tops = SECTION_IDS.map((id) => {
        const el = document.getElementById(id);
        return el ? el.offsetTop : 0;
      });
      let p = 0;
      for (let i = 0; i < tops.length - 1; i++) {
        if (probe >= tops[i + 1]) {
          p = i + 1;
        } else if (probe > tops[i]) {
          p = i + (probe - tops[i]) / (tops[i + 1] - tops[i]);
          break;
        }
      }
      targetProgress = Math.min(4, Math.max(0, p));
    };

    /* Pointer → view-space mouse + camera parallax */
    const pointer = new THREE.Vector2(0, 0);
    let hasPointer = false;
    const onPointerMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
      hasPointer = true;
    };

    const onScroll = () => computeProgress();
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      nebulaUniforms.uRes.value.set(window.innerWidth, window.innerHeight);
      computeProgress();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    computeProgress();

    const clock = new THREE.Clock();
    let raf = 0;
    let progress = forcedProgress !== null && !Number.isNaN(forcedProgress) ? targetProgress : 0;

    const renderFrame = () => {
      const t = clock.getElapsedTime();

      progress += (targetProgress - progress) * 0.06;
      particleUniforms.uProgress.value = progress;
      particleUniforms.uTime.value = t;
      nebulaUniforms.uProgress.value = progress;
      nebulaUniforms.uTime.value = t;

      // Map pointer NDC into view-space units at the particle field's depth
      if (hasPointer) {
        const halfH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
        particleUniforms.uMouse.value.set(
          pointer.x * halfH * camera.aspect,
          pointer.y * halfH
        );
      }

      // Subtle parallax drift around an elevated base position
      camera.position.x += (pointer.x * 1.6 - camera.position.x) * 0.03;
      camera.position.y += (5 + pointer.y * 1.2 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    const loop = () => {
      renderFrame();
      raf = requestAnimationFrame(loop);
    };

    if (reducedMotion) {
      // Static render; update only when scroll changes the formation
      renderFrame();
      const staticScroll = () => {
        computeProgress();
        progress = targetProgress;
        renderFrame();
      };
      window.addEventListener('scroll', staticScroll, { passive: true });
      return () => {
        window.removeEventListener('scroll', staticScroll);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onResize);
        geometry.dispose();
        (particles.material as THREE.Material).dispose();
        nebula.geometry.dispose();
        (nebula.material as THREE.Material).dispose();
        renderer.dispose();
      };
    }

    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      geometry.dispose();
      (particles.material as THREE.Material).dispose();
      nebula.geometry.dispose();
      (nebula.material as THREE.Material).dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 h-full w-full"
      aria-hidden="true"
    />
  );
}
