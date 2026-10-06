import React, { useState } from 'react'
import { X, Check, AlertTriangle, Image, Calendar, User, Building, MessageCircle, DollarSign, Ban, History, FileText, ChevronRight } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { formatRupiah, formatTanggalIndo, NAMA_BULAN } from '../../utils/formatters'
import { ALASAN_PENOLAKAN_PRESET } from '../../data/initialData'

export default function VerifikasiBuktiModal() {
  const { selectedTagihanVerifikasi, setSelectedTagihanVerifikasi, verifikasiBuktiTransfer, warga, config } = useApp()

  const [showTolakForm, setShowTolakForm] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState(ALASAN_PENOLAKAN_PRESET[0])
  const [catatanKustom, setCatatanKustom] = useState('')
  const [zoomImg, setZoomImg] = useState(false)

  if (!selectedTagihanVerifikasi) return null

  const tagihan = selectedTagihanVerifikasi
  const targetWarga = warga.find(w => w.id === tagihan.wargaId) || {
    nama: tagihan.namaWarga || 'Warga',
    blok: tagihan.blok || '-',
    noRumah: tagihan.noRumah || '-',
    noHp: ''
  }

  const bulanNama = NAMA_BULAN[tagihan.bulan - 1] || `Bulan ${tagihan.bulan}`
  const isRw = tagihan.payment_scope === 'RW'
  const recipientLabel = tagihan.pembayaran_kepada || (isRw ? 'RW 15' : 'RT 01')

  const finalAlasanTolak = selectedPreset === 'Lainnya' 
    ? (catatanKustom.trim() || 'Bukti pembayaran tidak sesuai.')
    : (catatanKustom.trim() ? `${selectedPreset}. Catatan: ${catatanKustom.trim()}` : selectedPreset)

  const handleTerima = () => {
    verifikasiBuktiTransfer(tagihan.id, 'terima')
    setSelectedTagihanVerifikasi(null)
  }

  const handleTolak = (e) => {
    e.preventDefault()
    verifikasiBuktiTransfer(tagihan.id, 'tolak', { alasanTolak: finalAlasanTolak })
    setSelectedTagihanVerifikasi(null)
  }

  // Link WhatsApp penolakan
  const getWaTolakLink = () => {
    if (!targetWarga.noHp) return '#'
    let clean = targetWarga.noHp.replace(/\D/g, '')
    if (clean.startsWith('0')) clean = '62' + clean.slice(1)
    const text = `Halo Yth. Bpk/Ibu *${targetWarga.nama}*,%0A` +
      `Terkait bukti transfer iuran IPL periode *${bulanNama} ${tagihan.tahun}* (${recipientLabel}), belum dapat kami verifikasi karena:%0A` +
      `📌 *Alasan:* ${finalAlasanTolak}%0A%0A` +
      `Status tagihan Anda sekarang: *PERLU DIPERBAIKI*.%0A` +
      `Silakan periksa kembali dan *Upload Ulang Bukti* yang benar melalui aplikasi/portal. Terima kasih! 🙏`
    return `https://wa.me/${clean}?text=${text}`
  }

  const submissions = Array.isArray(tagihan.submissions) && tagihan.submissions.length > 0
    ? tagihan.submissions
    : [{
        id: `sub-init-1`,
        submission_no: 1,
        nominal: tagihan.total,
        tanggal: tagihan.tanggalUploadBukti || new Date().toISOString(),
        bukti_url: tagihan.buktiTransferUrl,
        metode: tagihan.bankPengirim || 'Transfer Bank',
        status: tagihan.status || 'Menunggu Verifikasi',
        catatan: tagihan.catatanWarga || '',
        alasan_penolakan: tagihan.alasanPenolakan || tagihan.alasanTolak || null
      }]

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-amber-50/60">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md uppercase ${isRw ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-blue-100 text-blue-800 border border-blue-200'}`}>
                  {recipientLabel}
                </span>
                <h3 className="text-base font-bold text-slate-800">Verifikasi Bukti Transfer</h3>
              </div>
              <p className="text-xs text-slate-500">Cek keabsahan struk dan beri feedback jika tidak sesuai</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedTagihanVerifikasi(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Info Warga & Tagihan */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Warga Pengirim</span>
              <span className="font-extrabold text-slate-900 text-sm">{targetWarga.nama}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Alamat:</span>
              <span className="font-bold text-slate-800">Blok {targetWarga.blok} No. {targetWarga.noRumah}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Periode & Penerima:</span>
              <span className="font-bold text-slate-800">{bulanNama} {tagihan.tahun} • {recipientLabel}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Metode Pengiriman:</span>
              <span className="font-semibold text-slate-700">{tagihan.bankPengirim || 'Transfer Bank'}</span>
            </div>
            {tagihan.catatanWarga && (
              <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                <span className="text-slate-500">Catatan Warga:</span>
                <span className="italic text-slate-700 font-medium">"{tagihan.catatanWarga}"</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
              <span className="font-bold uppercase tracking-wider text-slate-700">Nominal Tagihan:</span>
              <span className="text-lg font-mono font-extrabold text-emerald-700">{formatRupiah(tagihan.total)}</span>
            </div>
          </div>

          {/* Foto Struk Transfer Terbaru */}
          <div>
            <span className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <Image className="w-4 h-4 text-emerald-600" />
              Bukti Pembayaran Aktif:
            </span>

            {tagihan.buktiTransferUrl ? (
              <div 
                onClick={() => setZoomImg(!zoomImg)}
                className={`rounded-xl overflow-hidden border border-slate-300 bg-slate-900 cursor-pointer relative shadow-xs flex items-center justify-center transition-all ${
                  zoomImg ? 'max-h-96' : 'max-h-56'
                }`}
                title="Klik untuk memperbesar / perkecil"
              >
                <img
                  src={tagihan.buktiTransferUrl}
                  alt="Struk Transfer"
                  className="max-h-96 w-auto object-contain"
                />
                <div className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded-md backdrop-blur-xs">
                  {zoomImg ? 'Perkecil' : 'Klik untuk Zoom'}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-100 rounded-xl text-center text-slate-400 text-xs">
                Tidak ada foto bukti transfer terlampir.
              </div>
            )}
          </div>

          {/* Riwayat Semua Bukti Transfer (Submission History) */}
          {submissions.length > 1 && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
                <History className="w-4 h-4 text-brand-600" />
                Riwayat Pengiriman Bukti ({submissions.length} Kali Unggah)
              </div>
              <div className="space-y-2">
                {submissions.map((sub, idx) => (
                  <div key={sub.id || idx} className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">Submission #{sub.submission_no || idx + 1}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        sub.status === 'Lunas' ? 'bg-emerald-100 text-emerald-800' : sub.status === 'Ditolak' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {sub.status || 'Menunggu'}
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      {formatRupiah(sub.nominal)} • {formatTanggalIndo(sub.tanggal)}
                    </div>
                    {sub.alasan_penolakan && (
                      <div className="mt-1 text-[11px] text-rose-700 bg-rose-50 p-1.5 rounded">
                        Alasan Ditolak: {sub.alasan_penolakan}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form Tolak Bukti dengan Preset Alasan & Feedback */}
          {showTolakForm && (
            <form onSubmit={handleTolak} className="p-4 bg-rose-50/80 rounded-xl border border-rose-200 space-y-3 animate-in fade-in">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                <Ban className="w-4 h-4 text-rose-600" />
                Pilih Alasan Penolakan Bukti (Status akan diubah ke: PERLU DIPERBAIKI)
              </div>

              {/* Preset Alasan Picker */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-slate-700">Pilih Kategori Alasan:</label>
                <select
                  value={selectedPreset}
                  onChange={(e) => setSelectedPreset(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-rose-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  {ALASAN_PENOLAKAN_PRESET.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              {/* Keterangan / Catatan Tambahan */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-700">
                  {selectedPreset === 'Lainnya' ? 'Keterangan Wajib Diisi *' : 'Catatan Tambahan untuk Warga (Opsional)'}
                </label>
                <input
                  type="text"
                  required={selectedPreset === 'Lainnya'}
                  value={catatanKustom}
                  onChange={(e) => setCatatanKustom(e.target.value)}
                  placeholder={selectedPreset === 'Lainnya' ? 'Jelaskan alasan penolakan...' : 'Misal: Kurang Rp50.000 atau kirim ke Rekening RT 01'}
                  className="w-full px-3 py-2 bg-white border border-rose-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                {targetWarga.noHp && (
                  <a
                    href={getWaTolakLink()}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-emerald-700 font-bold hover:underline flex items-center gap-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> Kirim Feedback via WA
                  </a>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowTolakForm(false)}
                    className="px-3 py-1 text-xs text-slate-500 hover:bg-rose-100 rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs"
                  >
                    Tolak & Minta Perbaikan
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Actions Footer */}
          {!showTolakForm && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setShowTolakForm(true)}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors border border-rose-200"
              >
                Tolak & Minta Perbaikan
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTagihanVerifikasi(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleTerima}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
                >
                  <Check className="w-4 h-4" />
                  Terima & Lunaskan
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  )
}
