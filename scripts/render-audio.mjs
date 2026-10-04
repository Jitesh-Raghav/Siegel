// Synthesises the explainer soundtrack (no samples, no downloads → fully royalty-free).
//   node scripts/render-audio.mjs en|de  → video/soundtrack-{lang}.wav (muxed in by scripts/render-video.mjs)
// If video/voice/{lang}.json exists (scripts/render-voice.mjs), the voiceover is mixed in and the
// music ducks underneath it.
//
// Music: a slow D-major progression (Dmaj9 · Bm9 · Gmaj7 · A6sus4 → Dmaj9) on a soft FM electric
// piano, warm sub-bass, a filtered-noise air layer and a gentle kick/hat pulse during the "how"
// scenes. Sound effects are tuned to the key and timed to video/explainer.html. Everything runs
// through a small stereo reverb, then a soft limiter.
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import ffmpeg from 'ffmpeg-static'

const LANG = process.argv[2] === 'de' ? 'de' : 'en'

const RATE = 44100
const DURATION = 36
const N = RATE * DURATION
const dry = [new Float32Array(N), new Float32Array(N)]
const wet = [new Float32Array(N), new Float32Array(N)] // send to reverb

let seed = 11
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0
  return seed / 4294967296
}
const noise = () => rnd() * 2 - 1
const midi = (m) => 440 * Math.pow(2, (m - 69) / 12)
const TAU = Math.PI * 2

/** Mix fn(tSec, progress) into the bus from t for dur seconds. */
function add(t, dur, fn, { gain = 1, pan = 0, send = 0.3 } = {}) {
  const start = Math.floor(t * RATE)
  const len = Math.floor(dur * RATE)
  const gl = gain * Math.cos(((pan + 1) * Math.PI) / 4)
  const gr = gain * Math.sin(((pan + 1) * Math.PI) / 4)
  for (let i = 0; i < len; i++) {
    const k = start + i
    if (k < 0 || k >= N) continue
    const v = fn(i / RATE, i / len)
    dry[0][k] += v * gl
    dry[1][k] += v * gr
    wet[0][k] += v * gl * send
    wet[1][k] += v * gr * send
  }
}

// ------------------------------------------------------------------ instruments
/** Soft FM electric piano: bell-ish attack, warm body. */
function epiano(t, note, dur, vel = 0.2, pan = 0) {
  const f = midi(note)
  add(
    t,
    dur + 1.5,
    (s) => {
      const env = Math.min(1, s / 0.008) * Math.exp(-s * (1.2 + note / 90))
      const modEnv = Math.exp(-s * 6)
      const mod = Math.sin(TAU * f * 14 * s) * 0.9 * modEnv + Math.sin(TAU * f * s) * 1.4
      return (Math.sin(TAU * f * s + mod * 0.35) * 0.8 + Math.sin(TAU * f * 2 * s) * 0.12 * modEnv) * env
    },
    { gain: vel, pan, send: 0.45 },
  )
}

/** Warm sub bass: sine + a touch of second harmonic, slow attack. */
function bass(t, note, dur, vel = 0.32) {
  const f = midi(note)
  add(
    t,
    dur,
    (s, p) => {
      const env = Math.min(1, s / 0.05) * Math.min(1, (1 - p) * 6)
      return (Math.sin(TAU * f * s) + 0.18 * Math.sin(TAU * f * 2 * s)) * env
    },
    { gain: vel, send: 0.05 },
  )
}

/** Plucked string (Karplus–Strong). */
function pluck(t, note, vel = 0.25, pan = 0) {
  const f = midi(note)
  const period = Math.max(2, Math.round(RATE / f))
  const buf = Float32Array.from({ length: period }, () => noise())
  let idx = 0
  add(
    t,
    1.6,
    () => {
      const a = buf[idx]
      const b = buf[(idx + 1) % period]
      const v = 0.497 * (a + b)
      buf[idx] = v
      idx = (idx + 1) % period
      return v
    },
    { gain: vel, pan, send: 0.5 },
  )
}

/**
 * Date stamp: a felt thump and a short paper press, then a warm marimba-like mallet note
 * (modal partials at 1 : 3.93 : 9.2) that rings on the date.
 */
function stamp(t, note, vel = 0.3, ring = 1, pan = 0) {
  add(t, 0.35, (s) => Math.sin(TAU * (60 + 70 * Math.exp(-s * 40)) * s) * Math.exp(-s * 16), { gain: vel * 1.4, pan, send: 0.08 })
  let y = 0
  add(
    t,
    0.06,
    (s) => {
      y += 0.35 * (noise() - y)
      return y * Math.exp(-s * 70)
    },
    { gain: vel * 0.9, pan, send: 0.2 },
  )
  const f = midi(note)
  add(
    t + 0.012,
    2.6 * ring,
    (s) => {
      const a = Math.min(1, s / 0.002)
      return (
        a *
        (Math.sin(TAU * f * s) * Math.exp(-s * (2.6 / ring)) +
          0.32 * Math.sin(TAU * f * 3.93 * s) * Math.exp(-s * 9) +
          0.1 * Math.sin(TAU * f * 9.2 * s) * Math.exp(-s * 22))
      )
    },
    { gain: vel * 0.75, pan, send: 0.45 },
  )
}

function kick(t, vel = 0.5) {
  add(t, 0.45, (s) => Math.sin(TAU * (48 + 90 * Math.exp(-s * 30)) * s) * Math.exp(-s * 9), { gain: vel, send: 0.05 })
}

function hat(t, vel = 0.06, pan = 0.3) {
  let hp = 0
  let prev = 0
  add(
    t,
    0.09,
    (s) => {
      const n = noise()
      hp = 0.6 * (hp + n - prev) // crude high-pass
      prev = n
      return hp * Math.exp(-s * 55)
    },
    { gain: vel, pan, send: 0.2 },
  )
}

/** Airy whoosh: band-limited noise with a swept one-pole filter. */
function whoosh(t, dur = 0.9, vel = 0.22, pan = 0) {
  let y = 0
  add(
    t,
    dur,
    (s, p) => {
      const c = 0.015 + 0.18 * Math.sin(Math.PI * p)
      y += c * (noise() - y)
      return y * Math.pow(Math.sin(Math.PI * p), 1.5) * 3
    },
    { gain: vel, pan, send: 0.7 },
  )
}

/** Bell: inharmonic partials. */
function bell(t, note, vel = 0.14, pan = 0) {
  const f = midi(note)
  add(
    t,
    3,
    (s) => [1, 2.4, 3.98, 5.43].reduce((a, m, k) => a + Math.sin(TAU * f * m * s) * Math.exp(-s * (1.6 + k * 1.4)) / (k + 1.2), 0),
    { gain: vel, pan, send: 0.6 },
  )
}

function thunk(t) {
  add(t, 0.7, (s) => Math.sin(TAU * (55 + 40 * Math.exp(-s * 18)) * s) * Math.exp(-s * 7), { gain: 0.8, send: 0.1 })
  add(t, 0.08, (s) => noise() * Math.exp(-s * 90), { gain: 0.18, send: 0.3 })
}

/** Air: very soft filtered noise bed. */
function air(t, dur, vel = 0.05) {
  let y = 0
  add(
    t,
    dur,
    (s, p) => {
      y += 0.02 * (noise() - y)
      return y * Math.min(1, s / 3) * Math.min(1, (1 - p) * 8)
    },
    { gain: vel, pan: 0, send: 0.5 },
  )
}

// ------------------------------------------------------------------ arrangement
// Scenes (from explainer.html): 0–6.4 why · 6.4–12.4 gap · 12.4–18.2 what · 18.2–26.4 how · 26.4–31.4 done · 31.4– outro
const CHORDS = [
  { t: 0, root: 38, notes: [62, 66, 69, 73, 76] }, // Dmaj9
  { t: 6.4, root: 35, notes: [62, 66, 69, 71, 73] }, // Bm9
  { t: 12.4, root: 43, notes: [62, 66, 67, 71, 74] }, // Gmaj7
  { t: 18.2, root: 45, notes: [62, 64, 66, 69, 71] }, // A6sus4
  { t: 22.3, root: 43, notes: [62, 66, 67, 71, 74] }, // Gmaj7
  { t: 26.4, root: 35, notes: [62, 66, 69, 71, 73] }, // Bm9
  { t: 31.4, root: 38, notes: [62, 66, 69, 73, 76, 78] }, // Dmaj9 (resolve)
]
CHORDS.forEach((c, i) => {
  const end = i + 1 < CHORDS.length ? CHORDS[i + 1].t : DURATION
  const len = end - c.t
  // rolled chord, then a second softer voicing halfway
  c.notes.forEach((n, k) => epiano(c.t + 0.04 * k, n, len, 0.11, (k / (c.notes.length - 1)) * 0.8 - 0.4))
  if (len > 4) c.notes.slice(1, 4).forEach((n, k) => epiano(c.t + len / 2 + 0.05 * k, n + 12, len / 2, 0.05, 0.3 - k * 0.3))
  bass(c.t, c.root, len, i === CHORDS.length - 1 ? 0.13 : 0.15)
})
air(0, DURATION, 0.03)

// gentle pulse through the "what/how" scenes (≈ 98 bpm)
const BEAT = 60 / 98
for (let t = 12.6; t < 26.2; t += BEAT) {
  kick(t, 0.32)
  hat(t + BEAT / 2, 0.05, 0.35)
}

// ------------------------------------------------------------------ sound effects
stamp(1.9, 74, 0.3, 1, -0.35) // timeline milestones stamp in: D5 · F#5 · A5, the last one rings on
stamp(2.95, 78, 0.3, 1, 0)
stamp(4.0, 81, 0.34, 1.8, 0.35)
for (const t of [6.2, 12.2, 18.0, 26.2, 31.1]) whoosh(t, 1.0, 0.2)
add(9.7, 0.35, (s, p) => Math.sin(TAU * midi(69 - 5 * p) * s) * Math.exp(-s * 8), { gain: 0.12, send: 0.4 }) // gentle "no"
;[15.3, 16.05, 16.8, 17.55].forEach((t, i) => {
  whoosh(t, 0.6, 0.1, 0.4)
  pluck(t + 0.5, [69, 71, 74, 76][i], 0.1, 0.5)
})
;[20.6, 21.2, 21.8, 22.4].forEach((t, i) => pluck(t, [74, 78, 81, 86][i], 0.2, -0.2 + i * 0.15)) // checks: rising arpeggio
add(21.0, 2.6, (s, p) => Math.sin(TAU * (midi(62) + midi(62) * p * p) * s) * Math.sin(Math.PI * p) * 0.4, { gain: 0.05, send: 0.6 })
thunk(23.9)
bell(23.92, 86, 0.1)
;[27.8, 28.4, 29.0].forEach((t, i) => bell(t, [81, 83, 86][i], 0.05, -0.3 + i * 0.3))
bell(31.7, 74, 0.16, -0.2) // outro chime: D5 · A5 · D6
bell(32.1, 81, 0.12, 0.2)
bell(32.5, 86, 0.1, 0)
pluck(33.2, 78, 0.12)

// ------------------------------------------------------------------ reverb (FDN-ish: 4 combs + 2 allpasses per side)
function reverb(input, sizes, decay) {
  const out = new Float32Array(N)
  const combs = sizes.map((d) => ({ buf: new Float32Array(d), i: 0, lp: 0 }))
  const aps = [556, 441].map((d) => ({ buf: new Float32Array(d), i: 0 }))
  for (let k = 0; k < N; k++) {
    let acc = 0
    for (const c of combs) {
      const y = c.buf[c.i]
      c.lp = y * 0.7 + c.lp * 0.3 // damping
      c.buf[c.i] = input[k] + c.lp * decay
      c.i = (c.i + 1) % c.buf.length
      acc += y
    }
    let v = acc * 0.25
    for (const a of aps) {
      const b = a.buf[a.i]
      const y = -v + b
      a.buf[a.i] = v + b * 0.5
      a.i = (a.i + 1) % a.buf.length
      v = y
    }
    out[k] = v
  }
  return out
}
const revL = reverb(wet[0], [1557, 1617, 1491, 1422], 0.82)
const revR = reverb(wet[1], [1580, 1640, 1514, 1445], 0.82)

// ------------------------------------------------------------------ voiceover
const voice = new Float32Array(N)
const voiceFile = `video/voice/${LANG}.json`
const hasVoice = existsSync(voiceFile)
if (hasVoice) {
  for (const clip of JSON.parse(readFileSync(voiceFile, 'utf8'))) {
    // decode to mono float, 80 Hz high-pass + gentle presence via ffmpeg
    const r = spawnSync(ffmpeg, ['-loglevel', 'error', '-i', clip.file, '-af', 'highpass=f=80,equalizer=f=3500:t=q:w=1:g=2', '-f', 'f32le', '-ac', '1', '-ar', String(RATE), 'pipe:1'], {
      maxBuffer: 1 << 28,
    })
    const pcm = new Float32Array(r.stdout.buffer, r.stdout.byteOffset, r.stdout.length / 4)
    let pk = 0
    for (const v of pcm) pk = Math.max(pk, Math.abs(v))
    const g = 0.9 / (pk || 1)
    const start = Math.floor(clip.start * RATE)
    for (let i = 0; i < pcm.length && start + i < N; i++) voice[start + i] += pcm[i] * g
  }
}
// ducking envelope: follows voice level (fast attack, slow release), music drops ~8 dB under speech
const duck = new Float32Array(N).fill(1)
if (hasVoice) {
  let env = 0
  const att = Math.exp(-1 / (RATE * 0.03))
  const rel = Math.exp(-1 / (RATE * 0.45))
  for (let k = 0; k < N; k++) {
    const x = Math.min(1, Math.abs(voice[k]) * 6)
    env = x > env ? att * env + (1 - att) * x : rel * env + (1 - rel) * x
    duck[k] = 1 - 0.6 * Math.min(1, env * 3)
  }
}

// ------------------------------------------------------------------ master
const L = new Float32Array(N)
const R = new Float32Array(N)
let peak = 0
for (let k = 0; k < N; k++) {
  const fade = Math.min(1, k / (RATE * 0.8)) * Math.min(1, (N - k) / (RATE * 2.5))
  const v = voice[k] * 0.62
  L[k] = (Math.tanh((dry[0][k] + revL[k] * 0.55) * 1.2) * duck[k] * (hasVoice ? 0.6 : 1) + v) * fade
  R[k] = (Math.tanh((dry[1][k] + revR[k] * 0.55) * 1.2) * duck[k] * (hasVoice ? 0.6 : 1) + v) * fade
  peak = Math.max(peak, Math.abs(L[k]), Math.abs(R[k]))
}
const gain = (hasVoice ? 0.89 : 0.7) / peak
const data = Buffer.alloc(N * 4)
for (let k = 0; k < N; k++) {
  data.writeInt16LE(Math.round(L[k] * gain * 32767), k * 4)
  data.writeInt16LE(Math.round(R[k] * gain * 32767), k * 4 + 2)
}
const header = Buffer.alloc(44)
header.write('RIFF', 0)
header.writeUInt32LE(36 + data.length, 4)
header.write('WAVEfmt ', 8)
header.writeUInt32LE(16, 16)
header.writeUInt16LE(1, 20)
header.writeUInt16LE(2, 22)
header.writeUInt32LE(RATE, 24)
header.writeUInt32LE(RATE * 4, 28)
header.writeUInt16LE(4, 32)
header.writeUInt16LE(16, 34)
header.write('data', 36)
header.writeUInt32LE(data.length, 40)
const out = `video/soundtrack-${LANG}.wav`
writeFileSync(out, Buffer.concat([header, data]))
console.log(`Saved ${out}${hasVoice ? ' (with voiceover)' : ' (music only: run scripts/render-voice.mjs for the voiceover)'}`)
