'use client'

import { useRef, useState } from 'react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { DitherField } from '@/components/ui/DitherField'
import { reveal } from '@/components/ui/reveal'
import { track } from '@/lib/analytics'
import type { Locale } from '@/lib/i18n'
import type { Messages } from '@/messages/en'

/**
 * The 36-second explainer (rendered from video/explainer.html by scripts/render-video.mjs).
 * A lazy poster image until the visitor presses play: preload="none" keeps the 2 MB video off page load.
 * No autoplay: sound starts only when the visitor presses play.
 */
export function Film({ locale, t }: { locale: Locale; t: Messages['film'] }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const src = `/video/siegel-explainer-${locale}`

  const play = () => {
    const v = videoRef.current
    if (!v) return
    setPlaying(true)
    v.play().catch(() => setPlaying(false))
    track('film_play', { locale })
  }

  return (
    <section id="film" data-section="film" className="section defer-render relative isolate overflow-x-clip" aria-labelledby="film-title">
      <div className="container-ledger">
        <SectionHeader num={1} id="film-title" eyebrow={t.eyebrow} title={t.h2} accent={t.h2Accent} align="center" />

        <div className="relative mx-auto mt-14 max-w-[1040px]">
          {/* Dithered backdrop: wider than the film, fading out at the edges */}
          <div className="dither-wrap pointer-events-none absolute -inset-x-[12%] -top-[4%] -bottom-[18%] -z-10" aria-hidden="true">
            <DitherField className="size-full" />
          </div>
        {/* Product-demo framing: a thin player chrome bar above the film */}
        <div
          className="relative rounded-[22px] bg-white p-1.5 shadow-[0_0_0_1px_var(--hairline-strong),var(--shadow-lift)]"
          {...reveal(3)}
        >
          <div className="flex h-9 items-center gap-3 px-3" aria-hidden="true">
            <span className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-hairline-strong" />
              <span className="size-2.5 rounded-full bg-hairline-strong" />
              <span className="size-2.5 rounded-full bg-gold/70" />
            </span>
            <span className="flex-1 truncate text-center font-mono text-[11px] tracking-[0.06em] text-muted">
              siegel-explainer-{locale}.mp4
            </span>
            <span className="font-mono text-[11px] tracking-[0.06em] text-muted">1080p · 0:36</span>
          </div>
          <div className="relative aspect-video overflow-hidden rounded-[16px] bg-paper-2">
            <video
              ref={videoRef}
              className="absolute inset-0 size-full object-cover"
              preload="none"
              playsInline
              controls={playing}
              aria-label={t.label}
              onEnded={() => track('film_complete', { locale })}
            >
              <source src={`${src}.mp4`} type="video/mp4" />
            </video>

            {!playing && (
              // Lazy <img> rather than the poster attribute, which would load with the page.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`${src}.jpg`}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 size-full object-cover"
              />
            )}
            {!playing && (
              <button
                type="button"
                onClick={play}
                className="group absolute inset-0 grid place-items-center bg-[radial-gradient(closest-side,rgb(15_42_34/0.18),transparent)] transition-colors hover:bg-[radial-gradient(closest-side,rgb(15_42_34/0.28),transparent)]"
                aria-label={t.play}
              >
                <span className="relative grid size-24 place-items-center sm:size-28">
                  {/* soft pulsing ring */}
                  <span className="film-ring absolute inset-0 rounded-full" aria-hidden="true" />
                  <span className="relative grid size-full place-items-center rounded-full bg-[image:var(--foil-light)] shadow-[0_18px_40px_-14px_rgb(31_122_85/0.8)] transition-transform duration-500 ease-ledger group-hover:scale-105">
                    <span className="grid size-[82%] place-items-center rounded-full border border-[#2b4f1d]/40">
                      <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true" className="translate-x-[2px] text-ink">
                        <path d="M7 4.5v15l12-7.5z" fill="currentColor" />
                      </svg>
                    </span>
                  </span>
                </span>
              </button>
            )}
          </div>
        </div>
        </div>
      </div>
    </section>
  )
}
