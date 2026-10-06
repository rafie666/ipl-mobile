import React, { useState, useEffect } from 'react'
import { X, CreditCard, Check, Calendar, MessageSquare } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { formatRupiah, NAMA_BULAN } from '../../utils/formatters'

export default function BayarModal() {
  const { selectedTagihanBayar, setSelectedTagihanBayar, bayarTagihan, setSelectedTagihanKwitansi, warga } = useApp()

  const [tanggalBayar, setTanggalBayar] = useState('')
  const [metodeBayar, setMetodeBayar] = useState('Tunai')
  const [catatan, setCatatan] = useState('')

  useEffect(() => {
    if (selectedTagihanBayar) {
      setTanggalBayar(new Date().toISOString().slice(0, 10))
      setMetodeBayar('Tunai')
      setCatatan('')
    }
  }, [selectedTagihanBayar])

  if (!selectedTagihanBayar) return null

  const tagihan = selectedTagihanBayar
  const targetWarga = warga.find(w => w.id === tagihan.wargaId) || {
    nama: 'Warga',
    blok: '-',
    noRumah: '-'
  }

  const bulanNama = NAMA_BULAN[tagihan.bulan - 1] || `Bulan ${tagihan.bulan}`

  const handleSubmit = (e) => {
    e.preventDefault()
    bayarTagihan(tagihan.id, {
      tanggalBayar,
      metodeBayar,
      catatan
    })

    // Cari tagihan yang baru diupdate untuk langsung buka opsi cetak kwitansi
    const updatedSample = {
      ...tagihan,
      status: 'Lunas',
      tanggalBayar,
      metodeBayar,
      catatan,
      noKwitansi: `KW-${tagihan.tahun}${String(tagihan.bulan).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`
    }

    setSelectedTagihanBayar(null)
    setSelectedTagihanKwitansi(updatedSample)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-brand-100 text-brand-700 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-800">Catat Pembayaran Iuran</h3>
              <p className="text-xs text-slate-500">Konfirmasi penerimaan kas dari warga</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedTagihanBayar(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Card Ringkasan Tagihan */}
          <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-100 space-y-1">
            <div className="flex justify-between items-center text-xs text-slate-600">
              <span>Warga Pembayar</span>
              <span className="font-bold text-slate-800">{targetWarga.nama}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-600">
              <span>Alamat Rumah</span>
              <span className="font-semibold text-slate-700">Blok {targetWarga.blok} No. {targetWarga.noRumah}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-600">
              <span>Periode Iuran</span>
              <span className="font-semibold text-emerald-700">{bulanNama} {tagihan.tahun}</span>
            </div>
            <div className="pt-2 mt-2 border-t border-emerald-200/60 flex justify-between items-baseline">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Total Tagihan</span>
              <span className="text-xl font-extrabold text-emerald-700 font-mono">
                {formatRupiah(tagihan.total)}
              </span>
            </div>
          </div>

          {/* Tanggal Bayar */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Tanggal Diterima
            </label>
            <input
              type="date"
              value={tanggalBayar}
              onChange={(e) => setTanggalBayar(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
            />
          </div>

          {/* Metode Pembayaran */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'Tunai', label: '💵 Tunai' },
                { id: 'QRIS', label: '📱 QRIS RT' },
                { id: 'Transfer BCA', label: '🏦 Transfer BCA' },
                { id: 'Transfer Mandiri', label: '🏦 Bank Mandiri' },
              ].map(opt => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setMetodeBayar(opt.id)}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl border text-left flex items-center justify-between transition-all ${
                    metodeBayar === opt.id
                      ? 'border-brand-500 bg-brand-50 text-brand-800 ring-2 ring-brand-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <span>{opt.label}</span>
                  {metodeBayar === opt.id && <Check className="w-3.5 h-3.5 text-brand-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Catatan Tambahan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              Catatan Pembayaran (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Diterima langsung saat pertemuan RT"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSelectedTagihanBayar(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg shadow-emerald-600/20"
            >
              <Check className="w-4 h-4" />
              Konfirmasi & Buat Kwitansi
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}
