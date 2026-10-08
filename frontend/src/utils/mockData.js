/**
 * Demo dataset (plan.md §C "mock early").
 * Every value here is FICTIONAL demo data for the demo AOI — never presented
 * as a real-world observation. UI must keep the DEMO DATA badge visible.
 * Real values come from the API in a later phase.
 */

export const DEMO_EVENT = {
  id: 'evt_demo_01',
  name: 'Kosi Basin — Demo Flood AOI',
  isDemo: true,
  disasterType: 'flood',
  sensorType: 'optical',
  preDate: '2026-08-01',
  postDate: '2026-08-12',
  crs: 'EPSG:32645',
  resolutionM: 10,
  severity: { band: 'HIGH', score: 67.4 },
  affectedAreaKm2: 24.6,
  aoiAreaKm2: 310.2,
  changePct: 7.9,
  vegetationLossKm2: 3.1,
  permanentWaterKm2: 41.0,
  buildings: { total: 12400, affected: 1240, highRisk: 318, partial: 802, major: 438 },
  roads: { totalKm: 412.5, affectedKm: 38.2, blockedCandidates: 18 },
  critical: {
    hospitals: { total: 6, affected: 1 },
    schools: { total: 24, affected: 5 },
    shelters: { total: 9, affected: 0 },
    bridges: { total: 11, affected: 3 },
  },
  detection: {
    detector: 'unet_flood_v1',
    confidence: 0.83,
    threshold: 0.47,
    inferenceMs: 1840,
    tiles: 96,
    fallback: false,
  },
  cloud: { coverPct: 12.4, handling: 'SCL_masked' },
  updatedAt: '2026-10-08T12:00:00Z',
}

export const RISK = {
  score: 67.4,
  band: 'HIGH',
  weights: { severity: 0.4, population: 0.25, infrastructure: 0.25, accessibility: 0.1 },
  components: { severity: 0.71, population: 0.55, infrastructure: 0.62, accessibility: 0.4 },
  disclosure:
    'Weights are project-defined assumptions for demonstration purposes. They are not derived from an authoritative emergency-management standard. Risk zones are screening indicators only.',
}

export const INDICES = {
  ndwi: {
    label: 'NDWI',
    formula: '(Green − NIR) / (Green + NIR)',
    pre: { min: -0.62, max: 0.78, mean: 0.04, std: 0.19, aboveThreshold: 8.2 },
    post: { min: -0.55, max: 0.91, mean: 0.31, std: 0.27, aboveThreshold: 16.1 },
    delta: 0.27,
    threshold: 0.18,
  },
  ndvi: {
    label: 'NDVI',
    formula: '(NIR − Red) / (NIR + Red)',
    pre: { min: -0.11, max: 0.86, mean: 0.42, std: 0.21, aboveThreshold: 71.4 },
    post: { min: -0.14, max: 0.79, mean: 0.33, std: 0.24, aboveThreshold: 62.8 },
    delta: -0.09,
    threshold: 0.3,
  },
}

export const PIPELINE_STAGES = [
  { key: 'UPLOAD', label: 'Upload', pct: 8 },
  { key: 'PREPROCESS', label: 'Preprocessing', pct: 18 },
  { key: 'SPECTRAL', label: 'Spectral Analysis', pct: 32 },
  { key: 'AI_DETECT', label: 'AI Detection', pct: 50 },
  { key: 'CHANGE_DETECT', label: 'Change Detection', pct: 65 },
  { key: 'INFRASTRUCTURE', label: 'Infrastructure Analysis', pct: 80 },
  { key: 'RISK', label: 'Risk Analysis', pct: 90 },
  { key: 'REPORT', label: 'Report Generation', pct: 100 },
]

export const CHANGE_POLYGONS = [
  { id: 'p1', type: 'new-water', areaKm2: 9.4, centroid: '26.412 N, 86.104 E' },
  { id: 'p2', type: 'new-water', areaKm2: 7.1, centroid: '26.388 N, 86.221 E' },
  { id: 'p3', type: 'new-water', areaKm2: 4.8, centroid: '26.455 N, 86.310 E' },
  { id: 'p4', type: 'vegetation-loss', areaKm2: 3.1, centroid: '26.401 N, 86.177 E' },
  { id: 'p5', type: 'new-water', areaKm2: 3.3, centroid: '26.356 N, 86.093 E' },
]

export const RISK_ZONES = [
  {
    id: 'z1',
    band: 'CRITICAL',
    score: 81.2,
    areaKm2: 4.7,
    components: { severity: 0.88, population: 0.74, infrastructure: 0.86, accessibility: 0.51 },
    reasons: ['138 buildings intersected', '3 critical facilities nearby', '2 road segments blocked'],
  },
  {
    id: 'z2',
    band: 'HIGH',
    score: 71.5,
    areaKm2: 6.2,
    components: { severity: 0.79, population: 0.61, infrastructure: 0.7, accessibility: 0.44 },
    reasons: ['264 buildings intersected', 'school within extent'],
  },
  {
    id: 'z3',
    band: 'HIGH',
    score: 64.0,
    areaKm2: 5.1,
    components: { severity: 0.7, population: 0.55, infrastructure: 0.62, accessibility: 0.4 },
    reasons: ['412 buildings intersected', 'affected road length 11.4 km'],
  },
  {
    id: 'z4',
    band: 'MEDIUM',
    score: 46.3,
    areaKm2: 5.8,
    components: { severity: 0.52, population: 0.41, infrastructure: 0.44, accessibility: 0.35 },
    reasons: ['301 buildings intersected', 'roads passable'],
  },
  {
    id: 'z5',
    band: 'MEDIUM',
    score: 38.9,
    areaKm2: 2.8,
    components: { severity: 0.44, population: 0.33, infrastructure: 0.36, accessibility: 0.3 },
    reasons: ['125 buildings intersected', 'rural, sparse network'],
  },
]

export const INFRA = {
  buildings: [
    { id: 'b1', name: 'Ward 4 cluster A', affected: true, score: 0.92, reason: '92% flood coverage', risk: 'CRITICAL' },
    { id: 'b2', name: 'Ward 4 cluster B', affected: true, score: 0.74, reason: '74% flood coverage', risk: 'HIGH' },
    { id: 'b3', name: 'Market street block', affected: true, score: 0.66, reason: 'partial coverage', risk: 'HIGH' },
    { id: 'b4', name: 'Riverside col.', affected: true, score: 0.58, reason: 'partial coverage', risk: 'MEDIUM' },
    { id: 'b5', name: 'NH-57 service road', affected: false, score: 0.12, reason: 'outside extent', risk: 'LOW' },
    { id: 'b6', name: 'Elevated plot 12', affected: false, score: 0.05, reason: 'above waterline', risk: 'LOW' },
    { id: 'b7', name: 'Ward 7 cluster C', affected: true, score: 0.81, reason: '81% flood coverage', risk: 'CRITICAL' },
    { id: 'b8', name: 'Canal bank row', affected: true, score: 0.49, reason: 'edge coverage', risk: 'MEDIUM' },
  ],
  roads: [
    { id: 'r1', name: 'NH-57 (12.4 km)', affected: true, score: 0.88, reason: '8.9 km affected → blocked candidate', risk: 'CRITICAL' },
    { id: 'r2', name: 'SH-24 (22.1 km)', affected: true, score: 0.61, reason: '13.5 km affected → blocked candidate', risk: 'HIGH' },
    { id: 'r3', name: 'Ward link road', affected: true, score: 0.44, reason: '1.2 km affected', risk: 'MEDIUM' },
    { id: 'r4', name: 'Ring road north', affected: false, score: 0.08, reason: 'clear', risk: 'LOW' },
    { id: 'r5', name: 'Rail overbridge appr.', affected: true, score: 0.7, reason: 'approach flooded', risk: 'HIGH' },
  ],
  hospitals: [
    { id: 'h1', name: 'District Hospital', affected: true, score: 0.64, reason: 'access road affected', risk: 'HIGH' },
    { id: 'h2', name: 'CHC Raghopur', affected: false, score: 0.1, reason: 'clear', risk: 'LOW' },
    { id: 'h3', name: 'CHC Supaul', affected: false, score: 0.06, reason: 'clear', risk: 'LOW' },
  ],
  schools: [
    { id: 's1', name: 'PS Ward 4', affected: true, score: 0.77, reason: 'within extent', risk: 'CRITICAL' },
    { id: 's2', name: 'MS Canal side', affected: true, score: 0.55, reason: 'partial coverage', risk: 'MEDIUM' },
    { id: 's3', name: 'HS Ring road', affected: false, score: 0.09, reason: 'clear', risk: 'LOW' },
  ],
  shelters: [
    { id: 'sh1', name: 'Community Hall', affected: false, score: 0.04, reason: 'clear — usable', risk: 'LOW' },
    { id: 'sh2', name: 'School shelter B', affected: false, score: 0.07, reason: 'clear — usable', risk: 'LOW' },
    { id: 'sh3', name: 'Riverside camp', affected: true, score: 0.69, reason: 'within extent', risk: 'HIGH' },
  ],
}

export const INFRA_SUMMARY = {
  buildings: { total: DEMO_EVENT.buildings.total, affected: DEMO_EVENT.buildings.affected },
  roads: { total: DEMO_EVENT.roads.totalKm, affected: DEMO_EVENT.roads.affectedKm },
  hospitals: DEMO_EVENT.critical.hospitals,
  schools: DEMO_EVENT.critical.schools,
  shelters: DEMO_EVENT.critical.shelters,
}

export const RECENT_EVENTS = [
  { id: 'evt_demo_01', name: 'Kosi Basin — Demo Flood AOI', severity: 'HIGH', area: '24.6 km²', when: '2026-10-08' },
  { id: 'evt_demo_02', name: 'Coastal backwater — Demo', severity: 'MEDIUM', area: '9.8 km²', when: '2026-09-21' },
  { id: 'evt_demo_03', name: 'Urban overflow — Demo', severity: 'LOW', area: '2.4 km²', when: '2026-09-03' },
]

/** Schematic map shapes (viewBox 0 0 800 450) — purely illustrative. */
export const MAP_SHAPES = {
  river:
    'M -20 300 C 120 280, 200 340, 320 320 C 440 300, 520 360, 640 330 C 720 312, 780 340, 820 330',
  floodA: 'M 180 210 C 250 175, 340 185, 400 230 C 455 272, 470 330, 420 355 C 355 388, 250 380, 200 340 C 155 305, 140 245, 180 210 Z',
  floodB: 'M 470 120 C 530 100, 605 115, 630 160 C 652 200, 630 250, 580 262 C 525 275, 470 250, 455 205 C 443 168, 445 133, 470 120 Z',
  zones: [
    { id: 'z1', band: 'CRITICAL', d: 'M 200 230 C 250 210, 310 225, 330 265 C 348 302, 320 345, 270 350 C 218 355, 185 320, 188 280 C 190 254, 195 238, 200 230 Z' },
    { id: 'z2', band: 'HIGH', d: 'M 350 245 C 400 230, 445 255, 450 300 C 455 340, 425 368, 380 365 C 335 362, 315 330, 320 295 C 324 268, 330 251, 350 245 Z' },
    { id: 'z3', band: 'HIGH', d: 'M 480 140 C 530 125, 590 145, 605 185 C 618 222, 595 255, 550 262 C 505 268, 470 245, 462 205 C 456 175, 462 148, 480 140 Z' },
    { id: 'z4', band: 'MEDIUM', d: 'M 620 260 C 670 250, 720 275, 725 315 C 730 355, 695 382, 655 378 C 615 374, 595 345, 600 310 C 604 285, 606 265, 620 260 Z' },
    { id: 'z5', band: 'MEDIUM', d: 'M 90 120 C 140 108, 185 130, 190 170 C 195 208, 165 235, 125 232 C 85 229, 62 202, 66 168 C 70 140, 74 125, 90 120 Z' },
  ],
}

export const REPORT = {
  source: 'template',
  model: null,
  sections: [
    {
      id: 'summary',
      title: 'Disaster Summary',
      provenance: ['MEASURED', 'MODEL PREDICTION'],
      body: 'Optical imagery acquired 12 days apart over the demo AOI shows a substantial expansion of surface water. The AI segmentation model (unet_flood_v1, confidence 0.83) maps 24.6 km² of newly inundated area — 7.9% of the AOI — with severity classified HIGH (risk score 67.4/100).',
    },
    {
      id: 'what',
      title: 'What Happened?',
      provenance: ['MEASURED', 'MODEL PREDICTION'],
      body: 'A flood event expanded surface water beyond the pre-event baseline. NDWI rose from 0.04 (pre) to 0.31 (post), a +0.27 change, while NDVI fell by 0.09 indicating vegetation inundation or damage. 41.0 km² of permanent water was excluded from the affected-area figure.',
    },
    {
      id: 'where',
      title: 'Where?',
      provenance: ['MEASURED'],
      body: 'New inundation is concentrated in five zones across the AOI (26.35–26.46 N, 86.09–86.31 E). The two largest concentrations account for 16.5 km² of the 24.6 km² total. All zones are displayed on the risk map layer.',
    },
    {
      id: 'severity',
      title: 'Severity',
      provenance: ['MODEL PREDICTION', 'ASSUMPTION'],
      body: 'Overall severity: HIGH (67.4/100). Component contributions — severity 0.71, population exposure 0.55, infrastructure impact 0.62, accessibility 0.40 — using project-defined weights (0.40/0.25/0.25/0.10).',
    },
    {
      id: 'area',
      title: 'Affected Area',
      provenance: ['MEASURED'],
      body: '24.6 km² newly flooded (7.9% of 310.2 km² AOI). Vegetation loss detected: 3.1 km². Largest single change polygon: 9.4 km².',
    },
    {
      id: 'infra',
      title: 'Infrastructure Impact',
      provenance: ['DATASET', 'MODEL PREDICTION'],
      body: '1,240 of 12,400 mapped buildings intersect the flood extent (10.0%), of which 318 are high-risk (≥70% coverage). 38.2 km of 412.5 km road network is affected; 18 segments are blocked candidates. 1 hospital access route, 5 schools and 3 bridges are affected. All 9 mapped shelters remain usable.',
    },
    {
      id: 'zones',
      title: 'High-Risk Zones',
      provenance: ['MODEL PREDICTION', 'ASSUMPTION'],
      body: '1 CRITICAL zone (z1, score 81.2, 4.7 km²) and 2 HIGH zones (z2 71.5, z3 64.0). Zone z1 contains 138 intersected buildings and 3 critical facilities nearby.',
    },
    {
      id: 'priorities',
      title: 'Recommended Response Priorities',
      provenance: ['AI-GENERATED TEXT'],
      ordered: true,
      body: [
        'Inspect CRITICAL zone z1 (4.7 km²) first — highest combined score and nearest critical facilities.',
        'Verify the 18 blocked-candidate road segments before routing convoys; prioritise NH-57 and SH-24.',
        'Check accessibility of the District Hospital (access road affected) and confirm alternate routes.',
        'Confirm isolation status of zone z2/z3 residents where road segments are cut.',
        'Coordinate ground verification for all high-risk buildings (318) before damage classification.',
      ],
    },
    {
      id: 'confidence',
      title: 'Data Confidence',
      provenance: ['MODEL PREDICTION'],
      body: 'Model confidence 0.83 (heuristic, not calibrated probability). Cloud cover 12.4%, masked via scene classification (SCL). Spatial resolution 10 m. Detector: unet_flood_v1, 96 tiles, 1,840 ms inference.',
    },
    {
      id: 'limitations',
      title: 'Limitations',
      provenance: ['ASSUMPTION'],
      body: 'Optical imagery — residual cloud may mask flooding. Building impact is estimated from flood coverage, not observed structural damage. Population exposure uses a sample grid. Risk weights are project-defined assumptions. This is a DEMO dataset with fictional values.',
    },
  ],
  disclaimer:
    'AI-generated analysis for decision support only. Not an authoritative emergency instruction. Verify with official emergency services and ground assessment before acting.',
}

export const PROVENANCE_META = {
  MEASURED: { color: 'text-accent2', bg: 'bg-accent2/10', border: 'border-accent2/40' },
  'MODEL PREDICTION': { color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/40' },
  DATASET: { color: 'text-low', bg: 'bg-low/10', border: 'border-low/40' },
  ASSUMPTION: { color: 'text-medium', bg: 'bg-medium/10', border: 'border-medium/40' },
  'AI-GENERATED TEXT': { color: 'text-high', bg: 'bg-high/10', border: 'border-high/40' },
}
