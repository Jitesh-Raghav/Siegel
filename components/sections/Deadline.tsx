import { SectionHeader } from '@/components/ui/SectionHeader'
import { reveal } from '@/components/ui/reveal'
import { daysUntilMandate, timelinePosition } from '@/lib/deadline'
import type { Messages } from '@/messages/en'
import { Countdown } from './Countdown'

// Milestones sit at equal spacing so they line up with their labels below.
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
    <section id="deadline" data-section="deadline" className="section" aria-labelledby="deadline-title">
      <div className="container-ledger">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeader id="deadline-title" eyebrow={t.eyebrow} title={t.h2} />
          <div {...reveal(2)}>
            <Countdown
              initialDays={days}
              t={{ one: t.countdownOne, many: t.countdownMany, today: t.countdownToday, past: t.countdownPast }}
            />
          </div>
        </div>

        {/* Desktop: horizontal engraved rule with notches */}
        <div className="relative mt-16 hidden md:block" aria-hidden="true">
          <div className="relative h-10">
            <div className="absolute top-1/2 right-0 left-0 h-px bg-[repeating-linear-gradient(to_right,var(--ink)_0_4px,transparent_4px_8px)] opacity-30" />
            <div
              className="absolute top-1/2 left-0 h-[1.5px] -translate-y-[0.25px] bg-ink"
              data-reveal="rule"
              style={{ width: `${today * 100}%`, '--i': 3 } as React.CSSProperties}
            />
            {MONTH_TICKS.map((tk, i) => (
              <span
                key={i}
                className="absolute top-1/2 w-px bg-ink"
                style={{
                  left: `${tk.pos * 100}%`,
                  height: tk.year ? 0 : tk.quarter ? 9 : 5,
                  transform: 'translateY(-50%)',
                  opacity: 0.35,
                }}
              />
            ))}
            {EVENT_POS.map((p, i) => (
              <span
                key={i}
                className={`absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border ${
                  i === 1 ? 'border-engrave-ink bg-engrave-ink' : 'border-ink bg-paper'
                }`}
                style={{ left: `${p * 100}%` }}
              />
            ))}
            {today > 0.02 && today < 0.98 && (
              <span className="absolute top-1/2 -translate-x-1/2" style={{ left: `${today * 100}%` }}>
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.08em] whitespace-nowrap text-muted uppercase">
                  {t.today}
                </span>
                <span className="absolute -top-2 left-1/2 block h-4 w-px -translate-x-1/2 bg-ink" />
              </span>
            )}
          </div>
        </div>

        <ol className="mt-10 grid gap-8 border-l border-hairline pl-6 md:mt-6 md:grid-cols-3 md:gap-0 md:border-0 md:pl-0">
          {t.events.map((e, i) => (
            <li
              key={e.date}
              className={`relative md:pr-8 ${i === 1 ? 'md:text-center md:px-6' : ''} ${i === 2 ? 'md:text-right md:pr-0 md:pl-8' : ''}`}
              {...reveal(3 + i)}
            >
              <span
                className={`absolute top-1.5 -left-[31px] size-2.5 rotate-45 border md:hidden ${
                  i === 1 ? 'border-engrave-ink bg-engrave-ink' : 'border-ink bg-paper'
                }`}
                aria-hidden="true"
              />
              <p className={`font-mono text-[13px] tracking-[0.04em] ${i === 1 ? 'text-engrave-ink' : 'text-ink'}`}>
                {e.date}
              </p>
              <p className="mt-2 text-[17px] leading-snug text-pretty md:max-w-[30ch] md:[li:nth-child(2)_&]:mx-auto md:[li:nth-child(3)_&]:ml-auto">
                {e.text}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-14 border-t border-hairline pt-5" {...reveal(6)}>
          <p className="max-w-[70ch] text-[13px] leading-relaxed text-muted">{t.footnote}</p>
        </div>
      </div>
    </section>
  )
}
