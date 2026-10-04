import type { ReactNode } from 'react'
import { AccentTitle } from './AccentTitle'
import { reveal } from './reveal'

export function SectionHeader({
  id,
  eyebrow,
  title,
  accent,
  body,
  align = 'left',
  children,
}: {
  id: string
  eyebrow: string
  title: string
  accent?: string
  body?: string
  align?: 'left' | 'center'
  children?: ReactNode
}) {
  const center = align === 'center'
  return (
    <header className={center ? 'mx-auto max-w-[820px] text-center' : 'max-w-[820px]'}>
      <p className="eyebrow" {...reveal(0)}>
        {eyebrow}
      </p>
      <AccentTitle id={id} text={title} accent={accent} className="h2 mt-6" index={1} />
      {body && (
        <p className={`lede mt-6 max-w-[56ch] text-[18px] ${center ? 'mx-auto' : ''}`} {...reveal(3)}>
          {body}
        </p>
      )}
      {children}
    </header>
  )
}
