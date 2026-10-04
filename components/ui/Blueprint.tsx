/**
 * The page's structural grid: two hairline rails at the container edges (desktop only) and section
 * dividers with "+" crosshairs where they meet the rails. Pure CSS, server-rendered.
 */
export function BlueprintRails() {
  return <div className="bp-rails" aria-hidden="true" />
}

export function SectionDivider() {
  return (
    <div className="bp-divider" aria-hidden="true">
      <span className="bp-cross bp-cross-l" />
      <span className="bp-cross bp-cross-r" />
    </div>
  )
}
