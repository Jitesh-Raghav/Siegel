'use client'

import { useEffect, useRef, type CSSProperties } from 'react'
import type { Messages } from '@/messages/en'

/**
 * "Invoice X-ray": a tilted invoice whose machine-readable layer (CII XML with EN 16931
 * business terms) shows through a lens. The lens drifts on its own, follows the pointer, and
 * names the field it is over. One rAF loop writes CSS variables; React never re-renders per frame.
 */

// Rows share the same vertical position (% of the sheet) on both layers.
const ROWS = [
  { y: 25, paper: ['Rechnungsnr.', 'INV-2026-0142'], xml: ['<ram:ID>', 'INV-2026-0142', '</ram:ID>'] },
  { y: 31.5, paper: ['USt-IdNr.', 'DE123456789'], xml: ['<ram:ID schemeID="VA">', 'DE123456789', '</ram:ID>'] },
  { y: 38, paper: ['Leistungszeitraum', '01.09.–30.09.2026'], xml: ['<ram:StartDateTime>', '20260901', '</ram:StartDateTime>'] },
  { y: 54, paper: ['Growth plan, September', '4.000,00 €'], xml: ['<ram:LineTotalAmount>', '4000.00', '</ram:LineTotalAmount>'] },
  { y: 73, paper: ['USt. 19 %', '760,00 €'], xml: ['<ram:TaxTotalAmount currencyID="EUR">', '760.00', '</ram:TaxTotalAmount>'] },
  { y: 81, paper: ['Gesamt', '4.760,00 €'], xml: ['<ram:GrandTotalAmount>', '4760.00', '</ram:GrandTotalAmount>'] },
] as const

// Dim structural lines between the fields, so the machine layer reads as a real document.
const FILLER = [
  { y: 17.5, text: '<rsm:ExchangedDocument>', indent: 0 },
  { y: 28.2, text: '<ram:SellerTradeParty>', indent: 1 },
  { y: 34.8, text: '<ram:BillingSpecifiedPeriod>', indent: 1 },
  { y: 41.5, text: '<ram:EndDateTime>20260930</ram:EndDateTime>', indent: 2 },
  { y: 46.5, text: '<ram:IncludedSupplyChainTradeLineItem>', indent: 0 },
  { y: 50.2, text: '<ram:BilledQuantity unitCode="C62">1</ram:BilledQuantity>', indent: 1 },
  { y: 58, text: '<ram:ApplicableTradeTax>', indent: 0 },
  { y: 61.5, text: '<ram:CategoryCode>S</ram:CategoryCode>', indent: 1 },
  { y: 65, text: '<ram:RateApplicablePercent>19</ram:RateApplicablePercent>', indent: 1 },
  { y: 69, text: '<ram:TaxBasisTotalAmount>4000.00</ram:TaxBasisTotalAmount>', indent: 1 },
  { y: 77, text: '<ram:SpecifiedTradeSettlementHeaderMonetarySummation>', indent: 0 },
  { y: 85, text: '<ram:DuePayableAmount>4760.00</ram:DuePayableAmount>', indent: 1 },
  { y: 88.5, text: '</rsm:CrossIndustryInvoice>', indent: 0 },
]

const PARKED = 1 // SSR / reduced motion: lens rests on the seller VAT ID
// Keep the whole lens inside the sheet horizontally (no overflow on small screens).
const clampX = (x: number) => Math.min(1 - 0.27, Math.max(0.27, x))
const LENS = 0.25 // lens radius as a fraction of the sheet width

export function InvoiceXray({ t }: { t: Messages['xray'] }) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const readoutRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const sheet = sheetRef.current
    const wrap = sheet?.parentElement
    if (!sheet || !wrap) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const fields = [...sheet.querySelectorAll<HTMLElement>('[data-field]')]

    let raf = 0
    let visible = true
    let pointer: { x: number; y: number } | null = null
    let lastPointer = 0
    let active = -1
    const lens = { x: 0.5, y: ROWS[PARKED].y / 100 } // fractions of the sheet
    const tilt = { x: 0, y: 0, tx: 0, ty: 0 }
    const t0 = performance.now()
    // Size is cached from a ResizeObserver, so frames never force a layout read.
    let size = { w: sheet.offsetWidth || 400, h: sheet.offsetHeight || 500 }
    const ro = new ResizeObserver(([entry]) => {
      size = { w: entry.contentRect.width, h: entry.contentRect.height }
    })
    ro.observe(sheet)
    let lastFrame = 0

    const setActive = (i: number) => {
      if (i === active) return
      active = i
      fields.forEach((f) => f.toggleAttribute('data-active', Number(f.dataset.field) === i))
      if (readoutRef.current) {
        const f = t.fields[i]
        readoutRef.current.textContent = f ? `${f.bt} · ${f.name}` : t.idle
      }
    }

    const apply = () => {
      const r = { width: size.w, height: size.h }
      sheet.style.setProperty('--lx', `${(lens.x * 100).toFixed(2)}%`)
      sheet.style.setProperty('--ly', `${(lens.y * 100).toFixed(2)}%`)
      sheet.style.setProperty('--r', `${(LENS * r.width).toFixed(1)}px`)
      wrap.style.setProperty('--rx', `${tilt.x.toFixed(2)}deg`)
      wrap.style.setProperty('--ry', `${tilt.y.toFixed(2)}deg`)
      // nearest row within the lens
      const radiusY = (LENS * r.width) / r.height
      let best = -1
      let bestD = Infinity
      ROWS.forEach((row, i) => {
        const d = Math.abs(row.y / 100 - lens.y)
        if (d < radiusY * 0.75 && d < bestD) {
          best = i
          bestD = d
        }
      })
      setActive(best)
    }

    const loop = (now: number) => {
      raf = 0
      if (!visible || document.hidden) return
      const following = pointer && now - lastPointer < 2500
      // Idle drift is slow: 30fps is plenty and halves the paint work. Pointer gets full rate.
      if (!following && now - lastFrame < 32) {
        raf = requestAnimationFrame(loop)
        return
      }
      lastFrame = now
      const s = (now - t0) / 1000
      // Idle: a slow Lissajous drift over the sheet. Pointer: follow it.
      const target = following
        ? pointer!
        : { x: 0.5 + 0.2 * Math.sin(s * 0.45), y: 0.52 + 0.3 * Math.sin(s * 0.31 + 0.9) }
      const k = following ? 0.18 : 0.05
      lens.x += (target.x - lens.x) * k
      lens.y += (target.y - lens.y) * k
      tilt.x += (tilt.tx - tilt.x) * 0.08
      tilt.y += (tilt.ty - tilt.y) * 0.08
      apply()
      raf = requestAnimationFrame(loop)
    }

    const onMove = (e: PointerEvent) => {
      const r = sheet.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width
      const y = (e.clientY - r.top) / r.height
      if (x < -0.1 || x > 1.1 || y < -0.1 || y > 1.1) return
      pointer = { x: clampX(x), y: Math.min(0.9, Math.max(0.12, y)) }
      lastPointer = performance.now()
      tilt.ty = (x - 0.5) * 10
      tilt.tx = -(y - 0.5) * 8
      if (reduced) apply()
    }
    const onLeave = () => {
      tilt.tx = 0
      tilt.ty = 0
    }

    wrap.addEventListener('pointermove', onMove)
    wrap.addEventListener('pointerdown', onMove)
    wrap.addEventListener('pointerleave', onLeave)

    let io: IntersectionObserver | null = null
    if (reduced) {
      apply()
    } else {
      let started = false
      io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting
        if (visible && started && !raf) raf = requestAnimationFrame(loop)
      })
      io.observe(wrap)
      const onVis = () => {
        if (!document.hidden && visible && !raf) raf = requestAnimationFrame(loop)
      }
      document.addEventListener('visibilitychange', onVis)
      // Begin drifting only once the page has loaded and gone idle.
      let idleId = 0
      const begin = () => {
        idleId = typeof window.requestIdleCallback === 'function'
          ? window.requestIdleCallback(() => { started = true; if (!raf) raf = requestAnimationFrame(loop) }, { timeout: 2500 })
          : window.setTimeout(() => { started = true; if (!raf) raf = requestAnimationFrame(loop) }, 800)
      }
      if (document.readyState === 'complete') begin()
      else window.addEventListener('load', begin, { once: true })
      return () => {
        if (typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idleId)
        else window.clearTimeout(idleId)
        window.removeEventListener('load', begin)
        ro.disconnect()
        cancelAnimationFrame(raf)
        io?.disconnect()
        document.removeEventListener('visibilitychange', onVis)
        wrap.removeEventListener('pointermove', onMove)
        wrap.removeEventListener('pointerdown', onMove)
        wrap.removeEventListener('pointerleave', onLeave)
      }
    }
    return () => {
      ro.disconnect()
      wrap.removeEventListener('pointermove', onMove)
      wrap.removeEventListener('pointerdown', onMove)
      wrap.removeEventListener('pointerleave', onLeave)
    }
  }, [t])

  const parked = ROWS[PARKED]

  return (
    <div className="xray relative mx-auto w-full max-w-[470px] touch-pan-y select-none" role="img" aria-label={t.label}>
      {/* soft brass glow + ground shadow */}
      <div className="pointer-events-none absolute -inset-10 -z-10 rounded-[40px] bg-[radial-gradient(closest-side,rgb(216_190_142/0.35),transparent)]" aria-hidden="true" />

      <div
        ref={sheetRef}
        className="xray-sheet relative aspect-[4/5.1] w-full"
        style={{ '--lx': '50%', '--ly': `${parked.y}%`, '--r': '112px' } as CSSProperties}
        aria-hidden="true"
      >
        {/* ---------- Paper layer: what people see ---------- */}
        <div className="xray-paper absolute inset-0 overflow-hidden rounded-[20px] border border-hairline bg-[#FBF9F3]">
          <div className="absolute top-[6%] right-[8%] left-[8%] flex items-baseline justify-between">
            <span className="font-serif text-[clamp(18px,2.2vw,26px)] leading-none">Muster GmbH</span>
            <span className="font-mono text-[10px] tracking-[0.14em] text-muted">{t.doc}</span>
          </div>
          <p className="absolute top-[12.5%] left-[8%] text-[11px] text-muted">Musterstraße 1 · 10115 Berlin</p>
          <div className="absolute top-[18%] right-[8%] left-[8%] h-px bg-hairline" />
          <div className="absolute top-[46%] right-[8%] left-[8%] flex justify-between border-b border-hairline pb-1 font-mono text-[9.5px] tracking-[0.1em] text-muted uppercase">
            <span>Pos · Beschreibung</span>
            <span>Netto</span>
          </div>
          <div className="absolute top-[60%] right-[8%] left-[8%] grid gap-1.5">
            <span className="h-1.5 w-[70%] rounded-full bg-paper-2" />
            <span className="h-1.5 w-[45%] rounded-full bg-paper-2" />
          </div>
          <div className="absolute top-[67%] right-[8%] left-[8%] h-px bg-hairline" />
          {ROWS.map((row, i) => (
            <div
              key={i}
              data-field={i}
              data-active={i === PARKED ? '' : undefined}
              className="xray-row absolute right-[6%] left-[6%] flex -translate-y-1/2 items-center justify-between rounded-md px-[2%] py-1 text-[clamp(11px,1.15vw,13.5px)]"
              style={{ top: `${row.y}%` }}
            >
              <span className={i === 5 ? 'font-medium' : 'text-muted'}>{row.paper[0]}</span>
              <span className={`tabular ${i === 5 ? 'font-serif text-[1.35em]' : ''}`}>{row.paper[1]}</span>
            </div>
          ))}
          {/* scan line */}
          <div className="xray-scan pointer-events-none absolute inset-x-0 h-16" />
          <p className="absolute bottom-[4.5%] left-[8%] font-mono text-[9px] tracking-[0.12em] text-muted uppercase">PDF/A-3 · ZUGFeRD</p>
        </div>

        {/* ---------- Machine layer: what software reads, seen through the lens ---------- */}
        <div className="xray-machine absolute inset-0 overflow-hidden rounded-[20px] bg-midnight">
          <div className="absolute inset-0 bg-[linear-gradient(rgb(216_190_142/0.06)_1px,transparent_1px),linear-gradient(90deg,rgb(216_190_142/0.06)_1px,transparent_1px)] bg-[size:18px_18px]" />
          <p className="absolute top-[6%] left-[8%] font-mono text-[10px] tracking-[0.14em] text-gold-soft uppercase">
            rsm:CrossIndustryInvoice
          </p>
          <p className="absolute top-[11%] left-[8%] font-mono text-[10px] text-[#8FA399]">
            urn:cen.eu:en16931:2017
          </p>
          {FILLER.map((f) => (
            <p
              key={f.y}
              className="absolute right-[6%] -translate-y-1/2 truncate font-mono text-[clamp(9px,0.95vw,11px)] text-[#5F7A6E]"
              style={{ top: `${f.y}%`, left: `${8 + f.indent * 3}%` }}
            >
              {f.text}
            </p>
          ))}
          {ROWS.map((row, i) => (
            <div
              key={i}
              data-field={i}
              data-active={i === PARKED ? '' : undefined}
              className="xray-row absolute right-[6%] left-[6%] flex -translate-y-1/2 items-center gap-2 rounded-md px-[2%] py-1 font-mono text-[clamp(9.5px,1vw,11.5px)] whitespace-nowrap"
              style={{ top: `${row.y}%` }}
            >
              <span className="shrink-0 rounded border border-gold/60 px-1.5 py-px text-[0.9em] text-gold-soft">{t.fields[i].bt}</span>
              <span className="min-w-0 truncate">
                <span className="text-[#8FA399]">{row.xml[0]}</span>
                <span className="text-[#F1EDE2]">{row.xml[1]}</span>
                <span className="text-[#8FA399]">{row.xml[2]}</span>
              </span>
            </div>
          ))}
          <p className="absolute bottom-[4.5%] left-[8%] font-mono text-[9px] tracking-[0.12em] text-[#8FA399] uppercase">
            XML · EN 16931 · CII
          </p>
        </div>

        {/* ---------- Lens ring ---------- */}
        <div className="xray-lens pointer-events-none absolute">
          <svg className="absolute inset-0 size-full overflow-visible" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="49.4" fill="none" stroke="#D8BE8E" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <circle
              cx="50"
              cy="50"
              r="53"
              fill="none"
              stroke="#B4894A"
              strokeWidth="1"
              strokeDasharray="0.6 3.4"
              vectorEffect="non-scaling-stroke"
              className="xray-ticks"
            />
          </svg>
          <span
            ref={readoutRef}
            className="absolute top-[94%] left-1/2 -translate-x-1/2 rounded-full bg-ink px-2.5 py-1 font-mono text-[10.5px] tracking-[0.04em] whitespace-nowrap text-gold-soft shadow-[0_8px_20px_-8px_rgb(15_42_34/0.6)]"
          >
            {`${t.fields[PARKED].bt} · ${t.fields[PARKED].name}`}
          </span>
        </div>
      </div>

      <p className="mt-5 flex items-center justify-center gap-2 font-mono text-[11px] tracking-[0.08em] text-muted uppercase">
        <span className="size-1.5 rounded-full bg-gold" aria-hidden="true" />
        {t.hint}
      </p>
    </div>
  )
}
