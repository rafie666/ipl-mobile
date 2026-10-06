import React, { useState, useEffect, useRef } from 'react'
import L from 'leaflet'
import { Search, MapPin, Navigation, Compass, Loader2, X, Check } from 'lucide-react'

// Custom Google Maps-style pin icon
const createPinIcon = () => {
  return L.divIcon({
    className: 'custom-google-maps-pin',
    html: `
      <div style="
        position: relative;
        width: 36px;
        height: 48px;
        cursor: grab;
        filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
        transition: transform 0.15s ease;
      " class="hover:scale-110 active:scale-95 active:cursor-grabbing">
        <svg viewBox="0 0 384 512" width="36" height="48" fill="#ea4335">
          <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0z"/>
          <circle cx="192" cy="192" r="80" fill="#ffffff"/>
          <circle cx="192" cy="192" r="50" fill="#ea4335"/>
        </svg>
        <div style="
          position: absolute;
          bottom: -4px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(15,23,42,0.85);
          color: white;
          font-size: 9px;
          font-weight: 700;
          white-space: nowrap;
          padding: 1px 5px;
          border-radius: 4px;
          pointer-events: none;
        ">Geser Pin</div>
      </div>
    `,
    iconSize: [36, 48],
    iconAnchor: [18, 48],
    popupAnchor: [0, -48]
  })
}

export default function CoordinatePickerMap({
  lat = -6.59715,
  lng = 106.76415,
  onChange,
  height = '340px'
}) {
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [locatingGps, setLocatingGps] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const currentLat = Number(lat) || -6.59715
  const currentLng = Number(lng) || 106.76415

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [currentLat, currentLng],
        zoom: 18,
        zoomControl: true,
        scrollWheelZoom: true
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 20,
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map)

      const pinIcon = createPinIcon()
      const marker = L.marker([currentLat, currentLng], {
        icon: pinIcon,
        draggable: true,
        autoPan: true
      }).addTo(map)

      // Drag event - update coordinates
      marker.on('dragend', (e) => {
        const pos = e.target.getLatLng()
        const newLat = Number(pos.lat.toFixed(6))
        const newLng = Number(pos.lng.toFixed(6))
        if (onChange) {
          onChange({ lat: newLat, lng: newLng })
        }
      })

      // Click event on map - move marker to click point
      map.on('click', (e) => {
        const { lat: clickLat, lng: clickLng } = e.latlng
        const newLat = Number(clickLat.toFixed(6))
        const newLng = Number(clickLng.toFixed(6))
        marker.setLatLng([newLat, newLng])
        if (onChange) {
          onChange({ lat: newLat, lng: newLng })
        }
      })

      markerRef.current = marker
      mapInstanceRef.current = map

      // Invalidate size to avoid rendering issues inside modals/tabs
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize()
        }
      }, 200)
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markerRef.current = null
      }
    }
  }, [])

  // Sync marker position if lat/lng props change externally
  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current) {
      const currentMarkerPos = markerRef.current.getLatLng()
      if (
        Math.abs(currentMarkerPos.lat - currentLat) > 0.00001 ||
        Math.abs(currentMarkerPos.lng - currentLng) > 0.00001
      ) {
        markerRef.current.setLatLng([currentLat, currentLng])
        mapInstanceRef.current.setView([currentLat, currentLng], mapInstanceRef.current.getZoom())
      }
    }
  }, [currentLat, currentLng])

  // Handle Search Location / Coordinates
  const handleSearch = async (e) => {
    if (e) e.preventDefault()
    const query = searchQuery.trim()
    if (!query) return

    setErrorMsg('')
    setShowResults(false)

    // Check if query is raw coordinates (e.g. "-6.59715, 106.76415" or "-6.59715 106.76415")
    const coordRegex = /^\s*(-?\d+(\.\d+)?)\s*[, ]\s*(-?\d+(\.\d+)?)\s*$/
    const match = query.match(coordRegex)
    if (match) {
      const parsedLat = Number(Number(match[1]).toFixed(6))
      const parsedLng = Number(Number(match[3]).toFixed(6))

      if (parsedLat >= -90 && parsedLat <= 90 && parsedLng >= -180 && parsedLng <= 180) {
        if (markerRef.current) markerRef.current.setLatLng([parsedLat, parsedLng])
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([parsedLat, parsedLng], 18, { duration: 1 })
        }
        if (onChange) onChange({ lat: parsedLat, lng: parsedLng })
        setSearchQuery(`${parsedLat}, ${parsedLng}`)
        return
      }
    }

    // Otherwise, Geocode search via Nominatim
    setIsSearching(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=id`
      )
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        setSearchResults(data)
        setShowResults(true)
      } else {
        // Fallback without countrycodes constraint
        const resGlobal = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
        )
        const dataGlobal = await resGlobal.json()
        if (Array.isArray(dataGlobal) && dataGlobal.length > 0) {
          setSearchResults(dataGlobal)
          setShowResults(true)
        } else {
          setErrorMsg('Lokasi tidak ditemukan. Coba ketik nama jalan, kelurahan, atau koordinat angka.')
        }
      }
    } catch (err) {
      console.error('Geocoding error:', err)
      setErrorMsg('Gagal mencari lokasi online. Pastikan terhubung internet atau masukkan koordinat langsung.')
    } finally {
      setIsSearching(false)
    }
  }

  // Pick search result
  const handleSelectResult = (item) => {
    const targetLat = Number(Number(item.lat).toFixed(6))
    const targetLng = Number(Number(item.lon).toFixed(6))

    if (markerRef.current) markerRef.current.setLatLng([targetLat, targetLng])
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([targetLat, targetLng], 18, { duration: 1.2 })
    }
    if (onChange) onChange({ lat: targetLat, lng: targetLng })

    setSearchQuery(item.display_name.split(',')[0] || item.display_name)
    setShowResults(false)
  }

  // Handle GPS location
  const handleGetGPS = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Browser Anda tidak mendukung geolokasi GPS.')
      return
    }

    setLocatingGps(true)
    setErrorMsg('')

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const gpsLat = Number(pos.coords.latitude.toFixed(6))
        const gpsLng = Number(pos.coords.longitude.toFixed(6))

        if (markerRef.current) markerRef.current.setLatLng([gpsLat, gpsLng])
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([gpsLat, gpsLng], 19, { duration: 1.2 })
        }
        if (onChange) onChange({ lat: gpsLat, lng: gpsLng })

        setSearchQuery(`${gpsLat}, ${gpsLng}`)
        setLocatingGps(false)
      },
      (err) => {
        console.warn('Geolocation error:', err)
        setErrorMsg('Gagal mengambil lokasi GPS. Pastikan izin lokasi diizinkan di browser.')
        setLocatingGps(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // Reset to default housing center
  const handleResetDefault = () => {
    const defLat = -6.59715
    const defLng = 106.76415
    if (markerRef.current) markerRef.current.setLatLng([defLat, defLng])
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([defLat, defLng], 18, { duration: 1 })
    }
    if (onChange) onChange({ lat: defLat, lng: defLng })
    setSearchQuery('')
    setShowResults(false)
  }

  return (
    <div className="space-y-3">
      {/* Search Bar - Google Maps Style */}
      <div className="relative z-30">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                if (showResults) setShowResults(false)
              }}
              placeholder="Cari lokasi, jalan, perumahan, atau kordinat (-6.597, 106.764)..."
              className="w-full pl-9 pr-8 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setShowResults(false)
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer"
          >
            {isSearching ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Search className="w-3.5 h-3.5" />
            )}
            <span>Cari</span>
          </button>

          <button
            type="button"
            onClick={handleGetGPS}
            disabled={locatingGps}
            title="Gunakan Lokasi GPS Saya"
            className="p-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
          >
            {locatingGps ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
          </button>
        </form>

        {/* Dropdown Hasil Pencarian */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden divide-y divide-slate-100 max-h-56 overflow-y-auto">
            {searchResults.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectResult(item)}
                className="w-full text-left px-3.5 py-2.5 hover:bg-emerald-50 text-xs flex items-start gap-2.5 transition-colors group cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-800 truncate">
                    {item.display_name.split(',')[0]}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {item.display_name}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-center justify-between">
          <span>{errorMsg}</span>
          <button
            type="button"
            onClick={() => setErrorMsg('')}
            className="text-amber-700 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
        {/* Floating Instruction Badge */}
        <div className="absolute top-2.5 right-2.5 z-20 bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-xl text-[10px] font-semibold flex items-center gap-1.5 shadow-md pointer-events-none">
          <MapPin className="w-3 h-3 text-red-400" />
          <span>Geser pin atau klik peta untuk ubah titik</span>
        </div>

        {/* Leaflet DOM Node */}
        <div
          ref={mapContainerRef}
          style={{ height, width: '100%', background: '#f8fafc' }}
          className="z-10"
        />

        {/* Floating Quick Action: Reset to housing */}
        <div className="absolute bottom-2.5 left-2.5 z-20">
          <button
            type="button"
            onClick={handleResetDefault}
            className="px-2.5 py-1 bg-white/95 hover:bg-white text-slate-700 hover:text-emerald-700 text-[10px] font-bold rounded-lg shadow-md border border-slate-200 flex items-center gap-1 backdrop-blur-xs transition-colors cursor-pointer"
          >
            <Compass className="w-3 h-3 text-emerald-600" />
            <span>Preset Perumahan Ciomas</span>
          </button>
        </div>
      </div>

      {/* Current Position Display */}
      <div className="flex items-center justify-between text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono text-slate-700">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Lat: <strong className="text-slate-900">{currentLat.toFixed(6)}</strong></span>
          <span>•</span>
          <span>Lng: <strong className="text-slate-900">{currentLng.toFixed(6)}</strong></span>
        </div>
        <span className="text-[10px] text-slate-400 font-sans">
          📍 Pin siap digeser
        </span>
      </div>
    </div>
  )
}
