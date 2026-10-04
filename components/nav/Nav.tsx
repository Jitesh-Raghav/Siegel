'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CtaButton } from '@/components/ui/CtaButton'
import { localePath, type Locale } from '@/lib/i18n'
import type { Messages } from '@/messages/en'
import { LogoMark } from './LogoMark'

// usePathname() returns the internal /en/... path after the proxy rewrite, so strip either prefix.
// English links carry ?lang=en: the explicit choice that stops the Accept-Language redirect.
function switchLocalePath(pathname: string, to: Locale) {
  const bare = pathname.replace(/^\/(en|de)(?=\/|$)/, '') || '/'
  const path = localePath(to, bare)
  return to === 'en' ? `${path}?lang=en` : path
}

export function Nav({ locale, t }: { locale: Locale; t: Messages['nav'] }) {
  const pathname = usePathname()
  const home = localePath(locale)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [active, setActive] = useState('')

  // Underline the link of the section currently in view.
  useEffect(() => {
    const ids = ['how-it-works', 'pricing', 'faq']
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el)
    if (!els.length) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id)
          else setActive((cur) => (cur === e.target.id ? '' : cur))
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Mobile menu: Escape and resizing to desktop close it; the page behind doesn't scroll while open.
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    const mq = window.matchMedia('(min-width: 768px)')
    const onMq = () => mq.matches && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    mq.addEventListener('change', onMq)
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      mq.removeEventListener('change', onMq)
      document.documentElement.style.overflow = prev
    }
  }, [menuOpen])

  const base = home === '/' ? '' : home
  const links = [
    { href: `${base}/#how-it-works`, label: t.how, id: 'how-it-works' },
    { href: `${base}/#pricing`, label: t.pricing, id: 'pricing' },
    { href: `${base}/#faq`, label: t.faq, id: 'faq' },
  ]

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-4">
      {/* Full-width and transparent at the top; a floating glass pill once the page scrolls. */}
      <div
        // One finite radius for both states: on the 56px bar 28px reads as a full pill, and it never
        // interpolates through a circle (animating from 9999px did). overflow-hidden keeps the menu inside.
        className={`relative mx-auto overflow-hidden rounded-[28px] border transition-[max-width,background-color,border-color,box-shadow,padding] duration-500 ease-ledger ${
          scrolled || menuOpen
            ? 'max-w-[1100px] border-white/80 bg-paper/75 px-2 shadow-[0_1px_0_rgb(255_255_255/0.8)_inset,0_0_0_1px_var(--hairline),0_18px_40px_-20px_rgb(15_42_34/0.35)] backdrop-blur-xl sm:px-3'
            : 'max-w-[calc(var(--content)+var(--gutter)*2)] border-transparent bg-transparent px-[calc(var(--gutter)-12px)] sm:px-[calc(var(--gutter)-16px)]'
        }`}
      >
      {scrolled && !menuOpen && <span className="nav-progress" aria-hidden="true" />}
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
                aria-current={active === l.id ? 'location' : undefined}
                className="relative py-1 text-[14px] text-muted transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-gold after:transition-transform after:duration-500 after:ease-ledger hover:text-ink hover:after:scale-x-100 aria-[current]:text-ink aria-[current]:after:scale-x-100"
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
            className="burger -mr-1 grid size-11 place-items-center rounded-full md:hidden"
            data-open={menuOpen || undefined}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? t.closeMenu : t.menu}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {/* three lines that morph into an X */}
            <span className="burger-box" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile menu: expands smoothly (grid rows 0fr → 1fr), links rise in one after another */}
      <div
        id="mobile-menu"
        className="mobile-menu md:hidden"
        data-open={menuOpen || undefined}
        inert={!menuOpen}
        aria-hidden={!menuOpen}
      >
        <div className="min-h-0 overflow-hidden">
          <ul className="flex flex-col px-3 pt-1 pb-3">
            {links.map((l, i) => (
              <li key={l.href} className="menu-item" style={{ '--n': i } as React.CSSProperties}>
                <a
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="group flex h-14 items-center justify-between border-b border-hairline font-serif text-[26px] tracking-[-0.01em]"
                >
                  <span className="relative">
                    {l.label}
                    <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-gold transition-transform duration-500 ease-ledger group-hover:scale-x-100 group-active:scale-x-100" />
                  </span>
                  <span className="text-[18px] text-gold-deep transition-transform duration-300 ease-ledger group-hover:translate-x-1" aria-hidden="true">
                    →
                  </span>
                </a>
              </li>
            ))}
            <li className="menu-item pt-5" style={{ '--n': links.length } as React.CSSProperties}>
              <CtaButton location="nav_mobile" className="w-full">
                {t.cta}
              </CtaButton>
            </li>
          </ul>
        </div>
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
            onClick={(e) => {
              // Keep the current section when switching language.
              if (window.location.hash) e.currentTarget.href = switchLocalePath(pathname, l) + window.location.hash
            }}
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
