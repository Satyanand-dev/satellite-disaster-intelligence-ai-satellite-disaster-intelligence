import { Link } from 'react-router-dom'
import { Button, SeverityBadge, StatCard } from '../components/ui/index.js'
import Chart from '../components/data/Chart.jsx'
import MapPlaceholder from '../components/map/MapPlaceholder.jsx'
import { useEventStore } from '../store/eventStore.js'
import { DEMO_EVENT, MAP_SHAPES, RECENT_EVENTS, RISK } from '../utils/mockData.js'
import { riskBand } from '../utils/severity.js'

export default function Dashboard() {
  const { currentEventId, setCurrentEvent } = useEventStore()

  if (!currentEventId) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center justify-center py-24 text-center">
        <h1 className="text-xl font-bold text-text">No active disaster event</h1>
        <p className="mt-2 text-sm text-muted">
          Load the bundled demo event to explore the dashboard, map and analysis pages — or upload your
          own satellite imagery.
        </p>
        <div className="mt-6 flex gap-3">
          <Button onClick={() => setCurrentEvent(DEMO_EVENT.id, DEMO_EVENT.name)}>Load demo event</Button>
          <Link to="/upload">
            <Button variant="secondary">Upload imagery</Button>
          </Link>
        </div>
      </div>
    )
  }

  const e = DEMO_EVENT
  const band = riskBand(RISK.score)

  return (
    <div className="mx-auto max-w-[1400px]">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-text">{e.name}</h1>
            <SeverityBadge band={e.severity.band} />
            <span className="rounded border border-medium/50 bg-medium/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-medium">
              Demo data
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">
            {e.disasterType} · {e.sensorType} · {e.preDate} → {e.postDate} · updated {e.updatedAt}
          </p>
        </div>
        <Link to={`/report/${e.id}`}>
          <Button variant="secondary" size="sm">View situation report</Button>
        </Link>
      </header>

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Active disaster" value="Flood" sub={e.id} />
        <StatCard label="Severity" value={e.severity.band} band={e.severity.band} sub={`score ${e.severity.score}`} />
        <StatCard label="Affected area" value={`${e.affectedAreaKm2} km²`} sub={`${e.changePct}% of AOI`} />
        <StatCard label="Affected buildings" value={e.buildings.affected.toLocaleString()} sub={`${((e.buildings.affected / e.buildings.total) * 100).toFixed(1)}% of ${e.buildings.total.toLocaleString()}`} />
        <StatCard label="Affected roads" value={`${e.roads.blockedCandidates}`} sub={`${e.roads.affectedKm} km affected`} />
        <StatCard label="High-risk zones" value="1" band="CRITICAL" sub="4 more elevated" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div>
          <MapPlaceholder label="flood extent + risk zones" height="h-[58vh]">
            <path
              d={MAP_SHAPES.river}
              stroke="#1E4E6B"
              strokeWidth="14"
              fill="none"
              strokeLinecap="round"
              opacity="0.9"
            />
            <path d={MAP_SHAPES.floodA} fill="#38BDF8" fillOpacity="0.22" stroke="#38BDF8" strokeWidth="2" />
            <path d={MAP_SHAPES.floodB} fill="#38BDF8" fillOpacity="0.22" stroke="#38BDF8" strokeWidth="2" />
            {MAP_SHAPES.zones.map((z) => (
              <path
                key={z.id}
                d={z.d}
                fillOpacity="0.18"
                strokeWidth="2"
                fill={zoneColor(z.band)}
                stroke={zoneColor(z.band)}
              />
            ))}
          </MapPlaceholder>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-muted">
            <LegendDot color="#38BDF8" label="Flood extent" />
            <LegendDot color="#EF4444" label="CRITICAL" />
            <LegendDot color="#F97316" label="HIGH" />
            <LegendDot color="#EAB308" label="MEDIUM" />
            <LegendDot color="#1E4E6B" label="River (baseline)" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-panel p-4">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted">Model confidence</p>
            <div className="flex items-end gap-3">
              <span className="font-mono text-3xl font-semibold text-text">0.83</span>
              <span className="mb-1 text-xs text-muted">heuristic · not calibrated</span>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-panel2">
              <div className="h-full rounded-full bg-accent" style={{ width: '83%' }} />
            </div>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-muted">
              detector: {e.detection.detector}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-panel p-4">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted">
              Severity distribution
            </p>
            <Chart
              data={[
                { label: 'HIGH', value: 1 },
                { label: 'MEDIUM', value: 1 },
                { label: 'LOW', value: 1 },
              ]}
              height={130}
            />
          </div>

          <div className="rounded-lg border border-border bg-panel p-4">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted">Recent events</p>
            <ul className="space-y-2">
              {RECENT_EVENTS.map((ev) => (
                <li key={ev.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[12px] text-text">{ev.name}</p>
                    <p className="font-mono text-[10px] text-muted">{ev.area} · {ev.when}</p>
                  </div>
                  <SeverityBadge band={ev.severity} size="sm" withDot={false} />
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-border bg-panel p-4">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted">Last updated</p>
            <p className="font-mono text-sm text-text">{e.updatedAt}</p>
            <p className="mt-2 text-[11px] leading-relaxed text-muted">
              Risk score <span className="font-mono text-text">{RISK.score}</span> → band{' '}
              <span className="font-medium text-high">{band}</span> (project-defined weights).
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function zoneColor(band) {
  return { CRITICAL: '#EF4444', HIGH: '#F97316', MEDIUM: '#EAB308', LOW: '#22C55E' }[band] ?? '#38BDF8'
}

function LegendDot({ color, label }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color, opacity: 0.85 }} />
      {label}
    </span>
  )
}
