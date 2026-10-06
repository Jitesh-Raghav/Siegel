import { AccentTitle } from '@/components/ui/AccentTitle'
import { Eyebrow } from '@/components/ui/SectionHeader'
import { reveal } from '@/components/ui/reveal'
import { CONTACT_EMAIL } from '@/lib/contact'
import type { Messages } from '@/messages/en'

/** Native <details> accordion: works without JS. faq_open is tracked by a delegated listener in Analytics. */
export function Faq({ t }: { t: Messages['faq'] }) {
  return (
    <section id="faq" data-section="faq" className="section defer-render" aria-labelledby="faq-title">
      <div className="container-ledger grid grid-cols-1 gap-12 md:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] md:gap-16">
        <header className="md:sticky md:top-28 md:self-start">
          <Eyebrow num={7} {...reveal(0)}>
            {t.eyebrow}
          </Eyebrow>
          <AccentTitle id="faq-title" text={t.h2} accent={t.h2Accent} className="h2 mt-6" index={1} />
          <p className="lede mt-6 max-w-[34ch]" {...reveal(3)}>
            {t.sub}
          </p>
        </header>

        <div className="border-t border-hairline" {...reveal(2)}>
          {t.items.map((item, idx) => (
            <details
              key={item.id}
              className="faq-item group relative border-b border-hairline"
              data-faq={item.id}
            >
              {/* gold rule marks the open item */}
              <span
                className="absolute -top-px left-0 h-px w-full origin-left scale-x-0 bg-gold transition-transform duration-700 ease-ledger group-open:scale-x-100"
                aria-hidden="true"
              />
              <summary className="flex min-h-[76px] cursor-pointer list-none items-center gap-5 py-6 [&::-webkit-details-marker]:hidden">
                <span className="w-7 shrink-0 font-mono text-[11px] tracking-[0.1em] text-muted">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0 flex-1 font-sans text-[clamp(18px,5vw,21px)] leading-[1.3] break-words hyphens-auto tracking-[-0.01em] transition-colors group-hover:text-engrave-ink">
                  {item.q}
                </span>
                <span
                  className="relative grid size-9 shrink-0 place-items-center rounded-full border border-hairline-strong bg-white/60 transition-[transform,background-color,border-color] duration-500 ease-ledger group-open:rotate-45 group-open:border-ink group-open:bg-ink"
                  aria-hidden="true"
                >
                  <span className="absolute h-px w-3 bg-ink group-open:bg-on-dark" />
                  <span className="absolute h-3 w-px bg-ink group-open:bg-on-dark" />
                </span>
              </summary>
              <div className="faq-answer">
                <p className="lede max-w-[60ch] pb-7 pl-12">
                  {item.a}
                  {item.id === 'who' && (
                    <>
                      {' '}
                      <a href={`mailto:${CONTACT_EMAIL}`} className="text-ink underline decoration-gold underline-offset-4">
                        {CONTACT_EMAIL}
                      </a>
                    </>
                  )}
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
