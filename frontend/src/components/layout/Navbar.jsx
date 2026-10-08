import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore.js'
import { useEventStore } from '../../store/eventStore.js'
import { Icons } from '../../utils/nav.jsx'
import Breadcrumb from './Breadcrumb.jsx'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const { currentEventName } = useEventStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-panel px-5">
      <div className="flex min-w-0 items-center gap-3">
        <Breadcrumb />
        {currentEventName && (
          <span className="hidden items-center gap-1.5 rounded border border-border bg-panel2 px-2 py-1 text-[11px] text-muted md:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-accent2" />
            {currentEventName}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-md p-2 text-muted transition-colors hover:bg-panel2 hover:text-text"
        >
          {Icons.bell}
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-critical" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-panel2"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent">
              {(user?.name ?? 'U').slice(0, 1).toUpperCase()}
            </span>
            <span className="hidden text-[13px] text-text sm:block">{user?.name ?? 'User'}</span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-11 z-40 w-52 rounded-lg border border-border bg-panel2 p-1 shadow-2xl">
              <div className="border-b border-border px-3 py-2">
                <p className="truncate text-[13px] font-medium text-text">{user?.name}</p>
                <p className="truncate text-[11px] text-muted">{user?.email}</p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-accent">{user?.role}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
                className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-[13px] text-muted transition-colors hover:bg-critical/10 hover:text-critical"
              >
                {Icons.logout}
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
