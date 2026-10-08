import clsx from 'clsx'
import { NavLink, useNavigate } from 'react-router-dom'
import { Icons, NAV_ITEMS } from '../../utils/nav.jsx'
import { useEventStore } from '../../store/eventStore.js'

export default function Sidebar() {
  const { currentEventId, clearEvent } = useEventStore()
  const navigate = useNavigate()

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-border bg-panel">
      <div className="flex h-14 items-center gap-2.5 border-b border-border px-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-panel2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="1.8">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" strokeLinecap="round" />
          </svg>
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold leading-tight text-text">Disaster Intelligence</p>
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted">satellite ops</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((group) => (
          <div key={group.section} className="mb-5">
            <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted/70">
              {group.section}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const disabled = item.requiresEvent && !currentEventId
                const to = item.requiresEvent ? item.to(currentEventId ?? '') : item.to
                return (
                  <li key={item.id}>
                    {disabled ? (
                      <span
                        aria-disabled="true"
                        title="Run an analysis first"
                        className={clsx(
                          'flex cursor-not-allowed items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px]',
                          'text-muted/40',
                        )}
                      >
                        <span className="opacity-50">{Icons[item.icon]}</span>
                        {item.label}
                      </span>
                    ) : (
                      <NavLink
                        to={to}
                        className={({ isActive }) =>
                          clsx(
                            'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] transition-colors',
                            'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent',
                            isActive
                              ? 'bg-accent/10 font-medium text-accent'
                              : 'text-muted hover:bg-panel2 hover:text-text',
                          )
                        }
                      >
                        {Icons[item.icon]}
                        {item.label}
                      </NavLink>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <button
          type="button"
          onClick={() => {
            clearEvent()
            navigate('/dashboard')
          }}
          className="w-full rounded-md px-2.5 py-2 text-left text-[11px] text-muted transition-colors hover:bg-panel2 hover:text-text"
        >
          {currentEventId ? (
            <>
              Active event: <span className="font-mono text-accent">{currentEventId}</span>
              <span className="ml-1 text-muted/60">(clear)</span>
            </>
          ) : (
            'No active event'
          )}
        </button>
      </div>
    </aside>
  )
}
