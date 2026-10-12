import { AccentTitle } from '@/components/ui/AccentTitle'
import { CtaButton } from '@/components/ui/CtaButton'
import { Eyebrow } from '@/components/ui/SectionHeader'
import { reveal } from '@/components/ui/reveal'
import type { Messages } from '@/messages/en'

const PASSED = 8
const TOTAL = 10

/** Conversion hook: test your last 10 invoices for free before paying. Opens the waitlist. */
export function FreeCheck({ t }: { t: Messages['freeCheck'] }) {
  const r = t.result
  const arc = (PASSED / TOTAL) * 100
  return (
    <section id="free-check" data-section="free_check" className="defer-render pt-[clamp(64px,7vw,104px)]" aria-labelledby="free-check-title">
      <div className="container-ledger">
        <div className="free-check surface relative overflow-hidden rounded-[28px] p-6 sm:p-10 lg:p-12">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-14">
            <div>
              <Eyebrow {...reveal(0)}>{t.eyebrow}</Eyebrow>
              <AccentTitle id="free-check-title" text={t.h2} accent={t.h2Accent} className="h2 mt-5" index={1} />
              <p className="lede mt-5 max-w-[48ch] text-[17px]" {...reveal(3)}>
                {t.body}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4" {...reveal(4)}>
                <CtaButton location="free_check" className="btn-noir">
                  {t.cta}
                </CtaButton>
                <span className="font-mono text-[11px] tracking-[0.1em] text-muted uppercase">{t.note}</span>
              </div>
            </div>

            {/* Result preview */}
            <div className="rounded-[20px] border border-hairline bg-white p-5 shadow-[0_24px_50px_-30px_rgb(19_41_26/0.45)] sm:p-6" aria-hidden="true" {...reveal(3)}>
              <p className="font-mono text-[11px] tracking-[0.1em] text-muted uppercase">{r.title}</p>
              <div className="mt-5 flex items-center gap-5">
                <div className="free-ring relative grid size-[88px] shrink-0 place-items-center rounded-full" style={{ ['--p' as string]: `${arc}%` }}>
                  <span className="relative grid size-[72px] place-items-center rounded-full bg-white">
                    <span className="tabular text-[26px] leading-none font-light tracking-[-0.04em]">
                      {PASSED}
                      <span className="text-[15px] text-muted">/{TOTAL}</span>
                    </span>
                  </span>
                </div>
                <div className="grid gap-1.5 text-[14px]">
                  <p className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-verified" />
                    <span className="tabular font-medium">{PASSED}</span> {r.passed}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-danger" />
                    <span className="tabular font-medium">{TOTAL - PASSED}</span> {r.toFix}
                  </p>
                </div>
              </div>
              <ul className="mt-5 grid grid-cols-1 gap-2">
                {r.issues.map((x) => (
                  <li key={x} className="flex items-center gap-3 rounded-xl border border-danger/20 bg-danger/[0.04] px-3.5 py-2.5 font-mono text-[11.5px]">
                    <span className="grid size-4 shrink-0 place-items-center rounded-full bg-danger/12 text-danger">!</span>
                    <span className="min-w-0 truncate">{x}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
