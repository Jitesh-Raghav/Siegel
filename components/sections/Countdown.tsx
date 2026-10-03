'use client'

import { useEffect, useState } from 'react'
import { daysUntilMandate } from '@/lib/deadline'
import { fill } from '@/lib/format'

/** Server renders the day count; the client recomputes it in Europe/Berlin time. */
export function Countdown({
  initialDays,
  t,
}: {
  initialDays: number
  t: { one: string; many: string; today: string; past: string }
}) {
  const [days, setDays] = useState(initialDays)

  useEffect(() => {
    const update = () => setDays(daysUntilMandate())
    update()
    const id = window.setInterval(update, 60_000)
    return () => window.clearInterval(id)
  }, [])

  const text =
    days > 1 ? fill(t.many, { n: days }) : days === 1 ? fill(t.one, { n: 1 }) : days === 0 ? t.today : t.past

  return (
    <p className="inline-flex h-11 items-center gap-2.5 rounded-[2px] border border-hairline bg-white px-4 font-mono text-[13px] tracking-[0.02em] whitespace-nowrap">
      <span className="size-1.5 rounded-full bg-engrave-ink" aria-hidden="true" />
      <span className="tabular" suppressHydrationWarning>
        {text}
      </span>
    </p>
  )
}
