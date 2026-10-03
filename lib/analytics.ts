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
  import('posthog-js').then(({ default: posthog }) => {
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
    })
    client = posthog
    for (const [event, props] of queue.splice(0)) posthog.capture(event, props)
  })
}

/** Never pass emails, company names or any other personal data here. */
export function track(event: string, props?: Props) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return
  if (client) client.capture(event, props)
  else queue.push([event, props])
}
