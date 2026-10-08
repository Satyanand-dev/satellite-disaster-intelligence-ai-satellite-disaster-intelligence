import clsx from 'clsx'
import useEscapeKey from '../../hooks/useEscapeKey.js'

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  useEscapeKey(open, onClose)
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={typeof title === 'string' ? title : 'dialog'}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className={clsx(
          'relative w-full rounded-lg border border-border bg-panel shadow-2xl',
          'max-h-[85vh] overflow-y-auto',
          sizes[size],
        )}
      >
        <header className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <h2 className="text-sm font-semibold text-text">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 text-muted transition-colors hover:bg-panel2 hover:text-text"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>
        <div className="px-5 py-4 text-sm">{children}</div>
        {footer && (
          <footer className="flex justify-end gap-2 border-t border-border px-5 py-3.5">{footer}</footer>
        )}
      </div>
    </div>
  )
}
