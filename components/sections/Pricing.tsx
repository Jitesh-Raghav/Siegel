import { LogoMark } from '@/components/nav/LogoMark'
import { CtaButton } from '@/components/ui/CtaButton'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { reveal } from '@/components/ui/reveal'
import { formatEuro } from '@/lib/format'
import type { Locale } from '@/lib/i18n'
import type { Messages } from '@/messages/en'

function Check({ dark = false }: { dark?: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" className="mt-[3px] shrink-0">
      <circle cx="7" cy="7" r="6.3" fill="none" stroke={dark ? '#BCD383' : '#5F9A3E'} strokeOpacity="0.6" />
      <path d="M4.2 7.2l1.9 1.9 3.7-3.9" fill="none" stroke={dark ? '#F3F6EE' : '#1D3A21'} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

export function Pricing({ locale, t }: { locale: Locale; t: Messages['pricing'] }) {
  return (
    <section id="pricing" data-section="pricing" className="section defer-render" aria-labelledby="pricing-title">
      <div className="container-ledger">
        <SectionHeader num={6} id="pricing-title" eyebrow={t.eyebrow} title={t.h2} accent={t.h2Accent} align="center" />

        <ul className="mt-16 grid grid-cols-1 gap-5 lg:grid-cols-3 lg:items-stretch">
          {t.plans.map((p, i) => {
            const featured = p.id === 'growth'
            const features = [p.limit, ...t.includes, ...p.extras]
            return (
              <li
                key={p.id}
                className={`relative flex flex-col rounded-[24px] p-8 sm:p-9 ${
                  featured
                    ? 'on-dark spotlight plan-featured shadow-[0_40px_80px_-40px_rgb(11_31_25/0.8)] lg:-my-4 lg:py-12'
                    : 'surface spotlight'
                }`}
                {...reveal(2 + i)}
              >
                {featured && <span className="plan-border" aria-hidden="true" />}
                <div className="flex items-center justify-between">
                  <h3 className={`mono-label ${featured ? 'text-gold-soft' : 'text-muted'}`}>{p.name}</h3>
                  {featured && (
                    <span className="rounded-full bg-[image:var(--foil-light)] px-3 py-1 text-[11px] font-medium text-ink">
                      {t.popular}
                    </span>
                  )}
                </div>
                <p className="mt-8 flex items-baseline gap-1.5">
                  <span className="tabular font-serif text-[72px] leading-[0.9] tracking-[-0.03em]">{formatEuro(locale, p.price, 0)}</span>
                  <span className={`text-[15px] ${featured ? 'text-on-dark-muted' : 'text-muted'}`}>{t.perMonth}</span>
                </p>
                <div
                  className={`mt-8 h-px ${featured ? 'bg-[linear-gradient(90deg,transparent,rgb(159_217_188/0.5),transparent)]' : 'bg-hairline'}`}
                />
                <ul className="mt-8 grid grid-cols-1 gap-3 text-[15px]">
                  {features.map((x, idx) => (
                    <li
                      key={x}
                      className={`flex gap-3 ${idx === 0 ? 'font-medium' : featured ? 'text-on-dark-muted' : 'text-muted'}`}
                    >
                      <Check dark={featured} />
                      {x}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-10">
                  <CtaButton location={`pricing_${p.id}`} variant={featured ? 'gold' : 'primary'} attract={featured} className="w-full">
                    {t.cta}
                  </CtaButton>
                </div>
              </li>
            )
          })}
        </ul>

        <div className="mt-12 flex flex-col items-center gap-4 text-center" {...reveal(5)}>
          <p className="relative inline-flex items-center gap-3 rounded-full bg-white/70 py-2.5 pr-5 pl-2.5 text-left text-[15px] shadow-[0_0_0_1px_rgb(63_167_122/0.45),0_14px_30px_-18px_rgb(31_122_85/0.6)]">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink">
              <LogoMark size={20} tone="dark" />
            </span>
            {t.founding}
          </p>
          <p className="text-[13px] text-muted">{t.vatNote}</p>
        </div>
      </div>
    </section>
  )
}
