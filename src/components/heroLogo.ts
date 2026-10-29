/**
 * The BP monogram that resolves out of the hero footage once the scrub ends.
 *
 * The letters are a real extruded solid, not a sprite: a signed distance field
 * is baked from the site's own display face, then sphere-traced in the fragment
 * shader. That buys genuine silhouette change as it turns, and lets the orbital
 * rings be depth-tested against the glyph so they pass behind it properly.
 *
 * Everything composites premultiplied over the video frame underneath: the solid
 * body writes alpha, the glows carry colour with no alpha so they add.
 */

import { bakeGlyphSdf, FRAG, SDF_TEX_SIZE, VERT } from './heroLogoCore';

type Quality = {
  steps: number;
  maxDpr: number;
};

export type HeroLogo = {
  render: (progress: number, seconds: number, spin: number, mx: number, my: number) => void;
  resize: () => void;
  dispose: () => void;
};

/* ------------------------------------------------------------------ setup */

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error(`hero logo shader: ${log}`);
  }
  return sh;
}

export async function createHeroLogo(
  canvas: HTMLCanvasElement,
  quality: Quality,
): Promise<HeroLogo | null> {
  const gl = canvas.getContext('webgl2', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    powerPreference: 'high-performance',
  });
  if (!gl) return null;

  // Bake from the real display face, so the mark matches the rest of the site.
  let family = '800 sans-serif';
  try {
    await document.fonts.ready;
    const v = getComputedStyle(document.documentElement).getPropertyValue('--font-display').trim();
    if (v) family = `${v}, sans-serif`;
  } catch {
    /* fall back to the generic face */
  }
  const sdf = bakeGlyphSdf(family);

  const frag = FRAG.replace(/\bSTEPS\b/g, String(quality.steps));

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

  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.R8, SDF_TEX_SIZE, SDF_TEX_SIZE, 0, gl.RED, gl.UNSIGNED_BYTE, sdf,
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const vao = gl.createVertexArray();
  const uRes = gl.getUniformLocation(prog, 'uRes');
  const uTime = gl.getUniformLocation(prog, 'uTime');
  const uProg = gl.getUniformLocation(prog, 'uProg');
  const uSdf = gl.getUniformLocation(prog, 'uSdf');
  const uSpin = gl.getUniformLocation(prog, 'uSpin');
  const uMouse = gl.getUniformLocation(prog, 'uMouse');

  gl.useProgram(prog);
  gl.uniform1i(uSdf, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  let w = 0;
  let h = 0;
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, quality.maxDpr);
    const nw = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const nh = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (nw === w && nh === h) return;
    w = nw;
    h = nh;
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
  };
  resize();

  let cleared = false;
  const render = (progress: number, seconds: number, spin: number, mx: number, my: number) => {
    if (progress <= 0) {
      // Nothing to show yet; clear once and stay off the GPU during the scrub.
      if (!cleared) {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        cleared = true;
      }
      return;
    }
    cleared = false;
    resize();
    gl.useProgram(prog);
    gl.bindVertexArray(vao);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform2f(uRes, w, h);
    gl.uniform1f(uTime, seconds);
    gl.uniform1f(uProg, Math.min(1, progress));
    gl.uniform1f(uSpin, spin);
    gl.uniform2f(uMouse, mx, my);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  return {
    render,
    resize,
    dispose: () => {
      gl.deleteTexture(tex);
      gl.deleteProgram(prog);
      gl.deleteVertexArray(vao);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
