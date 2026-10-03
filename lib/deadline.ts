/** Calendar date (YYYY-MM-DD) in Europe/Berlin for the given instant. */
function berlinDate(now: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

/** Whole days from today (Berlin time) until 1 Jan 2027. Negative once it has passed. */
export function daysUntilMandate(now: Date = new Date()): number {
  const [y, m, d] = berlinDate(now).split('-').map(Number)
  const today = Date.UTC(y, m - 1, d)
  const target = Date.UTC(2027, 0, 1)
  return Math.round((target - today) / 86_400_000)
}

const Y2025 = Date.UTC(2025, 0, 1)
const Y2027 = Date.UTC(2027, 0, 1)
const Y2028 = Date.UTC(2028, 0, 1)

/**
 * Position (0–1) of a moment on the 2025 → 2027 → 2028 timeline, where the three
 * milestones sit at equal spacing: 2025→2027 fills the first half, 2027→2028 the second.
 */
export function timelinePosition(time: number = Date.now()): number {
  if (time <= Y2025) return 0
  if (time <= Y2027) return ((time - Y2025) / (Y2027 - Y2025)) * 0.5
  if (time <= Y2028) return 0.5 + ((time - Y2027) / (Y2028 - Y2027)) * 0.5
  return 1
}
