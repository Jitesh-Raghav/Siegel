import Link from 'next/link'
import { LogoMark } from '@/components/nav/LogoMark'
import { Microprint } from '@/components/ui/Microprint'
import { localePath, type Locale } from '@/lib/i18n'
import type { Messages } from '@/messages/en'

// TODO: replace with your real contact address before launch.
const CONTACT_EMAIL = 'hello@siegel.example'

export function Footer({ locale, t }: { locale: Locale; t: Messages['footer'] }) {
  const links = [
    { href: localePath(locale, '/impressum'), label: t.impressum },
    { href: localePath(locale, '/datenschutz'), label: t.datenschutz },
    { href: localePath(locale, '/terms'), label: t.terms },
    { href: `mailto:${CONTACT_EMAIL}`, label: t.contact },
  ]
  return (
    <footer className="on-dark relative overflow-hidden border-t border-white/10">
      <div className="container-ledger flex flex-col gap-10 pt-16 pb-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <Link href={localePath(locale)} className="inline-flex items-center gap-3">
            <LogoMark size={30} tone="dark" />
            <span className="font-serif text-[28px] leading-none tracking-[-0.02em]">Siegel</span>
          </Link>
          <p className="mt-5 font-serif text-[20px] italic">{t.tagline}</p>
          <p className="mt-2 text-[13px] leading-relaxed text-on-dark-muted">{t.disclaimer}</p>
        </div>
        <nav aria-label={t.navLabel}>
          <ul className="flex flex-wrap gap-x-8 gap-y-2">
            {links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className="inline-flex h-11 items-center text-[14px] text-on-dark-muted transition-colors hover:text-gold-soft"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="container-ledger">
        <Microprint className="border-y border-white/10 py-2" />
        <p className="mono-label mt-6 text-on-dark-muted">© {new Date().getFullYear()} Siegel</p>
      </div>

      {/* Oversized engraved wordmark, cropped by the page edge */}
      <div className="pointer-events-none mt-6 select-none overflow-hidden" aria-hidden="true">
        <p
          className="text-center font-serif leading-[0.72] tracking-[-0.04em] whitespace-nowrap text-transparent"
          style={{
            fontSize: 'clamp(120px, 27vw, 380px)',
            WebkitTextStroke: '1px rgb(216 190 142 / 0.35)',
            backgroundImage:
              'repeating-linear-gradient(to bottom, rgb(216 190 142 / 0.22) 0 1px, transparent 1px 5px)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            transform: 'translateY(18%)',
          }}
        >
          Siegel
        </p>
      </div>
    </footer>
  )
}
