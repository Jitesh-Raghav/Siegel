// Renders the hero background: a painterly field of forest and moss streaks seen through
// textured glass (diagonal strokes → blur → turbulence displacement → specular glints).
//   node scripts/make-hero-bg.mjs  → public/hero-glass.webp (desktop) + public/hero-glass-sm.webp (mobile)
// The white fade behind the headline is applied with CSS masks, so one texture serves all layouts.
import { writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'
import sharp from 'sharp'

const W = 2400
const H = 1400
const PAD = 160 // overscan, cropped away: keeps displacement artifacts off the edges

// Deterministic PRNG so re-running gives the same texture.
let seed = 7
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296)

const PALETTE = ['#10301a', '#1b4423', '#285a2c', '#3a7034', '#53883c', '#74a046', '#98bb58', '#bcd383', '#dce9b8', '#f1f6e2']
const pick = (lo, hi) => PALETTE[lo + Math.floor(rnd() * (hi - lo + 1))]

// Diagonal strokes (down to the right, like light falling through foliage).
const strokes = []
const angle = (38 * Math.PI) / 180
const dx = Math.cos(angle)
const dy = Math.sin(angle)
for (let i = 0; i < 360; i++) {
  const cx = -400 + rnd() * (W + 800)
  const cy = -200 + rnd() * (H + 400)
  const len = 260 + rnd() * 900
  const width = 14 + rnd() ** 2 * 120
  // darker greens dominate low and right, lighter ones float on top
  const depth = cy / H
  const color = depth > 0.55 ? pick(0, 6) : depth > 0.3 ? pick(2, 8) : pick(5, 9)
  const op = 0.45 + rnd() * 0.5
  strokes.push(
    `<line x1="${(cx - dx * len / 2).toFixed(1)}" y1="${(cy - dy * len / 2).toFixed(1)}" x2="${(cx + dx * len / 2).toFixed(1)}" y2="${(cy + dy * len / 2).toFixed(1)}" stroke="${color}" stroke-width="${width.toFixed(1)}" stroke-linecap="round" opacity="${op.toFixed(2)}"/>`,
  )
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W + PAD * 2}" height="${H + PAD * 2}" viewBox="${-PAD} ${-PAD} ${W + PAD * 2} ${H + PAD * 2}">
  <defs>
    <linearGradient id="base" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0" stop-color="#9dbb72"/><stop offset="0.45" stop-color="#5d8a40"/><stop offset="1" stop-color="#244d28"/>
    </linearGradient>
    <!-- 1) soften the strokes into painterly light -->
    <filter id="paint" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation="9"/>
    </filter>
    <!-- 2) refract through rippled glass: anisotropic turbulence displaces the image -->
    <filter id="glass" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.008 0.03" numOctaves="2" seed="4" result="ripple"/>
      <feDisplacementMap in="SourceGraphic" in2="ripple" scale="46" xChannelSelector="R" yChannelSelector="G" result="refracted"/>
      <!-- 3) the glass surface itself: fine bumps catching light -->
      <feTurbulence type="fractalNoise" baseFrequency="0.034" numOctaves="2" seed="11" result="bumps"/>
      <feSpecularLighting in="bumps" surfaceScale="1.8" specularConstant="0.95" specularExponent="38" lighting-color="#f4f8ec" result="spec">
        <feDistantLight azimuth="225" elevation="48"/>
      </feSpecularLighting>
      <feComposite in="spec" in2="SourceGraphic" operator="in" result="specIn"/>
      <feComponentTransfer in="specIn" result="specSoft"><feFuncA type="linear" slope="0.2"/></feComponentTransfer>
      <feBlend in="specSoft" in2="refracted" mode="screen"/>
    </filter>
  </defs>
  <g filter="url(#glass)">
    <rect x="${-PAD}" y="${-PAD}" width="${W + PAD * 2}" height="${H + PAD * 2}" fill="url(#base)"/>
    <g filter="url(#paint)">${strokes.join('')}</g>
  </g>
</svg>`

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: W + PAD * 2, height: H + PAD * 2 } })
await page.setContent(`<html><body style="margin:0;background:#244d28">${svg}</body></html>`)
await page.waitForTimeout(500)
const png = await sharp(await page.screenshot({ type: 'png' })).extract({ left: PAD, top: PAD, width: W, height: H }).toBuffer()
await browser.close()

// Desktop and a lighter mobile version; the texture is soft, so quality 72 is plenty.
const desktop = await sharp(png).resize(2400).webp({ quality: 82, effort: 6 }).toBuffer()
const mobile = await sharp(png).resize(1200).webp({ quality: 80, effort: 6 }).toBuffer()
writeFileSync('public/hero-glass.webp', desktop)
writeFileSync('public/hero-glass-sm.webp', mobile)
if (process.env.PREVIEW) writeFileSync(process.env.PREVIEW, await sharp(png).resize(1200).jpeg({ quality: 85 }).toBuffer())
console.log(`public/hero-glass.webp ${(desktop.length / 1024).toFixed(0)} KB, public/hero-glass-sm.webp ${(mobile.length / 1024).toFixed(0)} KB`)
