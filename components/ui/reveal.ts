import type { CSSProperties } from 'react'

/** Spread onto an element to give it a staggered reveal: <div {...reveal(2)} /> */
export function reveal(i = 0, kind?: 'rule') {
  return {
    'data-reveal': kind ?? '',
    style: { '--i': i } as CSSProperties,
  }
}
