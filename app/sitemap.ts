import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/i18n'

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ['', '/impressum', '/datenschutz', '/terms']
  return pages.map((p) => ({
    url: `${siteUrl}${p || '/'}`,
    changeFrequency: 'weekly',
    priority: p ? 0.3 : 1,
    alternates: { languages: { en: `${siteUrl}${p || '/'}`, de: `${siteUrl}/de${p}` } },
  }))
}
