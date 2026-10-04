import { SEAL_EDGE, SEAL_S } from '@/components/nav/SealMark'

/** Gold embossed seal that "stamps" onto the invoice card once validation completes. */
export function SealStamp({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={`seal-stamp ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id="seal-foil" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8C6A3A" />
          <stop offset="0.32" stopColor="#E2C893" />
          <stop offset="0.52" stopColor="#A47E46" />
          <stop offset="0.72" stopColor="#F0DFB2" />
          <stop offset="1" stopColor="#9A7442" />
        </linearGradient>
        <path id="seal-text-path" d="M60 60 m-38 0 a38 38 0 1 1 76 0 a38 38 0 1 1 -76 0" />
        <filter id="seal-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#5e4520" floodOpacity="0.35" />
        </filter>
      </defs>
      <g filter="url(#seal-shadow)">
        <path d={SEAL_EDGE} transform="translate(2.5 2.5) scale(3.6)" fill="url(#seal-foil)" />
        <circle cx="60" cy="60" r="45" fill="none" stroke="#FFF6DD" strokeOpacity="0.7" strokeWidth="0.8" />
        <circle cx="60" cy="60" r="31" fill="none" stroke="#5E4520" strokeOpacity="0.5" strokeWidth="0.8" />
        <text fontFamily="var(--font-geist-mono), monospace" fontSize="7.4" letterSpacing="2.2" fill="#4A3618">
          <textPath href="#seal-text-path">GEPRÜFT · VALIDATED · EN 16931 ·</textPath>
        </text>
        <path d={SEAL_S} transform="translate(24 24) scale(2.25)" fill="#4A3618" />
      </g>
    </svg>
  )
}
