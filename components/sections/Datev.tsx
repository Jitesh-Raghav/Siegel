'use client'

import { useState } from 'react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { reveal } from '@/components/ui/reveal'
import type { Messages } from '@/messages/en'

type Frame = 'SKR03' | 'SKR04'

// Example bookings: revenue 19 % (8400 / 4400), reverse charge (8338 / 4338), and a credit note.
const ROWS: { debtor: string; skr03: string; skr04: string; amount: string; doc: string }[] = [
  { debtor: '10001', skr03: '8400', skr04: '4400', amount: '3.808,00', doc: 'INV-2026-0142' },
  { debtor: '10002', skr03: '8400', skr04: '4400', amount: '1.190,00', doc: 'INV-2026-0143' },
  { debtor: '10003', skr03: '8338', skr04: '4338', amount: '2.400,00', doc: 'INV-2026-0144' },
  { debtor: '10001', skr03: '8400', skr04: '4400', amount: '−595,00', doc: 'GS-2026-0012' },
]

/** "For your Steuerberater": the monthly DATEV export, the main reason to choose Growth or Scale. */
export function Datev({ t }: { t: Messages['datev'] }) {
  const [frame, setFrame] = useState<Frame>('SKR03')
  const m = t.mock

  return (
    <section id="datev" data-section="datev" className="section defer-render pb-[clamp(72px,8vw,112px)]" aria-labelledby="datev-title">
      <div className="container-ledger grid grid-cols-1 items-center gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
        <div>
          <SectionHeader num={5} id="datev-title" eyebrow={t.eyebrow} title={t.h2} accent={t.h2Accent} body={t.body} />
          <ul className="mt-9 grid grid-cols-1 gap-3 sm:grid-cols-2" {...reveal(4)}>
            {t.points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-[15px]">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-gold/15 text-gold-deep" aria-hidden="true">
                  <svg width="10" height="10" viewBox="0 0 10 10">
                    <path d="M1.8 5.2l2 2 4.4-4.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </span>
                {p}
              </li>
            ))}
          </ul>
          <p className="mt-8 inline-flex items-center gap-2 rounded-full border border-gold/35 bg-white/70 px-3 py-1.5 font-mono text-[11px] tracking-[0.08em] text-gold-deep uppercase" {...reveal(5)}>
            <span className="size-1.5 rounded-full bg-gold" aria-hidden="true" />
            {t.plan}
          </p>
        </div>

        {/* The export itself */}
        <div className="relative" {...reveal(3)}>
          <div className="datev-glow pointer-events-none absolute -inset-10 -z-10" aria-hidden="true" />
          <div className="surface overflow-hidden rounded-[22px] bg-white">
            <div className="hi-band-light flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-5 py-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-ink font-mono text-[9.5px] tracking-[0.04em] text-on-dark" aria-hidden="true">
                  CSV
                </span>
                <div className="min-w-0">
                  <p className="truncate font-mono text-[12px] text-ink">EXTF_Buchungsstapel_2026-09.csv</p>
                  <p className="mt-0.5 font-mono text-[10.5px] tracking-[0.08em] text-muted uppercase">
                    DATEV · {m.period} · 142 {m.bookings}
                  </p>
                </div>
              </div>
              <div className="segmented-pill" role="group" aria-label="SKR">
                {(['SKR03', 'SKR04'] as const).map((f) => (
                  <button key={f} type="button" aria-pressed={frame === f} onClick={() => setFrame(f)}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto px-5 py-3 sm:px-6">
              <table className="w-full font-mono text-[12px]">
                <thead>
                  <tr className="text-left text-[10px] tracking-[0.1em] text-muted uppercase">
                    {m.cols.map((c, i) => (
                      <th key={c} className={`py-2.5 font-normal ${i === 2 ? 'text-right' : ''} ${i === 3 ? 'hidden pl-4 sm:table-cell' : ''}`}>
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((r) => (
                    <tr key={r.doc} className="border-t border-hairline">
                      <td className="py-3">{r.debtor}</td>
                      <td className="py-3">
                        <span key={frame} className="datev-swap inline-block rounded bg-gold/12 px-1.5 py-0.5 text-gold-deep">
                          {frame === 'SKR03' ? r.skr03 : r.skr04}
                        </span>
                      </td>
                      <td className={`tabular py-3 text-right ${r.amount.startsWith('−') ? 'text-danger' : ''}`}>{r.amount}</td>
                      <td className="hidden py-3 pl-4 text-muted sm:table-cell">{r.doc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-hairline bg-paper-2/60 px-5 py-4 sm:px-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-ink py-1.5 pr-3.5 pl-2 font-mono text-[11px] text-on-dark">
                <span className="grid size-5 place-items-center rounded-full bg-gold text-ink" aria-hidden="true">
                  <svg width="9" height="9" viewBox="0 0 10 10">
                    <path d="M1.8 5.2l2 2 4.4-4.6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
                {m.sentTo}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-hairline-strong bg-white px-3 py-1.5 font-mono text-[11px] text-ink">
                <svg width="12" height="12" viewBox="0 0 22 22" aria-hidden="true" className="text-gold-deep">
                  <rect x="4" y="9.5" width="14" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M7.5 9.5V7a3.5 3.5 0 0 1 7 0v2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
                </svg>
                {m.access}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
