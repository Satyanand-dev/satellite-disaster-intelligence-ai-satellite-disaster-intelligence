import clsx from 'clsx'

const variants = {
  info: 'border-accent/40 bg-accent/10 text-text',
  success: 'border-low/40 bg-low/10 text-text',
  warning: 'border-medium/40 bg-medium/10 text-text',
  error: 'border-critical/40 bg-critical/10 text-text',
}

const bar = {
  info: 'bg-accent',
  success: 'bg-low',
  warning: 'bg-medium',
  error: 'bg-critical',
}

export default function Alert({ variant = 'info', title, children, className, onClose }) {
  return (
    <div
      role="alert"
      className={clsx(
        'relative flex gap-3 rounded-md border px-4 py-3 pr-10 text-sm',
        variants[variant],
        className,
      )}
    >
      <span className={clsx('absolute left-0 top-0 h-full w-[3px] rounded-l-md', bar[variant])} />
      <div className="min-w-0">
        {title && <p className="mb-0.5 font-semibold">{title}</p>}
        {children && <div className="text-muted">{children}</div>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          className="absolute right-2 top-2 rounded p-1 text-muted hover:text-text"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
