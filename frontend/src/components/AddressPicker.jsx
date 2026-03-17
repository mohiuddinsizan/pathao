import { useState, useRef, useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Search, Navigation, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// Fix default marker icon (leaflet + bundlers issue)
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Custom marker icon matching the app's primary color
const primaryIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const DHAKA_CENTER = [23.8103, 90.4125]

// Reverse geocode a lat/lng to an address string using Nominatim
async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18`,
      { headers: { 'Accept-Language': 'en' } }
    )
    if (!res.ok) return ''
    const data = await res.json()
    return data.display_name || ''
  } catch {
    return ''
  }
}

// Search for places using Nominatim
async function searchPlaces(query, signal) {
  if (!query || query.length < 3) return []
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=bd&limit=5&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' }, signal }
    )
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

// Component that handles map click events
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng)
    },
  })
  return null
}

// Component to recenter the map
function RecenterMap({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.flyTo(center, 16, { duration: 0.8 })
    }
  }, [center, map])
  return null
}

export default function AddressPicker({ value, onChange, label }) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState(null)
  const [flyTarget, setFlyTarget] = useState(null)
  const [address, setAddress] = useState(value || '')
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [geocoding, setGeocoding] = useState(false)
  const [locating, setLocating] = useState(false)
  const searchTimeout = useRef(null)
  const abortRef = useRef(null)

  // Debounced search
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 3) {
      setResults([])
      return
    }
    clearTimeout(searchTimeout.current)
    if (abortRef.current) abortRef.current.abort()

    searchTimeout.current = setTimeout(async () => {
      setSearching(true)
      const controller = new AbortController()
      abortRef.current = controller
      const data = await searchPlaces(searchQuery, controller.signal)
      setResults(data)
      setSearching(false)
    }, 400)

    return () => {
      clearTimeout(searchTimeout.current)
      if (abortRef.current) abortRef.current.abort()
    }
  }, [searchQuery])

  const handleMapClick = useCallback(async (latlng) => {
    setPosition([latlng.lat, latlng.lng])
    setGeocoding(true)
    const addr = await reverseGeocode(latlng.lat, latlng.lng)
    setAddress(addr)
    setGeocoding(false)
    setResults([])
    setSearchQuery('')
  }, [])

  const handleSelectResult = useCallback((result) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    setPosition([lat, lng])
    setFlyTarget([lat, lng])
    setAddress(result.display_name)
    setResults([])
    setSearchQuery('')
  }, [])

  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setPosition([lat, lng])
        setFlyTarget([lat, lng])
        setGeocoding(true)
        const addr = await reverseGeocode(lat, lng)
        setAddress(addr)
        setGeocoding(false)
        setLocating(false)
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  const handleConfirm = useCallback(() => {
    onChange(address)
    setOpen(false)
  }, [address, onChange])

  const handleOpen = useCallback(() => {
    setAddress(value || '')
    setSearchQuery('')
    setResults([])
    setOpen(true)
  }, [value])

  return (
    <>
      {/* Text input with map button on the left */}
      <div className="relative flex items-center">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleOpen}
          className="absolute left-0 h-10 shrink-0 cursor-pointer rounded-r-none hover:bg-primary/10 z-10 gap-1 px-2.5"
          aria-label={`Pick ${label?.toLowerCase() || 'address'} on map`}
        >
          <MapPin className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-primary">View Map</span>
        </Button>
        <Input
          className="h-10 pl-28 w-full"
          placeholder={`Type or pick ${label?.toLowerCase() || 'address'} on map`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-4 pt-4 pb-2">
            <DialogTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-5 w-5 text-primary" />
              {label || 'Select Address'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Pick an address from the map, search results, or current location and confirm your selection.
            </DialogDescription>
          </DialogHeader>

          {/* Search bar */}
          <div className="px-4 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="h-10 pl-9 pr-8"
                aria-label="Search for a place"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>

            {/* Search results dropdown */}
            {results.length > 0 && (
              <div className="mt-1 rounded-lg border border-border bg-card shadow-lg max-h-48 overflow-y-auto">
                {results.map((r) => (
                  <button
                    key={r.place_id}
                    type="button"
                    className="flex items-start gap-2.5 w-full px-3 py-2.5 text-left hover:bg-accent/50 transition-colors cursor-pointer border-b border-border last:border-0"
                    onClick={() => handleSelectResult(r)}
                  >
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                    <span className="text-sm leading-snug">{r.display_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Map */}
          <div className="relative h-80 sm:h-96 w-full">
            <MapContainer
              center={position || DHAKA_CENTER}
              zoom={position ? 16 : 12}
              className="h-full w-full z-0"
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapClickHandler onMapClick={handleMapClick} />
              {flyTarget && <RecenterMap center={flyTarget} />}
              {position && <Marker position={position} icon={primaryIcon} />}
            </MapContainer>

            {/* Current location button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleUseCurrentLocation}
              disabled={locating}
              className="absolute bottom-4 right-4 z-[1000] rounded-full shadow-lg cursor-pointer"
            >
              {locating ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <Navigation className="h-4 w-4 text-primary" />
              )}
              <span className="hidden sm:inline">Current location</span>
            </Button>

            {/* Crosshair overlay when no pin */}
            {!position && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[500]">
                <p className="bg-card/90 backdrop-blur-sm text-sm text-muted-foreground px-3 py-1.5 rounded-full border border-border shadow">
                  Tap on the map to place a pin
                </p>
              </div>
            )}
          </div>

          {/* Selected address + confirm */}
          <div className="px-4 py-3 border-t border-border space-y-3">
            {geocoding ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Getting address...
              </div>
            ) : address ? (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                <p className="text-sm leading-snug">{address}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No address selected</p>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirm}
                disabled={!address || geocoding}
              >
                Confirm Location
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
