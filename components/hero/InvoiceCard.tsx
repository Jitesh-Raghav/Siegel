'use client'

import { useEffect, useRef, useState } from 'react'
import { formatEuro } from '@/lib/format'
import type { Locale } from '@/lib/i18n'
import { ENGRAVED_EVENT, VALIDATED_EVENT, prefersReducedMotion, segment } from '@/lib/motion'
import type { Messages } from '@/messages/en'
import { SealStamp } from '@/components/ui/SealStamp'
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

// Final values, rendered on the server and shown without JS. Frames write into the DOM directly.
const STAT_FORMAT = [
  (p: number) => `${Math.round(100 * p)}%`,
  (p: number) => `${Math.round(100 * p)}%`,
  (p: number) => `${Math.round(2 * p)}`,
  (p: number) => `${(1.4 * p).toFixed(1)}s`,
  () => '✓',
]

export function InvoiceCard({ locale, t }: { locale: Locale; t: Messages['card'] }) {
  const ref = useRef<HTMLDivElement>(null)
  const amountRef = useRef<HTMLSpanElement>(null)
  const percentRef = useRef<HTMLSpanElement>(null)
  const statRefs = useRef<(HTMLElement | null)[]>([])
  // idle: hidden under html.js until it rises; running: animating; done: final values.
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle')
  // Server and no-JS: validated. Flips to false when the animation starts, back once the dial completes.
  const [validated, setValidated] = useState(true)
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
    let markedValid = false

    const paint = (e: number) => {
      const amountP = segment(e, T.amount[0], T.amount[1])
      const dialP = segment(e, T.dial[0], T.dial[1])
      if (amountRef.current) amountRef.current.textContent = formatEuro(locale, t.amount * amountP)
      if (percentRef.current) percentRef.current.textContent = String(Math.round(dialP * 100))
      el.style.setProperty('--dial', dialP.toFixed(4))
      statRefs.current.forEach((node, i) => {
        if (!node) return
        const p = segment(e, T.stats[0] + i * T.statStagger, T.stats[1])
        if (i === 4) node.style.opacity = String(p)
        else node.textContent = STAT_FORMAT[i](p)
      })
      if (dialP >= 1 && !markedValid) {
        markedValid = true
        setValidated(true)
        window.dispatchEvent(new Event(VALIDATED_EVENT))
      }
    }

    const start = () => {
      if (started || !engraved || !inView) return
      started = true
      paint(0)
      setValidated(false)
      setPhase('running')
      const t0 = performance.now()
      const tick = (now: number) => {
        const e = now - t0
        paint(e)
        if (e < T.end) {
          raf = requestAnimationFrame(tick)
        } else {
          paint(Number.POSITIVE_INFINITY)
          setPhase('done')
        }
      }
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
  }, [locale, t.amount])

  const stats = [
    { value: STAT_FORMAT[0](1), label: t.stats.schema },
    { value: STAT_FORMAT[1](1), label: t.stats.rules },
    { value: STAT_FORMAT[2](1), label: t.stats.vat },
    { value: STAT_FORMAT[3](1), label: t.stats.processing },
    { value: STAT_FORMAT[4](1), label: t.stats.archived },
  ]

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${t.profile} · ${t.files}`)
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
      data-stamped={validated ? 'true' : 'false'}
      className="invoice-card glass spotlight relative mx-auto w-full max-w-[800px] rounded-[22px] text-left"
    >
      {/* Gold seal straddling the top edge, stamped once validation completes */}
      <SealStamp className="absolute -top-12 left-1/2 z-10 size-[76px] -translate-x-1/2 sm:-top-14 sm:size-[96px] lg:left-[68%]" />

      <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-6 p-5 sm:p-8 lg:grid-cols-[1fr_auto_1fr] lg:gap-x-8">
        {/* Left: invoice identity and amount */}
        <div className="min-w-0">
          <p
            className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 font-mono text-[10.5px] tracking-[0.12em] uppercase transition-colors duration-700"
            style={{
              color: validated ? 'var(--verified)' : 'var(--muted)',
              borderColor: validated ? 'rgb(46 125 79 / 0.3)' : 'var(--hairline)',
              background: validated ? 'rgb(46 125 79 / 0.07)' : 'transparent',
            }}
          >
            <span className="relative flex size-[7px]" aria-hidden="true">
              {validated && phase === 'running' && (
                <span className="absolute inset-0 animate-ping rounded-full bg-verified opacity-60" />
              )}
              <span
                className="relative size-[7px] rounded-full transition-colors duration-700"
                style={{ background: validated ? 'var(--verified)' : '#C8D1CB' }}
              />
            </span>
            {t.validated}
          </p>
          <p className="mt-5 font-mono text-[12.5px] tracking-[0.02em] text-ink">{t.number}</p>
          <p className="mt-0.5 text-[13px] text-muted">{t.seller}</p>
          <p className="tabular mt-5 font-serif text-[40px] leading-none tracking-[-0.02em] whitespace-nowrap sm:text-[54px]">
            <span ref={amountRef}>{formatEuro(locale, t.amount)}</span>
          </p>
          <p className="mt-2 text-[12px] text-muted">{t.vatNote}</p>
        </div>

        {/* Center: validation dial */}
        <div className="flex items-start justify-end lg:items-center lg:justify-center">
          <ValidationDial label={t.rulesChecked} percentRef={percentRef} />
        </div>

        {/* Right: profile and delivery */}
        <div className="col-span-2 grid grid-cols-1 gap-x-4 gap-y-4 border-t border-hairline pt-5 sm:grid-cols-2 lg:col-span-1 lg:block lg:border-0 lg:pt-1 lg:text-right">
          <div>
            <p className="mono-label text-[10px] text-muted">{t.profileLabel}</p>
            <p className="mt-2 font-serif text-[22px] leading-none">{t.profile}</p>
            <p className="mt-2 inline-flex items-center gap-1.5 font-mono text-[11.5px] text-muted lg:justify-end">
              {t.files}
              <button
                type="button"
                onClick={copy}
                className="relative -m-1.5 grid size-7 place-items-center rounded-md text-muted transition-colors hover:text-ink"
                aria-label={copied ? t.copied : t.copy}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                  {copied ? (
                    <path d="M2 6.5l2.5 2.5L10 3.5" fill="none" stroke="var(--verified)" strokeWidth="1.3" />
                  ) : (
                    <>
                      <rect x="3.5" y="3.5" width="7" height="7" rx="1" fill="none" stroke="currentColor" />
                      <path d="M8.5 1.5h-6.5a.5.5 0 0 0-.5.5v6.5" fill="none" stroke="currentColor" />
                    </>
                  )}
                </svg>
              </button>
            </p>
          </div>
          <div className="lg:mt-6">
            <p className="text-[12px] text-muted">{t.deliveredTo}</p>
            <p className="mt-0.5 font-mono text-[12px] break-all">{t.deliveredEmail}</p>
            <p className="mt-3 inline-block rounded-full bg-paper-2 px-2 py-0.5 text-[10.5px] text-muted">{t.example}</p>
          </div>
        </div>
      </div>

      {/* Bottom: five checks */}
      <dl className="grid grid-cols-3 gap-y-5 border-t border-hairline px-5 py-5 sm:grid-cols-5 sm:px-8">
        {stats.map((s, i) => (
          <div key={s.label} className={`min-w-0 ${i > 0 ? 'sm:border-l sm:border-hairline sm:pl-5' : ''}`}>
            <dt className="sr-only-ledger">{s.label}</dt>
            <dd
              ref={(node) => {
                statRefs.current[i] = node
              }}
              className="tabular font-serif text-[26px] leading-none sm:text-[30px]"
            >
              {s.value}
            </dd>
            <dd aria-hidden="true" className="mt-1.5 pr-2 font-mono text-[9.5px] leading-tight tracking-[0.04em] text-muted uppercase hyphens-auto [overflow-wrap:anywhere] sm:text-[10px] sm:tracking-[0.06em]">
              {s.label}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
