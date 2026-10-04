import { memo } from 'react'

const TICKS = 60
const r = (n: number) => Math.round(n * 1000) / 1000

// Tick scale as two path strings (major / minor), precomputed and rounded so server and client
// markup match exactly. Two paths instead of 60 <line> elements keeps the DOM small.
function tickPath(major: boolean) {
  let d = ''
  for (let i = 0; i < TICKS; i++) {
    if ((i % 5 === 0) !== major) continue
    const a = (i / TICKS) * Math.PI * 2 - Math.PI / 2
    const r1 = major ? 69 : 72
    d += `M${r(Math.cos(a) * r1)} ${r(Math.sin(a) * r1)}L${r(Math.cos(a) * 77)} ${r(Math.sin(a) * 77)}`
  }
  return d
}
const MAJOR = tickPath(true)
const MINOR = tickPath(false)

function Ticks({ lit }: { lit: boolean }) {
  return (
    <g fill="none" strokeLinecap="round">
      <path d={MINOR} stroke={lit ? '#17382D' : '#CDC6B1'} strokeWidth="0.8" />
      <path d={MAJOR} stroke={lit ? '#B4894A' : '#CDC6B1'} strokeWidth="1.3" />
    </g>
  )
}

/**
 * Engraved validation dial: tick scale, dashed rings and a navy→gold arc.
 * Progress comes from the CSS variable --dial (0–1) on an ancestor, so animating it never
 * re-renders React. The percentage text is written by the parent through `percentRef`.
 */
export const ValidationDial = memo(function ValidationDial({
  label,
  percentRef,
}: {
  label: string
  percentRef: React.Ref<HTMLSpanElement>
}) {
  return (
    <div className="relative aspect-square w-[124px] sm:w-[156px] lg:w-[172px]">
      <svg viewBox="0 0 160 160" className="absolute inset-0 size-full" aria-hidden="true">
        <defs>
          <linearGradient id="dial-arc" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#17382D" />
            <stop offset="0.65" stopColor="#2C5A48" />
            <stop offset="1" stopColor="#B4894A" />
          </linearGradient>
          <radialGradient id="dial-face" cx="0.5" cy="0.4" r="0.6">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#F1EDE2" />
          </radialGradient>
        </defs>
        <g transform="translate(80 80)">
          <circle r="62" fill="url(#dial-face)" />
          <Ticks lit={false} />
          <circle r="64.5" fill="none" stroke="#CDC6B1" strokeWidth="0.6" strokeDasharray="0.6 2.4" />
          <circle r="55" fill="none" stroke="#E3DDCB" strokeWidth="6" />
          <circle
            r="55"
            fill="none"
            stroke="url(#dial-arc)"
            strokeWidth="6"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="1"
            transform="rotate(-90)"
            style={{ strokeDashoffset: 'calc(1 - var(--dial, 1))', opacity: 'min(1, calc(var(--dial, 1) * 300))' }}
          />
          <circle r="45.5" fill="none" stroke="#CDC6B1" strokeWidth="0.6" strokeDasharray="2 2.5" />
        </g>
      </svg>
      {/* Lit ticks, revealed clockwise by a conic mask driven by --dial */}
      <svg
        viewBox="0 0 160 160"
        className="absolute inset-0 size-full"
        aria-hidden="true"
        style={{
          WebkitMaskImage: 'conic-gradient(#000 calc(var(--dial, 1) * 360deg), transparent 0)',
          maskImage: 'conic-gradient(#000 calc(var(--dial, 1) * 360deg), transparent 0)',
        }}
      >
        <g transform="translate(80 80)">
          <Ticks lit />
        </g>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="tabular font-serif text-[30px] leading-none tracking-[-0.02em] sm:text-[38px]">
          <span ref={percentRef}>100</span>%
        </span>
        <span className="mt-1 max-w-[56%] text-center font-mono text-[8px] leading-tight tracking-[0.12em] text-muted uppercase sm:text-[9px]">
          {label}
        </span>
      </div>
    </div>
  )
})
