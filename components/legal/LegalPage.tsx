import Link from 'next/link'
import { localePath, type Locale } from '@/lib/i18n'
import { getMessages } from '@/lib/i18n'

export type LegalSection = { heading: string; body: string[] }

/** Shared shell for Impressum, Datenschutz and Terms. Content stays German: it's the legally binding version. */
export function LegalPage({
  locale,
  title,
  intro,
  sections,
}: {
  locale: Locale
  title: string
  intro?: string
  sections: LegalSection[]
}) {
  const t = getMessages(locale)
  return (
    <main className="container-ledger py-16 sm:py-24">
      <article className="mx-auto max-w-[720px]" lang="de">
        <Link href={localePath(locale)} lang={locale} className="label text-muted transition-colors hover:text-ink">
          ← {t.legal.back}
        </Link>
        <h1 className="h2 mt-8">{title}</h1>
        <p className="mt-6 rounded-[2px] border border-[#E9C46A] bg-[#FFF8E1] px-4 py-3 font-mono text-[13px] leading-relaxed">
          TODO: Platzhalter. Vor dem Livegang durch rechtlich geprüfte Angaben ersetzen.
          {locale === 'en' && <span lang="en"> (Placeholder. Replace with legally reviewed content before launch.)</span>}
        </p>
        {intro && <p className="lede mt-8">{intro}</p>}
        {sections.map((s) => (
          <section key={s.heading} className="mt-10 border-t border-hairline pt-6">
            <h2 className="text-[18px] font-medium">{s.heading}</h2>
            {s.body.map((line, i) => (
              <p key={i} className="mt-2 text-[16px] text-muted">
                {line}
              </p>
            ))}
          </section>
        ))}
      </article>
    </main>
  )
}
