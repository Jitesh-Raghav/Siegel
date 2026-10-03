'use client'

import { reveal } from '@/components/ui/reveal'
import { track } from '@/lib/analytics'
import type { Messages } from '@/messages/en'

/** Native <details> accordion: works without JS; JS only adds analytics. */
export function Faq({ t }: { t: Messages['faq'] }) {
  return (
    <section id="faq" data-section="faq" className="section border-t border-hairline" aria-labelledby="faq-title">
      <div className="container-ledger grid gap-12 md:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] md:gap-16">
        <header className="md:sticky md:top-28 md:self-start">
          <p className="label text-muted" {...reveal(0)}>
            {t.eyebrow}
          </p>
          <h2 id="faq-title" className="h2 mt-4" {...reveal(1)}>
            {t.h2}
          </h2>
          <p className="lede mt-5 max-w-[34ch]" {...reveal(2)}>
            {t.sub}
          </p>
        </header>

        <div className="border-t border-hairline" {...reveal(2)}>
          {t.items.map((item) => (
            <details
              key={item.id}
              className="faq-item group border-b border-hairline"
              onToggle={(e) => {
                if ((e.currentTarget as HTMLDetailsElement).open) track('faq_open', { id: item.id })
              }}
            >
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-[18px] leading-snug tracking-[-0.01em] [&::-webkit-details-marker]:hidden">
                {item.q}
                <span className="relative size-3 shrink-0" aria-hidden="true">
                  <span className="absolute top-1/2 left-0 h-px w-3 bg-ink" />
                  <span className="absolute top-0 left-1/2 h-3 w-px bg-ink transition-transform duration-300 ease-ledger group-open:scale-y-0" />
                </span>
              </summary>
              <div className="faq-answer">
                <p className="lede max-w-[60ch] pb-6">{item.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
