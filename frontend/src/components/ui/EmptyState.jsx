import clsx from 'clsx'

/**
 * Empty state — always explains WHY it is empty + offers the next action.
 * plan.md §F: "Empty: icon + one-line explanation + primary action CTA."
 */
export default function EmptyState({ icon, title, description, action, className }) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center rounded-lg border border-dashed border-border',
        'bg-panel/50 px-6 py-12 text-center',
        className,
      )}
    >
      <div className="mb-3 text-muted">
        {icon ?? (
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 15l5-5 4 4 3-3 6 6" />
            <circle cx="8.5" cy="8.5" r="1.5" />
          </svg>
        )}
      </div>
      <h3 className="text-sm font-semibold text-text">{title}</h3>
      {description && <p className="mt-1 max-w-md text-xs leading-relaxed text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
