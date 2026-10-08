# AI-POWERED SATELLITE DISASTER INTELLIGENCE & EMERGENCY RESPONSE SYSTEM
## Complete Technical Project Blueprint (Planning Phase — No Code Written)

---

## A. Executive Summary

**What we are building:** a full-stack, map-centric web platform that ingests pre-/post-disaster satellite imagery, runs a deterministic geospatial processing chain (preprocessing → spectral indices → AI segmentation → change detection → infrastructure overlay → risk scoring), renders results on an interactive GIS dashboard, and produces an AI-assisted situation report with PDF export.

**Core architectural decisions:**

| Decision | Choice | Why |
|---|---|---|
| Frontend | React 18 + Vite + React-Leaflet + TailwindCSS | Fast dev loop, map-first UI, no SSR needed |
| Backend | Python 3.11 + FastAPI (modular routers) | Async, typed, native Python geospatial/AI ecosystem |
| DB | PostgreSQL 15 + PostGIS 3.4 | Spatial joins, geodesic area, GIST indexes; single DB for both relational + spatial |
| Jobs | Redis + **RQ** | Survives API restarts, retries, 1 process to run; Celery is overkill, `BackgroundTasks` is fragile |
| Raster/GIS | rasterio, GDAL, geopandas, shapely, pyproj, scikit-image | De-facto standard, all conda/pip installable |
| AI | U-Net (ResNet34 encoder) via `segmentation-models-pytorch` + rule-based index thresholding as guaranteed fallback | Two interchangeable detectors behind one interface |
| Map rendering | Leaflet `ImageOverlay` (server-rendered RGBA PNG) + GeoJSON vectors | No tile server needed for MVP; TiTiler/PMTiles is a later upgrade |
| Report LLM | OpenAI-compatible API (configurable base URL → OpenAI/Groq/Ollama) + deterministic template fallback | Works with or without an API key |
| Storage | Local filesystem behind a `StorageBackend` abstraction | Cloud object storage is a drop-in later |
| Infra | Docker Compose (5 services) | One command local dev, one command deploy |

**Explicitly rejected:** Kubernetes, microservices, Kafka, Elasticsearch, GraphQL, gRPC, MLflow, airflow. Nothing here justifies them at this scale.

**Verified external dependencies** (researched, not assumed — see §R for full detail):

- **Sen1Floods11** — exists, public GCS bucket `gs://sen1floods11`, 4,831 × 512×512 chips @10 m, 11 flood events; hand-labeled subset is only ~697 MB (S1Hand 695 MB + labels 2.4 MB).
- **FloodNet** — exists, `github.com/BinaLab/FloodNet-Supervised_v1.0`, UAV post-Harvey, 9 classes.
- **xBD** — exists, 850,736 building polygons / 22,068 pre-post image pairs / 19 disasters (registration required).
- **Overture Maps buildings + transportation** — free GeoParquet on `s3://overturemaps-us-west-2/release/`, no AWS account needed.
- **Sentinel-2 L2A COGs** — free via Element84 Earth Search (`s3://e84-earth-search-sentinel-data`, no requester-pays) and Microsoft Planetary Computer STAC (no key for search).
- **RescueNet** — exists (Nature *Scientific Data* 2023), UAV Hurricane Michael, damage-severity labels.

---

## B. Understanding of the Project

### The four questions the system must answer

| Question | Which pipeline stage answers it | Output artifact |
|---|---|---|
| What happened? | AI detection + spectral analysis | `disaster_type`, `confidence`, index maps |
| Where? | GIS change detection + vectorization | GeoJSON polygons, map layers, AOI |
| How severe? | Severity engine + risk engine | `severity` enum, `risk_score`, zone polygons |
| What to prioritize? | Infrastructure overlay + risk + report agent | Ranked priority list, affected counts |

### Contradictions / unrealistic requirements identified (and resolutions)

1. **NDWI vs. Sentinel-1 SAR.** NDWI = (Green − NIR)/(Green + NIR) requires optical bands. SAR has none. **Resolution:** the system has two data paths — *Optical* (NDWI/MNDWI/NDVI, requires ≥ Green+NIR bands) and *SAR* (VV/VH backscatter thresholding + ML segmentation). The API and UI declare `sensor_type` per event; index endpoints return `409 INDEX_NOT_APPLICABLE_TO_SENSOR` on SAR. Do not silently compute nonsense.
2. **"AI flood model" for arbitrary uploads.** A trained model only works on the sensor/band layout it was trained on, and users may upload 3-band RGB GeoTIFFs. **Resolution:** a `Detector` plugin interface with two MVP implementations: `IndexThresholdDetector` (always available, works on any imagery with required bands) and `UNetFloodDetector` (used when weights are present and bands match). The pipeline records *which* detector ran, and the report shows it. This is the honest way to satisfy "models must be replaceable."
3. **Training a model from scratch.** Requires a labelled dataset + GPU. **Resolution:** train *only* on the verified Sen1Floods11 hand-labeled subset (small, ~700 MB, trains in <1 h on a free Colab T4). Do not train on unlabeled uploads.
4. **Building/road impact requires vector data.** Satellite pixels don't know what a building is. **Resolution:** clip Overture/OSM GeoParquet to the AOI at analysis time; ship a bundled sample GeoJSON AOI so the app works offline on day one.
5. **"AI report" without an API key.** **Resolution:** LLM is optional. A deterministic Jinja2 report template always works; the LLM layer rewrites it into narrative prose when a key exists. Never block MVP on an LLM.
6. **PDF generation on Windows.** WeasyPrint needs system libraries. **Resolution:** `reportlab` (pure Python) renders the PDF server-side; the same HTML view is also printable from the browser.
7. **"Do not fabricate disaster information."** **Resolution:** all seeded/demo events are flagged `is_demo=true` and every UI surface showing them carries a **DEMO DATA** badge. No real-event casualty/severity claims anywhere.
8. **Windows + PostGIS.** Native PostGIS install on Windows is painful. **Resolution:** Docker Desktop (WSL2 backend) is a hard prerequisite for the database; app code runs either in Docker or natively.

### Scope discipline

| Tier | Contents |
|---|---|
| **MVP** | Flood only. Optical + SAR ingest, NDWI/NDVI, threshold + U-Net detection, before/after change detection, affected-area, Overture building/road overlay, risk zones, GIS dashboard, AI report + PDF, auth. |
| **Phase 2** | Fire/burn scar (dNBR with SWIR), wildfire dataset, fire severity classes. |
| **Phase 3** | Landslide detection (slope + spectral + change). |
| **Phase 4** | Agent/RAG, multi-sensor fusion, forecasting, real-time ingestion, auto-acquisition via STAC. |

---

## C. Recommended MVP

### In scope (must all work end-to-end)

```
Login → Upload before/after imagery + metadata → Job queue → Preprocess
→ NDWI/NDVI (optical) / backscatter stats (SAR) → AI flood detection
→ Before/After change detection → affected area (km²)
→ Building + road impact (Overture clip or sample GeoJSON)
→ Risk scoring → GIS map with 8 toggleable layers
→ AI situation report → PDF download
```

### Deliberately out of MVP

Auto satellite acquisition, Sentinel-1/2 STAC search UI, fire/landslide, population census integration (ship a *sample* population grid only), routing/pathfinding, multi-user collaboration, real-time alerts, mobile app, deep ensemble models, tile server.

### What can be mocked early vs. what needs real data

| Component | Early development | Needs real data |
|---|---|---|
| Auth, DB, job queue, UI shell | ✅ mock anything | no |
| Raster pipeline | ✅ synthetic GeoTIFF generator (script produces a fake "before" and "after" with a planted water body) | validated against real Sentinel-2 scene |
| AI model | ✅ stub detector returning threshold mask | real weights trained on Sen1Floods11 |
| Infrastructure | ✅ bundled sample GeoJSON | Overture/OSM clip for a real AOI |
| Population | ✅ sample raster | WorldPop (Phase 2+) |
| Report | ✅ template fallback | LLM key |

---

## D. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  BROWSER  React + Vite + React-Leaflet + Tailwind               │
│  (JWT in memory + refresh cookie, layer toggles, job polling)   │
└───────────────┬─────────────────────────────────────────────────┘
                │ HTTPS / REST (JSON, multipart)
┌───────────────▼─────────────────────────────────────────────────┐
│  FASTAPI  (uvicorn)                                             │
│  api/  → routers: auth, satellite, analysis, ai, risk,          │
│            map, report, health                                  │
│  core/ → config, security(JWT), errors, logging, rate-limit     │
│  ┌─────────────┬──────────────┬─────────────┬────────────────┐  │
│  │ services/   │ detectors/   │ gis/        │ report/        │  │
│  │ business    │ base, index, │ raster ops, │ schema, llm,   │  │
│  │ logic       │ unet         │ vector, risk│ template, pdf  │  │
│  └─────────────┴──────────────┴─────────────┴────────────────┘  │
│  storage/ (StorageBackend → LocalFS | S3)                       │
│  db/ (SQLAlchemy models, Alembic migrations)                    │
└───────┬──────────────────────────────┬──────────────────────────┘
        │ enqueue job (RPUSH)          │ read/write
┌───────▼──────────┐          ┌────────▼─────────────────────────┐
│  REDIS           │          │  PostgreSQL + POSTGIS            │
│  RQ queue +      │          │  users, events, images, jobs,    │
│  job results     │          │  results, infrastructure,        │
└───────┬──────────┘          │  risk_zones, reports, vector_layers
        │ dequeue             │  geometry(...) + GIST indexes
┌───────▼──────────────────────────────────────────────────────┐
│  RQ WORKER (separate process, 1–2 concurrency)               │
│  pipeline/stages: preprocess → spectral → detect →           │
│  change → infrastructure → risk → report                     │
│  writes stage progress back to analysis_jobs every stage     │
│  loads model weights once at startup (ModelRegistry)         │
└──────────────────────────────────────────────────────────────┘
        │
┌───────▼──────────────┐   ┌────────────────────────────────────┐
│ LOCAL FILE STORAGE   │   │  EXTERNAL (optional)               │
│ data/uploads/{id}/   │   │  • OpenAI-compatible LLM API       │
│ data/results/{id}/   │   │  • Overture S3 (infrastructure)    │
│ data/models/         │   │  • Sentinel COG mirrors (phase 2+) │
└──────────────────────┘   └────────────────────────────────────┘
```

**Layering rule (enforced by lint/review):** `api → services → (detectors | gis | report) → storage/db`. Routers never touch rasterio/geopandas directly. Detectors never touch FastAPI. This is what makes adding fire/landslide later a *new plugin file*, not a rewrite.

---

## E. Detailed Data Flow

### E.1 Upload → stored

```
POST /api/satellite/upload (multipart, 2 files + JSON metadata)
 → validate: extension ∈ {.tif,.tiff,.jp2,.nc}, size ≤ cfg.MAX_UPLOAD_MB,
   magic-byte check via rasterio.open() (reject non-raster), band count ≥ 3 (optical) or ≥1 (SAR)
 → rasterio probe: CRS, transform, dtype, band count, nodata, bounds
   ├─ CRS missing  → reject 422 UNRESOLVED_CRS (user must supply EPSG)
   ├─ bounds > 25,000 km² → reject 422 AOI_TOO_LARGE
   └─ valid → write to data/uploads/{uuid}/pre.tif|post.tif
 → INSERT satellite_images × 2 (metadata) + disaster_events (status=DRAFT)
 → return event_id, image_ids, probe summary
```

### E.2 Job execution (worker)

```
POST /api/analysis/start {event_id}
 → INSERT analysis_jobs(status=QUEUED, stage=UPLOAD, progress=0) ; enqueue
WORKER per stage:
  1 PREPROCESS      10%  reproject→EPSG:4326 display copy;
                        harmonize extents (intersection); resample to common res;
                        optical: cloud mask from SCL/FMASK if present, else QA band,
                                 else skip + flag CLOUD_UNRESOLVED;
                        SAR: Lee-speckle filter (rasterio filter / scipy), z-score norm
  2 SPECTRAL        30%  NDWI, MNDWI(if SWIR), NDVI on pre & post; Δ maps
  3 AI_DETECT       50%  pick detector → flood_mask_post.tif (+pre mask)
  4 CHANGE_DETECT   65%  Δwater = post∧¬pre  → mask → polygons → area
  5 INFRASTRUCTURE  80%  clip buildings/roads to AOI → intersect with flood∩change
  6 RISK            90%  compute score per zone → risk_zones polygons
  7 REPORT          100% build evidence JSON → LLM/template → report row
 after EVERY stage: UPDATE analysis_jobs(stage, progress, status, error)
 on failure: status=FAILED, error_code, user_safe_message; no traceback in API response
```

### E.3 Read path (dashboard)

```
GET /api/dashboard/{event_id}
 → single aggregated query: event + latest job + latest analysis_results (jsonb)
   + risk summary + infra counts + report id
 → frontend renders in 1 request (avoids N+1 waterfalls)
GET /api/map/{event_id} → { layers: [{id, name, type: "geojson"|"imageoverlay",
   url, legend, zindex}], bounds, center }
GET /api/map/{event_id}/layer/{layer_id} → GeoJSON FeatureCollection
GET /api/map/{event_id}/overlay/{layer_id} → RGBA PNG + bounds (image overlay)
```

### E.4 Job progress to UI

Frontend polls `GET /api/analysis/jobs/{job_id}` every 1.5 s while `status ∈ {QUEUED,RUNNING}` (SSE is a later nicety, polling is bulletproof). UI shows the 8-step pipeline with per-stage ✓/spinner/✗.

---

## F. Frontend Architecture

### Stack

React 18, Vite, React Router v6, TailwindCSS, `react-leaflet` v4 + `leaflet`, `axios` (with interceptors), `zustand` (light global state: auth + active event), `recharts` (charts), `react-hot-toast` (notifications), `vitest` + `@testing-library/react` + `playwright`.

### Reusable vs. page-specific components

| Reusable (in `components/`) | Used by |
|---|---|
| `Navbar`, `Sidebar`, `AppShell`, `ProtectedRoute` | all |
| `StatCard`, `DashboardCard`, `SeverityBadge`, `ConfidenceMeter` | dashboard, analysis, risk |
| `MapView`, `LayerControl`, `RiskLegend`, `LayerToggleList`, `PopupStats` | dashboard, risk, change, infra |
| `ImageComparison` (drag-slider), `SatelliteViewer` | ndvi/ndwi, change, analysis |
| `UploadBox`, `FileDropzone`, `UploadProgress` | upload |
| `ProgressPipeline` | processing |
| `InfrastructureTable`, `StatTable` | infra, dashboard |
| `AIReportCard`, `SectionCard` | report, analysis |
| `Chart` (wraps recharts), `EmptyState`, `ErrorState`, `LoadingSkeleton`, `Modal`, `Notification` | everywhere |
| `DataConfidence` chips (`MEASURED` / `MODEL` / `ASSUMPTION` / `AI-GENERATED`) | report, analysis, risk |

**Page-specific:** `LoginForm`, `RiskFormulaExplainer`, `PipelineStepper`, `ReportDownloadButton`.

### Design tokens (`tailwind.config.js` + CSS variables)

```css
--bg:        #0B1220   /* page */
--panel:     #111A2C   /* cards */
--panel-2:   #16213A   /* elevated */
--border:    #1E2A44
--text:      #E6EDF7
--muted:     #8FA3C0
--accent:    #38BDF8   /* info / primary actions */
--accent-2:  #2DD4BF   /* success-ish / water */
--low:       #22C55E
--medium:    #EAB308
--high:      #F97316
--critical:  #EF4444
```

- Type: **Inter** UI, **JetBrains Mono** for metrics/coordinates (tabular numbers).
- Spacing: 4 px base scale (4/8/12/16/24/32/48).
- Radius: 8 px cards, 6 px inputs. Border 1px `--border`. Subtle `0 1px 3px rgba(0,0,0,.4)` elevation.
- Buttons: primary = `--accent` on dark text; danger = `--critical`; sizes sm/md; always with loading spinner state.
- Alerts: 4 variants (info/success/warning/error) with left 3 px severity bar.
- **Severity colors are used identically everywhere** — badges, map polygons, legend, table rows, chart bars. One `severity` scale constant exported from `utils/severity.js`.
- Loading: skeleton blocks, never bare spinners on full page.
- Empty: icon + one-line explanation + primary action CTA.
- Error: plain-language message + `error_id`, never a stack trace.

---

## G. UI/UX Page-by-Page Design

| # | Route | Layout | Key elements |
|---|---|---|---|
| 1 | `/login` | centered 400 px card on dark gradient | email, password, show/hide, inline field errors, banner for 401 "Invalid credentials", demo-credentials hint, loading button |
| 2 | `/dashboard` | AppShell: sidebar + top bar; 12-col grid | Row of 6 `StatCard` (Active Disaster, Severity, Affected Area, Buildings, Roads, High-Risk Zones); full-width map (60vh) with flood + risk layers pre-enabled; right rail: model confidence, last updated, severity distribution donut, recent events table |
| 3 | `/upload` | two-column | Left: dropzones for **before** and **after** (separate, labeled, both required), disaster-type select (flood locked in MVP), AOI name, acquisition dates, sensor type select, optional EPSG override; Right: live file info card (size, bands, CRS, resolution, bounds) after validation; top: horizontal upload progress bars (XHR `onUploadProgress`); footer: "Start Analysis" disabled until both valid |
| 4 | `/processing/:jobId` | centered 720 px | 8-step vertical stepper with icon states (✓ pending/active/error), per-step elapsed time, live progress bar, "Run in background" button, on failure show safe message + `Retry stage` + `View logs` (admin) |
| 5 | `/analysis/:eventId` | split 7/5 | Left: `ImageComparison` of classified before/after with flood mask overlay; Right: disaster type, confidence meter, affected area, severity badge, detector used, cloud cover, per-stage metadata; below: `DataConfidence` chips |
| 6 | `/indices/:eventId` | tabbed (NDWI / NDVI / Δ) | 3-up grid: before index, after index, difference (diverging colormap); stats table (mean/min/max/% above threshold, pre vs post vs delta); toggle "apply to map" |
| 7 | `/change/:eventId` | 3-up + table | before, after, change mask; big % change KPI; affected polygon table (id, area km², centroid, type: new-water / vegetation-loss / other); click row → map flies to polygon |
| 8 | `/infrastructure/:eventId` | tabs: Buildings / Roads / Hospitals / Schools / Shelters | summary tiles (total, affected, %), sortable/filterable `InfrastructureTable`, confidence column, export CSV; empty state when no vector source configured |
| 9 | `/risk/:eventId` | full-bleed map + 320 px left panel | layer checkboxes (base, satellite, flood extent, change, buildings, roads, critical infra, risk zones), severity legend, click polygon → side drawer with score breakdown bars, weight disclosure, "how is this calculated?" popover |
| 10 | `/report/:eventId` | document view, max-w-3xl | header with event meta + **DEMO/AI badges**, sections (Summary, What/Where, Severity, Area, Infrastructure, High-Risk Zones, Priorities, Confidence, Limitations), provenance chips per section, `Download PDF` + `Regenerate with AI` buttons, footer disclaimer |

**Global:** top-right notification toasts; sidebar items disabled until their data exists; breadcrumb; keyboard-accessible map layer list; responsive down to 768 px (map + panels stack).

---

## H. Backend Architecture

```
backend/
  app/
    main.py                # create_app(), middleware, router include, CORS, rate limit
    core/
      config.py            # pydantic-settings, .env
      security.py          # bcrypt hash, JWT create/decode, get_current_user
      errors.py            # AppError hierarchy → HTTPException handler, error_id
      logging.py           # structured JSON logs
      deps.py              # DI: db session, storage, settings
    api/v1/
      auth.py  satellite.py  analysis.py  ai.py  risk.py  map.py  report.py  health.py
    services/
      auth_service.py  upload_service.py  event_service.py
      job_service.py   dashboard_service.py  infra_service.py
    pipeline/              # orchestration only, no math here
      runner.py            # executes stage list, updates job row, catches errors
      stages.py            # stage functions calling detectors/gis
      registry.py          # STAGE → callable map (extensible per disaster type)
    detectors/
      base.py              # Detector ABC: detect(pre, post, ctx) -> MaskResult
      index_threshold.py   # NDWI/MNDWI/Otsu
      unet_flood.py        # torch inference, tiled, overlap-stitch
      model_registry.py    # lazy-load weights, device select, warm-up
    gis/
      raster.py            # reproject, harmonize, resample, cloud mask, speckle
      indices.py           # ndwi, mndwi, ndvi, delta
      change.py            # change vector analysis, otsu, morphological cleanup
      vectorize.py         # mask → shapely polygons (simplify, holes, min-area filter)
      area.py              # geodesic area via pyproj.Geod
      infrastructure.py    # OSM/Overture/sample clip + spatial join
      risk.py              # scoring, zoning, banding
    report/
      evidence.py          # builds the exact evidence JSON (§P)
      schema.py            # pydantic model for evidence + report
      llm.py               # OpenAI-compatible client, timeouts, retries, JSON guard
      template.py          # deterministic Jinja2 fallback
      pdf.py               # reportlab renderer
    storage/
      base.py  local.py    # put/get/url/delete; S3 impl stub
    db/
      session.py  models.py  base.py
    workers/
      worker.py            # rq worker entrypoint
  alembic/
  tests/
  requirements.txt
```

**Key module responsibilities**

| Module | Must do | Must NOT do |
|---|---|---|
| `pipeline/runner` | sequence, progress, error capture | any raster math |
| `detectors/*` | pixels → binary water mask + confidence | file I/O of arbitrary paths, DB writes |
| `gis/*` | pure geospatial transforms, return geopandas/rasters | HTTP concerns |
| `report/evidence.py` | one function: job results → validated JSON | call the LLM |
| `services/*` | transactions, authorization, orchestration | heavy compute |

---

## I. API Design

All under `/api/v1`. All except `/auth/login` and `/health` require `Authorization: Bearer <JWT>`. All errors use:

```json
{ "error": { "code": "AOI_TOO_LARGE", "message": "Analysis area exceeds 25,000 km².", "error_id": "e_9f3a", "details": {} } }
```

| Method & Path | Purpose | Request | Response | Validation / Errors | Auth |
|---|---|---|---|---|---|
| `POST /auth/register` | create user | `{email,password,name}` | `{user, access_token, expires_in}` | 409 EMAIL_TAKEN, 422 weak password (≥10 chars) | no |
| `POST /auth/login` | authenticate | `{email,password}` | `{access_token, refresh_token, user}` | 401 INVALID_CREDENTIALS, 422, 429 rate-limited (5/min/IP) | no |
| `POST /auth/refresh` | rotate token | cookie/body `{refresh_token}` | `{access_token}` | 401 REFRESH_INVALID | no |
| `GET /auth/me` | session info | – | `{id,email,role}` | 401 | yes |
| `POST /satellite/upload` | store pre/post rasters | multipart: `pre_file`, `post_file`, `meta` (JSON: name, disaster_type, sensor, pre_date, post_date, epsg?) | `{event_id, images:[{id,role,crs,bounds,bands,resolution,size}], warnings[]}` | 413 TOO_LARGE; 415 UNSUPPORTED_FORMAT; 422 UNRESOLVED_CRS / BAND_COUNT / AOI_TOO_LARGE / DATES_INVALID; 409 EVENT_EXISTS | yes |
| `GET /satellite/{id}` | image metadata | – | image record + probe | 404, 403 | yes |
| `DELETE /satellite/{id}` | remove draft | – | 204 | 404, 409 if job running | yes |
| `POST /analysis/start` | enqueue pipeline | `{event_id, stages?:[]}` | `{job_id, status:"QUEUED"}` | 404 EVENT, 409 JOB_ALREADY_RUNNING, 422 IMAGES_INCOMPLETE | yes |
| `GET /analysis/jobs/{job_id}` | progress | – | `{status, stage, progress, stages:[{key,label,status,elapsed_ms,error?}], started_at, finished_at}` | 404, 403 | yes |
| `POST /analysis/jobs/{job_id}/cancel` | cancel | – | `{status}` | 409 if finished | yes |
| `GET /analysis/results/{event_id}` | all results | – | `{disaster:{type,confidence,detector}, indices:{...}, change:{pct,area_km2,polygons}, severity, evidence_summary}` | 404 NO_RESULTS | yes |
| `POST /analysis/ndvi` / `/ndwi` | recompute on demand | `{event_id, index, threshold?}` | `{before_stats, after_stats, delta_stats, overlay_url}` | 409 INDEX_NOT_APPLICABLE_TO_SENSOR, 422 MISSING_BANDS | yes |
| `POST /ai/detect` | run/refresh detection | `{event_id, detector?: "index"|"unet"}` | `{mask_url, confidence, detector, inference_ms, tile_count}` | 422 MODEL_WEIGHTS_MISSING, 503 INFERENCE_FAILED | yes |
| `GET /ai/detect/{event_id}/metrics` | model metrics | – | `{iou,dice,precision,recall,f1,accuracy,evaluated_on,notes}` | 404 if no eval run | yes |
| `POST /risk/analyze` | recompute risk | `{event_id, weights?:{severity,population,infra,access}}` | `{score, band, zones:[...], formula}` | 422 WEIGHTS_MUST_SUM_1 | yes |
| `GET /risk/config` | current weights | – | weights + disclaimer text | – | yes |
| `GET /map/{event_id}` | layer manifest | – | `{bounds, center, layers:[{id,label,type,z,legend,url}]}` | 404 | yes |
| `GET /map/{event_id}/layer/{layer_id}` | GeoJSON | `?bbox=` | FeatureCollection | 404 LAYER, 422 bbox | yes |
| `GET /map/{event_id}/overlay/{layer_id}.png` | RGBA overlay | – | PNG + `X-Bounds` header | 404 | yes (or signed URL) |
| `GET /infrastructure/{event_id}` | counts + features | `?type=&affected=` | `{summary:{buildings:{total,affected}, roads:{...}, critical:{...}}, features:[...]}` | 404 | yes |
| `POST /report/generate` | build report | `{event_id, use_llm?:bool}` | `{report_id, status, source:"llm"|"template"}` | 409 EVIDENCE_INCOMPLETE, 503 LLM_UNAVAILABLE (falls back) | yes |
| `GET /report/{id}` | report content | – | structured sections + evidence + provenance | 404, 403 | yes |
| `GET /report/{id}/pdf` | PDF stream | – | `application/pdf` | 404, 500 PDF_RENDER_FAILED | yes |
| `GET /health` | liveness/readiness | – | `{status, db, redis, model, storage, version}` | – | no |

**Idempotency:** `POST /analysis/start` and `POST /report/generate` accept an optional `Idempotency-Key` header (stored 24 h) to survive retried requests.

---

## J. Database Design

### ER relationships

`users 1—* disaster_events 1—* satellite_images`; `disaster_events 1—* analysis_jobs 1—* analysis_results`; `disaster_events 1—* infrastructure`; `disaster_events 1—* risk_zones`; `disaster_events 1—* reports`; `disaster_events 1—* vector_layers`.

### Tables

| Table | Columns (type) | Keys / Indexes |
|---|---|---|
| **users** | `id UUID PK`, `email CITEXT UNIQUE`, `password_hash TEXT`, `name TEXT`, `role TEXT DEFAULT 'analyst'`, `is_active BOOL`, `created_at TIMESTAMPTZ` | idx on `email` |
| **disaster_events** | `id UUID PK`, `user_id FK→users`, `name TEXT`, `disaster_type TEXT CHECK IN ('flood','fire','landslide')`, `sensor_type TEXT CHECK IN ('optical','sar','mixed')`, `status TEXT CHECK IN ('draft','queued','processing','completed','failed')`, `severity TEXT NULL`, `severity_score NUMERIC(5,2) NULL`, `center POINT`, `bbox geometry(Polygon,4326)`, `aoi_area_km2 NUMERIC`, `pre_date DATE`, `post_date DATE`, `is_demo BOOL DEFAULT false`, `created_at/updated_at` | GIST(`bbox`), idx(`user_id`), idx(`status`), idx(`disaster_type`) |
| **satellite_images** | `id UUID PK`, `event_id FK`, `role TEXT CHECK IN ('pre','post')`, `original_filename TEXT`, `storage_key TEXT`, `file_size BIGINT`, `crs TEXT`, `bounds geometry(Polygon,4326)`, `transform JSONB`, `width INT`, `height INT`, `band_count INT`, `band_names TEXT[]`, `dtype TEXT`, `nodata NUMERIC NULL`, `resolution_m NUMERIC NULL`, `acquired_at DATE NULL`, `cloud_cover_pct NUMERIC NULL`, `checksum_sha256 TEXT`, `probe JSONB`, `created_at` | idx(`event_id`,`role`) UNIQUE pair; GIST(`bounds`) |
| **analysis_jobs** | `id UUID PK`, `event_id FK`, `rq_job_id TEXT`, `status TEXT CHECK IN ('queued','running','completed','failed','cancelled')`, `current_stage TEXT`, `progress SMALLINT DEFAULT 0`, `stages JSONB` (`[{key,label,status,started_at,elapsed_ms,error}]`), `error_code TEXT NULL`, `error_message TEXT NULL`, `created_at/started_at/finished_at` | idx(`event_id`,`status`), idx(`status`) partial where running |
| **analysis_results** | `id UUID PK`, `job_id FK`, `event_id FK`, `kind TEXT CHECK IN ('preprocess','indices','detection','change','infrastructure','risk','metrics')`, `payload JSONB`, `artifacts JSONB` (`[{type:'raster'|'geojson'|'png', key, bounds}]`), `confidence NUMERIC(4,3)`, `detector TEXT NULL`, `created_at` | idx(`event_id`,`kind`), GIN(`payload`) |
| **infrastructure** | `id UUID PK`, `event_id FK`, `feature_type TEXT CHECK IN ('building','road','hospital','school','shelter','bridge','other')`, `source TEXT` (`'overture'|'osm'|'sample'`), `name TEXT NULL`, `props JSONB`, `geom geometry(Geometry,4326)`, `affected BOOL`, `impact_score NUMERIC(4,3) NULL`, `affected_reason TEXT NULL` | GIST(`geom`), idx(`event_id`,`feature_type`), idx(`event_id`,`affected`) |
| **risk_zones** | `id UUID PK`, `event_id FK`, `zone_index INT`, `geom geometry(MultiPolygon,4326)`, `score NUMERIC(5,2)`, `band TEXT CHECK IN ('LOW','MEDIUM','HIGH','CRITICAL')`, `components JSONB` (`{severity,population,infra,access,raw}`), `weights JSONB`, `created_at` | GIST(`geom`), idx(`event_id`,`band`) |
| **vector_layers** | `id UUID PK`, `event_id FK`, `name TEXT`, `layer_type TEXT`, `geojson_key TEXT`, `bounds geometry(Polygon,4326)`, `feature_count INT`, `created_at` | GIST(`bounds`) |
| **reports** | `id UUID PK`, `event_id FK`, `job_id FK NULL`, `source TEXT CHECK IN ('llm','template')`, `model TEXT NULL`, `evidence JSONB`, `content JSONB`, `pdf_key TEXT NULL`, `status TEXT`, `tokens_in INT NULL`, `tokens_out INT NULL`, `created_at` | idx(`event_id`) |
| **refresh_tokens** | `id UUID PK`, `user_id FK`, `token_hash TEXT`, `expires_at`, `revoked BOOL` | idx(`token_hash`) |
| **idempotency_keys** | `key TEXT`, `user_id`, `response JSONB`, `created_at` | PK(`key`,`user_id`) |

**Where PostGIS geometry is required:** `disaster_events.bbox`, `satellite_images.bounds` (spatial search: "events intersecting this map viewport"), `infrastructure.geom` (spatial join against flood polygons), `risk_zones.geom` (render + click-query), `vector_layers.bounds`. **Where it is not:** users, jobs, reports — plain relational. All geometry stored in **EPSG:4326** for rendering; areas always computed geodesically or in an equal-area CRS, never from degree coordinates.

**Practical PostGIS SQL notes:** enable `CREATE EXTENSION postgis; CREATE EXTENSION citext;`. Use `ST_Intersects(infra.geom, flood.geom)` and `ST_Area(ST_Transform(geom, <equal-area>))` — or `pyproj.Geod` in Python for consistency with raster area math. Add `ANALYZE` after bulk loads.

---

## K. Satellite Processing Pipeline

### K.1 Input contract

Accepted: GeoTIFF/COG (`.tif`), JPEG2000 (`.jp2`), NetCDF (`.nc`) — GeoTIFF is the primary supported path; JP2 via GDAL; NC flagged experimental. Required metadata: CRS + geotransform. Optional: acquisition date, cloud cover, band names.

**Band mapping table** (auto-detected from `band_names`, else by position with explicit user confirmation):

| Role | Sentinel-2 | Landsat-8/9 | Generic RGB-NIR | Sentinel-1 |
|---|---|---|---|---|
| blue | B02 | B2 | band 1 | – |
| green | B03 | B3 | band 2 | – |
| red | B04 | B4 | band 3 | – |
| nir | B08/B8A | B5 | band 4 | – |
| swir | B11/B12 | B6/B7 | – | – |
| sar_vv / sar_vh | – | – | – | VV / VH |
| scl/qa (cloud) | S2 L2A SCL | QA_PIXEL | – | – |

### K.2 Stages

**1. Preprocessing** (`gis/raster.py`)

1. Open with `rasterio`; read profile.
2. Missing CRS → fail with `UNRESOLVED_CRS`.
3. Reproject pre & post to a common CRS: **compute in UTM zone of AOI centroid** (correct areas/lengths), store display copy in EPSG:4326.
4. Harmonize: `calculate_default_transform` to the intersection of bounds at the coarser resolution; `Resampling.bilinear` for reflectance, `nearest` for masks/SCL.
5. Optical cloud handling: if SCL present → mask classes 3,8,9,10,11; elif QA present → bit mask; else **skip and record `cloud_cover: unknown`** in results (never silently pretend). Report shows `CLOUD_UNRESOLVED` warning.
6. SAR: 5×5 Lee speckle filter, clip to physical range, per-image z-score with `std < 1e-4 → std = 1.0` safeguard (prevents NaN on flat tiles).
7. Output: aligned `pre_stack.tif`, `post_stack.tif` (internal Float32, bands in canonical order), plus `preprocess.json` (all decisions taken).

**2. Spectral indices** (`gis/indices.py`) — vectorized numpy, masked by nodata:

```
NDWI  = (G - NIR) / (G + NIR)            # McFeeters, water extent
MNDWI = (G - SWIR) / (G + SWIR)          # if SWIR present (better urban water)
NDVI  = (NIR - R) / (NIR + R)            # vegetation
```

Denominator guarded with `np.where(|denom| < 1e-6, nan)`. Output rasters `float32` in [-1,1] plus per-image stats (min/max/mean/std/pct>threshold). Δ maps: `post - pre` on the **reprojected, aligned** pair only.

**3. AI detection** — see §L.

**4. Change detection** (`gis/change.py`):

- Primary: **water-index differencing** — `new_water = (NDWI_post > T_post) AND (NDWI_pre ≤ T_pre) AND ¬permanent_water`; threshold `T` from Otsu on the NDWI histogram (per-image, recorded in results).
- Also compute `veg_loss = (NDVI_pre - NDVI_post) > τ` (τ default 0.2, configurable).
- CVA (change-vector analysis) on stacked `[NDWI, NDVI, blue, nir]` as a secondary "changed land" layer.
- Cleanup: binary closing (3×3) → remove specks < `MIN_POLYGON_AREA` (default 500 m²) → keep largest connected components optional.
- **Permanent-water exclusion:** if JRC/GSHHG layer not present, use `pre` water mask as the baseline — this is what makes `new_water` ≠ `existing water`.
- Vectorize: `rasterio.features.shapes` → shapely → `simplify(0.0001)` → GeoJSON, keeping per-polygon area.
- Metrics: `changed_pixels / valid_pixels → change_pct`; `Σ geodesic area → affected_area_km2`.

**5. Outputs per job:** `preprocess.json`, `ndwi_pre/post/delta.tif`, `ndvi_pre/post/delta.tif`, `flood_mask_post.tif`, `new_water_mask.tif`, `change_mask.tif`, `flood_extent.geojson`, `changed_areas.geojson`, `stats.json`.

**Raster → map:** server renders `flood_extent` and `risk` to RGBA PNG (semi-transparent) with the layer's bounds; Leaflet `ImageOverlay`. Rasters are *not* sent to the browser. GeoJSON layers > ~5 MB are simplified before sending and support `?bbox=` filtering.

---

## L. AI/ML Pipeline

### L.1 Model choice: **U-Net with ResNet-34 encoder (ImageNet init), binary segmentation**

| Question | Answer |
|---|---|
| **1. Which model** | U-Net (Ronneberger 2015) with a pretrained ResNet-34 encoder, implemented via `segmentation-models-pytorch`. Input: 2-channel (VV, VH) normalized SAR, 256×256. Output: single-channel logits → sigmoid → water probability. |
| **2. Why appropriate** | Flood extent is a *dense pixel-labeling* problem with thin/irregular structures — U-Net's skip connections preserve spatial detail. ResNet-34 encoder gives transfer learning on tiny labeled sets (~450 chips), so no from-scratch pretraining needed. ~24 M params runs fine on CPU (<2 s/tile), so **no GPU server required at inference**. Alternative considered: DeepLabV3+ (better mIoU, heavier, more tuning), Segmenter/SAM (overkill, huge). U-Net is the standard, well-documented, smallest-risk choice. |
| **3. Dataset** | **Sen1Floods11** (verified, public). MVP uses the **hand-labeled subset**: 446 chips, `gs://sen1floods11/v1.1/data/flood_events/HandLabeled/S1Hand/` (695 MB) + `LabelHand/` (2.4 MB) + predefined event-level splits in `v1.1/splits/flood_handlabeled/`. Phase-2 upgrade: add the 4,385 weakly labeled chips (6.8 GB) which the paper shows *improves* results. Cross-check with **FloodNet** (UAV, 9 classes incl. `building-flooded`/`road-flooded`) for qualitative/transfer experiments — not for the SAR model, different modality. |
| **4. Input format** | Float32 array `(N, 2, 256, 256)`, per-image z-score normalized (same transform as production preprocessing — *one shared function* between training and inference, in `gis/raster.py`). Labels `(N, 1, 256, 256)` uint8 {0,1}. Chips at native 512² are center-cropped/tiled to 256². |
| **5. Output format** | Probability map `(H, W)` float32 ∈ [0,1]; binarized at threshold `t` (tuned on val, default 0.5) → uint8 mask; then **stitched back to full raster with georeferencing** using the source transform/CRS, plus a scalar `confidence = mean(probability of predicted class over predicted-positive pixels)` (documented as a heuristic, not a calibrated probability). |
| **6. Training process** | Split **by flood event** (spatial/event-level, from the official splits) to prevent spatial leakage — never random chip splits. Augmentation: random h-flip, v-flip, 90° rotations, slight brightness/gain jitter. Loss: `BCEWithLogitsLoss + DiceLoss` (α=0.5 each, handles class imbalance — water is a minority class). Optimizer Adam lr=1e-4, cosine or step decay, batch 8, 40 epochs, early stopping on val Dice (patience 8). Hardware: free Colab T4 (~30–60 min for the hand-labeled subset). Artifacts: `model.pt`, `run_config.yaml`, `val_metrics.json`, `threshold.json`. |
| **7. Validation process** | Held-out **event** split (≈15% of events). Report per-event and aggregate metrics. Never report training metrics as results. Threshold selection on the val set maximizing F1; test set touched once. |
| **8. Evaluation metrics** | Per-class and mean: **IoU**, **Dice/F1** (identical for binary), **Precision**, **Recall**, **Specificity**, **Accuracy** (reported but flagged as misleading under imbalance), plus confusion matrix, PR curve, and **inference time per tile / per km²**. Evaluated with a standalone script `ml/evaluate.py` writing `metrics.json`, surfaced in the API at `GET /ai/detect/{event_id}/metrics`. **No accuracy figures are quoted anywhere until measured by that script.** |
| **9. Inference process** | `ModelRegistry` loads weights once at worker startup; `detect()` tiles the raster with 64 px overlap, batches tiles, runs `torch.no_grad()` + `model.eval()`, stitches with feathered overlap averaging, applies saved threshold, morphological cleanup, vectorizes. CPU by default; `DEVICE=cuda` if available. Failure → raise `INFERENCE_FAILED` → pipeline falls back to `IndexThresholdDetector` and records `detector_used: "index_threshold_fallback"` in results (visible in UI). |
| **10. Deployment** | Weights in `data/models/flood_unet_v1/{model.pt, config.yaml, threshold.json, metrics.json}` (never in git — `.gitignore` + a small `download_or_train` script). Loaded into memory by the RQ worker only (not the API process). Optional later: export `model.torchscript` / ONNX for faster CPU inference. Model version recorded in every `analysis_results` row for reproducibility. |

### L.2 Detector abstraction (the "replaceable models" requirement)

```python
class Detector(ABC):
    key: str
    supported_sensors: set[str]
    supported_disasters: set[str]
    def is_available(self, ctx) -> bool: ...
    def detect(self, pre, post, ctx) -> MaskResult:
        # MaskResult: mask ndarray, confidence float, metadata dict, detector_version
```

Registry order for flood: `unet_flood` (if weights + sensor match) → `index_threshold`. Adding fire = new file `detectors/burned_area.py` + registry entry + a new `disaster_type` value. **No frontend change required** beyond a new badge/legend config.

### L.3 Honest-yet-usable confidence

`overall_confidence = detector_confidence × (1 − cloud_penalty) × data_quality_factor`, clamped to [0,1], with every component exposed in `analysis_results.payload` and rendered as a breakdown in the UI. Labeled `MODEL ESTIMATE`, never "accuracy".

---

## M. GIS Architecture

**Layers (z-order bottom → top):** base map (CartoDB Dark Matter / OSM) → satellite (Esri World Imagery or EO Browser) → NDWI/NDVI raster overlay → before/after imagery overlay → change-detection overlay → flood-extent polygons → risk zones → buildings → roads → critical infrastructure → markers/pins.

**Serving strategy (MVP):** vector layers as GeoJSON from `GET /map/{event_id}/layer/{id}`; raster layers as RGBA PNG `ImageOverlay` from `GET /map/{event_id}/overlay/{id}.png`. Simplify with `shapely.simplify` (tolerance adaptive to zoom is deferred), cap at ~5,000 features per response with `?bbox=` paging.

**Upgrades (post-MVP, only if needed):** PMTiles via `protomaps-experimental` Leaflet plugin for self-contained tiles; TiTiler for dynamic COG tiling; `supercluster` client-side for building density.

**Correctness rules:**

- Area/length via `pyproj.Geod(ellps="WGS84").geometry_area_perimeter` — never `shapely.area` on degrees.
- All GeoJSON emitted as RFC 7946 (`crs` member omitted, coords in lon/lat, right-hand rule ring order).
- Validate with `geopandas.is_valid` / `make_valid()` before writing; test with a 1°×1° cell whose area ≈ 12,300 km².

**Map UX:** Leaflet `L.control.layers` replaced by a custom styled `LayerControl`; `RiskLegend` with the 4 severity colors + flood-extent swatch + "no data" hatch; hover tooltip with `affected`, `score`, `area`; click → drawer with details + "focus" button; `fitBounds` to event bbox on load.

---

## N. Infrastructure Analysis

### Method (MVP — no ML)

```
1. AOI = event.bbox (or uploaded AOI polygon)
2. Load vector source for AOI:
     source order:  1) user-uploaded GeoJSON (vector_layers)
                    2) bundled sample data (data/samples/{aoi}.geojson)
                    3) Overture/OSM pull (phase 2, or on-demand cache)
3. buildings_aoi   = features WHERE ST_Intersects(geom, AOI)
   roads_aoi       = same
4. flood_polygons  = change/flood extent (post only, excluding permanent water)
5. affected building := ST_Intersects(b.geom, flood) AND ST_Area(ST_Intersection(...))
                        / ST_Area(b.geom)  ≥  FLOOD_COVER_THRESHOLD (default 0.30)
   → impact_score = coverage_ratio  ∈ [0,1]
   → category: uncovered / partial (0.3–0.7) / mostly-covered (≥0.7)
   (labelled explicitly as an ESTIMATE derived from flood coverage, NOT observed damage)
6. affected road segment := segment clipped by flood; affected_length = geodesic length
   → blocked_candidate := affected_length / total_length ≥ 0.5  (configurable)
   → accessibility := graph connectivity — MVP: simple degree/continuity check,
                      NOT a routing engine
7. critical infra (hospital/school/shelter/bridge): same intersection + severity boost
```

### Public data sources (verified)

| Need | Source | Access | License |
|---|---|---|---|
| Building footprints (global) | **Overture Maps** `buildings` theme | GeoParquet on `s3://overturemaps-us-west-2/release/` (anonymous), DuckDB/GeoPandas bbox query | ODbL-compatible (verify per release) |
| Buildings/roads fallback | **OpenStreetMap** via Overpass API | HTTP, no key | ODbL — attribution required |
| Sample/dev data | bundled hand-made GeoJSON for 1 demo AOI | in repo | our own |
| Critical infrastructure | OSM `amenity=hospital|school`, `emergency=shelter` tags | Overpass | ODbL |
| Population (Phase 2) | **WorldPop** constrained 100 m grids | free download | CC BY 4.0 |
| Permanent water baseline | **JRC Global Surface Water** | free GeoTIFF | free |
| Damage labels (research) | **xBD** (850k polygons, 19 disasters, pre/post) | xview2.org registration | research license — verify before use |

**Non-fabrication rule:** if no vector source resolves for an AOI, the Infrastructure page shows an `EmptyState`: *"No infrastructure dataset available for this area. Upload GeoJSON or configure an OSM source."* and the report's infrastructure section states `insufficient_data`. Never invent counts.

---

## O. Risk Engine

### Formula (transparent, configurable, labelled as a project assumption)

```
severity    S ∈ [0,1]   from flood fraction (affected_km² / AOI_km²) mapped through a
                        configurable piecewise curve + model confidence modifier
population  P ∈ [0,1]   (sample grid MVP → WorldPop later) = pop_in_flood / pop_total
                        if unavailable → P = null and the weight is RENORMALIZED
infra       I ∈ [0,1]   = (0.6·affected_buildings/total + 0.4·affected_road_km/total_km)
                        critical-infrastructure hits add +0.1 each (capped at 1.0)
access      A ∈ [0,1]   accessibility (1 = fully accessible, 0 = isolated)
                        MVP proxy = fraction of road network not flagged blocked

risk_score = 100 × ( w1·S + w2·P + w3·I + w4·(1−A) ) / Σ(active weights)

defaults: w1=0.40  w2=0.25  w3=0.25  w4=0.10      (configurable via risk_config.yaml + API)

bands:  <25 LOW   |  25–49.99 MEDIUM   |  50–74.99 HIGH   |  ≥75 CRITICAL
```

**Mandatory disclosures (in API response, UI popover, and report):**

> *"Weights are project-defined assumptions for demonstration purposes. They are not derived from an authoritative emergency-management standard and are not validated against ground-truth outcomes. Risk zones are screening indicators only and must be confirmed by qualified responders."*

**Zoning:** flood-extent polygons are grouped into zones (largest polygons + k-means on centroids if > 50), each scored independently and stored in `risk_zones` with its `components` breakdown so the UI can draw stacked contribution bars per zone.

---

## P. AI Emergency Report Agent

### P.1 Evidence JSON (exact structure passed to the LLM — this is the contract)

```json
{
  "schema_version": "1.0",
  "generated_at": "2026-10-08T12:00:00Z",
  "event": { "id": "uuid", "name": "Demo AOI Flood", "is_demo": true,
             "pre_date": "2026-08-01", "post_date": "2026-08-12",
             "sensor_type": "optical", "crs": "EPSG:32643" },
  "disaster_type": "flood",
  "severity": { "band": "HIGH", "score": 67.4,
                "components": {"severity":0.71,"population":0.55,"infra":0.62,"access":0.40},
                "weights": {"severity":0.40,"population":0.25,"infra":0.25,"access":0.10},
                "is_project_assumption": true },
  "affected_area_km2": 24.6,
  "aoi_area_km2": 310.2,
  "change": { "change_pct": 7.9, "new_water_km2": 24.6,
              "vegetation_loss_km2": 3.1, "permanent_water_excluded_km2": 41.0 },
  "indices": { "ndwi": {"pre_mean": 0.04, "post_mean": 0.31, "delta": 0.27},
               "ndvi": {"pre_mean": 0.42, "post_mean": 0.33, "delta": -0.09} },
  "detection": { "detector": "unet_flood_v1", "confidence": 0.83,
                 "threshold": 0.47, "inference_ms": 1840, "tile_count": 96 },
  "infrastructure": {
    "buildings":  {"total": 12400, "affected": 1240, "pct": 10.0,
                   "high_risk": 318, "source": "overture"},
    "roads":      {"total_km": 412.5, "affected_km": 38.2, "blocked_candidates": 18,
                   "source": "overture"},
    "critical":   {"hospitals": {"total": 6, "affected": 1},
                   "schools":   {"total": 24, "affected": 5},
                   "shelters":  {"total": 9, "affected": 0}}
  },
  "risk_zones": [ {"id":"z1","band":"CRITICAL","score":81.2,"area_km2":4.7,
                   "reasons":["138 buildings intersected","3100 residents exposed"]} ],
  "accessibility": {"blocked_road_segments": 18, "isolated_zone_count": 2},
  "data_quality": { "cloud_cover_pct": 12.4, "cloud_handling": "SCL_masked",
                    "missing_inputs": [], "spatial_resolution_m": 10.0 },
  "limitations": [ "Optical imagery; cloud cover may mask flooding.",
                    "Building impact estimated from flood coverage, not observed damage.",
                    "Population figures from sample grid.",
                    "Risk weights are project assumptions." ],
  "provenance": { "measured": ["affected_area_km2","change_pct","ndwi","ndvi"],
                  "model_prediction": ["flood_mask","detection.confidence"],
                  "vector_dataset": ["buildings","roads","critical"],
                  "assumption": ["risk_weights","flood_cover_threshold"],
                  "not_available": ["population"] }
}
```

`report/evidence.py` builds and **pydantic-validates** this; if a required key is missing → `409 EVIDENCE_INCOMPLETE` (never send partial data to the LLM).

### P.2 Prompting rules

System prompt (configurable): *"You are an emergency-analysis decision-support assistant. Use ONLY the JSON evidence. If a value is absent, write 'not available' — do not estimate. Distinguish measured values, model predictions, and assumptions. Never give instructions that could endanger life; always recommend confirmation by human responders and official authorities. Output strictly the section schema provided."* Temperature 0.2. Response is JSON-schema-validated; on malformed output → one retry → fall back to template. **Never** send rasters/images to the LLM.

### P.3 Report sections

`summary` · `what_happened` · `where` · `severity` · `affected_area` · `infrastructure_impact` · `high_risk_zones` · `response_priorities` (ordered list) · `data_confidence` · `limitations` · `provenance` · `disclaimer`.

Every section carries chips: `MEASURED` / `MODEL PREDICTION` / `DATASET` / `ASSUMPTION` / `AI-GENERATED TEXT`.

**Standing disclaimer (footer of report and UI):**

> *AI-generated analysis for decision support only. Not an authoritative emergency instruction. Verify with official emergency services and ground assessment before acting.*

**Failure modes:** no API key → template source; API timeout (15 s) → template + toast `LLM_UNAVAILABLE`; schema violation twice → template. `source` is stored and displayed either way.

**PDF:** `reportlab` renders the exact report structure (header, meta table, severity banner, sections, provenance table, disclaimer) → `GET /report/{id}/pdf`.

---

## Q. Folder Structure

```
ammulu_project/
├── docker-compose.yml
├── docker-compose.dev.yml
├── .env.example                # every var documented, no secrets
├── .gitignore
├── Makefile                    # make dev | db | worker | test | seed
├── README.md
├── docs/
│   ├── ARCHITECTURE.md  API.md  DATA_PIPELINE.md  RISK_MODEL.md
│   ├── REPORT_SCHEMA.md  RUNBOOK.md  DECISIONS.md (ADR-lite)
├── frontend/
│   ├── package.json  vite.config.js  tailwind.config.js  index.html
│   ├── public/
│   └── src/
│       ├── main.jsx  App.jsx  routes.jsx
│       ├── components/
│       │   ├── layout/     Navbar, Sidebar, AppShell, ProtectedRoute
│       │   ├── map/        MapView, LayerControl, RiskLegend, ImageOverlayLayer, PopupStats
│       │   ├── data/       StatCard, DashboardCard, InfrastructureTable, Chart,
│       │   │               SeverityBadge, ConfidenceMeter, DataConfidence, StatTable
│       │   ├── upload/     UploadBox, FileDropzone, UploadProgress, FileProbeCard
│       │   ├── pipeline/   ProgressPipeline, PipelineStepper
│       │   ├── report/     AIReportCard, ReportSection, ReportDownloadButton
│       │   └── ui/         Button, Input, Modal, Alert, Tabs, Toast, EmptyState,
│       │                   ErrorState, LoadingSkeleton, Drawer, Breadcrumb
│       ├── pages/          Login, Dashboard, Upload, Processing, Analysis,
│       │                   Indices, ChangeDetection, Infrastructure, RiskMap,
│       │                   Report, NotFound, Forbidden
│       ├── layouts/        AuthLayout, AppLayout
│       ├── services/       http.js (axios instance+interceptors), auth.api,
│       │                   satellite.api, analysis.api, map.api, report.api, risk.api
│       ├── hooks/          useAuth, useJobPolling, useMapLayers, useEvent, useDebounce
│       ├── context/        AuthContext, EventContext
│       ├── store/          authStore.js, eventStore.js   (zustand)
│       ├── utils/          severity.js, format.js, geo.js, constants.js, errors.js
│       ├── types/          jsdoc typedefs / prop types
│       ├── styles/         index.css (tokens)
│       └── assets/
├── backend/
│   ├── Dockerfile  requirements.txt  alembic.ini  pyproject.toml
│   ├── alembic/versions/
│   ├── app/                 (structure exactly as §H)
│   ├── ml/
│   │   ├── datasets.py  train.py  evaluate.py  export.py  config.yaml
│   │   └── README.md        # how to obtain Sen1Floods11 + run training
│   └── tests/
│       ├── conftest.py  test_auth.py  test_upload_validation.py
│       ├── test_indices.py  test_change.py  test_vectorize.py  test_area.py
│       ├── test_risk.py  test_infrastructure.py  test_report_schema.py
│       ├── test_api_*.py  test_pipeline.py
├── data/                     # gitignored
│   ├── uploads/  results/  models/  cache/
│   └── samples/              # bundled demo GeoJSON + demo rasters (committed)
├── scripts/
│   ├── make_demo_event.py    # synthetic before/after GeoTIFF + AOI
│   ├── seed_db.py  fetch_overture_aoi.py  download_model.sh
└── e2e/                      # playwright specs
```

---

## R. Dataset Strategy

### R.1 Verified — all confirmed to exist and be accessible

| # | Name | Source | Disaster | Sensor | Resolution | Labels | License | Size | Split | Fit for us |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **Sen1Floods11** | `gs://sen1floods11` (Cloud to Street, CVPRW 2020) | Flood | Sentinel-1 SAR (+ S2) | 10 m, 512² chips, 4,831 chips, 120,406 km², 11 events | flood water / permanent water masks; 446 hand-labeled + 4,385 weak | Public bucket; mirror reports CC BY 4.0 — **confirm LICENSE in `cloudtostreet/Sen1Floods11` before redistribution** | Hand-labeled subset ≈ **697 MB** (S1Hand 695 MB + labels 2.4 MB); full ≈ 14 GB | Official event-level CSV splits in `v1.1/splits/` | **Primary training dataset.** Small, georeferenced, flood-specific, event-level splits, S1+S2. |
| 2 | **FloodNet** | `github.com/BinaLab/FloodNet-Supervised_v1.0` (IEEE Access 2021) | Flood (post-Harvey) | UAV aerial | ~4K, sub-meter | 2,343–3,200 imgs, 9 classes incl. `building-flooded`, `road-flooded` | Research use (check repo) | ~GBs | provided/ask authors | Supplementary — validates the *infrastructure-impact* concept, not the SAR model. |
| 3 | **xBD / xView2** | xview2.org (registration) | 19 disasters incl. flood, fire, hurricane | Maxar WorldView, pre+post | ~0.5 m | 850,736 building polygons, 22,068 images, 45,362 km², 4-level damage | research license | large | official 80/10/10 | **Phase 2+** building-damage model. |
| 4 | **RescueNet** | Nature *Sci Data* 2023 | Hurricane Michael | UAV | sub-meter | 10 classes incl. road-blocked, building damage severity | Open (check) | moderate | provided | Road-block / damage semantics reference. |
| 5 | **Overture Maps** | `s3://overturemaps-us-west-2/release/` (anonymous GeoParquet) | – | vector | building + road footprints, ~4.2 B features, monthly | – | open (ODbL-compatible terms) | query-by-bbox only | – | **Infrastructure layer.** |
| 6 | **OpenStreetMap** | Overpass API | – | vector | buildings/roads/hospitals/schools/shelters | – | **ODbL, attribution required** | bbox query | – | Infrastructure fallback. |
| 7 | **Sentinel-2 L2A COGs** | Element84 Earth Search `s3://e84-earth-search-sentinel-data` (no requester-pays); also Planetary Computer STAC (search w/o key), Copernicus Data Space STAC | – | optical | 10/20/60 m | SCL cloud mask | Copernicus free & open | stream per band | – | Real imagery for validation / future auto-acquisition. |
| 8 | **JRC Global Surface Water** | EC JRC | – | Landsat-derived | 30 m | permanent water | free | global GeoTIFF | – | Permanent-water baseline (post-MVP). |
| 9 | **WorldPop** | worldpop.org | – | raster | 100 m | population counts | CC BY 4.0 | country files | – | Population exposure (post-MVP). |

**Research-backed training-note:** the Sen1Floods11 paper reports that models trained on the *weakly labeled* S2-derived chips outperformed those trained on scarce hand labels — so Phase 2 upgrade path is clear and low-risk.

### R.2 Development dataset (self-generated, committed)

`scripts/make_demo_event.py` creates a **synthetic but georeferenced** AOI: a base raster with terrain-like NDVI texture, a river, and a "post" raster with an expanded water body + cloud patches. Committed under `data/samples/` alongside matching sample buildings/roads GeoJSON. Labeled `is_demo=true` everywhere. This unblocks frontend + pipeline development before any real download.

### R.3 Explicitly NOT recommended (with reason)

- **Google Earth Engine** — superb but requires a GCP account + proprietary Python API; adds lock-in and an external dependency we don't need for MVP.
- **SpaceNet flood challenge data** — registration/licensing friction, less directly applicable than Sen1Floods11.
- **Any dataset I could not verify as downloadable** — excluded rather than assumed.

---

## S. Development Phases

Each phase: **objective · tasks · files · dependencies · output · acceptance criteria.**

### Phase 0 — Project Setup

- **Objective:** reproducible skeleton, one-command boot.
- **Tasks:** git init; Vite React app; FastAPI app; `docker-compose.yml` (postgres+postgis, redis, api, worker, frontend); `.env.example`; Makefile; health endpoint; Alembic baseline migration; README.
- **Files:** `docker-compose.yml`, `.env.example`, `backend/Dockerfile`, `frontend/vite.config.js`, `backend/app/main.py`, `core/config.py`.
- **Deps:** Docker Desktop/WSL2.
- **Output:** `make dev` boots all services; `GET /health` → `{db: ok, redis: ok}`.
- **Accept:** fresh clone → working stack in <10 min; `GET /` serves React shell.

### Phase 1 — UI Shell & Auth

- **Objective:** all 10 pages exist with real navigation and design system.
- **Tasks:** design tokens, AppShell/Sidebar/Navbar, router with `ProtectedRoute`, Login page + JWT context, all pages as structured placeholders with `EmptyState`/`LoadingSkeleton`, mock service layer, storybook-free component gallery page.
- **Files:** all of `frontend/src/{components/ui,layouts,pages}`, `services/http.js`, `store/authStore.js`.
- **Deps:** Phase 0.
- **Output:** navigable, professional-looking dashboard.
- **Accept:** login → dashboard → every route reachable; empty states on all data pages; dark theme consistent; mobile 768 px usable.

### Phase 2 — Backend Foundation (Auth + DB + Upload)

- **Objective:** persistent users and stored rasters with validated metadata.
- **Tasks:** SQLAlchemy models + Alembic migrations for §J schema; bcrypt + JWT (access 30 min / refresh 7 d, rotated, hashed in DB); login/register/me; upload endpoint with full validation (§I); local `StorageBackend`; rate limiting on login; structured errors with `error_id`.
- **Files:** `db/models.py`, `alembic/versions/*`, `core/security.py`, `core/errors.py`, `api/v1/auth.py`, `api/v1/satellite.py`, `services/upload_service.py`, `storage/*`.
- **Deps:** Phase 0.
- **Output:** real signup/login + rasters stored with probe metadata.
- **Accept:** pytest suite green — upload rejects `.txt`, rejects missing-CRS, rejects >limit, accepts demo GeoTIFF; wrong password → 401 with clean body; no secret in repo (`grep` for keys).

### Phase 3 — Job System + Processing Page

- **Objective:** async pipeline skeleton with live progress.
- **Tasks:** Redis + RQ worker service; `analysis_jobs` write path; `pipeline/runner.py` with 8 stage stubs; `POST /analysis/start`, `GET /analysis/jobs/{id}`, cancel; frontend `useJobPolling` + `ProgressPipeline` wired to real API.
- **Files:** `pipeline/*`, `workers/worker.py`, `services/job_service.py`, `api/v1/analysis.py`, `frontend/src/hooks/useJobPolling.js`, `pages/Processing.jsx`.
- **Deps:** Phase 2.
- **Output:** clicking "Start Analysis" runs stages and the UI advances with ✓.
- **Accept:** restart API mid-job → job still completes (proves RQ durability); killing worker → job marked failed with safe message; polling stops at terminal state.

### Phase 4 — Raster Processing + Indices

- **Objective:** correct geospatial math.
- **Tasks:** `gis/raster.py` (reproject/harmonize/cloud-mask/speckle); `gis/indices.py` (NDWI/MNDWI/NDVI + stats + delta); raster stats endpoint; NDVI/NDWI page rendering before/after/delta via `ImageOverlay` + stats table; synthetic demo generator.
- **Files:** `gis/raster.py`, `gis/indices.py`, `scripts/make_demo_event.py`, `frontend/src/pages/Indices.jsx`, `components/map/ImageOverlayLayer.jsx`.
- **Deps:** Phase 3.
- **Output:** demo event produces plausible NDWI/NDVI maps and stats.
- **Accept:** unit tests — known constant rasters yield exact index values; Δ on identical inputs = 0; area of test polygon within 0.5 % of geodesic reference; SAR input to `/ndwi` → 409.

### Phase 5 — AI Detection

- **Objective:** two interchangeable detectors, one trained model.
- **Tasks:** `detectors/base.py` + `index_threshold.py` (Otsu) working first; `ml/datasets.py|train.py|evaluate.py` on Sen1Floods11 hand-labeled subset (Colab); weights to `data/models/flood_unet_v1/`; `unet_flood.py` tiled inference + stitching; `model_registry.py`; `POST /ai/detect`, `GET .../metrics`; Analysis page shows mask overlay + confidence + detector used.
- **Files:** `detectors/*`, `ml/*`, `api/v1/ai.py`, `frontend/src/pages/Analysis.jsx`.
- **Deps:** Phase 4 (shared normalization), Phase 3.
- **Output:** real trained weights + masks on demo event.
- **Accept:** `ml/evaluate.py` emits IoU/Dice/P/R/F1 on held-out *event* split (numbers recorded in `metrics.json`, not hand-written); missing weights → automatic index fallback with warning; inference on CPU < 30 s for a 1024² scene.

### Phase 6 — Change Detection + Area

- **Objective:** before/after → flood extent polygons and km².
- **Tasks:** `gis/change.py` (ΔNDWI + Otsu + morphology + permanent-water baseline); `gis/vectorize.py`; `gis/area.py`; Change page with 3-up view, % change, polygon table, fly-to; store GeoJSON in `vector_layers` + `analysis_results`.
- **Files:** `gis/change.py`, `gis/vectorize.py`, `gis/area.py`, `frontend/src/pages/ChangeDetection.jsx`.
- **Deps:** Phase 4, 5.
- **Output:** change % + affected polygons on demo event.
- **Accept:** synthetic scene with planted 5 km² water growth measures within tolerance; polygons pass `is_valid`; rings RFC-7946; speck below `MIN_POLYGON_AREA` removed.

### Phase 7 — GIS Dashboard (Map + Layers)

- **Objective:** the map-centric experience.
- **Tasks:** `GET /api/map/{event_id}` manifest; GeoJSON + overlay endpoints with bbox filtering; `MapView` with all 8 layers, custom `LayerControl`, `RiskLegend`, popups, fitBounds, loading/error states; Dashboard map populated with event summary stats.
- **Files:** `api/v1/map.py`, `services/map_service.py`, `frontend/src/components/map/*`, `pages/Dashboard.jsx`, `pages/RiskMap.jsx`.
- **Deps:** Phase 6.
- **Output:** full interactive dashboard.
- **Accept:** all layers toggle independently; click polygon → drawer stats; layer with no data shows legend entry as "no data"; 5k-feature layer renders < 1 s after first load.

### Phase 8 — Infrastructure Analysis

- **Objective:** real building/road counts.
- **Tasks:** sample GeoJSON bundled + `vector_layers` upload; Overture bbox-pull script (DuckDB/GeoPandas) with on-disk cache; spatial intersection logic (`gis/infrastructure.py`); impact categories; Infrastructure page tabs + summary tiles + CSV export; empty state when no source.
- **Files:** `gis/infrastructure.py`, `services/infra_service.py`, `api/v1` infra routes, `scripts/fetch_overture_aoi.py`, `frontend/src/pages/Infrastructure.jsx`.
- **Deps:** Phase 6 (needs flood polygons).
- **Output:** total/affected/high-risk buildings and roads.
- **Accept:** synthetic 100-building AOI with known overlap → exact expected counts; missing source → empty state, no fabricated numbers; OSM attribution rendered.

### Phase 9 — Risk Engine

- **Objective:** defensible, explainable risk.
- **Tasks:** `gis/risk.py` + `risk_config.yaml`; zone generation; `risk_zones` persistence; `POST /risk/analyze`, `GET /risk/config`; RiskMap page with zones, per-zone score breakdown, weights disclosure popover; severity badge fed into Dashboard.
- **Files:** `gis/risk.py`, `api/v1/risk.py`, `frontend/src/pages/RiskMap.jsx`, `components/data/SeverityBadge.jsx`.
- **Deps:** Phase 8 (infra component).
- **Output:** 4-band zones with component bars.
- **Accept:** weight-sum validation; removing population layer renormalizes weights and reports `not_available`; identical inputs → identical scores (pure function test); disclaimer present in API + UI.

### Phase 10 — AI Report + PDF

- **Objective:** structured evidence → narrative report → PDF.
- **Tasks:** `report/evidence.py` + `schema.py` (pydantic); `template.py` (Jinja2); `llm.py` (OpenAI-compatible, 15 s timeout, JSON-mode, retry → fallback); `pdf.py` (reportlab); endpoints `POST/GET /report/*`; Report page with provenance chips, regenerate, download; notification on failure.
- **Files:** `report/*`, `api/v1/report.py`, `frontend/src/pages/Report.jsx`.
- **Deps:** Phase 9 (needs risk in evidence).
- **Output:** complete report on demo event with and without an LLM key.
- **Accept:** evidence JSON passes schema; no key → template renders, `source:"template"`; key present → `source:"llm"`; LLM returns invalid JSON twice → template fallback + toast; PDF opens, contains disclaimer and all sections; report never contains numbers absent from evidence.

### Phase 11 — Testing

- **Objective:** confidence in the whole chain.
- **Tasks:** see §T. CI workflow running lint + typecheck + unit + API tests on push.
- **Deps:** Phases 1–10.
- **Accept:** all suites green; coverage of `services/` + `gis/` ≥ 80 %; e2e happy path passes.

### Phase 12 — Deployment & Hardening

- **Objective:** publicly runnable, secure.
- **Tasks:** production `docker-compose` (nginx serving built React + proxy to API); env hardening; rate limits; upload scanning (extension + GDAL open + size + virus scan optional); log rotation; backup script for Postgres + `data/`; runbook; seed demo user/event; README with screenshots.
- **Deps:** Phase 11.
- **Accept:** deployed URL: login → demo event → full pipeline → PDF, on a fresh machine with only Docker installed.

**Dependency summary:** 0→(1,2)→3→4→(5,6)→7→8→9→10→11→12. Phases 5 and 6 both depend on 4 and can proceed in parallel; frontend pages can be built against mocked services from Phase 1 onward.

---

## T. Testing Strategy

| Layer | Tool | What | Key cases |
|---|---|---|---|
| Backend unit | `pytest` | gis/detectors/risk/report pure functions | index math on constant rasters; Otsu on bimodal array; geodesic area of 1°×1°; vectorize validity; risk weight renormalization; evidence schema completeness |
| API | `pytest` + `httpx.AsyncClient` | every endpoint happy + error path | auth required on all protected routes; 401/403/404/409/413/415/422 mapping; idempotency key replay |
| Auth | pytest | security | bcrypt verify; expired/invalid/tampered JWT rejected; refresh rotation; rate limit triggers |
| File validation | pytest + tiny fixtures | upload | `.txt` masquerading as `.tif`, 0-byte, no-CRS GeoTIFF, 26 GB declaration, zip bomb size, wrong band count, AOI too large |
| Pipeline | pytest + `rq` sync mode / fake queue | stage orchestration | stage failure marks FAILED + safe message; progress monotonic; stage list matches UI |
| AI | `ml/evaluate.py` (not pytest) | model quality | IoU, Dice, Precision, Recall, F1, Accuracy, PR curve, inference time — **on held-out events only**; must run before any metric is published |
| GIS | pytest | CRS/GeoJSON | GeoJSON RFC 7946 compliance (`geojson` validator); `is_valid` on all outputs; known-area fixtures ±0.5 %; reprojection round-trip error bounds; nodata never counted as data |
| Frontend | `vitest` + Testing Library | components | UploadBox validation messages; ProgressPipeline state machine; SeverityBadge color mapping; LayerControl toggles; auth interceptor refresh; report section rendering |
| Map | vitest (jsdom-limited) + Playwright visual | rendering | layer manifest → layer added; click → popup; empty/error states |
| E2E | **Playwright** | full MVP flow | login → upload demo pair → start → wait for COMPLETED → assert dashboard stats → toggle layers → infrastructure counts → risk bands → report renders → PDF downloads & is non-empty |
| Non-functional | script | perf | 512² and 2048² scene end-to-end duration; API p95 for `/dashboard` < 500 ms; map layer payload < 5 MB |

**Fixtures:** `tests/fixtures/` holds a 64×64 synthetic GeoTIFF with CRS, a CRS-less twin, a 100-building GeoJSON with a known 12-building flood overlap, and a precomputed evidence JSON.

---

## U. Deployment Strategy

### U.1 Local development

```yaml
# docker-compose.dev.yml services
postgres:  postgis/postgis:15-3.4  (port 5432, volume pgdata)
redis:     redis:7-alpine          (port 6379)
api:       uvicorn app.main:app --reload  (port 8000)
worker:    rq worker (same image, command override)
frontend:  vite dev server         (port 5173, proxy /api → 8000)
```

`make dev` = `docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d`. Backend/frontend may also run natively (Python 3.11 venv + npm) against the Dockerized DB/Redis.

### U.2 Production (affordable — student budget)

**Option A (recommended): single VPS, $5–12/mo** (Hetzner/OVH/DigitalOcean 2 vCPU/4 GB):

```
nginx (TLS via Let's Encrypt, serves frontend build, proxies /api)
  ├─ backend:  uvicorn, 2 workers
  ├─ worker:   1 RQ worker, concurrency 1
  ├─ postgres: postgis container (volume + nightly pg_dump)
  ├─ redis:    appendonly yes
  └─ data volume: uploads/results/models
```

**Option B:** Render/Railway/Fly.io for API+worker (note: worker must be a separate service) + **Supabase free tier** (includes PostGIS) + Vercel/Netlify for frontend. Watch free-tier disk and 15-min request timeouts — long jobs are fine (they run in the worker), but set API timeouts generously.

**Model inference:** CPU only (U-Net-34 is small) — no GPU cost.

**LLM:** external API or local Ollama on the same VPS (7 B model, ~5 GB RAM).

**Backups:** nightly `pg_dump` + `tar` of `data/results` (7-day retention). Restore documented in `RUNBOOK.md`.

**Scaling path (only when needed):** horizontal API replicas behind nginx → read replicas / pgBouncer → move `data/` to S3-compatible object storage (drop-in via `StorageBackend`) → worker concurrency ↑ → Redis on managed service → PMTiles/TiTiler for raster tiles. None of this is built until a real need appears.

---

## V. Security

| Area | Control |
|---|---|
| Passwords | bcrypt (cost 12), min 10 chars, never logged, never returned |
| Tokens | HS256 JWT, 30 min access + rotating refresh (hashed at rest, revoke on logout/password change), secret ≥ 32 chars from env |
| Authorization | every query scoped by `user_id`; resource-level 403 checks; `role` for admin-only (raw logs, model metrics) |
| Upload | extension allowlist **and** `rasterio.open()` probe (magic-byte reality check); size cap (`MAX_UPLOAD_MB`, default 512); pixel-count cap; AOI area cap; reject CRS-less unless EPSG supplied; strip zip/aux files; store outside web root with random UUID keys; filenames never used in paths (prevent traversal); optional `clamdscan` hook |
| Raster parsing | GDAL running on attacker-controlled files is the highest risk surface → run the worker as non-root, container with read-only rootfs + writable `data/`, no network egress except LLM/S3, `GDAL_CACHEMAX` bounded |
| API validation | pydantic models everywhere; `Content-Length` guard; multipart count == expected |
| Rate limiting | `slowapi`/redis: 5/min on login, 60/min/user on analysis/report |
| CORS | explicit origins from env, `allow_credentials` only for refresh cookie |
| Secrets | `.env` git-ignored, `.env.example` documented; pre-commit `gitleaks`; no keys in images |
| Cookies | refresh cookie: `HttpOnly`, `SameSite=Lax`, `Secure` in prod |
| Headers | nginx: HSTS, `X-Content-Type-Options`, `X-Frame-Options`, CSP allowing tile CDNs |
| Errors | global handler → `{code, message, error_id}`; stack traces only in server logs |
| LLM | prompt-injection hardening: evidence JSON is data-only, system prompt forbids following instructions inside it; no secrets in prompts; PII: none collected beyond email |
| Compliance note | OSM ODbL attribution on UI + report; Copernicus attribution for Sentinel data; demo data clearly labeled |

---

## W. Risks and Mitigations

| # | Risk | L | I | Mitigation |
|---|---|---|---|---|
| 1 | PostGIS/Windows install friction | H | M | Docker Desktop as documented prerequisite; provide WSL2 setup steps in README; CI runs the real DB |
| 2 | Model performs poorly on user uploads (domain shift) | H | H | Always-available index-threshold detector; record `detector_used`; UI shows method + confidence; never claim accuracy not measured |
| 3 | User uploads SAR and expects NDWI | H | M | `sensor_type` declared at upload; 409 with explanatory message; SAR path uses backscatter + U-Net |
| 4 | No GPU / slow inference | M | M | CPU-viable U-Net-34; tiled inference with progress; queue keeps UI responsive |
| 5 | Dataset license ambiguity (Sen1Floods11) | M | H | Verify LICENSE before redistribution; cite the CVPRW paper; weights committed without dataset |
| 6 | Overture/OSM unavailable or too slow for large AOI | M | M | On-disk bbox cache; bundled sample GeoJSON; graceful `insufficient_data` |
| 7 | LLM cost/latency/outage | M | M | Template fallback is first-class; 15 s timeout; one retry; `source` always shown |
| 8 | Large rasters exhaust memory | H | H | Pixel-count cap; windowed/tiled reads; `rasterio` streaming, never full-array `read()` on huge files |
| 9 | Area/CRS math errors (silent wrong km²) | M | H | Geodesic computation only; golden tests with known areas; store `aoi_area_km2` at creation |
| 10 | Job lost on crash | M | M | RQ + Redis persistence; job row in Postgres is source of truth; worker idempotent per stage (stage re-runnable) |
| 11 | Report invents facts | M | H | Strict evidence schema; system prompt constraint; provenance chips; fallback if schema violated; disclaimer |
| 12 | Scope creep into fire/landslide/agent early | H | H | §C tier table; `Detector` plugin seams built in Phase 5 but only flood ships; every phase has explicit acceptance criteria |
| 13 | Map sluggish with thousands of buildings | M | M | bbox filtering, simplification, feature cap, canvas renderer for dense layers; PMTiles later |
| 14 | Security incident via GDAL on malicious file | L | H | Non-root worker container, size/pixel caps, isolated volume, optional ClamAV |
| 15 | Users treat output as authoritative | M | H | Persistent disclaimers in UI, map, report, PDF; confidence + limitations always visible |

---

## X. MVP Acceptance Criteria

A user can, on a freshly deployed instance:

1. **Register / log in** with email+password; invalid credentials produce a clear error; session survives refresh; logout works.
2. **Upload** a before/after GeoTIFF pair with metadata; invalid files (wrong type, no CRS, oversized) are rejected with human-readable messages; valid files show CRS, bounds, band count, resolution.
3. **Start processing** and watch an 8-stage pipeline progress live; a stage failure shows a safe message and a retry, never a Python traceback.
4. **See NDWI and/or NDVI** before, after, and difference visualizations with statistics (and a correct, explicit error for SAR inputs).
5. **See AI flood detection results** — mask overlay, confidence, and which detector ran (with a metrics endpoint reporting IoU/Dice/P/R/F1 from a real evaluation run).
6. **See change detection** — before/after/change views, `change_pct`, affected polygons table with areas in km² (validated against a known test case).
7. **View the GIS dashboard** — all 8 layers toggle, click polygons for stats, legend shows the 4 severity colors, zoom/pan smooth.
8. **See infrastructure impact** — total/affected/high-risk buildings, affected road segments, critical-infrastructure counts, or an honest empty state if no source exists.
9. **See risk zones** — LOW/MEDIUM/HIGH/CRITICAL on the map, per-zone score breakdown, weights and the "project assumption" disclosure on demand.
10. **Read an AI situation report** with all 10 required sections, provenance chips distinguishing measured/model/assumption/AI text, and limitations.
11. **Download a PDF** of that report containing the disclaimer.
12. **Demo data path:** with no external API keys and no Overture access, the bundled demo event completes the entire flow.

**Explicitly not required for MVP:** auto satellite acquisition, fire/landslide, population-accurate exposure, routing, real-time alerts, multi-tenant orgs, SSE job streaming, tile server.

---

## Y. Final Step-by-Step Build Order

```
Step 1  →  Project setup            (git, Vite React, FastAPI, Docker, .env, health)
Step 2  →  Database                 (PostGIS, models, Alembic migration, session DI)
Step 3  →  Backend skeleton         (routers, error taxonomy, config, logging, DI graph)
Step 4  →  Frontend skeleton        (design tokens, AppShell, router, UI kit, all 10 pages stubbed)
Step 5  →  Authentication           (bcrypt, JWT+refresh, ProtectedRoute, AuthContext)
Step 6  →  Upload system            (validation, raster probe, StorageBackend, satellite_images rows)
Step 7  →  Job architecture         (Redis+RQ, worker, stage runner, ProgressPipeline UI)
Step 8  →  Raster processing        (reproject, harmonize, cloud/speckle, demo GeoTIFF generator)
Step 9  →  NDWI / NDVI              (indices, stats, delta, Indices page + ImageOverlay)
Step 10 →  Flood model              (detectors interface, index-threshold first, then U-Net train+integrate)
Step 11 →  Change detection         (ΔNDWI + Otsu + cleanup + vectorize + geodesic area)
Step 12 →  GIS map                  (map manifest, GeoJSON/overlay endpoints, MapView, layers, legend)
Step 13 →  Infrastructure analysis  (sample GeoJSON, Overture pull, spatial join, impact categories)
Step 14 →  Risk engine              (weights, zones, bands, disclosure, RiskMap page)
Step 15 →  AI report                (evidence schema, template, LLM adapter, PDF, Report page)
Step 16 →  Testing                  (pytest suites, vitest, Playwright e2e, AI metrics run)
Step 17 →  Deployment               (prod compose, nginx+TLS, backups, runbook, README)
```

| Step | What to build | Why here | Prerequisites | Expected output | How to verify |
|---|---|---|---|---|---|
| 1 | Repo + two app shells + compose | Everything else needs a place to live and a boot command | none | `make dev` boots, `/health` OK | fresh clone boots <10 min; CI lint passes |
| 2 | Schema/migrations | Later steps write to tables; schema-first prevents rework | 1 | 10 tables exist w/ PostGIS ext | `alembic upgrade head` idempotent; `dt` shows geometry cols + GIST |
| 3 | Routers, errors, config | Establishes contracts the frontend codes against | 1–2 | documented `/api/v1` skeleton | pytest for error shape; OpenAPI at `/docs` renders |
| 4 | UI kit + page stubs | Lets frontend progress in parallel with backend | 1 | all routes reachable, theming done | visual pass at 1440/768 px; empty states everywhere |
| 5 | Auth | Upload/data endpoints must be protected from the start | 3 | login/logout/refresh | pytest auth suite; browser session survives refresh |
| 6 | Upload + storage | Produces the artifacts every later stage consumes | 2,5 | images stored, metadata probed | rejection tests (txt/no-CRS/oversize) all pass |
| 7 | Jobs | Long-running work must be async before real processing exists | 6 | stages run & report progress | kill API mid-job → job still finishes |
| 8 | Raster preprocessing | Indices/detection are meaningless on unaligned input | 7 | aligned stacks + preprocess log | identical-input reprojection test; demo scene valid |
| 9 | Indices | First real scientific output; validates band handling | 8 | NDWI/NDVI maps + stats | constant-raster unit tests exact; SAR → 409 |
| 10 | Flood model | Needs normalized inputs (8) to train/infer consistently | 9 | weights + masks + metrics | `ml/evaluate.py` produces IoU/Dice/P/R/F1; fallback works with weights absent |
| 11 | Change detection | Needs indices (9) and masks (10) for baseline | 9,10 | flood extent + km² + polygons | planted-growth scene measured within tolerance |
| 12 | GIS map | Renders the outputs of 10–11; core UX payoff | 11 | interactive 8-layer dashboard | layers toggle, click→stats, payload sizes bounded |
| 13 | Infrastructure | Needs flood polygons (11) to intersect | 11 | building/road/critical counts | synthetic AOI yields exact expected counts |
| 14 | Risk engine | Needs severity (11) + infrastructure (13) + accessibility | 13 | scored zones w/ breakdown | pure-function determinism test; weight validation |
| 15 | AI report | Needs the complete evidence chain (9–14) | 14 | report + PDF | evidence schema valid; no-key path works; PDF contains disclaimer |
| 16 | Testing | After features exist, before shipping | 1–15 | green suites + e2e | CI green; coverage targets met |
| 17 | Deployment | Last, so it captures the real config | 16 | live URL + runbook | full MVP flow on a clean machine |

---

## Mapping to the 25 Required Documentation Outputs

| Doc output | Section |
|---|---|
| 1. Project Overview | A |
| 2. Problem Statement | B |
| 3. Objectives | B (four questions) + C |
| 4. Functional Requirements | C, G, I, X |
| 5. Non-Functional Requirements | T, U, V, W |
| 6. User Roles | G (analyst/auth), H (`users.role`) |
| 7. Complete System Architecture | D |
| 8. Data Flow Diagram | E |
| 9. AI/ML Pipeline | L |
| 10. GIS Pipeline | K, M |
| 11. Frontend Architecture | F, Q |
| 12. Backend Architecture | H, Q |
| 13. Database Schema | J |
| 14. API Specification | I |
| 15. Folder Structure | Q |
| 16. Dataset Strategy | R |
| 17. Model Strategy | L |
| 18. UI/UX Design | F (tokens), G |
| 19. Security | V |
| 20. Testing Strategy | T |
| 21. Deployment Architecture | U |
| 22. Development Roadmap | S, Y |
| 23. MVP vs Future Features | C, X |
| 24. Risks and Mitigations | W |
| 25. Final Implementation Checklist | Y (build order + X acceptance) |

---

**Planning is complete. No implementation code was written.** Implementation should begin at **Step 1** only after approval of this blueprint (or requested revisions to scope, stack, or the MVP boundary).
