import type { CSSProperties, ReactNode } from 'react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { reveal } from '@/components/ui/reveal'
import type { Messages } from '@/messages/en'

const k = (n: number) => ({ '--k': n }) as CSSProperties

// Deterministic bar heights for the backfill chart (no randomness: server and client match).
const BARS = Array.from({ length: 36 }, (_, i) => 28 + Math.round(((Math.sin(i * 1.7) + 1) / 2) * 52 + (i % 5) * 4))

export function Features({ t }: { t: Messages['features'] }) {
  const v = t.visuals
  const [formats, validation, vat, delivery, archive, backfill] = t.items

  return (
    <section data-section="features" className="section defer-render" aria-labelledby="features-title">
      <div className="container-ledger">
        <SectionHeader num={4} id="features-title" eyebrow={t.eyebrow} title={t.h2} accent={t.h2Accent} />

        <ul className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <Tile item={formats} n={1} className="sm:col-span-2 lg:col-span-4 lg:row-span-2" i={2}>
            <FormatsVisual />
          </Tile>

          <Tile item={validation} n={2} className="sm:col-span-2 lg:col-span-2 lg:row-span-2" i={3}>
            <ul className="grid gap-2.5">
              {v.checks.map((c, idx) => (
                <li
                  key={c}
                  className="tick-in flex items-center gap-3 rounded-xl border border-hairline bg-white/80 px-3.5 py-2.5 text-[13.5px]"
                  style={k(idx)}
                >
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-verified/10 text-verified" aria-hidden="true">
                    <svg width="10" height="10" viewBox="0 0 10 10">
                      <path d="M1.8 5.2l2 2 4.4-4.6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </span>
                  {c}
                </li>
              ))}
            </ul>
          </Tile>

          <Tile item={vat} n={3} className="lg:col-span-2" i={2}>
            <div className="flex flex-wrap gap-2">
              {[
                ['S', '19 %'],
                ['S', '7 %'],
                ['AE', v.reverseCharge],
                ['K', v.intraEu],
                ['381', v.creditNote],
              ].map(([code, label], idx) => (
                <span
                  key={idx}
                  className="tick-in inline-flex items-center gap-2 rounded-full border border-hairline bg-white/80 py-1 pr-3 pl-1 text-[12.5px]"
                  style={k(idx)}
                >
                  <span className="rounded-full bg-ink px-2 py-0.5 font-mono text-[10.5px] text-on-dark">{code}</span>
                  {label}
                </span>
              ))}
            </div>
          </Tile>

          <Tile item={delivery} n={4} className="lg:col-span-2" i={3}>
            <ol className="grid gap-1.5 font-mono text-[11.5px]">
              {[
                ['09:41:02', v.queued, 'bg-hairline-strong'],
                ['09:41:03', v.sent, 'bg-engrave-ink'],
                ['09:41:05', v.delivered, 'bg-verified'],
              ].map(([time, label, dot], idx) => (
                <li key={time} className="tick-in flex items-center gap-3" style={k(idx)}>
                  <span className="text-muted">{time}</span>
                  <span className={`size-1.5 rounded-full ${dot}`} aria-hidden="true" />
                  <span>{label}</span>
                </li>
              ))}
            </ol>
          </Tile>

          <Tile item={archive} n={5} className="sm:col-span-2 lg:col-span-2" i={4}>
            <div className="flex items-center gap-3 rounded-xl border border-hairline bg-white/80 px-3.5 py-3">
              <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" className="shrink-0 text-gold-deep">
                <rect x="4" y="9.5" width="14" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.3" />
                <path d="M7.5 9.5V7a3.5 3.5 0 0 1 7 0v2.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
                <circle cx="11" cy="14.5" r="1.3" fill="currentColor" />
              </svg>
              <div className="min-w-0">
                <p className="truncate font-mono text-[11.5px]">sha256 9f2c41e8…7b0de81a</p>
                <p className="mt-0.5 font-mono text-[10.5px] tracking-[0.06em] text-muted uppercase">{v.locked}</p>
              </div>
            </div>
          </Tile>

          <Tile item={backfill} n={6} className="sm:col-span-2 lg:col-span-6" i={2} wide>
            <div>
              <div className="flex h-[96px] items-end gap-[5px]" aria-hidden="true">
                {BARS.map((h, idx) => (
                  <span
                    key={idx}
                    className="bar-fill flex-1 rounded-t-[3px] bg-[linear-gradient(180deg,#2c5a48,#17382d)]"
                    style={{ height: `${h}%`, ...k(idx) }}
                  />
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between font-mono text-[10.5px] tracking-[0.08em] text-muted uppercase">
                <span>{v.backfill}</span>
                <span className="h-px flex-1 mx-4 bg-hairline-strong" />
                <span>{'→'}</span>
              </div>
            </div>
          </Tile>
        </ul>
      </div>
    </section>
  )
}

function Tile({
  item,
  n,
  className = '',
  i,
  wide = false,
  children,
}: {
  item: { title: string; body: string }
  n: number
  className?: string
  i: number
  wide?: boolean
  children: ReactNode
}) {
  return (
    <li
      className={`surface spotlight flex flex-col gap-8 p-7 sm:p-8 ${wide ? 'lg:flex-row-reverse lg:items-end lg:gap-14' : ''} ${className}`}
      {...reveal(i)}
    >
      <div className={wide ? 'lg:flex-1' : 'flex-1'}>{children}</div>
      <div className={wide ? 'lg:w-[34%]' : ''}>
        <p className="font-mono text-[11px] tracking-[0.12em] text-muted">{String(n).padStart(2, '0')}</p>
        <h3 className="mt-2 font-serif text-[26px] leading-[1.1] tracking-[-0.01em]">{item.title}</h3>
        <p className="lede mt-2 text-[15.5px]">{item.body}</p>
      </div>
    </li>
  )
}

/** The two output formats as a simple badge pair (the layered explainer lives in How it works). */
function FormatsVisual() {
  const formats = [
    { name: 'ZUGFeRD', detail: 'PDF/A-3 + XML · EN 16931' },
    { name: 'XRechnung', detail: 'CII XML · EN 16931' },
  ]
  return (
    <div className="flex h-full min-h-[180px] flex-wrap items-center justify-center gap-4 sm:gap-6" aria-hidden="true">
      {formats.map((f, i) => (
        <div key={f.name} className="flex items-center gap-4 sm:gap-6">
          {i > 0 && <span className="font-serif text-[28px] text-gold">·</span>}
          <div className="rounded-2xl border border-hairline bg-white px-6 py-5 text-center shadow-[0_18px_40px_-28px_rgb(15_42_34/0.45)]">
            <p className="font-serif text-[clamp(30px,3.4vw,44px)] leading-none tracking-[-0.02em]">{f.name}</p>
            <p className="mt-3 font-mono text-[10.5px] tracking-[0.08em] text-muted uppercase">{f.detail}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
