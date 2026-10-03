import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { rateLimit } from '@/lib/rateLimit'

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((v) => v || null)

const Body = z.object({
  email: z.string().trim().toLowerCase().max(254).email(),
  company: optionalText(200),
  invoice_volume: z.enum(['<20', '20-100', '100-500', '500+']).nullish(),
  above_800k: z.enum(['yes', 'no', 'unsure']).nullish(),
  locale: z.enum(['en', 'de']).default('en'),
  utm_source: optionalText(200),
  utm_medium: optionalText(200),
  utm_campaign: optionalText(200),
  referrer: optionalText(500),
  website: z.string().optional(), // honeypot
})

function clientIp(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
}

export async function POST(req: NextRequest) {
  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ status: 'invalid' }, { status: 400 })
  }

  const parsed = Body.safeParse(json)
  if (!parsed.success) return NextResponse.json({ status: 'invalid' }, { status: 400 })
  const { website, ...data } = parsed.data

  // Bots fill the hidden field. Pretend it worked and store nothing.
  if (website) return NextResponse.json({ status: 'ok' })

  if (!rateLimit(clientIp(req))) return NextResponse.json({ status: 'rate_limited' }, { status: 429 })

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    if (process.env.NODE_ENV !== 'production') {
      console.info('[waitlist] Supabase not configured; dev signup accepted:', { ...data, email: '<redacted>' })
      return NextResponse.json({ status: 'ok' })
    }
    console.error('[waitlist] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing')
    return NextResponse.json({ status: 'unavailable' }, { status: 503 })
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } })
  const { error } = await supabase.from('waitlist').insert({
    email: data.email,
    company: data.company,
    invoice_volume: data.invoice_volume ?? null,
    above_800k: data.above_800k ?? null,
    locale: data.locale,
    utm_source: data.utm_source,
    utm_medium: data.utm_medium,
    utm_campaign: data.utm_campaign,
    referrer: data.referrer,
  })

  if (error) {
    if (error.code === '23505') return NextResponse.json({ status: 'already' })
    console.error('[waitlist] insert failed:', error.code, error.message)
    return NextResponse.json({ status: 'error' }, { status: 500 })
  }

  return NextResponse.json({ status: 'ok' })
}
