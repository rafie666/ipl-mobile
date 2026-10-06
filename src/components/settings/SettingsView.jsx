import React, { useState, useEffect } from 'react'
import { 
  Settings, 
  Layers, 
  Building, 
  Download, 
  Upload, 
  RotateCcw, 
  Plus, 
  Check, 
  Edit2, 
  Save,
  AlertTriangle,
  Database,
  Cloud,
  Key,
  Globe,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  LogOut,
  KeyRound,
  Home,
  CreditCard,
  Landmark,
  Trash2,
  X,
  Maximize2,
  RefreshCw,
  Camera,
  Image as ImageIcon,
  MapPin,
  Compass
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { formatRupiah } from '../../utils/formatters'
import { exportDataAsJson } from '../../utils/storage'
import { compressImageFile } from '../../utils/imageCompressor'
import CoordinatePickerMap from '../warga/CoordinatePickerMap'

export default function SettingsView() {
  const { 
    config, 
    updateConfig, 
    rts,
    updateRtData,
    addRtData,
    deleteRtData,
    isRT,
    currentRT,
    isAdmin,
    jenisIuran, 
    addJenisIuran, 
    updateJenisIuran, 
    toggleJenisIuran, 
    handleResetData, 
    handleImportData,
    isSupabaseConfigured,
    supabaseUrl,
    setSupabaseCredentials,
    confirmDialog,
    showToast,
    adminAuth,
    updateAdminAuth,
    logoutAdmin,
    isAdminLoggedIn,
    bankAccounts = [],
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
    qrisAccounts = [],
    addQrisAccount,
    updateQrisAccount,
    deleteQrisAccount
  } = useApp()

  // Form config profile RW
  const [formData, setFormData] = useState({ ...config })

  // State Manajemen Rekening & QRIS
  const [rekeningScopeFilter, setRekeningScopeFilter] = useState('Semua')
  
  // Bank Add/Edit State
  const [showAddBankModal, setShowAddBankModal] = useState(false)
  const [showEditBankModal, setShowEditBankModal] = useState(false)
  const [editingBankId, setEditingBankId] = useState(null)
  const [bankForm, setBankForm] = useState({
    owner_type: 'RT',
    owner_id: 'rt-1',
    bank_name: 'BCA',
    account_number: '',
    account_holder: '',
    is_primary: false
  })

  // QRIS Add/Edit State
  const [showAddQrisModal, setShowAddQrisModal] = useState(false)
  const [showEditQrisModal, setShowEditQrisModal] = useState(false)
  const [editingQrisId, setEditingQrisId] = useState(null)
  const [qrisForm, setQrisForm] = useState({
    owner_type: 'RT',
    owner_id: 'rt-1',
    qris_name: 'QRIS Kas RT 01',
    nmid: '',
    image_url: '',
    is_primary: false
  })

  // QRIS Preview Modal State
  const [showPreviewQrisModal, setShowPreviewQrisModal] = useState(false)
  const [previewQrisItem, setPreviewQrisItem] = useState(null)

  const handleOpenEditBank = (b) => {
    setEditingBankId(b.id)
    setBankForm({
      owner_type: b.owner_type || 'RT',
      owner_id: b.owner_id && b.owner_id !== 'RW' ? b.owner_id : 'rt-1',
      bank_name: b.bank_name || 'BCA',
      account_number: b.account_number || '',
      account_holder: b.account_holder || '',
      is_primary: !!b.is_primary
    })
    setShowEditBankModal(true)
  }

  const handleSaveEditBank = () => {
    if (!bankForm.account_number || !bankForm.account_holder) {
      showToast('Lengkapi nomor rekening dan nama pemilik!', 'warning')
      return
    }
    updateBankAccount(editingBankId, bankForm)
    setShowEditBankModal(false)
    setEditingBankId(null)
  }

  const handleOpenEditQris = (q) => {
    setEditingQrisId(q.id)
    setQrisForm({
      owner_type: q.owner_type || 'RT',
      owner_id: q.owner_id && q.owner_id !== 'RW' ? q.owner_id : 'rt-1',
      qris_name: q.qris_name || '',
      nmid: q.nmid || '',
      image_url: q.image_url || '',
      is_primary: !!q.is_primary
    })
    setShowEditQrisModal(true)
  }

  const handleSaveEditQris = () => {
    if (!qrisForm.qris_name) {
      showToast('Nama / label QRIS wajib diisi!', 'warning')
      return
    }
    const fallbackImage = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=QRIS_WARGAKU_${encodeURIComponent(qrisForm.qris_name.trim())}`
    updateQrisAccount(editingQrisId, {
      ...qrisForm,
      image_url: qrisForm.image_url.trim() || fallbackImage
    })
    setShowEditQrisModal(false)
    setEditingQrisId(null)
  }

  const handlePreviewQris = (q) => {
    setPreviewQrisItem(q)
    setShowPreviewQrisModal(true)
  }

  // State Pengaturan RT
  const [selectedRtId, setSelectedRtId] = useState(isRT ? (currentRT?.id || 'rt-1') : (rts?.[0]?.id || 'rt-1'))
  const activeRt = (rts || []).find(r => r.id === selectedRtId) || rts?.[0]
  const [activeRtSectionTab, setActiveRtSectionTab] = useState('profil') // 'profil' | 'maps'

  const [rtFormData, setRtFormData] = useState({
    ketua: activeRt?.ketua || '',
    bendahara: activeRt?.bendahara || '',
    kontak: activeRt?.kontak || '',
    rekening: activeRt?.rekening || '',
    lat: activeRt?.lat || -6.59715,
    lng: activeRt?.lng || 106.76415,
    lokasi: activeRt?.lokasi || ''
  })

  // Modal Tambah RT Baru State
  const [showAddRtModal, setShowAddRtModal] = useState(false)
  const [modalRtTab, setModalRtTab] = useState('info') // 'info' | 'maps'
  const [newRtForm, setNewRtForm] = useState({
    number: '',
    name: '',
    ketua: '',
    bendahara: '',
    kontak: '',
    rekening: '',
    keterangan: '',
    lat: -6.59715,
    lng: 106.76415,
    lokasi: ''
  })

  const handleOpenAddRt = () => {
    const nextNum = String((rts?.length || 0) + 1).padStart(2, '0')
    const defaultLat = Number((-6.59715 - ((rts?.length || 0) * 0.0005)).toFixed(6))
    const defaultLng = Number((106.76415 + ((rts?.length || 0) * 0.0006)).toFixed(6))
    setNewRtForm({
      number: nextNum,
      name: `RT ${nextNum}`,
      ketua: '',
      bendahara: '',
      kontak: '',
      rekening: '',
      keterangan: `Mencakup wilayah warga RT ${nextNum}`,
      lat: defaultLat,
      lng: defaultLng,
      lokasi: `Pos Balai Warga RT ${nextNum}`
    })
    setModalRtTab('info')
    setShowAddRtModal(true)
  }

  const handleSaveNewRt = async (e) => {
    if (e?.preventDefault) e.preventDefault()
    if (!newRtForm.number && !newRtForm.name) {
      showToast('Nomor atau nama RT wajib diisi!', 'warning')
      return
    }
    const numFormatted = (newRtForm.number.trim() || '01').padStart(2, '0')
    const nameFormatted = newRtForm.name.trim() || `RT ${numFormatted}`

    const created = await addRtData({
      number: numFormatted,
      name: nameFormatted,
      rw: config?.rw || '15',
      ketua: newRtForm.ketua.trim(),
      bendahara: newRtForm.bendahara.trim(),
      kontak: newRtForm.kontak.trim(),
      rekening: newRtForm.rekening.trim(),
      keterangan: newRtForm.keterangan.trim() || `Mencakup wilayah warga ${nameFormatted}`,
      lat: newRtForm.lat,
      lng: newRtForm.lng,
      lokasi: newRtForm.lokasi.trim() || `Pos Balai Warga ${nameFormatted}`
    })

    setShowAddRtModal(false)
    if (created?.id) {
      setSelectedRtId(created.id)
    }
  }

  const handleDeleteRt = (rtItem) => {
    if (!rtItem) return
    if ((rts || []).length <= 1) {
      showToast('Sistem harus memiliki minimal 1 RT.', 'warning')
      return
    }
    confirmDialog({
      title: `Hapus ${rtItem.name}?`,
      message: `Yakin ingin menghapus ${rtItem.name}? Seluruh data konfigurasi dan relasi RT ini akan disesuaikan.`,
      subtext: 'Pastikan tidak ada data penting yang tertinggal.',
      confirmText: 'Hapus RT',
      onConfirm: async () => {
        await deleteRtData(rtItem.id)
        const remaining = (rts || []).filter((r) => r.id !== rtItem.id)
        if (remaining.length > 0) {
          setSelectedRtId(remaining[0].id)
        }
      }
    })
  }

  useEffect(() => {
    if (activeRt) {
      setRtFormData({
        ketua: activeRt.ketua || '',
        bendahara: activeRt.bendahara || '',
        kontak: activeRt.kontak || '',
        rekening: activeRt.rekening || '',
        lat: Number(activeRt.lat) || -6.59715,
        lng: Number(activeRt.lng) || 106.76415,
        lokasi: activeRt.lokasi || `Pos Balai Warga ${activeRt.name || 'RT'}`
      })
    }
  }, [selectedRtId, rts])

  const handleRtSubmit = (e) => {
    e.preventDefault()
    if (!activeRt) return
    updateRtData(activeRt.id, rtFormData)
  }

  // Admin Auth Form State
  const [adminUsername, setAdminUsername] = useState(adminAuth?.username || 'admin')
  const [adminPassword, setAdminPassword] = useState(adminAuth?.password || 'admin123')
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState(adminAuth?.password || 'admin123')
  const [showAdminPass, setShowAdminPass] = useState(false)

  // Supabase credentials form state
  const [sbUrl, setSbUrl] = useState(supabaseUrl || '')
  const [sbKey, setSbKey] = useState(localStorage.getItem('wargaku_supabase_key') || '')
  const [showSqlGuide, setShowSqlGuide] = useState(false)

  // State tambah jenis iuran baru
  const [newNamaIuran, setNewNamaIuran] = useState('')
  const [newNominalIuran, setNewNominalIuran] = useState('')
  const [newKetIuran, setNewKetIuran] = useState('')
  const [showAddIuran, setShowAddIuran] = useState(false)

  // State edit jenis iuran inline
  const [editingIuranId, setEditingIuranId] = useState(null)
  const [editIuranNominal, setEditIuranNominal] = useState('')

  const handleConfigSubmit = (e) => {
    e.preventDefault()
    updateConfig(formData)
  }

  const handleAddIuran = (e) => {
    e.preventDefault()
    if (!newNamaIuran || !newNominalIuran) return
    addJenisIuran({
      nama: newNamaIuran.trim(),
      nominal: Number(newNominalIuran),
      keterangan: newKetIuran.trim(),
      wajib: true
    })
    setNewNamaIuran('')
    setNewNominalIuran('')
    setNewKetIuran('')
    setShowAddIuran(false)
  }

  const handleSaveEditIuran = (id) => {
    if (editIuranNominal) {
      updateJenisIuran(id, { nominal: Number(editIuranNominal) })
    }
    setEditingIuranId(null)
  }

  const handleSaveAdminAuth = (e) => {
    e.preventDefault()
    if (!adminUsername.trim()) {
      showToast('Username admin tidak boleh kosong!', 'error')
      return
    }
    if (adminPassword.length < 4) {
      showToast('Password minimal 4 karakter!', 'error')
      return
    }
    if (adminPassword !== adminPasswordConfirm) {
      showToast('Konfirmasi password tidak cocok!', 'error')
      return
    }
    updateAdminAuth(adminUsername.trim(), adminPassword)
  }

  const handleFileUpload = (e) => {
    const fileReader = new FileReader()
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8")
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result)
          handleImportData(parsed)
        } catch (err) {
          showToast('File JSON tidak valid.', 'error')
        }
      }
    }
  }

  const totalTarifAktif = jenisIuran.filter(j => j.aktif).reduce((acc, curr) => acc + curr.nominal, 0)

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-600" />
          Pengaturan Sistem & Master Pos Iuran
        </h1>
        <p className="text-xs text-slate-500">
          Konfigurasi tarif bulanan, identitas kepengurusan RT/RW, dan manajemen backup data
        </p>
      </div>

      {/* SECTION 1: Master Pos Iuran */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              Komponen & Tarif Pos Iuran
            </h2>
            <p className="text-xs text-slate-400">Pos ini akan otomatis dihitung setiap kali tagihan massal digenerate</p>
          </div>

          <button
            onClick={() => setShowAddIuran(!showAddIuran)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition-colors self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            + Pos Iuran Baru
          </button>
        </div>

        {/* Form Tambah Iuran Baru */}
        {showAddIuran && (
          <form onSubmit={handleAddIuran} className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-3">
            <span className="text-xs font-bold text-emerald-900 block">Tambah Pos Iuran Baru</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nama Pos Iuran</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Iuran Agustusan"
                  value={newNamaIuran}
                  onChange={(e) => setNewNamaIuran(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nominal (Rp)</label>
                <input
                  type="number"
                  required
                  step="1000"
                  placeholder="25000"
                  value={newNominalIuran}
                  onChange={(e) => setNewNominalIuran(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Keterangan Singkat</label>
                <input
                  type="text"
                  placeholder="Opsional"
                  value={newKetIuran}
                  onChange={(e) => setNewKetIuran(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddIuran(false)}
                className="px-3 py-1 text-xs text-slate-500 hover:bg-slate-200 rounded-lg"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs"
              >
                Tambahkan
              </button>
            </div>
          </form>
        )}

        {/* Tabel Pos Iuran */}
        <div className="divide-y divide-slate-100">
          {jenisIuran.map((item) => (
            <div key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={item.aktif}
                  onChange={() => toggleJenisIuran(item.id)}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer accent-emerald-600"
                  title="Centang untuk mengaktifkan pada tagihan bulanan"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${item.aktif ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
                      {item.nama}
                    </span>
                    {item.wajib && (
                      <span className="px-1.5 py-0.5 text-[9px] bg-slate-100 text-slate-600 font-bold rounded">Wajib</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">{item.keterangan || '-'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                {editingIuranId === item.id ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="1000"
                      value={editIuranNominal}
                      onChange={(e) => setEditIuranNominal(e.target.value)}
                      className="w-28 px-2 py-1 bg-slate-50 border border-slate-300 rounded text-xs font-mono font-bold"
                    />
                    <button
                      onClick={() => handleSaveEditIuran(item.id)}
                      className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-xs font-extrabold ${item.aktif ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {formatRupiah(item.nominal)}
                    </span>
                    <button
                      onClick={() => {
                        setEditingIuranId(item.id)
                        setEditIuranNominal(item.nominal)
                      }}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                      title="Edit Tarif"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Total Keseluruhan Iuran per KK */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-slate-700">Total Tarif Iuran Bulanan per KK:</span>
            <p className="text-[11px] text-slate-400">Hanya menjumlahkan pos iuran yang berstatus aktif</p>
          </div>
          <div className="text-base font-extrabold text-emerald-700 font-mono">
            {formatRupiah(totalTarifAktif)} / KK
          </div>
        </div>
      </div>

      {/* SECTION 2: Profil Identitas Lingkungan (Tingkat RW) */}
      <form onSubmit={handleConfigSubmit} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-600" />
              Identitas Lingkungan & Pengurus RW (Tingkat RW)
            </h2>
            <p className="text-xs text-slate-400">Informasi umum perumahan dan kontak pengurus RW yang berlaku untuk seluruh lingkungan</p>
          </div>
          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold text-[10px] rounded-full border border-indigo-200 uppercase">
            Tingkat RW
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama Perumahan / Lingkungan</label>
            <input
              type="text"
              value={formData?.namaLingkungan || ''}
              onChange={(e) => setFormData({ ...formData, namaLingkungan: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nomor RW</label>
            <input
              type="text"
              placeholder="Contoh: RW 15"
              value={formData?.rw || formData?.rtRw || ''}
              onChange={(e) => setFormData({ ...formData, rw: e.target.value, rtRw: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Kelurahan & Kecamatan</label>
            <input
              type="text"
              value={`${formData?.kelurahan || ''}, ${formData?.kecamatan || ''}`}
              onChange={(e) => {
                const parts = e.target.value.split(',')
                setFormData({ ...formData, kelurahan: parts[0]?.trim() || '', kecamatan: parts[1]?.trim() || '' })
              }}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Kota / Kabupaten</label>
            <input
              type="text"
              placeholder="Contoh: Kabupaten Bogor"
              value={formData?.kota || ''}
              onChange={(e) => setFormData({ ...formData, kota: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama Ketua RW</label>
            <input
              type="text"
              placeholder="Contoh: Bpk. H. Rahmat Hidayat"
              value={formData?.ketuaRw || ''}
              onChange={(e) => setFormData({ ...formData, ketuaRw: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nomor WhatsApp Pengurus RW</label>
            <input
              type="text"
              placeholder="Contoh: 081122334455"
              value={formData?.kontakRw || ''}
              onChange={(e) => setFormData({ ...formData, kontakRw: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Info Rekening Kas Bersama RW</label>
            <input
              type="text"
              placeholder="Contoh: BCA 7788990011 a.n Kas RW 15 (Untuk iuran event / kegiatan RW)"
              value={formData?.rekeningRw || ''}
              onChange={(e) => setFormData({ ...formData, rekeningRw: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Save className="w-4 h-4" />
            Simpan Profil RW
          </button>
        </div>
      </form>

      {/* SECTION 3: Profil Pengurus & Rekening Kas per Wilayah RT (Multi-RT) */}
      <form onSubmit={handleRtSubmit} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Landmark className="w-4 h-4 text-emerald-600" />
              Pengurus & Rekening Kas per Wilayah RT
            </h2>
            <p className="text-xs text-slate-400">
              Setiap RT memiliki Ketua, Bendahara (tanda tangan kwitansi resmi), No WA, dan Rekening Bank masing-masing
            </p>
          </div>

          {/* RT Selector jika Admin, atau Locked Badge jika RT */}
          {isAdmin ? (
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              {(rts || []).map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRtId(r.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedRtId === r.id
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {r.name}
                </button>
              ))}
              <button
                type="button"
                onClick={handleOpenAddRt}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-all border border-emerald-200"
                title="Tambah wilayah RT baru"
              >
                <Plus className="w-3.5 h-3.5" />
                + Tambah RT
              </button>
            </div>
          ) : (
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-full border border-emerald-300">
              Wilayah: {activeRt?.name || 'RT Anda'}
            </span>
          )}
        </div>

        {/* Keterangan Wilayah RT */}
        <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-xl flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-emerald-950">Mengatur Wilayah: {activeRt?.name}</span>
            <p className="text-[11px] text-emerald-700 mt-0.5">{activeRt?.keterangan || 'Mencakup wilayah warga RT'}</p>
          </div>
          <span className="text-[11px] font-mono text-emerald-800 bg-white px-2.5 py-1 rounded-md border border-emerald-200 font-bold">
            Kode: {activeRt?.id}
          </span>
        </div>

        {/* Subtabs: Data Pengurus vs Denah Lokasi Map */}
        <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveRtSectionTab('profil')}
            className={`pb-2.5 flex items-center gap-1.5 transition-colors ${
              activeRtSectionTab === 'profil'
                ? 'text-emerald-700 border-b-2 border-emerald-600'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Data Pengurus & Rekening Kas
          </button>
          <button
            type="button"
            onClick={() => setActiveRtSectionTab('maps')}
            className={`pb-2.5 flex items-center gap-1.5 transition-colors ${
              activeRtSectionTab === 'maps'
                ? 'text-emerald-700 border-b-2 border-emerald-600'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Denah & Titik Koordinat Peta RT (GIS)
          </button>
        </div>

        {activeRtSectionTab === 'profil' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Ketua RT</label>
              <input
                type="text"
                placeholder="Contoh: Bpk. Syahdan"
                value={rtFormData.ketua}
                onChange={(e) => setRtFormData({ ...rtFormData, ketua: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Bendahara RT (Tanda Tangan Kwitansi Resmi)</label>
              <input
                type="text"
                placeholder="Contoh: Ibu Siti Aminah"
                value={rtFormData.bendahara}
                onChange={(e) => setRtFormData({ ...rtFormData, bendahara: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nomor WhatsApp Pengurus {activeRt?.name}</label>
              <input
                type="text"
                placeholder="Contoh: 081234567890"
                value={rtFormData.kontak}
                onChange={(e) => setRtFormData({ ...rtFormData, kontak: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">Digunakan untuk konfirmasi bukti bayar warga & kontak darurat</p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Info Rekening Pembayaran Kas {activeRt?.name}</label>
              <input
                type="text"
                placeholder="Contoh: BCA 8730192831 a.n Kas RT 01"
                value={rtFormData.rekening}
                onChange={(e) => setRtFormData({ ...rtFormData, rekening: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">Ditampilkan pada portal warga saat melakukan transfer iuran</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  Titik Pusat / Pos Balai {activeRt?.name} di Peta
                </span>
                <p className="text-[11px] text-indigo-700 mt-0.5">
                  Geser pin merah di bawah untuk menandai lokasi Pos Ronda, Balai Warga, atau titik kumpul {activeRt?.name}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold px-2 py-1 bg-white border border-indigo-200 rounded-md text-indigo-900">
                  Lat: {Number(rtFormData.lat || -6.59715).toFixed(6)}, Lng: {Number(rtFormData.lng || 106.76415).toFixed(6)}
                </span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Lokasi / Pos Warga {activeRt?.name}</label>
              <input
                type="text"
                placeholder="Contoh: Pos Balai Warga & Pos Ronda RT 01 (Depan Blok A)"
                value={rtFormData.lokasi}
                onChange={(e) => setRtFormData({ ...rtFormData, lokasi: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
              <CoordinatePickerMap
                lat={rtFormData.lat}
                lng={rtFormData.lng}
                height="320px"
                onChange={({ lat, lng }) => setRtFormData(prev => ({ ...prev, lat, lng }))}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          {isAdmin && (rts || []).length > 1 ? (
            <button
              type="button"
              onClick={() => handleDeleteRt(activeRt)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-all border border-rose-200"
            >
              <Trash2 className="w-4 h-4" />
              Hapus {activeRt?.name || 'RT Ini'}
            </button>
          ) : <div />}

          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
          >
            <Save className="w-4 h-4" />
            Simpan Data {activeRt?.name || 'RT'}
          </button>
        </div>
      </form>

      {/* SECTION MANAJEMEN REKENING BANK & QRIS TERPISAH (RT & RW) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              Manajemen Rekening Bank & QRIS (RT & RW Terpisah)
            </h2>
            <p className="text-xs text-slate-400">
              Setiap RT dan RW dapat memiliki rekening & QRIS masing-masing. Pembayaran RT dan RW tidak akan tercampur.
            </p>
          </div>

          {/* Filter Wilayah Scope */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {['Semua', 'RW', 'RT 01', 'RT 02', 'RT 03'].map((scope) => {
              const isSelected = rekeningScopeFilter === scope
              return (
                <button
                  key={scope}
                  type="button"
                  onClick={() => setRekeningScopeFilter(scope)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {scope}
                </button>
              )
            })}
          </div>
        </div>

        {/* 1. DAFTAR REKENING BANK */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-emerald-600" />
              Daftar Rekening Bank ({
                bankAccounts.filter(b => {
                  if (rekeningScopeFilter === 'Semua') return true
                  if (rekeningScopeFilter === 'RW') return b.owner_type === 'RW'
                  const rtId = rekeningScopeFilter === 'RT 01' ? 'rt-1' : rekeningScopeFilter === 'RT 02' ? 'rt-2' : 'rt-3'
                  return b.owner_type === 'RT' && b.owner_id === rtId
                }).length
              })
            </h3>
            <button
              type="button"
              onClick={() => {
                setBankForm({
                  owner_type: 'RT',
                  owner_id: 'rt-1',
                  bank_name: 'BCA',
                  account_number: '',
                  account_holder: '',
                  is_primary: false
                })
                setShowAddBankModal(true)
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              + Tambah Rekening
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {bankAccounts
              .filter(b => {
                if (rekeningScopeFilter === 'Semua') return true
                if (rekeningScopeFilter === 'RW') return b.owner_type === 'RW'
                const rtId = rekeningScopeFilter === 'RT 01' ? 'rt-1' : rekeningScopeFilter === 'RT 02' ? 'rt-2' : 'rt-3'
                return b.owner_type === 'RT' && b.owner_id === rtId
              })
              .map((b) => {
                const isRW = b.owner_type === 'RW'
                const rtOwner = (rts || []).find(r => r.id === b.owner_id)
                const ownerLabel = isRW ? 'Kas RW 15' : (rtOwner?.name || b.owner_id)

                return (
                  <div 
                    key={b.id} 
                    className={`p-4 rounded-2xl border transition-all ${
                      b.is_primary ? 'bg-emerald-50/50 border-emerald-300 ring-2 ring-emerald-500/20' : 'bg-slate-50/50 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isRW ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {ownerLabel}
                      </span>
                      {b.is_primary ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white">
                          UTAMA
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => updateBankAccount(b.id, { is_primary: true })}
                          className="text-[10px] font-bold text-slate-500 hover:text-emerald-700 underline"
                        >
                          Set Utama
                        </button>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs font-extrabold text-slate-800">{b.bank_name}</div>
                      <div className="text-sm font-mono font-black text-slate-900 tracking-wider">{b.account_number}</div>
                      <div className="text-[11px] text-slate-500">a.n <span className="font-semibold text-slate-700">{b.account_holder}</span></div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditBank(b)}
                        className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          confirmDialog({
                            title: 'Hapus Rekening',
                            message: `Yakin ingin menghapus rekening ${b.bank_name} ${b.account_number}?`,
                            onConfirm: () => deleteBankAccount(b.id)
                          })
                        }}
                        className="flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        Hapus
                      </button>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>

        {/* 2. DAFTAR QRIS */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              Daftar QRIS ({
                qrisAccounts.filter(q => {
                  if (rekeningScopeFilter === 'Semua') return true
                  if (rekeningScopeFilter === 'RW') return q.owner_type === 'RW'
                  const rtId = rekeningScopeFilter === 'RT 01' ? 'rt-1' : rekeningScopeFilter === 'RT 02' ? 'rt-2' : 'rt-3'
                  return q.owner_type === 'RT' && q.owner_id === rtId
                }).length
              })
            </h3>
            <button
              type="button"
              onClick={() => {
                setQrisForm({
                  owner_type: 'RT',
                  owner_id: 'rt-1',
                  qris_name: 'QRIS Kas RT 01',
                  nmid: '',
                  image_url: '',
                  is_primary: false
                })
                setShowAddQrisModal(true)
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              + Tambah QRIS
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {qrisAccounts
              .filter(q => {
                if (rekeningScopeFilter === 'Semua') return true
                if (rekeningScopeFilter === 'RW') return q.owner_type === 'RW'
                const rtId = rekeningScopeFilter === 'RT 01' ? 'rt-1' : rekeningScopeFilter === 'RT 02' ? 'rt-2' : 'rt-3'
                return q.owner_type === 'RT' && q.owner_id === rtId
              })
              .map((q) => {
                const isRW = q.owner_type === 'RW'
                const rtOwner = (rts || []).find(r => r.id === q.owner_id)
                const ownerLabel = isRW ? 'Kas RW 15' : (rtOwner?.name || q.owner_id)

                return (
                  <div 
                    key={q.id} 
                    className={`p-4 rounded-2xl border transition-all ${
                      q.is_primary ? 'bg-emerald-50/50 border-emerald-300 ring-2 ring-emerald-500/20' : 'bg-slate-50/50 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isRW ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {ownerLabel}
                      </span>
                      {q.is_primary ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white">
                          UTAMA
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => updateQrisAccount(q.id, { is_primary: true })}
                          className="text-[10px] font-bold text-slate-500 hover:text-emerald-700 underline"
                        >
                          Set Utama
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {q.image_url ? (
                        <div 
                          onClick={() => handlePreviewQris(q)} 
                          className="relative group cursor-pointer shrink-0"
                          title="Klik untuk perbesar barcode QRIS"
                        >
                          <img 
                            src={q.image_url} 
                            alt={q.qris_name} 
                            className="w-14 h-14 object-contain rounded-xl border border-slate-200 bg-white p-1 shadow-xs group-hover:ring-2 group-hover:ring-emerald-500 transition-all" 
                          />
                          <div className="absolute inset-0 bg-slate-900/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                            <Maximize2 className="w-4 h-4" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400">
                          <CreditCard className="w-6 h-6" />
                        </div>
                      )}
                      <div className="space-y-0.5">
                        <div className="text-xs font-extrabold text-slate-800">{q.qris_name}</div>
                        {q.nmid && <div className="text-[10px] font-mono text-slate-500">NMID: {q.nmid}</div>}
                        <p className="text-[11px] text-emerald-600 font-semibold">✓ Siap scan m-Banking & E-Wallet</p>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handlePreviewQris(q)}
                        className="flex items-center gap-1 text-[11px] font-bold text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 px-2 py-1 rounded-lg transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        Lihat QR
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditQris(q)}
                        className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          confirmDialog({
                            title: 'Hapus QRIS',
                            message: `Yakin ingin menghapus ${q.qris_name}?`,
                            onConfirm: () => deleteQrisAccount(q.id)
                          })
                        }}
                        className="flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        Hapus
                      </button>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>

      </div>

      {/* MODAL 1: TAMBAH REKENING BANK */}
      {showAddBankModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Landmark className="w-4 h-4 text-emerald-600" />
                Tambah Rekening Bank Baru
              </h3>
              <button
                type="button"
                onClick={() => setShowAddBankModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kepemilikan Kas</label>
                <select
                  value={bankForm.owner_type}
                  onChange={(e) => setBankForm({ ...bankForm, owner_type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="RT">Kas RT (Wilayah)</option>
                  <option value="RW">Kas RW (Umum)</option>
                </select>
              </div>

              {bankForm.owner_type === 'RT' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pilih RT</label>
                  <select
                    value={bankForm.owner_id}
                    onChange={(e) => setBankForm({ ...bankForm, owner_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    {(rts || []).map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.ketua})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Bank *</label>
                <input
                  type="text"
                  placeholder="Contoh: BCA / Mandiri / BRI / BSI"
                  value={bankForm.bank_name}
                  onChange={(e) => setBankForm({ ...bankForm, bank_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nomor Rekening *</label>
                <input
                  type="text"
                  placeholder="Contoh: 8730192831"
                  value={bankForm.account_number}
                  onChange={(e) => setBankForm({ ...bankForm, account_number: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Pemilik Rekening (a.n) *</label>
                <input
                  type="text"
                  placeholder="Contoh: Kas RT 01 / Siti Aminah"
                  value={bankForm.account_holder}
                  onChange={(e) => setBankForm({ ...bankForm, account_holder: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_primary_bank"
                  checked={bankForm.is_primary}
                  onChange={(e) => setBankForm({ ...bankForm, is_primary: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="is_primary_bank" className="font-bold text-slate-700 cursor-pointer">
                  Jadikan Rekening Utama untuk wilayah ini
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddBankModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!bankForm.account_number || !bankForm.account_holder) {
                    showToast('Lengkapi nomor rekening dan nama pemilik!', 'warning')
                    return
                  }
                  addBankAccount(bankForm)
                  setShowAddBankModal(false)
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
              >
                Simpan Rekening
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT REKENING BANK */}
      {showEditBankModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-emerald-600" />
                Edit Rekening Bank
              </h3>
              <button
                type="button"
                onClick={() => setShowEditBankModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kepemilikan Kas</label>
                <select
                  value={bankForm.owner_type}
                  onChange={(e) => setBankForm({ ...bankForm, owner_type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="RT">Kas RT (Wilayah)</option>
                  <option value="RW">Kas RW (Umum)</option>
                </select>
              </div>

              {bankForm.owner_type === 'RT' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pilih RT</label>
                  <select
                    value={bankForm.owner_id}
                    onChange={(e) => setBankForm({ ...bankForm, owner_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    {(rts || []).map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.ketua})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Bank *</label>
                <input
                  type="text"
                  placeholder="Contoh: BCA / Mandiri / BRI"
                  value={bankForm.bank_name}
                  onChange={(e) => setBankForm({ ...bankForm, bank_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nomor Rekening *</label>
                <input
                  type="text"
                  placeholder="Contoh: 8730192831"
                  value={bankForm.account_number}
                  onChange={(e) => setBankForm({ ...bankForm, account_number: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Pemilik Rekening (a.n) *</label>
                <input
                  type="text"
                  placeholder="Contoh: Kas RT 01 / Siti Aminah"
                  value={bankForm.account_holder}
                  onChange={(e) => setBankForm({ ...bankForm, account_holder: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_primary_bank_edit"
                  checked={bankForm.is_primary}
                  onChange={(e) => setBankForm({ ...bankForm, is_primary: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="is_primary_bank_edit" className="font-bold text-slate-700 cursor-pointer">
                  Jadikan Rekening Utama untuk wilayah ini
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowEditBankModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveEditBank}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: TAMBAH QRIS */}
      {showAddQrisModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                Tambah Akun QRIS Baru
              </h3>
              <button
                type="button"
                onClick={() => setShowAddQrisModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kepemilikan Kas</label>
                <select
                  value={qrisForm.owner_type}
                  onChange={(e) => setQrisForm({ ...qrisForm, owner_type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="RT">Kas RT (Wilayah)</option>
                  <option value="RW">Kas RW (Umum)</option>
                </select>
              </div>

              {qrisForm.owner_type === 'RT' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pilih RT</label>
                  <select
                    value={qrisForm.owner_id}
                    onChange={(e) => setQrisForm({ ...qrisForm, owner_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    {(rts || []).map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.ketua})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama / Label QRIS *</label>
                <input
                  type="text"
                  placeholder="Contoh: QRIS Kas RT 01 / QRIS RW 15"
                  value={qrisForm.qris_name}
                  onChange={(e) => setQrisForm({ ...qrisForm, qris_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">NMID (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: ID1020001234567"
                  value={qrisForm.nmid}
                  onChange={(e) => setQrisForm({ ...qrisForm, nmid: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              {/* Upload Foto Barcode QRIS */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Foto Barcode QRIS</label>
                {qrisForm.image_url ? (
                  <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
                    <img src={qrisForm.image_url} alt="Preview QRIS" className="w-16 h-16 object-contain rounded-lg bg-white p-1 border shadow-xs" />
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold text-emerald-700">Foto Barcode Terpasang ✓</div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer">
                          Ganti Foto
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0]
                              if (!file) return
                              try {
                                const compressed = await compressImageFile(file, 800, 800, 0.8)
                                setQrisForm({ ...qrisForm, image_url: compressed })
                              } catch (err) {
                                showToast('Gagal memproses foto: ' + err.message, 'error')
                              }
                            }}
                          />
                        </label>
                        <span className="text-slate-300">|</span>
                        <button
                          type="button"
                          onClick={() => setQrisForm({ ...qrisForm, image_url: '' })}
                          className="text-xs font-bold text-rose-600 hover:underline"
                        >
                          Hapus Foto
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl cursor-pointer bg-slate-50/60 hover:bg-emerald-50/20 transition-colors">
                    <Upload className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-xs font-bold text-slate-700">Upload Foto Barcode QRIS</span>
                    <span className="text-[10px] text-slate-400">Pilih gambar file (JPG, PNG, WebP)</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        try {
                          const compressed = await compressImageFile(file, 800, 800, 0.8)
                          setQrisForm({ ...qrisForm, image_url: compressed })
                        } catch (err) {
                          showToast('Gagal memproses foto QRIS: ' + err.message, 'error')
                        }
                      }}
                    />
                  </label>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_primary_qris"
                  checked={qrisForm.is_primary}
                  onChange={(e) => setQrisForm({ ...qrisForm, is_primary: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="is_primary_qris" className="font-bold text-slate-700 cursor-pointer">
                  Jadikan QRIS Utama untuk wilayah ini
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddQrisModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!qrisForm.qris_name) {
                    showToast('Isi nama QRIS terlebih dahulu!', 'warning')
                    return
                  }
                  const fallbackImage = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=QRIS_WARGAKU_${encodeURIComponent(qrisForm.qris_name.trim())}`
                  addQrisAccount({
                    ...qrisForm,
                    image_url: qrisForm.image_url.trim() || fallbackImage
                  })
                  setShowAddQrisModal(false)
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
              >
                Simpan QRIS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT QRIS */}
      {showEditQrisModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-emerald-600" />
                Edit Akun QRIS
              </h3>
              <button
                type="button"
                onClick={() => setShowEditQrisModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kepemilikan Kas</label>
                <select
                  value={qrisForm.owner_type}
                  onChange={(e) => setQrisForm({ ...qrisForm, owner_type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="RT">Kas RT (Wilayah)</option>
                  <option value="RW">Kas RW (Umum)</option>
                </select>
              </div>

              {qrisForm.owner_type === 'RT' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pilih RT</label>
                  <select
                    value={qrisForm.owner_id}
                    onChange={(e) => setQrisForm({ ...qrisForm, owner_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    {(rts || []).map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.ketua})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama / Label QRIS *</label>
                <input
                  type="text"
                  placeholder="Contoh: QRIS Kas RT 01"
                  value={qrisForm.qris_name}
                  onChange={(e) => setQrisForm({ ...qrisForm, qris_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">NMID (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: ID1020001234567"
                  value={qrisForm.nmid}
                  onChange={(e) => setQrisForm({ ...qrisForm, nmid: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              {/* Upload Foto Barcode QRIS di Edit Modal */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Foto Barcode QRIS</label>
                {qrisForm.image_url ? (
                  <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
                    <img src={qrisForm.image_url} alt="Preview QRIS" className="w-16 h-16 object-contain rounded-lg bg-white p-1 border shadow-xs" />
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold text-emerald-700">Foto Barcode Terpasang ✓</div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer">
                          Ganti Foto
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0]
                              if (!file) return
                              try {
                                const compressed = await compressImageFile(file, 800, 800, 0.8)
                                setQrisForm({ ...qrisForm, image_url: compressed })
                              } catch (err) {
                                showToast('Gagal memproses foto: ' + err.message, 'error')
                              }
                            }}
                          />
                        </label>
                        <span className="text-slate-300">|</span>
                        <button
                          type="button"
                          onClick={() => setQrisForm({ ...qrisForm, image_url: '' })}
                          className="text-xs font-bold text-rose-600 hover:underline"
                        >
                          Hapus Foto
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl cursor-pointer bg-slate-50/60 hover:bg-emerald-50/20 transition-colors">
                    <Upload className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-xs font-bold text-slate-700">Upload Foto Barcode QRIS</span>
                    <span className="text-[10px] text-slate-400">Pilih gambar file (JPG, PNG, WebP)</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        try {
                          const compressed = await compressImageFile(file, 800, 800, 0.8)
                          setQrisForm({ ...qrisForm, image_url: compressed })
                        } catch (err) {
                          showToast('Gagal memproses foto QRIS: ' + err.message, 'error')
                        }
                      }}
                    />
                  </label>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_primary_qris_edit"
                  checked={qrisForm.is_primary}
                  onChange={(e) => setQrisForm({ ...qrisForm, is_primary: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="is_primary_qris_edit" className="font-bold text-slate-700 cursor-pointer">
                  Jadikan QRIS Utama untuk wilayah ini
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowEditQrisModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveEditQris}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: ZOOM PREVIEW BARCODE QRIS */}
      {showPreviewQrisModal && previewQrisItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in duration-200 text-center">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="text-left">
                <h3 className="text-sm font-bold text-slate-900">
                  {previewQrisItem.qris_name}
                </h3>
                <span className="text-[10px] text-slate-500 font-semibold">
                  {previewQrisItem.owner_type === 'RW' ? 'Kas RW 15' : 'Kas RT'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowPreviewQrisModal(false)
                  setPreviewQrisItem(null)
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center">
              <img
                src={
                  previewQrisItem.image_url ||
                  `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=QRIS_${encodeURIComponent(previewQrisItem.qris_name)}`
                }
                alt={previewQrisItem.qris_name}
                className="w-56 h-56 object-contain bg-white p-2 rounded-xl border shadow-md"
              />
              <div className="mt-3 space-y-0.5">
                <div className="text-xs font-bold text-slate-800">{previewQrisItem.qris_name}</div>
                {previewQrisItem.nmid && (
                  <div className="text-[11px] font-mono text-slate-500 font-bold">NMID: {previewQrisItem.nmid}</div>
                )}
              </div>
              <div className="mt-3 px-3 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">
                ✓ Siap Scan via m-Banking & E-Wallet
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              {previewQrisItem.image_url && (
                <a
                  href={previewQrisItem.image_url}
                  download={`QRIS_${previewQrisItem.qris_name}.png`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Unduh QR
                </a>
              )}
              <button
                type="button"
                onClick={() => {
                  setShowPreviewQrisModal(false)
                  setPreviewQrisItem(null)
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: TAMBAH WILAYAH RT BARU */}
      {showAddRtModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Tambah Wilayah RT Baru
                </h3>
                <p className="text-xs text-slate-400">
                  Daftarkan rukun tetangga & posko wilayah ke dalam konfigurasi lingkungan
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddRtModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs: Identitas vs Peta Denah */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setModalRtTab('info')}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  modalRtTab === 'info'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                1. Data Pengurus & Rekening
              </button>
              <button
                type="button"
                onClick={() => setModalRtTab('maps')}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  modalRtTab === 'maps'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                2. Denah Lokasi / Peta GIS
              </button>
            </div>

            <form onSubmit={handleSaveNewRt} className="space-y-3.5 text-xs">
              {modalRtTab === 'info' ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nomor RT *</label>
                      <input
                        type="text"
                        required
                        placeholder="04"
                        value={newRtForm.number}
                        onChange={(e) => {
                          const val = e.target.value
                          setNewRtForm({
                            ...newRtForm,
                            number: val,
                            name: !newRtForm.name || newRtForm.name.startsWith('RT ') ? (val ? `RT ${val.padStart(2, '0')}` : '') : newRtForm.name,
                            lokasi: !newRtForm.lokasi || newRtForm.lokasi.startsWith('Pos Balai Warga RT') ? (val ? `Pos Balai Warga RT ${val.padStart(2, '0')}` : '') : newRtForm.lokasi
                          })
                        }}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nama RT *</label>
                      <input
                        type="text"
                        required
                        placeholder="RT 04"
                        value={newRtForm.name}
                        onChange={(e) => setNewRtForm({ ...newRtForm, name: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Ketua RT</label>
                    <input
                      type="text"
                      placeholder="Contoh: Bpk. Bambang"
                      value={newRtForm.ketua}
                      onChange={(e) => setNewRtForm({ ...newRtForm, ketua: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Bendahara RT (Tanda Tangan Kwitansi)</label>
                    <input
                      type="text"
                      placeholder="Contoh: Ibu Endang"
                      value={newRtForm.bendahara}
                      onChange={(e) => setNewRtForm({ ...newRtForm, bendahara: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nomor WhatsApp Pengurus</label>
                    <input
                      type="text"
                      placeholder="Contoh: 081234567890"
                      value={newRtForm.kontak}
                      onChange={(e) => setNewRtForm({ ...newRtForm, kontak: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Info Rekening Pembayaran Kas RT</label>
                    <input
                      type="text"
                      placeholder="Contoh: BCA 12345678 a.n Kas RT 04"
                      value={newRtForm.rekening}
                      onChange={(e) => setNewRtForm({ ...newRtForm, rekening: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Keterangan Wilayah / Blok</label>
                    <input
                      type="text"
                      placeholder="Contoh: Mencakup Blok D dan Blok E"
                      value={newRtForm.keterangan}
                      onChange={(e) => setNewRtForm({ ...newRtForm, keterangan: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        Pilih Titik Pos / Balai RT di Peta
                      </span>
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        Tarik pin Google Maps merah ke titik lokasi Pos Ronda / Balai Warga {newRtForm.name || 'RT Baru'}
                      </p>
                    </div>
                    <span className="font-mono text-[11px] font-bold px-2 py-1 bg-white border border-emerald-200 rounded-md text-emerald-900">
                      ({Number(newRtForm.lat || -6.59715).toFixed(5)}, {Number(newRtForm.lng || 106.76415).toFixed(5)})
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Lokasi / Pos Warga RT</label>
                    <input
                      type="text"
                      placeholder="Contoh: Pos Balai Warga & Pos Ronda RT 04 (Blok E)"
                      value={newRtForm.lokasi}
                      onChange={(e) => setNewRtForm({ ...newRtForm, lokasi: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
                    <CoordinatePickerMap
                      lat={newRtForm.lat}
                      lng={newRtForm.lng}
                      height="280px"
                      onChange={({ lat, lng }) => setNewRtForm(prev => ({ ...prev, lat, lng }))}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                {modalRtTab === 'info' ? (
                  <button
                    type="button"
                    onClick={() => setModalRtTab('maps')}
                    className="flex items-center gap-1 px-3.5 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Atur Titik Peta (GIS) →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setModalRtTab('info')}
                    className="flex items-center gap-1 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    ← Kembali ke Data
                  </button>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddRtModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                  >
                    Simpan RT Baru
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECTION KEAMANAN & KREDENSIAL AKUN ADMIN */}
      <form onSubmit={handleSaveAdminAuth} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Keamanan Akun & Password Administrator RT
            </h2>
            <p className="text-xs text-slate-400">Ubah akun login untuk mengamankan akses ke dashboard dan data keuangan</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Sesi Admin Aktif
            </span>
            <button
              type="button"
              onClick={logoutAdmin}
              className="flex items-center gap-1 px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-colors"
              title="Keluar dari sesi admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-500" />
              Username Admin
            </label>
            <input
              type="text"
              required
              value={adminUsername}
              onChange={(e) => setAdminUsername(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-slate-700 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                Password Baru
              </label>
              <button
                type="button"
                onClick={() => setShowAdminPass(!showAdminPass)}
                className="text-[11px] text-emerald-700 hover:underline"
              >
                {showAdminPass ? 'Sembunyikan' : 'Lihat'}
              </button>
            </div>
            <input
              type={showAdminPass ? 'text' : 'password'}
              required
              placeholder="Minimal 4 karakter"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-slate-500" />
              Ulangi Password
            </label>
            <input
              type={showAdminPass ? 'text' : 'password'}
              required
              placeholder="Ketik ulang password"
              value={adminPasswordConfirm}
              onChange={(e) => setAdminPasswordConfirm(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <p className="text-[11px] text-slate-500">
            Kredensial tersimpan: Username <strong className="text-slate-700 font-mono">{adminAuth?.username}</strong> | Password <strong className="text-slate-700 font-mono">••••••••</strong>
          </p>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs self-end sm:self-auto"
          >
            <Save className="w-4 h-4" />
            Simpan Kredensial Admin
          </button>
        </div>
      </form>

      {/* SECTION KONEKSI CLOUD DATABASE SUPABASE */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              Koneksi Cloud Database (Supabase)
            </h2>
            <p className="text-xs text-slate-400">Sinkronisasi online agar data di HP warga dan dashboard admin terhubung realtime</p>
          </div>

          <div className="flex items-center gap-2">
            {isSupabaseConfigured ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                Terhubung ke Cloud
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Mode Lokal (LocalStorage)
              </span>
            )}
          </div>
        </div>

        {/* Input Supabase Credentials */}
        <form onSubmit={(e) => {
          e.preventDefault()
          setSupabaseCredentials(sbUrl, sbKey)
        }} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                Project URL Supabase
              </label>
              <input
                type="text"
                placeholder="https://xyzcompany.supabase.co"
                value={sbUrl}
                onChange={(e) => setSbUrl(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-emerald-600" />
                Anon Public Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                value={sbKey}
                onChange={(e) => setSbKey(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowSqlGuide(!showSqlGuide)}
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              📄 {showSqlGuide ? 'Sembunyikan Panduan SQL' : 'Lihat Cara Setup Tabel di Supabase (Skrip SQL)'}
            </button>

            <div className="flex items-center gap-2">
              {isSupabaseConfigured && (
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await confirmDialog({
                      title: 'Putuskan koneksi Supabase?',
                      message: 'Ini akan memutuskan sinkronisasi cloud Supabase dan kembali ke penyimpanan lokal.',
                      subtext: 'Data lokal Anda tetap aman dan dapat dihubungkan kembali kapan saja.',
                      confirmText: 'Putuskan'
                    })
                    if (ok) {
                      setSupabaseCredentials('', '')
                    }
                  }}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl text-xs font-semibold transition-colors"
                >
                  Putuskan Koneksi
                </button>
              )}
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <Cloud className="w-4 h-4" />
                Simpan & Hubungkan
              </button>
            </div>
          </div>
        </form>

        {/* Panduan Setup SQL */}
        {showSqlGuide && (
          <div className="p-4 bg-slate-900 text-slate-200 rounded-xl space-y-2 text-xs font-mono border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-800">
              <span className="font-bold text-white">Langkah Setup Database di Supabase:</span>
              <span className="text-[11px]">File: supabase_setup.sql</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] font-sans">
              <li>Buka <strong>supabase.com</strong> lalu buat project baru (gratis).</li>
              <li>Buka menu <strong>SQL Editor</strong> di sidebar kiri Supabase.</li>
              <li>Buka file <code>supabase_setup.sql</code> di folder project ini, salin semua isinya dan paste ke SQL Editor.</li>
              <li>Klik tombol hijau <strong>Run</strong> untuk membuat semua tabel.</li>
              <li>Buka <strong>Project Settings &gt; API</strong>, salin Project URL dan anon public key ke kolom di atas.</li>
            </ol>
          </div>
        )}
      </div>

      {/* SECTION 3: Backup & Restore */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Download className="w-4 h-4 text-emerald-600" />
            Cadangan Data & Pemulihan (Backup & Restore)
          </h2>
          <p className="text-xs text-slate-400">Simpan seluruh database lokal ke file JSON di komputer Anda</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Ekspor */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2">
            <span className="text-xs font-bold text-slate-800 block">Ekspor Cadangan Lengkap</span>
            <p className="text-[11px] text-slate-500">
              Download seluruh data warga, transaksi kas, dan tagihan dalam format file .JSON.
            </p>
            <button
              onClick={exportDataAsJson}
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              Download File Backup JSON
            </button>
          </div>

          {/* Impor */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2">
            <span className="text-xs font-bold text-slate-800 block">Pulihkan dari File Backup</span>
            <p className="text-[11px] text-slate-500">
              Unggah file cadangan JSON yang sebelumnya pernah di-download.
            </p>
            <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Pilih File Backup JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Danger zone: Reset */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Reset ke Pengaturan Awal (Demo Mode)
            </span>
            <p className="text-[11px] text-slate-500">
              Kembalikan semua data warga, tagihan, dan kas ke data contoh awal.
            </p>
          </div>

          <button
            onClick={handleResetData}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Data Demo
          </button>
        </div>
      </div>

    </div>
  )
}
