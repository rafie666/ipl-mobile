import React, { useState } from 'react'
import { 
  Key, 
  UserPlus, 
  Shield, 
  Building2, 
  User, 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  X, 
  Lock, 
  AtSign, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Building,
  Sparkles,
  Info,
  Phone
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { formatTanggalIndo } from '../../utils/formatters'

export default function DataAksesView() {
  const { 
    users, 
    rts, 
    currentUser, 
    addUserAccount, 
    updateUserAccount, 
    deleteUserAccount 
  } = useApp()

  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('ALL')
  
  // Modal Form State
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  
  // Form Fields
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('admin') // 'admin' | 'rt'
  const [selectedRtId, setSelectedRtId] = useState('rt-1')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleOpenAdd = () => {
    setEditItem(null)
    setUsername('')
    setPassword('')
    setPhone('')
    setRole('admin')
    setSelectedRtId(rts[0]?.id || 'rt-1')
    setShowPassword(false)
    setErrorMsg('')
    setModalOpen(true)
  }

  const handleOpenEdit = (u) => {
    const rtObj = rts.find(r => r.id === u.rt_id)
    setEditItem(u)
    setUsername(u.username || '')
    setPassword('')
    setPhone(u.phone || rtObj?.kontak || '')
    setRole(u.role || 'admin')
    setSelectedRtId(u.rt_id || rts[0]?.id || 'rt-1')
    setShowPassword(false)
    setErrorMsg('')
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setIsLoading(true)

    if (!username.trim()) {
      setErrorMsg('Username wajib diisi!')
      setIsLoading(false)
      return
    }

    if (!editItem && (!password || password.trim().length < 4)) {
      setErrorMsg('Kata sandi minimal 4 karakter!')
      setIsLoading(false)
      return
    }

    if (editItem) {
      const res = await updateUserAccount(editItem.id, {
        username: username.trim().toLowerCase(),
        password: password.trim() ? password.trim() : undefined,
        phone: phone.trim(),
        role: role,
        rt_id: role === 'rt' ? selectedRtId : null
      })
      setIsLoading(false)
      if (res.success) {
        setModalOpen(false)
      } else {
        setErrorMsg(res.message || 'Gagal memperbarui akun')
      }
    } else {
      const res = await addUserAccount({
        username: username.trim().toLowerCase(),
        password: password.trim(),
        phone: phone.trim(),
        role: role,
        rt_id: role === 'rt' ? selectedRtId : null
      })
      setIsLoading(false)
      if (res.success) {
        setModalOpen(false)
      } else {
        setErrorMsg(res.message || 'Gagal menambahkan akun')
      }
    }
  }

  // Filter List Akun
  const filteredUsers = (users || []).filter(u => {
    const matchSearch = (u.username || '').toLowerCase().includes(search.toLowerCase()) ||
                        (u.name || '').toLowerCase().includes(search.toLowerCase())
    const matchRole = filterRole === 'ALL' || u.role === filterRole
    return matchSearch && matchRole
  })

  return (
    <div className="space-y-6 animate-fade-in pb-12 font-sans">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-800">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold font-mono">
            <Key className="w-3.5 h-3.5 text-emerald-400" />
            <span>Manajemen Akses & Autentikasi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Data Akses Admin & Pengurus RT
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Kelola akun login untuk Super Admin, Pengurus RT, dan warga. Akun baru langsung aktif dan dapat digunakan untuk login.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Akun Akses Baru</span>
        </button>
      </div>

      {/* Main Content Box */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {/* Filter Controls */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900">
              Daftar Akun Pengguna ({filteredUsers.length})
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute inset-y-0 left-3 my-auto pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari username..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            {/* Role Filter */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Role</option>
              <option value="admin">Super Admin</option>
              <option value="rt">Pengurus RT</option>
              <option value="warga">Warga</option>
            </select>
          </div>
        </div>

        {/* Table of Users */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Username Akun</th>
                <th className="py-3 px-4">Role Akses</th>
                <th className="py-3 px-4">Wilayah RT Terkait</th>
                <th className="py-3 px-4">No. WhatsApp</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Dibuat</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400 font-medium">
                    Tidak ada akun yang sesuai pencarian.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const rtObj = rts.find(r => r.id === u.rt_id)
                  const displayPhone = u.phone || (u.role === 'rt' ? rtObj?.kontak : '')

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-mono font-bold text-xs">
                            <AtSign className="w-4 h-4 text-slate-400" />
                          </div>
                          <div>
                            <span className="font-mono text-slate-900">{u.username}</span>
                            <div className="text-[11px] text-slate-400 font-normal">
                              {u.name || '-'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {u.role === 'admin' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 font-extrabold text-[11px]">
                            <Shield className="w-3.5 h-3.5 text-purple-600" />
                            <span>Super Admin</span>
                          </span>
                        )}
                        {u.role === 'rt' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold text-[11px]">
                            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Pengurus RT</span>
                          </span>
                        )}
                        {u.role === 'warga' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 font-extrabold text-[11px]">
                            <User className="w-3.5 h-3.5 text-sky-600" />
                            <span>Warga</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {u.role === 'rt' ? (
                          <div className="flex flex-col gap-1 items-start">
                            <span className="font-semibold text-emerald-900 bg-emerald-100/70 px-2 py-0.5 rounded-md text-[11px]">
                              {rtObj ? `${rtObj.name} (RW ${rtObj.rw})` : u.rt_id || '-'}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded-md">
                              <Phone className="w-2.5 h-2.5 text-indigo-500" />
                              <span>Kontak Darurat RT</span>
                            </span>
                          </div>
                        ) : u.role === 'warga' ? (
                          <span className="text-slate-600 font-medium">
                            {rtObj ? rtObj.name : 'RT 01'}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Semua Wilayah</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {displayPhone ? (
                          <a 
                            href={`https://wa.me/${displayPhone.replace(/\D/g, '')}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{displayPhone}</span>
                          </a>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md text-[10px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>Aktif</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {u.created_at ? formatTanggalIndo(u.created_at.split('T')[0]) : 'Awal Sistem'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Akun"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteUserAccount(u.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Akun"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Modal Form Tambah / Edit Akun */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {editItem ? 'Edit Akun Akses' : 'Tambah Akun Akses Baru'}
                  </h3>
                  <p className="text-xs text-slate-500">Kredensial login & role otorisasi</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* Username Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <AtSign className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="contoh: rt02 atau admin_keuangan"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value.toLowerCase().replace(/\s+/g, '.'))
                      if (errorMsg) setErrorMsg('')
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    autoFocus
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Kata Sandi {editItem ? <span className="text-slate-400 font-normal">(Kosongkan jika tidak diubah)</span> : <span className="text-red-500">*</span>}
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!editItem}
                    placeholder={editItem ? '••••••••' : 'Minimal 4 karakter'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (errorMsg) setErrorMsg('')
                    }}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Role Akses
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      role === 'admin'
                        ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-500/50 text-purple-950 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-extrabold mb-0.5">
                      <Shield className="w-3.5 h-3.5 text-purple-600" />
                      <span>Super Admin</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-normal">Akses semua RT & sistem</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('rt')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      role === 'rt'
                        ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/50 text-emerald-950 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-extrabold mb-0.5">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Pengurus RT</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-normal">Khusus wilayah RT</div>
                  </button>
                </div>
              </div>

              {/* Kondisional: Kalo milih RT, muncul input baru Pilih RT */}
              {role === 'rt' && (
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-1.5 animate-in fade-in duration-150">
                  <label className="block text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Pilih Wilayah RT</span> <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedRtId}
                    onChange={(e) => setSelectedRtId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {(rts || []).map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name} - (RW {r.rw}) {r.keterangan ? `• ${r.keterangan}` : ''}
                      </option>
                    ))}
                  </select>
                  <div className="text-[10px] text-emerald-700">
                    Saat login dengan akun ini, otomatis masuk ke dashboard {rts.find(r => r.id === selectedRtId)?.name || 'RT'}.
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-indigo-900 bg-indigo-50/90 px-2.5 py-1.5 rounded-xl font-medium border border-indigo-200 mt-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Akun ini otomatis terdaftar sebagai <strong>Kontak Darurat</strong> khusus warga {rts.find(r => r.id === selectedRtId)?.name || 'RT'}.</span>
                  </div>
                </div>
              )}

              {/* No. WhatsApp / HP Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Nomor WhatsApp / HP</span>
                  </label>
                  {role === 'rt' && (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                      Untuk Konfirmasi Warga
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    placeholder="contoh: 081234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {role === 'rt' 
                    ? `Nomor ini otomatis terdaftar sebagai nomor Kontak Darurat resmi warga ${(rts || []).find(r => r.id === selectedRtId)?.name || 'RT'} dan tujuan konfirmasi WhatsApp.`
                    : 'Kontak nomor telepon/WhatsApp pemilik akun.'}
                </p>
              </div>

              {/* Footer Actions */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={isLoading}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 disabled:opacity-60 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{editItem ? 'Simpan Perubahan' : 'Buat Akun Akses'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  )
}
