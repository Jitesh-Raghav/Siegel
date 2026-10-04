'use client'

import { useEffect, useRef } from 'react'

/**
 * Banknote guilloché rosette: interwoven sinusoidal rings drawn on a canvas, one ring per idle
 * slice so no single task is long. Purely decorative: it stays out of the HTML and off the
 * critical path.
 */
const FAMILIES = [
  { k: 18, amp: 0.045, phase: 0 },
  { k: 24, amp: 0.03, phase: Math.PI / 24 },
]
const STEPS = 420

function drawRing(ctx: CanvasRenderingContext2D, size: number, rings: number, family: number, i: number) {
  const c = size / 2
  const f = FAMILIES[family]
  const base = c * (0.42 + (i / rings) * 0.52)
  ctx.beginPath()
  for (let s = 0; s <= STEPS; s++) {
    const t = (s / STEPS) * Math.PI * 2
    const r = base + c * f.amp * Math.sin(f.k * t + i * 0.55 + f.phase) + c * 0.012 * Math.sin(3 * t + i)
    const x = c + Math.cos(t) * r
    const y = c + Math.sin(t) * r
    if (s) ctx.lineTo(x, y)
    else ctx.moveTo(x, y)
  }
  ctx.closePath()
  ctx.stroke()
}

const idle = (cb: () => void) =>
  typeof window.requestIdleCallback === 'function'
    ? window.requestIdleCallback(cb, { timeout: 4000 })
    : window.setTimeout(cb, 120)
const cancelIdle = (id: number) =>
  typeof window.cancelIdleCallback === 'function' ? window.cancelIdleCallback(id) : window.clearTimeout(id)

export function Guilloche({
  rings = 9,
  color = '#17382D',
  strokeWidth = 0.7,
  className = '',
}: {
  rings?: number
  color?: string
  strokeWidth?: number
  className?: string
}) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    let id = 0
    let ctx: CanvasRenderingContext2D | null = null
    let size = 0
    let n = 0
    const total = FAMILIES.length * rings

    const step = () => {
      if (!ctx) return
      drawRing(ctx, size, rings, Math.floor(n / rings), n % rings)
      n++
      if (n < total) id = idle(step)
    }

    // Size comes from a ResizeObserver entry, so we never force a synchronous layout.
    const ro = new ResizeObserver(([entry]) => {
      const next = Math.round(entry.contentRect.width)
      if (!next || next === size) return
      size = next
      // 1x is plenty for a faint ornament and keeps raster cost low.
      canvas.width = canvas.height = size
      ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.strokeStyle = color
      ctx.lineWidth = strokeWidth
      cancelIdle(id)
      n = 0
      id = idle(step)
    })
    ro.observe(canvas)
    return () => {
      ro.disconnect()
      cancelIdle(id)
    }
  }, [rings, strokeWidth, color])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
