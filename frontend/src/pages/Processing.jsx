import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProgressPipeline from '../components/pipeline/ProgressPipeline.jsx'
import Button from '../components/ui/Button.jsx'
import { toast } from '../components/ui/toast.js'
import { PIPELINE_STAGES } from '../utils/mockData.js'

const STAGE_MS = 750

export default function Processing() {
  const { jobId } = useParams()
  const [index, setIndex] = useState(0)
  const [status, setStatus] = useState('running')
  const [stages, setStages] = useState(() =>
    PIPELINE_STAGES.map((s, i) => ({ ...s, status: i === 0 ? 'active' : 'pending', elapsedMs: undefined })),
  )
  const timerRef = useRef(null)

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setIndex((prev) => {
        const next = prev + 1
        setStages((list) =>
          list.map((s, i) => ({
            ...s,
            status: i < next ? 'done' : i === next ? 'active' : 'pending',
            elapsedMs: i < next ? STAGE_MS + i * 37 : s.elapsedMs,
          })),
        )
        if (next >= PIPELINE_STAGES.length) {
          window.clearInterval(timerRef.current)
          setStatus('completed')
          return prev
        }
        return next
      })
    }, STAGE_MS)
    return () => window.clearInterval(timerRef.current)
  }, [])

  const progress = status === 'completed' ? 100 : PIPELINE_STAGES[Math.min(index, PIPELINE_STAGES.length - 1)].pct

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-5">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold text-text">Processing</h1>
          <span className="rounded border border-border bg-panel2 px-1.5 py-0.5 font-mono text-[10px] text-muted">
            job {jobId}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted">
          Pipeline stages run sequentially in a background worker (plan.md §E.2).
        </p>
      </header>

      <ProgressPipeline stages={stages} progress={progress} status={status} />

      {status === 'completed' ? (
        <div className="mt-5 rounded-lg border border-low/30 bg-low/5 p-5">
          <p className="text-sm font-semibold text-text">Analysis complete</p>
          <p className="mt-1 text-xs text-muted">
            All 8 stages finished. Review the results across the analysis pages.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to={`/analysis/${jobId}`}><Button size="sm">Disaster analysis</Button></Link>
            <Link to={`/change/${jobId}`}><Button size="sm" variant="secondary">Change detection</Button></Link>
            <Link to={`/risk/${jobId}`}><Button size="sm" variant="secondary">Risk map</Button></Link>
            <Link to={`/report/${jobId}`}><Button size="sm" variant="secondary">Situation report</Button></Link>
          </div>
        </div>
      ) : (
        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-xs text-muted">Elapsed stages run server-side — safe to leave this page.</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              toast('Analysis continues in the background')
            }}
          >
            Run in background
          </Button>
        </div>
      )}
    </div>
  )
}
