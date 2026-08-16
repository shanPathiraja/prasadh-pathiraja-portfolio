'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/* ------------------------------------------------------------------ */
/* Dawn sky — fullscreen gradient with a low sun bloom                  */
/* ------------------------------------------------------------------ */

const SKY_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.9999, 1.0);
  }
`;

const SKY_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
  uniform vec2  uRes;
  varying vec2  vUv;

  void main() {
    float y = vUv.y;

    // Dawn gradient: warm peach at the horizon, pale blue overhead.
    vec3 low  = vec3(1.00, 0.85, 0.74);   // peach
    vec3 mid  = vec3(0.98, 0.91, 0.86);   // cream
    vec3 high = vec3(0.72, 0.83, 0.93);   // pale blue
    vec3 col  = mix(low, mid, smoothstep(0.0, 0.5, y));
    col = mix(col, high, smoothstep(0.42, 1.0, y));

    // Sun bloom that drifts along the horizon as you travel.
    vec2 uv = vUv * vec2(uRes.x / uRes.y, 1.0);
    vec2 sun = vec2((0.35 + 0.3 * sin(uProgress * 1.2)) * uRes.x / uRes.y, 0.34);
    float d = distance(uv, sun);
    col += vec3(1.0, 0.93, 0.82) * smoothstep(0.55, 0.0, d) * 0.5;
    col += vec3(1.0, 0.97, 0.9) * smoothstep(0.12, 0.0, d) * 0.6;

    // Faint film grain so the flat sky never bands.
    float g = fract(sin(dot(vUv * uRes, vec2(12.99, 78.23))) * 43758.5);
    col += (g - 0.5) * 0.015;

    gl_FragColor = vec4(col, 1.0);
  }
`;

/* ------------------------------------------------------------------ */
/* Monuments — one distinctive floating form per section               */
/* ------------------------------------------------------------------ */

const HORIZON = new THREE.Color(0xf7e4d6); // fog + ground blend color

type StationSpec = {
  geometry: () => THREE.BufferGeometry;
  color: number;
  x: number;
  y: number;
  spin: THREE.Vector3;
};

const STATIONS: StationSpec[] = [
  { geometry: () => new THREE.IcosahedronGeometry(3, 0),          color: 0xff6b5c, x: -6.5, y: 0.4,  spin: new THREE.Vector3(0.12, 0.18, 0) },
  { geometry: () => new THREE.TorusGeometry(3, 0.55, 20, 80),     color: 0xf5a623, x:  6.8, y: 1.0,  spin: new THREE.Vector3(0.2, 0.1, 0.14) },
  { geometry: () => new THREE.OctahedronGeometry(3.2, 0),         color: 0x2dd4bf, x: -6.8, y: -0.6, spin: new THREE.Vector3(0.1, 0.22, 0) },
  { geometry: () => new THREE.DodecahedronGeometry(3, 0),         color: 0x6366f1, x:  6.6, y: 0.8,  spin: new THREE.Vector3(0.16, 0.14, 0.1) },
  { geometry: () => new THREE.TorusKnotGeometry(2, 0.55, 140, 18),color: 0xfb7185, x: -6.4, y: 0.0,  spin: new THREE.Vector3(0.14, 0.2, 0.08) },
];

const STATION_GAP = 22;
const FIRST_Z = -12;
const stationZ = (i: number) => FIRST_Z - i * STATION_GAP;
const TOTAL_TRAVEL = Math.abs(stationZ(STATIONS.length - 1)); // last monument depth
const CAM_START = 8;

const SECTION_IDS = ['about', 'experience', 'projects', 'skills', 'contact'];

export default function WebGLScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    } catch {
      return; // WebGL unavailable — page still works without the backdrop
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;
    const dpr = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(HORIZON.getHex(), 30, 120);

    const camera = new THREE.PerspectiveCamera(
      52,
      window.innerWidth / window.innerHeight,
      0.1,
      400
    );
    camera.position.set(0, 0.5, CAM_START);

    /* Sky — fullscreen gradient behind everything */
    const skyUniforms = {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uRes: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    };
    const sky = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({
        vertexShader: SKY_VERT,
        fragmentShader: SKY_FRAG,
        uniforms: skyUniforms,
        depthWrite: false,
        depthTest: false,
        fog: false,
      })
    );
    sky.renderOrder = -1;
    sky.frustumCulled = false;
    scene.add(sky);

    /* Lighting */
    scene.add(new THREE.HemisphereLight(0xffffff, 0xffd9b8, 1.15));
    const sun = new THREE.DirectionalLight(0xfff2e0, 1.5);
    sun.position.set(-8, 6, 4);
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0xbcd4ff, 0.6);
    rim.position.set(10, 4, -6);
    scene.add(rim);

    /* Reflective-looking ground grid receding to the horizon */
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(600, 600, 1, 1),
      new THREE.MeshStandardMaterial({
        color: 0xf3ddcb,
        roughness: 0.85,
        metalness: 0.0,
      })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -4.5;
    scene.add(ground);

    const grid = new THREE.GridHelper(600, 120, 0xd98c6a, 0xe8b79a);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.35;
    grid.position.y = -4.48;
    scene.add(grid);

    /* Monuments */
    const monuments: THREE.Group[] = [];
    STATIONS.forEach((s, i) => {
      const group = new THREE.Group();
      const geo = s.geometry();

      const mesh = new THREE.Mesh(
        geo,
        new THREE.MeshStandardMaterial({
          color: s.color,
          roughness: 0.25,
          metalness: 0.35,
          emissive: new THREE.Color(s.color),
          emissiveIntensity: 0.28, // keep shadowed faces vibrant, not muddy
          transparent: true,
          opacity: 0.92,
          flatShading: true,
        })
      );
      group.add(mesh);

      // Crisp accent edges for an architectural read
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(geo),
        new THREE.LineBasicMaterial({
          color: new THREE.Color(s.color).offsetHSL(0, 0.1, -0.15),
          transparent: true,
          opacity: 0.5,
        })
      );
      group.add(edges);

      // A slow-orbiting satellite ring for extra life
      const halo = new THREE.Mesh(
        new THREE.TorusGeometry(4.3, 0.045, 8, 90),
        new THREE.MeshBasicMaterial({ color: s.color, transparent: true, opacity: 0.28 })
      );
      halo.rotation.x = Math.PI / 2.4;
      group.add(halo);

      group.position.set(isMobile ? s.x * 0.62 : s.x, s.y, stationZ(i));
      group.userData.spin = s.spin;
      group.userData.halo = halo;
      scene.add(group);
      monuments.push(group);
    });

    /* Light dust motes drifting along the travel corridor */
    const MOTE_COUNT = isMobile ? 500 : 1400;
    const motePos = new Float32Array(MOTE_COUNT * 3);
    const moteSeed = new Float32Array(MOTE_COUNT);
    for (let i = 0; i < MOTE_COUNT; i++) {
      motePos[i * 3] = (Math.random() - 0.5) * 40;
      motePos[i * 3 + 1] = (Math.random() - 0.5) * 22;
      motePos[i * 3 + 2] = -Math.random() * (TOTAL_TRAVEL + 40) + 10;
      moteSeed[i] = Math.random();
    }
    const moteGeo = new THREE.BufferGeometry();
    moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
    const motes = new THREE.Points(
      moteGeo,
      new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.08,
        transparent: true,
        opacity: 0.55,
        sizeAttenuation: true,
        depthWrite: false,
      })
    );
    motes.frustumCulled = false;
    scene.add(motes);

    /* Scroll → travel progress (0..1 across the whole document).
       `?s=N` pins the camera at station N for previewing. */
    const forcedParam = new URLSearchParams(window.location.search).get('s');
    const forcedStation = forcedParam === null ? null : parseFloat(forcedParam);
    let targetProgress = 0;
    const computeProgress = () => {
      if (forcedStation !== null && !Number.isNaN(forcedStation)) {
        targetProgress = Math.min(1, Math.max(0, forcedStation / (STATIONS.length - 1)));
        return;
      }
      const max = document.documentElement.scrollHeight - window.innerHeight;
      targetProgress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };

    /* Pointer parallax */
    const pointer = new THREE.Vector2(0, 0);
    const onPointerMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const onScroll = () => computeProgress();
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      skyUniforms.uRes.value.set(window.innerWidth, window.innerHeight);
      computeProgress();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    computeProgress();

    const clock = new THREE.Clock();
    let raf = 0;
    let progress =
      forcedStation !== null && !Number.isNaN(forcedStation) ? targetProgress : 0;

    const renderFrame = () => {
      const t = clock.getElapsedTime();
      progress += (targetProgress - progress) * 0.07;

      skyUniforms.uTime.value = t;
      skyUniforms.uProgress.value = progress;

      // Fly the camera forward along -Z through the monuments, stopping a
      // consistent ~24 units short of the final one so it frames cleanly.
      const camZ = CAM_START - progress * (TOTAL_TRAVEL - 4);
      camera.position.z += (camZ - camera.position.z) * 0.1;
      camera.position.x += (pointer.x * 1.4 - camera.position.x) * 0.04;
      camera.position.y += (0.5 + pointer.y * 0.9 - camera.position.y) * 0.04;
      camera.lookAt(camera.position.x * 0.3, 0.3, camera.position.z - 12);

      // Animate monuments
      for (const g of monuments) {
        const spin = g.userData.spin as THREE.Vector3;
        g.rotation.x += spin.x * 0.01;
        g.rotation.y += spin.y * 0.01;
        g.rotation.z += spin.z * 0.01;
        g.position.y += Math.sin(t * 0.6 + g.position.z) * 0.002;
        (g.userData.halo as THREE.Mesh).rotation.z += 0.004;
      }

      motes.rotation.y = t * 0.01;

      renderer.render(scene, camera);
    };

    const loop = () => {
      renderFrame();
      raf = requestAnimationFrame(loop);
    };

    const dispose = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      scene.traverse((obj) => {
        const anyObj = obj as THREE.Mesh;
        if (anyObj.geometry) anyObj.geometry.dispose();
        const mat = anyObj.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else if (mat) mat.dispose();
      });
      renderer.dispose();
    };

    if (reducedMotion) {
      renderFrame();
      const staticScroll = () => {
        computeProgress();
        progress = targetProgress;
        renderFrame();
      };
      window.addEventListener('scroll', staticScroll, { passive: true });
      return () => {
        window.removeEventListener('scroll', staticScroll);
        dispose();
      };
    }

    loop();
    return () => {
      cancelAnimationFrame(raf);
      dispose();
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
