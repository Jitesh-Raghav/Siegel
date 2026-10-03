// Host side of the engraving banner: wires DOM observers and input to the renderer,
// which runs in a worker when the browser supports WebGL2 on OffscreenCanvas
// (keeps the main thread free) and on the main thread otherwise.

import { createRenderer, type Crop, type Renderer, type RendererConfig } from './renderer'
import type { FromWorker, ToWorker } from './worker'

export type { Crop }

export type EngravingOptions = RendererConfig & {
  onFirstFrame?: () => void
  onIntroDone?: () => void
  /** WebGL2 unavailable (possibly detected asynchronously in the worker). */
  onFailed?: () => void
}

export type EngravingHandle = { destroy: () => void }

// No WebGL probe on the main thread: creating a GL context there is synchronous and can be
// slow (it was the single biggest long task in audits). If the worker can't get WebGL2
// (Safari 16.4–16.x), it reports "failed" and the poster is shown instead.
function canUseWorker(canvas: HTMLCanvasElement): boolean {
  return (
    typeof Worker !== 'undefined' &&
    typeof OffscreenCanvas !== 'undefined' &&
    typeof canvas.transferControlToOffscreen === 'function'
  )
}

export function createEngraving(canvas: HTMLCanvasElement, opts: EngravingOptions): EngravingHandle {
  const { onFirstFrame, onIntroDone, onFailed, ...config } = opts
  if (config.sourceUrl) config.sourceUrl = new URL(config.sourceUrl, location.href).href

  let target: Pick<Renderer, 'resize' | 'setVisible' | 'setPointer' | 'destroy'> | null = null
  const size = () => ({ width: canvas.clientWidth, height: canvas.clientHeight, dpr: window.devicePixelRatio || 1 })

  // Export needs toDataURL on the main thread, so it never uses the worker.
  if (!config.preserveDrawingBuffer && canUseWorker(canvas)) {
    const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
    const send = (msg: ToWorker, transfer: Transferable[] = []) => worker.postMessage(msg, transfer)
    worker.onmessage = (e: MessageEvent<FromWorker>) => {
      if (e.data.type === 'firstFrame') onFirstFrame?.()
      else if (e.data.type === 'introDone') onIntroDone?.()
      else onFailed?.()
    }
    worker.onerror = () => onFailed?.()
    const offscreen = canvas.transferControlToOffscreen()
    send({ type: 'init', canvas: offscreen, config, ...size() }, [offscreen])
    target = {
      resize: (width, height, dpr) => send({ type: 'resize', width, height, dpr }),
      setVisible: (visible) => send({ type: 'visible', visible }),
      setPointer: (x, y) => send({ type: 'pointer', x, y }),
      destroy: () => {
        send({ type: 'destroy' })
        // Give the worker a moment to release GL resources, then make sure it's gone.
        setTimeout(() => worker.terminate(), 200)
      },
    }
  } else {
    const renderer = createRenderer(canvas, config, { onFirstFrame, onIntroDone })
    if (!renderer) {
      // Defer so callers can finish setting up before handling the failure.
      queueMicrotask(() => onFailed?.())
      return { destroy() {} }
    }
    const s = size()
    renderer.resize(s.width, s.height, s.dpr)
    target = renderer
  }

  const t = target
  const ro = new ResizeObserver(() => {
    const s = size()
    t.resize(s.width, s.height, s.dpr)
  })
  ro.observe(canvas)

  const io = new IntersectionObserver(([entry]) => t.setVisible(entry.isIntersecting && !document.hidden))
  io.observe(canvas)
  const onVisibility = () => t.setVisible(!document.hidden)
  document.addEventListener('visibilitychange', onVisibility)

  let pending = false
  let px = 0
  let py = 0
  const onPointer = (e: PointerEvent) => {
    px = (e.clientX / window.innerWidth) * 2 - 1
    py = (e.clientY / window.innerHeight) * 2 - 1
    if (pending) return
    pending = true
    requestAnimationFrame(() => {
      pending = false
      t.setPointer(px, py)
    })
  }
  if (!config.still) window.addEventListener('pointermove', onPointer, { passive: true })

  return {
    destroy() {
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pointermove', onPointer)
      t.destroy()
    },
  }
}
