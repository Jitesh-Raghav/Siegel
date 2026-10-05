'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { VALIDATED_EVENT } from '@/lib/motion'

/** Fallback: reveal this long after the callouts come into view, even if the card never reports. */
const FALLBACK_MS = 4000

// Anchor points on the engraving and chip positions, in % of the banner. Chosen to sit on the
// buildings and water at the sides, clear of the invoice card in the middle.
const LAYOUT = [
  { anchor: [8, 26], chip: { left: '1.6%', top: '5%' }, line: [8, 26, 6, 11] },
  { anchor: [9.5, 66], chip: { left: '1.6%', top: '81%' }, line: [9.5, 66, 7, 81] },
  { anchor: [90, 60], chip: { right: '1.6%', top: '81%' }, line: [90, 60, 93, 81] },
] as const

/**
 * Technical-drawing style annotations pinned to the hero engraving: a ring on the photo, a gold
 * leader line, and a small glass chip. Decorative example data, so hidden from assistive tech.
 */
export function Callouts({ items }: { items: string[] }) {
  // idle: hidden under html.js until the card validates. Without JS it's simply visible.
  const [state, setState] = useState<'idle' | 'shown'>('idle')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let timer = 0
    const show = () => setState('shown')
    window.addEventListener(VALIDATED_EVENT, show, { once: true })
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      io.disconnect()
      timer = window.setTimeout(show, FALLBACK_MS)
    })
    io.observe(el)
    return () => {
      window.removeEventListener(VALIDATED_EVENT, show)
      window.clearTimeout(timer)
      io.disconnect()
    }
  }, [])

  return (
    <div
      ref={ref}
      className="callouts pointer-events-none absolute inset-0 z-[5] hidden xl:block"
      data-state={state}
      aria-hidden="true"
    >
      <svg className="absolute inset-0 size-full overflow-visible">
        {LAYOUT.map((l, i) => (
          <line
            key={i}
            className="callout-line"
            x1={`${l.line[0]}%`}
            y1={`${l.line[1]}%`}
            x2={`${l.line[2]}%`}
            y2={`${l.line[3]}%`}
            pathLength={1}
            stroke="#BCD383"
            strokeWidth="1.2"
            strokeLinecap="round"
            style={{ '--k': i } as CSSProperties}
          />
        ))}
      </svg>
      {LAYOUT.map((l, i) => (
        <span
          key={`ring-${i}`}
          className="callout-ring absolute grid size-3.5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-gold-soft bg-midnight/40"
          style={{ left: `${l.anchor[0]}%`, top: `${l.anchor[1]}%`, '--k': i } as CSSProperties}
        >
          <span className="size-1.5 rounded-full bg-gold-soft" />
        </span>
      ))}
      {items.map((text, i) => (
        <span
          key={text}
          className="callout-chip absolute inline-flex items-center gap-2 rounded-full border border-white/70 bg-paper/85 py-1.5 pr-3.5 pl-2 font-mono text-[11px] tracking-[0.04em] whitespace-nowrap text-ink shadow-[0_10px_24px_-12px_rgb(15_42_34/0.55)] backdrop-blur-md"
          style={{ ...LAYOUT[i]?.chip, ...({ '--k': i } as CSSProperties) }}
        >
          <span className="grid size-[18px] place-items-center rounded-full bg-ink text-gold-soft">
            <svg width="9" height="9" viewBox="0 0 10 10">
              <path d="M1.8 5.2l2 2 4.4-4.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </span>
          {text}
        </span>
      ))}
    </div>
  )
}
