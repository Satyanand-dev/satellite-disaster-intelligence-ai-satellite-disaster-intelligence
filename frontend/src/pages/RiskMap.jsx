import { useState } from 'react'
import { useParams } from 'react-router-dom'
import DataConfidence from '../components/data/DataConfidence.jsx'
import MapView from '../components/map/MapView.jsx'
import Drawer from '../components/ui/Drawer.jsx'
import SeverityBadge from '../components/ui/SeverityBadge.jsx'
import { RISK, RISK_ZONES } from '../utils/mockData.js'

const LAYERS = [
  { id: 'base', label: 'Base map', locked: true },
  { id: 'satellite', label: 'Satellite imagery' },
  { id: 'flood', label: 'Flood extent' },
  { id: 'change', label: 'Change detection' },
  { id: 'buildings', label: 'Buildings' },
  { id: 'roads', label: 'Roads' },
  { id: 'critical', label: 'Critical infrastructure' },
  { id: 'risk', label: 'Risk zones' },
]

const COLORS = { CRITICAL: '#EF4444', HIGH: '#F97316', MEDIUM: '#EAB308', LOW: '#22C55E' }

export default function RiskMap() {
  const { eventId } = useParams()
  const [active, setActive] = useState(() => new Set(['base', 'flood', 'risk']))
  const [selected, setSelected] = useState(null)

  function toggle(id) {
    if (LAYERS.find((l) => l.id === id)?.locked) return
    setActive((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="mx-auto flex max-w-[1500px] flex-col">
      <header className="mb-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-xl font-bold text-text">Risk Map</h1>
          <SeverityBadge band={RISK.band} />
          <span className="rounded border border-medium/50 bg-medium/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-medium">
            Demo data
          </span>
        </div>
        <p className="mt-1 font-mono text-xs text-muted">event {eventId}</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        {/* layer control */}
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-panel p-4">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted">Layers</p>
            <ul className="space-y-1">
              {LAYERS.map((l) => {
                const on = active.has(l.id)
                return (
                  <li key={l.id}>
                    <label
                      className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] ${
                        l.locked ? 'cursor-not-allowed text-muted/60' : 'cursor-pointer text-text hover:bg-panel2'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={on}
                        disabled={l.locked}
                        onChange={() => toggle(l.id)}
                        className="h-3.5 w-3.5 accent-[#38BDF8]"
                      />
                      {l.label}
                      {l.locked && <span className="ml-auto font-mono text-[9px] text-muted/60">always</span>}
                    </label>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="rounded-lg border border-border bg-panel p-4">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted">Legend</p>
            <ul className="space-y-1.5 text-xs">
              <li className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm" style={{ background: '#38BDF8', opacity: 0.6 }} /> Flood extent
              </li>
              {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((b) => (
                <li key={b} className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm" style={{ background: COLORS[b], opacity: 0.7 }} />
                  {b} risk zone
                </li>
              ))}
              <li className="flex items-center gap-2 text-muted">
                <span className="h-3 w-3 rounded-full border border-accent2" /> critical facility
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-border bg-panel p-4">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted">Risk formula</p>
            <p className="font-mono text-[11px] leading-relaxed text-text">
              risk = 100 × (0.40·S + 0.25·P + 0.25·I + 0.10·(1−A))
            </p>
            <p className="mt-2 text-[11px] leading-relaxed text-muted">{RISK.disclosure}</p>
            <DataConfidence tags={['ASSUMPTION', 'MODEL PREDICTION']} className="mt-3" />
          </div>
        </div>

        {/* map */}
        <div>
          <MapView
            layers={[...active]}
            height="h-[70vh]"
            label="click a zone for details"
            onZoneClick={(id) => setSelected(RISK_ZONES.find((z) => z.id === id) ?? null)}
            selectedZoneId={selected?.id}
          />

          <p className="mt-2 text-[11px] text-muted">
            Click a risk zone polygon to inspect its score breakdown.
          </p>
        </div>
      </div>

      <Drawer open={Boolean(selected)} onClose={() => setSelected(null)} title={selected ? `Risk zone ${selected.id}` : ''}>
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <SeverityBadge band={selected.band} />
              <span className="font-mono text-2xl font-semibold text-text">{selected.score.toFixed(1)}</span>
            </div>

            <div className="rounded-md border border-border bg-panel2 p-3 text-xs">
              <div className="flex justify-between">
                <span className="text-muted">Area</span>
                <span className="font-mono text-text">{selected.areaKm2} km²</span>
              </div>
            </div>

            <div>
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted">
                Score components
              </p>
              <div className="space-y-3">
                {[
                  ['Severity', selected.components.severity],
                  ['Population exposure', selected.components.population],
                  ['Infrastructure impact', selected.components.infrastructure],
                  ['Accessibility (inverted)', selected.components.accessibility],
                ].map(([label, v]) => (
                  <div key={label}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-muted">{label}</span>
                      <span className="font-mono text-text">{(v * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-panel2">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${v * 100}%`, background: COLORS[selected.band] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted">Why this score</p>
              <ul className="space-y-1.5 text-xs text-muted">
                {selected.reasons.map((r) => (
                  <li key={r} className="flex gap-2">
                    <span className="text-accent">›</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-[11px] leading-relaxed text-muted">{RISK.disclosure}</p>
          </div>
        )}
      </Drawer>
    </div>
  )
}
