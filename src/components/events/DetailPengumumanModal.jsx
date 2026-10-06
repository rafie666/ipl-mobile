import React, { useEffect } from 'react'
import { 
  X, 
  Megaphone, 
  Calendar, 
  Image, 
  User, 
  Building2, 
  Trophy, 
  CheckCircle2, 
  Clock, 
  Upload, 
  MessageCircle, 
  Printer, 
  FileText,
  Share2
} from 'lucide-react'
import { formatRupiah, formatTanggalIndo, generateWaEvent } from '../../utils/formatters'
import { useApp } from '../../context/AppContext'

export default function DetailPengumumanModal({ isOpen, onClose, event, onOpenBayar }) {
  const { rts, warga, isWarga, currentUser, config, tagihanEvents, setSelectedTagihanKwitansi, markEventAsRead } = useApp()

  useEffect(() => {
    if (isOpen && event?.id && isWarga && markEventAsRead) {
      markEventAsRead(event.id)
    }
  }, [isOpen, event?.id, isWarga, markEventAsRead])

  if (!isOpen || !event) return null

  const isRwEvent = event.scope === 'rw' || !event.rt_id
  const rtObj = rts?.find(r => r.id === event.rt_id)
  const isPersonal = event.targetType === 'personal' || !!event.targetWargaId
  const targetWarga = isPersonal ? warga.find(w => w.id === event.targetWargaId) : null
  const isPaidEvent = Number(event.nominalPerKK) > 0

  const myEventBill = isWarga 
    ? tagihanEvents.find(te => te.eventId === event.id && te.wargaId === currentUser?.resident_id)
    : null

  const waLink = generateWaEvent(
    targetWarga || warga.find(w => w.id === currentUser?.resident_id),
    event,
    myEventBill || { nominal: event.nominalPerKK },
    config?.namaLingkungan,
    config?.rekeningBank
  )

  const handlePrintSurat = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <Megaphone className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-amber-800 font-mono block">
                Surat Edaran & Pengumuman Resmi
              </span>
              <h3 className="text-base font-extrabold text-slate-900 line-clamp-1">
                {event.judul}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase font-mono border ${
              isRwEvent 
                ? 'bg-purple-100 text-purple-900 border-purple-200' 
                : 'bg-emerald-100 text-emerald-900 border-emerald-200'
            }`}>
              {isRwEvent ? '🏢 Tingkat RW' : `🏘️ Tingkat ${rtObj?.name || 'RT'}`}
            </span>

            {isPersonal ? (
              <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-900 border border-rose-200 text-xs font-extrabold flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                <span>{isWarga ? 'Surat Khusus untuk Anda' : `Penerima: ${targetWarga?.nama || 'Warga'}`}</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 border border-blue-200 text-xs font-bold">
                📢 Siaran Seluruh Warga
              </span>
            )}

            <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold">
              {event.kategori}
            </span>

            <span className="text-xs text-slate-500 ml-auto flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{event.batasTanggal ? formatTanggalIndo(event.batasTanggal) : 'Tanggal Terbit'}</span>
            </span>
          </div>

          {/* Judul Pengumuman */}
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
              {event.judul}
            </h1>
            <p className="text-xs text-slate-400">
              Diterbitkan oleh: <strong>{isRwEvent ? 'Pengurus RW' : `Pengurus ${rtObj?.name || 'RT'}`}</strong> • {config?.namaLingkungan || 'Lingkungan Warga'}
            </p>
          </div>

          {/* Auto Hapus info banner if active */}
          {event.autoHapus && event.expiredAt && (
            <div className="p-3 bg-amber-50/90 rounded-xl border border-amber-200/80 flex items-center gap-2.5 text-xs font-bold text-amber-900">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Pengumuman ini dijadwalkan otomatis terhapus pada: <strong>{formatTanggalIndo(event.expiredAt, true)}</strong></span>
            </div>
          )}

          {/* Lampiran Foto Poster jika ada */}
          {event.posterUrl && (
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 max-h-80 flex items-center justify-center shadow-md">
              <img
                src={event.posterUrl}
                alt="Lampiran Surat Edaran"
                className="max-h-80 w-full object-contain"
              />
            </div>
          )}

          {/* FULL TEXT CONTENT (Tidak Terpotong / Lengkap) */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Isi Pengumuman / Keterangan Lengkap:
            </span>
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans break-words select-text">
              {event.deskripsi || 'Tidak ada catatan teks tambahan pada pengumuman ini.'}
            </div>
          </div>

          {/* Status Iuran jika berbayar */}
          {isPaidEvent ? (
            <div className="p-5 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Biaya / Iuran Partisipasi</span>
                  <div className="text-xl font-mono font-black text-amber-900">
                    {formatRupiah(event.nominalPerKK)} <span className="text-xs font-normal text-slate-500">/ KK</span>
                  </div>
                </div>

                {isWarga && (
                  <div>
                    {myEventBill?.status === 'Lunas' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        LUNAS ({formatTanggalIndo(myEventBill.tanggalBayar)})
                      </span>
                    ) : myEventBill?.status === 'Menunggu Verifikasi' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-bold">
                        <Clock className="w-4 h-4 animate-spin" />
                        MENUNGGU VERIFIKASI PENGURUS
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-bold">
                        <Clock className="w-4 h-4" />
                        BELUM DIBAYAR
                      </span>
                    )}
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-600">
                Pembayaran dapat ditransfer ke rekening resmi: <strong className="text-slate-900 font-mono">{config?.rekeningBank || 'BCA Kas RT'}</strong>
              </p>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Pengumuman Informasi Resmi (Bebas Biaya / Rp 0)</span>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Tutup
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {isWarga && isPaidEvent && myEventBill?.status !== 'Lunas' && onOpenBayar && (
              <button
                onClick={() => {
                  onClose()
                  onOpenBayar(event)
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <Upload className="w-4 h-4" />
                <span>{myEventBill?.status === 'Menunggu Verifikasi' ? 'Unggah Ulang Bukti' : 'Bayar Sekarang'}</span>
              </button>
            )}

            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Hubungi Pengurus WA</span>
              </a>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
