import { SectionHeader } from '@/components/ui/SectionHeader'
import { reveal } from '@/components/ui/reveal'
import { CONTACT_EMAIL } from '@/lib/contact'
import type { Messages } from '@/messages/en'

// Both flags are resolved at build time in next.config.ts.
const HAS_PHOTO = process.env.NEXT_PUBLIC_HAS_FOUNDER_PHOTO === '1'
const HAS_SAMPLES = process.env.NEXT_PUBLIC_HAS_SAMPLES === '1'

const ICONS = {
  linkedin: 'M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.22 8h4.56v14H.22V8zm7.5 0h4.37v1.92h.06c.61-1.15 2.1-2.37 4.32-2.37 4.62 0 5.47 3.04 5.47 7v7.45h-4.56v-6.6c0-1.57-.03-3.6-2.2-3.6-2.2 0-2.53 1.72-2.53 3.49V22H7.72V8z',
  github:
    'M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 0-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3',
  x: 'M18.9 1.2h3.7l-8 9.2L24 22.8h-7.4l-5.8-7.6-6.6 7.6H.5l8.6-9.8L0 1.2h7.6l5.2 6.9 6.1-6.9zm-1.3 19.4h2L6.5 3.3H4.3l13.3 17.3z',
}

/** "Who's building Siegel": founder card, plus an optional sample-download card. */
export function Trust({ t }: { t: Messages['trust'] }) {
  const initials = t.name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  const socials = [
    { href: t.linkedin, label: t.linkedinLabel, icon: ICONS.linkedin },
    { href: t.github, label: 'GitHub', icon: ICONS.github },
    { href: t.x, label: 'X', icon: ICONS.x },
  ]

  return (
    <section id="founder" data-section="trust" className="section defer-render" aria-labelledby="trust-title">
      <div className="container-ledger">
        <SectionHeader num={7} id="trust-title" eyebrow={t.eyebrow} title={t.h2} accent={t.h2Accent} />

        <div className={`mt-14 grid grid-cols-1 gap-5 ${HAS_SAMPLES ? 'lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]' : ''}`}>
          <article className="surface spotlight relative overflow-hidden p-7 sm:p-10" {...reveal(2)}>
            {/* engraved line texture in the corner */}
            <div className="founder-lines pointer-events-none absolute -top-10 -right-10 h-[260px] w-[420px]" aria-hidden="true" />

            <div className="relative grid grid-cols-1 gap-8 md:grid-cols-[auto_minmax(0,1fr)] md:gap-12">
              {/* Portrait: fir-green duotone that turns to full colour on hover */}
              <div className="founder-photo group relative size-40 shrink-0 sm:size-48">
                <span className="absolute -inset-2 rounded-full border border-dashed border-gold/50" aria-hidden="true" />
                {HAS_PHOTO ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src="/founder.jpg"
                    alt={t.name}
                    width={192}
                    height={192}
                    loading="lazy"
                    className="relative size-full rounded-full object-cover"
                  />
                ) : (
                  <div className="relative grid size-full place-items-center rounded-full bg-ink font-serif text-[56px] text-on-dark" aria-hidden="true">
                    {initials}
                  </div>
                )}
                <span className="absolute right-1 bottom-2 grid size-9 place-items-center rounded-full border-4 border-white bg-verified" aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 10 10">
                    <path d="M1.8 5.2l2 2 4.4-4.6" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </span>
              </div>

              <div className="min-w-0">
                <p className="font-serif text-[clamp(34px,4vw,48px)] leading-none tracking-[-0.02em]">{t.name}</p>
                <p className="mt-3 font-mono text-[11.5px] tracking-[0.1em] text-gold-deep uppercase">{t.role}</p>
                <p className="mt-1 text-[13.5px] text-muted">{t.location}</p>
                <p className="lede mt-5 max-w-[58ch] text-[16.5px]">{t.bio}</p>

                <dl className="mt-7 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline sm:grid-cols-3">
                  {t.highlights.map((h) => (
                    <div key={h.k} className="bg-white px-4 py-3.5">
                      <dt className="font-mono text-[10.5px] tracking-[0.1em] text-muted uppercase">{h.k}</dt>
                      <dd className="mt-1 text-[14.5px] font-medium">{h.v}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <a href={`mailto:${CONTACT_EMAIL}`} className="btn btn-primary btn-sm">
                    {t.emailLabel}
                  </a>
                  <a href={t.portfolio} className="btn btn-secondary btn-sm" target="_blank" rel="noopener noreferrer">
                    {t.portfolioLabel}
                  </a>
                  <span className="mx-1 hidden h-6 w-px bg-hairline sm:block" aria-hidden="true" />
                  {socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="grid size-10 place-items-center rounded-full border border-hairline bg-white text-ink transition-[transform,border-color,color] duration-300 ease-ledger hover:-translate-y-0.5 hover:border-gold hover:text-gold-deep"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
                        <path d={s.icon} fill="currentColor" />
                      </svg>
                    </a>
                  ))}
                </div>
                <p className="mt-4 font-mono text-[12px] text-muted">{CONTACT_EMAIL}</p>
              </div>
            </div>
          </article>

          {/* Samples: hidden until both files exist in /public/samples */}
          {HAS_SAMPLES && (
            <div className="on-dark flex flex-col justify-between gap-8 rounded-[22px] p-8 sm:p-10" {...reveal(3)}>
              <div>
                <p className="h3">{t.samplesTitle}</p>
                <p className="lede mt-3 text-[16px]">{t.samplesBody}</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <a href="/samples/sample-zugferd.pdf" download className="btn btn-gold w-full">
                  {t.samplePdf}
                </a>
                <a href="/samples/validation-report.html" target="_blank" rel="noopener" className="btn btn-secondary w-full">
                  {t.sampleReport}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
