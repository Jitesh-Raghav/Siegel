/** Banknote-style microtext line. Decorative only: rendered via CSS so it isn't page text. */
export function Microprint({ text = 'SIEGEL · EN 16931 · ZUGFeRD · XRECHNUNG · VALIDATED ·', className = '' }: { text?: string; className?: string }) {
  return <div className={`microprint ${className}`} data-text={`${text} `.repeat(6)} aria-hidden="true" />
}
