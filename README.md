# Siegel — marketing site

Next.js (App Router) landing page for Siegel, a Stripe app that turns Stripe invoices into validated
German e-invoices (ZUGFeRD / XRechnung). English at `/`, German at `/de`.

## Develop

```bash
npm install
cp .env.example .env.local   # optional: the site runs without any keys
npm run dev
```

| Command | What it does |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js |
| `npm run lint` / `typecheck` | ESLint (flat config) / `tsc --noEmit` |
| `npm run screenshots` | Full-page screenshots at 375/1280/1536 px (`BASE_URL`, `PATHS=/,/de`, `SHOT_DIR`, `SLICE=1400`) |
| `npm run export:hero` | Renders the fallback posters `public/hero-engraved.webp` and `public/hero-engraved-dark.webp` (needs `npm run dev` running) |
| `node scripts/render-audio.mjs && node scripts/render-video.mjs` | Synthesises the soundtrack, then renders the explainer films (EN/DE, 1080p, with sound) and posters |
| `node scripts/make-icons.mjs` | Regenerates favicon, `icon.svg` and the Apple icon from `components/nav/LogoMark.tsx` |
| `node scripts/subset-fonts.mjs` | Rebuilds the subset webfonts in `app/fonts/` (rerun if copy gains new characters) |

## Environment variables (Vercel)

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | yes | Public origin, e.g. `https://siegel.de`. Used for canonical, hreflang, sitemap, OG. Falls back to Vercel's `VERCEL_PROJECT_PRODUCTION_URL`, never localhost. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | yes | Shown in the footer, FAQ, trust section and legal pages. |
| `SUPABASE_URL` | yes, for the waitlist | EU-region project. |
| `SUPABASE_SERVICE_ROLE_KEY` | yes, for the waitlist | Server-only. Never expose to the client. |
| `NEXT_PUBLIC_POSTHOG_KEY` | optional | Empty = analytics off. |
| `POSTHOG_HOST` / `POSTHOG_ASSETS_HOST` | optional | Default to PostHog EU cloud. |

Without Supabase keys the waitlist API accepts signups in development (logged, not stored) and returns
`503` in production, so the form shows its error state rather than silently dropping entries.

Run `supabase/migrations/0001_waitlist.sql` once in the Supabase SQL editor.

## Hero image

`public/hero-source.jpg` is a CC0 photo of Hamburg's Speicherstadt by Meduana (via Wikimedia Commons);
see `CREDITS.md`. The WebGL shader turns it into a line engraving: navy on ivory in the hero, and a
gold "white-line" engraving on midnight in the final call-to-action. Auto-levels adapt to any photo.

To swap the photo: replace the file with another CC0 / public-domain / self-made image, update
`CREDITS.md`, run `npm run dev` then `npm run export:hero`, and rebuild (`next.config.ts` checks for
the files at build time). Without a photo, a procedural placeholder scene is used.

The posters are only downloaded by visitors without JS or without WebGL; everyone else gets the live
WebGL engraving, which renders in a Web Worker (OffscreenCanvas) so it never blocks the main thread.

## Founder section

- Copy (name, role, bio, highlights, LinkedIn/GitHub/X/portfolio): `trust` in `messages/en.ts` and `messages/de.ts`.
- Photo: `public/founder.jpg` (shown as a fir/mint duotone, full colour on hover).
- Samples: add `public/samples/sample-zugferd.pdf` **and** `public/samples/validation-report.html`. The
  "Download a sample" card only appears when both exist at build time.

## Language routing

English lives at `/`, German at `/de`. Browsers whose `Accept-Language` starts with `de` are sent to
`/de` on their first visit (no cookies). The language switcher's English link carries `?lang=en`, which
stops the redirect; the parameter is removed from the address bar afterwards.

## Notes

- `messages/de.ts` is marked **NEEDS NATIVE REVIEW**. Have a native speaker check it before sharing `/de`.
- `/impressum`, `/datenschutz` and `/terms` contain clearly marked TODO placeholders. Fill them in
  (and replace `CONTACT_EMAIL` in `components/sections/Footer.tsx`) before launch.
- Fonts: Instrument Serif (display, regular + italic) and Geist Sans/Mono, all SIL Open Font License 1.1;
  the files in `app/fonts/` are subsets built by `scripts/subset-fonts.mjs`.
- Analytics are cookieless (in-memory persistence, proxied via `/ingest`). Never send emails or other
  personal data to PostHog; `lib/analytics.ts` is the only entry point.
- The rate limiter is in-memory per server instance. Move it to Upstash/Redis if abuse appears.
