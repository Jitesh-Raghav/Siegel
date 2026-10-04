// Renders the final engraving frames and saves the posters used when WebGL is unavailable:
//   public/hero-engraved.webp       (hero banner, light palette)
//   public/hero-engraved-dark.webp  (final CTA strip, dark palette)
// Run with the dev server up: npm run dev, then npm run export:hero
// Rebuild afterwards so the posters are picked up (next.config.ts checks for the files).
import { writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'

const base = process.env.BASE_URL ?? 'http://localhost:3000'
const browser = await chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
})

const jobs = [
  { palette: 'light', out: 'public/hero-engraved.webp', viewport: { width: 1200, height: 480 } },
  { palette: 'dark', out: 'public/hero-engraved-dark.webp', viewport: { width: 1200, height: 240 } },
]

for (const job of jobs) {
  const page = await browser.newPage({ viewport: job.viewport, deviceScaleFactor: Number(process.env.EXPORT_DPR ?? 1.25) })
  page.on('console', (m) => m.type() === 'error' && console.error('[page]', m.text()))
  page.on('pageerror', (e) => console.error('[page]', e.message))
  await page.goto(`${base}/dev/hero-export?palette=${job.palette}`, { waitUntil: 'networkidle' })
  await page.waitForFunction(() => window.__heroReady === true, null, { timeout: 30_000 })
  const dataUrl = await page.evaluate(() => document.getElementById('hero-export').toDataURL('image/webp', 0.86))
  writeFileSync(job.out, Buffer.from(dataUrl.split(',')[1], 'base64'))
  console.log(`Saved ${job.out}`)
  await page.close()
}

await browser.close()
