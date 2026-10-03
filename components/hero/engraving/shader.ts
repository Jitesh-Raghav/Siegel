// GLSL for the line-engraving banner (WebGL2).

export const VERT = /* glsl */ `#version 300 es
in vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}`

export const FRAG = /* glsl */ `#version 300 es
precision highp float;

uniform sampler2D uImage;
uniform vec2 uRes;        // canvas size in device px
uniform vec2 uImageSize;  // source size in px
uniform vec4 uCrop;       // source sub-rect (x, y, w, h) in 0..1, y up
uniform float uDpr;
uniform float uProgress;  // intro 0 → 1
uniform float uFrame;     // dither flicker step
uniform float uDrift;     // idle line-phase drift
uniform vec2 uOffset;     // parallax, CSS px
uniform float uGrain;     // paper grain amount (0 for exports: keeps the PNG small)
uniform vec3 uInk;
uniform vec3 uCream;
uniform vec3 uPaper;

out vec4 outColor;

const float PITCH = 3.0;  // CSS px between engraving lines
const float WARP = 5.5;   // how strongly lines bend along tonal forms

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * vnoise(p);
    p = p * 2.03 + 17.0;
    a *= 0.5;
  }
  return v;
}

// Canvas CSS px → source uv, "cover" fit inside the crop rect, with a little overscan for parallax.
vec2 sourceUv(vec2 px) {
  vec2 css = uRes / uDpr;
  vec2 uv = px / css;
  vec2 cropPx = uCrop.zw * uImageSize;
  float canvasAspect = css.x / css.y;
  float imageAspect = cropPx.x / cropPx.y;
  vec2 scale = canvasAspect > imageAspect
    ? vec2(1.0, imageAspect / canvasAspect)
    : vec2(canvasAspect / imageAspect, 1.0);
  scale *= 0.985;
  return uCrop.xy + ((uv - 0.5) * scale + 0.5) * uCrop.zw;
}

float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

// uv is y-up; the texture is stored top row first.
vec3 tex(vec2 uv) { return texture(uImage, vec2(uv.x, 1.0 - uv.y)).rgb; }
vec3 texLod(vec2 uv, float lod) { return textureLod(uImage, vec2(uv.x, 1.0 - uv.y), lod).rgb; }

void main() {
  vec2 px = gl_FragCoord.xy / uDpr + uOffset;
  vec2 uv = sourceUv(px);

  // Detail tone: 9-tap tent blur around the sample to avoid aliasing on fine detail.
  vec2 t = 1.2 / uImageSize;
  float L = luma(tex(uv)) * 4.0;
  L += (luma(tex(uv + vec2(t.x, 0.0))) + luma(tex(uv - vec2(t.x, 0.0)))
      + luma(tex(uv + vec2(0.0, t.y))) + luma(tex(uv - vec2(0.0, t.y)))) * 2.0;
  L += luma(tex(uv + t)) + luma(tex(uv - t))
     + luma(tex(uv + vec2(t.x, -t.y))) + luma(tex(uv + vec2(-t.x, t.y)));
  L /= 16.0;
  L = smoothstep(0.04, 0.96, L);
  float dark = pow(1.0 - L, 1.45);

  // Broad tone (mip-blurred) bends the line phase so strokes follow forms, like a burin.
  float broad = luma(texLod(uv, 5.0));
  float broad2 = luma(texLod(uv, 3.5));
  float bend = broad * 0.7 + broad2 * 0.3;

  // Main horizontal engraving lines; thickness grows with darkness.
  float phase = px.y / PITCH + bend * WARP + uDrift;
  float aa = max(fwidth(phase), 1e-4) * 0.75;
  float hi = smoothstep(0.62, 0.9, L);
  float halfW = mix(0.03, 0.46, dark);
  halfW = max(halfW, 0.16 * hi); // keep faint cream lines visible in highlights
  float d = abs(fract(phase) - 0.5);
  float line = 1.0 - smoothstep(halfW - aa, halfW + aa, d);

  // Diagonal cross-hatch only in the darkest quarter of tones.
  const float ang = 0.61; // ~35°
  vec2 rp = mat2(cos(ang), sin(ang), -sin(ang), cos(ang)) * px;
  float phase2 = rp.y / (PITCH * 1.15) + bend * WARP * 0.5;
  float aa2 = max(fwidth(phase2), 1e-4) * 0.75;
  float hatchMask = smoothstep(0.72, 0.82, dark);
  float halfW2 = mix(0.05, 0.32, smoothstep(0.75, 1.0, dark));
  float d2 = abs(fract(phase2) - 0.5);
  float hatch = (1.0 - smoothstep(halfW2 - aa2, halfW2 + aa2, d2)) * hatchMask;

  float stroke = max(line, hatch);

  // Dark strokes in ink; highlights turn into cream lines on paper.
  vec3 strokeColor = mix(uInk, uCream * 0.97, hi);
  vec3 col = mix(uPaper, strokeColor, stroke);

  // Paper grain.
  float grain = hash(floor(gl_FragCoord.xy) + 0.37) - 0.5;
  col += grain * uGrain;

  // Intro: stochastic dither in ink and cream, with blotches, dissolving into the engraving.
  if (uProgress < 1.0) {
    vec2 cell = floor(px / 1.5);
    float h = hash(cell + uFrame * 13.1);
    float blot = fbm(px / 70.0 + 4.0);
    float density = clamp(dark * 0.85 + (blot - 0.5) * 0.9, 0.0, 1.0);
    vec3 dither = h < density ? uInk : (h < density + 0.22 ? uCream * 0.95 : uPaper);
    dither += grain * 0.04;

    float n = fbm(px / 120.0 + 9.0) * 0.75 + hash(cell + 3.3) * 0.25;
    const float edge = 0.08;
    float p = uProgress * (1.0 + 2.0 * edge) - edge;
    float reveal = smoothstep(n - edge, n + edge, p);
    col = mix(dither, col, reveal);
  }

  outColor = vec4(col, 1.0);
}`
