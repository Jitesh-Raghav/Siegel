import { SectionHeader } from '@/components/ui/SectionHeader'
import { reveal } from '@/components/ui/reveal'
import type { Messages } from '@/messages/en'

export function HowItWorks({ t }: { t: Messages['how'] }) {
  return (
    <section
      id="how-it-works"
      data-section="how"
      className="on-dark section how-band relative isolate overflow-hidden defer-render"
      aria-labelledby="how-title"
    >
      {/* faint engraved texture and a mint horizon */}
      <div className="how-texture pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />

      <div className="container-ledger">
        <SectionHeader num={3} id="how-title" eyebrow={t.eyebrow} title={t.h2} accent={t.h2Accent} />

        <div className="relative mt-16 md:mt-20">
          {/* the rail that joins the three steps */}
          <div className="how-rail absolute top-[22px] right-[16.66%] left-[16.66%] hidden md:block" {...reveal(2, 'rule')} />

          <ol className="relative grid gap-12 md:grid-cols-3 md:gap-x-6 md:gap-y-0">
            {t.steps.map((s, i) => (
              <li key={s.n} className="group relative flex flex-col md:row-span-3 md:grid md:grid-rows-subgrid md:gap-0" {...reveal(2 + i)}>
                <div className="flex items-center gap-4 md:flex-col md:gap-0">
                  <span className="how-node tabular grid size-11 shrink-0 place-items-center rounded-full font-mono text-[12px]">
                    {s.n}
                  </span>
                  <h3 className="h3 text-on-dark md:mt-7 md:text-center">{s.title}</h3>
                </div>
                <p className="lede mt-3 text-[16px] md:mx-auto md:max-w-[32ch] md:text-center">{s.body}</p>

                <div className="glass-dark spotlight mt-8 flex flex-col gap-4 rounded-[20px] p-5">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-engrave-paper">
                      <StepIcon index={i} />
                    </span>
                    <span className="font-mono text-[11px] tracking-[0.12em] text-on-dark-muted uppercase">
                      {['stripe → siegel', 'invoice.finalized', 'delivery'][i]}
                    </span>
                  </div>
                  <StepProof index={i} />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

/** A small, product-true panel per step: what Siegel actually does at that moment. */
function StepProof({ index }: { index: number }) {
  const row = 'flex items-center justify-between gap-3 rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2 font-mono text-[11.5px]'
  const ok = (
    <span className="grid size-4 shrink-0 place-items-center rounded-full bg-gold text-midnight" aria-hidden="true">
      <svg width="8" height="8" viewBox="0 0 10 10">
        <path d="M1.8 5.2l2 2 4.4-4.6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </span>
  )
  if (index === 0) {
    return (
      <div className="grid gap-2" aria-hidden="true">
        <div className={row}>
          <span className="text-on-dark">acct_1Pz…7Qk</span>
          <span className="flex items-center gap-2 text-gold-soft">
            connected
            <span className="how-toggle relative h-4 w-7 rounded-full bg-gold">
              <span className="absolute top-0.5 right-0.5 size-3 rounded-full bg-white" />
            </span>
          </span>
        </div>
        <div className={row}>
          <span className="text-on-dark-muted">USt-IdNr.</span>
          <span className="text-on-dark">DE123456789</span>
        </div>
      </div>
    )
  }
  if (index === 1) {
    return (
      <div className="grid gap-2" aria-hidden="true">
        {['schema.xsd', 'en16931.sch', 'xrechnung-cius'].map((x, k) => (
          <div key={x} className={`${row} how-check`} style={{ '--k': k } as React.CSSProperties}>
            <span className="text-on-dark">{x}</span>
            <span className="flex items-center gap-2 text-gold-soft">0 errors {ok}</span>
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="grid gap-2" aria-hidden="true">
      <div className={row}>
        <span className="text-on-dark-muted">sent</span>
        <span className="text-on-dark">buchhaltung@muster.de</span>
      </div>
      <div className={row}>
        <span className="text-on-dark-muted">archive</span>
        <span className="flex items-center gap-2 text-on-dark">eu-central · 10y {ok}</span>
      </div>
    </div>
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
