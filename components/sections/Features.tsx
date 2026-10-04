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
        <SectionHeader id="features-title" eyebrow={t.eyebrow} title={t.h2} accent={t.h2Accent} />

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

/** A hybrid ZUGFeRD sheet with its embedded XML, next to a pure XRechnung file. */
function FormatsVisual() {
  return (
    <div className="relative h-[230px] sm:h-[260px]" aria-hidden="true">
      {/* PDF/A-3 sheet */}
      <div className="absolute top-2 left-[4%] w-[52%] max-w-[300px] -rotate-3 rounded-xl border border-hairline bg-white p-5 shadow-[0_24px_50px_-28px_rgb(15_42_34/0.45)]">
        <div className="flex items-center justify-between">
          <span className="font-serif text-[17px]">Muster GmbH</span>
          <span className="rounded-full bg-paper-2 px-2 py-0.5 font-mono text-[9.5px] tracking-[0.08em] text-muted">PDF/A-3</span>
        </div>
        <div className="mt-4 grid gap-1.5">
          {[90, 70, 80, 55].map((w, idx) => (
            <span key={idx} className="h-1.5 rounded-full bg-paper-2" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="mt-4 flex justify-between border-t border-hairline pt-3 font-mono text-[11px]">
          <span className="text-muted">Gesamt</span>
          <span>4.760,00 €</span>
        </div>
        {/* embedded XML attachment */}
        <span className="absolute -right-5 -bottom-4 inline-flex items-center gap-1.5 rounded-full border border-gold/50 bg-paper px-2.5 py-1 font-mono text-[10px] shadow-[0_8px_20px_-10px_rgb(116_85_42/0.6)]">
          <span className="size-1.5 rotate-45 bg-gold" />
          factur-x.xml
        </span>
      </div>

      {/* XRechnung XML */}
      <div className="absolute top-10 right-[4%] w-[46%] max-w-[270px] rotate-2 rounded-xl border border-white/10 bg-midnight p-5 font-mono text-[10.5px] leading-[1.9] shadow-[0_30px_60px_-30px_rgb(11_31_25/0.8)]">
        <p className="mb-2 flex items-center justify-between text-[9.5px] tracking-[0.1em] text-on-dark-muted uppercase">
          XRechnung <span className="text-gold-soft">CII</span>
        </p>
        <p className="truncate text-[#8FA399]">
          &lt;ram:ID&gt;<span className="text-gold-soft">INV-2026-0142</span>
        </p>
        <p className="truncate text-[#8FA399]">
          &lt;ram:TypeCode&gt;<span className="text-gold-soft">380</span>
        </p>
        <p className="truncate text-[#8FA399]">
          &lt;ram:InvoiceCurrencyCode&gt;<span className="text-gold-soft">EUR</span>
        </p>
        <p className="truncate text-[#8FA399]">
          &lt;ram:GrandTotalAmount&gt;<span className="text-gold-soft">4760.00</span>
        </p>
      </div>
    </div>
  )
}
