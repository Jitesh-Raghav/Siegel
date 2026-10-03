'use client'

import { LazyMotion, m, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { Messages } from '@/messages/en'

const EASE = [0.22, 1, 0.36, 1] as const
const loadFeatures = () => import('./motionFeatures').then((mod) => mod.default)

// Rows of the human-readable PDF; `f` links a row to a highlighted field.
const PDF_ROWS: { l: string; r?: string; f?: number; strong?: boolean; rule?: boolean }[] = [
  { l: 'Musterstraße 1 · 10115 Berlin' },
  { l: 'USt-IdNr.', r: 'DE123456789', f: 0 },
  { l: '', rule: true },
  { l: 'Rechnungsnr.', r: 'INV-2026-0142' },
  { l: 'Leistungszeitraum', r: '01.09.–30.09.2026', f: 1 },
  { l: 'Ihre Referenz', r: 'PO-7781', f: 3 },
  { l: '', rule: true },
  { l: 'Growth plan, September', r: '4.000,00 €' },
  { l: 'Netto', r: '4.000,00 €' },
  { l: 'USt. 19 %', r: '760,00 €', f: 2 },
  { l: 'Gesamt', r: '4.760,00 €', strong: true },
]

// Simplified CII excerpt (indentation in spaces).
const XML_ROWS: { t: string; f?: number }[] = [
  { t: '<rsm:CrossIndustryInvoice>' },
  { t: '  <ram:BuyerReference>PO-7781</ram:BuyerReference>', f: 3 },
  { t: '  <ram:SellerTradeParty>' },
  { t: '    <ram:Name>Muster GmbH</ram:Name>' },
  { t: '    <ram:SpecifiedTaxRegistration>' },
  { t: '      <ram:ID schemeID="VA">DE123456789</ram:ID>', f: 0 },
  { t: '  <ram:BillingSpecifiedPeriod>' },
  { t: '    <ram:StartDateTime>20260901</ram:StartDateTime>', f: 1 },
  { t: '    <ram:EndDateTime>20260930</ram:EndDateTime>', f: 1 },
  { t: '  <ram:ApplicableTradeTax>' },
  { t: '    <ram:CalculatedAmount>760.00</ram:CalculatedAmount>', f: 2 },
  { t: '    <ram:CategoryCode>S</ram:CategoryCode>', f: 2 },
  { t: '    <ram:RateApplicablePercent>19</ram:RateApplicablePercent>', f: 2 },
]

/** Tags muted, values in ink. */
function XmlLine({ text }: { text: string }) {
  const parts = text.split(/(<[^>]+>)/g).filter(Boolean)
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('<') ? (
          <span key={i} className="text-[#6B6A64]">
            {p.replace(/ /g, ' ')}
          </span>
        ) : (
          <span key={i} className="text-ink">
            {p.replace(/ /g, ' ')}
          </span>
        ),
      )}
    </>
  )
}

const WIDE = '(min-width: 768px)'
const noopSubscribe = () => () => {}
function subscribeWide(onChange: () => void) {
  const mq = window.matchMedia(WIDE)
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}

export function LayerDiagram({ t }: { t: Messages['how']['diagram'] }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.35 })
  const reduced = useReducedMotion()
  // Server render and no-JS: layers already split. After hydration they start stacked
  // and split once the figure scrolls into view.
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false)
  const wide = useSyncExternalStore(subscribeWide, () => window.matchMedia(WIDE).matches, () => true)
  const [revealed, setRevealed] = useState(false)
  const [field, setField] = useState(0)
  const split = !hydrated || !!reduced || revealed

  useEffect(() => {
    if (!inView || revealed) return
    const id = window.setTimeout(() => setRevealed(true), 250)
    return () => window.clearTimeout(id)
  }, [inView, revealed])

  useEffect(() => {
    if (!split || !inView || reduced) return
    const id = window.setInterval(() => setField((f) => (f + 1) % 4), 1700)
    return () => window.clearInterval(id)
  }, [split, inView, reduced])

  const stackedPdf = wide ? { x: '58%', rotate: 0 } : { y: 0 }
  const stackedXml = wide ? { x: '-50%', rotate: -2, opacity: 0.9 } : { y: 0 }
  const transition = { duration: reduced ? 0 : 1.1, ease: EASE }

  return (
    <LazyMotion features={loadFeatures} strict>
      <figure ref={ref} className="mt-20 border-t border-hairline pt-12" aria-label={t.caption}>
        <figcaption className="flex flex-wrap items-baseline justify-between gap-4">
          <span className="font-serif text-[22px] tracking-[-0.01em]">{t.caption}</span>
          <ul className="flex flex-wrap gap-2" aria-label="Fields">
            {t.fields.map((f, i) => (
              <li
                key={f}
                className={`rounded-[2px] border px-2.5 py-1 font-mono text-[11px] tracking-[0.04em] transition-colors duration-500 ${
                  split && field === i
                    ? 'border-engrave-ink bg-engrave-ink text-paper'
                    : 'border-hairline bg-white text-muted'
                }`}
              >
                {f}
              </li>
            ))}
          </ul>
        </figcaption>

        <div className="relative mt-10 grid gap-10 md:grid-cols-[5fr_6fr] md:gap-12">
          {/* PDF — for humans */}
          <m.div
            className="relative z-10 min-w-0"
            initial={false}
            animate={split ? { x: 0, y: 0, rotate: 0 } : stackedPdf}
            transition={transition}
          >
            <LayerLabel>{t.pdfLayer}</LayerLabel>
            <div className="mt-3 rounded-[2px] border border-hairline bg-white p-6 shadow-[0_18px_40px_-24px_rgb(14_14_14/0.25)]">
              <div className="flex items-baseline justify-between">
                <span className="font-serif text-[20px]">Muster GmbH</span>
                <span className="mono-label text-muted">{t.pdfTitle}</span>
              </div>
              <div className="mt-4 grid gap-[3px] text-[13px]">
                {PDF_ROWS.map((r, i) =>
                  r.rule ? (
                    <div key={i} className="my-2 h-px bg-hairline" />
                  ) : (
                    <div
                      key={i}
                      className={`-mx-2 flex justify-between gap-4 rounded-[2px] px-2 py-[3px] transition-colors duration-500 ${
                        split && r.f === field ? 'bg-engrave-cream' : ''
                      } ${r.strong ? 'font-medium' : ''}`}
                    >
                      <span className={r.r ? 'text-muted' : 'text-muted'}>{r.l}</span>
                      {r.r && <span className="tabular text-ink">{r.r}</span>}
                    </div>
                  ),
                )}
              </div>
            </div>
          </m.div>

          {/* XML — for machines */}
          <m.div
            className="relative min-w-0"
            initial={false}
            animate={split ? { x: 0, y: 0, rotate: 0, opacity: 1 } : stackedXml}
            transition={transition}
          >
            <LayerLabel>{t.xmlLayer}</LayerLabel>
            <div className="mt-3 overflow-hidden rounded-[2px] border border-hairline bg-[#FDFCF9] py-5 shadow-[0_18px_40px_-24px_rgb(31_58_122/0.3)]">
              <pre className="font-mono text-[11px] leading-[1.85] sm:text-[11.5px]" aria-hidden="true">
                {XML_ROWS.map((r, i) => (
                  <div
                    key={i}
                    className={`overflow-hidden border-l-2 px-5 text-ellipsis whitespace-nowrap transition-colors duration-500 ${
                      split && r.f === field ? 'border-engrave-ink bg-engrave-cream/70' : 'border-transparent'
                    }`}
                  >
                    <XmlLine text={r.t} />
                  </div>
                ))}
              </pre>
            </div>
          </m.div>
        </div>
      </figure>
    </LazyMotion>
  )
}

function LayerLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 font-mono text-[12px] tracking-[0.04em] text-ink">
      <span className="h-px w-6 bg-ink" aria-hidden="true" />
      {children}
    </p>
  )
}
