import React, { useState, useEffect } from 'react'
import { X, Trophy, Image, Calendar, DollarSign, FileText, Upload, Trash2, Check, User, Users, Megaphone, Clock, Sparkles } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { compressImageFile } from '../../utils/imageCompressor'

const KATEGORI_EVENT = ['Pengumuman', 'Surat Edaran', 'Lomba', 'PHBI', 'Sosial', 'Fasilitas', 'Agustusan', 'Keamanan', 'Lain-lain']

export default function EventModal({ isOpen, onClose, editEvent = null }) {
  const { addEvent, updateEvent, showToast, isRT, currentRT, isAdmin, rts, warga, scopedWarga } = useApp()

  const [tipePengumuman, setTipePengumuman] = useState('info') // 'info' | 'iuran'
  const [targetType, setTargetType] = useState('all') // 'all' | 'personal'
  const [targetWargaId, setTargetWargaId] = useState('')
  const [judul, setJudul] = useState('')
  const [kategori, setKategori] = useState('Pengumuman')
  const [scope, setScope] = useState(isRT ? 'rt' : 'rw')
  const [targetRtId, setTargetRtId] = useState(isRT ? (currentRT?.id || 'rt-1') : (rts[0]?.id || 'rt-1'))
  const [nominalPerKK, setNominalPerKK] = useState('')
  const [batasTanggal, setBatasTanggal] = useState('')
  const [deskripsi, setDeskripsi] = useState('')
  const [posterUrl, setPosterUrl] = useState(null)

  // Auto-hapus / Expired states
  const [autoHapus, setAutoHapus] = useState(false)
  const [expiredDate, setExpiredDate] = useState('')
  const [expiredTime, setExpiredTime] = useState('23:59')

  const availableWarga = (isRT ? scopedWarga : warga) || []

  useEffect(() => {
    if (editEvent) {
      setJudul(editEvent.judul || '')
      setKategori(editEvent.kategori || 'Pengumuman')
      setScope(editEvent.scope || (isRT ? 'rt' : 'rw'))
      setTargetRtId(editEvent.rt_id || (isRT ? currentRT?.id : 'rt-1'))
      setTipePengumuman(editEvent.nominalPerKK && editEvent.nominalPerKK > 0 ? 'iuran' : 'info')
      setTargetType(editEvent.targetType || (editEvent.targetWargaId ? 'personal' : 'all'))
      setTargetWargaId(editEvent.targetWargaId || '')
      setNominalPerKK(editEvent.nominalPerKK || '')
      setBatasTanggal(editEvent.batasTanggal || '')
      setDeskripsi(editEvent.deskripsi || '')
      setPosterUrl(editEvent.posterUrl || null)
      
      setAutoHapus(!!editEvent.autoHapus)
      if (editEvent.expiredAt) {
        const parts = editEvent.expiredAt.split('T')
        setExpiredDate(parts[0] || editEvent.batasTanggal || '')
        setExpiredTime(parts[1]?.substring(0, 5) || '23:59')
      } else {
        setExpiredDate(editEvent.batasTanggal || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10))
        setExpiredTime('23:59')
      }
    } else {
      setJudul('')
      setKategori('Pengumuman')
      setScope(isRT ? 'rt' : 'rw')
      setTargetRtId(isRT ? (currentRT?.id || 'rt-1') : (rts[0]?.id || 'rt-1'))
      setTipePengumuman('info')
      setTargetType('all')
      setTargetWargaId(availableWarga[0]?.id || '')
      setNominalPerKK('')
      const defaultDate = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10)
      setBatasTanggal(defaultDate)
      setDeskripsi('')
      setPosterUrl(null)
      setAutoHapus(false)
      setExpiredDate(defaultDate)
      setExpiredTime('23:59')
    }
  }, [editEvent, isOpen, isRT, currentRT, rts])

  if (!isOpen) return null

  // Handler file gambar poster
  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      showToast('Ukuran gambar maksimal 5MB', 'error')
      return
    }

    try {
      const compressedDataUrl = await compressImageFile(file, 1200, 1200, 0.75)
      setPosterUrl(compressedDataUrl)
    } catch (err) {
      showToast('Gagal memproses gambar: ' + (err.message || 'Format tidak valid'), 'error')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!judul.trim()) {
      showToast('Judul pengumuman/kegiatan wajib diisi', 'error')
      return
    }

    if (targetType === 'personal' && !targetWargaId) {
      showToast('Pilih nama warga penerima pesan perorangan', 'error')
      return
    }

    const finalScope = isRT ? 'rt' : scope
    const finalRtId = isRT ? (currentRT?.id || 'rt-1') : (finalScope === 'rt' ? targetRtId : null)
    const finalNominal = tipePengumuman === 'iuran' ? (Number(nominalPerKK) || 0) : 0

    let finalExpiredAt = null
    if (autoHapus) {
      const eDate = expiredDate || batasTanggal || new Date().toISOString().slice(0, 10)
      const eTime = expiredTime || '23:59'
      finalExpiredAt = `${eDate}T${eTime}:00`
    }

    const payload = {
      judul: judul.trim(),
      kategori,
      scope: finalScope,
      rt_id: finalRtId,
      targetType,
      targetWargaId: targetType === 'personal' ? targetWargaId : null,
      nominalPerKK: finalNominal,
      batasTanggal: batasTanggal || new Date().toISOString().slice(0, 10),
      deskripsi: deskripsi.trim(),
      posterUrl,
      autoHapus,
      expiredAt: finalExpiredAt
    }

    if (editEvent) {
      updateEvent(editEvent.id, payload)
      showToast('Pengumuman / Kegiatan berhasil diperbarui', 'success')
    } else {
      addEvent(payload)
      showToast(
        targetType === 'personal'
          ? 'Pengumuman khusus perorangan berhasil dikirim!'
          : 'Pengumuman berhasil disiarkan ke seluruh warga!',
        'success'
      )
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <Megaphone className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                {editEvent ? 'Edit Pengumuman / Kegiatan' : 'Buat Pengumuman / Kegiatan Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                {isRT ? `Dari Pengurus ${currentRT?.name || 'RT'}` : 'Dari Pengurus RW / RT'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Tingkat Penyelenggara (RW vs RT) */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Tingkat Penyelenggara <span className="text-rose-500">*</span>
            </label>
            {isRT ? (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-100/70 p-2 rounded-lg">
                <span>📍 Pengumuman Resmi {currentRT?.name || 'RT'}</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setScope('rw')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                    scope === 'rw'
                      ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  🏢 Tingkat RW
                </button>
                <button
                  type="button"
                  onClick={() => setScope('rt')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                    scope === 'rt'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  🏘️ Tingkat RT Spesifik
                </button>
              </div>
            )}

            {!isRT && scope === 'rt' && (
              <div className="pt-1">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Pilih RT Penyelenggara:
                </label>
                <select
                  value={targetRtId}
                  onChange={(e) => setTargetRtId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {rts.map(r => (
                    <option key={r.id} value={r.id}>{r.name} (Ketua: {r.ketua || r.leader_name || '-'})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Sasaran Penerima: Seluruh Warga vs Perorangan */}
          <div className="p-3 bg-amber-50/50 border border-amber-200/80 rounded-xl space-y-2">
            <label className="block text-xs font-bold text-amber-900 flex items-center justify-between">
              <span>Sasaran Penerima Pengumuman <span className="text-rose-500">*</span></span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTargetType('all')}
                className={`py-2 px-3 text-xs font-bold rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                  targetType === 'all'
                    ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>📢 Seluruh Warga</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTargetType('personal')
                  if (!targetWargaId && availableWarga[0]) {
                    setTargetWargaId(availableWarga[0].id)
                  }
                }}
                className={`py-2 px-3 text-xs font-bold rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                  targetType === 'personal'
                    ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>👤 Perorangan (Pribadi)</span>
              </button>
            </div>

            {targetType === 'personal' && (
              <div className="pt-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Pilih Warga Penerima Surat / Pesan:
                </label>
                <select
                  value={targetWargaId}
                  onChange={(e) => setTargetWargaId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {availableWarga.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.nama} - Blok {w.blok} No. {w.noRumah} ({w.noHp || 'No HP -'})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-amber-700 mt-1">
                  *Pengumuman ini hanya akan dapat dilihat oleh akun warga tersebut di dashboard & menu pengumumannya.
                </p>
              </div>
            )}
          </div>

          {/* Jenis Pengumuman: Info Biasa vs Iuran / Lomba */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Jenis Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTipePengumuman('info')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                  tipePengumuman === 'info'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Surat / Info (Gratis)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTipePengumuman('iuran')
                  if (!nominalPerKK) setNominalPerKK(50000)
                }}
                className={`py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                  tipePengumuman === 'iuran'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Lomba / Iuran</span>
              </button>
            </div>
          </div>

          {/* Judul Acara / Pengumuman */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Judul Pengumuman / Kegiatan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={tipePengumuman === 'info' ? "Contoh: Surat Edaran Kerja Bakti & Jadwal Fogging" : "Contoh: Semarak Lomba 17 Agustus 2026"}
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
          </div>

          {/* Kategori & Batas Waktu */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kategori
              </label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              >
                {KATEGORI_EVENT.map(kat => (
                  <option key={kat} value={kat}>{kat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Tanggal Pelaksanaan / Batas
              </label>
              <input
                type="date"
                required
                value={batasTanggal}
                onChange={(e) => setBatasTanggal(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Nominal Iuran per KK (jika tipe iuran) */}
          {tipePengumuman === 'iuran' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nominal Iuran per KK (Rp) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1000"
                step="1000"
                required
                placeholder="50000"
                value={nominalPerKK}
                onChange={(e) => setNominalPerKK(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
            </div>
          )}

          {/* Pengaturan Auto Hapus / Kedaluwarsa Otomatis */}
          <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
                  <Clock className="w-4 h-4" />
                </span>
                <div>
                  <label className="text-xs font-bold text-slate-800 block">
                    Hapus Otomatis (Auto-Delete)
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Hapus pengumuman secara otomatis setelah tanggal & jam berakhir
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoHapus}
                  onChange={(e) => setAutoHapus(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>

            {autoHapus && (
              <div className="pt-2 border-t border-amber-200/60 space-y-2.5 animate-in fade-in duration-200">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Tanggal Hapus <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required={autoHapus}
                      value={expiredDate}
                      onChange={(e) => setExpiredDate(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Jam Hapus (WIB) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="time"
                      required={autoHapus}
                      value={expiredTime}
                      onChange={(e) => setExpiredTime(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] text-slate-500 font-bold">Preset Cepat:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date()
                      d.setDate(d.getDate() + 1)
                      setExpiredDate(d.toISOString().slice(0, 10))
                    }}
                    className="px-2 py-0.5 bg-white hover:bg-amber-100 text-slate-700 text-[10px] font-bold rounded-md border border-slate-200 transition-colors"
                  >
                    +1 Hari
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date()
                      d.setDate(d.getDate() + 3)
                      setExpiredDate(d.toISOString().slice(0, 10))
                    }}
                    className="px-2 py-0.5 bg-white hover:bg-amber-100 text-slate-700 text-[10px] font-bold rounded-md border border-slate-200 transition-colors"
                  >
                    +3 Hari
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date()
                      d.setDate(d.getDate() + 7)
                      setExpiredDate(d.toISOString().slice(0, 10))
                    }}
                    className="px-2 py-0.5 bg-white hover:bg-amber-100 text-slate-700 text-[10px] font-bold rounded-md border border-slate-200 transition-colors"
                  >
                    +7 Hari
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Upload Poster / Foto Surat Edaran (Opsional) */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Image className="w-4 h-4 text-amber-600" />
                Lampiran Foto / Poster Edaran <span className="text-slate-400 font-normal">(Opsional)</span>
              </label>
              {posterUrl && (
                <button
                  type="button"
                  onClick={() => setPosterUrl(null)}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Hapus Foto
                </button>
              )}
            </div>

            {posterUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-300 max-h-48 bg-slate-900 flex items-center justify-center group">
                <img
                  src={posterUrl}
                  alt="Preview Poster"
                  className="max-h-48 w-full object-contain"
                />
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <label className="px-3 py-1.5 bg-white text-slate-800 text-xs font-bold rounded-lg cursor-pointer shadow">
                    Ganti Gambar
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-amber-500 bg-white rounded-xl cursor-pointer transition-colors text-center">
                <Upload className="w-6 h-6 text-slate-400 mb-1" />
                <span className="text-xs font-bold text-slate-700">Pilih Foto Poster / Pamflet</span>
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

          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Isi Pengumuman / Detail Acara
            </label>
            <textarea
              rows={3}
              placeholder="Tuliskan isi pengumuman atau himbauan untuk warga..."
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
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
              className="flex items-center gap-1.5 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-600/20"
            >
              <Check className="w-4 h-4" />
              {editEvent ? 'Simpan Perubahan' : 'Siarkan Pengumuman'}
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}
