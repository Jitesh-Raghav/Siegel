'use client'

import { useId, useState, type FormEvent } from 'react'
import { track } from '@/lib/analytics'
import { localePath, type Locale } from '@/lib/i18n'
import { getAttribution } from '@/lib/utm'
import type { Messages } from '@/messages/en'

type Status = 'idle' | 'loading' | 'success' | 'already' | 'error' | 'rate_limited'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function WaitlistForm({
  locale,
  t,
  location,
  autoFocus = false,
}: {
  locale: Locale
  t: Messages['form']
  location: string
  autoFocus?: boolean
}) {
  const id = useId()
  const [status, setStatus] = useState<Status>('idle')
  const [emailError, setEmailError] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status === 'loading') return
    const data = new FormData(e.currentTarget)
    const email = String(data.get('email') ?? '').trim()
    if (!EMAIL_RE.test(email)) {
      setEmailError(true)
      return
    }
    setEmailError(false)

    const invoice_volume = String(data.get('invoice_volume') ?? '') || null
    const above_800k = String(data.get('above_800k') ?? '') || null
    const analyticsProps = { locale, location, invoice_volume, above_800k }
    track('waitlist_submit', analyticsProps)
    setStatus('loading')

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          company: String(data.get('company') ?? '').trim() || null,
          invoice_volume,
          above_800k,
          locale,
          website: String(data.get('website') ?? ''),
          ...getAttribution(),
        }),
      })
      const body = (await res.json().catch(() => ({}))) as { status?: string }
      if (res.ok && body.status === 'already') {
        setStatus('already')
        track('waitlist_success', { ...analyticsProps, already: true })
      } else if (res.ok) {
        setStatus('success')
        track('waitlist_success', { ...analyticsProps, already: false })
      } else {
        const next: Status = res.status === 429 ? 'rate_limited' : 'error'
        setStatus(next)
        track('waitlist_error', { ...analyticsProps, http_status: res.status })
      }
    } catch {
      setStatus('error')
      track('waitlist_error', { ...analyticsProps, http_status: 0 })
    }
  }

  if (status === 'success' || status === 'already') {
    return (
      <div role="status" className="flex items-start gap-3 border-t border-hairline pt-5">
        <SealCheck />
        <p className="text-[17px] leading-snug">{status === 'success' ? t.success : t.already}</p>
      </div>
    )
  }

  const loading = status === 'loading'

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5" aria-busy={loading}>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.email} htmlFor={`${id}-email`}>
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder={t.emailPlaceholder}
            autoFocus={autoFocus}
            aria-invalid={emailError || undefined}
            aria-describedby={emailError ? `${id}-email-error` : undefined}
            className="input"
          />
          {emailError && (
            <p id={`${id}-email-error`} className="mt-1.5 text-[13px] text-[#B42318]">
              {t.invalidEmail}
            </p>
          )}
        </Field>
        <Field label={t.company} optional={t.optional} htmlFor={`${id}-company`}>
          <input
            id={`${id}-company`}
            name="company"
            type="text"
            autoComplete="organization"
            maxLength={200}
            placeholder={t.companyPlaceholder}
            className="input"
          />
        </Field>
      </div>

      <Segmented name="invoice_volume" legend={t.volume} options={t.volumeOptions} optional={t.optional} />
      <Segmented name="above_800k" legend={t.turnover} options={t.turnoverOptions} optional={t.optional} />

      {/* Honeypot: hidden from people and assistive tech, tempting for bots. */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
        <label htmlFor={`${id}-website`}>{t.honeypot}</label>
        <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] leading-snug text-muted sm:max-w-[60%]">
          {t.privacy}{' '}
          <a href={localePath(locale, '/datenschutz')} className="underline underline-offset-2 hover:text-ink">
            {t.privacyLink}
          </a>
          .
        </p>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? t.submitting : t.submit}
        </button>
      </div>

      <p role="alert" aria-live="assertive" className="min-h-[1lh] text-[14px] text-[#B42318] empty:hidden">
        {status === 'error' ? t.error : status === 'rate_limited' ? t.rateLimited : ''}
      </p>
    </form>
  )
}

function Field({
  label,
  htmlFor,
  optional,
  children,
}: {
  label: string
  htmlFor: string
  optional?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label mb-2 flex items-baseline gap-2 text-ink">
        {label}
        {optional && <span className="font-normal normal-case tracking-normal text-muted">({optional})</span>}
      </label>
      {children}
    </div>
  )
}

function Segmented({
  name,
  legend,
  options,
  optional,
}: {
  name: string
  legend: string
  options: { value: string; label: string }[]
  optional: string
}) {
  return (
    <fieldset>
      <legend className="label mb-2 flex items-baseline gap-2 text-ink">
        {legend}
        <span className="font-normal normal-case tracking-normal text-muted">({optional})</span>
      </legend>
      <div className="segmented" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
        {options.map((o) => (
          <label key={o.value}>
            <input type="radio" name={name} value={o.value} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function SealCheck() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true" className="mt-0.5 shrink-0 text-verified">
      <circle cx="14" cy="14" r="12.5" fill="none" stroke="currentColor" strokeDasharray="2 2" />
      <circle cx="14" cy="14" r="9" fill="currentColor" />
      <path d="M10 14.2l2.6 2.6L18.2 11" fill="none" stroke="#fff" strokeWidth="1.6" />
    </svg>
  )
}
