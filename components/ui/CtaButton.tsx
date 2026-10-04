'use client'

import type { ReactNode } from 'react'
import { track } from '@/lib/analytics'
import { useWaitlist } from '@/components/waitlist/WaitlistProvider'

export function Arrow() {
  return (
    <svg className="btn-arrow" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M1 7h11M8 3l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * Opens the waitlist modal. Without JS it is a plain link to the inline form (#join).
 */
export function CtaButton({
  location,
  children,
  variant = 'primary',
  size,
  arrow = true,
  attract = false,
  pulse = false,
  className = '',
}: {
  location: string
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'gold'
  size?: 'sm'
  arrow?: boolean
  /** Occasional gold sheen and arrow nudge, to draw the eye. */
  attract?: boolean
  /** Soft expanding gold ring (primary variant only). */
  pulse?: boolean
  className?: string
}) {
  const { open } = useWaitlist()
  const link = (
    <a
      href="#join"
      className={`btn btn-${variant} ${size ? `btn-${size}` : ''} ${attract ? 'btn-attract' : ''} ${className}`}
      onClick={(e) => {
        e.preventDefault()
        track('cta_click', { location })
        open(location)
      }}
    >
      {children}
      {arrow && <Arrow />}
    </a>
  )
  // The pulse ring lives on a wrapper: the button itself clips its sheen with overflow: hidden.
  return pulse ? <span className="btn-pulse w-full sm:w-auto [&>a]:w-full">{link}</span> : link
}
