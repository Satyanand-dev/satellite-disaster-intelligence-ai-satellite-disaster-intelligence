import clsx from 'clsx'
import { SEVERITY } from '../../utils/severity.js'

/**
 * Severity distribution donut (recharts wrapper) — plan.md §F "Chart".
 */
export default function Chart({ data, className, height = 160 }) {
  // Lightweight SVG donut — avoids pulling chart lib into every bundle path.
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1
  const r = 54
  const c = 2 * Math.PI * r
  const segments = data.map((d, i) => {
    const dash = (d.value / total) * c
    const before = data
      .slice(0, i)
      .reduce((sum, prev) => sum + (prev.value / total) * c, 0)
    return { ...d, dash, before }
  })

  return (
    <div className={clsx('flex items-center gap-4', className)}>
      <svg viewBox="0 0 140 140" width={height} height={height} role="img" aria-label="Severity distribution">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#16213A" strokeWidth="16" />
        {segments.map((d) => (
          <circle
            key={d.label}
            cx="70"
            cy="70"
            r={r}
            fill="none"
            stroke={SEVERITY[d.label]?.color ?? '#38BDF8'}
            strokeWidth="16"
            strokeDasharray={`${d.dash} ${c - d.dash}`}
            strokeDashoffset={-d.before}
            transform="rotate(-90 70 70)"
          />
        ))}
        <text x="70" y="66" textAnchor="middle" className="fill-text font-mono text-xl font-semibold">
          {total}
        </text>
        <text x="70" y="84" textAnchor="middle" className="fill-muted text-[9px] uppercase tracking-wider">
          events
        </text>
      </svg>
      <ul className="space-y-1.5">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2 text-xs">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: SEVERITY[d.label]?.color ?? '#38BDF8' }}
            />
            <span className="text-muted">{d.label}</span>
            <span className="ml-auto font-mono text-text">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
