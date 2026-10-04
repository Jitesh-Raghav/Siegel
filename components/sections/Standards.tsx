import type { Messages } from '@/messages/en'

/**
 * The standards Siegel is built on, as a crisp "logo wall": six cells with hairline dividers and
 * crosshair corners. Six columns on wide screens, three on tablets, two on phones.
 */
export function Standards({ t }: { t: Messages['standards'] }) {
  return (
    <section aria-labelledby="standards-label" className="mt-20 sm:mt-28">
      <div className="container-ledger">
        <p id="standards-label" className="eyebrow mx-auto flex w-max">
          {t.label}
        </p>
        <ul className="std-wall mt-8 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6">
          {t.items.map((x, i) => (
            <li key={x} className="std-cell group">
              <span className="text-[17px] leading-none font-medium tracking-[-0.015em] text-ink/75 transition-colors duration-300 group-hover:text-ink sm:text-[18px]">
                {x}
              </span>
              <span className="mt-2.5 font-mono text-[10px] tracking-[0.12em] text-muted uppercase">{t.notes[i]}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
