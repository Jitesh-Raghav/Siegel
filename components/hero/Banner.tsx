'use client'

import { useEffect, useRef, useState } from 'react'
import { ENGRAVED_EVENT, prefersReducedMotion } from '@/lib/motion'
import type { Crop } from './engraving/renderer'

const HAS_POSTER = process.env.NEXT_PUBLIC_HERO_POSTER === '1'
const SOURCE_URL = process.env.NEXT_PUBLIC_HERO_SOURCE === '1' ? '/hero-source.jpg' : null

/** If WebGL hasn't painted by then, show the poster and skip the intro. */
const SLOW_MS = 2500

type GlState = 'pending' | 'ready' | 'failed'

const VARIANTS = {
  hero: {
    height: 'h-[240px] sm:h-[clamp(320px,38vw,480px)]',
    crop: [0, 0, 1, 1] as Crop,
    posterPosition: '50% 50%',
    intro: true,
  },
  strip: {
    height: 'h-[150px] sm:h-[200px]',
    crop: [0, 0.5, 1, 0.5] as Crop,
    posterPosition: '50% 30%',
    intro: false,
  },
} as const

export function Banner({ alt, variant }: { alt: string; variant: keyof typeof VARIANTS }) {
  const v = VARIANTS[variant]
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gl, setGl] = useState<GlState>('pending')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let destroyed = false
    let slow = false
    let handle: { destroy: () => void } | null = null
    const isHero = variant === 'hero'
    const announce = () => {
      if (isHero) window.dispatchEvent(new Event(ENGRAVED_EVENT))
    }

    let slowTimer = 0

    // Start after the page has loaded and the main thread is idle, so WebGL never competes
    // with first paint or hydration.
    const whenIdle = () =>
      new Promise<void>((resolve) => {
        const idle = () => {
          if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(() => resolve(), { timeout: 600 })
          else setTimeout(resolve, 50) // Safari has no requestIdleCallback
        }
        if (document.readyState === 'complete') idle()
        else window.addEventListener('load', idle, { once: true })
      })

    whenIdle()
      .then(() => {
        // Measured from init, not mount: a slow page load alone shouldn't trigger the poster.
        slowTimer = window.setTimeout(() => {
          slow = true
          setGl((s) => (s === 'pending' ? 'failed' : s))
        }, SLOW_MS)
        return import('./engraving')
      })
      .then(({ createEngraving }) => {
        if (destroyed) return
        const reduced = prefersReducedMotion()
        const fail = () => {
          window.clearTimeout(slowTimer)
          setGl('failed')
          announce()
        }
        handle = createEngraving(canvas, {
          crop: v.crop,
          intro: v.intro && !reduced && !slow,
          still: reduced,
          sourceUrl: SOURCE_URL,
          onFirstFrame: () => {
            window.clearTimeout(slowTimer)
            setGl('ready')
          },
          onIntroDone: announce,
          onFailed: fail,
        })
      })
      .catch(() => {
        setGl('failed')
        announce()
      })

    return () => {
      destroyed = true
      window.clearTimeout(slowTimer)
      handle?.destroy()
    }
  }, [variant, v.crop, v.intro])

  return (
    <div className="margin-hairlines">
      <div
        role="img"
        aria-label={alt}
        data-gl={gl}
        className={`banner relative overflow-hidden bg-engrave-paper ${v.height}`}
      >
        <div className="banner-poster absolute inset-0" aria-hidden="true">
          {HAS_POSTER ? (
            <>
              {/* Only fetched without JS, or when WebGL fails: visitors with a working canvas never download it. */}
              <noscript>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/hero-engraved.png" alt="" className="size-full object-cover" style={{ objectPosition: v.posterPosition }} />
              </noscript>
              {gl === 'failed' && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src="/hero-engraved.png"
                  alt=""
                  decoding="async"
                  className="size-full object-cover"
                  style={{ objectPosition: v.posterPosition }}
                />
              )}
            </>
          ) : (
            <div className="engrave-fallback size-full" />
          )}
        </div>
        <canvas ref={canvasRef} className="banner-canvas absolute inset-0 size-full" aria-hidden="true" />
      </div>
      <div className="banner-ticks" aria-hidden="true" />
    </div>
  )
}
