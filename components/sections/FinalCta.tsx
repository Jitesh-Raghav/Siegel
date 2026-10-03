import { Banner } from '@/components/hero/Banner'
import { reveal } from '@/components/ui/reveal'
import { WaitlistForm } from '@/components/waitlist/WaitlistForm'
import type { Locale } from '@/lib/i18n'
import type { Messages } from '@/messages/en'

export function FinalCta({ locale, t }: { locale: Locale; t: Messages }) {
  return (
    <section id="join" data-section="final_cta" className="section border-t border-hairline" aria-labelledby="join-title">
      <div className="container-ledger">
        <Banner alt={t.hero.bannerAlt} variant="strip" />
        <div className="relative z-10 mx-auto -mt-12 max-w-[960px] rounded-[2px] border border-hairline bg-white p-6 shadow-[0_24px_60px_-30px_rgb(14_14_14/0.3)] sm:-mt-20 sm:p-10">
          <div className="grid gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-12">
            <div>
              <h2 id="join-title" className="h2" {...reveal(0)}>
                {t.finalCta.h2}
              </h2>
              <p className="lede mt-4" {...reveal(1)}>
                {t.finalCta.sub}
              </p>
            </div>
            <WaitlistForm locale={locale} t={t.form} location="final_cta" />
          </div>
        </div>
      </div>
    </section>
  )
}
