/**
 * The 3D objects that stand in for the old stock photography in About and the
 * tech stack.
 *
 * Same approach as the hero monogram — a raymarched SDF in a fragment shader,
 * no geometry and no dependency — but far cheaper: these canvases are a few
 * hundred pixels, they only run while on screen, and they share the hero's
 * palette so the page reads as one piece.
 */

export type Shape = 'gyroid' | 'lattice';

export type SectionObject = {
  dispose: () => void;
};

const VERT = `#version 300 es
void main(){
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
out vec4 fragColor;

uniform vec2  uRes;
uniform float uTime;
uniform vec2  uMouse;

mat3 rotX(float a){ float s=sin(a),c=cos(a); return mat3(1.,0.,0., 0.,c,-s, 0.,s,c); }
mat3 rotY(float a){ float s=sin(a),c=cos(a); return mat3(c,0.,s, 0.,1.,0., -s,0.,c); }

// iq's box frame: a cube reduced to its twelve edges.
float sdBoxFrame(vec3 p, vec3 b, float e){
  p = abs(p) - b;
  vec3 q = abs(p + e) - e;
  return min(min(
    length(max(vec3(p.x, q.y, q.z), 0.0)) + min(max(p.x, max(q.y, q.z)), 0.0),
    length(max(vec3(q.x, p.y, q.z), 0.0)) + min(max(q.x, max(p.y, q.z)), 0.0)),
    length(max(vec3(q.x, q.y, p.z), 0.0)) + min(max(q.x, max(q.y, p.z)), 0.0));
}

mat3 gRot;

#if SHAPE_GYROID
// A gyroid shell clipped to a sphere. Not a true distance field — it reports
// further than it should — so the march below steps short to stay out of it.
float map(vec3 p){
  vec3 q = gRot * p;
  float g = (sin(q.x * 3.1) * cos(q.y * 3.1)
           + sin(q.y * 3.1) * cos(q.z * 3.1)
           + sin(q.z * 3.1) * cos(q.x * 3.1)) / 3.0;
  float shell = abs(g) - 0.085;
  return max(length(q) - 1.02, shell * 0.42);
}
#else
// Three nested frames turning at their own rates: a stack, literally.
float map(vec3 p){
  float d = 1e9;
  for (int i = 0; i < 3; i++) {
    float f = float(i);
    vec3 q = rotY(uTime * 0.28 * (1.0 + f * 0.45) + f * 1.7)
           * rotX(uTime * 0.19 * (1.0 - f * 0.25) + f) * (gRot * p);
    d = min(d, sdBoxFrame(q, vec3(0.95 - f * 0.27), 0.030 - f * 0.004));
  }
  return d;
}
#endif

vec3 normalAt(vec3 p){
  vec2 e = vec2(1.0, -1.0) * 0.0025;
  return normalize(
    e.xyy * map(p + e.xyy) + e.yyx * map(p + e.yyx) +
    e.yxy * map(p + e.yxy) + e.xxx * map(p + e.xxx));
}

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y);

  vec3 ro = vec3(0.0, 0.0, -3.2);
  vec3 rd = normalize(vec3(uv * 1.15, 1.0));

  // A slow drift of its own, plus a lean toward the cursor, matching the hero.
  gRot = rotY(uTime * 0.16 + uMouse.x * 0.45) * rotX(-0.25 + uMouse.y * 0.3);

  float t = 0.0;
  bool hit = false;
  for (int i = 0; i < STEPS; i++) {
    vec3 p = ro + rd * t;
    float d = map(p);
    if (d < 0.0015) { hit = true; break; }
    t += max(d * STEP_SCALE, 0.004);
    if (t > 6.0) break;
  }

  vec3 col = vec3(0.0);
  float alpha = 0.0;

  if (hit) {
    vec3 p = ro + rd * t;
    vec3 n = normalAt(p);
    vec3 refl = reflect(rd, n);
    float fres = pow(1.0 - clamp(dot(n, -rd), 0.0, 1.0), 3.0);

    vec3 env = mix(vec3(0.03, 0.08, 0.22), vec3(0.38, 0.68, 1.0),
                   smoothstep(-0.5, 0.7, refl.y));
    env += vec3(1.0, 0.66, 0.36) * pow(clamp(-refl.y, 0.0, 1.0), 3.0) * 0.3;

    vec3 key = normalize(vec3(-0.4 + uMouse.x * 0.6, 0.65 + uMouse.y * 0.4, -0.7));
    col  = env * 0.8;
    col += vec3(0.30, 0.62, 1.0) * fres * 1.7;
    col += vec3(1.0) * pow(clamp(dot(refl, key), 0.0, 1.0), 42.0) * 1.8;
    col += vec3(0.16, 0.42, 0.9) * 0.35;

    // Fade the far side out rather than ending on a hard silhouette.
    alpha = smoothstep(5.2, 2.4, t);
    col *= alpha;
  }

  // A soft core glow, so the object sits in light rather than on nothing.
  float halo = exp(-length(uv) * 3.4) * 0.28;
  col += vec3(0.18, 0.46, 0.95) * halo;

  float lum = max(col.r, max(col.g, col.b));
  fragColor = vec4(col, clamp(max(alpha, lum), 0.0, 1.0));
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error(`section object shader: ${log}`);
  }
  return sh;
}

export function createSectionObject(
  canvas: HTMLCanvasElement,
  shape: Shape,
): SectionObject | null {
  const gl = canvas.getContext('webgl2', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
  });
  if (!gl) return null;

  const gyroid = shape === 'gyroid';
  const frag = FRAG.replace('#if SHAPE_GYROID', gyroid ? '#if 1' : '#if 0')
    .replace(/\bSTEPS\b/g, gyroid ? '72' : '56')
    // The gyroid overstates distance, so it has to creep where the frames stride.
    .replace(/\bSTEP_SCALE\b/g, gyroid ? '0.45' : '0.85');

  let prog: WebGLProgram;
  try {
    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, frag);
    prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(prog) ?? 'link failed');
    }
  } catch {
    return null;
  }

  const vao = gl.createVertexArray();
  const uRes = gl.getUniformLocation(prog, 'uRes');
  const uTime = gl.getUniformLocation(prog, 'uTime');
  const uMouse = gl.getUniformLocation(prog, 'uMouse');

  gl.useProgram(prog);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  let w = 0;
  let h = 0;
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    const nw = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const nh = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (nw === w && nh === h) return;
    w = nw;
    h = nh;
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
  };

  let mx = 0;
  let my = 0;
  let mxT = 0;
  let myT = 0;
  const onPointer = (e: PointerEvent) => {
    mxT = (e.clientX / window.innerWidth) * 2 - 1;
    myT = (e.clientY / window.innerHeight) * 2 - 1;
  };

  let raf = 0;
  let visible = false;
  let dead = false;

  const draw = () => {
    resize();
    mx += (mxT - mx) * 0.07;
    my += (myT - my) * 0.07;
    gl.useProgram(prog);
    gl.bindVertexArray(vao);
    gl.uniform2f(uRes, w, h);
    gl.uniform1f(uTime, performance.now() / 1000);
    gl.uniform2f(uMouse, mx, my);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const frame = () => {
    if (dead) return;
    draw();
    raf = visible ? requestAnimationFrame(frame) : 0;
  };

  // Paint once up front. Otherwise the panel is an empty box until the first
  // animation frame lands, which in a throttled or backgrounded tab can be a
  // long time, or never.
  draw();

  // Only run while the section is actually on screen; three raymarchers all
  // ticking at once would be three times the GPU for no benefit.
  const io = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(frame);
    },
    { rootMargin: '15% 0px' },
  );
  io.observe(canvas);

  window.addEventListener('pointermove', onPointer, { passive: true });
  window.addEventListener('resize', resize);

  return {
    dispose: () => {
      dead = true;
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('resize', resize);
      gl.deleteProgram(prog);
      gl.deleteVertexArray(vao);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
