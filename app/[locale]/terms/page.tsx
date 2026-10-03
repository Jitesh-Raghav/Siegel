import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal/LegalPage'
import { isLocale } from '@/lib/i18n'
import { notFound } from 'next/navigation'

export const metadata: Metadata = { title: 'AGB' }

export default async function Terms({ params }: PageProps<'/[locale]/terms'>) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return (
    <LegalPage
      locale={locale}
      title="Allgemeine Geschäftsbedingungen"
      sections={[
        { heading: 'Geltungsbereich', body: ['TODO: Allgemeine Geschäftsbedingungen für die Nutzung von Siegel.'] },
        { heading: 'Leistungen', body: ['TODO: Siegel ist eine Software, keine Steuerberatung.'] },
        { heading: 'Preise und Zahlung', body: ['TODO: Abrechnung über einen Merchant of Record.'] },
      ]}
    />
  )
}
