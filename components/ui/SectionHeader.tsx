import { reveal } from './reveal'

export function SectionHeader({
  id,
  eyebrow,
  title,
  align = 'left',
  children,
}: {
  id: string
  eyebrow: string
  title: string
  align?: 'left' | 'center'
  children?: React.ReactNode
}) {
  return (
    <header className={align === 'center' ? 'mx-auto max-w-[760px] text-center' : 'max-w-[760px]'}>
      <p className="label text-muted" {...reveal(0)}>
        {eyebrow}
      </p>
      <h2 id={id} className="h2 mt-4" {...reveal(1)}>
        {title}
      </h2>
      {children}
    </header>
  )
}
