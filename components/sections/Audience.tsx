import { SectionHeader } from '@/components/ui/SectionHeader'
import { reveal } from '@/components/ui/reveal'
import type { Messages } from '@/messages/en'

const NUMERALS = ['I', 'II', 'III']

export function Audience({ t }: { t: Messages['audience'] }) {
  return (
    <section data-section="audience" className="section bg-paper-2/60 defer-render" aria-labelledby="audience-title">
      <div className="container-ledger">
        <SectionHeader num={5} id="audience-title" eyebrow={t.eyebrow} title={t.h2} accent={t.h2Accent} />
        <ul className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-3">
          {t.items.map((a, i) => (
            <li
              key={a.title}
              className="surface spotlight relative flex min-h-[300px] flex-col justify-between overflow-hidden p-8"
              {...reveal(2 + i)}
            >
              {/* engraved hatch in the corner */}
              <div
                className="hatch absolute -top-16 -right-16 size-40 rotate-45 opacity-70 [mask-image:linear-gradient(to_bottom,#000,transparent)]"
                aria-hidden="true"
              />
              <span
                className="accent text-[88px] leading-none text-transparent [-webkit-text-stroke:1px_var(--gold)]"
                aria-hidden="true"
              >
                {NUMERALS[i]}
              </span>
              <div>
                <h3 className="h3">{a.title}</h3>
                <p className="lede mt-3 text-[16px]">{a.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
