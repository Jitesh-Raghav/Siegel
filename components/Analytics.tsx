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

  // FAQ items are server-rendered <details>; 'toggle' doesn't bubble, so listen in the capture phase.
  useEffect(() => {
    const onToggle = (e: Event) => {
      const el = e.target as HTMLDetailsElement
      if (el.open && el.dataset.faq) track('faq_open', { id: el.dataset.faq })
    }
    document.addEventListener('toggle', onToggle, true)
    return () => document.removeEventListener('toggle', onToggle, true)
  }, [])

  // One delegated listener drives every .spotlight surface (--mx / --my follow the pointer).
  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return
    let frame = 0
    let target: HTMLElement | null = null
    let x = 0
    let y = 0
    const onMove = (e: PointerEvent) => {
      target = (e.target as Element | null)?.closest?.('.spotlight') as HTMLElement | null
      if (!target) return
      x = e.clientX
      y = e.clientY
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        if (!target) return
        const r = target.getBoundingClientRect()
        target.style.setProperty('--mx', `${x - r.left}px`)
        target.style.setProperty('--my', `${y - r.top}px`)
      })
    }
    document.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      document.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(frame)
    }
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
