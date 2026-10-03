import { SealMark } from '@/components/nav/SealMark'
import { CtaButton } from '@/components/ui/CtaButton'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { reveal } from '@/components/ui/reveal'
import { formatEuro } from '@/lib/format'
import type { Locale } from '@/lib/i18n'
import type { Messages } from '@/messages/en'

export function Pricing({ locale, t }: { locale: Locale; t: Messages['pricing'] }) {
  return (
    <section id="pricing" data-section="pricing" className="section border-t border-hairline" aria-labelledby="pricing-title">
      <div className="container-ledger">
        <SectionHeader id="pricing-title" eyebrow={t.eyebrow} title={t.h2} />

        <ul className="mt-14 grid border-y border-hairline md:grid-cols-3">
          {t.plans.map((p, i) => {
            const featured = p.id === 'growth'
            return (
              <li
                key={p.id}
                className={`relative flex flex-col py-10 md:px-8 ${i > 0 ? 'border-t border-hairline md:border-t-0 md:border-l' : 'md:pl-0'} ${
                  i === 2 ? 'md:pr-0' : ''
                }`}
                {...reveal(2 + i)}
              >
                {featured && <span className="absolute -top-px right-0 left-0 h-[2px] bg-engrave-ink md:left-8 md:right-8" aria-hidden="true" />}
                <h3 className="label text-ink">{p.name}</h3>
                <p className="mt-5 flex items-baseline gap-1">
                  <span className="font-serif text-[52px] leading-none tracking-[-0.03em]">
                    {formatEuro(locale, p.price, 0)}
                  </span>
                  <span className="text-[15px] text-muted">{t.perMonth}</span>
                </p>
                <p className="mt-4 font-mono text-[13px]">{p.limit}</p>
                <ul className="mt-3 grid gap-1.5 text-[15px] text-muted">
                  {p.extras.map((x) => (
                    <li key={x} className="flex items-center gap-2">
                      <span className="h-px w-3 bg-muted" aria-hidden="true" />
                      {x}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-8">
                  <CtaButton location={`pricing_${p.id}`} variant={featured ? 'primary' : 'secondary'} className="w-full">
                    {t.cta}
                  </CtaButton>
                </div>
              </li>
            )
          })}
        </ul>

        <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between" {...reveal(5)}>
          <div>
            <p className="label text-muted">{t.includesTitle}</p>
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
              {t.includes.map((x) => (
                <li key={x} className="flex items-center gap-2">
                  <Check />
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <p className="inline-flex items-center gap-3 self-start rounded-[2px] border border-engrave-ink/25 bg-engrave-paper px-4 py-3 text-[15px] md:self-auto">
            <SealMark size={22} className="shrink-0 text-engrave-ink" />
            {t.founding}
          </p>
        </div>
        <p className="mt-6 text-[13px] text-muted">{t.vatNote}</p>
      </div>
    </section>
  )
}

function Check() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" className="text-engrave-ink">
      <path d="M1.5 6.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}
