'use client'

import { useEffect, useRef } from 'react'
import { createEngraving } from '@/components/hero/engraving'
import type { Crop } from '@/components/hero/engraving/renderer'

declare global {
  interface Window {
    __heroReady?: boolean
  }
}

// Must match the variants in components/hero/Banner.tsx.
const VARIANTS = {
  light: { crop: [0, 0, 1, 0.84] as Crop, width: 1200, height: 480 },
  dark: { crop: [0, 0.42, 1, 0.58] as Crop, width: 1200, height: 240 },
}

export function HeroExport({ variant }: { variant: keyof typeof VARIANTS }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const v = VARIANTS[variant]

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const handle = createEngraving(canvas, {
      still: true,
      preserveDrawingBuffer: true,
      noGrain: true,
      crop: v.crop,
      palette: variant,
      sourceUrl: process.env.NEXT_PUBLIC_HERO_SOURCE === '1' ? '/hero-source.jpg' : null,
      onIntroDone: () => {
        window.__heroReady = true
      },
      onFailed: () => console.error('[hero-export] WebGL2 unavailable'),
    })
    return () => handle.destroy()
  }, [v.crop, variant])

  return (
    <main style={{ padding: 0 }}>
      <canvas id="hero-export" ref={ref} style={{ display: 'block', width: v.width, height: v.height }} />
    </main>
  )
}
