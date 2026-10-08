import { useState } from 'react'
import {
  Alert,
  Button,
  CardSkeleton,
  Drawer,
  EmptyState,
  ErrorState,
  Input,
  Modal,
  StatCard,
  StatCardSkeleton,
  TableSkeleton,
  Tabs,
  Toasts,
  toast,
} from '../components/ui/index.js'
import SeverityBadge from '../components/ui/SeverityBadge.jsx'

/**
 * Component gallery — visual verification of the design system (plan.md §F).
 * Replaced by the real router shell in F3; kept at /_ui as a dev reference.
 */
export default function UiKit() {
  const [tab, setTab] = useState('overview')
  const [modalOpen, setModalOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="min-h-screen bg-bg px-8 py-10">
      <Toasts />
      <header className="mb-8 border-b border-border pb-5">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">design system</p>
        <h1 className="mt-1 text-2xl font-bold text-text">UI Kit — Satellite Disaster Intelligence</h1>
        <p className="mt-1 text-sm text-muted">
          Tokens: bg #0B1220 · panel #111A2C · accent #38BDF8 · severity LOW/MEDIUM/HIGH/CRITICAL
        </p>
      </header>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Start Analysis</Button>
          <Button variant="secondary">Cancel</Button>
          <Button variant="ghost">Skip</Button>
          <Button variant="danger">Delete Event</Button>
          <Button loading>Saving</Button>
          <Button size="sm">Small</Button>
          <Button size="lg" variant="secondary">
            Large
          </Button>
        </div>
      </Section>

      <Section title="Inputs">
        <div className="grid max-w-xl gap-4">
          <Input label="Email" name="email" placeholder="analyst@demo.com" required />
          <Input label="Password" name="password" type="password" placeholder="••••••••" required />
          <Input label="AOI name" name="aoi" hint="Shown on the dashboard and in the report" />
          <Input label="File" name="file" error="Unsupported format — expected GeoTIFF (.tif)" />
        </div>
      </Section>

      <Section title="Severity badges">
        <div className="flex flex-wrap items-center gap-3">
          <SeverityBadge band="LOW" />
          <SeverityBadge band="MEDIUM" />
          <SeverityBadge band="HIGH" />
          <SeverityBadge band="CRITICAL" />
          <SeverityBadge band={null} />
          <SeverityBadge band="HIGH" size="sm" />
        </div>
      </Section>

      <Section title="Stat cards">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Affected area" value="24.6 km²" sub="7.9% of AOI" />
          <StatCard label="Severity" value="HIGH" band="HIGH" sub="risk score 67.4" />
          <StatCard label="Affected buildings" value="1,240" sub="10.0% of 12,400" />
          <StatCard label="Model confidence" value="0.83" sub="U-Net v1" />
          <StatCard label="Loading" value="—" loading />
        </div>
      </Section>

      <Section title="Alerts">
        <div className="grid max-w-2xl gap-3">
          <Alert variant="info" title="Analysis queued">
            The pipeline will start when a worker picks up the job.
          </Alert>
          <Alert variant="success" title="Report generated">Source: template fallback (no LLM key set).</Alert>
          <Alert variant="warning" title="Cloud unresolved">
            No SCL/QA band found — cloud cover could not be masked.
          </Alert>
          <Alert variant="error" title="Upload rejected">
            File has no CRS. Supply an EPSG code or re-export with projection.
          </Alert>
        </div>
      </Section>

      <Section title="Tabs">
        <div className="max-w-2xl">
          <Tabs
            items={[
              { id: 'overview', label: 'Overview' },
              { id: 'ndwi', label: 'NDWI', badge: 'new' },
              { id: 'ndvi', label: 'NDVI' },
              { id: 'change', label: 'Change', badge: 12 },
            ]}
            active={tab}
            onChange={setTab}
          />
          <p className="px-1 py-4 text-sm text-muted">Active tab: <span className="text-text">{tab}</span></p>
        </div>
      </Section>

      <Section title="States">
        <div className="grid gap-4 lg:grid-cols-2">
          <EmptyState
            title="No infrastructure data for this area"
            description="Upload a GeoJSON layer or configure an OpenStreetMap source for this AOI."
            action={<Button size="sm">Upload GeoJSON</Button>}
          />
          <ErrorState
            message="Flood detection failed: model weights not found. Falling back to index thresholding."
            errorId="e_9f3a"
            onRetry={() => toast.error('Retry clicked (mock)')}
          />
        </div>
      </Section>

      <Section title="Loading skeletons">
        <div className="grid gap-4 lg:grid-cols-3">
          <StatCardSkeleton />
          <CardSkeleton />
          <TableSkeleton rows={3} cols={3} />
        </div>
      </Section>

      <Section title="Overlays">
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setModalOpen(true)}>Open modal</Button>
          <Button variant="secondary" onClick={() => setDrawerOpen(true)}>Open drawer</Button>
          <Button variant="ghost" onClick={() => toast.success('Toast notification (mock)')}>
            Fire toast
          </Button>
        </div>
      </Section>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Cancel analysis job?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Keep running</Button>
            <Button variant="danger" onClick={() => { setModalOpen(false); toast.success('Job cancelled (mock)') }}>
              Cancel job
            </Button>
          </>
        }
      >
        <p className="text-muted">
          The pipeline is at stage <span className="font-mono text-text">AI_DETECT</span>. Cancelling stops
          all remaining stages and keeps partial results.
        </p>
      </Modal>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Risk zone z1">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <SeverityBadge band="CRITICAL" />
            <span className="font-mono text-xl font-semibold text-text">81.2</span>
          </div>
          {[
            ['Severity', 81],
            ['Population exposure', 62],
            ['Infrastructure impact', 74],
            ['Accessibility', 45],
          ].map(([label, pct]) => (
            <div key={label}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-muted">{label}</span>
                <span className="font-mono text-text">{pct}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-panel2">
                <div className="h-1.5 rounded-full bg-accent" style={{ width: `${pct}%` }} />
              </div>
            </div>
          ))}
          <p className="text-[11px] leading-relaxed text-muted">
            Weights are project-defined assumptions (plan.md §O) — not an authoritative standard.
          </p>
        </div>
      </Drawer>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-muted">{title}</h2>
      <div className="rounded-lg border border-border bg-panel/60 p-5">{children}</div>
    </section>
  )
}
