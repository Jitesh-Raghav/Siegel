import Link from 'next/link'
import { LogoMark } from '@/components/nav/LogoMark'
import { AccentTitle } from '@/components/ui/AccentTitle'
import { CtaButton } from '@/components/ui/CtaButton'
import { Microprint } from '@/components/ui/Microprint'
import { CONTACT_EMAIL } from '@/lib/contact'
import { localePath, type Locale } from '@/lib/i18n'
import type { Messages } from '@/messages/en'
import { FooterField } from './FooterField'

export function Footer({ locale, t }: { locale: Locale; t: Messages }) {
  const f = t.footer
  const home = localePath(locale)
  const base = home === '/' ? '' : home
  const columns = [
    {
      title: f.product,
      links: [
        { href: `${base}/#how-it-works`, label: t.nav.how },
        { href: `${base}/#film`, label: f.film },
        { href: `${base}/#pricing`, label: t.nav.pricing },
        { href: `${base}/#faq`, label: t.nav.faq },
      ],
    },
    {
      title: f.company,
      links: [
        { href: `${base}/#founder`, label: f.founder },
        { href: t.trust.portfolio, label: t.trust.portfolioLabel, external: true },
        { href: t.trust.linkedin, label: t.trust.linkedinLabel, external: true },
        { href: `mailto:${CONTACT_EMAIL}`, label: f.contact },
      ],
    },
    {
      title: f.legal,
      links: [
        { href: localePath(locale, '/impressum'), label: f.impressum },
        { href: localePath(locale, '/datenschutz'), label: f.datenschutz },
        { href: localePath(locale, '/terms'), label: f.terms },
      ],
    },
  ]

  return (
    <footer className="on-dark relative isolate overflow-hidden">
      {/* Live contour field (WebGL); the CSS line texture underneath is the fallback */}
      <div className="footer-fallback absolute inset-0 -z-10" aria-hidden="true">
        <FooterField />
      </div>
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgb(11_31_25/0.92)_0%,rgb(11_31_25/0.55)_45%,rgb(11_31_25/0.1)_100%)]"
        aria-hidden="true"
      />

      <div className="container-ledger pt-20 sm:pt-24">
        {/* Statement + CTA */}
        <div className="flex flex-col gap-8 border-b border-white/10 pb-14 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-[11px] tracking-[0.1em] text-on-dark-muted uppercase">
              <span className="relative flex size-2" aria-hidden="true">
                <span className="absolute inset-0 animate-ping rounded-full bg-[#3FA77A] opacity-60 motion-reduce:hidden" />
                <span className="relative size-2 rounded-full bg-[#3FA77A]" />
              </span>
              {f.status}
            </p>
            <AccentTitle
              as="p"
              text={f.statement}
              accent={f.statementAccent}
              mode="none"
              className="mt-6 max-w-[16ch] font-serif text-[clamp(40px,5.4vw,76px)] leading-[0.98] tracking-[-0.02em]"
            />
          </div>
          <div className="flex flex-col items-start gap-3 lg:items-end">
            <CtaButton location="footer" variant="gold" attract>
              {t.nav.cta}
            </CtaButton>
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-mono text-[12.5px] text-on-dark-muted transition-colors hover:text-gold-soft">
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>

        {/* Brand + columns */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 py-14 md:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,1fr))] md:gap-x-10">
          <div className="col-span-2 max-w-sm md:col-span-1">
            <Link href={home} className="inline-flex items-center gap-3">
              <LogoMark size={32} tone="dark" />
              <span className="font-serif text-[30px] leading-none tracking-[-0.02em]">Siegel</span>
            </Link>
            <p className="mt-5 font-serif text-[21px] italic">{f.tagline}</p>
            <p className="mt-2 text-[13px] leading-relaxed text-on-dark-muted">{f.disclaimer}</p>
            <p className="mt-5 font-mono text-[11px] tracking-[0.08em] text-on-dark-muted uppercase">{f.builtOn}</p>
          </div>
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="font-mono text-[11px] tracking-[0.14em] text-gold-soft uppercase">{col.title}</p>
              <ul className="mt-4 grid grid-cols-1">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      {...('external' in l && l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="group relative inline-flex min-h-10 items-center text-[15px] text-on-dark-muted transition-colors hover:text-on-dark"
                    >
                      {/* hover marker sits outside the text box, so every link shares one left edge */}
                      <span
                        className="absolute top-1/2 -left-3.5 size-1.5 -translate-y-1/2 scale-0 rounded-full bg-gold-soft transition-transform duration-300 ease-ledger group-hover:scale-100"
                        aria-hidden="true"
                      />
                      <span className="transition-transform duration-300 ease-ledger group-hover:translate-x-0.5">{l.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <Microprint className="border-y border-white/10 py-2" />
        <div className="flex flex-col items-start gap-4 py-6 font-mono sm:flex-row sm:items-center sm:justify-between text-[11.5px] tracking-[0.08em] text-on-dark-muted uppercase">
          <p>
            © {new Date().getFullYear()} Siegel · {f.madeBy}{' '}
            <a
              href={t.trust.portfolio}
              target="_blank"
              rel="noopener noreferrer"
              className="text-on-dark underline decoration-gold-soft/50 underline-offset-4 hover:decoration-gold-soft"
            >
              {t.trust.name}
            </a>
          </p>
          <a href="#top" className="group inline-flex items-center gap-2 transition-colors hover:text-on-dark">
            {f.backToTop}
            <span
              className="grid size-8 place-items-center rounded-full border border-white/15 transition-transform duration-300 ease-ledger group-hover:-translate-y-0.5"
              aria-hidden="true"
            >
              ↑
            </span>
          </a>
        </div>
      </div>

      {/* Oversized engraved wordmark, cropped by the page edge */}
      <div className="pointer-events-none select-none overflow-hidden" aria-hidden="true">
        <p
          className="footer-wordmark text-center font-serif leading-[0.72] tracking-[-0.045em] whitespace-nowrap"
          style={{ fontSize: 'clamp(130px, 29vw, 420px)', transform: 'translateY(16%)' }}
        >
          Siegel
        </p>
      </div>
    </footer>
  )
}
