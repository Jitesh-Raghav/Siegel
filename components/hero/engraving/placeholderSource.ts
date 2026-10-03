// Procedural stand-in for /public/hero-source.jpg: brick warehouses along a canal,
// drawn in greyscale with strong values so the engraving shader has forms to follow.
// Used until a real CC0 / self-made photo is added.

function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

type AnyCanvas = OffscreenCanvas | HTMLCanvasElement
type Ctx2D = OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D

/** Works on the main thread and inside a worker (OffscreenCanvas). */
export function drawPlaceholderSource(width = 1800, height = 760): AnyCanvas {
  let c: AnyCanvas
  if (typeof OffscreenCanvas !== 'undefined') {
    c = new OffscreenCanvas(width, height)
  } else {
    c = document.createElement('canvas')
    c.width = width
    c.height = height
  }
  const g = c.getContext('2d') as Ctx2D
  const rand = rng(7)
  const W = width
  const H = height
  const waterline = H * 0.7

  // Sky: bright, slightly darker toward the top.
  const sky = g.createLinearGradient(0, 0, 0, waterline)
  sky.addColorStop(0, '#b9b9b9')
  sky.addColorStop(0.55, '#e6e6e6')
  sky.addColorStop(1, '#f4f4f4')
  g.fillStyle = sky
  g.fillRect(0, 0, W, waterline)

  // Clouds: soft lumps with shaded undersides.
  for (let i = 0; i < 9; i++) {
    const cx = rand() * W
    const cy = H * (0.06 + rand() * 0.22)
    const r = W * (0.05 + rand() * 0.08)
    for (let k = 0; k < 6; k++) {
      const x = cx + (rand() - 0.5) * r * 2.2
      const y = cy + (rand() - 0.5) * r * 0.5
      const rr = r * (0.5 + rand() * 0.6)
      const grad = g.createRadialGradient(x, y - rr * 0.2, rr * 0.1, x, y, rr)
      grad.addColorStop(0, 'rgba(255,255,255,0.95)')
      grad.addColorStop(0.7, 'rgba(236,236,236,0.6)')
      grad.addColorStop(1, 'rgba(200,200,200,0)')
      g.fillStyle = grad
      g.beginPath()
      g.ellipse(x, y, rr * 1.4, rr * 0.7, 0, 0, Math.PI * 2)
      g.fill()
    }
  }

  // Background skyline (far, light).
  g.fillStyle = '#a9a9a9'
  let x = -20
  while (x < W) {
    const w = 40 + rand() * 90
    const h = H * (0.06 + rand() * 0.08)
    g.fillRect(x, waterline - H * 0.32 - h, w, h + 4)
    if (rand() > 0.75) g.fillRect(x + w * 0.4, waterline - H * 0.32 - h - 40, 6, 40)
    x += w
  }

  // Warehouses: gabled brick façades with stepped tops and window grids.
  x = -40
  const baseY = waterline - H * 0.02
  while (x < W + 40) {
    const w = W * (0.09 + rand() * 0.07)
    const bodyH = H * (0.34 + rand() * 0.12)
    const top = baseY - bodyH
    const tone = 112 + Math.floor(rand() * 50)
    const shade = `rgb(${tone},${tone},${tone})`
    const lightSide = `rgb(${tone + 45},${tone + 45},${tone + 45})`

    // Body: lit from above-left, falling into shadow toward the quay.
    const body = g.createLinearGradient(0, top, 0, baseY)
    body.addColorStop(0, `rgb(${tone + 25},${tone + 25},${tone + 25})`)
    body.addColorStop(1, `rgb(${tone - 45},${tone - 45},${tone - 45})`)
    g.fillStyle = body
    g.fillRect(x, top, w, bodyH)
    g.fillStyle = lightSide
    g.fillRect(x, top, w * 0.08, bodyH)

    // Stepped gable.
    const steps = 4
    const gableH = H * (0.08 + rand() * 0.05)
    for (let s = 0; s < steps; s++) {
      const inset = (w / 2) * (s / steps) * 0.9
      const sh = gableH / steps
      g.fillStyle = s % 2 ? shade : lightSide
      g.fillRect(x + inset, top - sh * (s + 1), w - inset * 2, sh + 1)
    }
    // Copper roof turret on some.
    if (rand() > 0.6) {
      g.fillStyle = '#5a5a5a'
      g.beginPath()
      g.moveTo(x + w / 2 - 14, top - gableH)
      g.lineTo(x + w / 2, top - gableH - 46)
      g.lineTo(x + w / 2 + 14, top - gableH)
      g.fill()
    }

    // Cornice bands.
    g.fillStyle = 'rgba(255,255,255,0.18)'
    for (let b = 1; b < 4; b++) g.fillRect(x, top + (bodyH * b) / 4, w, 3)

    // Windows.
    const cols = Math.max(3, Math.round(w / 34))
    const rows = Math.max(5, Math.round(bodyH / 46))
    const cw = w / cols
    const rh = bodyH / rows
    for (let r = 0; r < rows; r++) {
      for (let col = 0; col < cols; col++) {
        const wx = x + col * cw + cw * 0.28
        const wy = top + r * rh + rh * 0.24
        const ww = cw * 0.44
        const wh = rh * 0.52
        g.fillStyle = rand() > 0.85 ? '#d8d8d8' : '#3a3a3a'
        g.beginPath()
        g.moveTo(wx, wy + wh)
        g.lineTo(wx, wy + ww * 0.5)
        g.arc(wx + ww / 2, wy + ww * 0.5, ww / 2, Math.PI, 0)
        g.lineTo(wx + ww, wy + wh)
        g.fill()
      }
    }

    // Loading-bay hoist beam.
    if (rand() > 0.5) {
      g.fillStyle = '#2a2a2a'
      g.fillRect(x + w / 2 - 3, top - gableH * 0.4, 6, 26)
      g.fillRect(x + w / 2 - 22, top - gableH * 0.4, 44, 5)
    }

    x += w + (rand() > 0.7 ? W * 0.015 : 0)
  }

  // Quay wall.
  g.fillStyle = '#4a4a4a'
  g.fillRect(0, baseY, W, waterline - baseY + 6)

  // Bridge: an arch across the left third.
  g.fillStyle = '#2e2e2e'
  const bx = W * 0.06
  const bw = W * 0.34
  const by = waterline - H * 0.05
  g.fillRect(bx, by - 18, bw, 18)
  g.fillStyle = '#4a4a4a'
  for (let i = 0; i <= 12; i++) g.fillRect(bx + (bw * i) / 12, by - 44, 3, 26)
  g.fillRect(bx, by - 46, bw, 4)
  g.fillStyle = '#262626'
  g.beginPath()
  g.ellipse(bx + bw / 2, by + 30, bw * 0.38, 46, 0, Math.PI, 0)
  g.fill()

  // Water: darker, with a squashed rippling reflection of the scene above.
  const water = g.createLinearGradient(0, waterline, 0, H)
  water.addColorStop(0, '#8c8c8c')
  water.addColorStop(1, '#c4c4c4')
  g.fillStyle = water
  g.fillRect(0, waterline, W, H - waterline)

  g.save()
  g.globalAlpha = 0.4
  for (let y = 0; y < H - waterline; y += 3) {
    const srcY = waterline - y * 1.6
    if (srcY < 0) break
    const shift = Math.sin(y * 0.35) * 6 + Math.sin(y * 0.11) * 4
    g.drawImage(c, 0, srcY, W, 3, shift, waterline + y, W, 3)
  }
  g.restore()

  // Ripple highlights.
  g.fillStyle = 'rgba(255,255,255,0.35)'
  for (let i = 0; i < 260; i++) {
    const rx = rand() * W
    const ry = waterline + 6 + rand() * (H - waterline - 6)
    g.fillRect(rx, ry, 10 + rand() * 50, 1.5)
  }

  return c
}
