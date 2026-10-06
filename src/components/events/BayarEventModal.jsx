import React, { useState, useEffect } from 'react'
import { X, CreditCard, Check, Calendar, MessageSquare, Trophy } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { formatRupiah } from '../../utils/formatters'

export default function BayarEventModal({ isOpen, onClose, targetItem = null, event = null }) {
  const { bayarTagihanEvent, warga } = useApp()

  const [tanggalBayar, setTanggalBayar] = useState(new Date().toISOString().slice(0, 10))
  const [metodeBayar, setMetodeBayar] = useState('Tunai')
  const [catatan, setCatatan] = useState('')

  useEffect(() => {
    if (isOpen) {
      setTanggalBayar(new Date().toISOString().slice(0, 10))
      setMetodeBayar('Tunai')
      setCatatan('')
    }
  }, [isOpen])

  if (!isOpen || !targetItem || !event) return null

  const targetWarga = warga.find(w => w.id === targetItem.wargaId) || {
    nama: 'Warga',
    blok: '-',
    noRumah: '-'
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    bayarTagihanEvent(targetItem.id, {
      tanggalBayar,
      metodeBayar,
      catatan
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-800">Catat Pembayaran Iuran Kegiatan</h3>
              <p className="text-xs text-slate-500">Pencatatan dana masuk untuk {event.judul}</p>
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
          
          <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200/80 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Kegiatan:</span>
              <span className="font-bold text-slate-900 truncate max-w-[200px]">{event.judul}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Warga:</span>
              <span className="font-bold text-slate-900">{targetWarga.nama}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Alamat:</span>
              <span className="font-semibold text-slate-700">Blok {targetWarga.blok} No. {targetWarga.noRumah}</span>
            </div>
            <div className="pt-2 mt-2 border-t border-amber-200 flex justify-between items-baseline">
              <span className="font-bold uppercase tracking-wider text-slate-700">Nominal Iuran:</span>
              <span className="text-lg font-extrabold text-amber-800 font-mono">
                {formatRupiah(targetItem.nominal)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Tanggal Terima
            </label>
            <input
              type="date"
              required
              value={tanggalBayar}
              onChange={(e) => setTanggalBayar(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Metode Pembayaran</label>
            <div className="grid grid-cols-2 gap-2">
              {['Tunai', 'QRIS', 'Transfer BCA', 'Transfer Mandiri'].map(m => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setMetodeBayar(m)}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border text-left flex items-center justify-between ${
                    metodeBayar === m 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{m}</span>
                  {metodeBayar === m && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              Catatan (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Titip di panitia lomba"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

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
              Konfirmasi Lunas
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}
