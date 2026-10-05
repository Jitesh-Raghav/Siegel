// Builds the self-hosted, subset webfonts in app/fonts/. Run once (or after adding new characters):
//   node scripts/subset-fonts.mjs
//
// - Instrument Serif (OFL, Google Fonts): regular and italic, the display face.
// - Boska Medium (Indian Type Foundry via Fontshare, ITF Free Font License: free for commercial
//   use and self-hosting): the hero headline only, one upright style.
// - Geist Sans (OFL): weight range limited to 400–500.
// - Geist Mono (OFL): weight pinned to 400.
// All are reduced to the characters the site actually uses. This roughly halves the font
// payload, which is the biggest lever on Lighthouse's simulated LCP.
import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import subsetFont from 'subset-font'

const OUT = 'app/fonts'
mkdirSync(OUT, { recursive: true })

// Every character used in copy and components, plus Latin-1 and common punctuation as headroom.
function collectText() {
  const chars = new Set()
  const add = (s) => {
    for (const ch of s) chars.add(ch)
  }
  for (let c = 0x20; c <= 0x7e; c++) chars.add(String.fromCharCode(c))
  for (let c = 0xa0; c <= 0xff; c++) chars.add(String.fromCharCode(c))
  add('–—‘’‚“”„…€·›‹←→↗•§™✓⁠‑')
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name)
      if (statSync(p).isDirectory()) walk(p)
      else if (/\.(ts|tsx)$/.test(name)) add(readFileSync(p, 'utf8'))
    }
  }
  for (const dir of ['messages', 'components', 'app']) walk(dir)
  // Resolve \uXXXX escapes written in source files.
  for (const ch of [...chars].join('').matchAll(/\\u([0-9a-fA-F]{4})/g)) chars.add(String.fromCharCode(parseInt(ch[1], 16)))
  return [...chars].filter((ch) => ch.codePointAt(0) >= 0x20).join('')
}

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'

/** Google Fonts woff2 for one style; with a modern UA the CSS is split by script, take the latin block. */
async function googleFont(family, style) {
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family}`, { headers: { 'User-Agent': UA } })).text()
  // The basic latin block is the one whose unicode-range starts at U+0000-00FF.
  const block = css.split('@font-face').find((b) => b.includes(`font-style: ${style}`) && b.includes('U+0000-00FF'))
  const url = block?.match(/src: url\((.+?)\) format\('woff2'\)/)?.[1]
  if (!url) throw new Error(`Could not find the ${family} ${style} latin woff2 URL`)
  return Buffer.from(await (await fetch(url)).arrayBuffer())
}

/** Fontshare woff2 for one family/weight, via its public CSS API. */
async function fontshareFont(family, weight) {
  const css = await (await fetch(`https://api.fontshare.com/v2/css?f[]=${family}@${weight}&display=swap`)).text()
  const url = css.match(/url\('?(\/\/cdn\.fontshare\.com[^)']+\.woff2)'?\)/)?.[1]
  if (!url) throw new Error(`Could not find the ${family} ${weight} woff2 URL`)
  return Buffer.from(await (await fetch(`https:${url}`)).arrayBuffer())
}

const text = collectText()
const geist = 'node_modules/geist/dist/fonts'

const jobs = [
  { out: 'instrument-serif.woff2', src: await googleFont('Instrument+Serif:ital@0;1', 'normal') },
  { out: 'instrument-serif-italic.woff2', src: await googleFont('Instrument+Serif:ital@0;1', 'italic') },
  { out: 'boska-medium.woff2', src: await fontshareFont('boska', 500) },
  { out: 'geist-sans.woff2', src: readFileSync(`${geist}/geist-sans/Geist-Variable.woff2`), axes: { wght: { min: 400, max: 500 } } },
  { out: 'geist-mono.woff2', src: readFileSync(`${geist}/geist-mono/GeistMono-Variable.woff2`), axes: { wght: 400 } },
]

for (const job of jobs) {
  const buf = await subsetFont(job.src, text, { targetFormat: 'woff2', ...(job.axes && { variationAxes: job.axes }) })
  writeFileSync(join(OUT, job.out), buf)
  console.log(`${job.out}: ${(job.src.length / 1024).toFixed(0)} KB → ${(buf.length / 1024).toFixed(0)} KB`)
}
console.log(`${text.length} characters kept`)
