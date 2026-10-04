// Engraved line field behind the hero: horizontal contours that bend around the invoice on the
// right, like the lines on a banknote around its portrait. Computed once (server-rendered SVG,
// rounded so server and client markup match); a slow compositor-only drift animates it.

const W = 1440
const H = 900
const LINES = 46
const CX = 1060 // bulge centre: where the invoice sits
const CY = 400
const r1 = (n: number) => Math.round(n * 10) / 10

function line(k: number) {
  const y0 = (k + 0.5) * (H / LINES)
  const pts: string[] = []
  for (let x = -40; x <= W + 40; x += 30) {
    const dx = (x - CX) / 330
    const dy = (y0 - CY) / 300
    const bump = Math.exp(-(dx * dx + dy * dy)) // contours swell around the invoice
    const side = y0 < CY ? -1 : 1
    const y = y0 + side * 46 * bump + Math.sin(x * 0.0045 + k * 0.42) * 5 * (1 - bump)
    pts.push(`${r1(x)} ${r1(y)}`)
  }
  return `M${pts.join('L')}`
}

const PATHS = Array.from({ length: LINES }, (_, k) => ({
  d: line(k),
  // lines passing close to the invoice are drawn in the accent colour
  near: Math.abs((k + 0.5) * (H / LINES) - CY) < 150,
}))

export function HeroLines() {
  return (
    <div className="hero-lines pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <svg className="hero-lines-svg absolute inset-0 h-full w-[110%]" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
        <g fill="none" vectorEffect="non-scaling-stroke">
          {PATHS.map((p, i) => (
            <path
              key={i}
              d={p.d}
              stroke={p.near ? 'var(--gold)' : 'var(--engrave-ink)'}
              strokeOpacity={p.near ? 0.22 : 0.07}
              strokeWidth={p.near ? 1.1 : 0.9}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>
      </svg>
    </div>
  )
}
