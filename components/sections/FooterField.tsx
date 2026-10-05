'use client'

import { useEffect, useRef } from 'react'

// Animated contour field for the footer: iso-lines of slowly flowing noise, in mint on forest,
// bending away from the cursor like engraved lines around a lens. Raw WebGL, one draw call.
//
// Cost control: nothing is created until the footer is about to scroll into view and the browser
// is idle; shaders compile in parallel (KHR_parallel_shader_compile) so linking never blocks the
// main thread; it draws only while visible, at 30fps and 1x resolution; software GL is skipped
// (the CSS line texture behind it remains); reduced motion renders a single frame.

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`

const FRAG = `#extension GL_OES_standard_derivatives : enable
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse; // px, -1e4 when away

float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.02+11.;a*=.5;}return v;}

void main(){
  vec2 px=gl_FragCoord.xy;
  vec2 uv=px/420.;
  vec2 d=(px-uMouse)/180.;
  float bump=exp(-dot(d,d))*0.55;
  float h=fbm(uv+vec2(uTime*0.025,uTime*0.012))+bump+uv.y*0.35;
  float lines=h*26.;
  float w=fwidth(lines);
  float c=1.-smoothstep(0.,w*1.4,abs(fract(lines)-0.5)-0.5+w*1.2);
  float idx=1.-smoothstep(0.,w*1.6,abs(fract(lines/5.)-0.5)*5.-2.5+w*1.4);
  vec3 bg=vec3(0.055,0.133,0.078);
  vec3 ink=mix(vec3(0.373,0.604,0.243),vec3(0.737,0.827,0.514),idx);
  float a=c*(0.16+0.3*idx)+bump*c*0.6;
  a*=smoothstep(0.,0.85,1.-gl_FragCoord.y/uRes.y)*0.85+0.15;
  gl_FragColor=vec4(mix(bg,ink,a),1.);
}`

const idle = (cb: () => void) =>
  typeof window.requestIdleCallback === 'function' ? window.requestIdleCallback(cb, { timeout: 2000 }) : window.setTimeout(cb, 300)

export function FooterField() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const host = canvas.parentElement!
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let disposed = false
    let teardown = () => {}

    const init = () => {
      if (disposed) return
      const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' })
      if (!gl || !gl.getExtension('OES_standard_derivatives')) return
      const info = gl.getExtension('WEBGL_debug_renderer_info')
      const renderer = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER))
      if (/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer)) return

      const parallel = gl.getExtension('KHR_parallel_shader_compile')
      const sh = (type: number, src: string) => {
        const s = gl.createShader(type)!
        gl.shaderSource(s, src)
        gl.compileShader(s)
        return s
      }
      const prog = gl.createProgram()!
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT))
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG))
      gl.linkProgram(prog)

      // Poll for completion instead of blocking on LINK_STATUS.
      const whenLinked = (done: () => void) => {
        if (disposed) return
        if (parallel && !gl.getProgramParameter(prog, parallel.COMPLETION_STATUS_KHR)) {
          window.setTimeout(() => whenLinked(done), 50)
          return
        }
        if (gl.getProgramParameter(prog, gl.LINK_STATUS)) done()
      }

      whenLinked(() => {
        gl.useProgram(prog)
        const buf = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, buf)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
        const loc = gl.getAttribLocation(prog, 'p')
        gl.enableVertexAttribArray(loc)
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
        const uRes = gl.getUniformLocation(prog, 'uRes')
        const uTime = gl.getUniformLocation(prog, 'uTime')
        const uMouse = gl.getUniformLocation(prog, 'uMouse')

        const resize = () => {
          // Thin anti-aliased contours read fine at 1x; this keeps fragment work low on retina screens.
          canvas.width = Math.max(1, Math.round(canvas.clientWidth))
          canvas.height = Math.max(1, Math.round(canvas.clientHeight))
          gl.viewport(0, 0, canvas.width, canvas.height)
        }
        resize()

        const mouse = { x: -1e4, y: -1e4, tx: -1e4, ty: -1e4 }
        const onMove = (e: PointerEvent) => {
          const r = canvas.getBoundingClientRect()
          mouse.tx = e.clientX - r.left
          mouse.ty = r.bottom - e.clientY // GL y is up
          if (mouse.x < -1e3) {
            mouse.x = mouse.tx
            mouse.y = mouse.ty
          }
        }
        const onLeave = () => {
          mouse.tx = -1e4
        }
        host.addEventListener('pointermove', onMove)
        host.addEventListener('pointerleave', onLeave)

        const t0 = performance.now()
        const draw = (now: number) => {
          gl.uniform2f(uRes, canvas.width, canvas.height)
          gl.uniform1f(uTime, reduced ? 12 : (now - t0) / 1000 + 40)
          const away = mouse.tx < -1e3
          if (away) mouse.x = -1e4
          else {
            mouse.x += (mouse.tx - mouse.x) * 0.12
            mouse.y += (mouse.ty - mouse.y) * 0.12
          }
          gl.uniform2f(uMouse, away ? -1e4 : mouse.x, away ? -1e4 : mouse.y)
          gl.drawArrays(gl.TRIANGLES, 0, 3)
        }

        let raf = 0
        let last = 0
        let visible = true
        const loop = (now: number) => {
          raf = 0
          if (!visible || document.hidden) return
          if (now - last > 32) {
            last = now
            draw(now)
          }
          raf = requestAnimationFrame(loop)
        }
        const play = () => {
          if (reduced) draw(performance.now())
          else if (!raf) raf = requestAnimationFrame(loop)
        }
        const io = new IntersectionObserver(([e]) => {
          visible = e.isIntersecting
          if (visible) play()
        })
        io.observe(canvas)
        const ro = new ResizeObserver(() => {
          resize()
          if (reduced) draw(performance.now())
        })
        ro.observe(canvas)
        const onVis = () => {
          if (!document.hidden) play()
        }
        document.addEventListener('visibilitychange', onVis)
        play()
        canvas.dataset.ready = '1'

        teardown = () => {
          cancelAnimationFrame(raf)
          io.disconnect()
          ro.disconnect()
          document.removeEventListener('visibilitychange', onVis)
          host.removeEventListener('pointermove', onMove)
          host.removeEventListener('pointerleave', onLeave)
          gl.deleteBuffer(buf)
          gl.deleteProgram(prog)
        }
      })
    }

    // Create the context only when the footer approaches the viewport, then wait for idle time.
    const near = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        near.disconnect()
        idle(init)
      },
      { rootMargin: '400px 0px' },
    )
    near.observe(canvas)

    return () => {
      disposed = true
      near.disconnect()
      teardown()
    }
  }, [])

  return <canvas ref={ref} className="footer-field absolute inset-0 size-full" aria-hidden="true" />
}
