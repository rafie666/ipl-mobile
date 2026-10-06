import React, { useState, useEffect } from 'react'
import { 
  X, 
  UserPlus, 
  UserCheck, 
  Home, 
  Phone, 
  Users, 
  Briefcase, 
  Shield, 
  Key, 
  Lock, 
  AtSign, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  Building,
  Hash,
  Mail,
  Calendar,
  FileText,
  MapPin,
  Heart,
  MessageCircle
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { normalizeUsername } from '../../utils/crypto'
import { generateWaAkunWarga } from '../../utils/formatters'
import CoordinatePickerMap from './CoordinatePickerMap'

export default function WargaModal({ isOpen, onClose, editWarga = null }) {
  const { 
    rts, 
    warga,
    config,
    addWargaWithAccount, 
    updateWarga, 
    generateUniqueUsername, 
    isUsernameAvailable,
    generateUniqueKodeUnik
  } = useApp()

  const [activeFormTab, setActiveFormTab] = useState('identitas') // 'identitas' | 'lokasi' | 'biodata' | 'akun'

  // Tab 1: Identitas & Unit
  const [kodeUnik, setKodeUnik] = useState('')
  const [nama, setNama] = useState('')
  const [nik, setNik] = useState('')
  const [noKk, setNoKk] = useState('')
  const [rtId, setRtId] = useState('rt-1')
  const [blok, setBlok] = useState('A')
  const [noRumah, setNoRumah] = useState('')
  const [statusHuni, setStatusHuni] = useState('Tetap')
  const [statusKepemilikan, setStatusKepemilikan] = useState('Milik Sendiri')
  const [tglMasuk, setTglMasuk] = useState('')

  // Tab 2: Lokasi Koordinat GIS
  const [lat, setLat] = useState(-6.59715)
  const [lng, setLng] = useState(106.76415)

  // Tab 3: Biodata & Kontak
  const [jenisKelamin, setJenisKelamin] = useState('Laki-laki')
  const [agama, setAgama] = useState('Islam')
  const [statusPernikahan, setStatusPernikahan] = useState('Kawin')
  const [noHp, setNoHp] = useState('')
  const [email, setEmail] = useState('')
  const [pekerjaan, setPekerjaan] = useState('')
  const [kontakDaruratNama, setKontakDaruratNama] = useState('')
  const [kontakDaruratHubungan, setKontakDaruratHubungan] = useState('Istri')
  const [kontakDaruratHp, setKontakDaruratHp] = useState('')
  const [catatan, setCatatan] = useState('')

  // Tab 4: Akun Login Warga
  const [createAccount, setCreateAccount] = useState(true)
  const [username, setUsername] = useState('')
  const [isUsernameManuallyEdited, setIsUsernameManuallyEdited] = useState(false)
  const [password, setPassword] = useState('password')
  const [confirmPassword, setConfirmPassword] = useState('password')
  const [showPassword, setShowPassword] = useState(false)
  
  // Status feedback
  const [errorMsg, setErrorMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [createdAccountSuccess, setCreatedAccountSuccess] = useState(null)

  useEffect(() => {
    setCreatedAccountSuccess(null)
    if (editWarga) {
      setKodeUnik(editWarga.kodeUnik || '')
      setNama(editWarga.nama || '')
      setNik(editWarga.nik || '')
      setNoKk(editWarga.noKk || '')
      setRtId(editWarga.rt_id || 'rt-1')
      setBlok(editWarga.blok || 'A')
      setNoRumah(editWarga.noRumah || '')
      setStatusHuni(editWarga.statusHuni || 'Tetap')
      setStatusKepemilikan(editWarga.statusKepemilikan || (editWarga.statusHuni === 'Kontrak' ? 'Sewa / Kontrak' : 'Milik Sendiri'))
      setTglMasuk(editWarga.tglMasuk || '')

      setLat(editWarga.lat || -6.59715)
      setLng(editWarga.lng || 106.76415)

      setJenisKelamin(editWarga.jenisKelamin || 'Laki-laki')
      setAgama(editWarga.agama || 'Islam')
      setStatusPernikahan(editWarga.statusPernikahan || 'Kawin')
      setNoHp(editWarga.noHp || '')
      setEmail(editWarga.email || '')
      setPekerjaan(editWarga.pekerjaan || '')

      setKontakDaruratNama(editWarga.kontakDaruratNama || '')
      setKontakDaruratHubungan(editWarga.kontakDaruratHubungan || 'Istri')
      setKontakDaruratHp(editWarga.kontakDaruratHp || '')
      setCatatan(editWarga.catatan || '')

      setCreateAccount(false)
      setErrorMsg('')
    } else {
      const generatedCode = generateUniqueKodeUnik()
      setKodeUnik(generatedCode)
      setNama('')
      setNik('')
      setNoKk('')
      setRtId('rt-1')
      setBlok('A')
      setNoRumah('')
      setStatusHuni('Tetap')
      setStatusKepemilikan('Milik Sendiri')
      setTglMasuk(new Date().toISOString().slice(0, 10))

      setLat(-6.59715 - (warga.length * 0.0001))
      setLng(106.76415 + (warga.length * 0.00008))

      setJenisKelamin('Laki-laki')
      setAgama('Islam')
      setStatusPernikahan('Kawin')
      setNoHp('')
      setEmail('')
      setPekerjaan('')

      setKontakDaruratNama('')
      setKontakDaruratHubungan('Istri')
      setKontakDaruratHp('')
      setCatatan('')

      setCreateAccount(true)
      setUsername('')
      setIsUsernameManuallyEdited(false)
      setPassword('password')
      setConfirmPassword('password')
      setErrorMsg('')
    }
    setActiveFormTab('identitas')
  }, [editWarga, isOpen])

  // Auto-generate username dari nama KK jika belum diedit manual oleh admin
  const handleNamaChange = (val) => {
    setNama(val)
    if (!editWarga && !isUsernameManuallyEdited && createAccount) {
      const generated = generateUniqueUsername(val)
      setUsername(generated)
    }
    if (errorMsg) setErrorMsg('')
  }

  // Handle Blok change -> auto-suggest RT & coordinates
  const handleBlokChange = (val) => {
    setBlok(val)
    if (val === 'C') {
      setRtId('rt-2')
      if (!editWarga) { setLat(-6.59800); setLng(106.76410); }
    } else if (val === 'D') {
      setRtId('rt-3')
      if (!editWarga) { setLat(-6.59820); setLng(106.76490); }
    } else if (val === 'B') {
      setRtId('rt-1')
      if (!editWarga) { setLat(-6.59735); setLng(106.76475); }
    } else {
      setRtId('rt-1')
      if (!editWarga) { setLat(-6.59715); setLng(106.76415); }
    }
  }

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (!nama.trim()) {
      setErrorMsg('Nama Kepala Keluarga (KK) wajib diisi.')
      setActiveFormTab('identitas')
      return
    }
    if (!noRumah.trim()) {
      setErrorMsg('Nomor Rumah wajib diisi.')
      setActiveFormTab('identitas')
      return
    }

    if (!editWarga && createAccount) {
      if (!username.trim()) {
        setErrorMsg('Username akun warga wajib diisi.')
        setActiveFormTab('akun')
        return
      }
      if (!isUsernameAvailable(username)) {
        setErrorMsg(`Username "${username}" sudah dipakai. Silakan tentukan username lain.`)
        setActiveFormTab('akun')
        return
      }
      if (!password || password.length < 4) {
        setErrorMsg('Kata sandi akun minimal 4 karakter.')
        setActiveFormTab('akun')
        return
      }
      if (password !== confirmPassword) {
        setErrorMsg('Konfirmasi kata sandi tidak cocok dengan kata sandi yang dimasukkan.')
        setActiveFormTab('akun')
        return
      }
    }

    setIsLoading(true)

    const wargaPayload = {
      kodeUnik: kodeUnik ? kodeUnik.trim() : generateUniqueKodeUnik(),
      nama: nama.trim(),
      nik: nik.trim(),
      noKk: noKk.trim(),
      rt_id: rtId,
      blok: blok.toUpperCase().trim(),
      noRumah: noRumah.trim(),
      noHp: noHp.trim(),
      email: email.trim(),
      statusHuni,
      statusKepemilikan,
      tglMasuk: tglMasuk || new Date().toISOString().slice(0, 10),
      lat: Number(lat) || -6.59715,
      lng: Number(lng) || 106.76415,
      jenisKelamin,
      agama,
      statusPernikahan,
      pekerjaan: pekerjaan.trim(),
      kontakDaruratNama: kontakDaruratNama.trim(),
      kontakDaruratHubungan: kontakDaruratHubungan.trim(),
      kontakDaruratHp: kontakDaruratHp.trim(),
      catatan: catatan.trim(),
      ...(editWarga?.anggotaKeluarga ? { anggotaKeluarga: editWarga.anggotaKeluarga } : {})
    }

    if (editWarga) {
      updateWarga(editWarga.id, wargaPayload)
      setIsLoading(false)
      onClose()
    } else {
      const accountPayload = createAccount ? {
        createAccount: true,
        username: username.trim().toLowerCase(),
        password: password,
        confirmPassword: confirmPassword
      } : null

      const res = await addWargaWithAccount({
        wargaData: wargaPayload,
        accountData: accountPayload
      })

      setIsLoading(false)
      if (res.success) {
        if (createAccount && accountPayload) {
          setCreatedAccountSuccess({
            warga: wargaPayload,
            username: accountPayload.username,
            password: accountPayload.password,
            noHp: wargaPayload.noHp
          })
        } else {
          onClose()
        }
      } else {
        setErrorMsg(res.message)
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        
        {createdAccountSuccess ? (
          <div className="p-8 text-center space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Pendaftaran Warga & Akun Berhasil!
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Data warga <strong>{createdAccountSuccess.warga.nama}</strong> telah tersimpan dan akun portal warga langsung aktif.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl max-w-md mx-auto text-left space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Nama Warga:</span>
                <span className="font-bold text-slate-900">{createdAccountSuccess.warga.nama} (Blok {createdAccountSuccess.warga.blok}/{createdAccountSuccess.warga.noRumah})</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Nomor WhatsApp:</span>
                <span className="font-mono font-bold text-slate-800">{createdAccountSuccess.warga.noHp || '-'}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Username Login:</span>
                <span className="font-mono font-extrabold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-300">{createdAccountSuccess.username}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Kata Sandi:</span>
                <span className="font-mono font-extrabold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded border border-indigo-300">{createdAccountSuccess.password}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto">
              {createdAccountSuccess.warga.noHp ? (
                <a
                  href={generateWaAkunWarga(createdAccountSuccess.warga, createdAccountSuccess.username, createdAccountSuccess.password, config?.namaLingkungan)}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:flex-1 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Kirim Akun ke WA Warga</span>
                </a>
              ) : null}
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              {editWarga ? <UserCheck className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {editWarga ? 'Edit Biodata Lengkap Warga' : 'Pendaftaran Data Warga Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                {editWarga ? 'Perbarui informasi identitas, nomor kode unik & koordinat rumah' : 'Lengkapi data kependudukan, nomor kode unik & koordinat peta'}
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

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 bg-slate-100/70 px-4 pt-2 gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveFormTab('identitas')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all border-t border-x cursor-pointer ${
              activeFormTab === 'identitas'
                ? 'bg-white text-emerald-800 border-slate-200 border-b-white -mb-px shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            1. Unit & Identitas
          </button>
          <button
            type="button"
            onClick={() => setActiveFormTab('lokasi')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all border-t border-x cursor-pointer ${
              activeFormTab === 'lokasi'
                ? 'bg-white text-emerald-800 border-slate-200 border-b-white -mb-px shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            2. Koordinat Rumah
          </button>
          <button
            type="button"
            onClick={() => setActiveFormTab('biodata')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all border-t border-x cursor-pointer ${
              activeFormTab === 'biodata'
                ? 'bg-white text-emerald-800 border-slate-200 border-b-white -mb-px shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            3. Biodata & Kontak
          </button>
          {!editWarga && (
            <button
              type="button"
              onClick={() => setActiveFormTab('akun')}
              className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all border-t border-x cursor-pointer ${
                activeFormTab === 'akun'
                  ? 'bg-white text-emerald-800 border-slate-200 border-b-white -mb-px shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 border-transparent'
              }`}
            >
              4. Akun Login
            </button>
          )}
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Gagal Menyimpan: </span>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          
          {/* TAB 1: IDENTITAS & UNIT */}
          {activeFormTab === 'identitas' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Row Kode Unik & Nama Lengkap */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700 flex items-center gap-1">
                      <Hash className="w-3.5 h-3.5 text-emerald-600" />
                      Kode Unik Warga <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    placeholder="101"
                    value={kodeUnik}
                    onChange={(e) => setKodeUnik(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 bg-emerald-50/60 border border-emerald-300 rounded-xl font-mono font-black text-emerald-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-center"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">*Kode transfer unik iuran</span>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Kepala Keluarga (KK) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Bpk. Bambang Sutrisno"
                    value={nama}
                    onChange={(e) => handleNamaChange(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    autoFocus
                  />
                </div>
              </div>

              {/* Row NIK & No KK */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nomor Induk Kependudukan (NIK KTP)
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    placeholder="320101xxxxxxxxxx (16 digit)"
                    value={nik}
                    onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nomor Kartu Keluarga (No. KK)
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    placeholder="320101xxxxxxxxxx (16 digit)"
                    value={noKk}
                    onChange={(e) => setNoKk(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Row RT, Blok & No Rumah */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    Rukun Tetangga (RT) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={rtId}
                    onChange={(e) => setRtId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  >
                    {(rts || []).map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name} (RW {r.rw})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Home className="w-3.5 h-3.5 text-slate-400" />
                    Blok Rumah <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={blok}
                    onChange={(e) => handleBlokChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  >
                    {['A', 'B', 'C', 'D', 'E', 'F'].map(b => (
                      <option key={b} value={b}>Blok {b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nomor Rumah <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 01 atau 12A"
                    value={noRumah}
                    onChange={(e) => setNoRumah(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Row Status Huni, Kepemilikan & Tanggal Masuk */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Hunian</label>
                  <select
                    value={statusHuni}
                    onChange={(e) => {
                      setStatusHuni(e.target.value)
                      if (e.target.value === 'Kontrak') setStatusKepemilikan('Sewa / Kontrak')
                      else setStatusKepemilikan('Milik Sendiri')
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  >
                    <option value="Tetap">Warga Tetap</option>
                    <option value="Kontrak">Kontrak / Kost</option>
                    <option value="Kosong">Rumah Kosong</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Kepemilikan</label>
                  <select
                    value={statusKepemilikan}
                    onChange={(e) => setStatusKepemilikan(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  >
                    <option value="Milik Sendiri">Milik Sendiri</option>
                    <option value="Sewa / Kontrak">Sewa / Kontrak</option>
                    <option value="Rumah Dinas">Rumah Dinas</option>
                    <option value="Milik Keluarga">Milik Keluarga</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Mulai Menetap
                  </label>
                  <input
                    type="date"
                    value={tglMasuk}
                    onChange={(e) => setTglMasuk(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KOORDINAT RUMAH (GIS) */}
          {activeFormTab === 'lokasi' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1.5">
                <span className="font-bold text-emerald-950 block flex items-center gap-1.5 text-xs">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  Pencarian Lokasi & Geser Titik Koordinat Rumah (GIS)
                </span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Cari nama tempat/jalan seperti Google Maps atau ketik koordinat langsung. Geser pin logo peta (drag & drop) untuk mengatur titik presisi rumah warga.
                </p>
              </div>

              {/* Interactive Map with Google Maps Search & Draggable Pin */}
              <CoordinatePickerMap
                lat={lat}
                lng={lng}
                onChange={({ lat: newLat, lng: newLng }) => {
                  setLat(newLat)
                  setLng(newLng)
                }}
                height="320px"
              />

              {/* Koordinat Angka Input Manual */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                    Latitude (Garis Lintang)
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    placeholder="-6.59715"
                    value={lat}
                    onChange={(e) => setLat(parseFloat(e.target.value) || e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                    Longitude (Garis Bujur)
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    placeholder="106.76415"
                    value={lng}
                    onChange={(e) => setLng(parseFloat(e.target.value) || e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BIODATA & KONTAK */}
          {activeFormTab === 'biodata' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Row Jenis Kelamin, Agama, Status Nikah */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={jenisKelamin}
                    onChange={(e) => setJenisKelamin(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Agama</label>
                  <select
                    value={agama}
                    onChange={(e) => setAgama(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  >
                    <option value="Islam">Islam</option>
                    <option value="Kristen Protestan">Kristen Protestan</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Konghucu">Konghucu</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Pernikahan</label>
                  <select
                    value={statusPernikahan}
                    onChange={(e) => setStatusPernikahan(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  >
                    <option value="Kawin">Kawin</option>
                    <option value="Belum Kawin">Belum Kawin</option>
                    <option value="Cerai Hidup">Cerai Hidup</option>
                    <option value="Cerai Mati">Cerai Mati</option>
                  </select>
                </div>
              </div>

              {/* Row Kontak WA & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="tel"
                    placeholder="081234567890"
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    Alamat Email (Opsional)
                  </label>
                  <input
                    type="email"
                    placeholder="nama.warga@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Row Profesi */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  Profesi / Bidang Usaha
                </label>
                <input
                  type="text"
                  placeholder="Contoh: PNS / Wiraswasta / Karyawan"
                  value={pekerjaan}
                  onChange={(e) => setPekerjaan(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              {/* Kontak Darurat */}
              <div className="p-3.5 bg-rose-50/50 border border-rose-200/80 rounded-2xl space-y-2.5">
                <span className="font-bold text-rose-900 block flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-600" />
                  Kontak Darurat (Emergency Contact)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-1">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Nama Kerabat
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Ibu Lestari"
                      value={kontakDaruratNama}
                      onChange={(e) => setKontakDaruratNama(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Hubungan
                    </label>
                    <select
                      value={kontakDaruratHubungan}
                      onChange={(e) => setKontakDaruratHubungan(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Istri">Istri</option>
                      <option value="Suami">Suami</option>
                      <option value="Anak">Anak</option>
                      <option value="Orang Tua">Orang Tua</option>
                      <option value="Saudara">Saudara</option>
                      <option value="Kerabat Lain">Kerabat Lain</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      No. HP Darurat
                    </label>
                    <input
                      type="tel"
                      placeholder="081234567891"
                      value={kontakDaruratHp}
                      onChange={(e) => setKontakDaruratHp(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Catatan Khusus Pengurus */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  Catatan / Keterangan Khusus dari Pengurus RT
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Pengurus Seksi Keamanan RT / Tokoh Masyarakat..."
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-none"
                />
              </div>
            </div>
          )}

          {/* TAB 4: AKUN LOGIN WARGA (HANYA SAAT DAFTAR BARU) */}
          {!editWarga && activeFormTab === 'akun' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={createAccount}
                    onChange={(e) => setCreateAccount(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                  />
                  <div>
                    <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Buat Akun Portal Warga Otomatis</span>
                    </div>
                    <div className="text-[11px] text-emerald-700">
                      Warga dapat langsung login untuk cek tagihan & isi data anggota keluarga sendiri
                    </div>
                  </div>
                </label>
              </div>

              {createAccount && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-slate-700">
                        Username Akun Warga <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">Auto-format dari Nama KK</span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-600">
                        <AtSign className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required={createAccount}
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value.toLowerCase().replace(/\s+/g, '.'))
                          setIsUsernameManuallyEdited(true)
                        }}
                        placeholder="contoh: bambang.sutrisno"
                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Kata Sandi <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required={createAccount}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Minimal 4 karakter"
                          className="w-full pl-9 pr-9 py-2 bg-white border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Konfirmasi Sandi <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required={createAccount}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Ulangi kata sandi"
                          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer Navigation & Actions */}
          <div className="pt-4 flex items-center justify-between gap-2 border-t border-slate-100">
            <div>
              {activeFormTab !== 'identitas' ? (
                <button
                  type="button"
                  onClick={() => {
                    if (activeFormTab === 'akun') setActiveFormTab('biodata')
                    else if (activeFormTab === 'biodata') setActiveFormTab('lokasi')
                    else if (activeFormTab === 'lokasi') setActiveFormTab('identitas')
                  }}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  ← Kembali
                </button>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Batal
              </button>

              {activeFormTab !== (!editWarga ? 'akun' : 'biodata') ? (
                <button
                  type="button"
                  onClick={() => {
                    if (activeFormTab === 'identitas') {
                      if (!nama.trim() || !noRumah.trim()) {
                        setErrorMsg('Nama Kepala Keluarga dan Nomor Rumah wajib diisi!')
                        return
                      }
                      setErrorMsg('')
                      setActiveFormTab('lokasi')
                    } else if (activeFormTab === 'lokasi') {
                      setActiveFormTab('biodata')
                    } else if (activeFormTab === 'biodata') {
                      if (!editWarga) setActiveFormTab('akun')
                    }
                  }}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <span>Selanjutnya</span>
                  <span>→</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/20 disabled:opacity-60 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{editWarga ? 'Simpan Perubahan' : 'Simpan Data Warga'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

        </form>
          </>
        )}

      </div>
    </div>
  )
}
