'use client'

import { useEffect, useRef, type CSSProperties } from 'react'
import { LogoMark } from '@/components/nav/LogoMark'
import { formatEuro } from '@/lib/format'
import type { Locale } from '@/lib/i18n'
import type { Messages } from '@/messages/en'

const LINES = [
  { amount: 3200, bar: '62%' },
  { amount: 600, bar: '44%' },
  { amount: 200, bar: '30%' },
]
const TOTAL = 4760

const d = (n: number) => ({ '--d': n }) as CSSProperties

/**
 * The hero visual: a small stack of invoices, the front one being validated. A mint scan line
 * glides down it, each line gets a check, then a "validated" pill rises in and the embedded
 * factur-x.xml attachment slides out. CSS keyframes only (transform/opacity); the one bit of JS
 * is a gentle tilt toward the cursor, written to CSS variables only while hovered.
 * Reduced motion shows the finished state.
 */
export function HeroInvoice({ locale, t }: { locale: Locale; t: Messages['heroInvoice'] }) {
  const stageRef = useRef<HTMLDivElement>(null)
  const eur = (n: number) => formatEuro(locale, n)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    if (window.matchMedia('(prefers-reduced-motion: reduce), (hover: none)').matches) return
    let frame = 0
    let x = 0
    let y = 0
    const onMove = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect()
      x = ((e.clientX - r.left) / r.width - 0.5) * 2
      y = ((e.clientY - r.top) / r.height - 0.5) * 2
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        stage.style.setProperty('--tilt-x', `${(-y * 5).toFixed(2)}deg`)
        stage.style.setProperty('--tilt-y', `${(x * 6).toFixed(2)}deg`)
      })
    }
    const onLeave = () => {
      stage.style.setProperty('--tilt-x', '0deg')
      stage.style.setProperty('--tilt-y', '0deg')
    }
    stage.addEventListener('pointermove', onMove)
    stage.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      stage.removeEventListener('pointermove', onMove)
      stage.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <div ref={stageRef} className="hi-stage relative mx-auto w-full max-w-[420px]" role="img" aria-label={t.label}>
      {/* soft mint light behind the card */}
      <div className="hi-glow pointer-events-none absolute -inset-16 -z-10" aria-hidden="true" />

      <div className="hi-tilt" aria-hidden="true">
        <div className="hi-float">
          {/* depth: earlier invoices in the stack */}
          <div className="hi-stack hi-stack-2 absolute inset-0 rounded-[26px] bg-white" />
          <div className="hi-stack hi-stack-1 absolute inset-0 rounded-[26px] bg-white" />

          <div className="hi-card relative overflow-hidden rounded-[26px] bg-white">
            {/* engraved header band */}
            <div className="hi-band flex items-center justify-between px-5 py-3 sm:px-9">
              <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.16em] text-gold-deep uppercase">
                <LogoMark size={14} />
                Siegel
              </span>
              <span className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">EN 16931</span>
            </div>

            <div className="px-5 pt-6 pb-8 sm:px-9 sm:pb-9">
              {/* header */}
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
                <div>
                  <p className="font-serif text-[clamp(22px,6.4vw,26px)] leading-none tracking-[-0.01em]">Muster GmbH</p>
                  <p className="mt-2 text-[12px] text-muted">Musterstraße 1 · Berlin</p>
                </div>
                <div className="text-left min-[340px]:text-right">
                  <p className="font-mono text-[10.5px] tracking-[0.14em] text-muted uppercase">{t.doc}</p>
                  <p className="mt-1.5 font-mono text-[12.5px] text-ink">INV-2026-0142</p>
                </div>
              </div>

              <div className="mt-6 h-px bg-hairline" />

              {/* line items */}
              <ul className="mt-6 grid grid-cols-1 gap-5">
                {LINES.map((l, i) => (
                  <li key={i} className="flex items-center gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] text-ink sm:text-[13.5px]">{t.items[i]}</p>
                      <span className="mt-2 block h-1.5 rounded-full bg-paper-2" style={{ width: l.bar }} />
                    </div>
                    <span className="tabular shrink-0 text-[13px] text-muted sm:text-[13.5px]">{eur(l.amount)}</span>
                    <span className="relative grid size-5 shrink-0 place-items-center">
                      <span className="hi-ring absolute inset-0 rounded-full border border-[#3FA77A]" style={d(i)} />
                      <span className="hi-check grid size-5 place-items-center rounded-full bg-[#3FA77A] text-white" style={d(i)}>
                        <svg width="10" height="10" viewBox="0 0 10 10">
                          <path d="M1.8 5.2l2 2 4.4-4.6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                        </svg>
                      </span>
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-7 h-px bg-hairline" />

              {/* total */}
              <div className="mt-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
                <p className="text-[13px] text-muted">{t.total}</p>
                <p className="tabular font-serif text-[clamp(32px,9.5vw,40px)] leading-none tracking-[-0.02em]">{eur(TOTAL)}</p>
              </div>
            </div>

            {/* scan line + glass sheen */}
            <span className="hi-scan pointer-events-none absolute inset-x-0 top-0" />
            <span className="hi-sheen pointer-events-none absolute inset-0" />
          </div>

          {/* embedded XML attachment, slides out once validated */}
          <div className="hi-attach absolute top-[70%] right-3 inline-flex items-center gap-2 rounded-xl border border-hairline bg-white py-2 pr-3 pl-2.5 font-mono text-[11px] text-ink sm:-right-12">
            <svg width="14" height="14" viewBox="0 0 24 24" className="text-gold-deep">
              <path
                d="M21 11.5l-8.6 8.6a5.5 5.5 0 0 1-7.8-7.8l8.6-8.6a3.7 3.7 0 0 1 5.2 5.2l-8.6 8.6a1.8 1.8 0 0 1-2.6-2.6l7.9-7.9"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            factur-x.xml
          </div>

          {/* validated pill */}
          <div className="hi-pill absolute -bottom-5 left-1/2 inline-flex items-center gap-2 rounded-full bg-ink py-2 pr-4 pl-2 font-mono text-[11.5px] tracking-[0.04em] whitespace-nowrap text-on-dark">
            <span className="grid size-6 place-items-center rounded-full bg-[#3FA77A] text-ink">
              <svg width="11" height="11" viewBox="0 0 10 10">
                <path d="M1.8 5.2l2 2 4.4-4.6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            {t.validated}
          </div>
        </div>
      </div>

      {/* soft ground shadow */}
      <div className="hi-ground pointer-events-none mx-auto mt-12 h-6 w-[70%] rounded-[50%]" aria-hidden="true" />
    </div>
  )
}
