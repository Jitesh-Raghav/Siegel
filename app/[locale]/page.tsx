import { notFound } from 'next/navigation'
import { Hero } from '@/components/hero/Hero'
import { Audience } from '@/components/sections/Audience'
import { Deadline } from '@/components/sections/Deadline'
import { Faq } from '@/components/sections/Faq'
import { Features } from '@/components/sections/Features'
import { Film } from '@/components/sections/Film'
import { FinalCta } from '@/components/sections/FinalCta'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { Pricing } from '@/components/sections/Pricing'
import { Standards } from '@/components/sections/Standards'
import { Trust } from '@/components/sections/Trust'
import { BlueprintRails, SectionDivider } from '@/components/ui/Blueprint'
import { getMessages, isLocale } from '@/lib/i18n'

// Re-render hourly so the server-rendered countdown stays current.
export const revalidate = 3600

export default async function Home({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getMessages(locale)

  return (
    <main className="bp-main">
      <BlueprintRails />
      <Hero locale={locale} t={t} />
      <Standards t={t.standards} />
      <Film locale={locale} t={t.film} />
      <SectionDivider />
      <Deadline t={t.deadline} />
      <HowItWorks t={t.how} />
      <Features t={t.features} />
      <SectionDivider />
      <Audience t={t.audience} />
      <SectionDivider />
      <Pricing locale={locale} t={t.pricing} />
      <SectionDivider />
      <Trust t={t.trust} />
      <SectionDivider />
      <Faq t={t.faq} />
      <FinalCta locale={locale} t={t} />
    </main>
  )
}
