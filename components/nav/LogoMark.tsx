// Siegel logo mark: an invoice sheet whose top-right corner is folded over. The fold's
// brass underside shows a few data dots — the machine-readable layer beneath the paper.
// Drawn on a 32×32 grid so it stays crisp down to 16px.

export const MARK = {
  sheet: 'M8 3H19L26 10V27A2 2 0 0 1 24 29H8A2 2 0 0 1 6 27V5A2 2 0 0 1 8 3Z',
  fold: 'M19 3V8A2 2 0 0 0 21 10H26Z',
  lines: ['M10 15H22', 'M10 19H20'],
  lastLine: 'M10 23H15',
  cell: { x: 17, y: 21.6, w: 5, h: 2.8, r: 0.8 },
  dots: [
    [20.9, 6.3],
    [20.9, 8.3],
    [22.9, 8.3],
  ] as const,
}

const TONES = {
  // on light backgrounds: fir sheet, bone lines
  light: { sheet: '#0F2A22', line: '#F3F0E6', brass: '#C79B57', dot: '#0F2A22' },
  // on dark backgrounds: bone sheet, fir lines
  dark: { sheet: '#F1EDE2', line: '#0F2A22', brass: '#C79B57', dot: '#0F2A22' },
} as const

export function LogoMark({
  size = 24,
  tone = 'light',
  className,
}: {
  size?: number
  tone?: keyof typeof TONES
  className?: string
}) {
  const c = TONES[tone]
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <path d={MARK.sheet} fill={c.sheet} />
      <path d={MARK.fold} fill={c.brass} />
      {MARK.dots.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="0.7" fill={c.dot} />
      ))}
      <g stroke={c.line} strokeWidth="1.6" strokeLinecap="round" fill="none">
        {MARK.lines.map((d) => (
          <path key={d} d={d} />
        ))}
        <path d={MARK.lastLine} />
      </g>
      <rect x={MARK.cell.x} y={MARK.cell.y} width={MARK.cell.w} height={MARK.cell.h} rx={MARK.cell.r} fill={c.brass} />
    </svg>
  )
}

/** Standalone SVG source (favicon, video, OG) for a given tone. */
export function logoSvg(tone: keyof typeof TONES = 'light', size = 32) {
  const c = TONES[tone]
  const dots = MARK.dots.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="0.7" fill="${c.dot}"/>`).join('')
  const lines = [...MARK.lines, MARK.lastLine].map((d) => `<path d="${d}"/>`).join('')
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">` +
    `<path d="${MARK.sheet}" fill="${c.sheet}"/><path d="${MARK.fold}" fill="${c.brass}"/>${dots}` +
    `<g stroke="${c.line}" stroke-width="1.6" stroke-linecap="round" fill="none">${lines}</g>` +
    `<rect x="${MARK.cell.x}" y="${MARK.cell.y}" width="${MARK.cell.w}" height="${MARK.cell.h}" rx="${MARK.cell.r}" fill="${c.brass}"/></svg>`
  )
}
