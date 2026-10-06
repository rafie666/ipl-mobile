import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { 
  MapPin, 
  Layers, 
  Search, 
  Filter, 
  Home, 
  Users, 
  CheckCircle2, 
  Clock, 
  Phone, 
  Eye, 
  Compass, 
  Navigation,
  Sparkles,
  Info,
  Maximize2,
  Loader2,
  X
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { formatRupiah, NAMA_BULAN } from '../../utils/formatters'
import WargaDetailModal from './WargaDetailModal'
import KeluargaModal from './KeluargaModal'

export default function WargaMapView() {
  const { 
    warga, 
    scopedWarga, 
    rts, 
    tagihan, 
    scopedTagihan, 
    config, 
    isRT, 
    currentRT,
    updateLokasiRumah,
    showToast 
  } = useApp()

  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersLayerRef = useRef(null)

  const [colorMode, setColorMode] = useState('iuran') // 'iuran' | 'rt' | 'huni'
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBlok, setFilterBlok] = useState('Semua')
  const [filterRt, setFilterRt] = useState('Semua')
  const [filterStatusIuran, setFilterStatusIuran] = useState('Semua')
  const [selectedWargaDetail, setSelectedWargaDetail] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedWargaToMove, setSelectedWargaToMove] = useState(null)

  // State pencarian kordinat / lokasi ala Google Maps
  const [mapSearchQuery, setMapSearchQuery] = useState('')
  const [isMapSearching, setIsMapSearching] = useState(false)
  const [mapSearchResults, setMapSearchResults] = useState([])
  const [showMapSearchResults, setShowMapSearchResults] = useState(false)
  const searchMarkerRef = useRef(null)

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const activeWargaList = scopedWarga || warga || []
  const activeTagihanList = scopedTagihan || tagihan || []

  // Get status iuran bulan ini untuk warga
  const getStatusIuran = (wargaId) => {
    const bill = activeTagihanList.find(t => t.wargaId === wargaId && t.bulan === currentMonth && t.tahun === currentYear)
    if (!bill) return { status: 'Belum Terbit', bill: null }
    return { status: bill.status, bill }
  }

  // Filtered warga list
  const filteredWarga = activeWargaList.filter(w => {
    const term = searchTerm.toLowerCase()
    const matchSearch = 
      (w.nama && w.nama.toLowerCase().includes(term)) ||
      (w.noRumah && w.noRumah.toLowerCase().includes(term)) ||
      (w.kodeUnik && String(w.kodeUnik).includes(term)) ||
      (w.blok && w.blok.toLowerCase().includes(term))

    const matchBlok = filterBlok === 'Semua' || w.blok === filterBlok
    const matchRt = filterRt === 'Semua' || w.rt_id === filterRt
    
    const { status } = getStatusIuran(w.id)
    const matchIuran = filterStatusIuran === 'Semua' || status === filterStatusIuran

    return matchSearch && matchBlok && matchRt && matchIuran
  })

  // Color generator for marker pins
  const getMarkerColor = (w) => {
    if (colorMode === 'iuran') {
      const { status } = getStatusIuran(w.id)
      if (status === 'Lunas') return { bg: '#10b981', text: '#ffffff', label: 'Lunas', ring: '#059669' } // Emerald
      if (status === 'Menunggu Verifikasi') return { bg: '#f59e0b', text: '#ffffff', label: 'Verifikasi', ring: '#d97706' } // Amber
      return { bg: '#f43f5e', text: '#ffffff', label: 'Belum Bayar', ring: '#e11d48' } // Rose
    }

    if (colorMode === 'rt') {
      if (w.rt_id === 'rt-2') return { bg: '#6366f1', text: '#ffffff', label: 'RT 02', ring: '#4f46e5' } // Indigo
      if (w.rt_id === 'rt-3') return { bg: '#d97706', text: '#ffffff', label: 'RT 03', ring: '#b45309' } // Amber
      return { bg: '#059669', text: '#ffffff', label: 'RT 01', ring: '#047857' } // Emerald
    }

    // colorMode === 'huni'
    if (w.statusHuni === 'Tetap') return { bg: '#0d9488', text: '#ffffff', label: 'Tetap', ring: '#0f766e' } // Teal
    if (w.statusHuni === 'Kontrak') return { bg: '#0284c7', text: '#ffffff', label: 'Kontrak', ring: '#0369a1' } // Sky
    return { bg: '#64748b', text: '#ffffff', label: 'Kosong', ring: '#475569' } // Slate
  }

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return

    // Base default center: Pagelaran / Ciomas Bogor (-6.5975, 106.7645)
    const defaultCenter = [-6.5975, 106.7645]

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 18,
        zoomControl: true,
        scrollWheelZoom: true
      })

      // OpenStreetMap Tile Layer with clean imagery
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 20,
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map)

      const markersGroup = L.featureGroup().addTo(map)
      markersLayerRef.current = markersGroup
      mapInstanceRef.current = map
    }

    return () => {
      // Keep map reference across renders
    }
  }, [])

  // Handle map click saat mode pindah kordinat aktif
  useEffect(() => {
    if (!mapInstanceRef.current) return
    const map = mapInstanceRef.current

    const handleMapClick = (e) => {
      if (isEditMode && selectedWargaToMove) {
        const { lat, lng } = e.latlng
        updateLokasiRumah(selectedWargaToMove.id, { lat, lng })
        showToast(`Lokasi rumah ${selectedWargaToMove.nama} (${selectedWargaToMove.blok}/${selectedWargaToMove.noRumah}) dipindahkan ke (${lat.toFixed(5)}, ${lng.toFixed(5)})`, 'success')
        setSelectedWargaToMove(null)
        setIsEditMode(false)
      }
    }

    map.on('click', handleMapClick)
    return () => {
      map.off('click', handleMapClick)
    }
  }, [isEditMode, selectedWargaToMove])

  // Render Markers when filteredWarga, colorMode, or isEditMode changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return

    const markersGroup = markersLayerRef.current
    markersGroup.clearLayers()

    const bounds = []

    filteredWarga.forEach(w => {
      const lat = Number(w.lat) || -6.5975
      const lng = Number(w.lng) || 106.7645
      bounds.push([lat, lng])

      const color = getMarkerColor(w)
      const { status } = getStatusIuran(w.id)
      const targetRtObj = rts?.find(r => r.id === w.rt_id)

      // Custom HTML Pin Marker
      const isSelectedToMove = selectedWargaToMove?.id === w.id
      const iconHtml = `
        <div style="
          position: relative;
          width: ${isSelectedToMove ? '46px' : '38px'};
          height: ${isSelectedToMove ? '46px' : '38px'};
          background: ${isSelectedToMove ? '#f59e0b' : color.bg};
          border: ${isSelectedToMove ? '3px solid #ffffff' : '2.5px solid #ffffff'};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: ${isSelectedToMove ? '0 0 0 6px rgba(245, 158, 11, 0.45), 0 8px 20px rgba(0,0,0,0.45)' : '0 4px 10px rgba(0,0,0,0.35)'};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: ${isSelectedToMove ? 'grab' : 'pointer'};
          transition: transform 0.2s;
        " class="${isSelectedToMove ? 'animate-bounce' : 'hover:scale-110'}">
          <span style="
            transform: rotate(45deg);
            color: ${isSelectedToMove ? '#0f172a' : color.text};
            font-size: ${isSelectedToMove ? '11px' : '10px'};
            font-weight: 800;
            font-family: monospace;
            text-align: center;
            line-height: 1;
          ">
            ${w.blok}-${w.noRumah}
          </span>
        </div>
      `

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: iconHtml,
        iconSize: isSelectedToMove ? [46, 46] : [38, 38],
        iconAnchor: isSelectedToMove ? [23, 46] : [19, 38],
        popupAnchor: [0, -36]
      })

      const marker = L.marker([lat, lng], { 
        icon: customIcon,
        draggable: isSelectedToMove 
      })

      // Jika dalam mode geser, event dragend langsung update kordinat
      if (isSelectedToMove) {
        marker.on('dragend', (e) => {
          const { lat: newLat, lng: newLng } = e.target.getLatLng()
          updateLokasiRumah(w.id, { lat: newLat, lng: newLng })
          showToast(`Lokasi rumah ${w.nama} (${w.blok}/${w.noRumah}) berhasil digeser ke (${newLat.toFixed(5)}, ${newLng.toFixed(5)})`, 'success')
          setSelectedWargaToMove(null)
          setIsEditMode(false)
        })
      }

      // Create Popup Content
      const popupDiv = document.createElement('div')
      popupDiv.className = 'p-1 text-slate-800'
      popupDiv.innerHTML = `
        <div style="min-width: 220px; font-family: system-ui, sans-serif;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
            <span style="background: #ecfdf5; color: #047857; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 800; border: 1px solid #a7f3d0; font-family: monospace;">
              #${w.kodeUnik || '---'}
            </span>
            <span style="background: ${status === 'Lunas' ? '#10b981' : '#f43f5e'}; color: white; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 800;">
              ${status === 'Lunas' ? 'IPL LUNAS' : 'BELUM BAYAR'}
            </span>
          </div>

          <h4 style="font-weight: 800; font-size: 14px; margin: 0 0 2px 0; color: #0f172a;">
            ${w.nama}
          </h4>

          <p style="font-size: 11px; color: #64748b; margin: 0 0 8px 0;">
            📍 Blok ${w.blok} No. ${w.noRumah} • ${targetRtObj?.name || 'RT 01'}
          </p>

          <div style="background: #f8fafc; padding: 8px; border-radius: 10px; font-size: 11px; margin-bottom: 10px; border: 1px solid #e2e8f0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span style="color: #64748b;">Status Huni:</span>
              <strong style="color: #1e293b;">${w.statusHuni} (${w.statusKepemilikan || 'Milik Sendiri'})</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span style="color: #64748b;">Total Keluarga:</span>
              <strong style="color: #1e293b;">${w.anggotaKeluarga?.length || w.jumlahJiwa || 1} Jiwa</strong>
            </div>
            ${w.noHp ? `
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #64748b;">Kontak WA:</span>
                <strong style="color: #047857; font-family: monospace;">${w.noHp}</strong>
              </div>
            ` : ''}
          </div>

          <div style="display: flex; gap: 6px;">
            <button id="btn-detail-${w.id}" style="
              flex: 1;
              background: #059669;
              color: white;
              border: none;
              padding: 6px 10px;
              border-radius: 8px;
              font-size: 11px;
              font-weight: 700;
              cursor: pointer;
            ">
              👁️ Profil
            </button>
            <button id="btn-move-${w.id}" style="
              flex: 1;
              background: #fef3c7;
              color: #b45309;
              border: 1px solid #fde68a;
              padding: 6px 8px;
              border-radius: 8px;
              font-size: 11px;
              font-weight: 700;
              cursor: pointer;
            ">
              📍 Geser Pin
            </button>
            ${w.noHp ? `
              <a href="https://wa.me/${w.noHp.replace(/\D/g, '').replace(/^0/, '62')}" target="_blank" style="
                background: #f1f5f9;
                color: #047857;
                border: 1px solid #cbd5e1;
                padding: 6px 10px;
                border-radius: 8px;
                font-size: 11px;
                font-weight: 700;
                text-decoration: none;
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                💬 WA
              </a>
            ` : ''}
          </div>
        </div>
      `

      marker.bindPopup(popupDiv)

      marker.on('popupopen', () => {
        const detailBtn = document.getElementById(`btn-detail-${w.id}`)
        if (detailBtn) {
          detailBtn.onclick = () => setSelectedWargaDetail(w)
        }
        const moveBtn = document.getElementById(`btn-move-${w.id}`)
        if (moveBtn) {
          moveBtn.onclick = () => {
            setSelectedWargaToMove(w)
            setIsEditMode(true)
            showToast(`Mode geser pin aktif. Tarik pin logo rumah ${w.nama} ke lokasi baru atau klik di peta.`, 'info')
            marker.closePopup()
          }
        }
      })

      markersGroup.addLayer(marker)
    })

    // Render RT Pos / Balai Warga Markers
    ;(rts || []).forEach((rt) => {
      if (filterRt !== 'Semua' && rt.id !== filterRt) return
      const rtLat = Number(rt.lat) || -6.59715
      const rtLng = Number(rt.lng) || 106.76415
      bounds.push([rtLat, rtLng])

      const rtIconHtml = `
        <div style="
          position: relative;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #4f46e5;
          border: 2.5px solid #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 10px rgba(79, 70, 229, 0.4);
          transform: rotate(-45deg);
          cursor: pointer;
        " class="hover:scale-110">
          <span style="
            transform: rotate(45deg);
            color: #ffffff;
            font-size: 10px;
            font-weight: 800;
            font-family: monospace;
            text-align: center;
            line-height: 1;
          ">
            🏛️ ${rt.name || 'RT'}
          </span>
        </div>
      `

      const rtIcon = L.divIcon({
        className: 'custom-leaflet-rt-marker',
        html: rtIconHtml,
        iconSize: [44, 44],
        iconAnchor: [22, 44],
        popupAnchor: [0, -40]
      })

      const rtMarker = L.marker([rtLat, rtLng], { icon: rtIcon })
      rtMarker.bindPopup(`
        <div style="min-width: 220px; font-family: system-ui, sans-serif; padding: 4px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
            <span style="background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 800; border: 1px solid #c7d2fe;">
              POS / BALAI WARGA
            </span>
          </div>
          <h4 style="font-weight: 800; font-size: 14px; margin: 0 0 4px 0; color: #1e1b4b;">
            🏛️ ${rt.name}
          </h4>
          <p style="font-size: 11px; color: #4338ca; margin: 0 0 8px 0; font-weight: 600;">
            📍 ${rt.lokasi || rt.keterangan || 'Posko Lingkungan RT'}
          </p>
          <div style="background: #f8fafc; padding: 8px; border-radius: 8px; font-size: 11px; border: 1px solid #e2e8f0; margin-bottom: 8px;">
            <div style="margin-bottom: 3px;"><span style="color:#64748b;">Ketua:</span> <strong>${rt.ketua || '-'}</strong></div>
            <div style="margin-bottom: 3px;"><span style="color:#64748b;">Bendahara:</span> <strong>${rt.bendahara || '-'}</strong></div>
            ${rt.kontak ? `<div><span style="color:#64748b;">WA:</span> <strong style="color:#047857; font-family:monospace;">${rt.kontak}</strong></div>` : ''}
          </div>
          ${rt.kontak ? `
            <a href="https://wa.me/${rt.kontak.replace(/\D/g, '').replace(/^0/, '62')}" target="_blank" style="
              display: block;
              text-align: center;
              background: #059669;
              color: white;
              padding: 6px 10px;
              border-radius: 8px;
              font-size: 11px;
              font-weight: 700;
              text-decoration: none;
            ">
              💬 Hubungi Pengurus ${rt.name}
            </a>
          ` : ''}
        </div>
      `)

      markersGroup.addLayer(rtMarker)
    })

    if (bounds.length > 0 && mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 18 })
    }
  }, [filteredWarga, rts, colorMode, selectedWargaToMove, isEditMode, filterRt])

  // Center map to specific resident
  const handleFocusResident = (w) => {
    if (!mapInstanceRef.current) return
    const lat = Number(w.lat) || -6.5975
    const lng = Number(w.lng) || 106.7645
    mapInstanceRef.current.flyTo([lat, lng], 19, { duration: 1 })
  }

  // Handle Search Koordinat / Alamat ala Google Maps
  const handleMapSearch = async (e) => {
    if (e) e.preventDefault()
    const query = mapSearchQuery.trim()
    if (!query || !mapInstanceRef.current) return

    setShowMapSearchResults(false)

    // Cek format kordinat langsung (-6.59715, 106.76415)
    const coordRegex = /^\s*(-?\d+(\.\d+)?)\s*[, ]\s*(-?\d+(\.\d+)?)\s*$/
    const match = query.match(coordRegex)
    if (match) {
      const parsedLat = Number(match[1])
      const parsedLng = Number(match[3])
      if (parsedLat >= -90 && parsedLat <= 90 && parsedLng >= -180 && parsedLng <= 180) {
        flyToSearchedLocation(parsedLat, parsedLng, `Koordinat (${parsedLat}, ${parsedLng})`)
        return
      }
    }

    // Cek kecocokan nama warga atau blok
    const matchingWarga = activeWargaList.find(w => 
      w.nama.toLowerCase().includes(query.toLowerCase()) || 
      `${w.blok}-${w.noRumah}`.toLowerCase().includes(query.toLowerCase()) ||
      (w.kodeUnik && w.kodeUnik.toLowerCase().includes(query.toLowerCase()))
    )
    if (matchingWarga) {
      handleFocusResident(matchingWarga)
      showToast(`Menampilkan lokasi ${matchingWarga.nama} (Blok ${matchingWarga.blok}/${matchingWarga.noRumah})`, 'info')
      return
    }

    // Geocoding Nominatim OpenStreetMap
    setIsMapSearching(true)
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=id`)
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        setMapSearchResults(data)
        setShowMapSearchResults(true)
      } else {
        showToast('Lokasi tidak ditemukan. Coba ketik koordinat (-6.59, 106.76) atau nama jalan.', 'warning')
      }
    } catch (err) {
      console.error(err)
      showToast('Gagal mencari lokasi online.', 'error')
    } finally {
      setIsMapSearching(false)
    }
  }

  const flyToSearchedLocation = (targetLat, targetLng, label) => {
    if (!mapInstanceRef.current) return
    mapInstanceRef.current.flyTo([targetLat, targetLng], 19, { duration: 1.2 })

    if (searchMarkerRef.current) {
      searchMarkerRef.current.remove()
    }

    const searchIcon = L.divIcon({
      className: 'search-pin',
      html: `
        <div style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
          <svg viewBox="0 0 384 512" width="32" height="44" fill="#ea4335">
            <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0z"/>
            <circle cx="192" cy="192" r="70" fill="#ffffff"/>
            <circle cx="192" cy="192" r="45" fill="#ea4335"/>
          </svg>
        </div>
      `,
      iconSize: [32, 44],
      iconAnchor: [16, 44],
      popupAnchor: [0, -40]
    })

    const sMarker = L.marker([targetLat, targetLng], { icon: searchIcon }).addTo(mapInstanceRef.current)
    sMarker.bindPopup(`<b>📍 Lokasi Dicari:</b><br/>${label}`).openPopup()
    searchMarkerRef.current = sMarker
    setShowMapSearchResults(false)
  }

  // Summary counts
  const totalLunas = activeWargaList.filter(w => getStatusIuran(w.id).status === 'Lunas').length
  const totalBelum = activeWargaList.length - totalLunas
  const totalJiwa = activeWargaList.reduce((acc, curr) => acc + (curr.anggotaKeluarga?.length || curr.jumlahJiwa || 1), 0)

  return (
    <div className="space-y-5 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Compass className="w-6 h-6 text-emerald-600" />
            Pemetaan GIS & Titik Koordinat Rumah Warga
          </h1>
          <p className="text-xs text-slate-500">
            Peta digital persebaran rumah warga, status pembayaran iuran lingkungan, dan master wilayah RT/RW
          </p>
        </div>

        {/* Color Mode Selector */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200/80 shadow-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setColorMode('iuran')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              colorMode === 'iuran'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🎨 Status Iuran
          </button>
          <button
            type="button"
            onClick={() => setColorMode('rt')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              colorMode === 'rt'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🏘️ Wilayah RT
          </button>
          <button
            type="button"
            onClick={() => setColorMode('huni')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              colorMode === 'huni'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🏠 Status Hunian
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Rumah Terpetakan</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900 font-mono">{activeWargaList.length}</span>
            <span className="text-xs text-slate-500 font-medium">Unit Rumah</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-emerald-200/80 bg-emerald-50/30 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Iuran Bulan Ini Lunas</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-emerald-700 font-mono">{totalLunas}</span>
            <span className="text-xs text-emerald-600 font-bold">{Math.round((totalLunas / (activeWargaList.length || 1)) * 100)}%</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-rose-200/80 bg-rose-50/30 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">Belum Bayar IPL</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-rose-700 font-mono">{totalBelum}</span>
            <span className="text-xs text-rose-600 font-medium">Rumah</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Populasi Jiwa Warga</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900 font-mono">{totalJiwa}</span>
            <span className="text-xs text-slate-500 font-medium">Orang</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama warga, nomor rumah (A-01), atau kode unik..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

        {/* Filter Blok */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-bold">Blok:</span>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            {['Semua', 'A', 'B', 'C', 'D'].map(b => (
              <button
                key={b}
                onClick={() => setFilterBlok(b)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  filterBlok === b ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Status Iuran */}
        <select
          value={filterStatusIuran}
          onChange={(e) => setFilterStatusIuran(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="Semua">Semua Status Iuran</option>
          <option value="Lunas">🟢 Lunas</option>
          <option value="Belum Lunas">🔴 Belum Bayar</option>
          <option value="Menunggu Verifikasi">🟡 Menunggu Verifikasi</option>
        </select>
      </div>

      {/* Map + Sidebar Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
        
        {/* Leaflet Map View */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden relative">
          
          {/* Map Top Indicator Badge */}
          <div className="absolute top-4 left-4 z-40 bg-slate-900/85 backdrop-blur-md text-white px-3.5 py-2 rounded-2xl shadow-lg border border-slate-700/60 flex items-center gap-2.5 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold">
              {colorMode === 'iuran' ? 'Mode: Status Iuran IPL' : colorMode === 'rt' ? 'Mode: Rukun Tetangga (RT)' : 'Mode: Status Hunian'}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-emerald-300 font-mono font-bold">{filteredWarga.length} Marker Aktif</span>
          </div>

          {/* Google Maps Search Bar on Map */}
          <div className="absolute top-4 right-4 z-40 w-64 sm:w-72">
            <form onSubmit={handleMapSearch} className="relative flex items-center shadow-lg">
              <input
                type="text"
                value={mapSearchQuery}
                onChange={(e) => {
                  setMapSearchQuery(e.target.value)
                  if (showMapSearchResults) setShowMapSearchResults(false)
                }}
                placeholder="Cari kordinat / alamat / warga..."
                className="w-full pl-8 pr-16 py-2 bg-white/95 backdrop-blur-md border border-slate-300/80 rounded-2xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-md"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              {mapSearchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setMapSearchQuery('')
                    setShowMapSearchResults(false)
                  }}
                  className="absolute right-12 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
              <button
                type="submit"
                disabled={isMapSearching}
                className="absolute right-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold shadow-xs cursor-pointer flex items-center gap-1"
              >
                {isMapSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Cari'}
              </button>
            </form>

            {/* Results dropdown */}
            {showMapSearchResults && mapSearchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden divide-y divide-slate-100 max-h-48 overflow-y-auto z-50 text-xs">
                {mapSearchResults.map((res, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => flyToSearchedLocation(Number(res.lat), Number(res.lon), res.display_name)}
                    className="w-full text-left px-3 py-2 hover:bg-emerald-50 flex items-start gap-2 transition-colors cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-800 truncate text-[11px]">{res.display_name.split(',')[0]}</div>
                      <div className="text-[10px] text-slate-500 truncate">{res.display_name}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Edit Mode Instruction Banner */}
          {isEditMode && selectedWargaToMove && (
            <div className="absolute top-16 left-4 right-4 z-40 bg-amber-500 text-slate-950 p-3 rounded-2xl shadow-xl flex items-center justify-between gap-3 text-xs font-bold animate-pulse">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-slate-900" />
                <span>Geser (drag) pin logo rumah kuning {selectedWargaToMove.nama} ({selectedWargaToMove.blok}/{selectedWargaToMove.noRumah}) atau klik lokasi baru di peta!</span>
              </div>
              <button
                onClick={() => {
                  setIsEditMode(false)
                  setSelectedWargaToMove(null)
                }}
                className="px-2.5 py-1 bg-slate-950 text-white rounded-lg text-[11px] cursor-pointer"
              >
                Batal
              </button>
            </div>
          )}

          {/* Leaflet Container */}
          <div 
            ref={mapContainerRef} 
            className="w-full h-[540px] z-10"
            style={{ background: '#f1f5f9' }}
          />

          {/* Map Legend Footer */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-600">
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-bold text-slate-700">Legenda:</span>
              {colorMode === 'iuran' ? (
                <>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Lunas
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500"></span> Belum Bayar
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span> Verifikasi
                  </span>
                </>
              ) : colorMode === 'rt' ? (
                <>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-600"></span> RT 01
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-indigo-600"></span> RT 02
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-amber-600"></span> RT 03
                  </span>
                </>
              ) : (
                <>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-teal-600"></span> Warga Tetap
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-sky-600"></span> Kontrak / Kost
                  </span>
                </>
              )}
            </div>

            <span className="text-slate-400">Klik marker untuk melihat ringkasan keluarga & kwitansi</span>
          </div>

        </div>

        {/* Sidebar List of Houses */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-4 space-y-3 max-h-[590px] flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-extrabold text-slate-800 text-xs">
              Daftar Rumah ({filteredWarga.length})
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Klik untuk zoom</span>
          </div>

          <div className="space-y-2 overflow-y-auto flex-1 pr-1 text-xs">
            {filteredWarga.map(w => {
              const color = getMarkerColor(w)
              const { status } = getStatusIuran(w.id)

              return (
                <div
                  key={w.id}
                  onClick={() => handleFocusResident(w)}
                  className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/70 transition-all cursor-pointer space-y-1.5 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                      <span 
                        className="w-2.5 h-2.5 rounded-full shrink-0" 
                        style={{ background: color.bg }}
                      />
                      Blok {w.blok}-{w.noRumah}
                    </span>
                    <span className="font-mono font-bold text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                      #{w.kodeUnik || '---'}
                    </span>
                  </div>

                  <div className="font-bold text-slate-800 text-xs truncate">
                    {w.nama}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <span>{w.anggotaKeluarga?.length || w.jumlahJiwa || 1} Jiwa</span>
                    <span className={`font-bold ${status === 'Lunas' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {status === 'Lunas' ? 'Lunas' : 'Belum Bayar'}
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedWargaDetail(w)
                      }}
                      className="px-2 py-1 bg-white hover:bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-lg border border-slate-200 cursor-pointer"
                    >
                      Detail
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedWargaToMove(w)
                        setIsEditMode(true)
                        showToast(`Mode pindah koordinat aktif. Silakan klik lokasi baru di peta untuk ${w.nama}.`, 'info')
                      }}
                      className="px-2 py-1 bg-white hover:bg-amber-50 text-amber-700 font-bold text-[10px] rounded-lg border border-slate-200 cursor-pointer"
                    >
                      Pindah Pin
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>

      {/* Modal Detail Profil Lengkap Warga */}
      <WargaDetailModal
        isOpen={!!selectedWargaDetail}
        onClose={() => setSelectedWargaDetail(null)}
        warga={selectedWargaDetail}
        rts={rts}
        config={config}
      />

    </div>
  )
}
