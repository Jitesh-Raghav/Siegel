'use client'

import type { ReactNode } from 'react'
import { track } from '@/lib/analytics'
import { useWaitlist } from '@/components/waitlist/WaitlistProvider'

/**
 * Opens the waitlist modal. Without JS it is a plain link to the inline form (#join).
 */
export function CtaButton({
  location,
  children,
  variant = 'primary',
  className = '',
}: {
  location: string
  children: ReactNode
  variant?: 'primary' | 'secondary'
  className?: string
}) {
  const { open } = useWaitlist()
  return (
    <a
      href="#join"
      className={`btn btn-${variant} ${className}`}
      onClick={(e) => {
        e.preventDefault()
        track('cta_click', { location })
        open(location)
      }}
    >
      {children}
    </a>
  )
}
