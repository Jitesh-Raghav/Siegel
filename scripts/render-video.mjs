// Renders video/explainer.html to MP4, frame by frame (deterministic: no dropped frames).
//   node scripts/render-video.mjs                 → public/video/siegel-explainer-{en,de}.mp4 + posters
//   LANGS=en node scripts/render-video.mjs        → one language
//   PREVIEW=2,9,15,24 node scripts/render-video.mjs → PNG stills at those seconds (into PREVIEW_DIR)
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { chromium } from '@playwright/test'
import ffmpeg from 'ffmpeg-static'

const FPS = Number(process.env.FPS ?? 30)
const SCALE = Number(process.env.SCALE ?? 1.5) // 1280×720 authored → 1920×1080 output
const LANGS = (process.env.LANGS ?? 'en,de').split(',')
const OUT = 'public/video'
const POSTER_AT = 24.8 // seconds: the seal has just stamped
const page_url = (lang) => `${pathToFileURL(resolve('video/explainer.html')).href}?render=1&lang=${lang}`

mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch()

async function openPage(lang) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: SCALE })
  page.on('pageerror', (e) => console.error('[page]', e.message))
  await page.goto(page_url(lang))
  await page.evaluate(() => window.ready)
  return page
}

const shot = async (page, t, type = 'jpeg') => {
  await page.evaluate((time) => window.render(time), t)
  return page.screenshot({ type, ...(type === 'jpeg' ? { quality: 92 } : {}) })
}

if (process.env.PREVIEW) {
  const dir = process.env.PREVIEW_DIR ?? '.video-preview'
  mkdirSync(dir, { recursive: true })
  for (const lang of LANGS) {
    const page = await openPage(lang)
    for (const t of process.env.PREVIEW.split(',').map(Number)) {
      writeFileSync(join(dir, `${lang}-${String(t).replace('.', '_')}.png`), await shot(page, t, 'png'))
    }
    await page.close()
  }
  console.log(`Previews in ${dir}`)
} else {
  for (const lang of LANGS) {
    const page = await openPage(lang)
    const duration = await page.evaluate(() => window.DURATION)
    const frames = Math.round(duration * FPS)
    const file = join(OUT, `siegel-explainer-${lang}.mp4`)
    const enc = spawn(
      ffmpeg,
      [
        '-y', '-loglevel', 'error',
        '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
        '-c:v', 'libx264', '-preset', 'slow', '-crf', '22', '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart', '-an', file,
      ],
      { stdio: ['pipe', 'inherit', 'inherit'] },
    )
    const done = new Promise((res, rej) => enc.on('close', (c) => (c === 0 ? res() : rej(new Error(`ffmpeg exited ${c}`)))))
    const started = Date.now()
    for (let f = 0; f < frames; f++) {
      const buf = await shot(page, f / FPS)
      if (!enc.stdin.write(buf)) await new Promise((r) => enc.stdin.once('drain', r))
      if (f % 150 === 0) console.log(`[${lang}] frame ${f}/${frames}  ${((Date.now() - started) / 1000).toFixed(0)}s`)
    }
    enc.stdin.end()
    await done
    // Poster: a JPEG still for the <video> element before playback.
    writeFileSync(join(OUT, `siegel-explainer-${lang}.jpg`), await shot(page, POSTER_AT))
    await page.close()
    console.log(`Saved ${file}`)
  }
}

await browser.close()
