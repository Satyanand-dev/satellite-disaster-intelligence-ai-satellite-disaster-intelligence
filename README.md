# AI-Powered Satellite Disaster Intelligence & Emergency Response System

A full-stack, map-centric platform that ingests pre-/post-disaster satellite imagery and runs a
deterministic geospatial chain — preprocessing → spectral indices (NDWI/NDVI) → AI flood
segmentation → change detection → infrastructure overlay → risk scoring — then renders results
on an interactive GIS dashboard and generates an AI-assisted situation report with PDF export.

> **Decision-support only.** Output is not an authoritative emergency instruction. Always verify
> with official emergency services and ground assessment.

## Status

Planning complete — **no implementation code yet.**

- 📄 Full technical blueprint: [`plan.md`](./plan.md)
- 🎯 MVP scope: **flood disaster intelligence**, end-to-end, before any other disaster type.

## Planned stack

| Layer | Choice |
|---|---|
| Frontend | React 18 + Vite + React-Leaflet + TailwindCSS |
| Backend | Python 3.11 + FastAPI (modular routers) |
| Database | PostgreSQL 15 + PostGIS 3.4 |
| Jobs | Redis + RQ |
| GIS | rasterio, GDAL, geopandas, shapely, pyproj |
| AI | U-Net (ResNet34 encoder) + index-threshold fallback detector |
| Report | OpenAI-compatible LLM + deterministic template fallback |

## Prerequisites

- **Docker Desktop with WSL2 backend** (required for PostGIS)
- Node.js 20+
- Python 3.11+
- Git

## Quick start

```bash
# 1. configure environment
cp .env.example .env      # then fill in JWT_SECRET etc.

# 2. boot the stack   (postgres+postgis, redis, api, worker, frontend)
make dev

# 3. open the app
#    frontend → http://localhost:5173
#    API docs → http://localhost:8000/docs
```

> `make dev` becomes available in **Phase 0** of the build order (see `plan.md` §S).

## Repository layout

```
ammulu_project/
├── plan.md            # complete technical blueprint (source of truth)
├── .env.example       # environment template — no secrets
├── frontend/          # React app            (Phase 0)
├── backend/           # FastAPI + ML + GIS   (Phase 0)
├── data/samples/      # committed demo rasters + sample GeoJSON
├── scripts/           # demo generator, seeding, Overture fetch
├── docs/              # architecture, API, runbook
└── e2e/               # Playwright specs
```

## Build order

See `plan.md` §Y — Steps 1–17, from repository setup through deployment.
Current step: **Step 1 — repository initialization.**

## Data & licensing notes

- OpenStreetMap data is ODbL — attribution required in UI and reports.
- Copernicus/Sentinel data is free & open — attribution required.
- Model training uses the public **Sen1Floods11** dataset (confirm its LICENSE before redistribution).
- All demo/seeded events are flagged `is_demo = true` and badged **DEMO DATA** in the UI.
