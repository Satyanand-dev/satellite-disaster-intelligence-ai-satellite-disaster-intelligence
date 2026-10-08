import { useParams } from 'react-router-dom'
import DataConfidence from '../components/data/DataConfidence.jsx'
import MapPlaceholder from '../components/map/MapPlaceholder.jsx'
import { toast } from '../components/ui/toast.js'
import { CHANGE_POLYGONS, DEMO_EVENT, MAP_SHAPES } from '../utils/mockData.js'

export default function ChangeDetection() {
  const { eventId } = useParams()
  const e = DEMO_EVENT

  return (
    <div className="mx-auto max-w-[1400px]">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-text">Change Detection</h1>
          <p className="mt-1 font-mono text-xs text-muted">
            {e.preDate} → {e.postDate} · event {eventId}
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-border bg-panel px-4 py-2">
          <span className="text-[11px] uppercase tracking-wider text-muted">Change</span>
          <span className="font-mono text-2xl font-semibold text-accent">+{e.changePct}%</span>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <Frame title="Before" subtitle={e.preDate}>
          <path d={MAP_SHAPES.river} stroke="#1E4E6B" strokeWidth="10" fill="none" strokeLinecap="round" />
          <path d={MAP_SHAPES.floodA} fill="#38BDF8" fillOpacity="0.1" stroke="#1E4E6B" strokeWidth="1.5" strokeDasharray="4 4" />
        </Frame>
        <Frame title="After" subtitle={e.postDate}>
          <path d={MAP_SHAPES.river} stroke="#1E4E6B" strokeWidth="14" fill="none" strokeLinecap="round" />
          <path d={MAP_SHAPES.floodA} fill="#38BDF8" fillOpacity="0.35" stroke="#38BDF8" strokeWidth="2" />
          <path d={MAP_SHAPES.floodB} fill="#38BDF8" fillOpacity="0.3" stroke="#38BDF8" strokeWidth="2" />
        </Frame>
        <Frame title="Detected change" subtitle="new water ∖ permanent water">
          <path d={MAP_SHAPES.floodA} fill="#2DD4BF" fillOpacity="0.35" stroke="#2DD4BF" strokeWidth="2" />
          <path d={MAP_SHAPES.floodB} fill="#2DD4BF" fillOpacity="0.35" stroke="#2DD4BF" strokeWidth="2" />
        </Frame>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="rounded-lg border border-border bg-panel p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted">Affected polygons</p>
            <span className="font-mono text-[11px] text-muted">{CHANGE_POLYGONS.length} features</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="py-2 pr-4 font-medium">ID</th>
                  <th className="py-2 pr-4 font-medium">Type</th>
                  <th className="py-2 pr-4 font-medium">Area</th>
                  <th className="py-2 font-medium">Centroid</th>
                </tr>
              </thead>
              <tbody>
                {CHANGE_POLYGONS.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => toast(`Map will fly to ${p.id} (vector layer in F5)`)}
                    className="cursor-pointer border-b border-border/50 transition-colors hover:bg-panel2"
                  >
                    <td className="py-2 pr-4 font-mono text-text">{p.id}</td>
                    <td className="py-2 pr-4">
                      <span
                        className={`rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-wide ${
                          p.type === 'new-water'
                            ? 'border-accent2/40 bg-accent2/10 text-accent2'
                            : 'border-medium/40 bg-medium/10 text-medium'
                        }`}
                      >
                        {p.type.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="py-2 pr-4 font-mono text-text">{p.areaKm2.toFixed(1)} km²</td>
                    <td className="py-2 font-mono text-muted">{p.centroid}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2} className="py-2.5 pr-4 font-medium text-muted">Total affected</td>
                  <td className="py-2.5 pr-4 font-mono font-semibold text-accent">{e.affectedAreaKm2} km²</td>
                  <td className="py-2.5 text-muted">vegetation loss {e.vegetationLossKm2} km²</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-panel p-4">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted">Method</p>
            <ul className="space-y-2 text-xs leading-relaxed text-muted">
              <li>1. Water-index differencing on aligned pre/post rasters</li>
              <li>2. Otsu thresholding per image (recorded with results)</li>
              <li>3. Permanent water excluded using the pre-event baseline</li>
              <li>4. Morphological cleanup + 500 m² minimum polygon area</li>
              <li>5. Vectorisation → GeoJSON, areas computed geodesically</li>
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-panel p-4">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted">Excluded baseline</p>
            <p className="font-mono text-lg font-semibold text-text">{e.permanentWaterKm2} km²</p>
            <p className="mt-1 text-[11px] text-muted">permanent water not counted as affected</p>
          </div>
          <DataConfidence tags={['MEASURED']} />
        </div>
      </div>
    </div>
  )
}

function Frame({ title, subtitle, children }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted">{title}</p>
        <p className="font-mono text-[10px] text-muted/70">{subtitle}</p>
      </div>
      <MapPlaceholder height="h-48">{children}</MapPlaceholder>
    </div>
  )
}
