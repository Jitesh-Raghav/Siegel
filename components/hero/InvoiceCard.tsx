'use client'

import { useEffect, useRef, useState } from 'react'
import { formatEuro } from '@/lib/format'
import type { Locale } from '@/lib/i18n'
import { ENGRAVED_EVENT, prefersReducedMotion, segment } from '@/lib/motion'
import type { Messages } from '@/messages/en'
import { ValidationDial } from './ValidationDial'

// Timeline (ms after the card starts rising).
const T = {
  amount: [250, 1300],
  dial: [450, 1700],
  stats: [2150, 900],
  statStagger: 90,
  end: 3600,
} as const

/** Wait this long for the engraving before starting anyway (WebGL may be unavailable). */
const ENGRAVE_TIMEOUT = 2200

export function InvoiceCard({ locale, t }: { locale: Locale; t: Messages['card'] }) {
  const ref = useRef<HTMLDivElement>(null)
  // Infinity = final state. That's what the server renders and what no-JS visitors see.
  const [elapsed, setElapsed] = useState(Number.POSITIVE_INFINITY)
  // idle: hidden under html.js until it rises; running: animating; done: final values.
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Reduced motion: CSS keeps the idle card visible, and idle already shows final values.
    if (prefersReducedMotion()) return

    // The card stays hidden (CSS, under html.js) until it is both in view and engraved.
    let engraved = false
    let inView = false
    let raf = 0
    let started = false

    const start = () => {
      if (started || !engraved || !inView) return
      started = true
      const t0 = performance.now()
      const tick = (now: number) => {
        const e = now - t0
        setElapsed(e)
        if (e < T.end) {
          raf = requestAnimationFrame(tick)
        } else {
          setElapsed(Number.POSITIVE_INFINITY)
          setPhase('done')
        }
      }
      setElapsed(0)
      setPhase('running')
      raf = requestAnimationFrame(tick)
    }

    const onEngraved = () => {
      engraved = true
      start()
    }
    window.addEventListener(ENGRAVED_EVENT, onEngraved)
    const timeout = window.setTimeout(onEngraved, ENGRAVE_TIMEOUT)

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        inView = true
        io.disconnect()
        start()
      },
      { threshold: 0.12 },
    )
    io.observe(el)

    return () => {
      window.removeEventListener(ENGRAVED_EVENT, onEngraved)
      window.clearTimeout(timeout)
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [])

  const amountP = segment(elapsed, T.amount[0], T.amount[1])
  const dialP = segment(elapsed, T.dial[0], T.dial[1])
  const stat = (i: number) => segment(elapsed, T.stats[0] + i * T.statStagger, T.stats[1])
  const validated = dialP >= 1

  const stats = [
    { value: `${Math.round(100 * stat(0))}%`, label: t.stats.schema },
    { value: `${Math.round(100 * stat(1))}%`, label: t.stats.rules },
    { value: `${Math.round(2 * stat(2))}`, label: t.stats.vat },
    { value: `${(1.4 * stat(3)).toFixed(1)}s`, label: t.stats.processing },
    { value: '✓', label: t.stats.archived, opacity: stat(4) },
  ]

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${t.profile} — ${t.files}`)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    } catch {
      // Clipboard can be blocked; nothing to do.
    }
  }

  return (
    <div
      ref={ref}
      role="group"
      aria-label={t.region}
      data-phase={phase}
      className="invoice-card mx-auto w-full max-w-[760px] rounded-[2px] border border-hairline bg-white text-left"
    >
      <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-6 p-5 sm:p-7 lg:grid-cols-[1fr_auto_1fr] lg:gap-x-6">
        {/* Left: invoice identity and amount */}
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-mono text-[11px] tracking-[0.08em] uppercase">
            <span
              className="size-[7px] rounded-full transition-colors duration-500"
              style={{ background: validated ? 'var(--verified)' : '#C9C7C0' }}
              aria-hidden="true"
            />
            <span style={{ color: validated ? 'var(--verified)' : 'var(--muted)' }} className="transition-colors duration-500">
              {t.validated}
            </span>
          </p>
          <p className="mt-4 font-mono text-[13px] text-ink">{t.number}</p>
          <p className="mt-0.5 text-[13px] text-muted">{t.seller}</p>
          <p className="tabular mt-4 font-serif text-[30px] leading-none tracking-[-0.02em] whitespace-nowrap sm:text-[38px]">
            {formatEuro(locale, t.amount * amountP)}
          </p>
          <p className="mt-1.5 text-[12px] text-muted">{t.vatNote}</p>
        </div>

        {/* Center: validation dial */}
        <div className="flex items-start justify-end lg:items-center lg:justify-center">
          <ValidationDial progress={dialP} percent={Math.round(dialP * 100)} label={t.rulesChecked} />
        </div>

        {/* Right: profile and delivery */}
        <div className="col-span-2 grid grid-cols-1 gap-x-4 gap-y-4 border-t sm:grid-cols-2 border-hairline pt-5 lg:col-span-1 lg:block lg:border-0 lg:pt-0 lg:text-right">
          <div>
            <p className="mono-label text-[10.5px] text-muted">{t.profileLabel}</p>
            <p className="mt-1.5 text-[14px] font-medium">{t.profile}</p>
            <p className="mt-0.5 inline-flex items-center gap-1.5 font-mono text-[12px] text-muted lg:justify-end">
              {t.files}
              <button
                type="button"
                onClick={copy}
                className="relative -m-1.5 grid size-7 place-items-center rounded-[2px] text-muted transition-colors hover:text-ink"
                aria-label={copied ? t.copied : t.copy}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                  {copied ? (
                    <path d="M2 6.5l2.5 2.5L10 3.5" fill="none" stroke="var(--verified)" strokeWidth="1.3" />
                  ) : (
                    <>
                      <rect x="3.5" y="3.5" width="7" height="7" rx="0.5" fill="none" stroke="currentColor" />
                      <path d="M8.5 1.5h-6.5a.5.5 0 0 0-.5.5v6.5" fill="none" stroke="currentColor" />
                    </>
                  )}
                </svg>
              </button>
            </p>
          </div>
          <div className="lg:mt-4">
            <p className="text-[12px] text-muted">{t.deliveredTo}</p>
            <p className="mt-0.5 font-mono text-[12px] break-all">{t.deliveredEmail}</p>
            <p className="mt-3 text-[11px] text-muted">{t.example}</p>
          </div>
        </div>
      </div>

      {/* Bottom: five checks */}
      <dl className="grid grid-cols-3 gap-y-4 border-t border-hairline px-5 py-4 sm:grid-cols-5 sm:px-7 sm:py-5">
        {stats.map((s) => (
          <div key={s.label} className="min-w-0">
            <dt className="sr-only-ledger">{s.label}</dt>
            <dd className="tabular font-mono text-[17px] leading-none sm:text-[20px]" style={{ opacity: s.opacity }}>
              {s.value}
            </dd>
            <dd aria-hidden="true" className="mt-2 text-[11px] leading-tight text-muted">
              {s.label}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
