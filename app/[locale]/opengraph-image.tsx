import { ImageResponse } from 'next/og'
import { SEAL_EDGE, SEAL_S } from '@/components/nav/SealMark'
import { getMessages, isLocale } from '@/lib/i18n'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Siegel — validated German e-invoices for Stripe'

async function loadSerif(): Promise<ArrayBuffer | null> {
  try {
    // Without a browser UA, Google Fonts serves TrueType, which the OG renderer accepts.
    const css = await (await fetch('https://fonts.googleapis.com/css2?family=Newsreader:opsz@72&display=swap')).text()
    const url = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/)?.[1]
    return url ? await (await fetch(url)).arrayBuffer() : null
  } catch {
    return null
  }
}

export default async function OgImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = getMessages(isLocale(locale) ? locale : 'en')
  const serif = await loadSerif()
  const [a, b] = [t.hero.h1a, t.hero.h1b]

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          background: '#FBFBF8',
          padding: '64px 72px 176px',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <svg width="48" height="48" viewBox="0 0 32 32">
            <path d={SEAL_EDGE} fill="#0E0E0E" />
            <circle cx="16" cy="16" r="11.6" fill="none" stroke="#FBFBF8" strokeWidth="0.8" />
            <path d={SEAL_S} fill="#FBFBF8" />
          </svg>
          <span style={{ fontSize: 40, fontFamily: serif ? 'Newsreader' : 'serif', letterSpacing: '-0.02em' }}>Siegel</span>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: 56,
            marginTop: 'auto',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            color: '#0E0E0E',
            fontFamily: serif ? 'Newsreader' : 'serif',
          }}
        >
          <span>{a}</span>
          <span style={{ whiteSpace: 'nowrap' }}>{b}</span>
        </div>
        {/* Engraved band: hairlines thickening toward the bottom edge */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 120, display: 'flex', flexDirection: 'column' }}>
          {Array.from({ length: 30 }, (_, i) => (
            <div
              key={i}
              style={{ height: 4, display: 'flex', alignItems: 'center' }}
            >
              <div style={{ width: '100%', height: 0.6 + (i / 29) * 2.6, background: '#1F3A7A', opacity: 0.25 + (i / 29) * 0.75 }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', marginTop: 28, fontSize: 20, color: '#1F3A7A', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          ZUGFeRD · XRechnung · EN 16931
        </div>
      </div>
    ),
    { ...size, fonts: serif ? [{ name: 'Newsreader', data: serif, style: 'normal', weight: 400 }] : undefined },
  )
}
