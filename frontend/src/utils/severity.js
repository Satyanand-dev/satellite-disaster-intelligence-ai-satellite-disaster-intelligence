/**
 * Severity scale — the single source of truth for LOW/MEDIUM/HIGH/CRITICAL.
 * Used identically by badges, map layers, legend, tables and charts (plan.md §F).
 */

export const SEVERITY = {
  LOW: {
    label: 'Low',
    color: '#22C55E',
    text: 'text-low',
    bg: 'bg-low/15',
    border: 'border-low/40',
    dot: 'bg-low',
  },
  MEDIUM: {
    label: 'Medium',
    color: '#EAB308',
    text: 'text-medium',
    bg: 'bg-medium/15',
    border: 'border-medium/40',
    dot: 'bg-medium',
  },
  HIGH: {
    label: 'High',
    color: '#F97316',
    text: 'text-high',
    bg: 'bg-high/15',
    border: 'border-high/40',
    dot: 'bg-high',
  },
  CRITICAL: {
    label: 'Critical',
    color: '#EF4444',
    text: 'text-critical',
    bg: 'bg-critical/15',
    border: 'border-critical/40',
    dot: 'bg-critical',
  },
}

export const SEVERITY_BANDS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

/** risk_score [0,100] → band. Thresholds defined in plan.md §O. */
export function riskBand(score) {
  if (score == null || Number.isNaN(Number(score))) return null
  const s = Number(score)
  if (s < 25) return 'LOW'
  if (s < 50) return 'MEDIUM'
  if (s < 75) return 'HIGH'
  return 'CRITICAL'
}

export function severityMeta(band) {
  return SEVERITY[band] ?? null
}
