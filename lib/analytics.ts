'use client'

import type { PostHog } from 'posthog-js'

type Props = Record<string, string | number | boolean | null | undefined>

let client: PostHog | null = null
let loading = false
const queue: Array<[string, Props | undefined]> = []

/** Cookieless PostHog: in-memory persistence, proxied through /ingest. No-op without a key. */
export function initAnalytics() {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!key || client || loading || typeof window === 'undefined') return
  loading = true
  const start = () => import('posthog-js').then(({ default: posthog }) => {
    posthog.init(key, {
      api_host: '/ingest',
      ui_host: 'https://eu.posthog.com',
      persistence: 'memory',
      autocapture: false,
      capture_pageview: true,
      capture_pageleave: true,
      disable_session_recording: true,
      disable_surveys: true,
      person_profiles: 'identified_only',
      mask_all_text: true,
      mask_all_element_attributes: true,
      // Skip PostHog's extra auto-loaded scripts; we only send our own events.
      capture_dead_clicks: false,
      capture_performance: false,
      capture_heatmaps: false,
      capture_exceptions: false,
      disable_web_experiments: true,
    })
    client = posthog
    for (const [event, props] of queue.splice(0)) posthog.capture(event, props)
  })
  // Start on the first interaction (or after 6s), so analytics never competes with page load.
  // Events tracked before then are queued and sent once PostHog is ready.
  const kick = () => {
    window.clearTimeout(timer)
    for (const e of TRIGGERS) window.removeEventListener(e, kick)
    start()
  }
  const TRIGGERS = ['pointerdown', 'keydown', 'scroll', 'touchstart'] as const
  for (const e of TRIGGERS) window.addEventListener(e, kick, { once: true, passive: true })
  const timer = window.setTimeout(kick, 6000)
}

/** Never pass emails, company names or any other personal data here. */
export function track(event: string, props?: Props) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return
  if (client) client.capture(event, props)
  else queue.push([event, props])
}
