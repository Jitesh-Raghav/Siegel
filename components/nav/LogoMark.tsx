// Siegel logo mark: a sealed document. An invoice sheet with a folded corner, and a mint
// scalloped seal with a check pressed onto its bottom-right corner: "this document is verified".
// Drawn on a 32×32 grid so it stays crisp down to 16px. scripts/make-icons.mjs reads the
// string literals below (one source of truth for the favicon, app icon, OG image and video).

export const MARK = {
  sheet: 'M7 3H18L25 10V26A2 2 0 0 1 23 28H7A2 2 0 0 1 5 26V5A2 2 0 0 1 7 3Z',
  fold: 'M18 3V8A2 2 0 0 0 20 10H25Z',
  lines: 'M9 13H19M9 17H16M9 21H12.5',
  seal: 'M23.60 16.60L24.99 17.51L26.64 17.29L27.50 18.71L29.07 19.24L29.23 20.89L30.42 22.04L29.85 23.60L30.42 25.16L29.23 26.31L29.07 27.96L27.50 28.49L26.64 29.91L24.99 29.69L23.60 30.60L22.21 29.69L20.56 29.91L19.70 28.49L18.13 27.96L17.97 26.31L16.78 25.16L17.35 23.60L16.78 22.04L17.97 20.89L18.13 19.24L19.70 18.71L20.56 17.29L22.21 17.51Z',
  ring: { cx: 23.6, cy: 23.6, r: 4.6 },
  check: 'M21.4 23.7L23 25.3L26 22.1',
}

const TONES = {
  // on light backgrounds: fir sheet, bone lines, fir rim around the seal
  light: { sheet: '#0F2A22', line: '#FAFBFA', mint: '#3FA77A', rim: '#0F2A22', mark: '#FAFBFA' },
  // on dark backgrounds: bone sheet, fir lines, midnight rim
  dark: { sheet: '#F2F6F3', line: '#0F2A22', mint: '#3FA77A', rim: '#0B1F19', mark: '#0B1F19' },
} as const

export type MarkTone = keyof typeof TONES

export function LogoMark({ size = 24, tone = 'light', className }: { size?: number; tone?: MarkTone; className?: string }) {
  const c = TONES[tone]
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <path d={MARK.sheet} fill={c.sheet} />
      <path d={MARK.fold} fill={c.mint} />
      <path d={MARK.lines} stroke={c.line} strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d={MARK.seal} fill={c.mint} stroke={c.rim} strokeWidth="1.3" strokeLinejoin="round" paintOrder="stroke" />
      <circle cx={MARK.ring.cx} cy={MARK.ring.cy} r={MARK.ring.r} fill="none" stroke={c.mark} strokeOpacity="0.55" strokeWidth="0.6" />
      <path d={MARK.check} fill="none" stroke={c.mark} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Standalone SVG source (favicon, video, OG) for a given tone. */
export function logoSvg(tone: MarkTone = 'light', size = 32) {
  const c = TONES[tone]
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">` +
    `<path d="${MARK.sheet}" fill="${c.sheet}"/><path d="${MARK.fold}" fill="${c.mint}"/>` +
    `<path d="${MARK.lines}" stroke="${c.line}" stroke-width="1.6" stroke-linecap="round" fill="none"/>` +
    `<path d="${MARK.seal}" fill="${c.mint}" stroke="${c.rim}" stroke-width="1.3" stroke-linejoin="round" paint-order="stroke"/>` +
    `<circle cx="${MARK.ring.cx}" cy="${MARK.ring.cy}" r="${MARK.ring.r}" fill="none" stroke="${c.mark}" stroke-opacity="0.55" stroke-width="0.6"/>` +
    `<path d="${MARK.check}" fill="none" stroke="${c.mark}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  )
}
