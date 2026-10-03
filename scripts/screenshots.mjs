// Full-page screenshots at 375 / 1280 / 1536 px for design review.
// Usage: BASE_URL=http://localhost:3000 SHOT_DIR=./shots PATHS=/,/de node scripts/screenshots.mjs
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from '@playwright/test'

const base = process.env.BASE_URL ?? 'http://localhost:3000'
const outDir = process.env.SHOT_DIR ?? '.screenshots'
const paths = (process.env.PATHS ?? '/').split(',')
const widths = (process.env.WIDTHS ?? '375,1280,1536').split(',').map(Number)
const fold = process.env.FOLD === '1'
const slice = Number(process.env.SLICE ?? 0) // e.g. SLICE=1100 also saves page slices

mkdirSync(outDir, { recursive: true })

const browser = await chromium.launch({
  // Software GL so the WebGL banner renders in headless mode.
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
})

for (const path of paths) {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 })
    const errors = []
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 160)))
    page.on('pageerror', (e) => errors.push(e.message))

    await page.goto(base + path, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2600)

    // Scroll through so every reveal and in-view animation triggers.
    const height = await page.evaluate(() => document.documentElement.scrollHeight)
    for (let y = 0; y < height; y += 500) {
      await page.evaluate((top) => window.scrollTo(0, top), y)
      await page.waitForTimeout(140)
    }
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(4000)

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    const slug = path === '/' ? 'en' : path.replace(/\//g, '_').replace(/^_/, '')
    const file = join(outDir, `${slug}-${width}.png`)
    if (fold) await page.screenshot({ path: file })
    else await page.screenshot({ path: file, fullPage: true })
    if (slice) {
      const total = await page.evaluate(() => document.documentElement.scrollHeight)
      for (let y = 0, i = 0; y < total; y += slice, i++) {
        const clip = { x: 0, y, width, height: Math.min(slice, total - y) }
        await page.screenshot({ path: file.replace('.png', `-${i}.png`), fullPage: true, clip })
      }
    }
    console.log(`${file}  overflow-x=${overflow}px${errors.length ? `  errors=${JSON.stringify(errors)}` : ''}`)
    await page.close()
  }
}

await browser.close()
