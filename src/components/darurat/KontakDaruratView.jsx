import React, { useState } from 'react'
import { 
  PhoneCall, 
  ShieldAlert, 
  HeartPulse, 
  Flame, 
  BadgeAlert, 
  MessageCircle, 
  Phone, 
  User, 
  Shield, 
  AlertTriangle,
  MapPin,
  Clock,
  Sparkles,
  Edit2,
  Trash2,
  Plus,
  RotateCcw,
  X,
  CheckCircle2,
  Building2
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { INITIAL_KONTAK_DARURAT } from '../../data/initialData'

const KATEGORI_OPTIONS = [
  'Kepolisian',
  'Medis & Kesehatan',
  'Kebakaran & Penyelamatan',
  'Panggilan Darurat Nasional',
  'Keamanan Lingkungan',
  'Pengurus Lingkungan',
  'Layanan Publik'
]

export default function KontakDaruratView() {
  const { 
    kontakDarurat, 
    scopedKontakDarurat,
    updateKontakDarurat, 
    addKontakDarurat, 
    deleteKontakDarurat, 
    resetKontakDarurat,
    config, 
    currentRT,
    currentWarga,
    currentUser,
    isAdminLoggedIn,
    isAdmin,
    isRT,
    isWarga,
    rts
  } = useApp()

  const canEdit = isAdminLoggedIn || isAdmin || isRT

  const allContacts = (kontakDarurat && kontakDarurat.length > 0) ? kontakDarurat : INITIAL_KONTAK_DARURAT

  // Filter tab untuk admin (ALL | UMUM | rt-1 | rt-2 | rt-3)
  const [filterRt, setFilterRt] = useState('ALL')

  // Wilayah RT pengguna aktif saat ini
  const userRtId = currentUser?.role === 'warga' 
    ? (currentWarga?.rt_id || currentUser?.rt_id || 'rt-1') 
    : (currentUser?.rt_id || currentRT?.id || 'rt-1')

  const userRtObj = (rts || []).find(r => r.id === userRtId)

  // Scoping list:
  // - Admin melihat seluruh kontak (dapat difilter per tab RT)
  // - Warga & RT HANYA melihat kontak umum/nasional + kontak khusus RT domisili mereka
  const contactsList = isAdmin 
    ? (filterRt === 'ALL' 
        ? allContacts 
        : filterRt === 'UMUM' 
          ? allContacts.filter(c => !c.rt_id) 
          : allContacts.filter(c => c.rt_id === filterRt))
    : (scopedKontakDarurat && scopedKontakDarurat.length > 0
        ? scopedKontakDarurat
        : allContacts.filter(c => !c.rt_id || c.rt_id === userRtId))

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [nama, setNama] = useState('')
  const [kategori, setKategori] = useState('Kepolisian')
  const [nomor, setNomor] = useState('')
  const [wa, setWa] = useState('')
  const [deskripsi, setDeskripsi] = useState('')
  const [urgent, setUrgent] = useState(true)
  const [selectedRtScope, setSelectedRtScope] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const handleOpenAdd = () => {
    setEditingId(null)
    setNama('')
    setKategori('Kepolisian')
    setNomor('')
    setWa('')
    setDeskripsi('')
    setUrgent(true)
    setSelectedRtScope(isRT ? (currentRT?.id || currentUser?.rt_id || 'rt-1') : '')
    setErrorMsg('')
    setModalOpen(true)
  }

  const handleOpenEdit = (c) => {
    setEditingId(c.id)
    setNama(c.nama || '')
    setKategori(c.kategori || 'Kepolisian')
    setNomor(c.nomor || '')
    setWa(c.wa || '')
    setDeskripsi(c.deskripsi || '')
    setUrgent(Boolean(c.urgent))
    setSelectedRtScope(c.rt_id || '')
    setErrorMsg('')
    setModalOpen(true)
  }

  const handleSave = (e) => {
    e.preventDefault()
    if (!nama.trim() || !nomor.trim()) {
      setErrorMsg('Nama layanan dan nomor telepon darurat wajib diisi.')
      return
    }

    // Tentukan warna dan ikon berdasarkan kategori
    let color = 'bg-slate-50 text-slate-800 border-slate-200'
    let iconName = 'PhoneCall'

    if (kategori === 'Kepolisian') {
      color = 'bg-sky-50 text-sky-800 border-sky-200'
      iconName = 'BadgeAlert'
    } else if (kategori === 'Medis & Kesehatan') {
      color = 'bg-rose-50 text-rose-800 border-rose-200'
      iconName = 'HeartPulse'
    } else if (kategori === 'Kebakaran & Penyelamatan') {
      color = 'bg-amber-50 text-amber-900 border-amber-200'
      iconName = 'Flame'
    } else if (kategori === 'Panggilan Darurat Nasional') {
      color = 'bg-red-50 text-red-800 border-red-200'
      iconName = 'ShieldAlert'
    } else if (kategori === 'Keamanan Lingkungan') {
      color = 'bg-emerald-50 text-emerald-800 border-emerald-200'
      iconName = 'Shield'
    } else if (kategori === 'Pengurus Lingkungan') {
      color = 'bg-indigo-50 text-indigo-800 border-indigo-200'
      iconName = 'User'
    }

    const payload = {
      nama: nama.trim(),
      kategori,
      nomor: nomor.trim(),
      wa: wa.trim(),
      deskripsi: deskripsi.trim(),
      urgent,
      color,
      icon: iconName,
      rt_id: isRT ? (currentRT?.id || currentUser?.rt_id || 'rt-1') : (selectedRtScope || null)
    }

    if (editingId) {
      updateKontakDarurat(editingId, payload)
    } else {
      addKontakDarurat(payload)
    }

    setModalOpen(false)
  }

  const handleDelete = (id, cNama) => {
    if (confirm(`Apakah Anda yakin ingin menghapus nomor darurat ${cNama}?`)) {
      deleteKontakDarurat(id)
    }
  }

  const getCleanPhone = (phone) => {
    if (!phone) return ''
    let clean = phone.replace(/\D/g, '')
    if (clean.startsWith('0')) clean = '62' + clean.slice(1)
    return clean
  }

  const getIconComponent = (item) => {
    if (item.kategori === 'Kepolisian') return BadgeAlert
    if (item.kategori === 'Medis & Kesehatan') return HeartPulse
    if (item.kategori === 'Kebakaran & Penyelamatan') return Flame
    if (item.kategori === 'Panggilan Darurat Nasional') return ShieldAlert
    if (item.kategori === 'Keamanan Lingkungan') return Shield
    if (item.kategori === 'Pengurus Lingkungan') return User
    return PhoneCall
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-900 via-red-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-rose-900/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-200 border border-rose-500/30 text-xs font-bold font-mono">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Emergency Quick Dial • Bantuan Cepat 24 Jam</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Direktori Kontak Darurat Lingkungan
            </h1>
            <p className="text-xs sm:text-sm text-rose-100/80 leading-relaxed">
              Hubungi polisi (110), ambulans (119), damkar (113), darurat terpadu (112), serta pos satpam keamanan dalam satu sentuhan cepat.
            </p>
          </div>

          {/* Admin Management Buttons */}
          {canEdit && (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleOpenAdd}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Kontak</span>
              </button>
              <button
                type="button"
                onClick={resetKontakDarurat}
                className="px-3 py-2 bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                title="Reset kembali ke nomor darurat standar (110, 119, 113, 112)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Standar</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Admin Scope Filter Tabs */}
      {isAdmin && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Filter Wilayah:</span>
            </span>
            <button
              type="button"
              onClick={() => setFilterRt('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterRt === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              Semua Kontak ({allContacts.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterRt('UMUM')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterRt === 'UMUM'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              🌐 Umum / Publik ({allContacts.filter(c => !c.rt_id).length})
            </button>
            {(rts || []).map(r => (
              <button
                key={r.id}
                type="button"
                onClick={() => setFilterRt(r.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterRt === r.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
                }`}
              >
                🏢 {r.name} ({allContacts.filter(c => c.rt_id === r.id).length})
              </button>
            ))}
          </div>

          <span className="text-[11px] text-slate-500 font-medium">
            Menampilkan <strong>{contactsList.length}</strong> nomor darurat
          </span>
        </div>
      )}

      {/* Warga & RT Local Info Banner */}
      {!isAdmin && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl text-xs text-emerald-950 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            {isWarga 
              ? `Anda sedang melihat kontak darurat umum dan pengurus wilayah ${userRtObj?.name || 'RT Anda'}. Kontak RT lain tidak ditampilkan.`
              : `Pengurus ${userRtObj?.name || 'RT'}: Menampilkan kontak darurat umum dan kontak wilayah ${userRtObj?.name || 'RT'}.`}
          </span>
        </div>
      )}

      {/* Emergency Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contactsList.map((c) => {
          const IconComponent = getIconComponent(c)
          const cleanWa = c.wa ? getCleanPhone(c.wa) : ''

          return (
            <div 
              key={c.id}
              className={`rounded-3xl p-5 sm:p-6 border shadow-xs transition-all hover:shadow-md bg-white flex flex-col justify-between space-y-4 ${
                c.urgent ? 'border-rose-200/80 ring-1 ring-rose-100' : 'border-slate-200/80'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold border ${c.color || 'bg-slate-50 text-slate-800 border-slate-200'}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          {c.kategori}
                        </span>
                        {c.rt_id ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <Building2 className="w-3 h-3 text-indigo-600" />
                            <span>{(rts || []).find(r => r.id === c.rt_id)?.name || 'RT'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            <span>Semua Warga</span>
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                        {c.nama}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {c.urgent && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-rose-100 text-rose-800 border border-rose-200">
                        Siaga 24 Jam
                      </span>
                    )}

                    {canEdit && (
                      <div className="flex items-center gap-1 ml-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Nomor Darurat"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id, c.nama)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Kontak Ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {c.deskripsi}
                </p>
              </div>

              {/* Action Buttons: Phone & WhatsApp */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                <a
                  href={`tel:${c.nomor}`}
                  className="flex-1 min-w-[130px] flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span className="font-mono text-sm tracking-wide">{c.nomor}</span>
                </a>

                {c.wa && (
                  <a
                    href={`https://wa.me/${cleanWa}?text=Halo%20kami%20membutuhkan%20bantuan%20darurat%20di%20lingkungan%20${encodeURIComponent(config?.namaLingkungan || 'Perumahan')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95"
                    title="Kirim pesan WhatsApp darurat"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat WA</span>
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Panduan Tanggap Darurat Lingkungan */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-3xl p-6 space-y-3 text-xs">
        <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <span>Panduan Nomor Panggilan Cepat Nasional & Lingkungan:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-amber-950 font-medium">
          <div className="p-3 bg-white/80 rounded-2xl border border-amber-200/60 space-y-1">
            <strong className="block font-bold text-slate-900">Polisi (110)</strong>
            <p className="text-[11px] text-slate-600">Aduan tindak kejahatan, kecelakaan, dan ancaman kamtibmas 24 jam bebas pulsa.</p>
          </div>
          <div className="p-3 bg-white/80 rounded-2xl border border-amber-200/60 space-y-1">
            <strong className="block font-bold text-slate-900">Ambulans (119)</strong>
            <p className="text-[11px] text-slate-600">Gawat darurat medis, serangan jantung, kecelakaan parah & pemanggilan ambulans.</p>
          </div>
          <div className="p-3 bg-white/80 rounded-2xl border border-amber-200/60 space-y-1">
            <strong className="block font-bold text-slate-900">Damkar (113)</strong>
            <p className="text-[11px] text-slate-600">Pemadaman kebakaran, evakuasi bencana, pohon roboh & penanganan hewan liar.</p>
          </div>
          <div className="p-3 bg-white/80 rounded-2xl border border-amber-200/60 space-y-1">
            <strong className="block font-bold text-slate-900">Darurat Terpadu (112)</strong>
            <p className="text-[11px] text-slate-600">Layanan darurat all-in-one bebas pulsa langsung ke pusat komando BPBD kota/kabupaten.</p>
          </div>
        </div>
      </div>

      {/* Modal Edit / Tambah Kontak Darurat (Admin & RT) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {editingId ? 'Edit Nomor Darurat' : 'Tambah Kontak Darurat Baru'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Atur nama dan nomor telepon darurat warga
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Instansi / Layanan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kepolisian RI (Polisi), Ambulans 119"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kategori Layanan
                </label>
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                >
                  {KATEGORI_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Cakupan Wilayah / Penerima Kontak</span>
                  {selectedRtScope && (
                    <span className="text-[10px] text-indigo-700 bg-indigo-50 font-bold px-2 py-0.5 rounded-md border border-indigo-200">
                      Khusus {(rts || []).find(r => r.id === selectedRtScope)?.name || 'RT'}
                    </span>
                  )}
                </label>
                {isAdmin ? (
                  <select
                    value={selectedRtScope}
                    onChange={(e) => setSelectedRtScope(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    <option value="">🌐 Semua Warga / Layanan Publik (Terbuka Seluruh RT)</option>
                    {(rts || []).map(r => (
                      <option key={r.id} value={r.id}>
                        🏢 Khusus {r.name} (Hanya dapat dilihat warga {r.name})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Khusus Wilayah {currentRT?.name || 'RT Anda'} (Dibatasi untuk warga RT ini saja)</span>
                  </div>
                )}
                <p className="text-[11px] text-slate-500 mt-1">
                  {selectedRtScope 
                    ? `Hanya warga di ${(rts || []).find(r => r.id === selectedRtScope)?.name || 'RT ini'} yang dapat melihat kontak darurat ini.` 
                    : 'Kontak dapat dilihat oleh seluruh warga di semua wilayah RT.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nomor Panggilan Cepat <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="110, 119, 113, 112"
                    value={nomor}
                    onChange={(e) => setNomor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nomor WhatsApp (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="0812xxxxxxxx"
                    value={wa}
                    onChange={(e) => setWa(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Deskripsi Singkat Layanan
                </label>
                <textarea
                  rows={2}
                  placeholder="Keterangan tindakan bantuan dan cakupan penanganan..."
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={urgent}
                    onChange={(e) => setUrgent(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 accent-rose-600 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-slate-700">Tampilkan label Siaga 24 Jam (Prioritas)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan Kontak</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
