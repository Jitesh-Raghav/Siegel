import Link from 'next/link'
import { SealMark } from '@/components/nav/SealMark'
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
    <footer className="border-t border-hairline">
      <div className="container-ledger flex flex-col gap-10 py-12 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <Link href={localePath(locale)} className="inline-flex items-center gap-2.5">
            <SealMark size={22} className="text-ink" />
            <span className="font-serif text-[20px] leading-none tracking-[-0.02em]">Siegel</span>
          </Link>
          <p className="mt-4 text-[15px]">{t.tagline}</p>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">{t.disclaimer}</p>
        </div>
        <nav aria-label={t.navLabel}>
          <ul className="flex flex-wrap gap-x-7 gap-y-2">
            {links.map((l) => (
              <li key={l.label}>
                <a href={l.href} className="inline-flex h-11 items-center text-[14px] text-muted transition-colors hover:text-ink">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="container-ledger pb-10">
        <p className="mono-label text-muted">© {new Date().getFullYear()} Siegel</p>
      </div>
    </footer>
  )
}
