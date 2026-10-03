// Renders the final engraving frame and saves it as /public/hero-engraved.png (1500×600; EXPORT_DPR=2 for 2400×960).
// Run with the dev server up: npm run dev, then npm run export:hero
// Rebuild afterwards so the poster is picked up (next.config.ts checks for the file).
import { writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'

const base = process.env.BASE_URL ?? 'http://localhost:3000'
const browser = await chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
})
const page = await browser.newPage({ viewport: { width: 1200, height: 480 }, deviceScaleFactor: Number(process.env.EXPORT_DPR ?? 1.25) })
page.on('console', (m) => m.type() === 'error' && console.error('[page]', m.text()))
page.on('pageerror', (e) => console.error('[page]', e.message))
await page.goto(`${base}/dev/hero-export`, { waitUntil: 'networkidle' })
await page.waitForFunction(() => window.__heroReady === true, null, { timeout: 30_000 })
const dataUrl = await page.evaluate(() => document.getElementById('hero-export').toDataURL('image/png'))
writeFileSync('public/hero-engraved.png', Buffer.from(dataUrl.split(',')[1], 'base64'))
console.log('Saved public/hero-engraved.png')
await browser.close()
