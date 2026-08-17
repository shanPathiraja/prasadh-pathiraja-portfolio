'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

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
    vec3 low  = vec3(1.00, 0.85, 0.74);
    vec3 mid  = vec3(0.98, 0.91, 0.86);
    vec3 high = vec3(0.72, 0.83, 0.93);
    vec3 col  = mix(low, mid, smoothstep(0.0, 0.5, y));
    col = mix(col, high, smoothstep(0.42, 1.0, y));

    // Sun bloom that drifts along the horizon as you travel.
    vec2 uv = vUv * vec2(uRes.x / uRes.y, 1.0);
    vec2 sun = vec2((0.35 + 0.3 * sin(uProgress * 3.0)) * uRes.x / uRes.y, 0.32);
    float d = distance(uv, sun);
    col += vec3(1.0, 0.93, 0.82) * smoothstep(0.55, 0.0, d) * 0.5;
    col += vec3(1.0, 0.97, 0.9) * smoothstep(0.12, 0.0, d) * 0.6;

    // Faint film grain so the flat sky never bands.
    float g = fract(sin(dot(vUv * uRes, vec2(12.99, 78.23))) * 43758.5);
    col += (g - 0.5) * 0.015;

    gl_FragColor = vec4(col, 1.0);
  }
`;

const HORIZON = new THREE.Color(0xf7e4d6);
const MODEL_URL = '/models/developer.glb';

/* Camera orbit keyframes — the "story beats" as you scroll (0..1).
   Each: azimuth (rad, 0 = front +Z), radius, height, target Y.
   Kept close and near-level so the workstation fills the frame. */
// Over-the-shoulder orbit: the developer seated at the desk with both
// screens legible. Stays in the "behind, screens visible" hemisphere so we
// never face the monitor backs.
const BEATS = [
  { az: 0.55, r: 8.2, h: 3.0, ty: 2.6 }, // 01 hero — 3/4 over the shoulder
  { az: 0.05, r: 7.8, h: 2.9, ty: 2.6 }, // 02 settle in behind
  { az: -0.5, r: 7.8, h: 2.8, ty: 2.6 }, // 03 around to the other shoulder
  { az: 0.2,  r: 7.8, h: 3.0, ty: 2.6 }, // 04 back toward centre
  { az: 0.6,  r: 8.4, h: 3.1, ty: 2.7 }, // 05 calm framing
];


function sampleBeats(p: number) {
  const x = Math.min(1, Math.max(0, p)) * (BEATS.length - 1);
  const i = Math.min(BEATS.length - 2, Math.floor(x));
  let f = x - i;
  f = f * f * (3 - 2 * f); // smoothstep
  const a = BEATS[i];
  const b = BEATS[i + 1];
  return {
    az: a.az + (b.az - a.az) * f,
    r: a.r + (b.r - a.r) * f,
    h: a.h + (b.h - a.h) * f,
    ty: a.ty + (b.ty - a.ty) * f,
  };
}

export default function WebGLScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    } catch {
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(HORIZON.getHex(), 22, 90);

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

    /* Lighting */
    scene.add(new THREE.HemisphereLight(0xffffff, 0xffd9b8, 1.5));
    const sun = new THREE.DirectionalLight(0xfff2e0, 2.2);
    sun.position.set(-6, 8, 5);
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0xbcd4ff, 0.7);
    rim.position.set(8, 3, -6);
    scene.add(rim);

    /* Ground */
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(600, 600),
      new THREE.MeshStandardMaterial({ color: 0xf3ddcb, roughness: 0.9, metalness: 0 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.02;
    scene.add(ground);

    const grid = new THREE.GridHelper(600, 140, 0xd98c6a, 0xe8b79a);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.28;
    grid.position.y = 0;
    scene.add(grid);

    /* Ambient dust motes around the workstation */
    const MOTE_COUNT = window.innerWidth < 768 ? 260 : 700;
    const motePos = new Float32Array(MOTE_COUNT * 3);
    for (let i = 0; i < MOTE_COUNT; i++) {
      const r = 3 + Math.random() * 12;
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

    /* The developer-at-workstation model — the anchor of the story */
    const modelPivot = new THREE.Group();
    scene.add(modelPivot);
    let modelReady = false;
    let mixer: THREE.AnimationMixer | null = null;

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load(
      MODEL_URL,
      (gltf) => {
        const model = gltf.scene;

        // Play the (single-pose) clip so the character holds its working pose
        if (gltf.animations.length) {
          mixer = new THREE.AnimationMixer(model);
          mixer.clipAction(gltf.animations[0]).play();
          mixer.update(0);
        }

        // Scale up and seat the podium base on the ground
        const S = 1.9;
        model.scale.setScalar(S);
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.x -= center.x;
        model.position.z -= center.z;
        model.position.y -= box.min.y; // base at y = 0

        model.traverse((o) => {
          const m = o as THREE.Mesh;
          if (m.isMesh) m.frustumCulled = false;
        });

        modelPivot.add(model);
        modelPivot.scale.setScalar(0.001); // grow-in
        modelReady = true;
      },
      undefined,
      (err) => console.error('developer.glb load failed', err)
    );

    /* Scroll → story progress (0..1). `?p=0.5` freezes a beat for preview. */
    const params = new URLSearchParams(window.location.search);
    const forcedParam = params.get('p');
    const forced = forcedParam === null ? null : parseFloat(forcedParam);
    // Debug: force the wide/narrow framing factor regardless of aspect.
    const wideParam = params.get('wide');
    const forcedWide = wideParam === null ? null : parseFloat(wideParam);
    let targetProgress = 0;
    const computeProgress = () => {
      if (forced !== null && !Number.isNaN(forced)) {
        targetProgress = Math.min(1, Math.max(0, forced));
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

    const clock = new THREE.Clock();
    let raf = 0;
    let progress = forced !== null && !Number.isNaN(forced) ? targetProgress : 0;

    const renderFrame = () => {
      const t = clock.getElapsedTime();
      const dt = clock.getDelta();
      progress += (targetProgress - progress) * 0.07;

      skyUniforms.uTime.value = t;
      skyUniforms.uProgress.value = progress;
      if (mixer) mixer.update(dt);

      // Grow the model in once loaded
      if (modelReady && modelPivot.scale.x < 1) {
        modelPivot.scale.setScalar(Math.min(1, modelPivot.scale.x + (1 - modelPivot.scale.x) * 0.08 + 0.004));
      }
      // Gentle idle turn so the diorama feels alive
      modelPivot.rotation.y = Math.sin(t * 0.12) * 0.06;

      // Cinematic orbit around the workstation
      const b = sampleBeats(progress);
      const aspect = camera.aspect;
      // wide → 1, narrow/portrait → 0
      const wide =
        forcedWide !== null && !Number.isNaN(forcedWide)
          ? forcedWide
          : THREE.MathUtils.clamp((aspect - 0.72) / (1.5 - 0.72), 0, 1);
      // Wide layouts (card beside the model) crop tight on the developer to
      // avoid the baked chair-on-desk look; narrow layouts (card over the
      // model) pull back so the whole workstation reads as a soft backdrop.
      const fit = THREE.MathUtils.lerp(1.4, 1.0, wide);
      const effR = b.r * fit;
      // Narrow looks lower (whole scene); wide crops up to the person.
      const tyEff = b.ty - (1 - wide) * 0.5;
      // Shift the subject left (leaving room for the card) only when there's a
      // side column, and scale it with distance so the screen-space offset is
      // consistent whether the camera is tight or wide.
      const lookX = 0.28 * effR * THREE.MathUtils.clamp((aspect - 0.8) / 0.7, 0, 1);
      const az = b.az + pointer.x * 0.18;
      const targetPos = new THREE.Vector3(
        Math.sin(az) * effR,
        b.h + (1 - wide) * 0.7 + pointer.y * 0.6,
        Math.cos(az) * effR
      );
      camera.position.lerp(targetPos, 0.06);
      camera.lookAt(lookX, tyEff, 0);

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
        const b = sampleBeats(progress);
        const aspect = camera.aspect;
        const wide = THREE.MathUtils.clamp((aspect - 0.72) / (1.5 - 0.72), 0, 1);
        const fit = THREE.MathUtils.lerp(1.4, 1.0, wide);
        const effR = b.r * fit;
        const tyEff = b.ty - (1 - wide) * 0.5;
        const lookX = 0.28 * effR * THREE.MathUtils.clamp((aspect - 0.8) / 0.7, 0, 1);
        camera.position.set(
          Math.sin(b.az) * effR,
          b.h + (1 - wide) * 0.7,
          Math.cos(b.az) * effR
        );
        camera.lookAt(lookX, tyEff, 0);
        renderer.render(scene, camera);
      };
      // Render a few frames so the async model appears, then only on scroll
      let n = 0;
      const warm = () => {
        staticRender();
        if (n++ < 180) requestAnimationFrame(warm);
      };
      warm();
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
