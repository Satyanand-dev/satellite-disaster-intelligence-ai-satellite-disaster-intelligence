import clsx from 'clsx'

export function Skeleton({ className }) {
  return <div className={clsx('animate-pulse rounded-md bg-panel2', className)} />
}

export function CardSkeleton({ className }) {
  return (
    <div className={clsx('rounded-lg border border-border bg-panel p-4', className)}>
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-7 w-32" />
      <Skeleton className="mt-3 h-3 w-40" />
    </div>
  )
}

export function StatCardSkeleton() {
  return <CardSkeleton className="h-[104px]" />
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-8 w-full" />
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-3">
          {Array.from({ length: cols }).map((__, c) => (
            <Skeleton key={c} className="h-6 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function MapSkeleton({ className }) {
  return (
    <div className={clsx('relative overflow-hidden rounded-lg border border-border bg-panel', className)}>
      <div className="absolute inset-0 animate-pulse bg-[repeating-linear-gradient(45deg,#16213A_0,#16213A_12px,#111A2C_12px,#111A2C_24px)]" />
      <span className="absolute bottom-3 left-3 text-xs text-muted">Loading map…</span>
    </div>
  )
}

export default Skeleton
