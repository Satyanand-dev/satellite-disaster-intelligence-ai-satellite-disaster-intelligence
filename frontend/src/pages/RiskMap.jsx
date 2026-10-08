import { useState } from 'react'
import { useParams } from 'react-router-dom'
import DataConfidence from '../components/data/DataConfidence.jsx'
import MapPlaceholder from '../components/map/MapPlaceholder.jsx'
import Drawer from '../components/ui/Drawer.jsx'
import SeverityBadge from '../components/ui/SeverityBadge.jsx'
import { MAP_SHAPES, RISK, RISK_ZONES } from '../utils/mockData.js'

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

const BUILDING_PINS = [
  [150, 140], [210, 300], [330, 260], [420, 210], [500, 180], [560, 240],
  [620, 300], [680, 330], [250, 350], [380, 330], [470, 320], [600, 150],
]
const CRITICAL_PINS = [
  { x: 300, y: 280, type: 'hospital' },
  { x: 520, y: 200, type: 'school' },
  { x: 180, y: 170, type: 'shelter' },
]

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
          <MapPlaceholder label="click a zone for details" height="h-[70vh]">
            {/* satellite mock texture */}
            {active.has('satellite') && (
              <rect x="0" y="0" width="800" height="450" fill="#1a2b1f" fillOpacity="0.5" />
            )}
            {active.has('base') && (
              <path d={MAP_SHAPES.river} stroke="#1E4E6B" strokeWidth="14" fill="none" strokeLinecap="round" />
            )}
            {active.has('flood') && (
              <>
                <path d={MAP_SHAPES.floodA} fill="#38BDF8" fillOpacity="0.22" stroke="#38BDF8" strokeWidth="2" />
                <path d={MAP_SHAPES.floodB} fill="#38BDF8" fillOpacity="0.22" stroke="#38BDF8" strokeWidth="2" />
              </>
            )}
            {active.has('change') && (
              <path d={MAP_SHAPES.floodA} fill="#2DD4BF" fillOpacity="0.15" stroke="#2DD4BF" strokeWidth="4" strokeDasharray="8 5" />
            )}
            {active.has('roads') && (
              <g stroke="#E6EDF7" strokeOpacity="0.5" strokeWidth="2" fill="none">
                <path d="M 60 400 L 300 300 L 520 320 L 760 250" />
                <path d="M 120 60 L 260 200 L 470 150 L 700 90" />
                <path d="M 400 430 L 380 250 L 430 90" />
              </g>
            )}
            {active.has('buildings') &&
              BUILDING_PINS.map(([x, y], i) => (
                <rect key={i} x={x} y={y} width="8" height="8" fill="#8FA3C0" fillOpacity="0.9" />
              ))}
            {active.has('critical') &&
              CRITICAL_PINS.map((p, i) => (
                <g key={i} transform={`translate(${p.x} ${p.y})`}>
                  <circle r="7" fill="#0B1220" stroke="#2DD4BF" strokeWidth="2.5" />
                  <circle r="2.2" fill="#2DD4BF" />
                </g>
              ))}
            {active.has('risk') &&
              RISK_ZONES.map((z) => {
                const shape = MAP_SHAPES.zones.find((s) => s.id === z.id)
                if (!shape) return null
                const isSel = selected?.id === z.id
                return (
                  <path
                    key={z.id}
                    d={shape.d}
                    fill={COLORS[z.band]}
                    fillOpacity={isSel ? 0.4 : 0.18}
                    stroke={COLORS[z.band]}
                    strokeWidth={isSel ? 4 : 2}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelected(z)}
                  >
                    <title>{`${z.id} — ${z.band} (${z.score})`}</title>
                  </path>
                )
              })}
          </MapPlaceholder>

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
