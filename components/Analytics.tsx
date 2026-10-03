'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { initAnalytics, track } from '@/lib/analytics'
import { captureAttribution } from '@/lib/utm'

declare global {
  interface Window {
    __siegelReveal?: boolean
  }
}

/**
 * Mounts once per page: starts analytics, drives [data-reveal] entrances and
 * reports section_view for every <section data-section="…">.
 */
export function Analytics() {
  const pathname = usePathname()

  useEffect(() => {
    captureAttribution()
    initAnalytics()
  }, [])

  useEffect(() => {
    window.__siegelReveal = true
    const root = document.documentElement
    if (!root.classList.contains('js')) return

    const reveal = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('in')
          reveal.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.01 },
    )
    document.querySelectorAll('[data-reveal]:not(.in)').forEach((el) => reveal.observe(el))

    const seen = new Set<string>()
    const sections = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.section
          if (!entry.isIntersecting || !id || seen.has(id)) continue
          seen.add(id)
          track('section_view', { section: id, locale: root.lang })
        }
      },
      { threshold: 0.35 },
    )
    document.querySelectorAll('[data-section]').forEach((el) => sections.observe(el))

    return () => {
      reveal.disconnect()
      sections.disconnect()
    }
  }, [pathname])

  return null
}
