import clsx from 'clsx'

/**
 * Stylised map surface (plan.md §G) — used until the real Leaflet MapView
 * lands in F5. Renders a dark grid, coordinate ticks, a DEMO badge and
 * arbitrary SVG overlays via children.
 */
export default function MapPlaceholder({ children, className, height = 'h-[60vh]', label }) {
  return (
    <div className={clsx('relative overflow-hidden rounded-lg border border-border bg-[#0d1526]', height, className)}>
      {/* grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.35] bg-[linear-gradient(to_right,#1E2A44_1px,transparent_1px),linear-gradient(to_bottom,#1E2A44_1px,transparent_1px)] bg-[size:48px_48px]"
      />
      {/* soft terrain glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,rgba(45,212,191,0.06),transparent_60%),radial-gradient(ellipse_at_75%_65%,rgba(56,189,248,0.05),transparent_55%)]"
      />

      {/* overlays (flood polygons, zones, infra pins…) */}
      <svg viewBox="0 0 800 450" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        {children}
      </svg>

      {/* DEMO badge */}
      <span className="absolute left-3 top-3 z-10 rounded border border-medium/50 bg-medium/15 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-medium">
        Demo data
      </span>

      {label && (
        <span className="absolute right-3 top-3 z-10 rounded border border-border bg-panel/80 px-2 py-0.5 text-[11px] text-muted backdrop-blur">
          {label}
        </span>
      )}

      {/* coordinate ticks */}
      <span className="absolute bottom-2 left-3 z-10 font-mono text-[10px] text-muted/70">26.35° N</span>
      <span className="absolute bottom-2 right-3 z-10 font-mono text-[10px] text-muted/70">86.31° E</span>
      <span className="absolute bottom-2 left-1/2 z-10 -translate-x-1/2 font-mono text-[10px] text-muted/50">
        schematic view — vector tiles in F5
      </span>
    </div>
  )
}
