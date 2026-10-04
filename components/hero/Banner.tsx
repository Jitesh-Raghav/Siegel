'use client'

import { useEffect, useRef, useState } from 'react'
import { Microprint } from '@/components/ui/Microprint'
import { ENGRAVED_EVENT, prefersReducedMotion } from '@/lib/motion'
import type { Crop } from './engraving/renderer'

const SOURCE_URL = process.env.NEXT_PUBLIC_HERO_SOURCE === '1' ? '/hero-source.jpg' : null

/** If WebGL hasn't painted by then, show the poster and skip the intro. */
const SLOW_MS = 2500

type GlState = 'pending' | 'ready' | 'failed'

const VARIANTS = {
  hero: {
    height: 'h-[260px] sm:h-[clamp(340px,40vw,520px)]',
    crop: [0, 0, 1, 0.84] as Crop,
    palette: 'light' as const,
    poster: process.env.NEXT_PUBLIC_HERO_POSTER === '1' ? '/hero-engraved.webp' : null,
    posterPosition: '50% 62%',
    intro: true,
  },
  strip: {
    height: 'h-[170px] sm:h-[240px]',
    crop: [0, 0.42, 1, 0.58] as Crop,
    palette: 'dark' as const,
    poster: process.env.NEXT_PUBLIC_HERO_POSTER_DARK === '1' ? '/hero-engraved-dark.webp' : null,
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
          palette: v.palette,
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
  }, [variant, v.crop, v.intro, v.palette])

  const poster = v.poster && (
    // eslint-disable-next-line @next/next/no-img-element -- static poster; next/image adds nothing here
    <img src={v.poster} alt="" decoding="async" className="size-full object-cover" style={{ objectPosition: v.posterPosition }} />
  )

  return (
    <div className="margin-hairlines">
      <div className="note-frame">
        <div
          role="img"
          aria-label={alt}
          data-gl={gl}
          className={`banner relative overflow-hidden rounded-[13px] ${
            v.palette === 'dark' ? 'bg-midnight' : 'bg-engrave-paper'
          } ${v.height}`}
        >
          <div className="banner-poster absolute inset-0" aria-hidden="true">
            {poster ? (
              <>
                {/* Only fetched without JS, or when WebGL fails: visitors with a working canvas never download it. */}
                <noscript>{poster}</noscript>
                {gl === 'failed' && poster}
              </>
            ) : (
              <div className="engrave-fallback size-full" />
            )}
          </div>
          <canvas ref={canvasRef} className="banner-canvas absolute inset-0 size-full" aria-hidden="true" />
          {/* Depth: soft vignette and inner edge */}
          <div
            className="pointer-events-none absolute inset-0 rounded-[13px]"
            style={{
              boxShadow:
                v.palette === 'dark'
                  ? 'inset 0 0 0 1px rgb(255 255 255 / 0.06), inset 0 0 80px rgb(11 31 25 / 0.7)'
                  : 'inset 0 0 0 1px rgb(23 56 45 / 0.08), inset 0 0 90px rgb(248 243 230 / 0.55)',
            }}
            aria-hidden="true"
          />
          <CornerMarks />
        </div>
        <Microprint className="mt-[7px] px-4" />
      </div>
    </div>
  )
}

/** Gold corner brackets, like the registration marks on a banknote. */
function CornerMarks() {
  const corners = [
    'top-3 left-3',
    'top-3 right-3 rotate-90',
    'bottom-3 right-3 rotate-180',
    'bottom-3 left-3 -rotate-90',
  ]
  return (
    <>
      {corners.map((c) => (
        <svg key={c} className={`pointer-events-none absolute size-5 ${c}`} viewBox="0 0 20 20" aria-hidden="true">
          <path d="M1 12V1h11" fill="none" stroke="#3FA77A" strokeWidth="1.2" />
          <path d="M4.5 8V4.5H8" fill="none" stroke="#3FA77A" strokeWidth="0.8" strokeOpacity="0.7" />
        </svg>
      ))}
    </>
  )
}
