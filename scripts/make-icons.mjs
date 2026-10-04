// Generates app/icon.svg, app/apple-icon.png (180px) and app/favicon.ico (16/32/48) from the
// LogoMark geometry in components/nav/LogoMark.tsx. Run after changing the mark:
//   node scripts/make-icons.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'

// Pull the geometry straight from the component so there is one source of truth.
const src = readFileSync('components/nav/LogoMark.tsx', 'utf8')
const pick = (key) => src.match(new RegExp(`${key}: '([^']+)'`))[1]
const sheet = pick('sheet')
const fold = pick('fold')
const lastLine = pick('lastLine')
const lines = [...src.matchAll(/'(M10 1[59]H2[02])'/g)].map((m) => m[1])
const SVG = (bg) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">` +
  (bg ? `<rect width="32" height="32" rx="7" fill="${bg}"/>` : '') +
  `<path d="${sheet}" fill="#0F2A22"/><path d="${fold}" fill="#C79B57"/>` +
  `<circle cx="20.9" cy="6.3" r="0.7" fill="#0F2A22"/><circle cx="20.9" cy="8.3" r="0.7" fill="#0F2A22"/><circle cx="22.9" cy="8.3" r="0.7" fill="#0F2A22"/>` +
  `<g stroke="#F3F0E6" stroke-width="1.6" stroke-linecap="round" fill="none">${[...lines, lastLine].map((d) => `<path d="${d}"/>`).join('')}</g>` +
  `<rect x="17" y="21.6" width="5" height="2.8" rx="0.8" fill="#C79B57"/></svg>`

writeFileSync('app/icon.svg', SVG() + '\n')

const browser = await chromium.launch()
const render = async (size, bg, pad = 0) => {
  const page = await browser.newPage({ viewport: { width: size, height: size } })
  await page.setContent(
    `<html><body style="margin:0;background:${bg ?? 'transparent'}"><div style="width:${size}px;height:${size}px;display:grid;place-items:center"><img style="width:${size - pad * 2}px;height:${size - pad * 2}px" src="data:image/svg+xml;base64,${Buffer.from(SVG()).toString('base64')}"/></div></body></html>`,
  )
  const png = await page.screenshot({ omitBackground: !bg })
  await page.close()
  return png
}

// Apple touch icon: bone tile with padding (iOS adds its own rounded mask).
writeFileSync('app/apple-icon.png', await render(180, '#F3F0E6', 22))

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
await browser.close()
console.log('Wrote app/icon.svg, app/apple-icon.png, app/favicon.ico')
