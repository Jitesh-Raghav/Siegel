const TICKS = 60
const r = (n: number) => Math.round(n * 1000) / 1000

// Precomputed and rounded so server and client markup match exactly.
const TICK_LINES = Array.from({ length: TICKS }, (_, i) => {
  const major = i % 5 === 0
  const a = (i / TICKS) * Math.PI * 2 - Math.PI / 2
  const r1 = major ? 70 : 72.5
  const r2 = 77
  return {
    major,
    x1: r(Math.cos(a) * r1),
    y1: r(Math.sin(a) * r1),
    x2: r(Math.cos(a) * r2),
    y2: r(Math.sin(a) * r2),
  }
})

/** Concentric dashed rings with an outer tick scale; an ink arc draws with `progress` (0–1). */
export function ValidationDial({
  progress,
  percent,
  label,
}: {
  progress: number
  percent: number
  label: string
}) {
  const lit = Math.round(progress * TICKS)
  return (
    <div className="relative aspect-square w-[120px] sm:w-[148px] lg:w-[164px]">
      <svg viewBox="0 0 160 160" className="absolute inset-0 size-full" aria-hidden="true">
        <g transform="translate(80 80)">
          {TICK_LINES.map((tk, i) => (
            <line
              key={i}
              x1={tk.x1}
              y1={tk.y1}
              x2={tk.x2}
              y2={tk.y2}
              stroke={i < lit ? 'var(--engrave-ink)' : '#CFCDC6'}
              strokeWidth={tk.major ? 1.1 : 0.8}
            />
          ))}
          <circle r="64" fill="none" stroke="#D9D7D0" strokeWidth="0.8" strokeDasharray="1 3" />
          <circle r="56" fill="none" stroke="var(--hairline)" strokeWidth="5" />
          <circle
            r="56"
            fill="none"
            stroke="var(--engrave-ink)"
            strokeWidth="5"
            strokeLinecap="butt"
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset={1 - progress}
            transform="rotate(-90)"
          />
          <circle r="47" fill="none" stroke="#D9D7D0" strokeWidth="0.8" strokeDasharray="2 3" />
        </g>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="tabular font-mono text-[19px] leading-none tracking-[-0.02em] sm:text-[24px]">
          {percent}%
        </span>
        <span className="mt-1.5 max-w-[56%] text-center leading-tight font-mono text-[8.5px] tracking-[0.04em] text-muted uppercase sm:text-[9.5px]">
          {label}
        </span>
      </div>
    </div>
  )
}
