'use client'

import { useEffect, useRef } from 'react'
import { createEngraving } from '@/components/hero/engraving'

declare global {
  interface Window {
    __heroReady?: boolean
  }
}

export function HeroExport() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const handle = createEngraving(canvas, {
      still: true,
      preserveDrawingBuffer: true,
      noGrain: true,
      sourceUrl: process.env.NEXT_PUBLIC_HERO_SOURCE === '1' ? '/hero-source.jpg' : null,
      onIntroDone: () => {
        window.__heroReady = true
      },
      onFailed: () => console.error('[hero-export] WebGL2 unavailable'),
    })
    return () => handle.destroy()
  }, [])
  return (
    <main style={{ padding: 0 }}>
      <canvas id="hero-export" ref={ref} style={{ display: 'block', width: 1200, height: 480 }} />
    </main>
  )
}
