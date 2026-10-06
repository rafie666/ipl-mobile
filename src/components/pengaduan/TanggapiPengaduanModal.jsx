import React, { useState } from 'react'
import { X, CheckCircle2, Clock, AlertCircle, MessageSquare, ShieldAlert, Ban } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function TanggapiPengaduanModal({ pengaduanItem, isOpen, onClose }) {
  const { updateStatusPengaduan } = useApp()

  const [status, setStatus] = useState(pengaduanItem?.status || 'Sedang Ditangani')
  const [tanggapan, setTanggapan] = useState(pengaduanItem?.tanggapan || '')

  if (!isOpen || !pengaduanItem) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    updateStatusPengaduan(pengaduanItem.id, status, tanggapan.trim())
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Tanggapi & Update Aduan Warga
              </h2>
              <p className="text-xs text-slate-500">
                Laporan: {pengaduanItem.judul}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ringkasan Laporan */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-[11px]">
            <span>Kategori: <strong className="text-slate-800">{pengaduanItem.kategori}</strong></span>
            <span>Lokasi: <strong className="text-slate-800">{pengaduanItem.lokasi}</strong></span>
          </div>
          <p className="text-slate-700 italic bg-white p-2.5 rounded-xl border border-slate-200/50">
            "{pengaduanItem.deskripsi}"
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Pilihan Status */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">Status Tindak Lanjut:</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { val: 'Menunggu Tindak Lanjut', label: '⏳ Menunggu', color: 'border-amber-200 bg-amber-50 text-amber-800' },
                { val: 'Sedang Ditangani', label: '🛠️ Sedang Ditangani', color: 'border-blue-200 bg-blue-50 text-blue-800' },
                { val: 'Selesai', label: '✅ Selesai Ditangani', color: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
                { val: 'Ditolak', label: '❌ Tidak Dapat Diproses', color: 'border-rose-200 bg-rose-50 text-rose-800' }
              ].map(opt => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setStatus(opt.val)}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                    status === opt.val 
                      ? `${opt.color} ring-2 ring-indigo-500 shadow-xs font-extrabold` 
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Catatan / Tanggapan Pengurus */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">
              Catatan / Tanggapan untuk Warga:
            </label>
            <textarea
              rows={3}
              placeholder="Contoh: Petugas teknisi lampu jalan sudah dihubungi, perbaikan dikerjakan hari ini..."
              value={tanggapan}
              onChange={(e) => setTanggapan(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all active:scale-[0.98] flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan Tanggapan</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
