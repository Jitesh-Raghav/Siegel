import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import { Analytics } from '@/components/Analytics'
import { Footer } from '@/components/sections/Footer'
import { Nav } from '@/components/nav/Nav'
import { WaitlistProvider } from '@/components/waitlist/WaitlistProvider'
import { fontVariables } from '@/lib/fonts'
import { getMessages, isLocale, localePath, locales, siteUrl } from '@/lib/i18n'
import '../globals.css'

export const dynamicParams = false

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export const viewport: Viewport = {
  themeColor: '#FAFBFA',
  colorScheme: 'light',
}

export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const t = getMessages(locale)
  return {
    metadataBase: new URL(siteUrl),
    title: { default: t.meta.title, template: '%s · Siegel' },
    description: t.meta.description,
    applicationName: 'Siegel',
    alternates: {
      canonical: localePath(locale),
      languages: { en: '/', de: '/de', 'x-default': '/' },
    },
    openGraph: {
      type: 'website',
      siteName: 'Siegel',
      locale: locale === 'de' ? 'de_DE' : 'en_GB',
      alternateLocale: locale === 'de' ? ['en_GB'] : ['de_DE'],
      title: t.meta.title,
      description: t.meta.description,
      url: localePath(locale),
    },
    twitter: { card: 'summary_large_image', title: t.meta.title, description: t.meta.description },
  }
}

// Adds the "js" class before first paint so reveal states only apply when JS runs.
// If the reveal observer hasn't started within 1.5s (e.g. hydration failed), reveal everything.
const bootScript = `(function(){var d=document.documentElement;d.classList.add('js');setTimeout(function(){if(window.__siegelReveal)return;d.classList.remove('js');},1500);})();`

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getMessages(locale)

  return (
    <html lang={locale} className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body id="top">
        <WaitlistProvider locale={locale} t={t.form}>
          <Nav locale={locale} t={t.nav} />
          {children}
          <Footer locale={locale} t={t} />
        </WaitlistProvider>
        <Analytics />
      </body>
    </html>
  )
}
