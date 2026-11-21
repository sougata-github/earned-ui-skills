// Liquid glass for the web: one WebGL2 canvas draws an image and rounded
// glass shapes over it, with real refraction. No dependencies.
//
// Reference implementation for the liquid-glass-web skill. Copy it into the
// project and adapt it: it is a starting point, not a package.
//
// What it draws, per pixel:
//   1. the image, cropped to cover the canvas (like object-fit: cover)
//   2. a soft contact shadow under every shape
//   3. inside a shape: the image seen through a glass slab. A squircle
//      height profile along the edge band bends rays by Snell's law, once
//      per colour channel (dispersion), over an optional frost
//   4. light on the silhouette: a Fresnel rim, an angled specular, a
//      softer counter highlight and a hairline at the very edge
//
// Shapes are rounded rectangles measured from the DOM (CSS px, relative to
// the canvas). Content stays real HTML laid over them. Shapes closer than
// `blend` melt into one surface (a smooth union of their distance fields).
//
// Coordinates: the shader works in device pixels with a top-left origin,
// the same as getBoundingClientRect, so measured rects need no flipping.

export type GlassMaterial = {
  /** Width of the curved edge band, CSS px. Thin reads as a crisp lip,
   *  wide as a thick lens. */
  bezel: number
  /** Slab height, CSS px. How far rays travel inside: more is a stronger
   *  bend at the edge. */
  thickness: number
  /** Refractive index. 1 bends nothing, real glass is about 1.5. */
  ior: number
  /** IOR spread between red and blue: colour fringes at the edge. */
  dispersion: number
  /** Scale of what is seen through the flat middle. 1 is none, above 1
   *  enlarges, below 1 shrinks. */
  magnify: number
  /** Blur radius inside the glass, CSS px. 0 is clear glass. */
  frost: number
  /** Mix toward `tintColor`, 0..1. */
  tint: number
  /** RGB 0..1. */
  tintColor: [number, number, number]
  /** Darkens what is seen through the glass, 0..1 (for light ink on
   *  bright images). */
  dim: number
  /** Fresnel brightening along the rim, 0..1.5. */
  rim: number
  /** Strength of the light that catches the edge, 0..1.5. */
  specular: number
  /** Contact shadow strength, 0..1. */
  shadow: number
  /** Where the light comes from, degrees: 0 right, 90 up, 135 upper left. */
  lightAngle: number
  /** Shapes closer than this (CSS px) melt together. 0 never. */
  blend: number
}

/** A rounded rectangle in CSS px, relative to the canvas's top left. */
export type GlassShape = {
  x: number
  y: number
  width: number
  height: number
  /** Corner radius, CSS px. Clamped to half the shorter side, so a large
   *  value gives a pill or a circle. */
  radius: number
  /** Glass on glass: a small shape sitting on a panel. It refracts the
   *  panel as drawn (its frost, tint and light), not the bare image, and
   *  casts its shadow on it. measureShapes sets it for elements marked
   *  `data-glass-inset`. */
  inset?: boolean
}

/** The material of insets (glass on glass). They add no frost, dim or tint
 *  of their own: the panel under them already has it. */
export type InsetMaterial = {
  /** Edge band, CSS px. Half the inset's size makes a full dome (a marble). */
  bezel: number
  thickness: number
  /** Above 1 enlarges the panel seen through it, like a lens. */
  magnify: number
  /** Rim and specular, as a share of the panels'. Small glass glares
   *  easily, so keep it under 1. */
  light: number
}

export const INSET: InsetMaterial = {
  bezel: 18,
  thickness: 56,
  magnify: 1.12,
  light: 0.45,
}

// Two starting points. Tune from here in a lab with live controls, by eye,
// over the real image (see the skill's lab reference).
export const MATERIALS = {
  /** For panels that carry text: frosted, quiet light. */
  regular: {
    bezel: 16,
    thickness: 42,
    ior: 1.22,
    dispersion: 0.012,
    magnify: 1,
    frost: 6,
    tint: 0,
    tintColor: [1, 1, 1],
    dim: 0.06,
    rim: 0.3,
    specular: 0.6,
    shadow: 0.16,
    lightAngle: 135,
    blend: 0,
  },
  /** Over rich imagery with bold content: no frost, a little dimming. */
  clear: {
    bezel: 16,
    thickness: 42,
    ior: 1.22,
    dispersion: 0.012,
    magnify: 1,
    frost: 0,
    tint: 0,
    tintColor: [1, 1, 1],
    dim: 0.14,
    rim: 0.3,
    specular: 0.6,
    shadow: 0.16,
    lightAngle: 135,
    blend: 0,
  },
} satisfies Record<string, GlassMaterial>

export const MAX_SHAPES = 8
export const MAX_INSETS = 4

const VERTEX = /* glsl */ `#version 300 es
void main() {
  // One triangle that covers the screen, no buffers.
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}
`

const FRAGMENT = /* glsl */ `#version 300 es
precision highp float;
#define MAX_SHAPES ${MAX_SHAPES}
#define MAX_INSETS ${MAX_INSETS}

uniform sampler2D uImage;   // the current image
uniform vec2 uImageSize;    // image px
uniform sampler2D uPrev;    // the image it is fading in over
uniform vec2 uPrevSize;
uniform float uHasPrev;     // 0: fading in over the background colour
uniform float uFade;        // 0 previous, 1 current
uniform vec3 uBackground;
uniform vec2 uFocus;        // point of the image kept in view, 0..1
uniform vec2 uRes;          // canvas, device px

uniform vec4 uShapes[MAX_SHAPES]; // centre xy, half size zw, device px
uniform float uRadii[MAX_SHAPES];
uniform int uCount;

uniform float uBlend;
uniform float uBezel;
uniform float uThickness;
uniform float uIor;
uniform float uDispersion;
uniform float uMagnify;
uniform float uFrost;
uniform float uTint;
uniform vec3 uTintColor;
uniform float uDim;
uniform float uRim;
uniform float uSpecular;
uniform float uShadow;
uniform vec2 uLight;        // unit vector toward the light, y down
uniform float uMaterialize; // 0..1: glass arrives by ramping its optics

uniform vec4 uInsets[MAX_INSETS]; // glass on glass, same layout as uShapes
uniform float uInsetRadii[MAX_INSETS];
uniform int uInsetCount;
uniform float uInsetBezel;
uniform float uInsetThickness;
uniform float uInsetMagnify;
uniform float uInsetLight;

out vec4 outColor;

float sdRoundBox(vec2 p, vec2 b, float r) {
  r = min(r, min(b.x, b.y));
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

// Smooth union: shapes nearer than k melt into one surface.
float smin(float a, float b, float k) {
  if (k <= 0.0) return min(a, b);
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * 0.25;
}

float field(vec2 p) {
  float d = 1e6;
  for (int i = 0; i < MAX_SHAPES; i++) {
    if (i >= uCount) break;
    d = smin(d, sdRoundBox(p - uShapes[i].xy, uShapes[i].zw, uRadii[i]), uBlend);
  }
  return d;
}

// The centre the flat middle magnifies about: the shape the pixel is in,
// blended across a melted neck so the view never jumps.
vec2 centreAt(vec2 p) {
  vec2 acc = vec2(0.0);
  float w = 0.0;
  float soft = max(uBlend, 1.0);
  for (int i = 0; i < MAX_SHAPES; i++) {
    if (i >= uCount) break;
    float d = sdRoundBox(p - uShapes[i].xy, uShapes[i].zw, uRadii[i]);
    float k = exp(-max(d, 0.0) / soft);
    acc += uShapes[i].xy * k;
    w += k;
  }
  return w > 0.0 ? acc / w : p;
}

// The image at p (device px), covering the canvas. Sampled at the mip level
// that matches its scale, so a large image never shimmers when drawn small.
// Always an explicit level: refraction makes neighbouring pixels read far
// apart, and automatic mip selection then picks a blurry level at the edge.
vec3 cover(sampler2D tex, vec2 size, vec2 p, float extraLod) {
  float s = max(uRes.x / size.x, uRes.y / size.y);
  vec2 ip = (p - uRes * uFocus) / s + size * uFocus;
  float lod = max(log2(1.0 / s), 0.0) + extraLod;
  return textureLod(tex, clamp(ip / size, 0.0, 1.0), lod).rgb;
}

// A new image cross-fades over the old one. The glass refracts the blend,
// so it changes with the scene instead of cutting.
vec3 image(vec2 p, float extraLod) {
  vec3 current = cover(uImage, uImageSize, p, extraLod);
  if (uFade >= 1.0) return current;
  vec3 previous = uHasPrev > 0.5 ? cover(uPrev, uPrevSize, p, extraLod) : uBackground;
  return mix(previous, current, uFade);
}

vec3 frosted(vec2 p) {
  // Frost ramps in with the material: at materialize 0 the shape is bare
  // image, never a frosted rectangle ahead of the glass.
  float f = uFrost * uMaterialize;
  if (f < 0.5) return image(p, 0.0);
  float lod = log2(1.0 + f / 6.0);
  vec3 acc = image(p, lod);
  float w = 1.0;
  // Golden angle spiral, weights fall off with distance.
  for (int i = 1; i < 16; i++) {
    float fi = float(i);
    float r = sqrt(fi / 16.0) * f;
    float a = fi * 2.39996;
    float k = 1.0 - fi / 20.0;
    acc += image(p + vec2(cos(a), sin(a)) * r, lod) * k;
    w += k;
  }
  return acc / w;
}

// Squircle profile (continuous curvature): flat middle, soft shoulder,
// steep rim. x is 0 at the rim and 1 where the flat top begins.
float heightAt(float x) {
  return pow(1.0 - pow(1.0 - x, 4.0), 0.25);
}

float slopeAt(float x) {
  float e = 0.002;
  return (heightAt(min(x + e, 1.0)) - heightAt(max(x - e, 0.0))) / (2.0 * e);
}

// Where a ray looking straight down lands after bending through a slab of
// the given thickness and edge band.
vec2 refractThrough(vec2 grad, float x, float ior, float thickness, float bezel) {
  float slope = min(slopeAt(x), 24.0) * thickness / bezel;
  vec3 n = normalize(vec3(grad * slope, 1.0));
  vec3 r = refract(vec3(0.0, 0.0, -1.0), n, 1.0 / ior);
  float depth = heightAt(x) * thickness + thickness * 0.35;
  return r.xy * depth / max(-r.z, 0.05);
}

vec2 refractOffset(vec2 grad, float x, float ior) {
  return refractThrough(grad, x, ior, uThickness, uBezel);
}

// Light on the silhouette: rim, lit side specular, counter highlight and a
// hairline. strength scales rim and specular (insets glare more easily).
vec3 edgeLight(vec2 grad, float x, float d, float strength) {
  float rimBand = pow(1.0 - x, 3.0);
  float lit = max(dot(-grad, -uLight), 0.0);
  float counter = max(dot(-grad, uLight), 0.0);
  float spec = pow(lit, 4.0) * pow(1.0 - x, 5.0) + 0.45 * pow(counter, 6.0) * pow(1.0 - x, 7.0);
  float hairline = (1.0 - smoothstep(0.0, 1.6, abs(d))) * (0.35 + 0.65 * lit);
  return vec3(1.0) * (rimBand * uRim * 0.25 + spec * uSpecular + hairline * uSpecular * 0.5) * strength;
}

// The image with every panel drawn on it, at any point.
vec3 panelAt(vec2 p) {
  vec3 base = image(p, 0.0);
  if (uCount == 0) return base;

  float m = uMaterialize;
  float d = field(p);

  // Contact shadow: the silhouette shifted down, soft, only outside.
  float soft = uBezel * 1.4 + uThickness * 0.3;
  float ds = field(p - vec2(0.0, soft * 0.45));
  float shadow = exp(-max(ds, 0.0) / soft) * step(0.0, d);
  base *= 1.0 - uShadow * m * shadow;

  if (d > 1.0) return base;

  vec2 e = vec2(1.0, 0.0);
  vec2 grad = normalize(vec2(field(p + e.xy) - field(p - e.xy), field(p + e.yx) - field(p - e.yx)) + 1e-6);
  float x = clamp(-d / uBezel, 0.0, 1.0);

  vec2 c = centreAt(p);
  vec2 q = c + (p - c) / mix(1.0, uMagnify, m);

  // The flat middle bends nothing, so the three channels meet: one sample.
  vec3 glass;
  if (x >= 1.0) {
    glass = frosted(q);
  } else {
    glass.r = frosted(q + refractOffset(grad, x, uIor - uDispersion) * m).r;
    glass.g = frosted(q + refractOffset(grad, x, uIor) * m).g;
    glass.b = frosted(q + refractOffset(grad, x, uIor + uDispersion) * m).b;
  }

  glass *= 1.0 - uDim * m;
  glass = mix(glass, uTintColor, uTint * m);

  // Light defines the silhouette.
  glass += edgeLight(grad, x, d, 1.0) * m;

  float mask = 1.0 - smoothstep(-0.75, 0.75, d);
  return mix(base, glass, mask);
}

float insetField(vec2 p, vec4 rect, float radius) {
  return sdRoundBox(p - rect.xy, rect.zw, radius);
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  if (uInsetCount == 0) {
    outColor = vec4(panelAt(p), 1.0);
    return;
  }

  // Glass on glass: the inset nearest this pixel (insets never overlap).
  float dl = 1e6;
  vec4 rect = vec4(0.0);
  float radius = 0.0;
  for (int i = 0; i < MAX_INSETS; i++) {
    if (i >= uInsetCount) break;
    float di = insetField(p, uInsets[i], uInsetRadii[i]);
    if (di < dl) {
      dl = di;
      rect = uInsets[i];
      radius = uInsetRadii[i];
    }
  }

  float m = uMaterialize;
  vec3 under = panelAt(p);

  // The inset's shadow falls on the panel under it.
  float soft = uInsetBezel * 1.4 + uInsetThickness * 0.3;
  float ds = insetField(p - vec2(0.0, soft * 0.45), rect, radius);
  under *= 1.0 - uShadow * m * exp(-max(ds, 0.0) / soft) * step(0.0, dl);

  if (dl > 1.0) {
    outColor = vec4(under, 1.0);
    return;
  }

  vec2 e = vec2(1.0, 0.0);
  vec2 grad = normalize(vec2(
    insetField(p + e.xy, rect, radius) - insetField(p - e.xy, rect, radius),
    insetField(p + e.yx, rect, radius) - insetField(p - e.yx, rect, radius)
  ) + 1e-6);
  float x = clamp(-dl / uInsetBezel, 0.0, 1.0);
  vec2 q = rect.xy + (p - rect.xy) / mix(1.0, uInsetMagnify, m);

  // It bends the panel as drawn, not the bare image.
  vec3 glass;
  if (x >= 1.0) {
    glass = panelAt(q);
  } else {
    glass.r = panelAt(q + refractThrough(grad, x, uIor - uDispersion, uInsetThickness, uInsetBezel) * m).r;
    glass.g = panelAt(q + refractThrough(grad, x, uIor, uInsetThickness, uInsetBezel) * m).g;
    glass.b = panelAt(q + refractThrough(grad, x, uIor + uDispersion, uInsetThickness, uInsetBezel) * m).b;
  }
  glass += edgeLight(grad, x, dl, uInsetLight) * m;

  float mask = 1.0 - smoothstep(-0.75, 0.75, dl);
  outColor = vec4(mix(under, glass, mask), 1.0);
}
`

const UNIFORMS = [
  "uImage",
  "uImageSize",
  "uPrev",
  "uPrevSize",
  "uHasPrev",
  "uFade",
  "uBackground",
  "uFocus",
  "uRes",
  "uShapes",
  "uRadii",
  "uCount",
  "uBlend",
  "uBezel",
  "uThickness",
  "uIor",
  "uDispersion",
  "uMagnify",
  "uFrost",
  "uTint",
  "uTintColor",
  "uDim",
  "uRim",
  "uSpecular",
  "uShadow",
  "uLight",
  "uMaterialize",
  "uInsets",
  "uInsetRadii",
  "uInsetCount",
  "uInsetBezel",
  "uInsetThickness",
  "uInsetMagnify",
  "uInsetLight",
] as const

type Uniform = (typeof UNIFORMS)[number]

export type GlassStageOptions = {
  /** Device pixel ratio cap. 2 keeps retina sharp and the GPU calm. */
  maxDpr?: number
  /** Drawn until the image arrives, RGB 0..1. */
  background?: [number, number, number]
}

export class GlassStage {
  /** WebGL2 is all this needs. Without it, show the image and a solid
   *  surface: never a backdrop blur standing in for glass. */
  static supported(): boolean {
    try {
      return !!document.createElement("canvas").getContext("webgl2")
    } catch {
      return false
    }
  }

  private gl: WebGL2RenderingContext
  private program: WebGLProgram
  private loc = {} as Record<Uniform, WebGLUniformLocation | null>
  private texture: WebGLTexture
  private prevTexture: WebGLTexture
  private imageSize: [number, number] = [1, 1]
  private prevSize: [number, number] = [1, 1]
  private hasImage = false
  private hasPrev = false
  private fadeFrom = 0
  private fadeMs = 0
  private loadToken = 0
  private focus: [number, number] = [0.5, 0.5]
  private dpr: number
  private material: GlassMaterial = { ...MATERIALS.regular }
  private shapes: GlassShape[] = []
  private insets: GlassShape[] = []
  private insetMaterial: InsetMaterial = { ...INSET }
  private materialize = 1
  private background: [number, number, number]
  private disposed = false

  constructor(
    private canvas: HTMLCanvasElement,
    options: GlassStageOptions = {}
  ) {
    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
    })
    if (!gl) throw new Error("WebGL2 is not available")
    if (gl.isContextLost())
      throw new Error("The canvas's WebGL context is lost")
    this.gl = gl
    this.dpr = Math.min(window.devicePixelRatio || 1, options.maxDpr ?? 2)
    this.background = options.background ?? [0.08, 0.09, 0.11]

    this.program = link(gl, VERTEX, FRAGMENT)
    for (const name of UNIFORMS) {
      this.loc[name] = gl.getUniformLocation(this.program, name)
    }
    // A vertex array must be bound to draw, even with no attributes.
    gl.bindVertexArray(gl.createVertexArray())

    const blank = () => {
      const texture = gl.createTexture()!
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        1,
        1,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        new Uint8Array([0, 0, 0, 255])
      )
      return texture
    }
    this.texture = blank()
    this.prevTexture = blank()
    this.resize()
  }

  /** Loads the image under the glass, AVIF first, a fallback after, and
   *  cross-fades it in over the current one (or the background colour) over
   *  `fadeMs`. Keep rendering every frame while `fading` is true. Only the
   *  latest call wins if several overlap. */
  async setImage(
    src: string,
    fallbackSrc?: string,
    fadeMs = 600
  ): Promise<void> {
    const token = ++this.loadToken
    const img = await loadImage(src).catch(() =>
      fallbackSrc ? loadImage(fallbackSrc) : Promise.reject()
    )
    // Disposed while it loaded (an unmount), or overtaken by a newer call.
    if (this.disposed || token !== this.loadToken) return
    const gl = this.gl

    // The current image becomes the one fading out. A fade cut short starts
    // from where it is, close enough at these durations.
    ;[this.texture, this.prevTexture] = [this.prevTexture, this.texture]
    this.prevSize = this.imageSize
    this.hasPrev = this.hasImage

    gl.bindTexture(gl.TEXTURE_2D, this.texture)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
    gl.generateMipmap(gl.TEXTURE_2D)
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR_MIPMAP_LINEAR
    )
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    this.imageSize = [img.naturalWidth, img.naturalHeight]
    this.hasImage = true
    this.fadeFrom = performance.now()
    this.fadeMs = fadeMs
  }

  /** True while an image is fading in: render every frame until it ends. */
  get fading(): boolean {
    return this.fadeProgress() < 1
  }

  private fadeProgress(): number {
    if (!this.hasImage) return 0
    if (this.fadeMs <= 0) return 1
    const t = Math.min(1, (performance.now() - this.fadeFrom) / this.fadeMs)
    // Ease in and out, so the change has no hard start or stop.
    return t * t * (3 - 2 * t)
  }

  /** Point of the image kept in view as it is cropped, 0..1. */
  setFocus(x: number, y: number) {
    this.focus = [x, y]
  }

  setMaterial(material: Partial<GlassMaterial>) {
    this.material = { ...this.material, ...material }
  }

  getMaterial(): GlassMaterial {
    return { ...this.material }
  }

  /** Rounded rects, CSS px relative to the canvas: up to MAX_SHAPES panels
   *  and up to MAX_INSETS insets (shapes with `inset: true`). */
  setShapes(shapes: GlassShape[]) {
    this.shapes = shapes.filter((s) => !s.inset).slice(0, MAX_SHAPES)
    this.insets = shapes.filter((s) => s.inset).slice(0, MAX_INSETS)
  }

  setInsetMaterial(material: Partial<InsetMaterial>) {
    this.insetMaterial = { ...this.insetMaterial, ...material }
  }

  /** 0 bare image, 1 full glass. Animate it to make glass arrive or leave
   *  (Apple: materialize by ramping the optics, never by fading opacity). */
  setMaterialize(value: number) {
    this.materialize = Math.min(1, Math.max(0, value))
  }

  /** Matches the drawing buffer to the canvas's CSS size. Call from a
   *  ResizeObserver, then render in the same callback: a resize clears the
   *  canvas, and rendering a frame later shows one empty frame. */
  resize() {
    const w = Math.max(1, Math.round(this.canvas.clientWidth * this.dpr))
    const h = Math.max(1, Math.round(this.canvas.clientHeight * this.dpr))
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w
      this.canvas.height = h
    }
  }

  render() {
    if (this.disposed) return
    const gl = this.gl
    const d = this.dpr
    const m = this.material
    const l = this.loc

    gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    gl.useProgram(this.program)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.texture)
    gl.uniform1i(l.uImage, 0)
    gl.uniform2f(l.uImageSize, this.imageSize[0], this.imageSize[1])
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, this.prevTexture)
    gl.uniform1i(l.uPrev, 1)
    gl.uniform2f(l.uPrevSize, this.prevSize[0], this.prevSize[1])
    gl.uniform1f(l.uHasPrev, this.hasPrev ? 1 : 0)
    gl.uniform1f(l.uFade, this.fadeProgress())
    gl.uniform3fv(l.uBackground, this.background)
    gl.uniform2f(l.uFocus, this.focus[0], this.focus[1])
    gl.uniform2f(l.uRes, this.canvas.width, this.canvas.height)

    const pack = (shapes: GlassShape[], max: number) => {
      const rects = new Float32Array(max * 4)
      const radii = new Float32Array(max)
      shapes.forEach((s, i) => {
        rects[i * 4] = (s.x + s.width / 2) * d
        rects[i * 4 + 1] = (s.y + s.height / 2) * d
        rects[i * 4 + 2] = (s.width / 2) * d
        rects[i * 4 + 3] = (s.height / 2) * d
        radii[i] = s.radius * d
      })
      return { rects, radii }
    }
    const panels = pack(this.shapes, MAX_SHAPES)
    gl.uniform4fv(l.uShapes, panels.rects)
    gl.uniform1fv(l.uRadii, panels.radii)
    gl.uniform1i(l.uCount, this.shapes.length)

    const insets = pack(this.insets, MAX_INSETS)
    const im = this.insetMaterial
    gl.uniform4fv(l.uInsets, insets.rects)
    gl.uniform1fv(l.uInsetRadii, insets.radii)
    gl.uniform1i(l.uInsetCount, this.insets.length)
    gl.uniform1f(l.uInsetBezel, Math.max(im.bezel, 1) * d)
    gl.uniform1f(l.uInsetThickness, im.thickness * d)
    gl.uniform1f(l.uInsetMagnify, im.magnify)
    gl.uniform1f(l.uInsetLight, im.light)

    gl.uniform1f(l.uBlend, m.blend * d)
    gl.uniform1f(l.uBezel, Math.max(m.bezel, 1) * d)
    gl.uniform1f(l.uThickness, m.thickness * d)
    gl.uniform1f(l.uIor, m.ior)
    gl.uniform1f(l.uDispersion, m.dispersion)
    gl.uniform1f(l.uMagnify, m.magnify)
    gl.uniform1f(l.uFrost, m.frost * d)
    gl.uniform1f(l.uTint, m.tint)
    gl.uniform3fv(l.uTintColor, m.tintColor)
    gl.uniform1f(l.uDim, m.dim)
    gl.uniform1f(l.uRim, m.rim)
    gl.uniform1f(l.uSpecular, m.specular)
    gl.uniform1f(l.uShadow, m.shadow)
    const a = (m.lightAngle * Math.PI) / 180
    gl.uniform2f(l.uLight, Math.cos(a), -Math.sin(a))
    gl.uniform1f(l.uMaterialize, this.materialize)

    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  /** Frees the GPU resources. The context itself stays alive: a canvas
   *  keeps one context for its whole life, so forcing it lost here would
   *  break the next stage built on the same canvas (React mounts effects
   *  twice in development, on the same element). */
  dispose() {
    this.disposed = true
    this.gl.deleteTexture(this.texture)
    this.gl.deleteTexture(this.prevTexture)
    this.gl.deleteProgram(this.program)
  }
}

/** A critically damped ease, 0 to 1 over `duration` ms with no overshoot:
 *  the curve for materializing glass. */
export function materializeCurve(t: number, duration = 900) {
  const w = 9 / Math.max(duration, 1)
  return Math.min(1, 1 - (1 + w * t) * Math.exp(-w * t))
}

/** Measures elements as shapes relative to the canvas. Radius comes from
 *  each element's own border-radius, so CSS stays the source of truth.
 *  Elements marked `data-glass-inset` become insets (glass on glass). */
export function measureShapes(
  canvas: HTMLElement,
  elements: (HTMLElement | null)[]
): GlassShape[] {
  const box = canvas.getBoundingClientRect()
  return elements
    .filter((el): el is HTMLElement => !!el)
    .map((el) => {
      const r = el.getBoundingClientRect()
      const radius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0
      // getBoundingClientRect includes transforms, so a lifted (scaled) or
      // dragged element is measured where it is drawn. Its border radius is
      // not scaled, so scale it by the same factor.
      const scale = el.offsetWidth ? r.width / el.offsetWidth : 1
      return {
        x: r.left - box.left,
        y: r.top - box.top,
        width: r.width,
        height: r.height,
        radius: radius * scale,
        inset: el.hasAttribute("data-glass-inset"),
      }
    })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new Image()
  img.crossOrigin = "anonymous"
  img.decoding = "async"
  img.src = src
  return img.decode().then(() => img)
}

function link(gl: WebGL2RenderingContext, vs: string, fs: string) {
  const program = gl.createProgram()!
  for (const [type, source] of [
    [gl.VERTEX_SHADER, vs],
    [gl.FRAGMENT_SHADER, fs],
  ] as const) {
    const shader = gl.createShader(type)!
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      // An empty log almost always means the context is lost, not the code.
      const log = gl.getShaderInfoLog(shader)
      throw new Error(
        log ||
          (gl.isContextLost()
            ? "WebGL context lost while compiling the glass shader"
            : "Glass shader failed to compile")
      )
    }
    gl.attachShader(program, shader)
  }
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) ?? "program link failed")
  }
  return program
}
