import React, { useState } from 'react'
import { 
  Trophy, 
  Plus, 
  Calendar, 
  Image, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  MessageCircle, 
  RotateCcw, 
  Trash2, 
  Users, 
  Sparkles,
  Search,
  ExternalLink,
  DollarSign,
  AlertCircle,
  Megaphone,
  User,
  FileText,
  X,
  Printer,
  Upload,
  Check,
  Ban,
  Edit3
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { formatRupiah, formatTanggalIndo, generateWaEvent } from '../../utils/formatters'
import EventModal from './EventModal'
import BayarEventModal from './BayarEventModal'
import UploadBuktiEventModal from './UploadBuktiEventModal'
import DetailPengumumanModal from './DetailPengumumanModal'

export default function EventsView() {
  const { 
    scopedEvents,
    events, 
    tagihanEvents, 
    warga, 
    rts,
    isRT,
    currentRT,
    isAdmin,
    isWarga,
    currentUser,
    readEventIds = [],
    markEventAsRead,
    markAllEventsAsRead,
    unreadEventsCount = 0,
    generateTagihanEventMassal, 
    batalBayarTagihanEvent, 
    deleteTagihanEvent, 
    deleteEvent,
    verifikasiBuktiTagihanEvent,
    config,
    confirmDialog,
    setSelectedTagihanKwitansi
  } = useApp()

  const activeEventsList = scopedEvents || events || []
  const [activeEventId, setActiveEventId] = useState(activeEventsList[0]?.id || '')
  const [eventModalOpen, setEventModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [bayarModalItem, setBayarModalItem] = useState(null)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [detailModalEvent, setDetailModalEvent] = useState(null)
  const [verifikasiModalItem, setVerifikasiModalItem] = useState(null)
  const [alasanTolakText, setAlasanTolakText] = useState('')
  const [zoomPosterUrl, setZoomPosterUrl] = useState(null)
  const [searchWarga, setSearchWarga] = useState('')
  const [filterStatus, setFilterStatus] = useState('Semua')

  const selectedEvent = activeEventsList.find(e => e.id === activeEventId) || activeEventsList[0]

  // Bills for selected event
  const currentEventBills = selectedEvent 
    ? tagihanEvents.filter(te => te.eventId === selectedEvent.id)
    : []

  const isPaidEvent = selectedEvent && Number(selectedEvent.nominalPerKK) > 0
  const isPersonal = selectedEvent?.targetType === 'personal' || !!selectedEvent?.targetWargaId
  const targetPersonalWarga = isPersonal ? warga.find(w => w.id === selectedEvent?.targetWargaId) : null

  // Warga logged-in personal bill for this event
  const myEventBill = isWarga && selectedEvent 
    ? tagihanEvents.find(te => te.eventId === selectedEvent.id && te.wargaId === currentUser?.resident_id)
    : null

  const paidBills = currentEventBills.filter(te => te.status === 'Lunas')
  const pendingBills = currentEventBills.filter(te => te.status === 'Menunggu Verifikasi')
  const unpaidBills = currentEventBills.filter(te => te.status !== 'Lunas')

  const totalTerkumpul = paidBills.reduce((acc, curr) => acc + curr.nominal, 0)
  const totalTarget = currentEventBills.reduce((acc, curr) => acc + curr.nominal, 0)
  const persenLunas = totalTarget > 0 ? Math.round((totalTerkumpul / totalTarget) * 100) : 0

  // Filtered bills for display in admin table
  const displayedBills = currentEventBills.filter(te => {
    const targetW = warga.find(w => w.id === te.wargaId)
    const matchSearch = !searchWarga ||
      targetW?.nama.toLowerCase().includes(searchWarga.toLowerCase()) ||
      targetW?.noRumah.toLowerCase().includes(searchWarga.toLowerCase()) ||
      targetW?.blok.toLowerCase().includes(searchWarga.toLowerCase())

    const matchStatus = filterStatus === 'Semua' ||
      (filterStatus === 'Belum Bayar' || filterStatus === 'Belum Lunas'
        ? (te.status === 'Belum Bayar' || te.status === 'Belum Lunas' || te.status === 'Ditolak' || (te.status !== 'Lunas' && te.status !== 'Menunggu Verifikasi'))
        : te.status === filterStatus)

    return matchSearch && matchStatus
  })

  const handleOpenAdd = () => {
    setEditingEvent(null)
    setEventModalOpen(true)
  }

  const handleOpenEdit = (evt) => {
    setEditingEvent(evt)
    setEventModalOpen(true)
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase tracking-wider mb-1.5 border font-mono ${
            isWarga
              ? 'bg-sky-50 text-sky-800 border-sky-200'
              : isRT 
                ? 'bg-amber-50 text-amber-800 border-amber-200' 
                : 'bg-purple-50 text-purple-800 border-purple-200'
          }`}>
            <Megaphone className="w-3.5 h-3.5 text-amber-600" />
            <span>
              {isWarga 
                ? 'Pengumuman & Surat Edaran Lingkungan' 
                : isRT 
                  ? `Pengumuman & Iuran Acara ${currentRT?.name || 'RT'}` 
                  : 'Pengumuman & Iuran Acara Lingkungan RW'}
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            {isWarga ? 'Papan Pengumuman, Surat Edaran & Lomba' : 'Kelola Pengumuman, Surat Edaran & Iuran Acara'}
          </h1>
          <p className="text-xs text-slate-500">
            {isWarga
              ? 'Informasi resmi dari pengurus RT/RW, surat edaran perorangan/umum, serta pendaftaran & pembayaran iuran lomba.'
              : 'Tulis pengumuman resmi ke seluruh warga atau khusus perorangan, lampirkan surat/poster, dan kelola iuran insidental.'}
          </p>
        </div>

        {!isWarga && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-600/20 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            {isRT ? `+ Tulis Pengumuman / Acara ${currentRT?.name || 'RT'}` : '+ Tulis Pengumuman RW / RT'}
          </button>
        )}
      </div>

      {activeEventsList.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Megaphone className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Belum Ada Pengumuman atau Acara</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isWarga 
              ? 'Saat ini belum ada pengumuman baru dari pengurus RT maupun RW untuk Anda.'
              : 'Klik tombol di atas untuk membuat pengumuman baru ke seluruh warga atau perorangan.'}
          </p>
        </div>
      ) : (
        <>
          {/* List Kegiatan Selector (Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeEventsList.map(evt => {
              const isSelected = selectedEvent?.id === evt.id
              const isUnread = isWarga && !readEventIds.includes(evt.id)
              const bills = tagihanEvents.filter(te => te.eventId === evt.id)
              const lunasCount = bills.filter(te => te.status === 'Lunas').length
              const progress = bills.length > 0 ? Math.round((lunasCount / bills.length) * 100) : 0
              const isRwEvent = evt.scope === 'rw' || !evt.rt_id
              const rtTarget = rts?.find(r => r.id === evt.rt_id)
              const isEvtPaid = Number(evt.nominalPerKK) > 0
              const isEvtPersonal = evt.targetType === 'personal' || !!evt.targetWargaId
              const targetW = isEvtPersonal ? warga.find(w => w.id === evt.targetWargaId) : null

              return (
                <div
                  key={evt.id}
                  onClick={() => {
                    setActiveEventId(evt.id)
                    if (isWarga) markEventAsRead(evt.id)
                  }}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    isSelected 
                      ? 'bg-white border-amber-500 shadow-md ring-2 ring-amber-500/20' 
                      : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div>
                    {/* Top Badges & Actions */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {/* Elegant Unread Badge for Warga */}
                        {isUnread && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            Baru
                          </span>
                        )}

                        {/* Scope Badge */}
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase font-mono border ${
                          isRwEvent 
                            ? 'bg-purple-100 text-purple-900 border-purple-200' 
                            : 'bg-emerald-100 text-emerald-900 border-emerald-200'
                        }`}>
                          {isRwEvent ? 'Tingkat RW' : `Tingkat ${rtTarget?.name || 'RT'}`}
                        </span>

                        {/* Target Badge */}
                        {isEvtPersonal ? (
                          <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-900 border border-rose-200 text-[10px] font-bold flex items-center gap-1">
                            <User className="w-2.5 h-2.5" />
                            <span>{isWarga ? 'Khusus Anda' : `Khusus: ${targetW?.nama?.split(' ')[0] || 'Warga'}`}</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold">
                            📢 Semua Warga
                          </span>
                        )}

                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                          {evt.kategori}
                        </span>
                      </div>

                      {/* Admin/RT Quick Actions on Card */}
                      {!isWarga ? (
                        <div className="flex items-center gap-1 shrink-0 bg-slate-50 border border-slate-200/80 rounded-lg p-0.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenEdit(evt)
                            }}
                            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-white rounded transition-colors"
                            title="Edit Pengumuman"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={async (e) => {
                              e.stopPropagation()
                              const ok = await confirmDialog({
                                title: 'Hapus pengumuman?',
                                message: `Ini akan menghapus "${evt.judul}".`,
                                subtext: 'Data yang berelasi dengan pengumuman ini akan dihapus.',
                                confirmText: 'Hapus'
                              })
                              if (ok) {
                                deleteEvent(evt.id)
                              }
                            }}
                            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                            title="Hapus Pengumuman Ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          {evt.posterUrl ? (
                            <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                              <Image className="w-3 h-3" /> Ada Lampiran
                            </span>
                          ) : (
                            <span className="text-slate-400">Teks Saja</span>
                          )}
                        </div>
                      )}
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-sm line-clamp-1 mb-1">
                      {evt.judul}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-2">
                      {evt.deskripsi || 'Pengumuman lingkungan warga.'}
                    </p>

                    {/* Auto-Hapus info tag if active */}
                    {evt.autoHapus && evt.expiredAt && (
                      <div className="mb-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50/80 border border-amber-200 text-[10px] font-bold text-amber-800">
                        <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>Auto-hapus: {formatTanggalIndo(evt.expiredAt, true)}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveEventId(evt.id)
                        if (isWarga) markEventAsRead(evt.id)
                        setDetailModalEvent(evt)
                      }}
                      className="w-full mb-3 py-1.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-700" />
                      <span>Baca Pengumuman Lengkap</span>
                    </button>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Jenis</span>
                        <span className={`font-bold font-mono ${isEvtPaid ? 'text-amber-800' : 'text-emerald-700'}`}>
                          {isEvtPaid ? formatRupiah(evt.nominalPerKK) : 'Gratis (Info)'}
                        </span>
                      </div>
                      {isEvtPaid && (
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block font-bold">Partisipasi</span>
                          <span className="font-bold text-emerald-700">{lunasCount}/{bills.length} KK</span>
                        </div>
                      )}
                    </div>

                    {isEvtPaid && (
                      <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div 
                          className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Selected Event Workspace */}
          {selectedEvent && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
              
              {/* Top Banner Info of Selected Event */}
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-slate-100">
                
                <div className="flex items-start gap-4">
                  {/* Poster Thumbnail */}
                  {selectedEvent.posterUrl ? (
                    <div 
                      onClick={() => setZoomPosterUrl(selectedEvent.posterUrl)}
                      className="w-24 h-28 rounded-xl overflow-hidden border border-slate-300 shrink-0 bg-slate-900 cursor-pointer group relative shadow-xs hover:shadow transition-shadow"
                      title="Klik untuk memperbesar lampiran"
                    >
                      <img src={selectedEvent.posterUrl} alt="Poster" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[11px] font-bold transition-opacity">
                        Lihat Foto
                      </div>
                    </div>
                  ) : (
                    <div className="w-24 h-28 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 text-center p-2 shrink-0">
                      <FileText className="w-6 h-6 mb-1 text-slate-300" />
                      <span className="text-[9px] font-semibold">Dokumen Teks</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase font-mono border ${
                        (selectedEvent.scope === 'rw' || !selectedEvent.rt_id)
                          ? 'bg-purple-100 text-purple-900 border-purple-200' 
                          : 'bg-emerald-100 text-emerald-900 border-emerald-200'
                      }`}>
                        {(selectedEvent.scope === 'rw' || !selectedEvent.rt_id) 
                          ? 'Penyelenggara: Pengurus RW' 
                          : `Penyelenggara: Pengurus ${rts?.find(r => r.id === selectedEvent.rt_id)?.name || 'RT'}`}
                      </span>

                      {isPersonal ? (
                        <span className="px-2.5 py-0.5 rounded-md bg-rose-100 text-rose-900 border border-rose-200 text-[10px] font-extrabold flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{isWarga ? 'Surat Khusus untuk Anda' : `Penerima: ${targetPersonalWarga?.nama || 'Warga'}`}</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-900 border border-blue-200 text-[10px] font-bold">
                          📢 Siaran Seluruh Warga
                        </span>
                      )}

                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold">
                        {selectedEvent.kategori}
                      </span>
                      <span className="text-xs text-slate-400">
                        Tanggal: <strong className="text-slate-700">{formatTanggalIndo(selectedEvent.batasTanggal)}</strong>
                      </span>
                    </div>

                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                      {selectedEvent.judul}
                    </h2>
                    
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <span>Isi Lengkap Pengumuman / Edaran:</span>
                        <button
                          type="button"
                          onClick={() => setDetailModalEvent(selectedEvent)}
                          className="text-amber-700 hover:text-amber-800 hover:underline flex items-center gap-1 font-bold"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Buka Tampilan Surat Resmi</span>
                        </button>
                      </div>
                      <div className="p-5 bg-slate-50/90 rounded-2xl border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-sans break-words select-text shadow-2xs">
                        {selectedEvent.deskripsi || 'Tidak ada catatan tambahan.'}
                      </div>
                    </div>

                    {isPaidEvent ? (
                      <div className="text-xs text-amber-900 font-bold pt-1">
                        Iuran Partisipasi: <span className="font-mono text-base text-amber-700">{formatRupiah(selectedEvent.nominalPerKK)}</span> / Kepala Keluarga
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/60 mt-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Informasi / Himbauan Resmi (Tanpa Biaya / Rp 0)</span>
                      </div>
                    )}

                    {selectedEvent.autoHapus && selectedEvent.expiredAt && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200/80 mt-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Auto-Hapus Aktif: Berakhir pada {formatTanggalIndo(selectedEvent.expiredAt, true)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Admin Actions */}
                {!isWarga && (
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {isPaidEvent && (
                      <button
                        onClick={() => generateTagihanEventMassal(selectedEvent.id)}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                      >
                        <Sparkles className="w-4 h-4" />
                        {selectedEvent.targetType === 'personal'
                          ? `Tagih ke ${targetPersonalWarga?.nama || 'Warga'}`
                          : selectedEvent.scope === 'rt' && selectedEvent.rt_id 
                            ? `Generate Tagihan ke Warga ${rts?.find(r => r.id === selectedEvent.rt_id)?.name || 'RT'}`
                            : 'Generate Tagihan ke Semua Warga RW'}
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenEdit(selectedEvent)}
                      className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                      Edit Pengumuman
                    </button>

                    <button
                      onClick={async () => {
                        const ok = await confirmDialog({
                          title: 'Hapus pengumuman?',
                          message: `Ini akan menghapus **${selectedEvent.judul}**.`,
                          subtext: 'Data yang berelasi dengan pengumuman ini akan dihapus.',
                          confirmText: 'Hapus'
                        })
                        if (ok) {
                          deleteEvent(selectedEvent.id)
                        }
                      }}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Hapus Pengumuman"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

              </div>

              {/* Resident (Warga) View for Paid Events */}
              {isWarga && isPaidEvent && (
                <div className="p-6 bg-amber-50/70 rounded-3xl border border-amber-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/80 pb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Status Pembayaran Anda</span>
                      <h4 className="text-base font-extrabold text-amber-950">Iuran Kegiatan {selectedEvent.judul}</h4>
                      <p className="text-xs text-amber-800">Nominal: <strong className="font-mono text-sm">{formatRupiah(selectedEvent.nominalPerKK)}</strong></p>
                    </div>

                    <div>
                      {myEventBill?.status === 'Lunas' ? (
                        <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>LUNAS ({formatTanggalIndo(myEventBill.tanggalBayar)})</span>
                        </div>
                      ) : myEventBill?.status === 'Menunggu Verifikasi' ? (
                        <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold shadow-xs">
                          <Clock className="w-4 h-4 animate-spin" />
                          <span>MENUNGGU VERIFIKASI PENGURUS</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold shadow-xs">
                          <Clock className="w-4 h-4" />
                          <span>BELUM DIBAYAR</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {myEventBill?.alasanTolak && myEventBill?.status === 'Belum Lunas' && (
                    <div className="p-3 bg-rose-100/80 border border-rose-300 rounded-xl text-xs text-rose-900">
                      <strong className="block mb-0.5">⚠️ Bukti transfer sebelumnya ditolak:</strong>
                      <span>{myEventBill.alasanTolak}</span>
                    </div>
                  )}

                  {myEventBill?.status === 'Menunggu Verifikasi' && (
                    <div className="p-3.5 bg-white/80 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
                      <p className="font-bold flex items-center gap-1.5 text-amber-800">
                        <Clock className="w-4 h-4 text-amber-600" />
                        Bukti Transfer Sudah Anda Kirim
                      </p>
                      <p className="text-[11px] text-amber-700">
                        Pengurus RT/RW sedang memverifikasi pembayaran Anda. Kwitansi resmi akan otomatis terbit begitu diverifikasi.
                      </p>
                      {myEventBill.buktiTransferUrl && (
                        <button
                          onClick={() => setZoomPosterUrl(myEventBill.buktiTransferUrl)}
                          className="text-[11px] font-bold text-emerald-700 hover:underline pt-1 block"
                        >
                          🔍 Lihat Foto Bukti yang Dikirim
                        </button>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <p className="text-xs text-slate-600">
                      Rekening Resmi Kas RT: <strong className="font-mono text-slate-900">{config?.rekeningBank || 'BCA 8730192831'}</strong>
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      {myEventBill?.status === 'Lunas' ? (
                        <button
                          onClick={() => setSelectedTagihanKwitansi({
                            id: myEventBill.id,
                            wargaId: currentUser?.resident_id,
                            bulan: new Date().getMonth() + 1,
                            tahun: new Date().getFullYear(),
                            total: myEventBill.nominal,
                            rincian: [{ nama: `Iuran ${selectedEvent.judul}`, nominal: myEventBill.nominal }],
                            status: 'Lunas',
                            tanggalBayar: myEventBill.tanggalBayar,
                            metodeBayar: myEventBill.metodeBayar,
                            noKwitansi: myEventBill.noKwitansi || `KW-EVT-${myEventBill.id}`
                          })}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
                        >
                          <Printer className="w-4 h-4" />
                          <span>Cetak Kwitansi Kegiatan</span>
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => setUploadModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                          >
                            <Upload className="w-4 h-4" />
                            <span>{myEventBill?.status === 'Menunggu Verifikasi' ? 'Unggah Ulang Bukti' : 'Bayar / Upload Bukti Transfer'}</span>
                          </button>

                          <a
                            href={generateWaEvent(targetPersonalWarga || warga.find(w => w.id === currentUser?.resident_id), selectedEvent, myEventBill || { nominal: selectedEvent.nominalPerKK }, config?.namaLingkungan, config?.rekeningBank)}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
                          >
                            <MessageCircle className="w-4 h-4 text-emerald-400" />
                            <span>Konfirmasi WhatsApp</span>
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Admin/RT View: Financial Summary & Participation Table for Paid Events */}
              {!isWarga && isPaidEvent && (
                <>
                  {/* Progress Bar & Ringkasan Dana */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Potensi Dana</span>
                      <div className="text-lg font-extrabold text-slate-900 font-mono mt-0.5">{formatRupiah(totalTarget)}</div>
                      <p className="text-[11px] text-slate-500">{currentEventBills.length} Warga ditagih</p>
                    </div>

                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Terkumpul (Lunas)</span>
                      <div className="text-lg font-extrabold text-emerald-800 font-mono mt-0.5">{formatRupiah(totalTerkumpul)}</div>
                      <p className="text-[11px] text-emerald-700">{paidBills.length} Warga sudah bayar ({persenLunas}%)</p>
                    </div>

                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                      <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Belum Terkumpul</span>
                      <div className="text-lg font-extrabold text-amber-800 font-mono mt-0.5">{formatRupiah(totalTarget - totalTerkumpul)}</div>
                      <p className="text-[11px] text-amber-700">{unpaidBills.length} Warga belum bayar ({pendingBills.length} butuh cek)</p>
                    </div>
                  </div>

                  {/* Filter Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="relative flex-1 min-w-[220px]">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Cari nama warga / rumah..."
                        value={searchWarga}
                        onChange={(e) => setSearchWarga(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl">
                      {[
                        { label: 'Semua', count: currentEventBills.length },
                        { label: 'Belum Bayar', count: unpaidBills.filter(b => b.status !== 'Menunggu Verifikasi').length, badgeBg: 'bg-rose-100 text-rose-800' },
                        { label: 'Menunggu Verifikasi', count: pendingBills.length, badgeBg: 'bg-amber-100 text-amber-900' },
                        { label: 'Lunas', count: paidBills.length, badgeBg: 'bg-emerald-100 text-emerald-800' }
                      ].map(tab => {
                        const isSelected = filterStatus === tab.label || (filterStatus === 'Belum Lunas' && tab.label === 'Belum Bayar')
                        return (
                          <button
                            key={tab.label}
                            onClick={() => setFilterStatus(tab.label)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                              isSelected ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <span>{tab.label}</span>
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${tab.badgeBg || 'bg-slate-200 text-slate-700'}`}>
                              {tab.count}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Participation Table */}
                  <div className="border border-slate-200/80 rounded-xl overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                          <th className="py-2.5 px-4 text-left font-bold">Warga & Unit</th>
                          <th className="py-2.5 px-4 text-right font-bold">Nominal</th>
                          <th className="py-2.5 px-4 text-left font-bold">Status</th>
                          <th className="py-2.5 px-4 text-left font-bold">Waktu & Metode</th>
                          <th className="py-2.5 px-4 text-right font-bold">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {displayedBills.length > 0 ? (
                          displayedBills.map(te => {
                            const targetW = warga.find(w => w.id === te.wargaId)
                            const isLunas = te.status === 'Lunas'
                            const isPending = te.status === 'Menunggu Verifikasi'
                            const waLink = generateWaEvent(targetW, selectedEvent, te, `${config?.namaLingkungan} ${config?.rtRw}`, config?.rekeningBank)

                            return (
                              <tr key={te.id} className="hover:bg-slate-50/70 transition-colors">
                                <td className="py-3 px-4">
                                  <div className="font-bold text-slate-800">{targetW?.nama || 'Warga'}</div>
                                  <div className="text-[11px] text-slate-400">
                                    Blok {targetW?.blok} No. {targetW?.noRumah}
                                  </div>
                                </td>

                                <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                                  {formatRupiah(te.nominal)}
                                </td>

                                <td className="py-3 px-4">
                                  {isLunas ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      Lunas
                                    </span>
                                  ) : isPending ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                                      <Clock className="w-3 h-3 text-amber-600" />
                                      Cek Bukti Transfer
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                                      <Clock className="w-3 h-3 text-rose-600" />
                                      Belum Bayar
                                    </span>
                                  )}
                                </td>

                                <td className="py-3 px-4 text-slate-600">
                                  {isLunas ? (
                                    <div>
                                      <div>{formatTanggalIndo(te.tanggalBayar)}</div>
                                      <span className="text-[10px] text-slate-400">via {te.metodeBayar || 'Tunai'} • {te.noKwitansi}</span>
                                    </div>
                                  ) : isPending ? (
                                    <div>
                                      <div className="font-semibold text-amber-800">Bukti diunggah warga</div>
                                      {te.buktiTransferUrl && (
                                        <button
                                          onClick={() => setZoomPosterUrl(te.buktiTransferUrl)}
                                          className="text-[10px] font-bold text-emerald-700 hover:underline"
                                        >
                                          🔍 Lihat Bukti
                                        </button>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 italic text-[11px]">Menunggu pembayaran</span>
                                  )}
                                </td>

                                <td className="py-3 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {isPending ? (
                                      <button
                                        onClick={() => {
                                          setVerifikasiModalItem(te)
                                          setAlasanTolakText('')
                                        }}
                                        className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                        Verifikasi
                                      </button>
                                    ) : !isLunas ? (
                                      <>
                                        <button
                                          onClick={() => setBayarModalItem(te)}
                                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all"
                                        >
                                          Bayar
                                        </button>
                                        {waLink && (
                                          <a
                                            href={waLink}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                            title="Kirim Pesan WA ke Warga"
                                          >
                                            <MessageCircle className="w-4 h-4" />
                                          </a>
                                        )}
                                      </>
                                    ) : (
                                      <>
                                        {waLink && (
                                          <a
                                            href={waLink}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                            title="Kirim Bukti Lunas WA"
                                          >
                                            <MessageCircle className="w-4 h-4" />
                                          </a>
                                        )}
                                        <button
                                          onClick={async () => {
                                            const ok = await confirmDialog({
                                              title: 'Batalkan status lunas kegiatan?',
                                              message: `Ini akan membatalkan status lunas kegiatan untuk **${targetW?.nama || 'Warga'}**.`,
                                              subtext: 'Catatan kas terkait akan otomatis disesuaikan.',
                                              confirmText: 'Batalkan Lunas'
                                            })
                                            if (ok) {
                                              batalBayarTagihanEvent(te.id)
                                            }
                                          }}
                                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                          title="Batal Lunas"
                                        >
                                          <RotateCcw className="w-3.5 h-3.5" />
                                        </button>
                                      </>
                                    )}

                                    <button
                                      onClick={async () => {
                                        const ok = await confirmDialog({
                                          title: 'Hapus tagihan kegiatan?',
                                          message: `Ini akan menghapus tagihan kegiatan untuk **${targetW?.nama || 'Warga'}**.`,
                                          subtext: 'Data tagihan yang dihapus tidak dapat dipulihkan kembali.',
                                          confirmText: 'Hapus'
                                        })
                                        if (ok) {
                                          deleteTagihanEvent(te.id)
                                        }
                                      }}
                                      className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                      title="Hapus"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>

                              </tr>
                            )
                          })
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-400">
                              {currentEventBills.length === 0 ? (
                                <div className="space-y-2">
                                  <p className="font-semibold text-slate-600">Belum ada warga yang didaftarkan pada kegiatan ini.</p>
                                  <button
                                    onClick={() => generateTagihanEventMassal(selectedEvent.id)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                                  >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Generate Tagihan Sekarang
                                  </button>
                                </div>
                              ) : (
                                <p>Tidak ada data warga yang cocok dengan filter.</p>
                              )}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

            </div>
          )}
        </>
      )}

      {/* Modal Zoom Poster / Bukti Transfer */}
      {zoomPosterUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
            <div className="flex justify-between items-center p-3 border-b border-slate-800 bg-slate-950/60">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Image className="w-4 h-4 text-amber-500" />
                Lampiran / Foto Bukti Pembayaran
              </span>
              <button
                onClick={() => setZoomPosterUrl(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center max-h-[80vh] overflow-auto">
              <img src={zoomPosterUrl} alt="Poster Zoom" className="max-h-[75vh] w-auto object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}

      {/* Modal Verifikasi Bukti Acara (Admin/RT) */}
      {verifikasiModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden border border-slate-200 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-amber-50/60">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <Check className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Verifikasi Iuran Kegiatan</h3>
                  <p className="text-xs text-slate-500">Periksa bukti transfer sebelum menyatakan Lunas</p>
                </div>
              </div>
              <button
                onClick={() => setVerifikasiModalItem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Warga:</span>
                  <span className="font-bold text-slate-800">
                    {warga.find(w => w.id === verifikasiModalItem.wargaId)?.nama}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kegiatan:</span>
                  <span className="font-bold text-slate-900">{selectedEvent?.judul}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nominal:</span>
                  <span className="font-bold font-mono text-emerald-800 text-sm">
                    {formatRupiah(verifikasiModalItem.nominal)}
                  </span>
                </div>
                {verifikasiModalItem.catatanWarga && (
                  <div className="pt-2 border-t border-slate-200 text-slate-600">
                    <span className="font-bold">Catatan Warga: </span>
                    {verifikasiModalItem.catatanWarga}
                  </div>
                )}
              </div>

              {verifikasiModalItem.buktiTransferUrl ? (
                <div 
                  onClick={() => setZoomPosterUrl(verifikasiModalItem.buktiTransferUrl)}
                  className="rounded-2xl overflow-hidden border border-slate-300 max-h-56 bg-slate-900 flex items-center justify-center cursor-pointer relative group"
                >
                  <img 
                    src={verifikasiModalItem.buktiTransferUrl} 
                    alt="Bukti Transfer" 
                    className="max-h-56 w-full object-contain"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                    Klik untuk Perbesar
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 text-center">
                  Tidak ada lampiran foto bukti.
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alasan Penolakan (Jika ditolak):
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Bukti buram / transfer belum masuk ke rekening"
                  value={alasanTolakText}
                  onChange={(e) => setAlasanTolakText(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    verifikasiBuktiTagihanEvent(verifikasiModalItem.id, 'tolak', { alasanTolak: alasanTolakText })
                    setVerifikasiModalItem(null)
                  }}
                  className="flex items-center gap-1 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors"
                >
                  <Ban className="w-4 h-4" />
                  Tolak Pembayaran
                </button>
                <button
                  type="button"
                  onClick={() => {
                    verifikasiBuktiTagihanEvent(verifikasiModalItem.id, 'terima')
                    setVerifikasiModalItem(null)
                  }}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
                >
                  <Check className="w-4 h-4" />
                  Terima & Set Lunas
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Event Add/Edit Modal (Admin/RT only) */}
      {!isWarga && (
        <EventModal
          isOpen={eventModalOpen}
          onClose={() => setEventModalOpen(false)}
          editEvent={editingEvent}
        />
      )}

      {/* Resident Upload Bukti Event Modal */}
      <UploadBuktiEventModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        event={selectedEvent}
        tagihanItem={myEventBill}
        wargaItem={warga.find(w => w.id === currentUser?.resident_id)}
      />

      {/* Modal Detail Lengkap Pengumuman / Surat Edaran */}
      {detailModalEvent && (
        <DetailPengumumanModal
          isOpen={true}
          onClose={() => setDetailModalEvent(null)}
          event={detailModalEvent}
          onOpenBayar={(evt) => {
            setActiveEventId(evt.id)
            setUploadModalOpen(true)
          }}
        />
      )}

      {/* Bayar Modal Manual (Admin/RT) */}
      <BayarEventModal
        isOpen={!!bayarModalItem}
        onClose={() => setBayarModalItem(null)}
        targetItem={bayarModalItem}
        event={selectedEvent}
      />

    </div>
  )
}
