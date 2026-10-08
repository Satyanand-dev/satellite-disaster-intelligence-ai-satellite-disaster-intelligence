import { Link, useLocation } from 'react-router-dom'

const TITLES = {
  dashboard: 'Dashboard',
  upload: 'Satellite Data Upload',
  processing: 'Processing',
  analysis: 'Disaster Analysis',
  indices: 'NDVI / NDWI Analysis',
  change: 'Change Detection',
  infrastructure: 'Infrastructure Impact',
  risk: 'Risk Map',
  report: 'AI Emergency Report',
  '_ui': 'UI Kit',
}

export default function Breadcrumb() {
  const { pathname } = useLocation()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-[13px]">
      <Link to="/dashboard" className="text-muted transition-colors hover:text-accent">
        Home
      </Link>
      {segments.map((seg, i) => {
        const isLast = i === segments.length - 1
        const label = TITLES[seg] ?? (seg.length > 12 ? `${seg.slice(0, 8)}…` : seg)
        return (
          <span key={`${seg}-${i}`} className="flex items-center gap-1.5">
            <span className="text-muted/50">/</span>
            {isLast ? (
              <span className="truncate font-medium text-text">{label}</span>
            ) : (
              <span className="truncate text-muted">{label}</span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
