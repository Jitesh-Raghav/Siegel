'use client'

import { useEffect, useRef } from 'react'

// Ordered (Bayer 8×8) dither of a soft radial field, drawn once on idle into a tiny canvas and
// upscaled with crisp pixels. Two inks: mint for the body, fir for the densest core.

const BAYER8 = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22, 3, 35,
  11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
]

const W = 240
const H = 135

export function DitherField({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const draw = () => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const img = ctx.createImageData(W, H)
      const mint = [63, 167, 122]
      const fir = [23, 56, 45]
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          // elliptical falloff from the centre, with a gentle diagonal wave for texture
          const dx = (x - W / 2) / (W * 0.5)
          const dy = (y - H / 2) / (H * 0.55)
          const r = Math.sqrt(dx * dx + dy * dy)
          let v = Math.max(0, 1 - r) ** 1.6
          v *= 0.85 + 0.15 * Math.sin((x + y) * 0.09) * Math.cos((x - y) * 0.05)
          const threshold = (BAYER8[(y % 8) * 8 + (x % 8)] + 0.5) / 64
          const i = (y * W + x) * 4
          if (v > threshold) {
            const c = v > 0.72 && ((x + y) & 1) === 0 ? fir : mint
            img.data[i] = c[0]
            img.data[i + 1] = c[1]
            img.data[i + 2] = c[2]
            img.data[i + 3] = 255
          }
        }
      }
      ctx.putImageData(img, 0, 0)
      canvas.dataset.ready = '1'
    }
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(draw, { timeout: 3000 })
      return () => window.cancelIdleCallback(id)
    }
    const id = window.setTimeout(draw, 300)
    return () => window.clearTimeout(id)
  }, [])

  return <canvas ref={ref} width={W} height={H} className={`dither-field ${className}`} aria-hidden="true" />
}
