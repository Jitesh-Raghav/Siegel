import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal/LegalPage'
import { CONTACT_EMAIL } from '@/lib/contact'
import { isLocale } from '@/lib/i18n'
import { notFound } from 'next/navigation'

export const metadata: Metadata = { title: 'Impressum' }

export default async function Impressum({ params }: PageProps<'/[locale]/impressum'>) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return (
    <LegalPage
      locale={locale}
      title="Impressum"
      intro="Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz)."
      sections={[
        { heading: 'Anbieter', body: ['TODO: Vollständiger Name bzw. Firma', 'TODO: Ladungsfähige Anschrift (kein Postfach)'] },
        { heading: 'Kontakt', body: [`E-Mail: ${CONTACT_EMAIL}`, 'TODO: Telefonnummer oder anderer schneller Kontaktweg'] },
        { heading: 'Vertretungsberechtigt', body: ['TODO: Geschäftsführung / Inhaber (falls zutreffend)'] },
        { heading: 'Register', body: ['TODO: Registergericht und Registernummer (falls zutreffend)'] },
        { heading: 'Umsatzsteuer-ID', body: ['TODO: USt-IdNr. bzw. vergleichbare Steuerkennung (falls vorhanden)'] },
        { heading: 'Verantwortlich für den Inhalt', body: ['TODO: Name und Anschrift (§ 18 Abs. 2 MStV)'] },
        { heading: 'Hinweis', body: ['Siegel ist eine Software und bietet keine Steuerberatung.'] },
      ]}
    />
  )
}
