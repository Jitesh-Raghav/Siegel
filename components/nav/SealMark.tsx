// A notched seal: scalloped outer edge, fine inner ring, engraved "S".
const NOTCHES = 28

function sealPath(cx: number, cy: number, outer: number, inner: number) {
  const pts: string[] = []
  for (let i = 0; i < NOTCHES * 2; i++) {
    const a = (i / (NOTCHES * 2)) * Math.PI * 2 - Math.PI / 2
    const r = i % 2 === 0 ? outer : inner
    pts.push(`${(cx + Math.cos(a) * r).toFixed(2)} ${(cy + Math.sin(a) * r).toFixed(2)}`)
  }
  return `M${pts.join('L')}Z`
}

export const SEAL_EDGE = sealPath(16, 16, 15.5, 14.2)
export const SEAL_S =
  'M20.1 11.3c-.9-1.2-2.3-1.9-4-1.9-2.4 0-4 1.3-4 3.2 0 1.8 1.3 2.6 3.7 3.2 2.1.5 2.9 1 2.9 2.1 0 1.2-1.1 2-2.8 2-1.8 0-3.1-.8-3.9-2.2l-1.1.8c1 1.7 2.8 2.7 5 2.7 2.6 0 4.3-1.4 4.3-3.4 0-1.9-1.3-2.7-3.8-3.3-2-.5-2.8-.9-2.8-1.9 0-1.1 1-1.9 2.6-1.9 1.4 0 2.4.6 3 1.5z'

export function SealMark({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <path d={SEAL_EDGE} fill="currentColor" />
      <circle cx="16" cy="16" r="11.6" fill="none" stroke="var(--paper)" strokeWidth="0.8" />
      <path d={SEAL_S} fill="var(--paper)" />
    </svg>
  )
}
