/**
 * Drafting rails for the sections below the hero: a ruled line at each container edge with
 * ticks, a dashed guide and a light that follows the reader (see .bp-* in globals.css).
 * Desktop only; pure CSS, server-rendered.
 */
export function BlueprintRails() {
  return (
    <div className="bp-rails" aria-hidden="true">
      <div className="bp-rail">
        <span className="bp-glow" />
      </div>
      <div className="bp-rail bp-rail-r">
        <span className="bp-glow" />
      </div>
    </div>
  )
}

/** Hairline section divider; on desktop it meets the rails in ring nodes. */
export function SectionDivider() {
  return (
    <div className="bp-divider" aria-hidden="true">
      <span className="bp-cross bp-cross-l" />
      <span className="bp-cross bp-cross-r" />
    </div>
  )
}
