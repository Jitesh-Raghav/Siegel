'use client'

import { useEffect, useRef, type ReactNode } from 'react'

/**
 * Sets --p (−1…1: element centre relative to the viewport centre) for CSS-driven parallax.
 * No-op with reduced motion. Children read it via .parallax-* classes.
 */
export function Parallax({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0
    const update = () => {
      frame = 0
      const r = el.getBoundingClientRect()
      const p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight
      el.style.setProperty('--p', Math.max(-1, Math.min(1, p)).toFixed(3))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
