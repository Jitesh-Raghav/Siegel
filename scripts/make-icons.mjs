// Generates app/icon.svg, app/apple-icon.png (180px) and app/favicon.ico (16/32/48) from the
// MARK geometry in components/nav/LogoMark.tsx. Run after changing the mark:
//   node scripts/make-icons.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'

// Pull the geometry straight from the component so there is one source of truth.
const src = readFileSync('components/nav/LogoMark.tsx', 'utf8')
const pick = (key) => src.match(new RegExp(`\\b${key}: '([^']+)'`))[1]
const M = { sheet: pick('sheet'), fold: pick('fold'), lines: pick('lines'), seal: pick('seal'), check: pick('check') }
const ring = src.match(/ring: \{ cx: ([\d.]+), cy: ([\d.]+), r: ([\d.]+) \}/).slice(1).map(Number)

const TONES = {
  light: { sheet: '#13291A', line: '#FAFBF7', mint: '#5F9A3E', rim: '#13291A', mark: '#FAFBF7' },
  dark: { sheet: '#F3F6EE', line: '#13291A', mint: '#5F9A3E', rim: '#0E2214', mark: '#0E2214' },
}

// Shapes with class hooks, so icon.svg can switch tone with prefers-color-scheme.
const shapes =
  `<path class="sheet" d="${M.sheet}"/><path class="mint" d="${M.fold}"/>` +
  `<path class="line" d="${M.lines}" stroke-width="1.6" stroke-linecap="round" fill="none"/>` +
  `<path class="seal" d="${M.seal}" stroke-width="1.3" stroke-linejoin="round" paint-order="stroke"/>` +
  `<circle class="ring" cx="${ring[0]}" cy="${ring[1]}" r="${ring[2]}" fill="none" stroke-opacity=".55" stroke-width=".6"/>` +
  `<path class="check" d="${M.check}" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`
const css = (c) =>
  `.sheet{fill:${c.sheet}}.mint{fill:${c.mint}}.line{stroke:${c.line}}.seal{fill:${c.mint};stroke:${c.rim}}.ring,.check{stroke:${c.mark}}`
const SVG = (tone, { adaptive = false } = {}) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><style>${css(TONES[tone])}` +
  (adaptive ? `@media (prefers-color-scheme:dark){${css(TONES.dark)}}` : '') +
  `</style>${shapes}</svg>`

// Browser tab icon: fir in light tabs, bone in dark tabs.
writeFileSync('app/icon.svg', SVG('light', { adaptive: true }) + '\n')

const browser = await chromium.launch()
const render = async (size, { tone = 'light', tile = false, pad = 0 } = {}) => {
  const page = await browser.newPage({ viewport: { width: size, height: size } })
  const img = `data:image/svg+xml;base64,${Buffer.from(SVG(tone)).toString('base64')}`
  const bg = tile
    ? 'radial-gradient(120% 90% at 30% 15%, #1d4a3b 0%, #13291a 55%, #0e2214 100%)'
    : 'transparent'
  await page.setContent(
    `<html><body style="margin:0"><div style="width:${size}px;height:${size}px;display:grid;place-items:center;background:${bg}">` +
      `<img style="width:${size - pad * 2}px;height:${size - pad * 2}px;${tile ? 'filter:drop-shadow(0 6px 14px rgb(0 0 0 / .35)) drop-shadow(0 0 18px rgb(95 154 62 / .25))' : ''}" src="${img}"/></div></body></html>`,
  )
  const png = await page.screenshot({ omitBackground: !tile })
  await page.close()
  return png
}

// Apple touch icon: bone mark on a deep fir tile (iOS applies its own rounded mask).
writeFileSync('app/apple-icon.png', await render(180, { tone: 'dark', tile: true, pad: 30 }))

// favicon.ico: ICO container holding PNG images (supported by all modern browsers).
const sizes = [16, 32, 48]
const pngs = []
for (const s of sizes) pngs.push(await render(s))
const header = Buffer.alloc(6 + 16 * sizes.length)
header.writeUInt16LE(0, 0)
header.writeUInt16LE(1, 2)
header.writeUInt16LE(sizes.length, 4)
let offset = header.length
sizes.forEach((s, i) => {
  const e = 6 + i * 16
  header.writeUInt8(s, e)
  header.writeUInt8(s, e + 1)
  header.writeUInt8(0, e + 2)
  header.writeUInt8(0, e + 3)
  header.writeUInt16LE(1, e + 4)
  header.writeUInt16LE(32, e + 6)
  header.writeUInt32LE(pngs[i].length, e + 8)
  header.writeUInt32LE(offset, e + 12)
  offset += pngs[i].length
})
writeFileSync('app/favicon.ico', Buffer.concat([header, ...pngs]))

// Preview sheet for review (not shipped): every size on light and dark.
const sheetPage = await browser.newPage({ viewport: { width: 760, height: 260 } })
const cell = (tone, s, bg) =>
  `<div style="background:${bg};padding:14px;border-radius:10px;display:grid;place-items:center"><img width="${s}" height="${s}" src="data:image/svg+xml;base64,${Buffer.from(SVG(tone)).toString('base64')}"/></div>`
await sheetPage.setContent(
  `<body style="margin:0;padding:16px;font-family:sans-serif;display:flex;flex-direction:column;gap:12px;background:#fff">` +
    `<div style="display:flex;gap:12px;align-items:center">${[16, 32, 48, 96].map((s) => cell('light', s, '#FAFBF7')).join('')}${[16, 32, 48, 96].map((s) => cell('dark', s, '#0E2214')).join('')}</div>` +
    `<div style="display:flex;gap:12px;align-items:center"><img width="90" src="data:image/png;base64,${readFileSync('app/apple-icon.png').toString('base64')}" style="border-radius:20px"/></div></body>`,
)
await sheetPage.screenshot({ path: process.env.ICON_PREVIEW || 'icon-preview.png' })
await browser.close()
console.log('Icons written: app/icon.svg, app/apple-icon.png, app/favicon.ico')
