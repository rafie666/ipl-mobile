import React, { useState } from 'react'
import { 
  Home, 
  User, 
  CheckCircle2, 
  Clock, 
  Printer, 
  MessageCircle, 
  Building2, 
  Calendar, 
  CreditCard, 
  Phone, 
  Trophy, 
  Image, 
  X, 
  Upload,
  AlertCircle,
  FileText,
  ShieldCheck,
  MessageSquareText,
  BarChart3,
  PhoneCall,
  ArrowRight,
  Users,
  MapPin
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { formatRupiah, formatTanggalIndo, NAMA_BULAN } from '../../utils/formatters'
import UploadBuktiModal from '../portal/UploadBuktiModal'
import DetailPengumumanModal from '../events/DetailPengumumanModal'
import UploadBuktiEventModal from '../events/UploadBuktiEventModal'
import KeluargaModal from '../warga/KeluargaModal'

export default function WargaDashboardView() {
  const { 
    currentUser, 
    currentWarga, 
    currentRT, 
    rts, 
    warga, 
    tagihan, 
    events, 
    scopedEvents,
    tagihanEvents, 
    config, 
    readEventIds = [],
    markEventAsRead,
    setSelectedTagihanKwitansi,
    setActiveTab,
    setProfileModalOpen
  } = useApp()

  const [zoomPoster, setZoomPoster] = useState(null)
  const [uploadModalTagihan, setUploadModalTagihan] = useState(null)
  const [detailModalEvent, setDetailModalEvent] = useState(null)
  const [uploadModalEvent, setUploadModalEvent] = useState(null)
  const [keluargaModalOpen, setKeluargaModalOpen] = useState(false)

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  // Ambil objek profil warga yang sedang login (terisolasi hanya milik resident_id)
  const activeWarga = currentWarga || warga.find(w => w.id === currentUser?.resident_id) || warga[0]
  const anggotaList = Array.isArray(activeWarga?.anggotaKeluarga) ? activeWarga.anggotaKeluarga : []

  // Cari RT yang bersangkutan dengan warga ini
  const targetRt = rts?.find(r => r.id === activeWarga?.rt_id) || currentRT || rts?.[0]
  const targetRtPhone = targetRt?.kontak || config?.kontakRt || '081234567890'

  // Filter tagihan milik warga ini (terisolasi berdasarkan wargaId)
  const myBills = tagihan
    .filter(t => t.wargaId === activeWarga?.id)
    .sort((a, b) => (b.tahun * 12 + b.bulan) - (a.tahun * 12 + a.bulan))

  const currentBill = myBills.find(b => b.bulan === currentMonth && b.tahun === currentYear)
  const isCurrentPaid = currentBill?.status === 'Lunas'

  // Link konfirmasi bayar via WhatsApp ke RT yang bersangkutan
  const getConfirmWaLink = () => {
    let cleanPhone = targetRtPhone.replace(/\D/g, '')
    if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1)
    
    const text = `Halo Pengurus ${targetRt?.name || 'RT'},%0ASaya *${activeWarga?.nama}* dari *Blok ${activeWarga?.blok} No. ${activeWarga?.noRumah}* ingin konfirmasi pembayaran iuran IPL periode *${NAMA_BULAN[currentMonth - 1]} ${currentYear}* sebesar *${formatRupiah(currentBill?.total || 120000)}*.%0AMohon dicek. Terima kasih! 🙏`
    return `https://wa.me/${cleanPhone}?text=${text}`
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Profil Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-900/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Akun: {currentUser?.username}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold font-mono">
                <span>Kode Unik: #{activeWarga?.kodeUnik || '---'}</span>
              </div>
              <button
                onClick={() => setKeluargaModalOpen(true)}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs font-bold transition-all shadow-sm border border-emerald-400/40 flex items-center gap-1.5 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>👨‍👩‍👧‍👦 Data Keluarga ({anggotaList.length} Jiwa)</span>
              </button>
              <button
                onClick={() => setProfileModalOpen(true)}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-bold transition-colors border border-white/10 flex items-center gap-1 cursor-pointer"
              >
                <span>⚙️ Edit Akun</span>
              </button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
              <span>{activeWarga?.nama || 'Warga Terdaftar'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="flex items-center gap-1">
                <Home className="w-3.5 h-3.5 text-emerald-400" />
                Blok {activeWarga?.blok} No. {activeWarga?.noRumah}
              </span>
              <span>•</span>
              <span>{currentRT?.name || 'RT 01'} / RW {currentRT?.rw || '15'}</span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-emerald-300 text-[11px] font-bold">
                {activeWarga?.statusHuni || 'Warga Tetap'}
              </span>
              {activeWarga?.statusKepemilikan && (
                <>
                  <span>•</span>
                  <span className="text-[11px] text-slate-300 font-medium">
                    {activeWarga.statusKepemilikan}
                  </span>
                </>
              )}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-right shrink-0">
            <div className="text-[11px] text-emerald-200 font-semibold uppercase tracking-wider">
              Status IPL {NAMA_BULAN[currentMonth - 1]} {currentYear}
            </div>
            <div className="mt-1 flex items-center justify-end gap-1.5">
              {isCurrentPaid ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500 text-white text-xs font-extrabold shadow-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>LUNAS</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500 text-white text-xs font-extrabold shadow-sm">
                  <Clock className="w-4 h-4" />
                  <span>BELUM BAYAR</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Menu Cards for Warga */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div 
          onClick={() => setKeluargaModalOpen(true)}
          className="p-4 bg-emerald-50/70 hover:bg-emerald-100/70 rounded-2xl border border-emerald-200 shadow-xs cursor-pointer transition-all group space-y-2"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold group-hover:scale-105 transition-transform shadow-xs">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-emerald-950 text-xs sm:text-sm">
                Data Anggota Keluarga
              </h3>
              <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-1.5 py-0.5 rounded">
                {anggotaList.length} Org
              </span>
            </div>
            <p className="text-[11px] text-emerald-800 line-clamp-1">Kelola NIK, istri, anak & famili</p>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('pengaduan')}
          className="p-4 bg-white hover:bg-emerald-50/50 rounded-2xl border border-slate-200/80 hover:border-emerald-300 shadow-xs cursor-pointer transition-all group space-y-2"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
            <MessageSquareText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm group-hover:text-emerald-800 transition-colors">
              Lapor Aduan RT
            </h3>
            <p className="text-[11px] text-slate-500 line-clamp-1">Lapor lampu, sampah, fasum</p>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('surat')}
          className="p-4 bg-white hover:bg-emerald-50/50 rounded-2xl border border-slate-200/80 hover:border-emerald-300 shadow-xs cursor-pointer transition-all group space-y-2"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm group-hover:text-indigo-800 transition-colors">
              Surat Pengantar
            </h3>
            <p className="text-[11px] text-slate-500 line-clamp-1">KTP, Domisili, SKCK online</p>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('kas-warga')}
          className="p-4 bg-white hover:bg-emerald-50/50 rounded-2xl border border-slate-200/80 hover:border-emerald-300 shadow-xs cursor-pointer transition-all group space-y-2"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm group-hover:text-teal-800 transition-colors">
              Transparansi Kas
            </h3>
            <p className="text-[11px] text-slate-500 line-clamp-1">Laporan dana IPL terbuka</p>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('kontak-darurat')}
          className="p-4 bg-white hover:bg-rose-50/50 rounded-2xl border border-slate-200/80 hover:border-rose-300 shadow-xs cursor-pointer transition-all group space-y-2"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm group-hover:text-rose-800 transition-colors">
              Kontak Darurat
            </h3>
            <p className="text-[11px] text-slate-500 line-clamp-1">Pos Satpam & Ambulans 24 Jam</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Tagihan Bulan Ini & Pengumuman */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Tagihan Berjalan & Detail */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card Tagihan Bulan Berjalan */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Tagihan IPL Periode {NAMA_BULAN[currentMonth - 1]} {currentYear}
                </h2>
                <p className="text-xs text-slate-500">Iuran kebersihan, keamanan, dan pemeliharaan fasilitas</p>
              </div>
              <span className="text-xl font-black text-slate-900 font-mono">
                {formatRupiah(currentBill?.total || 120000)}
              </span>
            </div>

            {/* Banner Penolakan jika Perlu Diperbaiki */}
            {(currentBill?.status === 'Perlu Diperbaiki' || currentBill?.status === 'Ditolak' || !!currentBill?.alasanPenolakan) && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl text-xs space-y-2 text-orange-950">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-orange-900">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
                    Bukti Pembayaran Perlu Diperbaiki
                  </div>
                  <span className="px-2 py-0.5 rounded bg-orange-200 text-orange-900 font-extrabold text-[10px]">
                    Status: Perlu Diperbaiki
                  </span>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-orange-200 font-medium text-orange-900 text-xs">
                  <strong>Catatan Pengurus:</strong> "{currentBill?.alasanPenolakan || 'Bukti transfer tidak jelas atau nominal tidak sesuai.'}"
                </div>
                <p className="text-[11px] text-orange-800">
                  Silakan perbaiki dan upload ulang foto bukti transfer yang valid.
                </p>
              </div>
            )}

            {/* Rincian Pos Iuran */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
              <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                Rincian Pos Iuran:
              </div>
              <div className="space-y-1.5 text-xs">
                {(currentBill?.rincian || [
                  { nama: 'Iuran Kebersihan & Sampah', nominal: 35000 },
                  { nama: 'Iuran Keamanan & Portal', nominal: 50000 },
                  { nama: 'Kas Pemeliharaan & Fasum', nominal: 25000 },
                  { nama: 'Dana Sosial & Kematian', nominal: 10000 }
                ]).map((pos, idx) => (
                  <div key={idx} className="flex items-center justify-between text-slate-700">
                    <span>{pos.nama}</span>
                    <span className="font-mono font-bold text-slate-900">{formatRupiah(pos.nominal)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tombol Aksi Pembayaran / Kwitansi */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {isCurrentPaid && currentBill ? (
                <button
                  onClick={() => setSelectedTagihanKwitansi(currentBill)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / Unduh Kwitansi Resmi</span>
                </button>
              ) : (
                <>
                  {currentBill && (
                    <button
                      onClick={() => setUploadModalTagihan(currentBill)}
                      className={`flex items-center gap-2 px-5 py-2.5 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer ${
                        currentBill.status === 'Perlu Diperbaiki' || currentBill.status === 'Ditolak'
                          ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-600/20 animate-bounce'
                          : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      <span>{currentBill.status === 'Perlu Diperbaiki' || currentBill.status === 'Ditolak' ? 'Upload Ulang Bukti Transfer' : 'Upload Bukti Transfer'}</span>
                    </button>
                  )}
                  <a
                    href={getConfirmWaLink()}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>Konfirmasi via WhatsApp RT</span>
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Riwayat Pembayaran Sebelumnya */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900">Riwayat Pembayaran Anda</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Periode</th>
                    <th className="py-2.5 px-3">Nominal</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Kwitansi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myBills.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {NAMA_BULAN[b.bulan - 1]} {b.tahun}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        {formatRupiah(b.total)}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          b.status === 'Lunas' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {b.status === 'Lunas' && (
                          <button
                            onClick={() => setSelectedTagihanKwitansi(b)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Cetak Kwitansi"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Col: Rekening Pembayaran & Pengumuman */}
        <div className="space-y-6">
          
          {/* Info Rekening Kas RT */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Rekening Pembayaran Kas {targetRt?.name || 'RT'}</span>
            </div>
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-1 font-sans">
              <div className="text-xs font-bold text-emerald-950 font-mono">
                {targetRt?.rekening || config?.rekeningBank || 'BCA 8730192831 a.n Kas RT 01'}
              </div>
              <div className="text-[11px] text-emerald-800">
                Bendahara {targetRt?.name || 'RT'}: {targetRt?.bendahara || config?.bendahara || 'Ibu Siti Aminah'}
              </div>
            </div>
          </div>

          {/* Pengumuman & Kegiatan Lingkungan */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Pengumuman & Surat</span>
              </div>
              <button
                onClick={() => setActiveTab('events')}
                className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                Lihat Semua
              </button>
            </div>

            <div className="space-y-3">
              {(scopedEvents || events || []).length === 0 ? (
                <div className="text-xs text-slate-400 py-4 text-center">
                  Belum ada pengumuman baru untuk Anda.
                </div>
              ) : (
                (scopedEvents || events || []).slice(0, 3).map((evt) => {
                  const isPersonal = evt.targetType === 'personal' || !!evt.targetWargaId
                  const isUnread = !readEventIds.includes(evt.id)

                  return (
                    <div 
                      key={evt.id} 
                      onClick={() => {
                        if (markEventAsRead) markEventAsRead(evt.id)
                        setDetailModalEvent(evt)
                      }}
                      className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/70 hover:border-amber-300 space-y-1.5 cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-bold text-xs text-slate-900 line-clamp-1">{evt.judul}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          {isUnread && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              Baru
                            </span>
                          )}
                          {isPersonal && (
                            <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-extrabold border border-rose-200">
                              Khusus Anda
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                        {evt.deskripsi}
                      </div>
                      <div className="text-[10px] text-emerald-700 font-semibold flex items-center justify-between pt-0.5">
                        <span>{evt.batasTanggal ? formatTanggalIndo(evt.batasTanggal) : 'Pengumuman'}</span>
                        <span className="text-amber-700 text-[10px] font-bold hover:underline">
                          Baca Selengkapnya →
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Modal Detail Lengkap Pengumuman */}
      {detailModalEvent && (
        <DetailPengumumanModal
          isOpen={true}
          onClose={() => setDetailModalEvent(null)}
          event={detailModalEvent}
          onOpenBayar={(evt) => {
            const bill = tagihanEvents.find(te => te.eventId === evt.id && te.wargaId === activeWarga?.id)
            setUploadModalEvent({ event: evt, tagihan: bill })
          }}
        />
      )}

      {/* Modal Upload Bukti Transfer Event */}
      {uploadModalEvent && (
        <UploadBuktiEventModal
          isOpen={true}
          onClose={() => setUploadModalEvent(null)}
          event={uploadModalEvent.event}
          tagihanItem={uploadModalEvent.tagihan}
          wargaItem={activeWarga}
        />
      )}

      {/* Modal Upload Bukti Transfer IPL */}
      {uploadModalTagihan && (
        <UploadBuktiModal
          tagihan={uploadModalTagihan}
          wargaNama={activeWarga?.nama || ''}
          onClose={() => setUploadModalTagihan(null)}
        />
      )}

      {/* Modal Kelola Anggota Keluarga Mandiri */}
      <KeluargaModal
        isOpen={keluargaModalOpen}
        onClose={() => setKeluargaModalOpen(false)}
        warga={activeWarga}
      />

    </div>
  )
}
