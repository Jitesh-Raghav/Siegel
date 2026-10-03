import { notFound } from 'next/navigation'
import { Hero } from '@/components/hero/Hero'
import { Audience } from '@/components/sections/Audience'
import { Deadline } from '@/components/sections/Deadline'
import { Faq } from '@/components/sections/Faq'
import { Features } from '@/components/sections/Features'
import { FinalCta } from '@/components/sections/FinalCta'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { Pricing } from '@/components/sections/Pricing'
import { getMessages, isLocale } from '@/lib/i18n'

// Re-render hourly so the server-rendered countdown stays current.
export const revalidate = 3600

export default async function Home({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getMessages(locale)

  return (
    <main>
      <Hero locale={locale} t={t} />
      <Deadline t={t.deadline} />
      <HowItWorks t={t.how} />
      <Features t={t.features} />
      <Audience t={t.audience} />
      <Pricing locale={locale} t={t.pricing} />
      <Faq t={t.faq} />
      <FinalCta locale={locale} t={t} />
    </main>
  )
}
