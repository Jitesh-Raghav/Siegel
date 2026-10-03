// Runs the engraving renderer off the main thread with an OffscreenCanvas.

import { createRenderer, type Renderer, type RendererConfig } from './renderer'

export type ToWorker =
  | { type: 'init'; canvas: OffscreenCanvas; config: RendererConfig; width: number; height: number; dpr: number }
  | { type: 'resize'; width: number; height: number; dpr: number }
  | { type: 'visible'; visible: boolean }
  | { type: 'pointer'; x: number; y: number }
  | { type: 'destroy' }

export type FromWorker = { type: 'firstFrame' } | { type: 'introDone' } | { type: 'failed' }

const post = (msg: FromWorker) => (self as unknown as Worker).postMessage(msg)
let renderer: Renderer | null = null

self.onmessage = (e: MessageEvent<ToWorker>) => {
  const msg = e.data
  switch (msg.type) {
    case 'init':
      renderer = createRenderer(msg.canvas, msg.config, {
        onFirstFrame: () => post({ type: 'firstFrame' }),
        onIntroDone: () => post({ type: 'introDone' }),
      })
      if (!renderer) post({ type: 'failed' })
      else renderer.resize(msg.width, msg.height, msg.dpr)
      break
    case 'resize':
      renderer?.resize(msg.width, msg.height, msg.dpr)
      break
    case 'visible':
      renderer?.setVisible(msg.visible)
      break
    case 'pointer':
      renderer?.setPointer(msg.x, msg.y)
      break
    case 'destroy':
      renderer?.destroy()
      renderer = null
      self.close()
      break
  }
}
