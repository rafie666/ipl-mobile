import React, { useState } from 'react'
import { X, Upload, Image, Trash2, CheckCircle2, Trophy, CreditCard, QrCode, Copy } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { formatRupiah } from '../../utils/formatters'
import { compressImageFile } from '../../utils/imageCompressor'

export default function UploadBuktiEventModal({ isOpen, onClose, event, tagihanItem, wargaItem }) {
  const {
    uploadBuktiTagihanEvent,
    config,
    showToast,
    currentWarga,
    warga,
    rts,
    currentRT,
    bankAccounts = [],
    qrisAccounts = []
  } = useApp()

  const [buktiUrl, setBuktiUrl] = useState(null)
  const [bankPengirim, setBankPengirim] = useState('Transfer BCA')
  const [catatanWarga, setCatatanWarga] = useState('')

  if (!isOpen || !event) return null

  const targetWarga = wargaItem || currentWarga || warga[0]
  const nominal = tagihanItem?.nominal || event.nominalPerKK || 0
  const isRwScope = event.scope === 'rw' || event.level === 'rw'

  // Temukan RT warga
  const targetRT = (rts || []).find(r => r.id === (targetWarga?.rt_id || 'rt-1')) || currentRT || rts?.[0]
  const targetOwnerId = isRwScope ? 'rw-15' : targetRT?.id

  // Ambil rekening & QRIS terkait scope event
  const relevantBanks = (bankAccounts || []).filter(b =>
    isRwScope ? b.owner_type === 'RW' : (b.owner_type === 'RT' && b.owner_id === targetOwnerId)
  )
  const primaryBank = relevantBanks.find(b => b.is_primary) || relevantBanks[0]

  const relevantQris = (qrisAccounts || []).filter(q =>
    isRwScope ? q.owner_type === 'RW' : (q.owner_type === 'RT' && q.owner_id === targetOwnerId)
  )
  const primaryQris = relevantQris.find(q => q.is_primary) || relevantQris[0]

  const qrisImageSrc = primaryQris?.image_url ||
    (isRwScope ? config?.qrisImageUrlRw : targetRT?.qrisImageUrl) ||
    config?.qrisImageUrl ||
    `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=QRIS_WARGAKU_EVENT_${event.id}_${nominal}`

  const bankInfoText = primaryBank
    ? `${primaryBank.bank_name} ${primaryBank.account_number} a.n ${primaryBank.account_holder}`
    : (isRwScope ? (config?.rekeningRw || 'BCA 7788990011 a.n Kas RW 15') : (targetRT?.rekening || config?.rekeningBank || 'BCA 8730192831 a.n Kas RT 01'))

  const handleCopy = (text, label) => {
    navigator.clipboard?.writeText(text)
    showToast(`${label} berhasil disalin ke clipboard!`, 'info')
  }

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      showToast('Ukuran foto maksimal 5MB', 'error')
      return
    }

    try {
      const compressedDataUrl = await compressImageFile(file, 1200, 1200, 0.75)
      setBuktiUrl(compressedDataUrl)
    } catch (err) {
      showToast('Gagal memproses gambar: ' + (err.message || 'Format tidak valid'), 'error')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!buktiUrl) {
      showToast('Harap unggah foto bukti transfer terlebih dahulu', 'warning')
      return
    }

    uploadBuktiTagihanEvent({
      eventId: event.id,
      teId: tagihanItem?.id,
      wargaId: targetWarga?.id,
      buktiTransferUrl: buktiUrl,
      bankPengirim,
      catatanWarga: catatanWarga.trim()
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <Trophy className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-800">Bayar Iuran Kegiatan / Lomba</h3>
              <p className="text-xs text-slate-500">Unggah bukti transfer untuk konfirmasi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Summary Box */}
          <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200/80 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Nama Acara:</span>
              <span className="font-bold text-slate-900 truncate max-w-[200px]">{event.judul}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Warga:</span>
              <span className="font-bold text-slate-800">{targetWarga?.nama} ({targetWarga?.blok}/{targetWarga?.noRumah})</span>
            </div>
            <div className="pt-2 border-t border-amber-200/80 flex justify-between items-baseline">
              <span className="font-bold text-slate-700">Nominal Iuran:</span>
              <span className="text-lg font-mono font-extrabold text-amber-800">{formatRupiah(nominal)}</span>
            </div>
            <div className="pt-1 text-[11px] text-slate-600 bg-white/80 p-2.5 rounded-lg border border-amber-200/60">
              <span className="text-[10px] text-slate-400 block font-semibold">
                Rekening Resmi ({isRwScope ? 'Kas RW' : targetRT?.name || 'Kas RT'}):
              </span>
              <div className="flex items-center justify-between gap-2 mt-0.5">
                <strong className="text-slate-800">{bankInfoText}</strong>
                {primaryBank?.account_number && (
                  <button
                    type="button"
                    onClick={() => handleCopy(primaryBank.account_number, 'Nomor Rekening')}
                    className="p-1 hover:bg-slate-100 rounded text-amber-700"
                    title="Salin No Rekening"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Pilihan Metode Pembayaran */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Metode / Bank Pengirim
            </label>
            <select
              value={bankPengirim}
              onChange={(e) => setBankPengirim(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="Transfer BCA">Transfer Bank BCA</option>
              <option value="Transfer Mandiri">Transfer Bank Mandiri</option>
              <option value="Transfer BRI">Transfer Bank BRI</option>
              <option value="Transfer BNI">Transfer Bank BNI</option>
              <option value="QRIS">Scan Barcode QRIS ({isRwScope ? 'Kas RW' : targetRT?.name || 'Kas RT'})</option>
              <option value="Bank Lainnya">Bank Lainnya / E-Wallet (DANA/OVO/GoPay)</option>
            </select>
          </div>

          {/* TAMPILAN FOTO BARCODE QRIS JIKA PILIH QRIS */}
          {bankPengirim === 'QRIS' && (
            <div className="p-4 bg-amber-50/80 border border-amber-300 rounded-2xl text-center space-y-2.5 animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-amber-950 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-amber-700" />
                  Barcode QRIS {isRwScope ? 'RW 15' : targetRT?.name || 'RT 01'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold">
                  {primaryQris?.qris_name || 'QRIS Resmi'}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-xs inline-block mx-auto">
                <img
                  src={qrisImageSrc}
                  alt="Barcode QRIS Iuran"
                  className="w-48 h-48 object-contain mx-auto rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-800">
                  Nominal: <span className="font-mono font-black text-amber-800">{formatRupiah(nominal)}</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Buka aplikasi m-Banking (BCA, Mandiri, BRI, BNI) atau E-Wallet (GoPay, OVO, DANA, ShopeePay), lalu scan barcode di atas.
                </p>
                <a
                  href={qrisImageSrc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-[11px] font-bold text-amber-700 hover:underline pt-1"
                >
                  Buka / Unduh Gambar Barcode QRIS ↗
                </a>
              </div>
            </div>
          )}

          {/* Upload Foto Struk */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Image className="w-4 h-4 text-amber-600" />
                Foto Bukti Transfer / Struk <span className="text-rose-500">*</span>
              </label>
              {buktiUrl && (
                <button
                  type="button"
                  onClick={() => setBuktiUrl(null)}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Ganti Foto
                </button>
              )}
            </div>

            {buktiUrl ? (
              <div className="rounded-xl overflow-hidden border border-amber-300 bg-slate-900 max-h-52 flex items-center justify-center relative shadow-xs">
                <img src={buktiUrl} alt="Bukti Transfer" className="max-h-52 w-auto object-contain" />
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-300 hover:border-amber-500 bg-slate-50/50 hover:bg-amber-50/30 rounded-xl cursor-pointer transition-colors text-center">
                <Upload className="w-7 h-7 text-slate-400 mb-1" />
                <span className="text-xs font-bold text-slate-700">Pilih Foto Bukti Transfer</span>
                <span className="text-[11px] text-slate-400 mt-0.5">JPG, PNG, atau WebP (Maks 3MB)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Catatan Warga */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan / Nama Pemilik Rekening (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Transfer a.n Bambang via m-BCA"
              value={catatanWarga}
              onChange={(e) => setCatatanWarga(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-600/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              Kirim Bukti Pembayaran
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}
