'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/* ------------------------------------------------------------------ */
/* Tech sky — fullscreen gradient with a drifting cool light source     */
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

    // Tech gradient: steel blue overhead, luminous cyan-white at the horizon.
    vec3 low  = vec3(0.92, 0.96, 0.99);
    vec3 mid  = vec3(0.80, 0.88, 0.95);
    vec3 high = vec3(0.44, 0.60, 0.80);
    vec3 col  = mix(low, mid, smoothstep(0.0, 0.5, y));
    col = mix(col, high, smoothstep(0.42, 1.0, y));

    // Cool light source drifting along the horizon as you travel.
    vec2 uv = vUv * vec2(uRes.x / uRes.y, 1.0);
    vec2 sun = vec2((0.35 + 0.3 * sin(uProgress * 3.0)) * uRes.x / uRes.y, 0.32);
    float d = distance(uv, sun);
    col += vec3(0.52, 0.82, 1.0) * smoothstep(0.55, 0.0, d) * 0.45;
    col += vec3(0.88, 0.97, 1.0) * smoothstep(0.12, 0.0, d) * 0.6;

    // Faint film grain so the flat sky never bands.
    float g = fract(sin(dot(vUv * uRes, vec2(12.99, 78.23))) * 43758.5);
    col += (g - 0.5) * 0.015;

    gl_FragColor = vec4(col, 1.0);
  }
`;

const HORIZON = new THREE.Color(0xe8f1fa);

/* Scroll drives a slow forward flight across the blueprint grid. */
const TRAVEL = 70;

export default function WebGLScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    } catch {
      return; // WebGL unavailable — the page still works without the backdrop
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(HORIZON.getHex(), 18, 85);

    const camera = new THREE.PerspectiveCamera(
      42,
      window.innerWidth / window.innerHeight,
      0.1,
      400
    );

    /* Sky */
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

    /* Lighting — the ground plane is the only lit surface now */
    scene.add(new THREE.HemisphereLight(0xffffff, 0xd2e2f2, 1.5));
    const sun = new THREE.DirectionalLight(0xfffaf4, 1.6);
    sun.position.set(-6, 8, 5);
    scene.add(sun);

    /* Ground */
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(600, 600),
      new THREE.MeshStandardMaterial({ color: 0xdde7f1, roughness: 0.9, metalness: 0 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.02;
    scene.add(ground);

    /* Blueprint-style grid in denim/slate */
    const grid = new THREE.GridHelper(600, 140, 0x4a7fb5, 0x9db4c8);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.28;
    grid.position.y = 0;
    scene.add(grid);

    /* Ambient motes, kept around the camera as it travels */
    const MOTE_COUNT = window.innerWidth < 768 ? 260 : 700;
    const motePos = new Float32Array(MOTE_COUNT * 3);
    for (let i = 0; i < MOTE_COUNT; i++) {
      const r = 3 + Math.random() * 14;
      const a = Math.random() * Math.PI * 2;
      motePos[i * 3] = Math.cos(a) * r;
      motePos[i * 3 + 1] = Math.random() * 8;
      motePos[i * 3 + 2] = Math.sin(a) * r;
    }
    const moteGeo = new THREE.BufferGeometry();
    moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
    const motes = new THREE.Points(
      moteGeo,
      new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.05,
        transparent: true,
        opacity: 0.5,
        sizeAttenuation: true,
        depthWrite: false,
      })
    );
    motes.frustumCulled = false;
    scene.add(motes);

    /* Scroll → progress (0..1). `?p=0.5` pins a position for preview. */
    const params = new URLSearchParams(window.location.search);
    const forcedParam = params.get('p');
    const forced = forcedParam === null ? null : parseFloat(forcedParam);
    // When pinned for debugging, skip the easing so the view is immediately
    // what it will settle to (the preview pane throttles rAF heavily).
    const snap = forced !== null && !Number.isNaN(forced);

    let targetProgress = 0;
    const computeProgress = () => {
      if (snap) {
        targetProgress = Math.min(1, Math.max(0, forced as number));
        return;
      }
      const max = document.documentElement.scrollHeight - window.innerHeight;
      targetProgress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };

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

    const targetPos = new THREE.Vector3();

    /* Fly forward along -Z, drifting gently sideways and descending a little. */
    const placeCamera = (p: number, instant: boolean) => {
      const camZ = -p * TRAVEL;
      const drift = Math.sin(p * Math.PI) * 3.2;
      const height = THREE.MathUtils.lerp(3.6, 2.2, p);
      targetPos.set(
        drift + pointer.x * 1.5,
        height + pointer.y * 0.6,
        camZ
      );
      camera.position.lerp(targetPos, instant ? 1 : 0.08);
      camera.lookAt(camera.position.x * 0.35, 1.3, camera.position.z - 20);
      // Keep the mote field travelling with the camera
      motes.position.set(camera.position.x, 0, camera.position.z);
    };

    const clock = new THREE.Clock();
    let raf = 0;
    let progress = snap ? targetProgress : 0;

    const renderFrame = () => {
      const t = clock.getElapsedTime();
      progress += (targetProgress - progress) * (snap ? 1 : 0.07);

      skyUniforms.uTime.value = t;
      skyUniforms.uProgress.value = progress;

      placeCamera(progress, snap);
      motes.rotation.y = t * 0.015;

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
      const staticRender = () => {
        computeProgress();
        progress = targetProgress;
        skyUniforms.uProgress.value = progress;
        placeCamera(progress, true);
        renderer.render(scene, camera);
      };
      staticRender();
      window.addEventListener('scroll', staticRender, { passive: true });
      return () => {
        window.removeEventListener('scroll', staticRender);
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
