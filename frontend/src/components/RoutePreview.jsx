import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Loader2 } from 'lucide-react'

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const pickupIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const dropoffIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'hue-rotate-[200deg]',
})

const DHAKA_CENTER = [23.8103, 90.4125]

async function geocodeAddress(address) {
  if (!address) return null
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=bd&limit=1`,
      { headers: { 'Accept-Language': 'en' } }
    )
    if (!res.ok) return null
    const data = await res.json()
    if (data.length > 0) return [parseFloat(data[0].lat), parseFloat(data[0].lon)]
    return null
  } catch {
    return null
  }
}

function FitBounds({ points }) {
  const map = useMap()
  const fitted = useRef(false)
  useEffect(() => {
    if (points.length >= 2 && !fitted.current) {
      fitted.current = true
      const bounds = L.latLngBounds(points)
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
    } else if (points.length === 1 && !fitted.current) {
      fitted.current = true
      map.setView(points[0], 14)
    }
  }, [points, map])
  return null
}

export default function RoutePreview({ pickupAddress, dropoffAddress }) {
  const [pickup, setPickup] = useState(null)
  const [dropoff, setDropoff] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      geocodeAddress(pickupAddress),
      geocodeAddress(dropoffAddress),
    ]).then(([p, d]) => {
      if (cancelled) return
      setPickup(p)
      setDropoff(d)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [pickupAddress, dropoffAddress])

  const points = [pickup, dropoff].filter(Boolean)
  const hasRoute = points.length >= 2

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 rounded-lg border border-border bg-muted/20">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading route preview...</span>
      </div>
    )
  }

  if (points.length === 0) return null

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="relative h-48">
        <MapContainer
          center={points[0] || DHAKA_CENTER}
          zoom={12}
          className="h-full w-full z-0"
          zoomControl={false}
          dragging={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          touchZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds points={points} />
          {pickup && <Marker position={pickup} icon={pickupIcon} />}
          {dropoff && <Marker position={dropoff} icon={dropoffIcon} />}
          {hasRoute && (
            <Polyline
              positions={[pickup, dropoff]}
              pathOptions={{ color: 'hsl(var(--primary))', weight: 3, dashArray: '8 8', opacity: 0.7 }}
            />
          )}
        </MapContainer>
      </div>
      <div className="flex items-center justify-between px-3 py-2 bg-muted/30 text-xs text-muted-foreground">
        <span>Pickup</span>
        <span className="text-center">- - -</span>
        <span>Drop-off</span>
      </div>
    </div>
  )
}
