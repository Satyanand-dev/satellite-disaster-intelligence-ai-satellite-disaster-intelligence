export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      {/* subtle emergency-ops backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.10),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(45,212,191,0.07),transparent_50%)]"
      />
      <div className="relative w-full max-w-[400px]">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-panel">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="1.8">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-lg font-bold tracking-tight text-text">Satellite Disaster Intelligence</h1>
          <p className="mt-1 text-xs text-muted">AI-powered emergency response platform</p>
        </div>
        <div className="rounded-xl border border-border bg-panel p-6 shadow-2xl">{children}</div>
        <p className="mt-4 text-center text-[11px] leading-relaxed text-muted/70">
          Decision-support only — not an authoritative emergency instruction.
        </p>
      </div>
    </div>
  )
}
