import { Banner } from '@/components/hero/Banner'
import { AccentTitle } from '@/components/ui/AccentTitle'
import { Guilloche } from '@/components/ui/Guilloche'
import { reveal } from '@/components/ui/reveal'
import { WaitlistForm } from '@/components/waitlist/WaitlistForm'
import type { Locale } from '@/lib/i18n'
import type { Messages } from '@/messages/en'

export function FinalCta({ locale, t }: { locale: Locale; t: Messages }) {
  return (
    <section
      id="join"
      data-section="final_cta"
      className="on-dark section defer-render relative isolate overflow-hidden"
      aria-labelledby="join-title"
    >
      <div
        className="pointer-events-none absolute -top-[30%] -right-[25%] -z-10 size-[min(1100px,140vw)] opacity-[0.06]"
        aria-hidden="true"
      >
        <Guilloche className="size-full" color="#D8BE8E" rings={11} />
      </div>

      <div className="container-ledger">
        <div {...reveal(0)}>
          <Banner alt={t.hero.bannerAlt} variant="strip" />
        </div>

        <div className="mt-16 grid gap-12 lg:mt-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
          <div>
            <p className="eyebrow" {...reveal(1)}>
              {t.nav.cta}
            </p>
            <AccentTitle id="join-title" text={t.finalCta.h2} accent={t.finalCta.h2Accent} className="h2 mt-6" index={2} />
            <p className="lede mt-6 max-w-[40ch] text-[18px]" {...reveal(4)}>
              {t.finalCta.sub}
            </p>
            <ul className="mt-10 grid gap-3 text-[15px] text-on-dark-muted" {...reveal(5)}>
              {t.hero.trust.map((x) => (
                <li key={x} className="flex items-center gap-3">
                  <span className="size-[5px] rotate-45 bg-gold-soft" aria-hidden="true" />
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="glass-dark rounded-[24px] p-6 sm:p-9" {...reveal(3)}>
            <WaitlistForm locale={locale} t={t.form} location="final_cta" tone="dark" />
          </div>
        </div>
      </div>
    </section>
  )
}
