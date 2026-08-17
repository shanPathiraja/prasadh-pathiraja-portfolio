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
const MODEL_URL = '/models/developer.glb';

/* One beat per section. The camera orbits a focus point *inside* the diorama,
   so each section frames the thing it is about. Focus coords were measured
   from the loaded rig (head ≈ y 4.5, hands/keyboard ≈ y 3.7, model ≈ ±3.1).
   az is the orbit angle: 0 sits behind the figure, positive swings to +X.
   Stays in the "behind" hemisphere so we never face the monitor backs. */
type Beat = { az: number; r: number; elev: number; fx: number; fy: number; fz: number };

const BEATS: Beat[] = [
  // 01 About — the developer himself
  { az: 0.62, r: 4.4, elev: 0.3, fx: 0.43, fy: 4.15, fz: 0.0 },
  // 02 Experience — over the left shoulder onto the code editor
  { az: -0.5, r: 3.6, elev: 0.35, fx: -0.75, fy: 4.2, fz: -1.25 },
  // 03 Projects — over the right shoulder onto the website screen
  { az: 0.55, r: 3.6, elev: 0.35, fx: 1.05, fy: 4.2, fz: -1.25 },
  // 04 Skills — down onto the desk: keyboard, mouse, plant
  { az: 0.45, r: 3.0, elev: 1.3, fx: 0.6, fy: 3.75, fz: -0.7 },
  // 05 Contact — pull back to the whole workstation
  { az: 0.55, r: 8.6, elev: 2.6, fx: 0.2, fy: 3.3, fz: -0.4 },
];

function sampleBeats(p: number): Beat {
  const x = Math.min(1, Math.max(0, p)) * (BEATS.length - 1);
  const i = Math.min(BEATS.length - 2, Math.floor(x));
  let f = x - i;
  f = f * f * (3 - 2 * f); // smoothstep
  const a = BEATS[i];
  const b = BEATS[i + 1];
  const mix = (k: keyof Beat) => a[k] + (b[k] - a[k]) * f;
  return {
    az: mix('az'), r: mix('r'), elev: mix('elev'),
    fx: mix('fx'), fy: mix('fy'), fz: mix('fz'),
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
    scene.add(new THREE.HemisphereLight(0xffffff, 0xd2e2f2, 1.5));
    const sun = new THREE.DirectionalLight(0xfffaf4, 2.2);
    sun.position.set(-6, 8, 5);
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0xbcd4ff, 0.7);
    rim.position.set(8, 3, -6);
    scene.add(rim);

    /* Ground */
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(600, 600),
      new THREE.MeshStandardMaterial({ color: 0xdde7f1, roughness: 0.9, metalness: 0 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.02;
    scene.add(ground);

    // Blueprint-style grid in denim/slate, tying the floor to the character.
    const grid = new THREE.GridHelper(600, 140, 0x4a7fb5, 0x9db4c8);
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

    // Procedural "working" animation. The model ships only a single static
    // pose (no real clip), so we drive the rig ourselves: capture each bone's
    // posed rotation, then add small offsets every frame to fake typing.
    type WorkBone = { bone: THREE.Object3D; base: THREE.Quaternion; kind: string; phase: number };
    let workBones: WorkBone[] = [];
    const _q = new THREE.Quaternion();
    const _e = new THREE.Euler();

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load(
      MODEL_URL,
      (gltf) => {
        const model = gltf.scene;

        // Apply the single-pose clip once so the character holds its seated
        // pose, then keep that as the base for our own animation.
        if (gltf.animations.length) {
          const m = new THREE.AnimationMixer(model);
          m.clipAction(gltf.animations[0]).play();
          m.update(0);
        }

        // Grab the rig bones we'll animate for the "typing" look.
        model.traverse((o) => {
          const kindByName: Record<string, string> = {
            LeftHand: 'handL', RightHand: 'handR',
            LeftForeArm: 'foreL', RightForeArm: 'foreR',
            Head: 'head', Spine02: 'spine',
          };
          const kind = kindByName[o.name];
          if (kind) {
            const phase = kind.endsWith('R') ? 1.4 : 0;
            workBones.push({ bone: o, base: o.quaternion.clone(), kind, phase });
          }
        });

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
    // When a beat is pinned for debugging, skip the easing so the framing is
    // immediately what it will settle to.
    const snap = forcedParam !== null && !Number.isNaN(parseFloat(forcedParam));
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
      progress += (targetProgress - progress) * 0.07;

      skyUniforms.uTime.value = t;
      skyUniforms.uProgress.value = progress;

      // Procedural "working" motion — layered on top of the captured pose.
      if (workBones.length) {
        // Typing comes in bursts with brief pauses so it doesn't feel robotic.
        const burst = 0.5 + 0.5 * Math.sin(t * 0.55);
        const intensity = 0.35 + 0.65 * burst * burst;
        for (const w of workBones) {
          if (w.kind === 'handL' || w.kind === 'handR') {
            // Small, fast, irregular flutter — several frequencies summed so it
            // reads like separate fingers tapping keys, not one wrist flap.
            const p = w.phase;
            const flutter =
              Math.sin(t * 17 + p) +
              Math.sin(t * 23 + p * 1.7) +
              Math.sin(t * 13 + p * 0.6);
            const tap = Math.max(0, flutter) * 0.028 * intensity;
            _e.set(-tap, 0, tap * 0.25);
          } else if (w.kind === 'foreL' || w.kind === 'foreR') {
            // Forearms stay almost planted; only a whisper of follow-through.
            const tap = (0.5 - 0.5 * Math.cos(t * 6 + w.phase)) * 0.012 * intensity;
            _e.set(-tap, 0, 0);
          } else if (w.kind === 'head') {
            _e.set(0.025 * Math.sin(t * 0.5), 0.06 * Math.sin(t * 0.33), 0);
          } else {
            // spine — slow breathing
            _e.set(0.02 * Math.sin(t * 0.8), 0, 0);
          }
          _q.setFromEuler(_e);
          w.bone.quaternion.copy(w.base).multiply(_q);
        }
      }

      // Grow the model in once loaded (instant when a beat is pinned for debug)
      if (modelReady && modelPivot.scale.x < 1) {
        modelPivot.scale.setScalar(
          snap ? 1 : Math.min(1, modelPivot.scale.x + (1 - modelPivot.scale.x) * 0.08 + 0.004)
        );
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
      // Narrow/portrait layouts pull back so the tight framings aren't cropped
      // and the workstation reads as a soft backdrop behind the content card.
      const fit = THREE.MathUtils.lerp(1.5, 1.0, wide);
      const effR = b.r * fit;
      const az = b.az + pointer.x * 0.18;

      // Orbit the beat's focus point rather than the world origin.
      const targetPos = new THREE.Vector3(
        b.fx + Math.sin(az) * effR,
        b.fy + b.elev * fit + pointer.y * 0.5,
        b.fz + Math.cos(az) * effR
      );
      camera.position.lerp(targetPos, snap ? 1 : 0.06);

      // Shift the look target right (subject sits left) only when there's a
      // side column for content; scaled with distance so the screen-space
      // offset stays consistent whether the shot is tight or wide.
      const lookX = 0.26 * effR * THREE.MathUtils.clamp((aspect - 0.8) / 0.7, 0, 1);
      camera.lookAt(b.fx + lookX, b.fy, b.fz);

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
        const fit = THREE.MathUtils.lerp(1.5, 1.0, wide);
        const effR = b.r * fit;
        const lookX = 0.26 * effR * THREE.MathUtils.clamp((aspect - 0.8) / 0.7, 0, 1);
        camera.position.set(
          b.fx + Math.sin(b.az) * effR,
          b.fy + b.elev * fit,
          b.fz + Math.cos(b.az) * effR
        );
        camera.lookAt(b.fx + lookX, b.fy, b.fz);
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
