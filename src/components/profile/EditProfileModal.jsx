import React, { useState, useEffect } from 'react'
import { 
  X, 
  User, 
  Phone, 
  Lock, 
  Briefcase, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  CreditCard, 
  Eye, 
  EyeOff,
  ShieldCheck,
  UserPlus,
  Edit2,
  Trash2,
  Calendar,
  GraduationCap,
  Heart,
  Droplet,
  Plus
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

export default function EditProfileModal({ isOpen, onClose }) {
  const { 
    currentUser, 
    currentWarga, 
    currentRT, 
    config, 
    updateUserProfile,
    updateAnggotaKeluarga,
    showToast,
    isWarga,
    isRT,
    isAdmin
  } = useApp()

  // Tabs for Warga: 'profil' | 'keluarga'
  const [activeTab, setActiveTab] = useState('profil')

  // Profile state
  const [name, setName] = useState('')
  const [noHp, setNoHp] = useState('')
  const [pekerjaan, setPekerjaan] = useState('')
  const [jumlahJiwa, setJumlahJiwa] = useState(3)
  const [kontakRt, setKontakRt] = useState('')
  const [rekeningBank, setRekeningBank] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Family members state
  const [members, setMembers] = useState([])
  const [editingMemberIndex, setEditingMemberIndex] = useState(null)
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [memberErrorMsg, setMemberErrorMsg] = useState('')

  // Member form state
  const [mNama, setMNama] = useState('')
  const [mNik, setMNik] = useState('')
  const [mHubungan, setMHubungan] = useState('Anak')
  const [mJenisKelamin, setMJenisKelamin] = useState('Laki-laki')
  const [mTempatLahir, setMTempatLahir] = useState('')
  const [mTanggalLahir, setMTanggalLahir] = useState('')
  const [mAgama, setMAgama] = useState('Islam')
  const [mPendidikan, setMPendidikan] = useState('SMA/SMK')
  const [mPekerjaan, setMPekerjaan] = useState('')
  const [mStatusPernikahan, setMStatusPernikahan] = useState('Belum Kawin')
  const [mGolonganDarah, setMGolonganDarah] = useState('O')
  const [mNoHp, setMNoHp] = useState('')

  useEffect(() => {
    if (isOpen && currentUser) {
      setName(currentUser.name || '')
      if (isWarga && currentWarga) {
        setNoHp(currentWarga.noHp || '')
        setPekerjaan(currentWarga.pekerjaan || '')
        setJumlahJiwa(currentWarga.jumlahJiwa || 1)

        if (currentWarga.anggotaKeluarga && currentWarga.anggotaKeluarga.length > 0) {
          setMembers([...currentWarga.anggotaKeluarga])
        } else {
          setMembers([
            {
              id: `ak-${currentWarga.id}-1`,
              nama: currentWarga.nama || 'Kepala Keluarga',
              nik: currentWarga.nik || '',
              hubungan: 'Kepala Keluarga',
              jenisKelamin: currentWarga.jenisKelamin || 'Laki-laki',
              tempatLahir: 'Bogor',
              tanggalLahir: '1985-01-01',
              agama: currentWarga.agama || 'Islam',
              pendidikan: 'SMA/SMK',
              pekerjaan: currentWarga.pekerjaan || 'Wiraswasta',
              statusPernikahan: currentWarga.statusPernikahan || 'Kawin',
              golonganDarah: 'O',
              noHp: currentWarga.noHp || ''
            }
          ])
        }
      } else if (isRT && currentRT) {
        setKontakRt(currentRT.kontak || config?.kontakRt || '')
        setRekeningBank(currentRT.rekening || config?.rekeningBank || '')
      } else if (isAdmin) {
        setKontakRt(config?.kontakRt || '')
        setRekeningBank(config?.rekeningBank || '')
      }

      setPassword('')
      setConfirmPassword('')
      setErrorMsg('')
      setActiveTab('profil')
      resetMemberForm()
    }
  }, [isOpen, currentUser, currentWarga, currentRT, config, isWarga, isRT, isAdmin])

  if (!isOpen || !currentUser) return null

  // Member form helpers
  const resetMemberForm = () => {
    setMNama('')
    setMNik('')
    setMHubungan('Anak')
    setMJenisKelamin('Laki-laki')
    setMTempatLahir('')
    setMTanggalLahir('')
    setMAgama('Islam')
    setMPendidikan('SMA/SMK')
    setMPekerjaan('')
    setMStatusPernikahan('Belum Kawin')
    setMGolonganDarah('O')
    setMNoHp('')
    setMemberErrorMsg('')
    setIsAddingMember(false)
    setEditingMemberIndex(null)
  }

  const handleStartAddMember = () => {
    resetMemberForm()
    setIsAddingMember(true)
  }

  const handleStartEditMember = (idx) => {
    const m = members[idx]
    if (!m) return
    setMNama(m.nama || '')
    setMNik(m.nik || '')
    setMHubungan(m.hubungan || 'Anak')
    setMJenisKelamin(m.jenisKelamin || 'Laki-laki')
    setMTempatLahir(m.tempatLahir || '')
    setMTanggalLahir(m.tanggalLahir || '')
    setMAgama(m.agama || 'Islam')
    setMPendidikan(m.pendidikan || 'SMA/SMK')
    setMPekerjaan(m.pekerjaan || '')
    setMStatusPernikahan(m.statusPernikahan || 'Belum Kawin')
    setMGolonganDarah(m.golonganDarah || 'O')
    setMNoHp(m.noHp || '')
    setEditingMemberIndex(idx)
    setIsAddingMember(true)
    setMemberErrorMsg('')
  }

  const handleDeleteMember = (idx) => {
    if (members.length <= 1) {
      setMemberErrorMsg('Keluarga minimal harus memiliki 1 anggota terdaftar!')
      return
    }
    const updated = members.filter((_, i) => i !== idx)
    setMembers(updated)
    setJumlahJiwa(updated.length)
    if (currentWarga) {
      updateAnggotaKeluarga(currentWarga.id, updated)
    }
    if (editingMemberIndex === idx) {
      resetMemberForm()
    }
  }

  const handleSaveMember = (e) => {
    e.preventDefault()
    if (!mNama.trim()) {
      setMemberErrorMsg('Nama anggota keluarga wajib diisi.')
      return
    }

    const payload = {
      id: editingMemberIndex !== null ? members[editingMemberIndex].id : `ak-${Date.now()}`,
      nama: mNama.trim(),
      nik: mNik.trim(),
      hubungan: mHubungan,
      jenisKelamin: mJenisKelamin,
      tempatLahir: mTempatLahir.trim(),
      tanggalLahir: mTanggalLahir,
      agama: mAgama,
      pendidikan: mPendidikan,
      pekerjaan: mPekerjaan.trim(),
      statusPernikahan: mStatusPernikahan,
      golonganDarah: mGolonganDarah,
      noHp: mNoHp.trim()
    }

    let updated = []
    if (editingMemberIndex !== null) {
      updated = members.map((m, i) => i === editingMemberIndex ? payload : m)
    } else {
      updated = [...members, payload]
    }

    setMembers(updated)
    setJumlahJiwa(updated.length)
    if (currentWarga) {
      updateAnggotaKeluarga(currentWarga.id, updated)
    }
    resetMemberForm()
  }

  // Handle Main Profile Submit
  const handleProfileSubmit = (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (!name.trim()) {
      setErrorMsg('Nama lengkap tidak boleh kosong.')
      return
    }

    if (password) {
      if (password.length < 4) {
        setErrorMsg('Kata sandi minimal 4 karakter.')
        return
      }
      if (password !== confirmPassword) {
        setErrorMsg('Konfirmasi kata sandi tidak cocok.')
        return
      }
    }

    updateUserProfile({
      name: name.trim(),
      noHp: noHp.trim(),
      pekerjaan: pekerjaan.trim(),
      jumlahJiwa: Number(jumlahJiwa),
      kontakRt: kontakRt.trim(),
      rekeningBank: rekeningBank.trim(),
      password: password ? password.trim() : undefined
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className={`bg-white rounded-3xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 my-8 space-y-5 transition-all ${
        isWarga && activeTab === 'keluarga' ? 'max-w-2xl' : 'max-w-lg'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
              isAdmin 
                ? 'bg-purple-100 text-purple-700' 
                : isRT 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-sky-100 text-sky-700'
            }`}>
              {isWarga && activeTab === 'keluarga' ? <Users className="w-5 h-5 text-emerald-600" /> : <User className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                {isWarga ? 'Pengaturan Akun & Data Keluarga' : 'Edit Profil & Akun'}
              </h2>
              <p className="text-xs text-slate-500">
                {isAdmin ? 'Pengaturan Akun Super Admin RW' : isRT ? `Pengaturan Pengurus ${currentRT?.name || 'RT'}` : `Rumah Blok ${currentWarga?.blok || 'A'}-${currentWarga?.noRumah || '01'} • ${currentUser?.name}`}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Box Akun */}
        <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-2xl flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Username Login</span>
            <span className="font-mono font-bold text-slate-800">{currentUser.username}</span>
          </div>
          <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
            isAdmin ? 'bg-purple-100 text-purple-800' : isRT ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'
          }`}>
            {isAdmin ? '👑 Super Admin' : isRT ? `🏢 ${currentRT?.name || 'Pengurus RT'}` : `🏠 Blok ${currentWarga?.blok || 'A'}-${currentWarga?.noRumah || '01'}`}
          </span>
        </div>

        {/* Tab Selector Khusus Warga */}
        {isWarga && (
          <div className="flex p-1 bg-slate-100 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('profil')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'profil'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Profil & Akun</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('keluarga')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'keluarga'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Anggota Keluarga ({members.length} Jiwa)</span>
            </button>
          </div>
        )}

        {/* TAB 1: FORM PROFIL & KEAMANAN */}
        {activeTab === 'profil' && (
          <>
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
              {/* Nama Lengkap */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  {isWarga ? 'Nama Kepala Keluarga (KK)' : isRT ? 'Nama Ketua RT' : 'Nama Lengkap Administrator'} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              {/* Form Fields Khusus Warga */}
              {isWarga && (
                <>
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">Nomor WhatsApp / HP</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="081234567890"
                        value={noHp}
                        onChange={(e) => setNoHp(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700 block">Pekerjaan</label>
                      <input
                        type="text"
                        placeholder="PNS / Swasta"
                        value={pekerjaan}
                        onChange={(e) => setPekerjaan(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700 block">Jumlah Jiwa Terdaftar</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          readOnly
                          value={members.length}
                          className="w-full px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600 font-mono font-bold cursor-not-allowed"
                        />
                        <button
                          type="button"
                          onClick={() => setActiveTab('keluarga')}
                          className="px-2.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-bold text-[11px] whitespace-nowrap cursor-pointer"
                        >
                          Kelola
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Form Fields Khusus RT & RW */}
              {(isRT || isAdmin) && (
                <>
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">
                      Nomor WhatsApp Resmi Pelayanan ({isRT ? currentRT?.name : 'RW'})
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="081234567890"
                        value={kontakRt}
                        onChange={(e) => setKontakRt(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      Nomor ini digunakan warga untuk konfirmasi iuran dan panggilan darurat.
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">
                      Rekening Bank Penerima Iuran Kas
                    </label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="BCA 8730192831 a.n Kas RT 01"
                        value={rekeningBank}
                        onChange={(e) => setRekeningBank(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Section Ganti Kata Sandi */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  Ubah Kata Sandi (Kosongkan jika tidak diubah)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1 relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Kata sandi baru..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="space-y-1">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Ulangi kata sandi baru..."
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all active:scale-[0.98] flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </>
        )}

        {/* TAB 2: KELOLA ANGGOTA KELUARGA (KHUSUS WARGA) */}
        {isWarga && activeTab === 'keluarga' && (
          <div className="space-y-4 text-xs animate-in fade-in duration-150">
            {memberErrorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{memberErrorMsg}</span>
                </div>
                <button type="button" onClick={() => setMemberErrorMsg('')} className="text-rose-700 font-bold">✕</button>
              </div>
            )}

            {/* Header List with Add Button */}
            <div className="flex items-center justify-between">
              <div>
                <span className="font-extrabold text-slate-800 text-sm block">
                  Daftar Anggota Keluarga ({members.length} Jiwa)
                </span>
                <span className="text-[11px] text-slate-500">
                  Data ini digunakan untuk pencatatan sensus kependudukan RT & iuran.
                </span>
              </div>
              {!isAddingMember && (
                <button
                  type="button"
                  onClick={handleStartAddMember}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Anggota</span>
                </button>
              )}
            </div>

            {/* Form Tambah / Edit Anggota */}
            {isAddingMember && (
              <form onSubmit={handleSaveMember} className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl space-y-3 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                  <span className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                    <UserPlus className="w-4 h-4 text-emerald-700" />
                    {editingMemberIndex !== null ? 'Edit Data Anggota Keluarga' : 'Tambah Anggota Keluarga Baru'}
                  </span>
                  <button
                    type="button"
                    onClick={resetMemberForm}
                    className="text-slate-400 hover:text-slate-700 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                      Nama Lengkap <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nama lengkap anggota..."
                      value={mNama}
                      onChange={(e) => setMNama(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                      NIK (Nomor Induk Kependudukan)
                    </label>
                    <input
                      type="text"
                      maxLength={16}
                      placeholder="3201xxxxxxxxxxxx"
                      value={mNik}
                      onChange={(e) => setMNik(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                      Hubungan Keluarga
                    </label>
                    <select
                      value={mHubungan}
                      onChange={(e) => setMHubungan(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {HUBUNGAN_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                      Jenis Kelamin
                    </label>
                    <select
                      value={mJenisKelamin}
                      onChange={(e) => setMJenisKelamin(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                      Tanggal Lahir
                    </label>
                    <input
                      type="date"
                      value={mTanggalLahir}
                      onChange={(e) => setMTanggalLahir(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                      Pekerjaan
                    </label>
                    <input
                      type="text"
                      placeholder="Pelajar / Karyawan / IRT"
                      value={mPekerjaan}
                      onChange={(e) => setMPekerjaan(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                      Pendidikan Terakhir
                    </label>
                    <select
                      value={mPendidikan}
                      onChange={(e) => setMPendidikan(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {PENDIDIKAN_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                      Nomor HP / WhatsApp
                    </label>
                    <input
                      type="text"
                      placeholder="0812xxxxxxxx"
                      value={mNoHp}
                      onChange={(e) => setMNoHp(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-emerald-200/50">
                  <button
                    type="button"
                    onClick={resetMemberForm}
                    className="px-3.5 py-1.5 bg-white text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold border border-slate-200 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{editingMemberIndex !== null ? 'Perbarui Anggota' : 'Tambahkan'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* List Members */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {members.map((m, idx) => {
                const isKepala = m.hubungan === 'Kepala Keluarga'
                const isIstri = m.hubungan === 'Istri'

                return (
                  <div
                    key={m.id || idx}
                    className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isKepala 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : isIstri 
                            ? 'bg-rose-100 text-rose-800' 
                            : 'bg-sky-100 text-sky-800'
                      }`}>
                        {isKepala ? 'KK' : isIstri ? 'IS' : 'AK'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 truncate">{m.nama}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isKepala
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : isIstri
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-slate-200 text-slate-700'
                          }`}>
                            {m.hubungan}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500 pt-0.5">
                          {m.nik && <span className="font-mono">NIK: {m.nik}</span>}
                          {m.jenisKelamin && <span>• {m.jenisKelamin}</span>}
                          {m.pekerjaan && <span>• {m.pekerjaan}</span>}
                          {m.noHp && <span className="font-mono text-emerald-700">📱 {m.noHp}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEditMember(idx)}
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-white rounded-lg transition-colors cursor-pointer"
                        title="Edit Data Anggota"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMember(idx)}
                        disabled={members.length <= 1}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Hapus Anggota"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Bottom Note & Close Button */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              <span>Perubahan anggota keluarga otomatis tersimpan di data profil rumah warga.</span>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
