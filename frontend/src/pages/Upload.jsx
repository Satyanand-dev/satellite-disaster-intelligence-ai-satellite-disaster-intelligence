import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Alert from '../components/ui/Alert.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import UploadBox from '../components/upload/UploadBox.jsx'
import { toast } from '../components/ui/toast.js'
import { useEventStore } from '../store/eventStore.js'
import { DEMO_EVENT } from '../utils/mockData.js'
import { validateRasterFile } from '../utils/validateRaster.js'

export default function Upload() {
  const navigate = useNavigate()
  const { setCurrentEvent } = useEventStore()

  const [pre, setPre] = useState(null)
  const [post, setPost] = useState(null)
  const [errors, setErrors] = useState({})
  const [meta, setMeta] = useState({
    name: '',
    disasterType: 'flood',
    sensorType: 'optical',
    preDate: '',
    postDate: '',
    epsg: '',
  })
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState({ pre: null, post: null })

  const preError = useMemo(() => (pre ? validateRasterFile(pre) : null), [pre])
  const postError = useMemo(() => (post ? validateRasterFile(post) : null), [post])

  const metaErrors = {}
  if (!meta.name.trim()) metaErrors.name = 'Event name is required.'
  if (!meta.preDate) metaErrors.preDate = 'Required.'
  if (!meta.postDate) metaErrors.postDate = 'Required.'
  if (meta.preDate && meta.postDate && meta.postDate <= meta.preDate)
    metaErrors.postDate = 'Must be after the pre-event date.'

  const bothValid = Boolean(pre && post && !preError && !postError)
  const canSubmit = bothValid && Object.keys(metaErrors).length === 0 && !uploading

  function setFile(role, file) {
    if (role === 'pre') setPre(file)
    else setPost(file)
  }
  function clearFile(role) {
    if (role === 'pre') setPre(null)
    else setPost(null)
  }

  function handleSubmit(e) {
    e.preventDefault()
    setErrors({})
    if (!bothValid) {
      setErrors({ form: 'Both a pre-event and a post-event raster are required.' })
      return
    }
    if (Object.keys(metaErrors).length > 0) {
      setErrors({ form: 'Fix the highlighted fields before starting.' })
      return
    }

    setUploading(true)
    setProgress({ pre: 0, post: 0 })

    // Simulated multipart upload with progress (real XHR progress lands with the API phase).
    const t0 = performance.now()
    const tick = window.setInterval(() => {
      const p = Math.min(100, Math.round(((performance.now() - t0) / 1400) * 100))
      setProgress({ pre: p, post: Math.max(0, p - 12) })
      if (p >= 100) {
        window.clearInterval(tick)
        const id = meta.name.trim().toLowerCase().startsWith('demo') ? DEMO_EVENT.id : 'evt_local_01'
        setCurrentEvent(id, meta.name.trim())
        toast.success('Upload complete — analysis queued')
        navigate(`/processing/${id}`)
      }
    }, 60)
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-6xl" noValidate>
      <header className="mb-5">
        <h1 className="text-xl font-bold text-text">Satellite Data Upload</h1>
        <p className="mt-1 text-sm text-muted">
          Provide paired pre- and post-disaster rasters. Geospatial validity (CRS, bands, resolution) is
          verified by the backend after upload.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <UploadBox
              label="Pre-disaster image"
              role="before"
              file={pre}
              error={preError}
              progress={progress.pre}
              onFile={(f) => setFile('pre', f)}
              onClear={() => clearFile('pre')}
              hint="Acquired before the event — the change-detection baseline."
            />
            <UploadBox
              label="Post-disaster image"
              role="after"
              file={post}
              error={postError}
              progress={progress.post}
              onFile={(f) => setFile('post', f)}
              onClear={() => clearFile('post')}
              hint="Acquired after the event — analysed for flooding and change."
            />
          </div>

          <div className="rounded-lg border border-border bg-panel p-4">
            <p className="mb-4 text-[11px] font-medium uppercase tracking-wider text-muted">Event metadata</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Event name"
                name="name"
                required
                placeholder="e.g. Kosi Basin Flood"
                value={meta.name}
                onChange={(e) => setMeta({ ...meta, name: e.target.value })}
                error={meta.name.trim() ? undefined : undefined}
                hint="Shown on the dashboard and in the report"
              />
              <Input
                label="EPSG code (optional)"
                name="epsg"
                placeholder="e.g. 32645"
                value={meta.epsg}
                onChange={(e) => setMeta({ ...meta, epsg: e.target.value })}
                hint="Required only if the raster carries no CRS"
              />
              <div className="flex flex-col gap-1.5">
                <label htmlFor="disasterType" className="text-xs font-medium text-muted">
                  Disaster type <span className="text-critical">*</span>
                </label>
                <select
                  id="disasterType"
                  value={meta.disasterType}
                  onChange={(e) => setMeta({ ...meta, disasterType: e.target.value })}
                  className="h-10 w-full rounded-md border border-border bg-panel2 px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent/40"
                >
                  <option value="flood">Flood (MVP)</option>
                  <option value="fire" disabled>Fire — phase 2</option>
                  <option value="landslide" disabled>Landslide — phase 3</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="sensorType" className="text-xs font-medium text-muted">
                  Sensor type <span className="text-critical">*</span>
                </label>
                <select
                  id="sensorType"
                  value={meta.sensorType}
                  onChange={(e) => setMeta({ ...meta, sensorType: e.target.value })}
                  className="h-10 w-full rounded-md border border-border bg-panel2 px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent/40"
                >
                  <option value="optical">Optical (Sentinel-2, Landsat…)</option>
                  <option value="sar">SAR (Sentinel-1 VV/VH)</option>
                </select>
              </div>
              <Input
                label="Pre-event date"
                name="preDate"
                type="date"
                required
                value={meta.preDate}
                onChange={(e) => setMeta({ ...meta, preDate: e.target.value })}
                error={metaErrors.preDate}
              />
              <Input
                label="Post-event date"
                name="postDate"
                type="date"
                required
                value={meta.postDate}
                onChange={(e) => setMeta({ ...meta, postDate: e.target.value })}
                error={metaErrors.postDate}
              />
            </div>

            {meta.sensorType === 'sar' && (
              <Alert variant="warning" title="SAR sensor selected" className="mt-4">
                NDWI/NDVI are not applicable to SAR. The pipeline will use backscatter analysis and the
                segmentation model instead.
              </Alert>
            )}
          </div>

          {errors.form && <Alert variant="error">{errors.form}</Alert>}

          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] text-muted">
              Max 512 MB per file · formats: GeoTIFF, JP2, NetCDF
            </p>
            <Button type="submit" loading={uploading} disabled={!canSubmit}>
              {uploading ? 'Uploading…' : 'Start analysis'}
            </Button>
          </div>
        </div>

        {/* probe / info rail */}
        <aside className="h-fit rounded-lg border border-border bg-panel p-4">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted">File probe</p>
          {!bothValid ? (
            <p className="text-xs leading-relaxed text-muted">
              Select both rasters to inspect metadata. The backend will report CRS, bounds, band layout and
              resolution after upload.
            </p>
          ) : (
            <dl className="space-y-2 text-xs">
              {[
                ['Pre', pre.name],
                ['Post', post.name],
                ['Pre size', `${(pre.size / 1024 / 1024).toFixed(1)} MB`],
                ['Post size', `${(post.size / 1024 / 1024).toFixed(1)} MB`],
                ['Sensor', meta.sensorType],
                ['Disaster', meta.disasterType],
                ['CRS', meta.epsg ? `EPSG:${meta.epsg}` : 'pending server probe'],
                ['Format', 'acceptable (client check)'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 border-b border-border/60 pb-1.5">
                  <dt className="text-muted">{k}</dt>
                  <dd className="truncate text-right font-mono text-text" title={String(v)}>
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          <Alert variant="info" className="mt-4" title="Validation pipeline">
            Client-side checks cover format and size. The server additionally verifies CRS, band count, AOI
            area and raster integrity.
          </Alert>
        </aside>
      </div>
    </form>
  )
}
