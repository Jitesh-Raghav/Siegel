import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal/LegalPage'
import { CONTACT_EMAIL } from '@/lib/contact'
import { isLocale } from '@/lib/i18n'
import { notFound } from 'next/navigation'

export const metadata: Metadata = { title: 'Datenschutz' }

export default async function Datenschutz({ params }: PageProps<'/[locale]/datenschutz'>) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return (
    <LegalPage
      locale={locale}
      title="Datenschutzerklärung"
      sections={[
        { heading: '1. Verantwortlicher', body: ['TODO: Name und Anschrift des Verantwortlichen.', `Kontakt: ${CONTACT_EMAIL}`] },
        {
          heading: '2. Warteliste',
          body: [
            'Wenn Sie sich für den Frühzugang eintragen, verarbeiten wir Ihre E-Mail-Adresse sowie freiwillige Angaben (Unternehmen, Rechnungsvolumen, Umsatzschwelle), um Sie zu Siegel zu kontaktieren.',
            'TODO: Rechtsgrundlage (z. B. Art. 6 Abs. 1 lit. a oder f DSGVO), Speicherdauer und Löschung.',
            'TODO: Auftragsverarbeiter: Supabase (Region EU), Hosting: Vercel.',
          ],
        },
        {
          heading: '3. Reichweitenmessung',
          body: [
            'Wir nutzen PostHog (EU-Cloud) ohne Cookies und ohne lokale Speicherung. Personenbezogene Angaben aus Formularen werden nicht an PostHog übertragen.',
            'TODO: Rechtsgrundlage, IP-Verarbeitung, Speicherdauer.',
          ],
        },
        { heading: '4. Server-Logs', body: ['TODO: Hosting-Anbieter, verarbeitete Daten, Speicherdauer.'] },
        { heading: '5. Ihre Rechte', body: ['TODO: Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerspruch, Beschwerderecht bei einer Aufsichtsbehörde.'] },
      ]}
    />
  )
}
