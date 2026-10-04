import { SectionHeader } from '@/components/ui/SectionHeader'
import { reveal } from '@/components/ui/reveal'
import { daysUntilMandate, timelinePosition } from '@/lib/deadline'
import type { Messages } from '@/messages/en'
import { Countdown } from './Countdown'

// Milestones sit at equal spacing so they line up with their cards below.
const EVENT_POS = [0, 0.5, 1]

// One tick per month: 24 on the first half, 12 on the second.
const MONTH_TICKS = Array.from({ length: 37 }, (_, i) => ({
  pos: i <= 24 ? (i / 24) * 0.5 : 0.5 + ((i - 24) / 12) * 0.5,
  quarter: i % 3 === 0,
  year: i % 12 === 0,
}))

export function Deadline({ t }: { t: Messages['deadline'] }) {
  const days = daysUntilMandate()
  const today = timelinePosition()

  return (
    <section id="deadline" data-section="deadline" className="section defer-render" aria-labelledby="deadline-title">
      <div className="container-ledger">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:items-end">
          <SectionHeader num={2} id="deadline-title" eyebrow={t.eyebrow} title={t.h2} accent={t.h2Accent} body={t.body} />
          <div className="surface relative overflow-hidden p-8 sm:p-10" {...reveal(3)}>
            <div className="hatch absolute -top-10 -right-10 size-40 rotate-45 opacity-60" aria-hidden="true" />
            <Countdown
              initialDays={days}
              t={{ one: t.daysOne, many: t.daysMany, today: t.countdownToday, past: t.countdownPast }}
            />
          </div>
        </div>

        {/* Desktop: engraved rule with month ticks; the elapsed part draws in as foil */}
        <div className="relative mt-20 hidden md:block" aria-hidden="true">
          <div className="relative h-12">
            <div className="absolute top-1/2 right-0 left-0 h-px bg-hairline-strong" />
            <div className="absolute top-1/2 -translate-y-1/2" style={{ left: 0, width: `${today * 100}%` }}>
              <div className="foil-rule h-[2px]" data-reveal="rule" style={{ '--i': 2 } as React.CSSProperties} />
            </div>
            {MONTH_TICKS.map((tk, i) => (
              <span
                key={i}
                className="absolute top-1/2 w-px bg-ink"
                style={{
                  left: `${tk.pos * 100}%`,
                  height: tk.year ? 0 : tk.quarter ? 10 : 5,
                  transform: 'translateY(-50%)',
                  opacity: tk.pos <= today ? 0.5 : 0.22,
                }}
              />
            ))}
            {EVENT_POS.map((p, i) => (
              <span
                key={i}
                className={`absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rotate-45 border ${
                  i === 1 ? 'border-gold-deep bg-[linear-gradient(135deg,#1f7a55,#7fcba6,#2f9168)] shadow-[0_0_0_5px_rgb(63_167_122/0.15)]' : 'border-ink bg-paper'
                }`}
                style={{ left: `${p * 100}%` }}
              />
            ))}
            {today > 0.02 && today < 0.98 && (
              <span className="absolute top-1/2" style={{ left: `${today * 100}%` }}>
                <span className="absolute -top-9 left-1/2 -translate-x-1/2 rounded-full bg-ink px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] whitespace-nowrap text-on-dark uppercase">
                  {t.today}
                </span>
                <span className="absolute -top-3 left-1/2 block h-6 w-px -translate-x-1/2 bg-ink" />
              </span>
            )}
          </div>
        </div>

        <ol className="mt-10 grid gap-4 md:mt-8 md:grid-cols-3 md:gap-6">
          {t.events.map((e, i) => {
            const key = i === 1
            return (
              <li
                key={e.date}
                className={`relative rounded-[18px] border p-6 transition-shadow ${
                  key
                    ? 'border-gold/50 bg-white shadow-[0_1px_0_rgb(255_255_255)_inset,0_20px_40px_-24px_rgb(31_122_85/0.45)]'
                    : 'border-hairline bg-white/45'
                } ${i === 1 ? 'md:text-center' : ''} ${i === 2 ? 'md:text-right' : ''}`}
                {...reveal(3 + i)}
              >
                <p className={`font-mono text-[12px] tracking-[0.08em] uppercase ${key ? 'text-gold-deep' : 'text-muted'}`}>
                  {e.date}
                </p>
                <p className="mt-3 font-serif text-[23px] leading-[1.15] text-pretty">{e.text}</p>
              </li>
            )
          })}
        </ol>

        <p className="mt-10 max-w-[70ch] text-[13px] leading-relaxed text-muted" {...reveal(6)}>
          {t.footnote}
        </p>
      </div>
    </section>
  )
}
