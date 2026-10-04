import type { CSSProperties } from 'react'
import { AccentTitle } from '@/components/ui/AccentTitle'
import { CtaButton } from '@/components/ui/CtaButton'
import { Parallax } from '@/components/ui/Parallax'
import type { Locale } from '@/lib/i18n'
import type { Messages } from '@/messages/en'
import { Banner } from './Banner'
import { Callouts } from './Callouts'
import { HeroLines } from './HeroLines'
import { InvoiceCard } from './InvoiceCard'
import { HeroInvoice } from './HeroInvoice'

const i = (n: number) => ({ '--i': n }) as CSSProperties

export function Hero({ locale, t }: { locale: Locale; t: Messages }) {
  const h = t.hero
  return (
    <section data-section="hero" className="relative isolate overflow-x-clip pt-10 sm:pt-16" aria-labelledby="hero-title">
      {/* Ambient: soft mint glow behind the invoice, engraved line field across the hero */}
      <div className="pointer-events-none absolute inset-x-0 top-[-90px] -z-10 h-[1000px] overflow-x-clip" aria-hidden="true">
        <div className="hero-wash absolute inset-0" />
      </div>
      <HeroLines />

      <div className="container-ledger grid items-center gap-10 xl:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] xl:gap-14">
        <div className="flex flex-col items-start text-left xl:pr-4">
        <a
          href="#deadline"
          className="hero-rise group inline-flex items-center gap-2.5 rounded-full border border-gold/35 bg-white/70 py-1.5 pr-3.5 pl-1.5 text-[12px] font-medium tracking-[0.04em] text-ink uppercase shadow-[0_1px_0_rgb(255_255_255/0.8)_inset,0_6px_18px_-10px_rgb(15_42_34/0.25)] transition-colors hover:border-gold/70 hover:bg-white"
        >
          <span className="rounded-full bg-ink px-2 py-0.5 font-mono text-[10px] tracking-[0.12em] text-on-dark">2027</span>
          {/* One text node: the long label, with the tail hidden on small screens. */}
          <span>
            {h.badgeShort}
            <span className="hidden sm:inline">{h.badge.slice(h.badgeShort.length)}</span>
          </span>
          <span aria-hidden="true" className="text-gold-deep transition-transform duration-300 ease-ledger group-hover:translate-x-0.5">
            →
          </span>
        </a>

        <h1 id="hero-title" className="display mt-8 text-[clamp(44px,4.8vw,76px)]">
          <AccentTitle as="span" className="block" text={h.h1a} mode="hero" />
          <AccentTitle as="span" className="block" text={h.h1b} accent={h.h1bAccent} mode="hero" wordOffset={3} />
        </h1>

        <p className="hero-rise lede mt-7 max-w-[540px] text-[17px] sm:text-[18.5px]" style={i(5)}>
          {h.sub}
        </p>

        <div className="hero-rise mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row" style={i(6)}>
          <CtaButton location="hero" attract pulse>
            {h.ctaPrimary}
          </CtaButton>
          <a href="#how-it-works" className="btn btn-secondary">
            {h.ctaSecondary}
          </a>
        </div>

        <ul className="hero-rise mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-muted" style={i(7)}>
          {h.trust.map((x) => (
            <li key={x} className="inline-flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                <circle cx="7" cy="7" r="6.25" fill="none" stroke="var(--gold)" strokeOpacity="0.7" />
                <path d="M4.3 7.2l1.8 1.8 3.6-3.8" fill="none" stroke="var(--engrave-ink)" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              {x}
            </li>
          ))}
        </ul>
        </div>

        {/* Right: the invoice X-ray (PDF for people, XML for machines) */}
        <div className="hero-rise overflow-x-clip px-2 pt-6 pb-10 xl:overflow-visible xl:p-0" style={i(4)}>
          <HeroInvoice locale={locale} t={t.heroInvoice} />
        </div>
      </div>

      <Parallax className="container-ledger mt-12 sm:mt-16">
        <div className="relative">
          <div className="parallax-slow relative">
            <Banner alt={h.bannerAlt} variant="hero" />
            <Callouts items={h.callouts} />
          </div>
          <div className="relative z-10 -mt-12 px-2 sm:-mt-20 sm:px-10 lg:absolute lg:inset-x-0 lg:top-1/2 lg:mt-0 lg:-translate-y-[42%] lg:px-0">
            <div className="parallax-fast">
              <InvoiceCard locale={locale} t={t.card} />
            </div>
          </div>
        </div>
      </Parallax>
    </section>
  )
}
