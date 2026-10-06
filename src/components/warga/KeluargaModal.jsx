import React, { useState, useEffect } from 'react'
import { 
  X, 
  Users, 
  UserPlus, 
  User, 
  Trash2, 
  Edit2, 
  Check, 
  Plus, 
  AlertCircle, 
  ShieldCheck, 
  Calendar, 
  Heart, 
  Briefcase, 
  GraduationCap, 
  Phone,
  Droplet
} from 'lucide-react'
import { useApp } from '../../context/AppContext'

const HUBUNGAN_OPTIONS = [
  'Kepala Keluarga',
  'Istri',
  'Anak',
  'Orang Tua',
  'Mertua',
  'Famili Lain'
]

const PENDIDIKAN_OPTIONS = [
  'Belum Sekolah',
  'SD',
  'SMP',
  'SMA/SMK',
  'D3',
  'S1',
  'S2',
  'S3'
]

const AGAMA_OPTIONS = [
  'Islam',
  'Kristen Protestan',
  'Katolik',
  'Hindu',
  'Buddha',
  'Konghucu'
]

export default function KeluargaModal({ isOpen, onClose, targetWarga = null }) {
  const { currentWarga, currentUser, updateAnggotaKeluarga, showToast } = useApp()

  // Target warga: warga yang dipilih atau warga yang sedang login
  const warga = targetWarga || currentWarga

  const [members, setMembers] = useState([])
  const [editingIndex, setEditingIndex] = useState(null)
  const [isAdding, setIsAdding] = useState(false)

  // Member form state
  const [nama, setNama] = useState('')
  const [nik, setNik] = useState('')
  const [hubungan, setHubungan] = useState('Anak')
  const [jenisKelamin, setJenisKelamin] = useState('Laki-laki')
  const [tempatLahir, setTempatLahir] = useState('')
  const [tanggalLahir, setTanggalLahir] = useState('')
  const [agama, setAgama] = useState('Islam')
  const [pendidikan, setPendidikan] = useState('SMA/SMK')
  const [pekerjaan, setPekerjaan] = useState('')
  const [statusPernikahan, setStatusPernikahan] = useState('Belum Kawin')
  const [golonganDarah, setGolonganDarah] = useState('O')
  const [noHp, setNoHp] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (warga) {
      if (warga.anggotaKeluarga && warga.anggotaKeluarga.length > 0) {
        setMembers([...warga.anggotaKeluarga])
      } else {
        // Default minimal Kepala Keluarga
        setMembers([
          {
            id: `ak-${warga.id}-1`,
            nama: warga.nama || 'Kepala Keluarga',
            nik: warga.nik || '',
            hubungan: 'Kepala Keluarga',
            jenisKelamin: warga.jenisKelamin || 'Laki-laki',
            tempatLahir: 'Bogor',
            tanggalLahir: '1985-01-01',
            agama: warga.agama || 'Islam',
            pendidikan: 'SMA/SMK',
            pekerjaan: warga.pekerjaan || 'Wiraswasta',
            statusPernikahan: warga.statusPernikahan || 'Kawin',
            golonganDarah: 'O',
            noHp: warga.noHp || ''
          }
        ])
      }
      setIsAdding(false)
      setEditingIndex(null)
      setErrorMsg('')
    }
  }, [warga, isOpen])

  if (!isOpen || !warga) return null

  const resetForm = () => {
    setNama('')
    setNik('')
    setHubungan('Anak')
    setJenisKelamin('Laki-laki')
    setTempatLahir('')
    setTanggalLahir('')
    setAgama('Islam')
    setPendidikan('SMA/SMK')
    setPekerjaan('')
    setStatusPernikahan('Belum Kawin')
    setGolonganDarah('O')
    setNoHp('')
    setErrorMsg('')
    setIsAdding(false)
    setEditingIndex(null)
  }

  const handleStartAdd = () => {
    resetForm()
    setIsAdding(true)
  }

  const handleStartEdit = (index) => {
    const m = members[index]
    if (!m) return
    setNama(m.nama || '')
    setNik(m.nik || '')
    setHubungan(m.hubungan || 'Anak')
    setJenisKelamin(m.jenisKelamin || 'Laki-laki')
    setTempatLahir(m.tempatLahir || '')
    setTanggalLahir(m.tanggalLahir || '')
    setAgama(m.agama || 'Islam')
    setPendidikan(m.pendidikan || 'SMA/SMK')
    setPekerjaan(m.pekerjaan || '')
    setStatusPernikahan(m.statusPernikahan || 'Belum Kawin')
    setGolonganDarah(m.golonganDarah || 'O')
    setNoHp(m.noHp || '')
    setEditingIndex(index)
    setIsAdding(true)
    setErrorMsg('')
  }

  const handleDeleteMember = (index) => {
    if (members.length <= 1) {
      setErrorMsg('Data keluarga minimal harus memiliki 1 anggota keluarga!')
      return
    }
    const updated = members.filter((_, idx) => idx !== index)
    setMembers(updated)
    updateAnggotaKeluarga(warga.id, updated)
    if (editingIndex === index) {
      resetForm()
    }
  }

  const handleSaveMember = (e) => {
    e.preventDefault()
    if (!nama.trim()) {
      setErrorMsg('Nama lengkap anggota keluarga wajib diisi.')
      return
    }

    const payload = {
      id: editingIndex !== null ? members[editingIndex].id : `ak-${Date.now()}`,
      nama: nama.trim(),
      nik: nik.trim(),
      hubungan,
      jenisKelamin,
      tempatLahir: tempatLahir.trim(),
      tanggalLahir,
      agama,
      pendidikan,
      pekerjaan: pekerjaan.trim(),
      statusPernikahan,
      golonganDarah,
      noHp: noHp.trim()
    }

    let updated = []
    if (editingIndex !== null) {
      updated = members.map((m, idx) => idx === editingIndex ? payload : m)
    } else {
      updated = [...members, payload]
    }

    setMembers(updated)
    updateAnggotaKeluarga(warga.id, updated)
    resetForm()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Kelola Data Anggota Keluarga (KK)
              </h3>
              <p className="text-xs text-slate-500">
                Rumah Blok {warga.blok} No. {warga.noRumah} — {warga.nama} (Kode #{warga.kodeUnik})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto text-xs">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* List Anggota Keluarga Saat Ini */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                <span>Daftar Anggota Keluarga ({members.length} Orang)</span>
              </span>
              {!isAdding && (
                <button
                  type="button"
                  onClick={handleStartAdd}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Tambah Anggota</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {members.map((m, idx) => (
                <div 
                  key={m.id || idx} 
                  className={`p-3.5 rounded-2xl border transition-all ${
                    editingIndex === idx
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                      : 'border-slate-200/80 bg-slate-50/70 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm">{m.nama}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          m.hubungan === 'Kepala Keluarga'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : m.hubungan === 'Istri'
                            ? 'bg-rose-100 text-rose-800'
                            : m.hubungan === 'Anak'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {m.hubungan}
                        </span>
                      </div>
                      
                      <div className="text-[11px] text-slate-500 font-mono">
                        {m.nik ? `NIK: ${m.nik}` : 'NIK: Belum Diisi'}
                      </div>

                      <div className="text-[11px] text-slate-600 flex flex-wrap items-center gap-x-2 gap-y-0.5 pt-1">
                        <span>{m.jenisKelamin}</span>
                        <span>•</span>
                        <span>{m.pekerjaan || 'Belum Bekerja'}</span>
                        <span>•</span>
                        <span>Pendidikan: {m.pendidikan || '-'}</span>
                        {m.golonganDarah && m.golonganDarah !== '-' && (
                          <>
                            <span>•</span>
                            <span className="font-bold text-rose-600">Gol. Darah {m.golonganDarah}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(idx)}
                        className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Anggota Ini"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMember(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Anggota Ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Tambah / Edit Anggota Keluarga */}
          {isAdding && (
            <div className="p-4 bg-slate-50 border border-emerald-200 rounded-2xl space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-emerald-900 text-xs">
                  {editingIndex !== null ? '✏️ Edit Biodata Anggota Keluarga' : '➕ Tambah Anggota Keluarga Baru'}
                </span>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer"
                >
                  Tutup Form
                </button>
              </div>

              <form onSubmit={handleSaveMember} className="space-y-3.5">
                {/* Row 1: Nama & NIK */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Nama Lengkap Anggota <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Anisa Salsabila"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Nomor Induk Kependudukan (NIK)
                    </label>
                    <input
                      type="text"
                      maxLength={16}
                      placeholder="320101xxxxxxxxxx (16 digit)"
                      value={nik}
                      onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Row 2: Hubungan & Jenis Kelamin */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Hubungan Keluarga</label>
                    <select
                      value={hubungan}
                      onChange={(e) => setHubungan(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                    >
                      {HUBUNGAN_OPTIONS.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                    <select
                      value={jenisKelamin}
                      onChange={(e) => setJenisKelamin(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Golongan Darah</label>
                    <select
                      value={golonganDarah}
                      onChange={(e) => setGolonganDarah(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="AB">AB</option>
                      <option value="O">O</option>
                      <option value="-">Tidak Tahu / Belum Cek</option>
                    </select>
                  </div>
                </div>

                {/* Row 3: Tempat & Tanggal Lahir */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tempat Lahir</label>
                    <input
                      type="text"
                      placeholder="Contoh: Bogor / Jakarta"
                      value={tempatLahir}
                      onChange={(e) => setTempatLahir(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tanggal Lahir</label>
                    <input
                      type="date"
                      value={tanggalLahir}
                      onChange={(e) => setTanggalLahir(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Row 4: Pendidikan, Pekerjaan, Status Nikah */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Pendidikan Terakhir</label>
                    <select
                      value={pendidikan}
                      onChange={(e) => setPendidikan(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {PENDIDIKAN_OPTIONS.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Pekerjaan / Status</label>
                    <input
                      type="text"
                      placeholder="Contoh: Pelajar / Karyawan"
                      value={pekerjaan}
                      onChange={(e) => setPekerjaan(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Status Pernikahan</label>
                    <select
                      value={statusPernikahan}
                      onChange={(e) => setStatusPernikahan(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Belum Kawin">Belum Kawin</option>
                      <option value="Kawin">Kawin</option>
                      <option value="Cerai Hidup">Cerai Hidup</option>
                      <option value="Cerai Mati">Cerai Mati</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-3.5 py-2 text-slate-600 hover:bg-slate-200 rounded-xl font-semibold transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{editingIndex !== null ? 'Simpan Perubahan Anggota' : 'Tambahkan ke Daftar KK'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            *Data tersimpan otomatis dan menyinkronkan total jiwa kepala keluarga.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors cursor-pointer"
          >
            Selesai
          </button>
        </div>

      </div>
    </div>
  )
}
