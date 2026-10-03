'use client'

const KEY = 'siegel:attribution'

export type Attribution = {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  referrer?: string
}

/** Remember first-touch UTM parameters and referrer for this tab session. */
export function captureAttribution() {
  try {
    if (sessionStorage.getItem(KEY)) return
    const params = new URLSearchParams(window.location.search)
    const data: Attribution = {}
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign'] as const) {
      const v = params.get(k)
      if (v) data[k] = v.slice(0, 200)
    }
    if (document.referrer && !document.referrer.startsWith(window.location.origin)) {
      data.referrer = document.referrer.slice(0, 500)
    }
    sessionStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    // Storage can be unavailable (private mode); attribution is best-effort.
  }
}

export function getAttribution(): Attribution {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? '{}') as Attribution
  } catch {
    return {}
  }
}
