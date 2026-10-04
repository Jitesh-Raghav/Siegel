'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CtaButton } from '@/components/ui/CtaButton'
import { localePath, type Locale } from '@/lib/i18n'
import type { Messages } from '@/messages/en'
import { LogoMark } from './LogoMark'

function switchLocalePath(pathname: string, to: Locale) {
  const bare = pathname.replace(/^\/de(?=\/|$)/, '') || '/'
  return localePath(to, bare)
}

export function Nav({ locale, t }: { locale: Locale; t: Messages['nav'] }) {
  const pathname = usePathname()
  const home = localePath(locale)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const base = home === '/' ? '' : home
  const links = [
    { href: `${base}/#how-it-works`, label: t.how },
    { href: `${base}/#pricing`, label: t.pricing },
    { href: `${base}/#faq`, label: t.faq },
  ]

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-4">
      {/* Full-width and transparent at the top; a floating glass pill once the page scrolls. */}
      <div
        className={`mx-auto border transition-[max-width,background-color,border-color,box-shadow,padding,border-radius] duration-500 ease-ledger ${
          menuOpen ? 'rounded-[26px]' : 'rounded-full'
        } ${
          scrolled || menuOpen
            ? 'max-w-[1100px] border-white/80 bg-paper/75 px-2 shadow-[0_1px_0_rgb(255_255_255/0.8)_inset,0_0_0_1px_var(--hairline),0_18px_40px_-20px_rgb(15_42_34/0.35)] backdrop-blur-xl sm:px-3'
            : 'max-w-[calc(var(--content)+var(--gutter)*2)] border-transparent bg-transparent px-[calc(var(--gutter)-12px)] sm:px-[calc(var(--gutter)-16px)]'
        }`}
      >
      <nav className="flex h-14 items-center justify-between gap-4 pl-3" aria-label="Main">
        <Link href={home} className="group flex items-center gap-2.5 rounded-full" aria-label={t.home}>
          <LogoMark size={28} className="transition-transform duration-500 ease-ledger group-hover:-rotate-6" />
          <span className="font-serif text-[26px] leading-none tracking-[-0.02em]">Siegel</span>
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="relative py-1 text-[14px] text-muted transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-gold after:transition-transform after:duration-500 after:ease-ledger hover:text-ink hover:after:scale-x-100"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1 sm:gap-3">
          <LocaleToggle locale={locale} pathname={pathname} label={t.language} />
          <span className="group relative hidden lg:inline-flex">
            <button
              type="button"
              aria-disabled="true"
              aria-describedby="login-soon"
              onClick={(e) => e.preventDefault()}
              className="h-11 cursor-not-allowed px-2 text-[14px] text-muted"
            >
              {t.login}
            </button>
            <span
              id="login-soon"
              role="tooltip"
              className="pointer-events-none absolute top-full left-1/2 mt-1 -translate-x-1/2 rounded-md bg-ink px-2 py-1 font-mono text-[11px] whitespace-nowrap text-paper opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
            >
              {t.soon}
            </span>
          </span>
          <CtaButton location="nav" size="sm" attract className="hidden sm:inline-flex">
            {t.cta}
          </CtaButton>
          <button
            type="button"
            className="-mr-2 grid size-11 place-items-center md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? t.closeMenu : t.menu}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true">
              {menuOpen ? (
                <path d="M3 0l12 12M15 0L3 12" stroke="currentColor" strokeWidth="1.25" />
              ) : (
                <path d="M0 1h18M0 6h18M0 11h18" stroke="currentColor" strokeWidth="1.25" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      <div id="mobile-menu" hidden={!menuOpen} className="border-t border-hairline px-3 md:hidden">
        <ul className="flex flex-col py-2">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="flex h-12 items-center border-b border-hairline text-[16px]"
              >
                {l.label}
              </a>
            </li>
          ))}
          <li className="py-4">
            <CtaButton location="nav_mobile" className="w-full">
              {t.cta}
            </CtaButton>
          </li>
        </ul>
      </div>
      </div>
    </header>
  )
}

function LocaleToggle({ locale, pathname, label }: { locale: Locale; pathname: string; label: string }) {
  return (
    <div role="group" aria-label={label} className="flex items-center font-mono text-[12px] tracking-[0.06em]">
      {(['en', 'de'] as const).map((l, i) => (
        <span key={l} className="flex items-center">
          {i > 0 && (
            <span className="text-[#c9c7c0]" aria-hidden="true">
              |
            </span>
          )}
          <a
            href={switchLocalePath(pathname, l)}
            hrefLang={l}
            lang={l}
            aria-current={l === locale ? 'true' : undefined}
            className={`grid h-11 min-w-9 place-items-center uppercase transition-colors ${
              l === locale ? 'text-ink' : 'text-muted hover:text-ink'
            }`}
          >
            {l}
          </a>
        </span>
      ))}
    </div>
  )
}
