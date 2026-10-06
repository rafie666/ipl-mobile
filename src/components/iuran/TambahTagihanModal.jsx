import React, { useState, useEffect } from 'react'
import { X, PlusCircle, Check, Calendar, DollarSign, User, FileText, CheckCircle2 } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { formatRupiah, NAMA_BULAN } from '../../utils/formatters'

export default function TambahTagihanModal({ isOpen, onClose }) {
  const { warga, jenisIuran, addTagihanManual } = useApp()

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  const [wargaId, setWargaId] = useState('')
  const [bulan, setBulan] = useState(currentMonth)
  const [tahun, setTahun] = useState(currentYear)
  const [modeIuran, setModeIuran] = useState('paket') // 'paket' | 'kustom'
  const [selectedPosIds, setSelectedPosIds] = useState([])
  const [customTotal, setCustomTotal] = useState('')
  const [status, setStatus] = useState('Belum Lunas') // 'Belum Lunas' | 'Lunas'
  const [metodeBayar, setMetodeBayar] = useState('Tunai')
  const [tanggalBayar, setTanggalBayar] = useState(new Date().toISOString().slice(0, 10))
  const [catatan, setCatatan] = useState('')

  useEffect(() => {
    if (isOpen) {
      setWargaId(warga[0]?.id || '')
      setBulan(currentMonth)
      setTahun(currentYear)
      setModeIuran('paket')
      setSelectedPosIds(jenisIuran.filter(j => j.aktif).map(j => j.id))
      setCustomTotal('')
      setStatus('Belum Lunas')
      setMetodeBayar('Tunai')
      setTanggalBayar(new Date().toISOString().slice(0, 10))
      setCatatan('')
    }
  }, [isOpen, warga, jenisIuran])

  if (!isOpen) return null

  // Hitung rincian & total berdasarkan pilihan
  const activeJenis = jenisIuran.filter(j => j.aktif)
  let calculatedRincian = []
  let calculatedTotal = 0

  if (modeIuran === 'paket') {
    calculatedRincian = activeJenis.map(j => ({ nama: j.nama, nominal: j.nominal }))
    calculatedTotal = activeJenis.reduce((sum, j) => sum + j.nominal, 0)
  } else {
    calculatedRincian = jenisIuran
      .filter(j => selectedPosIds.includes(j.id))
      .map(j => ({ nama: j.nama, nominal: j.nominal }))
    calculatedTotal = calculatedRincian.reduce((sum, j) => sum + j.nominal, 0)
  }

  const finalTotal = customTotal !== '' ? Number(customTotal) : calculatedTotal

  const togglePos = (id) => {
    if (selectedPosIds.includes(id)) {
      setSelectedPosIds(selectedPosIds.filter(i => i !== id))
    } else {
      setSelectedPosIds([...selectedPosIds, id])
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!wargaId) return

    addTagihanManual({
      wargaId,
      bulan: Number(bulan),
      tahun: Number(tahun),
      total: finalTotal,
      rincian: calculatedRincian,
      status,
      metodeBayar: status === 'Lunas' ? metodeBayar : null,
      tanggalBayar: status === 'Lunas' ? tanggalBayar : null,
      catatan: catatan.trim()
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <PlusCircle className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-800">Tambah Tagihan Iuran Manual</h3>
              <p className="text-xs text-slate-500">Input tagihan iuran per warga seperti di IPL</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Pilih Warga */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Pilih Warga / Unit Rumah <span className="text-rose-500">*</span>
            </label>
            <select
              value={wargaId}
              onChange={(e) => setWargaId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            >
              {warga.map(w => (
                <option key={w.id} value={w.id}>
                  {w.nama} — Blok {w.blok} No. {w.noRumah} ({w.statusHuni})
                </option>
              ))}
            </select>
          </div>

          {/* Periode Tagihan */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Bulan
              </label>
              <select
                value={bulan}
                onChange={(e) => setBulan(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              >
                {NAMA_BULAN.map((nama, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {idx + 1} - {nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tahun
              </label>
              <select
                value={tahun}
                onChange={(e) => setTahun(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              >
                {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Opsi Jenis Iuran */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Komponen Iuran
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                type="button"
                onClick={() => setModeIuran('paket')}
                className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
                  modeIuran === 'paket'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Paket Standar Bulanan
              </button>
              <button
                type="button"
                onClick={() => setModeIuran('kustom')}
                className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
                  modeIuran === 'kustom'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Pilih Pos Tertentu
              </button>
            </div>

            {/* List checkbox pos iuran jika kustom */}
            {modeIuran === 'kustom' && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 max-h-36 overflow-y-auto">
                {jenisIuran.map(j => (
                  <label key={j.id} className="flex items-center justify-between text-xs text-slate-700 cursor-pointer hover:bg-slate-100 p-1 rounded">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedPosIds.includes(j.id)}
                        onChange={() => togglePos(j.id)}
                        className="rounded accent-emerald-600"
                      />
                      <span>{j.nama}</span>
                    </div>
                    <span className="font-mono font-semibold">{formatRupiah(j.nominal)}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Nominal Tagihan */}
          <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">
                Total Nominal Tagihan
              </span>
              <span className="text-lg font-extrabold text-emerald-700 font-mono">
                {formatRupiah(finalTotal)}
              </span>
            </div>
            <div className="w-36">
              <input
                type="number"
                step="1000"
                placeholder="Ubah nominal..."
                value={customTotal}
                onChange={(e) => setCustomTotal(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-mono font-bold text-right focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Status Pembayaran */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Status Awal Tagihan
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus('Belum Lunas')}
                className={`px-3 py-2 text-xs font-bold rounded-xl border text-center transition-all ${
                  status === 'Belum Lunas'
                    ? 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Belum Lunas (Tagihan)
              </button>
              <button
                type="button"
                onClick={() => setStatus('Lunas')}
                className={`px-3 py-2 text-xs font-bold rounded-xl border text-center transition-all ${
                  status === 'Lunas'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Langsung Lunas (Sudah Bayar)
              </button>
            </div>
          </div>

          {/* Jika Langsung Lunas, tampilkan metode bayar */}
          {status === 'Lunas' && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Detail Pembayaran Langsung
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Tanggal Bayar</label>
                  <input
                    type="date"
                    value={tanggalBayar}
                    onChange={(e) => setTanggalBayar(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Metode Bayar</label>
                  <select
                    value={metodeBayar}
                    onChange={(e) => setMetodeBayar(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                  >
                    <option value="Tunai">💵 Tunai</option>
                    <option value="QRIS">📱 QRIS RT</option>
                    <option value="Transfer BCA">🏦 Transfer BCA</option>
                    <option value="Transfer Mandiri">🏦 Transfer Mandiri</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Catatan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Tambahan (Opsional)</label>
            <input
              type="text"
              placeholder="Contoh: Tagihan susulan atau denda keterlambatan"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
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
              className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
            >
              <Check className="w-4 h-4" />
              Simpan Tagihan Iuran
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}
