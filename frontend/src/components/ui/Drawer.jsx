import clsx from 'clsx'
import useEscapeKey from '../../hooks/useEscapeKey.js'

/** Right-side slide-in panel (map popups, score breakdown, filters). */
export default function Drawer({ open, onClose, title, children, width = 'w-[380px]' }) {
  useEscapeKey(open, onClose)

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />}
      <aside
        className={clsx(
          'fixed right-0 top-0 z-50 h-full max-w-[90vw] transform border-l border-border bg-panel',
          'transition-transform duration-200 ease-out',
          open ? 'translate-x-0' : 'translate-x-full',
          width,
        )}
        aria-hidden={!open}
      >
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-text">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="rounded p-1 text-muted transition-colors hover:bg-panel2 hover:text-text"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>
        <div className="h-[calc(100%-49px)] overflow-y-auto p-4">{children}</div>
      </aside>
    </>
  )
}
