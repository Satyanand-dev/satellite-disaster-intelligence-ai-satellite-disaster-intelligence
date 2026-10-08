import clsx from 'clsx'
import { Skeleton } from './LoadingSkeleton.jsx'

/**
 * Dashboard stat tile — mono numerals, optional severity tint and icon.
 */
export default function StatCard({ label, value, sub, icon, band, loading = false, className }) {
  if (loading) return <Skeleton className={clsx('h-[104px] w-full', className)} />

  return (
    <div
      className={clsx(
        'rounded-lg border border-border bg-panel p-4 transition-colors hover:border-accent/30',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted">{label}</p>
        {icon && <span className="text-muted/70">{icon}</span>}
      </div>
      <p className="mt-2 font-mono text-2xl font-semibold leading-none text-text">{value}</p>
      <div className="mt-2 flex items-center gap-2">
        {band && <span className={clsx('h-2 w-2 rounded-full', bandDot(band))} />}
        {sub && <p className="text-xs text-muted">{sub}</p>}
      </div>
    </div>
  )
}

function bandDot(band) {
  return {
    LOW: 'bg-low',
    MEDIUM: 'bg-medium',
    HIGH: 'bg-high',
    CRITICAL: 'bg-critical',
  }[band]
}
