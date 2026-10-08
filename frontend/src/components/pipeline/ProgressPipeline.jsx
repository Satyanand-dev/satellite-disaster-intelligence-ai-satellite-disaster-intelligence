import clsx from 'clsx'

const ICONS = {
  done: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  active: (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  ),
  error: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  ),
  pending: <span className="block h-2 w-2 rounded-full bg-muted/50" />,
}

/**
 * Vertical pipeline stepper — plan.md §G page 4.
 * stages: [{ key, label, status: 'pending'|'active'|'done'|'error', elapsedMs?, error? }]
 */
export default function ProgressPipeline({ stages, progress = 0, status = 'running' }) {
  return (
    <div className="rounded-lg border border-border bg-panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-text">
            {status === 'completed'
              ? 'Analysis complete'
              : status === 'failed'
                ? 'Analysis failed'
                : 'Processing…'}
          </p>
          <p className="text-xs text-muted">Do not close this tab — or run in background.</p>
        </div>
        <span className="font-mono text-2xl font-semibold text-accent">{progress}%</span>
      </div>

      <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-panel2">
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-500',
            status === 'failed' ? 'bg-critical' : 'bg-accent',
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      <ol className="space-y-1">
        {stages.map((s, i) => (
          <li key={s.key} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <span
                className={clsx(
                  'flex h-7 w-7 items-center justify-center rounded-full border text-[11px]',
                  s.status === 'done' && 'border-low/40 bg-low/15 text-low',
                  s.status === 'active' && 'border-accent/50 bg-accent/15 text-accent',
                  s.status === 'error' && 'border-critical/50 bg-critical/15 text-critical',
                  s.status === 'pending' && 'border-border bg-panel2 text-muted',
                )}
              >
                {ICONS[s.status]}
              </span>
              {i < stages.length - 1 && (
                <span
                  className={clsx('my-0.5 w-px flex-1', s.status === 'done' ? 'bg-low/40' : 'bg-border')}
                  style={{ minHeight: 18 }}
                />
              )}
            </div>
            <div className="flex min-w-0 flex-1 items-baseline justify-between gap-3 pb-3 pt-1">
              <div className="min-w-0">
                <p
                  className={clsx(
                    'truncate text-[13px]',
                    s.status === 'done' && 'text-text',
                    s.status === 'active' && 'font-medium text-accent',
                    s.status === 'error' && 'text-critical',
                    s.status === 'pending' && 'text-muted/60',
                  )}
                >
                  {s.label}
                </p>
                {s.error && <p className="text-xs text-critical">{s.error}</p>}
              </div>
              <span className="shrink-0 font-mono text-[11px] text-muted">
                {s.elapsedMs != null ? `${(s.elapsedMs / 1000).toFixed(1)}s` : s.status === 'active' ? '…' : ''}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
