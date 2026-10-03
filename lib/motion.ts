/** Approximates cubic-bezier(0.22, 1, 0.36, 1): fast start, long calm settle. */
export function easeLedger(t: number): number {
  const c = Math.min(1, Math.max(0, t))
  return 1 - Math.pow(1 - c, 5)
}

/** Eased 0→1 progress of a segment that starts at `start` ms and lasts `duration` ms. */
export function segment(elapsed: number, start: number, duration: number): number {
  if (elapsed <= start) return 0
  if (elapsed >= start + duration) return 1
  return easeLedger((elapsed - start) / duration)
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export const ENGRAVED_EVENT = 'siegel:engraved'
