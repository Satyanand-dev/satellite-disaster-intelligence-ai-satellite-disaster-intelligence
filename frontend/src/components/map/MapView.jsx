import clsx from 'clsx'
import L from 'leaflet'
import { Fragment, useEffect, useRef } from 'react'
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { MOCK_GEO, RISK_ZONES } from '../../utils/mockData.js'

const DARK_TILES = {
  url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
}

const IMAGERY_TILES = {
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  attribution: 'Imagery &copy; Esri, Maxar, Earthstar Geographics',
}

const BAND_COLORS = { CRITICAL: '#EF4444', HIGH: '#F97316', MEDIUM: '#EAB308', LOW: '#22C55E' }

const FLOOD_STYLE = { color: '#38BDF8', weight: 2, fillColor: '#38BDF8', fillOpacity: 0.22 }
const CHANGE_STYLE = { color: '#2DD4BF', weight: 3, dashArray: '8 5', fillColor: '#2DD4BF', fillOpacity: 0.06 }

/**
 * GeoJSON overlay backed by plain Leaflet (style/handlers are read through a
 * ref so parent re-renders never tear down and rebuild the layer).
 */
function GeoJsonLayer({ data, style, onFeatureClick, layerKey }) {
  const map = useMap()
  const cb = useRef({ style, onFeatureClick })

  useEffect(() => {
    cb.current = { style, onFeatureClick }
  })

  useEffect(() => {
    const layer = L.geoJSON(data, {
      style: (feature) => cb.current.style?.(feature) ?? FLOOD_STYLE,
      onEachFeature: (feature, lyr) => {
        if (cb.current.onFeatureClick) {
          lyr.on('click', () => cb.current.onFeatureClick(feature, lyr))
        }
      },
    })
    layer.addTo(map)
    return () => layer.remove()
  }, [map, data, layerKey])

  return null
}

function toLatLng(feature) {
  const [lng, lat] = feature.geometry.coordinates
  return [lat, lng]
}

/**
 * Real Leaflet map (F5). Dark CARTO basemap by default, Esri imagery when the
 * `satellite` layer is active, and mock vector overlays for the demo AOI.
 */
export default function MapView({
  layers = ['base'],
  center = MOCK_GEO.center,
  zoom = MOCK_GEO.zoom,
  height = 'h-[60vh]',
  label,
  className,
  onZoneClick,
  selectedZoneId,
  scrollWheelZoom = true,
  zoomControl = true,
}) {
  const has = (id) => layers.includes(id)
  const imagery = has('satellite')
  const tiles = imagery ? IMAGERY_TILES : DARK_TILES

  const zoneStyle = (feature) => {
    const zone = RISK_ZONES.find((z) => z.id === feature.properties.id)
    const color = BAND_COLORS[zone?.band] ?? '#38BDF8'
    const selected = zone && selectedZoneId === zone.id
    return {
      color,
      weight: selected ? 4 : 2,
      fillColor: color,
      fillOpacity: selected ? 0.4 : 0.18,
    }
  }

  return (
    <div className={clsx('relative overflow-hidden rounded-lg border border-border bg-[#0d1526]', height, className)}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={scrollWheelZoom}
        zoomControl={zoomControl}
        className="h-full w-full"
      >
        <TileLayer
          key={imagery ? 'imagery' : 'dark'}
          url={tiles.url}
          attribution={tiles.attribution}
        />

        {has('flood') && <GeoJsonLayer data={MOCK_GEO.flood} layerKey="flood" />}
        {has('change') && <GeoJsonLayer data={MOCK_GEO.flood} style={() => CHANGE_STYLE} layerKey="change" />}
        {has('risk') && (
          <GeoJsonLayer
            data={MOCK_GEO.zones}
            style={zoneStyle}
            onFeatureClick={onZoneClick ? (feature) => onZoneClick(feature.properties.id) : undefined}
            layerKey={`risk-${selectedZoneId ?? ''}`}
          />
        )}

        {has('roads') &&
          MOCK_GEO.roads.features.map((f) => (
            <Polyline
              key={f.properties.id}
              positions={f.geometry.coordinates.map(([lng, lat]) => [lat, lng])}
              pathOptions={{ color: '#E6EDF7', weight: 2, opacity: 0.55 }}
            />
          ))}

        {has('buildings') &&
          MOCK_GEO.buildings.map((f) => (
            <CircleMarker
              key={f.properties.id}
              center={toLatLng(f)}
              radius={4}
              pathOptions={{ color: '#8FA3C0', weight: 1, fillColor: '#8FA3C0', fillOpacity: 0.9 }}
            />
          ))}

        {has('critical') &&
          MOCK_GEO.critical.map((f) => (
            <Fragment key={f.properties.id}>
              <CircleMarker
                center={toLatLng(f)}
                radius={7}
                pathOptions={{ color: '#2DD4BF', weight: 2.5, fillColor: '#0B1220', fillOpacity: 1 }}
              >
                <Tooltip direction="top" offset={[0, -8]}>
                  {f.properties.name}
                </Tooltip>
              </CircleMarker>
              <CircleMarker
                center={toLatLng(f)}
                radius={2.2}
                pathOptions={{ color: '#2DD4BF', weight: 0, fillColor: '#2DD4BF', fillOpacity: 1 }}
                interactive={false}
              />
            </Fragment>
          ))}
      </MapContainer>

      {/* DEMO badge — mock overlays are never presented as observations */}
      <span className="pointer-events-none absolute left-3 top-3 z-[500] rounded border border-medium/50 bg-medium/15 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-medium">
        Demo data
      </span>

      {label && (
        <span className="pointer-events-none absolute right-3 top-3 z-[500] rounded border border-border bg-panel/80 px-2 py-0.5 text-[11px] text-muted backdrop-blur">
          {label}
        </span>
      )}
    </div>
  )
}
