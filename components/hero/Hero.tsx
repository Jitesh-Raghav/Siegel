import { CtaButton } from '@/components/ui/CtaButton'
import type { Locale } from '@/lib/i18n'
import type { Messages } from '@/messages/en'
import { Banner } from './Banner'
import { InvoiceCard } from './InvoiceCard'

export function Hero({ locale, t }: { locale: Locale; t: Messages }) {
  const h = t.hero
  return (
    <section data-section="hero" className="pt-10 sm:pt-16" aria-labelledby="hero-title">
      <div className="container-ledger flex flex-col items-center text-center">
        <a
          href="#deadline"
          className="hero-rise group inline-flex items-center gap-2 rounded-full bg-[#EFEEE9] py-1.5 pr-3 pl-3.5 text-[12px] font-medium tracking-[0.06em] text-ink uppercase transition-colors hover:bg-[#E7E5DF]"
        >
          <span className="size-1.5 rounded-full bg-engrave-ink" aria-hidden="true" />
          <span className="hidden sm:inline">{h.badge}</span>
          <span className="sm:hidden">{h.badgeShort}</span>
          <span aria-hidden="true" className="transition-transform duration-300 ease-ledger group-hover:translate-x-0.5">
            ›
          </span>
        </a>

        <h1 id="hero-title" className="hero-rise display mt-6 max-w-[16ch] sm:max-w-none" style={{ '--i': 1 } as React.CSSProperties}>
          <span className="block">{h.h1a}</span>
          <span className="block">{h.h1b}</span>
        </h1>

        <p className="hero-rise lede mt-6 max-w-[520px] text-[17px] sm:text-[18px]" style={{ '--i': 2 } as React.CSSProperties}>
          {h.sub}
        </p>

        <div
          className="hero-rise mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
          style={{ '--i': 3 } as React.CSSProperties}
        >
          <CtaButton location="hero">{h.ctaPrimary}</CtaButton>
          <a href="#how-it-works" className="btn btn-secondary">
            {h.ctaSecondary}
          </a>
        </div>
      </div>

      <div className="container-ledger mt-12 sm:mt-14">
        <div className="relative">
          <Banner alt={h.bannerAlt} variant="hero" />
          <div className="relative z-10 -mt-10 px-3 sm:-mt-16 sm:px-8 lg:absolute lg:inset-0 lg:mt-0 lg:grid lg:place-items-center lg:px-0">
            <InvoiceCard locale={locale} t={t.card} />
          </div>
        </div>
      </div>
    </section>
  )
}
