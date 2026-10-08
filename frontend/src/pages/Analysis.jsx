import { Link, useParams } from 'react-router-dom'
import DataConfidence from '../components/data/DataConfidence.jsx'
import MapView from '../components/map/MapView.jsx'
import Alert from '../components/ui/Alert.jsx'
import Button from '../components/ui/Button.jsx'
import SeverityBadge from '../components/ui/SeverityBadge.jsx'
import { DEMO_EVENT } from '../utils/mockData.js'

export default function Analysis() {
  const { eventId } = useParams()
  const e = DEMO_EVENT
  const d = e.detection

  return (
    <div className="mx-auto max-w-[1400px]">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-text">Disaster Analysis</h1>
            <SeverityBadge band={e.severity.band} />
          </div>
          <p className="mt-1 font-mono text-xs text-muted">event {eventId}</p>
        </div>
        <Link to={`/indices/${eventId}`}>
          <Button variant="secondary" size="sm">NDVI / NDWI details</Button>
        </Link>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        {/* visual result */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted">
              Classified result — flood extent
            </p>
            <span className="rounded border border-border bg-panel2 px-1.5 py-0.5 font-mono text-[10px] text-muted">
              {d.tiles} tiles · {d.inferenceMs} ms
            </span>
          </div>
          <MapView layers={['base', 'flood']} height="h-[52vh]" label="post-event classification" />

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Figure label="Pre-event water" value="18.4 km²" />
            <Figure label="Post-event water" value="49.2 km²" />
            <Figure label="Newly flooded" value="24.6 km²" accent />
          </div>
        </div>

        {/* findings rail */}
        <aside className="space-y-4">
          <div className="rounded-lg border border-border bg-panel p-4">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted">Detection</p>
            <div className="space-y-3">
              <Row label="Disaster type" value={<span className="capitalize text-accent">{e.disasterType}</span>} />
              <Row label="Detector" value={<span className="font-mono">{d.detector}{d.fallback ? ' (fallback)' : ''}</span>} />
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted">Model confidence</span>
                  <span className="font-mono text-text">{d.confidence.toFixed(2)}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-panel2">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${d.confidence * 100}%` }} />
                </div>
                <p className="mt-1 text-[10px] text-muted">heuristic — not a calibrated probability</p>
              </div>
              <Row label="Binarisation threshold" value={<span className="font-mono">{d.threshold}</span>} />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-panel p-4">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted">Impact</p>
            <div className="space-y-3">
              <Row label="Affected area" value={<span className="font-mono">{e.affectedAreaKm2} km²</span>} />
              <Row label="AOI coverage" value={<span className="font-mono">{e.changePct}%</span>} />
              <Row label="Severity" value={<SeverityBadge band={e.severity.band} size="sm" />} />
              <Row label="Risk score" value={<span className="font-mono">{e.severity.score} / 100</span>} />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-panel p-4">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted">Data quality</p>
            <div className="space-y-3">
              <Row label="Cloud cover" value={<span className="font-mono">{e.cloud.coverPct}%</span>} />
              <Row label="Cloud handling" value={<span className="font-mono">{e.cloud.handling}</span>} />
              <Row label="Resolution" value={<span className="font-mono">{e.resolutionM} m</span>} />
              <Row label="CRS" value={<span className="font-mono">{e.crs}</span>} />
            </div>
          </div>

          <DataConfidence tags={['MEASURED', 'MODEL PREDICTION', 'DATASET']} className="px-1" />
        </aside>
      </div>

      <Alert variant="info" className="mt-5" title="Demo dataset">
        All values shown are fictional demo values for the demo AOI — not real-world observations.
      </Alert>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="text-muted">{label}</span>
      <span className="text-right text-text">{value}</span>
    </div>
  )
}

function Figure({ label, value, accent }) {
  return (
    <div className="rounded-lg border border-border bg-panel px-4 py-3">
      <p className="text-[10px] uppercase tracking-wider text-muted">{label}</p>
      <p className={`mt-1 font-mono text-lg font-semibold ${accent ? 'text-accent' : 'text-text'}`}>{value}</p>
    </div>
  )
}
