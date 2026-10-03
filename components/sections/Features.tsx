import { SectionHeader } from '@/components/ui/SectionHeader'
import { reveal } from '@/components/ui/reveal'
import type { Messages } from '@/messages/en'

export function Features({ t }: { t: Messages['features'] }) {
  return (
    <section data-section="features" className="section border-t border-hairline" aria-labelledby="features-title">
      <div className="container-ledger">
        <SectionHeader id="features-title" eyebrow={t.eyebrow} title={t.h2} />
        <ul className="mt-14 grid border-t border-hairline sm:grid-cols-2 lg:grid-cols-3">
          {t.items.map((f, i) => (
            <li
              key={f.title}
              className={`border-b border-hairline py-8 sm:px-8 ${
                i % 2 === 0 ? 'sm:pl-0' : 'sm:border-l'
              } lg:border-l lg:pl-8 ${i % 3 === 0 ? 'lg:border-l-0 lg:pl-0' : ''} ${i % 3 === 2 ? 'lg:pr-0' : ''}`}
              {...reveal(2 + (i % 3))}
            >
              <p className="font-mono text-[12px] tracking-[0.06em] text-muted">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="mt-3 text-[18px] font-medium tracking-[-0.01em]">{f.title}</h3>
              <p className="lede mt-2 text-[16px]">{f.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
