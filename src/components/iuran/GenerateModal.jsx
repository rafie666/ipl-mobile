import React, { useState } from 'react'
import { X, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { formatRupiah, NAMA_BULAN } from '../../utils/formatters'

export default function GenerateModal({ isOpen, onClose }) {
  const { warga, tagihan, jenisIuran, generateTagihanMassal, rts, isRT, currentRT, isAdmin } = useApp()

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  const [bulan, setBulan] = useState(currentMonth)
  const [tahun, setTahun] = useState(currentYear)
  const [selectedRt, setSelectedRt] = useState(isRT ? (currentRT?.id || 'rt-1') : '')

  if (!isOpen) return null

  // Hitung tarif aktif
  const activeIuran = jenisIuran.filter(j => j.aktif)
  const tarifPerKK = activeIuran.reduce((acc, curr) => acc + curr.nominal, 0)
  
  // Hitung berapa warga yang belum punya tagihan di periode ini sesuai target RT
  const activeWarga = warga.filter(w => {
    if (!w.aktif) return false
    if (isRT) return w.rt_id === (currentRT?.id || 'rt-1')
    if (selectedRt) return w.rt_id === selectedRt
    return true
  })

  const alreadyBilledWargaCount = activeWarga.filter(w => 
    tagihan.some(t => t.wargaId === w.id && t.bulan === Number(bulan) && t.tahun === Number(tahun))
  ).length

  const targetCount = activeWarga.length - alreadyBilledWargaCount
  const totalEstimasiPenerimaan = targetCount * tarifPerKK

  const handleGenerate = (e) => {
    e.preventDefault()
    generateTagihanMassal(bulan, tahun, isRT ? (currentRT?.id || 'rt-1') : (selectedRt || null))
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-800">Generate Tagihan Bulanan Massal</h3>
              <p className="text-xs text-slate-500">Otomatis terbitkan invoice iuran untuk semua warga</p>
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
        <form onSubmit={handleGenerate} className="p-6 space-y-5">
          
          {/* Target Wilayah RT */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Target Wilayah Warga
            </label>
            {isAdmin ? (
              <select
                value={selectedRt}
                onChange={(e) => setSelectedRt(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              >
                <option value="">🌐 Semua Wilayah RT (Seluruh Lingkungan RW)</option>
                {(rts || []).map(r => (
                  <option key={r.id} value={r.id}>
                    🏢 Khusus {r.name} - (RW {r.rw})
                  </option>
                ))}
              </select>
            ) : (
              <div className="px-3.5 py-2.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-900 flex items-center justify-between">
                <span>Khusus Warga {currentRT?.name || 'RT Anda'}</span>
                <span className="text-[10px] bg-indigo-200/80 text-indigo-800 px-2 py-0.5 rounded font-mono">Wilayah RT</span>
              </div>
            )}
          </div>

          {/* Periode selector */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pilih Bulan
              </label>
              <select
                value={bulan}
                onChange={(e) => setBulan(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
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
                Pilih Tahun
              </label>
              <select
                value={tahun}
                onChange={(e) => setTahun(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              >
                {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Rincian Pos Iuran yang berlaku */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Pos Iuran Aktif ({activeIuran.length} Pos)
            </span>
            <div className="divide-y divide-slate-100 text-xs">
              {activeIuran.map(item => (
                <div key={item.id} className="py-1.5 flex justify-between items-center text-slate-700">
                  <span>{item.nama}</span>
                  <span className="font-semibold">{formatRupiah(item.nominal)}</span>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs font-bold text-slate-900">
              <span>Total Tarif / KK:</span>
              <span className="text-emerald-700">{formatRupiah(tarifPerKK)}</span>
            </div>
          </div>

          {/* Status Kalkulasi Target */}
          {targetCount > 0 ? (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900">
                <p className="font-bold">
                  {targetCount} Kepala Keluarga siap diterbitkan tagihannya!
                </p>
                <p className="text-emerald-700 mt-0.5">
                  Estimasi potensi iuran terkumpul: <span className="font-bold">{formatRupiah(totalEstimasiPenerimaan)}</span>.
                  {alreadyBilledWargaCount > 0 && ` (${alreadyBilledWargaCount} KK sudah memiliki tagihan sebelumnya).`}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900">
                <p className="font-bold">
                  Semua warga sudah memiliki tagihan untuk periode {NAMA_BULAN[bulan - 1]} {tahun}!
                </p>
                <p className="text-amber-700 mt-0.5">
                  Sistem mencegah duplikasi tagihan di bulan yang sama.
                </p>
              </div>
            </div>
          )}

          {/* Action buttons */}
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
              disabled={targetCount === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
            >
              <Sparkles className="w-4 h-4" />
              Terbitkan {targetCount} Tagihan Sekarang
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}
