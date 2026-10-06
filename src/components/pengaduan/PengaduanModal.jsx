import React, { useState } from 'react'
import { X, MessageSquarePlus, MapPin, AlertCircle, Upload, CheckCircle2, Image as ImageIcon } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { compressImageFile } from '../../utils/imageCompressor'

const KATEGORI_OPTIONS = [
  'Fasilitas & Lampu Jalan',
  'Kebersihan & Sampah',
  'Saluran Air & Drainase',
  'Keamanan & Ketertiban',
  'Kebisingan & Kenyamanan',
  'Fasum / Taman Warga',
  'Lain-lain'
]

export default function PengaduanModal({ isOpen, onClose }) {
  const { currentWarga, currentUser, tambahPengaduan, showToast } = useApp()

  const [judul, setJudul] = useState('')
  const [kategori, setKategori] = useState('Fasilitas & Lampu Jalan')
  const [lokasi, setLokasi] = useState(
    currentWarga ? `Blok ${currentWarga.blok} No. ${currentWarga.noRumah}` : ''
  )
  const [deskripsi, setDeskripsi] = useState('')
  const [fotoUrl, setFotoUrl] = useState('')
  const [previewName, setPreviewName] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen) return null

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Ukuran file foto maksimal 5MB')
        return
      }
      try {
        const compressedDataUrl = await compressImageFile(file, 1200, 1200, 0.75)
        setFotoUrl(compressedDataUrl)
        setPreviewName(file.name)
        setErrorMsg('')
      } catch (err) {
        setErrorMsg('Gagal memproses gambar: ' + (err.message || 'Format tidak valid'))
      }
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!judul.trim()) {
      setErrorMsg('Judul laporan keluhan wajib diisi.')
      return
    }
    if (!deskripsi.trim()) {
      setErrorMsg('Deskripsi permasalahan wajib diisi secara jelas.')
      return
    }

    tambahPengaduan({
      judul: judul.trim(),
      kategori,
      lokasi: lokasi.trim() || `Blok ${currentWarga?.blok || 'A'} No. ${currentWarga?.noRumah || '01'}`,
      deskripsi: deskripsi.trim(),
      fotoUrl
    })

    // Reset & close
    setJudul('')
    setKategori('Fasilitas & Lampu Jalan')
    setDeskripsi('')
    setFotoUrl('')
    setPreviewName('')
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
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Buat Laporan / Keluhan Warga
              </h2>
              <p className="text-xs text-slate-500">
                Sampaikan kendala fasilitas atau lingkungan kepada Pengurus RT
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
          {/* Identitas Pelapor */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Pelapor</span>
              <span className="font-bold text-slate-800 text-sm">{currentWarga?.nama || currentUser?.name || 'Warga Lingkungan'}</span>
            </div>
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[11px]">
              Blok {currentWarga?.blok || 'A'} No. {currentWarga?.noRumah || '01'}
            </span>
          </div>

          {/* Judul Laporan */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">
              Judul Permasalahan / Aduan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Lampu penerangan jalan mati di depan Blok A-02"
              value={judul}
              onChange={(e) => {
                setJudul(e.target.value)
                if (errorMsg) setErrorMsg('')
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          {/* Kategori & Lokasi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Kategori Masalah</label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium cursor-pointer"
              >
                {KATEGORI_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Lokasi Spesifik</label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Contoh: Depan rumah No. 02"
                  value={lokasi}
                  onChange={(e) => setLokasi(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Deskripsi Lengkap */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">
              Deskripsi Masalah <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder="Ceritakan detail kendala, sejak kapan terjadi, dan dampak yang dirasakan..."
              value={deskripsi}
              onChange={(e) => {
                setDeskripsi(e.target.value)
                if (errorMsg) setErrorMsg('')
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium resize-none"
            />
          </div>

          {/* Upload Foto / Bukti Pendukung */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">
              Foto Bukti Pendukung <span className="text-slate-400 font-normal">(Opsional)</span>
            </label>
            <div className="border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-2xl p-4 text-center bg-slate-50/60 transition-colors">
              {fotoUrl ? (
                <div className="space-y-2">
                  <img 
                    src={fotoUrl} 
                    alt="Preview" 
                    className="max-h-32 mx-auto rounded-lg object-cover border border-slate-200 shadow-2xs" 
                  />
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-[11px] text-slate-600 font-mono truncate max-w-[200px]">{previewName || 'Foto terpilih'}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setFotoUrl('')
                        setPreviewName('')
                      }}
                      className="text-rose-600 font-bold hover:underline text-[11px]"
                    >
                      Hapus Foto
                    </button>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer block space-y-1">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                  <span className="text-xs font-bold text-emerald-700 block">Klik untuk pilih foto kendala</span>
                  <span className="text-[10px] text-slate-400 block">Format JPG, PNG (Maksimal 2MB)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
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
              <span>Kirim Laporan</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
