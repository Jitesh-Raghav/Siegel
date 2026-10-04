// WebGL2 line-engraving renderer core. No DOM access: runs on the main thread or inside a
// worker with an OffscreenCanvas. The host feeds it size, visibility and pointer input.

import { drawPlaceholderSource } from './placeholderSource'
import { FRAG, VERT } from './shader'

function hexToVec3(hex: string): [number, number, number] {
  const v = parseInt(hex.replace('#', ''), 16)
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255]
}

// light: navy lines on ivory. dark: white-line engraving in gold and cream on midnight.
const PALETTES = {
  light: { ink: hexToVec3('#17382D'), cream: hexToVec3('#E6DCC0'), paper: hexToVec3('#F5F1E4'), invert: 0 },
  dark: { ink: hexToVec3('#E0C896'), cream: hexToVec3('#25433A'), paper: hexToVec3('#0B1F19'), invert: 1 },
} as const

const INTRO_MS = 1800
const FRAME_MS = 1000 / 30
const MAX_PARALLAX = 4
const MAX_TEXTURE = 2048

export type Crop = [x: number, y: number, w: number, h: number]

/** Serializable options (they cross the worker boundary). */
export type RendererConfig = {
  crop?: Crop
  /** Play the dither → engraving intro. */
  intro?: boolean
  /** Static output: no drift, parallax or animation loop. */
  still?: boolean
  /** Keep the drawing buffer so the frame can be exported with toDataURL. */
  preserveDrawingBuffer?: boolean
  /** Disable paper grain (static exports compress far better without it). */
  noGrain?: boolean
  /** Absolute URL of the source photo, or null for the procedural placeholder. */
  sourceUrl?: string | null
  palette?: keyof typeof PALETTES
}

export type RendererEvents = {
  onFirstFrame?: () => void
  onIntroDone?: () => void
}

type Canvas = HTMLCanvasElement | OffscreenCanvas
type TextureSource = ImageBitmap | OffscreenCanvas | HTMLCanvasElement

const raf: (cb: (t: number) => void) => number =
  typeof requestAnimationFrame === 'function'
    ? (cb) => requestAnimationFrame(cb)
    : (cb) => setTimeout(() => cb(performance.now()), FRAME_MS) as unknown as number
const cancelRaf: (id: number) => void =
  typeof cancelAnimationFrame === 'function' ? (id) => cancelAnimationFrame(id) : (id) => clearTimeout(id)

function easeOut(t: number) {
  return 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3)
}

async function loadSource(url: string | null | undefined): Promise<TextureSource> {
  if (url) {
    try {
      const res = await fetch(url)
      if (res.ok) {
        const bitmap = await createImageBitmap(await res.blob())
        const scale = Math.min(1, MAX_TEXTURE / Math.max(bitmap.width, bitmap.height))
        if (scale >= 1) return bitmap
        const resized = await createImageBitmap(bitmap, {
          resizeWidth: Math.round(bitmap.width * scale),
          resizeHeight: Math.round(bitmap.height * scale),
          resizeQuality: 'high',
        })
        bitmap.close()
        return resized
      }
    } catch {
      // Fall through to the placeholder.
    }
  }
  return drawPlaceholderSource()
}

/** 2nd / 98th percentile luminance of a small downsample: auto-levels so any photo uses the full range. */
function computeLevels(source: TextureSource): [number, number] {
  try {
    const n = 64
    const canvas: OffscreenCanvas | HTMLCanvasElement =
      typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(n, n) : Object.assign(document.createElement('canvas'), { width: n, height: n })
    const g = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null
    if (!g) return [0, 1]
    g.drawImage(source, 0, 0, n, n)
    const px = g.getImageData(0, 0, n, n).data
    const lum: number[] = []
    for (let i = 0; i < px.length; i += 4) lum.push((0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]) / 255)
    lum.sort((a, b) => a - b)
    const lo = lum[Math.floor(lum.length * 0.02)]
    const hi = lum[Math.floor(lum.length * 0.98)]
    return hi - lo > 0.1 ? [lo, hi] : [0, 1]
  } catch {
    return [0, 1]
  }
}

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(s)
    gl.deleteShader(s)
    throw new Error(`Shader compile failed: ${log}`)
  }
  return s
}

export type Renderer = {
  /** CSS size of the canvas and the device pixel ratio to render at. */
  resize: (cssWidth: number, cssHeight: number, dpr: number) => void
  setVisible: (visible: boolean) => void
  /** Pointer position normalized to -1…1 on both axes. */
  setPointer: (nx: number, ny: number) => void
  destroy: () => void
}

/** Returns null when WebGL2 is unavailable or the shader fails; the host keeps the poster. */
export function createRenderer(canvas: Canvas, config: RendererConfig, events: RendererEvents = {}): Renderer | null {
  const gl = canvas.getContext('webgl2', {
    antialias: false,
    alpha: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    powerPreference: 'low-power',
    preserveDrawingBuffer: !!config.preserveDrawingBuffer,
  }) as WebGL2RenderingContext | null
  if (!gl) return null

  // Software rasterizers (SwiftShader, llvmpipe: no GPU, headless audits, some VMs) run the
  // shader on the CPU. There we draw one still frame at 1x instead of animating at 30fps.
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
  const rendererName = String(gl.getParameter(debugInfo ? debugInfo.UNMASKED_RENDERER_WEBGL : gl.RENDERER))
  const software = /swiftshader|llvmpipe|softpipe|software|basic render/i.test(rendererName)

  let program: WebGLProgram
  try {
    program = gl.createProgram()!
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT))
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? 'link failed')
  } catch (err) {
    console.warn('[siegel] engraving disabled:', err)
    return null
  }

  gl.useProgram(program)

  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const aPos = gl.getAttribLocation(program, 'aPos')
  gl.enableVertexAttribArray(aPos)
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

  const u = (name: string) => gl.getUniformLocation(program, name)
  const uRes = u('uRes')
  const uImageSize = u('uImageSize')
  const uDpr = u('uDpr')
  const uProgress = u('uProgress')
  const uFrame = u('uFrame')
  const uDrift = u('uDrift')
  const uOffset = u('uOffset')
  const palette = PALETTES[config.palette ?? 'light']
  gl.uniform3fv(u('uInk'), palette.ink)
  gl.uniform3fv(u('uCream'), palette.cream)
  gl.uniform3fv(u('uPaper'), palette.paper)
  gl.uniform1f(u('uInvert'), palette.invert)
  gl.uniform2f(u('uLevels'), 0, 1)
  gl.uniform1i(u('uImage'), 0)
  gl.uniform1f(u('uGrain'), config.noGrain ? 0 : 0.03)
  const crop = config.crop ?? [0, 0, 1, 1]
  gl.uniform4f(u('uCrop'), crop[0], crop[1], crop[2], crop[3])

  const tex = gl.createTexture()
  const still = !!config.still || software

  let textureReady = false
  let destroyed = false
  let introStart = -1
  let progress = config.intro && !still ? 0 : 1
  let introDone = progress >= 1
  let drift = 0
  let last = 0
  let frameCount = 0
  let firstFrame = false
  let needsDraw = true
  let visible = true
  let frame = 0
  const offset = { x: 0, y: 0, tx: 0, ty: 0 }

  const draw = () => {
    gl.uniform1f(uProgress, progress)
    gl.uniform1f(uFrame, Math.floor(frameCount / 2))
    gl.uniform1f(uDrift, drift)
    gl.uniform2f(uOffset, offset.x, offset.y)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    needsDraw = false
    if (!firstFrame) {
      firstFrame = true
      events.onFirstFrame?.()
    }
  }

  const schedule = () => {
    if (destroyed || frame || !visible || !textureReady) return
    if (still && !needsDraw) return
    frame = raf(loop)
  }

  const loop = (now: number) => {
    frame = 0
    if (destroyed) return
    if (still) {
      draw()
      return
    }
    if (now - last < FRAME_MS - 1) {
      schedule()
      return
    }
    const dt = last ? Math.min(100, now - last) : FRAME_MS
    last = now
    frameCount++

    if (!introDone) {
      if (introStart < 0) introStart = now
      progress = easeOut((now - introStart) / INTRO_MS)
      if (progress >= 1) {
        introDone = true
        events.onIntroDone?.()
      }
    }
    drift += dt * 0.000012 // almost imperceptible
    offset.x += (offset.tx - offset.x) * 0.08
    offset.y += (offset.ty - offset.y) * 0.08
    draw()
    schedule()
  }

  loadSource(config.sourceUrl).then((source) => {
    if (destroyed) return
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source)
    gl.generateMipmap(gl.TEXTURE_2D)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.uniform2f(uImageSize, source.width, source.height)
    const [lo, hi] = computeLevels(source)
    gl.uniform2f(gl.getUniformLocation(program, 'uLevels'), lo, hi)
    if ('close' in source) source.close()
    textureReady = true
    if (still) {
      draw()
      events.onIntroDone?.()
    } else {
      if (introDone) events.onIntroDone?.()
      schedule()
    }
  })

  return {
    resize(cssWidth, cssHeight, dpr) {
      const ratio = software ? 1 : Math.min(dpr || 1, 2)
      const w = Math.max(1, Math.round(cssWidth * ratio))
      const h = Math.max(1, Math.round(cssHeight * ratio))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
      gl.viewport(0, 0, w, h)
      gl.uniform2f(uRes, w, h)
      gl.uniform1f(uDpr, ratio)
      needsDraw = true
      schedule()
    },
    setVisible(v) {
      visible = v
      if (v) {
        last = 0
        schedule()
      }
    },
    setPointer(nx, ny) {
      if (still) return
      offset.tx = -nx * MAX_PARALLAX
      offset.ty = ny * MAX_PARALLAX
    },
    destroy() {
      destroyed = true
      if (frame) cancelRaf(frame)
      gl.deleteTexture(tex)
      gl.deleteBuffer(buf)
      gl.deleteProgram(program)
    },
  }
}
