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

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
