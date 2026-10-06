import React, { useState } from 'react'
import { 
  MessageSquareText, 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  Trash2, 
  Edit3, 
  Image as ImageIcon,
  ExternalLink,
  ShieldCheck,
  User,
  X
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { formatTanggalIndo } from '../../utils/formatters'
import PengaduanModal from './PengaduanModal'
import TanggapiPengaduanModal from './TanggapiPengaduanModal'

export default function PengaduanView() {
  const { 
    pengaduan, 
    scopedPengaduan, 
    deletePengaduan, 
    warga, 
    currentUser, 
    isWarga, 
    isRT, 
    isAdmin, 
    isAdminLoggedIn,
    confirmDialog 
  } = useApp()

  const [modalOpen, setModalOpen] = useState(false)
  const [tanggapiModalItem, setTanggapiModalItem] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('Semua')
  const [filterKategori, setFilterKategori] = useState('Semua')
  const [zoomImage, setZoomImage] = useState(null)

  const activeList = scopedPengaduan || pengaduan || []

  // Stats
  const totalLaporan = activeList.length
  const menungguCount = activeList.filter(p => p.status === 'Menunggu Tindak Lanjut').length
  const prosesCount = activeList.filter(p => p.status === 'Sedang Ditangani').length
  const selesaiCount = activeList.filter(p => p.status === 'Selesai').length

  // Filtered List
  const filteredList = activeList.filter(item => {
    const targetWarga = warga.find(w => w.id === item.wargaId)
    const matchSearch = item.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.lokasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (targetWarga?.nama && targetWarga.nama.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchStatus = filterStatus === 'Semua' || item.status === filterStatus
    const matchKategori = filterKategori === 'Semua' || item.kategori === filterKategori

    return matchSearch && matchStatus && matchKategori
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Selesai':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Selesai Ditangani
          </span>
        )
      case 'Sedang Ditangani':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Sedang Ditangani
          </span>
        )
      case 'Ditolak':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            Tidak Dapat Diproses
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Menunggu Tindak Lanjut
          </span>
        )
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <MessageSquareText className="w-5 h-5" />
            </div>
            <span>Layanan Pengaduan & Keluhan Warga</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Wadah aspirasi, lapor kerusakan fasilitas lingkungan, kebersihan, dan ketertiban lingkungan
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Buat Laporan Baru</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Aduan Masuk</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalLaporan}</div>
          <span className="text-[11px] text-slate-500">Laporan warga</span>
        </div>

        <div className="bg-amber-50/60 p-4 sm:p-5 rounded-2xl border border-amber-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Menunggu Tindak Lanjut</span>
          <div className="text-2xl font-black text-amber-900 mt-1">{menungguCount}</div>
          <span className="text-[11px] text-amber-700">Perlu respon RT</span>
        </div>

        <div className="bg-blue-50/60 p-4 sm:p-5 rounded-2xl border border-blue-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">Sedang Ditangani</span>
          <div className="text-2xl font-black text-blue-900 mt-1">{prosesCount}</div>
          <span className="text-[11px] text-blue-700">Dalam pengerjaan</span>
        </div>

        <div className="bg-emerald-50/60 p-4 sm:p-5 rounded-2xl border border-emerald-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Selesai Ditangani</span>
          <div className="text-2xl font-black text-emerald-900 mt-1">{selesaiCount}</div>
          <span className="text-[11px] text-emerald-700">Tuntas terselesaikan</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari judul aduan, lokasi, atau nama pelapor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium transition-all"
          />
        </div>

        {/* Filter Status */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold hidden sm:inline">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="Semua">Semua Status</option>
            <option value="Menunggu Tindak Lanjut">Menunggu Tindak Lanjut</option>
            <option value="Sedang Ditangani">Sedang Ditangani</option>
            <option value="Selesai">Selesai</option>
            <option value="Ditolak">Ditolak</option>
          </select>
        </div>

        {/* Filter Kategori */}
        <select
          value={filterKategori}
          onChange={(e) => setFilterKategori(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
        >
          <option value="Semua">Semua Kategori</option>
          <option value="Fasilitas & Lampu Jalan">Fasilitas & Lampu Jalan</option>
          <option value="Kebersihan & Sampah">Kebersihan & Sampah</option>
          <option value="Saluran Air & Drainase">Saluran Air & Drainase</option>
          <option value="Keamanan & Ketertiban">Keamanan & Ketertiban</option>
          <option value="Kebisingan & Kenyamanan">Kebisingan & Kenyamanan</option>
        </select>
      </div>

      {/* List of Complaints */}
      <div className="space-y-4">
        {filteredList.length > 0 ? (
          filteredList.map((item) => {
            const pelaporWarga = warga.find(w => w.id === item.wargaId)
            const isMine = currentUser?.resident_id === item.wargaId

            return (
              <div 
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all space-y-4"
              >
                {/* Top Row: Category, Date, Status, Actions */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                      {item.kategori}
                    </span>
                    {isMine && (
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">
                        Laporan Anda
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {formatTanggalIndo(item.tanggal)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(item.status)}

                    {/* Admin/RT Action: Tanggapi */}
                    {isAdminLoggedIn && (
                      <button
                        onClick={() => setTanggapiModalItem(item)}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-200/80 transition-colors flex items-center gap-1"
                        title="Tanggapi atau ubah status laporan"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Tanggapi</span>
                      </button>
                    )}

                    {/* Delete button (Admin or Owner) */}
                    {(isAdminLoggedIn || isMine) && (
                      <button
                        onClick={async () => {
                          const ok = await confirmDialog({
                            title: 'Hapus Laporan Aduan?',
                            message: `Hapus aduan "${item.judul}"?`,
                            subtext: 'Tindakan ini tidak dapat dibatalkan.',
                            confirmText: 'Hapus'
                          })
                          if (ok) deletePengaduan(item.id)
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hapus Laporan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Content: Title, Pelapor & Location, Description */}
                <div className="space-y-2">
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                    {item.judul}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1 text-slate-700 font-semibold">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {pelaporWarga?.nama || 'Warga Lingkungan'} (Blok {pelaporWarga?.blok || 'A'}-{pelaporWarga?.noRumah || '01'})
                    </span>
                    <span className="flex items-center gap-1 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      Lokasi: {item.lokasi}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                    {item.deskripsi}
                  </p>

                  {/* Foto Lampiran */}
                  {item.fotoUrl && (
                    <div className="pt-2">
                      <button
                        onClick={() => setZoomImage(item.fotoUrl)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                      >
                        <ImageIcon className="w-4 h-4 text-emerald-600" />
                        <span>Lihat Foto Lampiran Bukti</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Response / Tanggapan Pengurus Box */}
                {item.tanggapan ? (
                  <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between text-indigo-900 font-bold">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-indigo-600" />
                        Tanggapan & Tindak Lanjut Pengurus RT:
                      </span>
                      {item.tanggalTanggapan && (
                        <span className="text-[10px] text-indigo-700 font-normal">
                          {formatTanggalIndo(item.tanggalTanggapan)}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-700 font-medium leading-relaxed pl-5">
                      {item.tanggapan}
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs text-slate-400 italic">
                    Belum ada tanggapan pengurus. Laporan sedang dalam antrean tindak lanjut.
                  </div>
                )}

              </div>
            )
          })
        ) : (
          <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <MessageSquareText className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-sm">Tidak ada laporan pengaduan ditemukan</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Semua laporan warga yang masuk akan tercatat di sini beserta progres penanganannya.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Laporan Baru Sekarang</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal Buat Laporan */}
      <PengaduanModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      {/* Modal Tanggapi untuk Pengurus RT / Admin */}
      <TanggapiPengaduanModal
        pengaduanItem={tanggapiModalItem}
        isOpen={!!tanggapiModalItem}
        onClose={() => setTanggapiModalItem(null)}
      />

      {/* Modal Zoom Foto */}
      {zoomImage && (
        <div 
          onClick={() => setZoomImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in cursor-zoom-out"
        >
          <div className="relative max-w-2xl w-full bg-slate-900 rounded-3xl p-3 shadow-2xl overflow-hidden">
            <button
              onClick={() => setZoomImage(null)}
              className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black text-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={zoomImage} 
              alt="Lampiran Pengaduan" 
              className="w-full max-h-[80vh] object-contain rounded-2xl mx-auto" 
            />
          </div>
        </div>
      )}

    </div>
  )
}
