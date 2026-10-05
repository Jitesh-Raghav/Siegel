'use client'

import { useEffect, useState } from 'react'
import { daysUntilMandate } from '@/lib/deadline'

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

  if (days <= 0) {
    return <p className="font-sans text-[36px] leading-tight tracking-[-0.03em]">{days === 0 ? t.today : t.past}</p>
  }

  return (
    <div>
      <p
        className="tabular font-sans text-[112px] leading-[0.82] font-light tracking-[-0.06em] sm:text-[156px]"
        suppressHydrationWarning
      >
        {days}
      </p>
      <div className="foil-rule mt-5 w-24" aria-hidden="true" />
      <p className="mono-label mt-4 text-muted" suppressHydrationWarning>
        {days === 1 ? t.one : t.many}
      </p>
    </div>
  )
}
