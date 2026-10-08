import clsx from 'clsx'

export default function Tabs({ items, active, onChange, className }) {
  return (
    <div
      role="tablist"
      className={clsx('flex gap-1 overflow-x-auto border-b border-border', className)}
    >
      {items.map((item) => {
        const isActive = item.id === active
        return (
          <button
            key={item.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(item.id)}
            className={clsx(
              'relative whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors',
              'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent',
              isActive ? 'text-accent' : 'text-muted hover:text-text',
            )}
          >
            {item.label}
            {item.badge != null && (
              <span
                className={clsx(
                  'ml-2 rounded px-1.5 py-0.5 text-[10px] font-semibold',
                  isActive ? 'bg-accent/15 text-accent' : 'bg-panel2 text-muted',
                )}
              >
                {item.badge}
              </span>
            )}
            {isActive && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-accent" />}
          </button>
        )
      })}
    </div>
  )
}
