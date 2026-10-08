import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import DataConfidence from '../components/data/DataConfidence.jsx'
import Button from '../components/ui/Button.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import SeverityBadge from '../components/ui/SeverityBadge.jsx'
import Tabs from '../components/ui/Tabs.jsx'
import { toast } from '../components/ui/toast.js'
import { INFRA, INFRA_SUMMARY } from '../utils/mockData.js'

const TABS = [
  { id: 'buildings', label: 'Buildings' },
  { id: 'roads', label: 'Roads' },
  { id: 'hospitals', label: 'Hospitals' },
  { id: 'schools', label: 'Schools' },
  { id: 'shelters', label: 'Shelters' },
]

const SOURCES = [
  { id: 'sample', label: 'Sample GeoJSON (bundled)' },
  { id: 'overture', label: 'Overture Maps (AOI clip)' },
  { id: 'none', label: 'No source configured' },
]

export default function Infrastructure() {
  const { eventId } = useParams()
  const [tab, setTab] = useState('buildings')
  const [source, setSource] = useState('sample')
  const [affectedOnly, setAffectedOnly] = useState(false)
  const [query, setQuery] = useState('')

  const summary = INFRA_SUMMARY[tab]

  const filtered = useMemo(
    () =>
      (INFRA[tab] ?? []).filter(
        (r) =>
          (!affectedOnly || r.affected) &&
          r.name.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [tab, affectedOnly, query],
  )

  function exportCsv() {
    const header = 'id,name,affected,impact_score,reason,risk_band\n'
    const body = filtered
      .map((r) => [r.id, `"${r.name}"`, r.affected, r.score, `"${r.reason}"`, r.risk].join(','))
      .join('\n')
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `infrastructure_${tab}_${eventId}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV exported')
  }

  const isArea = tab === 'roads'
  const totalLabel = isArea ? `${summary.total} km` : summary.total.toLocaleString()
  const affectedLabel = isArea ? `${summary.affected} km` : summary.affected.toLocaleString()
  const pct = ((summary.affected / summary.total) * 100).toFixed(1)

  return (
    <div className="mx-auto max-w-[1400px]">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-text">Infrastructure Impact</h1>
          <p className="mt-1 text-xs text-muted">
            Intersection of the flood extent with mapped features — estimates, not observed damage.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            aria-label="Vector data source"
            className="h-9 rounded-md border border-border bg-panel2 px-3 text-xs text-text focus:outline-none focus:ring-2 focus:ring-accent/40"
          >
            {SOURCES.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
          <Button size="sm" variant="secondary" onClick={exportCsv} disabled={source === 'none' || !filtered.length}>
            Export CSV
          </Button>
        </div>
      </header>

      {source === 'none' ? (
        <EmptyState
          title="No infrastructure dataset available for this area"
          description="Upload a GeoJSON layer or configure an OpenStreetMap/Overture source for this AOI. Counts are never estimated without data."
          action={<Button size="sm" onClick={() => setSource('sample')}>Use bundled sample</Button>}
        />
      ) : (
        <>
          <Tabs items={TABS} active={tab} onChange={setTab} className="mb-4" />

          <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Tile label="Total mapped" value={totalLabel} />
            <Tile label="Affected" value={affectedLabel} accent />
            <Tile label="Share affected" value={`${pct}%`} />
            <Tile
              label="Data source"
              value={source === 'sample' ? 'sample' : 'overture'}
              small
            />
          </div>

          <div className="rounded-lg border border-border bg-panel p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search features…"
                className="h-9 w-56 rounded-md border border-border bg-panel2 px-3 text-xs text-text placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
              <label className="flex cursor-pointer items-center gap-2 text-xs text-muted">
                <input
                  type="checkbox"
                  checked={affectedOnly}
                  onChange={(e) => setAffectedOnly(e.target.checked)}
                  className="h-3.5 w-3.5 accent-[#38BDF8]"
                />
                Affected only
              </label>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted">
                    <th className="py-2 pr-4 font-medium">Name</th>
                    <th className="py-2 pr-4 font-medium">Status</th>
                    <th className="py-2 pr-4 font-medium">Impact</th>
                    <th className="py-2 pr-4 font-medium">Reason</th>
                    <th className="py-2 font-medium">Band</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-b border-border/50 hover:bg-panel2">
                      <td className="py-2.5 pr-4 font-medium text-text">{r.name}</td>
                      <td className="py-2.5 pr-4">
                        <span className={r.affected ? 'text-critical' : 'text-low'}>
                          {r.affected ? 'affected' : 'clear'}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-panel2">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${r.score * 100}%`,
                                background: { CRITICAL: '#EF4444', HIGH: '#F97316', MEDIUM: '#EAB308', LOW: '#22C55E' }[r.risk],
                              }}
                            />
                          </div>
                          <span className="font-mono text-muted">{r.score.toFixed(2)}</span>
                        </div>
                      </td>
                      <td className="py-2.5 pr-4 text-muted">{r.reason}</td>
                      <td className="py-2.5">
                        <SeverityBadge band={r.risk} size="sm" withDot={false} />
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted">
                        No features match the current filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[11px] text-muted">
              {source === 'sample'
                ? 'Source: bundled sample GeoJSON (fictional demo features).'
                : 'Source: Overture Maps footprints clipped to the AOI (OSM data is ODbL-attributed).'}
            </p>
            <DataConfidence tags={['DATASET', 'MODEL PREDICTION']} />
          </div>
        </>
      )}
    </div>
  )
}

function Tile({ label, value, accent, small }) {
  return (
    <div className="rounded-lg border border-border bg-panel px-4 py-3">
      <p className="text-[10px] uppercase tracking-wider text-muted">{label}</p>
      <p
        className={`mt-1 font-mono font-semibold ${small ? 'text-sm' : 'text-xl'} ${accent ? 'text-accent' : 'text-text'}`}
      >
        {value}
      </p>
    </div>
  )
}
