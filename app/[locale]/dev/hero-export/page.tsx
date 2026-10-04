import { notFound } from 'next/navigation'
import { HeroExport } from './HeroExport'

// Dev-only: renders the final engraving frame so scripts/export-hero.mjs can save it as a PNG.
export default async function HeroExportPage({ searchParams }: PageProps<'/[locale]/dev/hero-export'>) {
  if (process.env.NODE_ENV === 'production') notFound()
  const { palette } = await searchParams
  return <HeroExport variant={palette === 'dark' ? 'dark' : 'light'} />
}
