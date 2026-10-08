import clsx from 'clsx'
import Button from './Button.jsx'

/**
 * Error state — plain language + error_id for support.
 * Never shows raw stack traces (plan.md §F).
 */
export default function ErrorState({
  title = 'Something went wrong',
  message = 'The request could not be completed. Please try again.',
  errorId,
  onRetry,
  retryLabel = 'Retry',
  className,
}) {
  return (
    <div
      role="alert"
      className={clsx(
        'flex flex-col items-center justify-center rounded-lg border border-critical/30 bg-critical/5',
        'px-6 py-10 text-center',
        className,
      )}
    >
      <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-critical/15 text-critical">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5M12 16.5v.01" strokeLinecap="round" />
        </svg>
      </span>
      <h3 className="text-sm font-semibold text-text">{title}</h3>
      <p className="mt-1 max-w-md text-xs leading-relaxed text-muted">{message}</p>
      <div className="mt-3 flex items-center gap-3">
        {onRetry && (
          <Button size="sm" variant="secondary" onClick={onRetry}>
            {retryLabel}
          </Button>
        )}
        {errorId && <code className="font-mono text-[10px] text-muted/70">ref: {errorId}</code>}
      </div>
    </div>
  )
}
