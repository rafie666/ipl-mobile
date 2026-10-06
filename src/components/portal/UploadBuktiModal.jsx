import React, { useState } from 'react'
import { X, Upload, Image, Trash2, CheckCircle2, Building2, CreditCard, MessageSquare, Check, ArrowRight } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { formatRupiah, NAMA_BULAN, generateWaKonfirmasiBayar } from '../../utils/formatters'
import { compressImageFile } from '../../utils/imageCompressor'

export default function UploadBuktiModal({ isOpen, onClose, tagihan, warga }) {
  const { uploadBuktiTransfer, config, showToast, rts, currentRT, bankAccounts = [], qrisAccounts = [] } = useApp()

  const [buktiUrl, setBuktiUrl] = useState(null)
  const [bankPengirim, setBankPengirim] = useState('Transfer BCA')
  const [catatanWarga, setCatatanWarga] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  if (!isOpen || !tagihan || !warga) return null

  const targetRT = (rts || []).find(r => r.id === (tagihan.rtId || warga.rt_id)) || currentRT || rts?.[0]
  const isRwScope = tagihan.scope === 'RW'

  // Filter scoped bank & QRIS accounts
  const relevantBanks = bankAccounts.filter(b => 
    isRwScope ? b.owner_type === 'RW' : (b.owner_type === 'RT' && b.owner_id === targetRT?.id)
  )
  const primaryBank = relevantBanks.find(b => b.is_primary) || relevantBanks[0]

  const relevantQris = qrisAccounts.filter(q => 
    isRwScope ? q.owner_type === 'RW' : (q.owner_type === 'RT' && q.owner_id === targetRT?.id)
  )
  const primaryQris = relevantQris.find(q => q.is_primary) || relevantQris[0]

  const pengurusScopeName = isRwScope ? `Pengurus RW (${config?.rw || 'RW 15'})` : `${targetRT?.name || 'RT'} (${targetRT?.ketua || 'Ketua RT'})`
  const rtPhone = isRwScope ? (config?.kontakRw || config?.kontakRt || '081234567890') : (targetRT?.kontak || config?.kontakRt || '081234567890')
  const waConfirmUrl = generateWaKonfirmasiBayar(warga, tagihan, bankPengirim, rtPhone, pengurusScopeName, config?.namaLingkungan)

  const isPerluDiperbaiki = tagihan.status === 'Perlu Diperbaiki' || tagihan.status === 'Ditolak' || !!tagihan.alasanPenolakan

  const handleClose = () => {
    setIsSubmitted(false)
    setBuktiUrl(null)
    setCatatanWarga('')
    onClose()
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
      showToast('Harap pilih foto struk / bukti transfer terlebih dahulu', 'warning')
      return
    }

    uploadBuktiTransfer(tagihan.id, {
      buktiTransferUrl: buktiUrl,
      bankPengirim,
      catatanWarga: catatanWarga.trim()
    })

    setIsSubmitted(true)
  }

  const bulanNama = NAMA_BULAN[tagihan.bulan - 1] || `Bulan ${tagihan.bulan}`

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className={`p-2 rounded-xl ${isPerluDiperbaiki ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
              <Upload className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                {isPerluDiperbaiki ? 'Upload Ulang Bukti Pembayaran' : 'Kirim Bukti Pembayaran'}
              </h3>
              <p className="text-xs text-slate-500">
                {isPerluDiperbaiki ? 'Perbaiki bukti transfer untuk tagihan ini' : 'Unggah bukti transfer atau struk iuran'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body or Success State */}
        {isSubmitted ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-800">Bukti Pembayaran Terkirim!</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Status tagihan Anda sekarang <strong className="text-amber-600">Menunggu Verifikasi</strong> oleh {pengurusScopeName}.
              </p>
            </div>

            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-left text-xs space-y-1.5 text-slate-700">
              <div className="flex justify-between items-center text-[11px] text-slate-500">
                <span>Pengurus Penerima:</span>
                <span className="font-bold text-emerald-800">{pengurusScopeName}</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Kirim notifikasi otomatis ke WhatsApp pengurus agar bukti transfer Anda segera dicek & disetujui:
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <a
                href={waConfirmUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                Kirim Notifikasi ke WhatsApp Pengurus
              </a>

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Tutup & Selesai
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {/* Banner Penolakan jika Perlu Diperbaiki */}
            {isPerluDiperbaiki && (
              <div className="p-3.5 bg-orange-50 border border-orange-200 rounded-xl text-xs space-y-1 text-orange-950">
                <div className="flex items-center gap-1.5 font-bold text-orange-900">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                  Bukti Sebelumnya Perlu Diperbaiki:
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-orange-200/60 font-semibold text-orange-800 text-[11px]">
                  "{tagihan.alasanPenolakan || 'Bukti transfer tidak jelas atau nominal tidak sesuai.'}"
                </div>
                <p className="text-[10px] text-orange-700 pt-0.5">
                  Silakan unggah foto bukti transfer yang jelas dan sesuai untuk diverifikasi ulang.
                </p>
              </div>
            )}

            {/* Ringkasan Tagihan & Rekening Tujuan RT/RW */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Warga:</span>
                <span className="font-bold text-slate-800">{warga.nama} ({warga.blok}/{warga.noRumah})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Kategori & Periode:</span>
                <div className="flex items-center gap-1">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${isRwScope ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                    {isRwScope ? 'KAS RW' : 'KAS RT'}
                  </span>
                  <span className="font-bold text-emerald-700">{bulanNama} {tagihan.tahun}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="font-bold text-slate-700">Total Harus Dibayar:</span>
                <span className="text-base font-mono font-extrabold text-slate-900">{formatRupiah(tagihan.total)}</span>
              </div>
              <div className="pt-1 text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block font-semibold">Tujuan Transfer {isRwScope ? 'RW' : (targetRT?.name || 'RT')}:</span>
                <strong className="text-slate-800">
                  {primaryBank ? `${primaryBank.bank_name} - ${primaryBank.account_number} (a.n ${primaryBank.account_holder})` : (isRwScope ? config?.rekeningRw : (targetRT?.rekening || config?.rekeningBank || 'Kas RT'))}
                </strong>
                {primaryQris && (
                  <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                    ✓ QRIS {primaryQris.qris_name} tersedia
                  </div>
                )}
              </div>
            </div>

            {/* Riwayat Upload Sebelumnya jika ada */}
            {tagihan.submissions && tagihan.submissions.length > 0 && (
              <div className="p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-[11px] space-y-1">
                <span className="text-slate-500 font-bold block text-[10px]">Riwayat Pengajuan Sebelumnya ({tagihan.submissions.length}):</span>
                {tagihan.submissions.map((sub, idx) => (
                  <div key={idx} className="flex items-center justify-between text-slate-600 bg-white px-2 py-1 rounded border border-slate-100">
                    <span>Pengajuan #{idx + 1} ({sub.bankPengirim || 'Transfer'})</span>
                    <span className={`text-[10px] font-bold ${sub.status === 'Ditolak' ? 'text-rose-600' : 'text-slate-500'}`}>{sub.status || 'Ditolak'}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Foto Struk */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Image className="w-4 h-4 text-emerald-600" />
                  Foto Struk / Tangkapan Layar m-Banking <span className="text-rose-500">*</span>
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
                <div className="rounded-xl overflow-hidden border border-emerald-300 bg-slate-900 max-h-52 flex items-center justify-center relative shadow-xs">
                  <img src={buktiUrl} alt="Bukti Transfer" className="max-h-52 w-auto object-contain" />
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/50 hover:bg-emerald-50/30 rounded-xl cursor-pointer transition-colors text-center">
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

            {/* Bank / Metode Pengirim */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Metode Pembayaran
              </label>
              <select
                value={bankPengirim}
                onChange={(e) => setBankPengirim(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Transfer BCA">Transfer Bank BCA</option>
                <option value="Transfer Mandiri">Transfer Bank Mandiri</option>
                <option value="Transfer BRI">Transfer Bank BRI</option>
                <option value="Transfer BNI">Transfer Bank BNI</option>
                <option value="QRIS">Scan Barcode QRIS ({isRwScope ? 'Kas RW' : 'Kas RT'})</option>
                <option value="Bank Lainnya">Bank Lainnya / E-Wallet (Dana/OVO/Gopay)</option>
              </select>
            </div>

            {/* TAMPILAN FOTO BARCODE QRIS JIKA PILIH QRIS */}
            {bankPengirim === 'QRIS' && (
              <div className="p-4 bg-emerald-50/70 border border-emerald-300 rounded-2xl text-center space-y-2.5 animate-in fade-in zoom-in duration-150">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-emerald-950">Barcode QRIS Resmi {isRwScope ? 'RW' : targetRT?.name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-bold">
                    {primaryQris?.qris_name || 'QRIS Utama'}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-xs inline-block mx-auto">
                  <img
                    src={primaryQris?.image_url || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=QRIS_WARGAKU_${isRwScope ? 'RW15' : targetRT?.id}_${tagihan.id}`}
                    alt="Barcode QRIS"
                    className="w-48 h-48 object-contain mx-auto rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-800">
                    Nominal Transfer: <span className="font-mono font-black text-emerald-800">{formatRupiah(tagihan.total)}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Buka BCA Mobile / Mandiri Livin / GoPay / OVO / ShopeePay / DANA lalu scan barcode di atas.
                  </p>
                  {(primaryQris?.image_url) && (
                    <a
                      href={primaryQris.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-[11px] font-bold text-emerald-700 hover:underline pt-1"
                    >
                      Buka / Simpan Gambar Barcode QR
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Catatan Warga */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Pemilik Rekening / Catatan (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Transfer a.n Syahdan jam 09:30"
                value={catatanWarga}
                onChange={(e) => setCatatanWarga(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                Kirim Bukti Pembayaran
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  )
}
