import type { Messages } from '@/messages/en'

function Item({ text }: { text: string }) {
  return (
    <li className="flex shrink-0 items-center gap-6 font-serif text-[22px] tracking-[-0.01em] whitespace-nowrap text-ink/80 italic">
      <span className="size-[5px] rotate-45 bg-gold" aria-hidden="true" />
      {text}
    </li>
  )
}

/** Quiet strip of the standards Siegel is built around. Static on wide screens, slow marquee below. */
export function Standards({ t }: { t: Messages['standards'] }) {
  return (
    <section aria-label={t.label} className="mt-20 border-y border-hairline bg-white/35 sm:mt-28">
      <div className="container-ledger flex flex-col gap-4 py-7 xl:flex-row xl:items-center xl:gap-10">
        <p className="eyebrow shrink-0">{t.label}</p>
        <ul className="hidden flex-1 items-center justify-between gap-6 xl:flex">
          {t.items.map((x) => (
            <Item key={x} text={x} />
          ))}
        </ul>
        <div className="marquee overflow-hidden xl:hidden" aria-hidden="true">
          <ul className="marquee-track flex w-max gap-6 pr-6">
            {[...t.items, ...t.items].map((x, i) => (
              <Item key={i} text={x} />
            ))}
          </ul>
        </div>
        <ul className="sr-only-ledger xl:hidden">
          {t.items.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}
