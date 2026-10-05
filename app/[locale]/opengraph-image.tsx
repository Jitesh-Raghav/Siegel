import { ImageResponse } from 'next/og'
import { MARK } from '@/components/nav/LogoMark'
import { getMessages, isLocale } from '@/lib/i18n'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Siegel · validated German e-invoices for Stripe'

async function loadSerif(): Promise<ArrayBuffer | null> {
  try {
    // Without a browser UA, Google Fonts serves TrueType, which the OG renderer accepts.
    const css = await (await fetch('https://fonts.googleapis.com/css2?family=Instrument+Serif&display=swap')).text()
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
  const [a, b] = [t.hero.h1a, t.hero.h1b.replace(/⁠/g, '')]

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          background: '#FAFBF7',
          padding: '64px 72px 176px',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <svg width="52" height="52" viewBox="0 0 32 32">
            <path d={MARK.sheet} fill="#13291A" />
            <path d={MARK.fold} fill="#5F9A3E" />
            <path d={MARK.lines} stroke="#FAFBF7" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            {/* rim then fill: the same look as paint-order="stroke", which the OG renderer lacks */}
            <path d={MARK.seal} fill="#13291A" stroke="#13291A" strokeWidth="1.3" strokeLinejoin="round" />
            <path d={MARK.seal} fill="#5F9A3E" />
            <circle cx={MARK.ring.cx} cy={MARK.ring.cy} r={MARK.ring.r} fill="none" stroke="#FAFBF7" strokeOpacity="0.55" strokeWidth="0.6" />
            <path d={MARK.check} fill="none" stroke="#FAFBF7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontSize: 40, fontFamily: serif ? 'Instrument Serif' : 'serif', letterSpacing: '-0.02em' }}>Siegel</span>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: 72,
            marginTop: 'auto',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            color: '#13291A',
            fontFamily: serif ? 'Instrument Serif' : 'serif',
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
              <div style={{ width: '100%', height: 0.6 + (i / 29) * 2.6, background: '#1D3A21', opacity: 0.25 + (i / 29) * 0.75 }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', marginTop: 28, fontSize: 20, color: '#3A6B26', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          ZUGFeRD · XRechnung · EN 16931
        </div>
      </div>
    ),
    { ...size, fonts: serif ? [{ name: 'Instrument Serif', data: serif, style: 'normal', weight: 400 }] : undefined },
  )
}
