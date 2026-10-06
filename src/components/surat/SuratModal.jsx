import React, { useState } from 'react'
import { X, FileText, CheckCircle2, AlertCircle, User, Home, Building2 } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const JENIS_SURAT_OPTIONS = [
  'Surat Pengantar KTP / KK',
  'Surat Keterangan Domisili',
  'Surat Pengantar SKCK',
  'Surat Keterangan Usaha (SKU)',
  'Surat Keterangan Belum Menikah',
  'Surat Izin Keramaian / Acara',
  'Surat Pengantar Nikah (N1-N4)',
  'Surat Keterangan Kematian / Duka',
  'Surat Keterangan Tidak Mampu (SKTM)',
  'Surat Pengantar Lainnya'
]

export default function SuratModal({ isOpen, onClose }) {
  const { currentWarga, currentUser, currentRT, ajukanSurat, config } = useApp()

  const [jenisSurat, setJenisSurat] = useState('Surat Pengantar KTP / KK')
  const [keperluan, setKeperluan] = useState('')
  const [nikPemohon, setNikPemohon] = useState('3201011204850001')
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!keperluan.trim()) {
      setErrorMsg('Maksud dan keperluan pengajuan surat wajib diisi.')
      return
    }
    if (!nikPemohon.trim()) {
      setErrorMsg('NIK Pemohon wajib diisi.')
      return
    }

    ajukanSurat({
      jenisSurat,
      keperluan: keperluan.trim(),
      nikPemohon: nikPemohon.trim()
    })

    setJenisSurat('Surat Pengantar KTP / KK')
    setKeperluan('')
    setErrorMsg('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 my-8 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Permohonan Surat Pengantar RT/RW
              </h2>
              <p className="text-xs text-slate-500">
                Pengajuan online langsung diproses oleh Ketua / Sekretaris RT
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

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Identitas Pemohon */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400">Data Pemohon Sesuai Akun</span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">Terverifikasi</span>
            </div>
            <div className="font-extrabold text-slate-900 text-sm">
              {currentWarga?.nama || currentUser?.name || 'Warga Lingkungan'}
            </div>
            <div className="text-slate-500 text-[11px] flex flex-wrap gap-x-3">
              <span>Unit: Blok {currentWarga?.blok || 'A'} No. {currentWarga?.noRumah || '01'}</span>
              <span>•</span>
              <span>Pekerjaan: {currentWarga?.pekerjaan || 'Karyawan Swasta'}</span>
            </div>
          </div>

          {/* NIK Pemohon */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">
              Nomor Induk Kependudukan (NIK) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="16 digit NIK pemohon pada KTP/KK"
              value={nikPemohon}
              onChange={(e) => {
                setNikPemohon(e.target.value)
                if (errorMsg) setErrorMsg('')
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Jenis Surat */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">
              Jenis Permohonan Surat <span className="text-rose-500">*</span>
            </label>
            <select
              value={jenisSurat}
              onChange={(e) => setJenisSurat(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {JENIS_SURAT_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Maksud & Keperluan */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">
              Maksud & Keperluan Surat <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder="Jelaskan untuk keperluan apa surat pengantar ini diajukan (contoh: Persyaratan pembuatan KTP baru di Kelurahan / pembukaan rekening bank)..."
              value={keperluan}
              onChange={(e) => {
                setKeperluan(e.target.value)
                if (errorMsg) setErrorMsg('')
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium resize-none"
            />
          </div>

          <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-xl text-[11px] text-emerald-800">
            ℹ️ <strong>Informasi:</strong> Setelah permohonan disetujui oleh Pengurus RT, surat pengantar resmi dapat langsung diunduh atau dicetak secara mandiri.
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
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all active:scale-[0.98] flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Kirim Permohonan</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
