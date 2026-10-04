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
  num,
  children,
}: {
  id: string
  /** Section number, shown as "01 ── Eyebrow" */
  num?: number
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
      <Eyebrow num={num} {...reveal(0)}>
        {eyebrow}
      </Eyebrow>
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

/** Section eyebrow. With a number it reads "01 ── Label", the numbering YC-style sites use to give long pages a spine. */
export function Eyebrow({ num, children, ...rest }: { num?: number; children: ReactNode } & React.HTMLAttributes<HTMLParagraphElement>) {
  if (num === undefined) {
    return (
      <p className="eyebrow" {...rest}>
        {children}
      </p>
    )
  }
  return (
    <p className="eyebrow eyebrow-indexed" {...rest}>
      <span className="eyebrow-num tabular">{String(num).padStart(2, '0')}</span>
      <span className="eyebrow-dash" aria-hidden="true" />
      {children}
    </p>
  )
}
