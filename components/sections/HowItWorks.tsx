import { SectionHeader } from '@/components/ui/SectionHeader'
import { reveal } from '@/components/ui/reveal'
import type { Messages } from '@/messages/en'
import { LayerDiagram } from './LayerDiagram'

export function HowItWorks({ t }: { t: Messages['how'] }) {
  return (
    <section
      id="how-it-works"
      data-section="how"
      className="section relative border-t border-hairline bg-paper-2/60 defer-render"
      aria-labelledby="how-title"
    >
      <div className="container-ledger">
        <SectionHeader id="how-title" eyebrow={t.eyebrow} title={t.h2} accent={t.h2Accent} />

        <div className="relative mt-16">
          <ol className="relative grid gap-5 md:grid-cols-3 md:gap-6">
            {t.steps.map((s, i) => (
              <li key={s.n} className="surface spotlight group relative p-7 sm:p-8" {...reveal(2 + i)}>
                <div className="flex items-start justify-between">
                  <div className="grid size-[60px] place-items-center rounded-2xl border border-hairline bg-paper shadow-[0_1px_0_#fff_inset]">
                    <StepIcon index={i} />
                  </div>
                  <span className="accent foil-text text-[56px] leading-none">{s.n}</span>
                </div>
                <h3 className="h3 mt-8">{s.title}</h3>
                <p className="lede mt-3 max-w-[36ch] text-[16px]">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>

        <LayerDiagram t={t.diagram} />
      </div>
    </section>
  )
}

/** Small engraved-style glyphs: hatched fills inside fine ink outlines. */
function StepIcon({ index }: { index: number }) {
  const id = `hatch-${index}`
  return (
    <svg width="42" height="33" viewBox="0 0 72 56" aria-hidden="true" className="text-engrave-ink">
      <defs>
        <pattern id={id} width="3" height="3" patternUnits="userSpaceOnUse">
          <path d="M0 1.5h3" stroke="currentColor" strokeWidth="0.9" />
        </pattern>
      </defs>
      {index === 0 && (
        // Two overlapping seals: your Stripe account and Siegel, connected
        <g stroke="currentColor" strokeWidth="1.1">
          <circle cx="25" cy="28" r="17" fill={`url(#${id})`} />
          <circle cx="47" cy="28" r="17" fill="var(--paper)" fillOpacity="0.85" />
          <circle cx="25" cy="28" r="17" fill="none" strokeDasharray="1.5 2" />
          <circle cx="47" cy="28" r="12" fill="none" strokeWidth="0.8" />
          <path d="M41 28h12M47 22v12" fill="none" />
        </g>
      )}
      {index === 1 && (
        // Document with a validation seal
        <g stroke="currentColor" strokeWidth="1.1">
          <path d="M14 4h26l10 10v38H14z" fill="var(--paper)" />
          <path d="M40 4v10h10" fill="none" />
          <path d="M20 20h22M20 26h22M20 32h14" fill="none" strokeWidth="0.9" />
          <circle cx="50" cy="40" r="12" fill={`url(#${id})`} />
          <circle cx="50" cy="40" r="12" fill="none" />
          <circle cx="50" cy="40" r="7.5" fill="var(--paper)" />
          <path d="M46.5 40.2l2.4 2.4 4.6-4.8" fill="none" strokeWidth="1.3" />
        </g>
      )}
      {index === 2 && (
        // Envelope over an archive box
        <g stroke="currentColor" strokeWidth="1.1">
          <path d="M8 26h56v26H8z" fill={`url(#${id})`} />
          <path d="M4 18h64v8H4z" fill="var(--paper)" />
          <path d="M28 34h16" fill="none" strokeWidth="1.4" />
          <path d="M20 4h32v20H20z" fill="var(--paper)" />
          <path d="M20 4l16 11 16-11" fill="none" />
        </g>
      )}
    </svg>
  )
}
