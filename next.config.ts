import type { NextConfig } from 'next'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const posthogHost = process.env.POSTHOG_HOST ?? 'https://eu.i.posthog.com'
const posthogAssets = process.env.POSTHOG_ASSETS_HOST ?? 'https://eu-assets.i.posthog.com'

// Resolved once at build time: serverless functions can't see /public at runtime.
const hasHeroPoster = existsSync(join(process.cwd(), 'public', 'hero-engraved.webp'))
const hasHeroPosterDark = existsSync(join(process.cwd(), 'public', 'hero-engraved-dark.webp'))
const hasHeroSource = existsSync(join(process.cwd(), 'public', 'hero-source.jpg'))
const hasFounderPhoto = existsSync(join(process.cwd(), 'public', 'founder.jpg'))
// The sample card only renders when both files are present.
const hasSamples =
  existsSync(join(process.cwd(), 'public', 'samples', 'sample-zugferd.pdf')) &&
  existsSync(join(process.cwd(), 'public', 'samples', 'validation-report.html'))

const nextConfig: NextConfig = {
  env: {
    // Exposed so lib/i18n.ts can build absolute URLs on Vercel when NEXT_PUBLIC_SITE_URL is unset.
    VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL ?? '',
    NEXT_PUBLIC_HERO_POSTER: hasHeroPoster ? '1' : '',
    NEXT_PUBLIC_HERO_POSTER_DARK: hasHeroPosterDark ? '1' : '',
    NEXT_PUBLIC_HERO_SOURCE: hasHeroSource ? '1' : '',
    NEXT_PUBLIC_HAS_FOUNDER_PHOTO: hasFounderPhoto ? '1' : '',
    NEXT_PUBLIC_HAS_SAMPLES: hasSamples ? '1' : '',
  },
  // Required for PostHog's trailing-slash API endpoints behind the /ingest proxy.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      { source: '/ingest/static/:path*', destination: `${posthogAssets}/static/:path*` },
      { source: '/ingest/:path*', destination: `${posthogHost}/:path*` },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ]
  },
}

export default nextConfig
