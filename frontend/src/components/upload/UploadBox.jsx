import clsx from 'clsx'
import { useRef, useState } from 'react'
import { ACCEPTED } from '../../utils/validateRaster.js'

/**
 * Drag & drop raster dropzone with client-side validation (plan.md §G page 3).
 * Server-side CRS/band validation happens after upload (backend phase).
 */
export default function UploadBox({ label, role, hint, file, error, onFile, onClear, progress = null }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  function handleFiles(list) {
    const f = list?.[0]
    if (f) onFile(f)
  }

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <p className="text-xs font-medium text-muted">
          {label} <span className="text-critical">*</span>
        </p>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted/60">{role}</span>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          handleFiles(e.dataTransfer.files)
        }}
        className={clsx(
          'flex min-h-[132px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-5 text-center transition-colors',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
          dragging ? 'border-accent bg-accent/5' : error ? 'border-critical/50 bg-critical/5' : 'border-border bg-panel2/60 hover:border-accent/50',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={ACCEPTED.join(',')}
          onChange={(e) => handleFiles(e.target.files)}
        />

        {file ? (
          <div className="w-full">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-[13px] font-medium text-text">{file.name}</p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onClear()
                }}
                className="shrink-0 rounded p-1 text-muted hover:text-critical"
                aria-label="Remove file"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="mt-1 font-mono text-[11px] text-muted">
              {(file.size / 1024 / 1024).toFixed(1)} MB · {file.name.split('.').pop().toUpperCase()}
            </p>
            {progress != null && (
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-panel">
                <div className="h-full bg-accent transition-all" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>
        ) : (
          <>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="mb-2 text-muted">
              <path d="M12 16V4m0 0L7 9m5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" />
            </svg>
            <p className="text-[13px] text-text">
              Drop <span className="text-accent">{label}</span> here or click to browse
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted/70">
              GeoTIFF · JP2 · NetCDF — max 512 MB
            </p>
          </>
        )}
      </div>

      {hint && !error && <p className="mt-1 text-[11px] text-muted">{hint}</p>}
      {error && <p className="mt-1 text-[11px] text-critical">{error}</p>}
    </div>
  )
}
