const SDF_SIZE = 512;
// Usable distance band around the outline, in texels. Wide enough that the rim
// glow has real distance to work with rather than saturating a texel out.
const SDF_SPREAD = 96;
// How much of the field the mark is allowed to fill; the rest is spread margin.
const GLYPH_FIT = 0.66;

/* ------------------------------------------------------------------ glyph */

/** Squared euclidean distance transform of one row (Felzenszwalb & Huttenlocher). */
function edt1d(f: Float64Array, d: Float64Array, v: Int32Array, z: Float64Array, n: number) {
  let k = 0;
  v[0] = 0;
  z[0] = -1e20;
  z[1] = 1e20;
  for (let q = 1; q < n; q++) {
    let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) {
      k--;
      s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    }
    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = 1e20;
  }
  k = 0;
  for (let q = 0; q < n; q++) {
    while (z[k + 1] < q) k++;
    d[q] = (q - v[k]) * (q - v[k]) + f[v[k]];
  }
}

function edt2d(grid: Float64Array, w: number, h: number) {
  const n = Math.max(w, h);
  const f = new Float64Array(n);
  const d = new Float64Array(n);
  const v = new Int32Array(n);
  const z = new Float64Array(n + 1);
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) f[y] = grid[y * w + x];
    edt1d(f, d, v, z, h);
    for (let y = 0; y < h; y++) grid[y * w + x] = d[y];
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) f[x] = grid[y * w + x];
    edt1d(f, d, v, z, w);
    for (let x = 0; x < w; x++) grid[y * w + x] = d[x];
  }
}

/**
 * Paints "BP" as one mark — the letters just kissing, not merged, since a single
 * field can't depth-order them — then bakes a signed field from the coverage.
 * The size is solved from the measured pair so the mark always lands inside the
 * spread margin whatever face the browser hands us.
 */
export function bakeGlyphSdf(fontFamily: string): Uint8Array {
  const c = document.createElement('canvas');
  c.width = SDF_SIZE;
  c.height = SDF_SIZE;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, SDF_SIZE, SDF_SIZE);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const probe = 100;
  ctx.font = `800 ${probe}px ${fontFamily}`;
  const bW = ctx.measureText('B').width;
  const pW = ctx.measureText('P').width;
  const lap = pW * 0.14;
  const unitW = bW + pW - lap;
  const px = (probe * (SDF_SIZE * GLYPH_FIT)) / unitW;

  ctx.font = `800 ${px}px ${fontFamily}`;
  const wB = ctx.measureText('B').width;
  const wP = ctx.measureText('P').width;
  const overlap = wP * 0.14;
  const total = wB + wP - overlap;
  const left = SDF_SIZE / 2 - total / 2;
  const mid = SDF_SIZE / 2;
  ctx.fillStyle = '#fff';
  ctx.fillText('B', left + wB / 2, mid);
  ctx.fillText('P', left + wB - overlap + wP / 2, mid);

  const img = ctx.getImageData(0, 0, SDF_SIZE, SDF_SIZE).data;
  const n = SDF_SIZE * SDF_SIZE;
  const inside = new Float64Array(n);
  const outside = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const on = img[i * 4] > 127;
    inside[i] = on ? 1e20 : 0;
    outside[i] = on ? 0 : 1e20;
  }
  edt2d(inside, SDF_SIZE, SDF_SIZE);
  edt2d(outside, SDF_SIZE, SDF_SIZE);

  const out = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const sd = Math.sqrt(outside[i]) - Math.sqrt(inside[i]);
    out[i] = Math.max(0, Math.min(255, Math.round((0.5 + sd / (2 * SDF_SPREAD)) * 255)));
  }
  return out;
}

export const SDF_TEX_SIZE = SDF_SIZE;

/* ----------------------------------------------------------------- shader */

export const VERT = `#version 300 es
void main(){
  // One oversized triangle; cheaper than a quad and avoids the diagonal seam.
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

export const FRAG = `#version 300 es
precision highp float;
out vec4 fragColor;

uniform vec2  uRes;
uniform float uTime;
uniform float uProg;     // 0 at handover, 1 fully resolved
uniform sampler2D uSdf;

const float SPREAD = float(${SDF_SPREAD}) / float(${SDF_SIZE});
const float GSCALE = 1.95;    // object scale, so the mark reads at hero size
// Half depth, in unit space. The cap height of the pair is only ~0.33 here, so
// anything near 0.08 reads as a slab rather than lettering.
const float THICK  = 0.040;
// Edge break. Kept small and compensated for below: rounding inflates a solid in
// every direction, and the counters inside the B and P are barely 0.04 wide.
const float ROUND  = 0.006;

mat3 rotX(float a){ float s=sin(a),c=cos(a); return mat3(1.,0.,0., 0.,c,-s, 0.,s,c); }
mat3 rotY(float a){ float s=sin(a),c=cos(a); return mat3(c,0.,s, 0.,1.,0., -s,0.,c); }

float hash1(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
vec2  hash2(vec2 p){ return fract(sin(vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)))) * 43758.5453); }

// Signed distance to the mark on its own plane, in unit space.
float glyphSD(vec2 p){
  // Canvas rows go down, GL texture rows go up. A flipped B still reads as a B,
  // which is what made this hide: only the P gave it away, as a b.
  vec2 uv = vec2(p.x + 0.5, 0.5 - p.y);
  vec2 g = abs(uv - 0.5) - 0.5;
  float outside = length(max(g, 0.0));
  if (outside > 0.0) return outside + SPREAD;        // beyond the baked field
  return (texture(uSdf, uv).r - 0.5) * 2.0 * SPREAD;
}

float mapUnit(vec3 p){
  // Inset by ROUND before rounding by ROUND, so the bevel sits inside the real
  // silhouette instead of growing it and sealing the counters shut.
  vec2 w = vec2(glyphSD(p.xy) + ROUND, abs(p.z) - (THICK - ROUND));
  return min(max(w.x, w.y), 0.0) + length(max(w, 0.0)) - ROUND;
}

// The same solid at hero scale. Uniform, so thickness and rounding scale too.
float mapScene(vec3 p){ return mapUnit(p / GSCALE) * GSCALE; }

vec3 sceneNormal(vec3 p){
  vec2 e = vec2(1.0, -1.0) * 0.0025;
  return normalize(
    e.xyy * mapScene(p + e.xyy) + e.yyx * mapScene(p + e.yyx) +
    e.yxy * mapScene(p + e.yxy) + e.xxx * mapScene(p + e.xxx));
}

/**
 * One orbital ring, solved rather than marched: the ring is a circle in a plane,
 * so intersecting the ray with that plane lands exactly on it. Marching this
 * misses almost every time, because the glow is far thinner than any sane step.
 */
float ring(vec3 ro, vec3 rd, mat3 M, float radius, float tHit, float phase, out float spark){
  spark = 0.0;
  vec3 o = M * ro;
  vec3 d = M * rd;
  if (abs(d.y) < 1e-4) return 0.0;
  float t = -o.y / d.y;
  if (t <= 0.05 || t > tHit) return 0.0;
  vec3 p = o + d * t;
  float dist = abs(length(p.xz) - radius);
  // Seen edge-on the ring should thicken rather than disappear. One object unit
  // is roughly 180px here, so these widths are chosen to land near 10px of core
  // inside a ~25px falloff.
  // The grazing widen has to be clamped hard: let it run and an edge-on ring
  // smears into a blob instead of reading as an orbit.
  float w = 0.038 / max(abs(d.y), 0.5);
  float core = exp(-(dist * dist) / (w * w));
  float halo = exp(-dist * 9.0);
  float ang = atan(p.z, p.x);
  spark = core * pow(0.5 + 0.5 * sin(ang * 9.0 - uTime * 2.1 + phase), 14.0);
  return core + halo * 0.20;
}

void main(){
  // Fit to the short axis, not the tall one: normalising by height alone makes a
  // portrait phone scale the whole composition to 812px and throw the orbits off
  // both edges. The 1.3 keeps the mark from shrinking too far once it does fit,
  // and on any landscape viewport this resolves to uRes.y exactly as before.
  vec2 frag = (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x * 1.3, uRes.y);

  float ease = uProg * uProg * (3.0 - 2.0 * uProg);
  float alive = smoothstep(0.0, 0.3, uProg);

  // Act two enters high and travels down to centre, arriving before the act
  // ends so it holds still at rest rather than drifting to the last pixel.
  float settle = smoothstep(0.0, 0.78, uProg);
  settle = settle * settle * (3.0 - 2.0 * settle);
  float yShift = mix(0.30, 0.0, settle);

  // Subtracting the shift from frag moves the mark up the screen: the ray that
  // lands on the object's centre is the one at frag.y == yShift.
  vec2 uv = (frag - vec2(0.0, yShift)) * mix(1.25, 1.0, ease);

  vec3 ro = vec3(0.0, 0.0, -3.1);
  vec3 rd = normalize(vec3(uv * 1.55, 1.0));

  // Kept off-axis at rest, so the extrusion stays legible instead of going flat.
  float yaw   = mix(-1.05, 0.22, ease) + sin(uTime * 0.28) * 0.12;
  float pitch = mix( 0.45, -0.10, ease) + sin(uTime * 0.21) * 0.06;
  mat3 R  = rotY(yaw) * rotX(pitch);
  mat3 Rt = transpose(R);

  vec3 oro = Rt * ro;
  vec3 ord = Rt * rd;

  vec3 col = vec3(0.0);
  float alpha = 0.0;
  float tHit = 1e9;

  // Bounding sphere first: most of the frame never enters the march at all.
  float b = dot(oro, ord);
  float c0 = dot(oro, oro) - (0.95 * GSCALE) * (0.95 * GSCALE);
  float disc = b * b - c0;

  if (disc > 0.0) {
    float t = max(-b - sqrt(disc), 0.0);
    float tMax = -b + sqrt(disc);
    bool hit = false;
    for (int i = 0; i < STEPS; i++) {
      vec3 p = oro + ord * t;
      float d = mapScene(p);
      if (d < 0.0009) { hit = true; break; }
      t += max(d * 0.9, 0.003);
      if (t > tMax) break;
    }

    if (hit) {
      tHit = t;
      vec3 p = oro + ord * t;
      vec3 obj = p / GSCALE;
      vec3 n = R * sceneNormal(p);
      vec3 v = -rd;
      vec3 refl = reflect(rd, n);

      float fres = pow(1.0 - clamp(dot(n, v), 0.0, 1.0), 3.0);

      // Stand-in environment: cold sky above, warm city bounce from below, which
      // is what the plate underneath is actually lit by.
      vec3 env = mix(vec3(0.03, 0.08, 0.22), vec3(0.40, 0.70, 1.0),
                     smoothstep(-0.45, 0.65, refl.y));
      env += vec3(1.0, 0.66, 0.36) * pow(clamp(-refl.y, 0.0, 1.0), 3.0) * 0.40;

      // Polished-glass gradient down the face, which is what sells it as a solid
      // rather than a flat fill once the thing is nearly face-on.
      float vgrad = clamp(obj.y * 1.5 + 0.5, 0.0, 1.0);
      vec3 base = mix(vec3(0.02, 0.11, 0.42), vec3(0.82, 0.95, 1.0), vgrad * vgrad);

      vec3 body = base * (0.45 + 0.75 * env);
      body += vec3(0.40, 0.76, 1.0) * fres * 1.9;

      vec3 key = normalize(vec3(-0.45, 0.62, -0.72));
      body += vec3(1.0) * pow(clamp(dot(refl, key), 0.0, 1.0), 56.0) * 2.6;
      body += vec3(0.55, 0.82, 1.0) * pow(clamp(dot(n, key), 0.0, 1.0), 2.0) * 0.22;

      // Side walls read darker than the face, with a lit edge where they meet.
      float side = 1.0 - abs(n.z);
      body = mix(body, body * 0.34 + vec3(0.02, 0.07, 0.22), side * 0.6);
      body += vec3(0.30, 0.70, 1.0) * pow(side, 4.0) * 0.9;

      col += body * alive;
      alpha = alive;
    }
  }

  // Orbits. Three circles, each in its own tilted plane, all turning about the
  // mark and correctly hidden where they pass behind it.
  float ringFade = smoothstep(0.08, 0.55, uProg);
  float spread = mix(1.45, 1.0, ease) * GSCALE;
  float s1, s2, s3;
  float g1 = ring(ro, rd, rotX( 1.33) * rotY( uTime * 0.55       ) * Rt, 0.60 * spread, tHit, 0.0, s1);
  float g2 = ring(ro, rd, rotX(-0.98) * rotY(-uTime * 0.42 + 2.10) * Rt, 0.50 * spread, tHit, 2.1, s2);
  float g3 = ring(ro, rd, rotX( 0.38) * rotY( uTime * 0.31 + 4.20) * Rt, 0.70 * spread, tHit, 4.2, s3);
  float glow = (g1 + g2 + g3) * ringFade;
  float spark = (s1 + s2 + s3) * ringFade;
  col += vec3(0.24, 0.60, 1.0) * glow * 0.52;
  col += vec3(0.80, 0.94, 1.0) * spark * 0.95;

  // Bloom in two parts: a tight rim read from the field, which is only accurate
  // within the baked spread, and a broad radial wash that carries the far half.
  if (abs(ord.z) > 1e-4) {
    float tp = -oro.z / ord.z;
    if (tp > 0.0) {
      float ds = max(glyphSD((oro + ord * tp).xy / GSCALE), 0.0);
      float rim = exp(-ds * 34.0) * 0.55;
      float pulse = 0.85 + 0.15 * sin(uTime * 1.6);
      col += vec3(0.26, 0.58, 1.0) * rim * alive * pulse;
    }
  }
  float wash = exp(-length(uv) * 4.6) * 0.16 + exp(-length(uv) * 11.0) * 0.14;
  col += vec3(0.20, 0.52, 1.0) * wash * alive;

  // Drifting motes; they read as depth without another march.
  float dust = 0.0;
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    vec2 g = frag * (7.0 + fi * 6.0) + vec2(uTime * 0.03 * (fi + 1.0), -uTime * 0.045);
    vec2 id = floor(g);
    vec2 f = fract(g) - 0.5;
    vec2 o = (hash2(id) - 0.5) * 0.72;
    float tw = 0.45 + 0.55 * sin(uTime * 2.2 + hash1(id) * 6.2831);
    dust += smoothstep(0.075, 0.0, length(f - o)) * tw / (1.0 + fi);
  }
  // Kept close to the mark; spread across the whole frame it just reads as snow.
  col += vec3(0.55, 0.80, 1.0) * dust * 0.3 * alive * exp(-length(uv) * 1.7);

  // The drawing buffer is premultiplied, so any channel brighter than alpha gets
  // clamped away by the compositor. Carrying the glow in alpha keeps it: over a
  // dark plate a near-opaque bright pixel reads the same as an additive one.
  float lum = max(col.r, max(col.g, col.b));
  fragColor = vec4(col, clamp(max(alpha, lum), 0.0, 1.0));
}`;
