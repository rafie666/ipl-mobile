import React, { useState } from 'react'
import { X, ArrowUpRight, ArrowDownRight, Wallet, Calendar, FileText } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const KATEGORI_MASUK = ['Iuran Warga', 'Donasi Warga', 'Sewa Fasum / Tenda', 'Kas Sosial', 'Bunga Bank', 'Lain-lain']
const KATEGORI_KELUAR = ['Honor Satpam', 'Retribusi Sampah', 'Perbaikan Lampu & Listrik', 'Perbaikan Jalan & Fasum', 'Santunan Sosial / Kematian', 'Konsumsi & Kerja Bakti', 'ATK & Operasional RT', 'Lain-lain']

export default function TransaksiKasModal({ isOpen, onClose }) {
  const { addKas, isRT, currentRT, isAdmin, rts } = useApp()

  const [tipe, setTipe] = useState('Keluar')
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10))
  const [kategori, setKategori] = useState('Honor Satpam')
  const [nominal, setNominal] = useState('')
  const [deskripsi, setDeskripsi] = useState('')
  const [scope, setScope] = useState(isRT ? 'rt' : 'rw')
  const [targetRtId, setTargetRtId] = useState(isRT ? (currentRT?.id || 'rt-1') : (rts[0]?.id || 'rt-1'))

  if (!isOpen) return null

  const handleTipeChange = (newTipe) => {
    setTipe(newTipe)
    setKategori(newTipe === 'Masuk' ? KATEGORI_MASUK[0] : KATEGORI_KELUAR[0])
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!nominal || Number(nominal) <= 0) return

    addKas({
      tipe,
      tanggal,
      kategori,
      nominal: Number(nominal),
      deskripsi: deskripsi.trim(),
      scope: isRT ? 'rt' : scope,
      rt_id: isRT ? currentRT?.id : (scope === 'rt' ? targetRtId : null)
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className={`p-2 rounded-xl ${tipe === 'Masuk' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              <Wallet className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Catat Transaksi Kas {isRT ? (currentRT?.name || 'RT') : 'RW'}
              </h3>
              <p className="text-xs text-slate-500">
                {isRT ? `Buku Kas Keuangan Khusus ${currentRT?.name || 'RT'}` : 'Buku Kas Terpusat Lingkungan RW'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Tipe Selector Switch */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => handleTipeChange('Keluar')}
              className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                tipe === 'Keluar'
                  ? 'bg-white text-rose-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownRight className="w-4 h-4 text-rose-500" />
              Pengeluaran (Biaya)
            </button>
            <button
              type="button"
              onClick={() => handleTipeChange('Masuk')}
              className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                tipe === 'Masuk'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-emerald-500" />
              Pemasukan Kas
            </button>
          </div>

          {/* Tanggal */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Tanggal Transaksi
            </label>
            <input
              type="date"
              required
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:bg-white"
            />
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kategori Pos Kas
            </label>
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-500 focus:bg-white"
            >
              {(tipe === 'Masuk' ? KATEGORI_MASUK : KATEGORI_KELUAR).map(kat => (
                <option key={kat} value={kat}>{kat}</option>
              ))}
            </select>
          </div>

          {/* Nominal */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nominal (Rp) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1000"
              step="1000"
              required
              placeholder="Contoh: 150000"
              value={nominal}
              onChange={(e) => setNominal(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold font-mono focus:outline-none focus:ring-2 focus:ring-slate-500 focus:bg-white"
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Keterangan / Rincian
            </label>
            <textarea
              rows={2}
              required
              placeholder={tipe === 'Keluar' ? 'Contoh: Beli 2 sak semen untuk tambal jalan depan pos ronda' : 'Contoh: Donasi dari warga Blok C untuk konsumsi 17an'}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-500 focus:bg-white"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 text-white rounded-xl text-xs font-bold transition-all shadow-md ${
                tipe === 'Masuk' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
              }`}
            >
              Simpan {tipe === 'Masuk' ? 'Pemasukan' : 'Pengeluaran'}
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}
