// Generates the explainer voiceover with ElevenLabs (one clip per scene, EN + DE).
//   node scripts/render-voice.mjs            → video/voice/{lang}-{n}.mp3 + video/voice/{lang}.json
//   LANGS=en node scripts/render-voice.mjs   → one language only
//
// Needs ELEVENLABS_API_KEY in .env.local (never printed or committed). Optional ELEVENLABS_VOICE_ID.
// Each line must fit its scene window; if a take runs long it is regenerated slightly faster.
// Takes are cached by text + voice + speed, so re-running only calls the API for changed lines.
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import ffmpeg from 'ffmpeg-static'

// Minimal .env.local reader (process.loadEnvFile needs Node >= 20.12)
if (existsSync('.env.local')) {
  for (const line of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2')
  }
}
const KEY = process.env.ELEVENLABS_API_KEY
if (!KEY) {
  console.error('ELEVENLABS_API_KEY is not set in .env.local. Add it and re-run.')
  process.exit(1)
}
// "George": warm, calm, multilingual narrator (premade voice). Override with ELEVENLABS_VOICE_ID.
const VOICE = process.env.ELEVENLABS_VOICE_ID || 'JBFqnCBsd6RMkjVDRZzb'
const MODEL = 'eleven_multilingual_v2'

// [start second, window length] per scene: kept in sync with the scene table in video/explainer.html.
const SLOTS = [
  [0.4, 5.8],
  [6.8, 5.3],
  [12.8, 5.1],
  [18.6, 7.3],
  [26.8, 4.4],
  [31.9, 3.9],
]

export const SCRIPT = {
  en: [
    'From 2027, German businesses must send e-invoices. By 2028, everyone does.',
    'Stripe sends PDFs. But a PDF isn’t an e-invoice.',
    'Siegel connects to Stripe in one click. You keep invoicing exactly as before.',
    'Every invoice becomes ZUGFeRD or XRechnung, validated against the official rules, and sealed.',
    'Then delivered to your customer, and archived in the EU.',
    'Siegel. Every Stripe invoice, sealed.',
  ],
  de: [
    'Ab 2027 wird die E-Rechnung für Unternehmen Pflicht. Ab 2028 für alle.',
    'Stripe verschickt PDFs. Doch ein PDF ist keine E-Rechnung.',
    'Siegel verbindet sich mit einem Klick mit Stripe. Sie rechnen weiter ab wie bisher.',
    'Jede Rechnung wird zu ZUGFeRD oder XRechnung, nach offiziellen Regeln geprüft, und besiegelt.',
    'Dann zugestellt an Ihre Kunden und archiviert in der EU.',
    'Siegel. Jede Stripe-Rechnung, besiegelt.',
  ],
}

const duration = (file) => {
  const r = spawnSync(ffmpeg, ['-hide_banner', '-i', file, '-f', 'null', '-'], { encoding: 'utf8' })
  const m = [...r.stderr.matchAll(/time=(\d+):(\d+):([\d.]+)/g)].pop()
  return m ? +m[1] * 3600 + +m[2] * 60 + +m[3] : 0
}

async function take(lang, i, speed) {
  const lines = SCRIPT[lang]
  const text = lines[i]
  const hash = createHash('sha1').update([VOICE, MODEL, text, speed].join('|')).digest('hex').slice(0, 10)
  const file = `video/voice/${lang}-${i}-${hash}.mp3`
  if (existsSync(file)) return file
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': KEY, 'content-type': 'application/json', accept: 'audio/mpeg' },
    body: JSON.stringify({
      text,
      model_id: MODEL,
      previous_text: lines[i - 1],
      next_text: lines[i + 1],
      voice_settings: { stability: 0.55, similarity_boost: 0.8, style: 0.2, use_speaker_boost: true, speed },
    }),
  })
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 200)}`)
  writeFileSync(file, Buffer.from(await res.arrayBuffer()))
  return file
}

mkdirSync('video/voice', { recursive: true })
const langs = (process.env.LANGS || 'en,de').split(',')
for (const lang of langs) {
  const clips = []
  for (let i = 0; i < SLOTS.length; i++) {
    const [start, room] = SLOTS[i]
    let speed = 1
    let file = await take(lang, i, speed)
    let dur = duration(file)
    // Too long for its scene: one faster take (ElevenLabs allows up to 1.2; stay natural at ≤ 1.15).
    if (dur > room) {
      speed = Math.min(1.15, +((dur / room) * 1.03).toFixed(2))
      file = await take(lang, i, speed)
      dur = duration(file)
    }
    const fits = dur <= room
    console.log(`[${lang}] ${i + 1}: ${dur.toFixed(2)}s / ${room}s${speed !== 1 ? ` (speed ${speed})` : ''}${fits ? '' : '  ⚠ still long'}`)
    clips.push({ file, start, dur })
  }
  writeFileSync(`video/voice/${lang}.json`, JSON.stringify(clips, null, 2))
}
console.log('Voice clips ready. Next: node scripts/render-audio.mjs en && node scripts/render-audio.mjs de, then node scripts/render-video.mjs')
