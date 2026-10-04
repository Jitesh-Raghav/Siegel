import { de } from '@/messages/de'
import { en, type Messages } from '@/messages/en'

export const locales = ['en', 'de'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

export function getMessages(locale: Locale): Messages {
  return locale === 'de' ? de : en
}

/** Public URL path for a locale: English lives at the root, German under /de. */
export function localePath(locale: Locale, path = '/'): string {
  const clean = path === '/' ? '' : path
  if (locale === 'de') return `/de${clean}`
  return clean || '/'
}

/** Public origin for canonical/OG/hreflang URLs. Never localhost: explicit env, then Vercel's production domain. */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://siegel.example')
).replace(/\/$/, '')
