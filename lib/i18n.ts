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

/**
 * Public origin for canonical/OG/hreflang URLs: the production domain. NEXT_PUBLIC_SITE_URL can
 * override it (e.g. for a staging deploy), but *.vercel.app, placeholder (*.example) and localhost
 * values are ignored, so a stray env value can never leak into canonical links.
 */
const envSite = process.env.NEXT_PUBLIC_SITE_URL ?? ''
export const siteUrl = (envSite && !/\.vercel\.app|\.example\b|localhost/.test(envSite) ? envSite : 'https://www.siegel.live').replace(/\/$/, '')
