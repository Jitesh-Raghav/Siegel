import type { CSSProperties, ElementType } from 'react'

type Mode = 'hero' | 'scroll' | 'none'

/**
 * Renders a heading where one phrase is set in italic foil, split into words for a staggered
 * reveal. "hero" uses a pure-CSS entrance (never waits on JS); "scroll" uses [data-reveal].
 */
export function AccentTitle({
  text,
  accent,
  as: Tag = 'h2',
  id,
  className = '',
  mode = 'scroll',
  index = 0,
  wordOffset = 0,
}: {
  text: string
  accent?: string
  as?: ElementType
  id?: string
  className?: string
  mode?: Mode
  index?: number
  wordOffset?: number
}) {
  const at = accent ? text.lastIndexOf(accent) : -1
  const parts =
    at >= 0
      ? [
          { text: text.slice(0, at), accent: false },
          { text: accent!, accent: true },
          { text: text.slice(at + accent!.length), accent: false },
        ]
      : [{ text, accent: false }]

  let w = wordOffset
  return (
    <Tag id={id} className={className}>
      {parts.map((part, pi) =>
        part.text
          .split(/(\s+)/)
          .filter(Boolean)
          .map((word, wi) => {
            if (/^\s+$/.test(word)) return ' '
            const n = w++
            const cls = part.accent ? 'accent foil-text' : ''
            if (mode === 'none') {
              return part.accent ? (
                <span key={`${pi}-${wi}`} className={cls}>
                  {word}
                </span>
              ) : (
                word
              )
            }
            const style = { '--w': n, '--i': index } as CSSProperties
            return mode === 'hero' ? (
              <span key={`${pi}-${wi}`} className={`hero-word ${cls}`} style={style}>
                {word}
              </span>
            ) : (
              <span key={`${pi}-${wi}`} data-reveal="word" className={cls} style={style}>
                {word}
              </span>
            )
          }),
      )}
    </Tag>
  )
}
