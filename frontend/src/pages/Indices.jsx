import { useState } from 'react'
import { useParams } from 'react-router-dom'
import DataConfidence from '../components/data/DataConfidence.jsx'
import Alert from '../components/ui/Alert.jsx'
import Button from '../components/ui/Button.jsx'
import Tabs from '../components/ui/Tabs.jsx'
import { toast } from '../components/ui/toast.js'
import { INDICES } from '../utils/mockData.js'

const TILES = {
  ndwi: {
    pre: 'linear-gradient(135deg,#1b2a3d 0%,#25404f 55%,#2f5f63 100%)',
    post: 'linear-gradient(135deg,#1c4a63 0%,#2f8fb8 55%,#57d3e8 100%)',
    delta: 'linear-gradient(135deg,#0f2d4a 0%,#2f8fb8 50%,#f5e6c8 100%)',
  },
  ndvi: {
    pre: 'linear-gradient(135deg,#1f4a2a 0%,#3f8f47 55%,#8fd06a 100%)',
    post: 'linear-gradient(135deg,#3a3f2a 0%,#6b7a3f 55%,#b0a86a 100%)',
    delta: 'linear-gradient(135deg,#7a1f1f 0%,#7a6a3f 50%,#1f4a2a 100%)',
  },
}

export default function Indices() {
  const { eventId } = useParams()
  const [tab, setTab] = useState('ndwi')
  const idx = INDICES[tab]
  const tiles = TILES[tab]

  return (
    <div className="mx-auto max-w-[1400px]">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-text">NDVI / NDWI Analysis</h1>
          <p className="mt-1 font-mono text-xs text-muted">
            {idx.formula} · event {eventId}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => toast('Layer added to the map view (mock)')}>
          Apply to map
        </Button>
      </header>

      <Tabs
        items={[
          { id: 'ndwi', label: 'NDWI — water' },
          { id: 'ndvi', label: 'NDVI — vegetation' },
        ]}
        active={tab}
        onChange={setTab}
        className="mb-5"
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Tile label={`${idx.label} — pre-event`} subtitle="baseline" gradient={tiles.pre} value={idx.pre.mean} />
        <Tile label={`${idx.label} — post-event`} subtitle="after event" gradient={tiles.post} value={idx.post.mean} />
        <Tile
          label={`${idx.label} — difference`}
          subtitle="post − pre (diverging)"
          gradient={tiles.delta}
          value={idx.delta}
          accent
        />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="rounded-lg border border-border bg-panel p-4">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted">Statistics</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="py-2 pr-4 font-medium">Metric</th>
                  <th className="py-2 pr-4 font-medium">Pre-event</th>
                  <th className="py-2 pr-4 font-medium">Post-event</th>
                  <th className="py-2 font-medium">Δ</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {[
                  ['min', idx.pre.min, idx.post.min],
                  ['max', idx.pre.max, idx.post.max],
                  ['mean', idx.pre.mean, idx.post.mean],
                  ['std', idx.pre.std, idx.post.std],
                  ['% above threshold', idx.pre.aboveThreshold, idx.post.aboveThreshold],
                ].map(([k, a, b]) => (
                  <tr key={k} className="border-b border-border/50">
                    <td className="py-2 pr-4 font-sans text-muted">{k}</td>
                    <td className="py-2 pr-4 text-text">{fmt(a)}</td>
                    <td className="py-2 pr-4 text-text">{fmt(b)}</td>
                    <td className={`py-2 ${b - a > 0 ? 'text-accent2' : b - a < 0 ? 'text-high' : 'text-muted'}`}>
                      {fmt(b - a)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[11px] text-muted">
            Threshold (Otsu): <span className="font-mono text-text">{idx.threshold}</span> · nodata pixels are
            excluded from all statistics.
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-panel p-4">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted">Interpretation</p>
            <p className="text-xs leading-relaxed text-muted">
              {tab === 'ndwi'
                ? 'A positive NDWI change indicates expanding surface water. Pixels that crossed the threshold are the basis of the new-water mask used by change detection.'
                : 'A negative NDVI change indicates vegetation loss or inundation. Combined with the water mask, it separates flooded vegetation from bare-soil change.'}
            </p>
          </div>
          <DataConfidence tags={['MEASURED']} />
        </div>
      </div>

      <Alert variant="info" className="mt-5" title="Sensor applicability">
        Index calculation requires optical bands (Green/NIR, optionally SWIR). For SAR events this page
        returns <span className="font-mono text-text">409 INDEX_NOT_APPLICABLE_TO_SENSOR</span>.
      </Alert>
    </div>
  )
}

function Tile({ label, subtitle, gradient, value, accent }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-panel">
      <div className="flex items-center justify-between px-4 pt-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted">{label}</p>
          <p className="text-[10px] text-muted/70">{subtitle}</p>
        </div>
        <span className={`font-mono text-lg font-semibold ${accent ? 'text-accent' : 'text-text'}`}>
          {fmt(value)}
        </span>
      </div>
      <div className="m-4 mt-3 h-44 rounded-md border border-border/70" style={{ background: gradient }} />
    </div>
  )
}

function fmt(v) {
  if (typeof v !== 'number') return String(v)
  return v.toFixed(2)
}
