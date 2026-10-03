import { notFound } from 'next/navigation'
import { HeroExport } from './HeroExport'

// Dev-only: renders the final engraving frame so scripts/export-hero.mjs can save it as a PNG.
export default function HeroExportPage() {
  if (process.env.NODE_ENV === 'production') notFound()
  return <HeroExport />
}
