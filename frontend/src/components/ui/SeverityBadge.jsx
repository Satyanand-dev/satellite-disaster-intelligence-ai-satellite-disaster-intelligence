import clsx from 'clsx'
import { SEVERITY, severityMeta } from '../../utils/severity.js'

const sizes = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-1 text-[11px]',
}

export default function SeverityBadge({ band, size = 'md', withDot = true, className }) {
  const meta = severityMeta(band)
  if (!meta) {
    return (
      <span className={clsx('rounded border border-border bg-panel2 font-semibold text-muted', sizes[size], className)}>
        N/A
      </span>
    )
  }
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded border font-semibold uppercase tracking-wide',
        meta.bg,
        meta.border,
        meta.text,
        sizes[size],
        className,
      )}
      data-band={band}
    >
      {withDot && <span className={clsx('h-1.5 w-1.5 rounded-full', meta.dot)} />}
      {meta.label}
    </span>
  )
}

export { SEVERITY }
