import clsx from 'clsx'
import { PROVENANCE_META } from '../../utils/mockData.js'

/**
 * Provenance chips — plan.md §P: every claim is tagged
 * MEASURED / MODEL PREDICTION / DATASET / ASSUMPTION / AI-GENERATED TEXT.
 */
export default function DataConfidence({ tags = [], className }) {
  if (!tags.length) return null
  return (
    <div className={clsx('flex flex-wrap gap-1.5', className)}>
      {tags.map((tag) => {
        const meta = PROVENANCE_META[tag] ?? PROVENANCE_META.ASSUMPTION
        return (
          <span
            key={tag}
            className={clsx(
              'rounded border px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider',
              meta.bg,
              meta.border,
              meta.color,
            )}
          >
            {tag}
          </span>
        )
      })}
    </div>
  )
}
