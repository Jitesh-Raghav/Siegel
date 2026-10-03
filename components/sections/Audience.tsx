import { SectionHeader } from '@/components/ui/SectionHeader'
import { reveal } from '@/components/ui/reveal'
import type { Messages } from '@/messages/en'

export function Audience({ t }: { t: Messages['audience'] }) {
  return (
    <section data-section="audience" className="section border-t border-hairline bg-[#F6F5F0]" aria-labelledby="audience-title">
      <div className="container-ledger">
        <SectionHeader id="audience-title" eyebrow={t.eyebrow} title={t.h2} />
        <ul className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {t.items.map((a, i) => (
            <li key={a.title} {...reveal(2 + i)}>
              <div className="rule bg-ink" {...reveal(2 + i, 'rule')} />
              <h3 className="h3 mt-6">{a.title}</h3>
              <p className="lede mt-3">{a.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
