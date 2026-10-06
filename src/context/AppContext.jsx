import React, { createContext, useContext, useState, useEffect } from 'react'
import confetti from 'canvas-confetti'
import { loadInitialStorage, saveStorageItem, deleteFromSupabase, resetAllStorage, syncAllFromSupabase, STORAGE_KEYS } from '../utils/storage'
import { INITIAL_USERS, INITIAL_RTS, INITIAL_KONTAK_DARURAT } from '../data/initialData'
import { isSupabaseConfigured, setSupabaseCredentials, supabaseUrl, supabase } from '../lib/supabase'
import { hashPassword } from '../utils/crypto'
import { 
  apiLogin, 
  createResidentTransaction, 
  filterResidentsByRole, 
  filterBillsByRole, 
  filterKasByRole,
  filterEventsByRole,
  filterTagihanEventsByRole,
  filterKontakDaruratByRole,
  generateUniqueUsername, 
  isUsernameAvailable,
  generateUniqueKodeUnik
} from '../services/authService'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [initialLoaded, setInitialLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')

  // Multi-User Authentication states (admin, rt, warga)
  const [users, setUsers] = useState([])
  const [rts, setRts] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [adminAuth, setAdminAuth] = useState({ username: 'admin', password: 'admin123' })
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [pendingAdminTab, setPendingAdminTab] = useState('dashboard')

  // Storage states
  const [config, setConfig] = useState(null)
  const [jenisIuran, setJenisIuran] = useState([])
  const [warga, setWarga] = useState([])
  const [tagihan, setTagihan] = useState([])
  const [kas, setKas] = useState([])
  const [events, setEvents] = useState([])
  const [tagihanEvents, setTagihanEvents] = useState([])
  const [pengaduan, setPengaduan] = useState([])
  const [surat, setSurat] = useState([])
  const [kontakDarurat, setKontakDarurat] = useState([])
  const [bankAccounts, setBankAccounts] = useState([])
  const [qrisAccounts, setQrisAccounts] = useState([])
  const [notifications, setNotifications] = useState([])
  const [auditLogs, setAuditLogs] = useState([])

  // Modal / UI states
  const [selectedTagihanKwitansi, setSelectedTagihanKwitansi] = useState(null)
  const [selectedTagihanBayar, setSelectedTagihanBayar] = useState(null)
  const [selectedTagihanVerifikasi, setSelectedTagihanVerifikasi] = useState(null)
  const [toast, setToast] = useState(null)

  // Modern Permission / Confirm Dialog State
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    subtext: '',
    confirmText: 'Hapus',
    cancelText: 'Batal',
    variant: 'emerald',
    resolve: null
  })

  // Load from localStorage & sync with Supabase
  useEffect(() => {
    const data = loadInitialStorage()
    setConfig(data.config)
    setJenisIuran(data.jenisIuran)
    setWarga(data.warga)
    setTagihan(data.tagihan)
    setKas(data.kas)
    if (data.bankAccounts) setBankAccounts(data.bankAccounts)
    if (data.qrisAccounts) setQrisAccounts(data.qrisAccounts)
    if (data.notifications) setNotifications(data.notifications)
    if (data.auditLogs) setAuditLogs(data.auditLogs)
    
    // Bersihkan pengumuman expired saat pertama load jika ada
    const nowTime = Date.now()
    const rawEvents = data.events || []
    const expiredIds = rawEvents.filter(e => e.autoHapus && e.expiredAt && !isNaN(new Date(e.expiredAt).getTime()) && new Date(e.expiredAt).getTime() <= nowTime).map(e => e.id)
    const initialCleanEvents = rawEvents.filter(e => !expiredIds.includes(e.id))
    const initialCleanTagihanEvents = (data.tagihanEvents || []).filter(te => !expiredIds.includes(te.eventId))

    setEvents(initialCleanEvents)
    setTagihanEvents(initialCleanTagihanEvents)
    if (expiredIds.length > 0) {
      saveStorageItem('events', initialCleanEvents)
      saveStorageItem('tagihan_events', initialCleanTagihanEvents)
    }

    const rawRts = data.rts || INITIAL_RTS
    const normalizedRts = rawRts.map(r => {
      const initMatch = INITIAL_RTS.find(init => init.id === r.id)
      return {
        ...initMatch,
        ...r,
        bendahara: r.bendahara || initMatch?.bendahara || 'Pengurus Kas RT',
        rekening: r.rekening || initMatch?.rekening || 'Kas RT Mandiri'
      }
    })
    setRts(normalizedRts)
    setUsers(data.users || INITIAL_USERS)
    setPengaduan(data.pengaduan || [])
    setSurat(data.surat || [])
    
    // Normalisasi kontak darurat agar relasi rt_id selalu valid
    const rawKontak = (data.kontakDarurat && data.kontakDarurat.length > 0) ? data.kontakDarurat : INITIAL_KONTAK_DARURAT
    const normalizedKontak = rawKontak.map(k => {
      if (!k.rt_id) {
        if (k.id === 'emg-2' || (k.nama && k.nama.includes('RT 01'))) return { ...k, rt_id: 'rt-1' }
        if (k.id === 'emg-rt-2' || (k.nama && k.nama.includes('RT 02'))) return { ...k, rt_id: 'rt-2' }
        if (k.id === 'emg-rt-3' || (k.nama && k.nama.includes('RT 03'))) return { ...k, rt_id: 'rt-3' }
      }
      return k
    })
    setKontakDarurat(normalizedKontak)
    if (data.adminAuth) setAdminAuth(data.adminAuth)

    // Cek status sesi login user yang tersimpan
    const savedUser = data.currentUser || JSON.parse(sessionStorage.getItem('wargaku_current_user') || 'null')
    if (savedUser) {
      setCurrentUser(savedUser)
      if (savedUser.role === 'warga') {
        setActiveTab('warga-dashboard')
      } else if (savedUser.role === 'rt') {
        setActiveTab('rt-dashboard')
      } else {
        setActiveTab('dashboard')
      }
    } else {
      setActiveTab('dashboard')
    }

    setInitialLoaded(true)

    // Sync online data dari Supabase jika terhubung
    if (isSupabaseConfigured && supabase) {
      syncAllFromSupabase().then(cloudData => {
        if (cloudData) {
          if (cloudData.config) setConfig(cloudData.config)
          if (cloudData.jenisIuran && cloudData.jenisIuran.length) setJenisIuran(cloudData.jenisIuran)
          if (cloudData.warga && cloudData.warga.length) setWarga(cloudData.warga)
          if (cloudData.tagihan && cloudData.tagihan.length) setTagihan(cloudData.tagihan)
          if (cloudData.kas && cloudData.kas.length) setKas(cloudData.kas)
          if (cloudData.events && cloudData.events.length) setEvents(cloudData.events)
          if (cloudData.tagihanEvents && cloudData.tagihanEvents.length) setTagihanEvents(cloudData.tagihanEvents)
          if (cloudData.users && cloudData.users.length) setUsers(cloudData.users)
          if (cloudData.rts && cloudData.rts.length) setRts(cloudData.rts)
          if (cloudData.pengaduan && cloudData.pengaduan.length) setPengaduan(cloudData.pengaduan)
          if (cloudData.surat && cloudData.surat.length) setSurat(cloudData.surat)
          if (cloudData.kontakDarurat && cloudData.kontakDarurat.length) setKontakDarurat(cloudData.kontakDarurat)
          if (cloudData.bankAccounts && cloudData.bankAccounts.length) setBankAccounts(cloudData.bankAccounts)
          if (cloudData.qrisAccounts && cloudData.qrisAccounts.length) setQrisAccounts(cloudData.qrisAccounts)
          if (cloudData.notifications && cloudData.notifications.length) setNotifications(cloudData.notifications)
          if (cloudData.auditLogs && cloudData.auditLogs.length) setAuditLogs(cloudData.auditLogs)
        }
      })

      // Realtime listener untuk semua tabel (sinkronisasi instan Web <-> Mobile)
      const channel = supabase
        .channel('web_realtime_all')
        .on('postgres_changes', { event: '*', schema: 'public' }, () => {
          syncAllFromSupabase().then(cloudData => {
            if (cloudData) {
              if (cloudData.config) setConfig(cloudData.config)
              if (cloudData.jenisIuran && cloudData.jenisIuran.length) setJenisIuran(cloudData.jenisIuran)
              if (cloudData.warga && cloudData.warga.length) setWarga(cloudData.warga)
              if (cloudData.tagihan && cloudData.tagihan.length) setTagihan(cloudData.tagihan)
              if (cloudData.kas && cloudData.kas.length) setKas(cloudData.kas)
              if (cloudData.events && cloudData.events.length) setEvents(cloudData.events)
              if (cloudData.tagihanEvents && cloudData.tagihanEvents.length) setTagihanEvents(cloudData.tagihanEvents)
              if (cloudData.users && cloudData.users.length) setUsers(cloudData.users)
              if (cloudData.rts && cloudData.rts.length) setRts(cloudData.rts)
              if (cloudData.pengaduan && cloudData.pengaduan.length) setPengaduan(cloudData.pengaduan)
              if (cloudData.surat && cloudData.surat.length) setSurat(cloudData.surat)
              if (cloudData.kontakDarurat && cloudData.kontakDarurat.length) setKontakDarurat(cloudData.kontakDarurat)
              if (cloudData.bankAccounts && cloudData.bankAccounts.length) setBankAccounts(cloudData.bankAccounts)
              if (cloudData.qrisAccounts && cloudData.qrisAccounts.length) setQrisAccounts(cloudData.qrisAccounts)
              if (cloudData.notifications && cloudData.notifications.length) setNotifications(cloudData.notifications)
              if (cloudData.auditLogs && cloudData.auditLogs.length) setAuditLogs(cloudData.auditLogs)
            }
          })
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  // State pelacak pesan / pengumuman yang sudah dibaca warga
  const [readEventIds, setReadEventIds] = useState([])

  // Load readEventIds berdasarkan user aktif
  useEffect(() => {
    const userKey = currentUser?.resident_id || currentUser?.id || 'warga_guest'
    try {
      const stored = localStorage.getItem(`sipl_read_events_${userKey}`)
      if (stored) {
        setReadEventIds(JSON.parse(stored))
      } else {
        setReadEventIds([])
      }
    } catch {
      setReadEventIds([])
    }
  }, [currentUser])

  // Mark single event as read
  const markEventAsRead = (eventId) => {
    if (!eventId) return
    const userKey = currentUser?.resident_id || currentUser?.id || 'warga_guest'
    setReadEventIds(prev => {
      if (prev.includes(eventId)) return prev
      const next = [...prev, eventId]
      try {
        localStorage.setItem(`sipl_read_events_${userKey}`, JSON.stringify(next))
      } catch (e) {
        console.error('Error saving read events:', e)
      }
      return next
    })
  }

  // Mark all scoped events as read
  const markAllEventsAsRead = () => {
    const userKey = currentUser?.resident_id || currentUser?.id || 'warga_guest'
    const allIds = scopedEvents.map(e => e.id)
    const combined = Array.from(new Set([...readEventIds, ...allIds]))
    setReadEventIds(combined)
    try {
      localStorage.setItem(`sipl_read_events_${userKey}`, JSON.stringify(combined))
      showToast('Semua pengumuman telah ditandai sudah dibaca', 'info')
    } catch (e) {
      console.error('Error saving read events:', e)
    }
  }

  // Periodic interval pembersihan pengumuman kedaluwarsa (setiap 30 detik)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      setEvents(prev => {
        const expired = prev.filter(e => e.autoHapus && e.expiredAt && !isNaN(new Date(e.expiredAt).getTime()) && new Date(e.expiredAt).getTime() <= now)
        if (expired.length > 0) {
          const expiredIds = expired.map(e => e.id)
          const valid = prev.filter(e => !expiredIds.includes(e.id))
          saveStorageItem('events', valid)
          setTagihanEvents(prevTe => {
            const validTe = prevTe.filter(te => !expiredIds.includes(te.eventId))
            saveStorageItem('tagihan_events', validTe)
            return validTe
          })
          return valid
        }
        return prev
      })
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  // Auto toast clear
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  // Promise-based confirm dialog popup
  const confirmDialog = ({
    title = 'Konfirmasi Tindakan',
    message = 'Apakah Anda yakin ingin melanjutkan tindakan ini?',
    subtext = '',
    confirmText = 'Hapus',
    cancelText = 'Batal',
    variant = 'emerald'
  }) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title,
        message,
        subtext,
        confirmText,
        cancelText,
        variant,
        resolve
      })
    })
  }

  const handleConfirmDialogConfirm = () => {
    if (confirmState.resolve) confirmState.resolve(true)
    setConfirmState(prev => ({ ...prev, isOpen: false, resolve: null }))
  }

  const handleConfirmDialogCancel = () => {
    if (confirmState.resolve) confirmState.resolve(false)
    setConfirmState(prev => ({ ...prev, isOpen: false, resolve: null }))
  }

  // --- Warga Actions ---
  const addWarga = (data) => {
    const newWarga = {
      ...data,
      id: `w-${Date.now()}`,
      rt_id: data.rt_id || rts[0]?.id || 'rt-1',
      kodeUnik: data.kodeUnik ? String(data.kodeUnik).trim() : generateUniqueKodeUnik(warga),
      aktif: true,
      created_at: new Date().toISOString()
    }
    const updated = [newWarga, ...warga]
    setWarga(updated)
    saveStorageItem('warga', updated)
    showToast(`Warga ${newWarga.nama} berhasil ditambahkan!`)
    return newWarga
  }

  // Pendaftaran Warga Baru + Akun Login (Atomic Transaction)
  const addWargaWithAccount = async ({ wargaData, accountData }) => {
    const res = await createResidentTransaction({
      wargaData,
      accountData,
      existingWarga: warga,
      existingUsers: users,
      rts
    })

    if (!res.success) {
      showToast(res.message, 'error')
      return res
    }

    // 1. Simpan Data Warga
    const updatedWarga = [res.warga, ...warga]
    setWarga(updatedWarga)
    saveStorageItem('warga', updatedWarga)

    // 2. Simpan Data User jika akun dibuat
    if (res.user) {
      const updatedUsers = [...users, res.user]
      setUsers(updatedUsers)
      saveStorageItem('users', updatedUsers)
    }

    showToast(res.message, 'success')
    return res
  }

  const updateWarga = (id, data) => {
    const updated = warga.map(w => w.id === id ? { ...w, ...data } : w)
    setWarga(updated)
    saveStorageItem('warga', updated)
    showToast('Data warga berhasil diperbarui!')
  }

  // Warga & Admin: Mengupdate susunan anggota keluarga (warga isi sendiri)
  const updateAnggotaKeluarga = (wargaId, anggotaList) => {
    const updated = warga.map(w => {
      if (w.id === wargaId) {
        return {
          ...w,
          anggotaKeluarga: anggotaList,
          jumlahJiwa: anggotaList.length || 1
        }
      }
      return w
    })
    setWarga(updated)
    saveStorageItem('warga', updated)
    showToast('Data anggota keluarga berhasil diperbarui!', 'success')
  }

  // Mengupdate titik koordinat lokasi rumah warga di peta
  const updateLokasiRumah = (wargaId, { lat, lng }) => {
    const updated = warga.map(w => {
      if (w.id === wargaId) {
        return {
          ...w,
          lat: Number(lat),
          lng: Number(lng)
        }
      }
      return w
    })
    setWarga(updated)
    saveStorageItem('warga', updated)
    showToast('Titik koordinat rumah berhasil diperbarui!', 'success')
  }

  const deleteWarga = (id) => {
    const target = warga.find(w => w.id === id)
    const updated = warga.filter(w => w.id !== id)
    setWarga(updated)
    saveStorageItem('warga', updated)
    deleteFromSupabase('warga', id)

    // Hapus juga akun user terkait jika ada
    const updatedUsers = users.filter(u => u.resident_id !== id)
    if (updatedUsers.length !== users.length) {
      setUsers(updatedUsers)
      saveStorageItem('users', updatedUsers)
      const deletedUser = users.find(u => u.resident_id === id)
      if (deletedUser) deleteFromSupabase('users', deletedUser.id)
    }

    showToast(`Data warga ${target?.nama || ''} telah dihapus.`, 'warning')
  }

  // --- User Account CRUD Actions ---
  const addUserAccount = async ({ username, password, role = 'admin', rt_id = null, name = '', phone = '' }) => {
    const cleanUser = (username || '').trim().toLowerCase()
    const cleanPass = (password || '').trim()
    const cleanPhone = (phone || '').trim()

    if (!cleanUser) {
      showToast('Username wajib diisi!', 'error')
      return { success: false, message: 'Username wajib diisi!' }
    }
    if (!isUsernameAvailable(cleanUser)) {
      showToast(`Username "${cleanUser}" sudah digunakan!`, 'error')
      return { success: false, message: `Username "${cleanUser}" sudah digunakan!` }
    }
    if (!cleanPass || cleanPass.length < 4) {
      showToast('Kata sandi minimal 4 karakter!', 'error')
      return { success: false, message: 'Kata sandi minimal 4 karakter!' }
    }

    const passwordHash = await hashPassword(cleanPass)
    const targetRtId = role === 'rt' ? (rt_id || rts[0]?.id || 'rt-1') : null
    const rtInfo = rts.find(r => r.id === targetRtId)
    const displayName = name.trim() || (role === 'admin' ? `Admin (${cleanUser})` : `Pengurus ${rtInfo?.name || 'RT'}`)

    const newUser = {
      id: `u-${Date.now()}`,
      username: cleanUser,
      aliases: [cleanUser],
      password_hash: passwordHash,
      name: displayName,
      phone: cleanPhone,
      role: role, // 'admin' | 'rt' | 'warga'
      resident_id: null,
      rt_id: targetRtId,
      status: 'active',
      created_at: new Date().toISOString()
    }

    const updated = [newUser, ...users]
    setUsers(updated)
    saveStorageItem('users', updated)

    // Jika akun RT dan nomor WA diisi, sinkronkan juga ke master RTS
    if (role === 'rt' && targetRtId && cleanPhone) {
      const updatedRts = rts.map(r => r.id === targetRtId ? { ...r, kontak: cleanPhone, ketua: displayName } : r)
      setRts(updatedRts)
      saveStorageItem('rts', updatedRts)
    }

    // OTOMATIS DAFTARKAN SEBAGAI KONTAK DARURAT JIKA OPSI RT DIPILIH
    if (role === 'rt' && targetRtId) {
      const contactPhone = cleanPhone || rtInfo?.kontak || ''
      const rtName = rtInfo?.name || 'RT'
      const contactTitle = displayName || `Ketua ${rtName} (${cleanUser})`

      setKontakDarurat(prev => {
        const existingIdx = prev.findIndex(k => k.rt_id === targetRtId || (k.id === `emg-rt-${targetRtId}`) || (targetRtId === 'rt-1' && k.id === 'emg-2'))
        let nextList
        if (existingIdx >= 0) {
          nextList = prev.map((k, idx) => {
            if (idx === existingIdx) {
              return {
                ...k,
                nama: contactTitle,
                nomor: contactPhone || k.nomor,
                wa: contactPhone || k.wa,
                rt_id: targetRtId,
                kategori: 'Pengurus Lingkungan'
              }
            }
            return k
          })
        } else {
          const newEmg = {
            id: `emg-rt-${targetRtId}`,
            nama: contactTitle,
            kategori: 'Pengurus Lingkungan',
            nomor: contactPhone,
            wa: contactPhone,
            deskripsi: `Pelayanan tanggap darurat & koordinasi pengurus wilayah ${rtName}`,
            icon: 'User',
            urgent: false,
            color: 'bg-indigo-50 text-indigo-800 border-indigo-200',
            rt_id: targetRtId
          }
          nextList = [...prev, newEmg]
        }
        saveStorageItem('kontak_darurat', nextList)
        return nextList
      })
    }

    showToast(`Akun ${newUser.username} (${newUser.role.toUpperCase()}) berhasil dibuat!`)
    return { success: true, user: newUser }
  }

  const updateUserAccount = async (id, { username, password, role, rt_id, name, phone }) => {
    const target = users.find(u => u.id === id)
    if (!target) return { success: false, message: 'Akun tidak ditemukan' }

    const cleanUser = (username || target.username).trim().toLowerCase()
    if (!isUsernameAvailable(cleanUser, id)) {
      showToast(`Username "${cleanUser}" sudah digunakan akun lain!`, 'error')
      return { success: false, message: 'Username sudah digunakan' }
    }

    let passwordHash = target.password_hash

    if (password && password.trim()) {
      const cleanPass = password.trim()
      passwordHash = await hashPassword(cleanPass)
    }

    const targetRtId = role === 'rt' ? (rt_id || target.rt_id || 'rt-1') : null
    const rtInfo = rts.find(r => r.id === targetRtId)
    const displayName = name ? name.trim() : (role === 'admin' ? `Admin (${cleanUser})` : `Pengurus ${rtInfo?.name || 'RT'}`)
    const cleanPhone = phone !== undefined ? phone.trim() : (target.phone || '')

    const updated = users.map(u => {
      if (u.id === id) {
        const { password: _p, passwords: _ps, ...cleanTarget } = u
        return {
          ...cleanTarget,
          username: cleanUser,
          aliases: [cleanUser, u.id],
          password_hash: passwordHash,
          name: displayName,
          phone: cleanPhone,
          role: role || u.role,
          rt_id: targetRtId,
          updated_at: new Date().toISOString()
        }
      }
      return u
    })

    setUsers(updated)
    saveStorageItem('users', updated)

    // Jika akun RT dan nomor WA diisi, sinkronkan ke master RTS
    if (role === 'rt' && targetRtId && cleanPhone) {
      const updatedRts = rts.map(r => r.id === targetRtId ? { ...r, kontak: cleanPhone, ketua: displayName } : r)
      setRts(updatedRts)
      saveStorageItem('rts', updatedRts)
    }

    // OTOMATIS SINKRONKAN KE KONTAK DARURAT JIKA AKUN PENGURUS RT
    if (role === 'rt' && targetRtId) {
      const contactPhone = cleanPhone || rtInfo?.kontak || ''
      const rtName = rtInfo?.name || 'RT'
      const contactTitle = displayName || `Ketua ${rtName} (${cleanUser})`

      setKontakDarurat(prev => {
        const existingIdx = prev.findIndex(k => k.rt_id === targetRtId || (k.id === `emg-rt-${targetRtId}`) || (targetRtId === 'rt-1' && k.id === 'emg-2'))
        let nextList
        if (existingIdx >= 0) {
          nextList = prev.map((k, idx) => {
            if (idx === existingIdx) {
              return {
                ...k,
                nama: contactTitle,
                nomor: contactPhone || k.nomor,
                wa: contactPhone || k.wa,
                rt_id: targetRtId,
                kategori: 'Pengurus Lingkungan'
              }
            }
            return k
          })
        } else {
          const newEmg = {
            id: `emg-rt-${targetRtId}`,
            nama: contactTitle,
            kategori: 'Pengurus Lingkungan',
            nomor: contactPhone,
            wa: contactPhone,
            deskripsi: `Pelayanan tanggap darurat & koordinasi pengurus wilayah ${rtName}`,
            icon: 'User',
            urgent: false,
            color: 'bg-indigo-50 text-indigo-800 border-indigo-200',
            rt_id: targetRtId
          }
          nextList = [...prev, newEmg]
        }
        saveStorageItem('kontak_darurat', nextList)
        return nextList
      })
    } else if (target.role === 'rt' && role === 'admin' && target.rt_id) {
      // Jika peran diganti ke Admin dan tidak ada pengurus RT lain, bersihkan dari kontak darurat
      const otherRtUsers = updated.filter(u => u.role === 'rt' && u.rt_id === target.rt_id)
      if (otherRtUsers.length === 0) {
        setKontakDarurat(prev => {
          const nextList = prev.filter(k => k.rt_id !== target.rt_id && k.id !== `emg-rt-${target.rt_id}`)
          saveStorageItem('kontak_darurat', nextList)
          return nextList
        })
      }
    }

    showToast(`Akun ${cleanUser} berhasil diperbarui!`)
    return { success: true }
  }

  const deleteUserAccount = async (id) => {
    const target = users.find(u => u.id === id)
    if (!target) return

    if (target.username === 'admin' && users.filter(u => u.role === 'admin').length <= 1) {
      showToast('Tidak dapat menghapus satu-satunya akun Super Admin!', 'error')
      return
    }

    const ok = await confirmDialog({
      title: 'Hapus Akun Pengguna?',
      message: `Apakah Anda yakin ingin menghapus akun ${target.username} (${target.role.toUpperCase()})?`,
      subtext: 'Pengguna tidak akan bisa login lagi setelah akun dihapus.',
      confirmText: 'Ya, Hapus Akun',
      cancelText: 'Batal',
      variant: 'rose'
    })

    if (ok) {
      const updated = users.filter(u => u.id !== id)
      setUsers(updated)
      saveStorageItem('users', updated)
      deleteFromSupabase('users', id)

      // Jika akun RT dihapus dan tidak ada pengurus RT lain, bersihkan dari kontak darurat
      if (target.role === 'rt' && target.rt_id) {
        const remainingRtAccounts = updated.filter(u => u.role === 'rt' && u.rt_id === target.rt_id)
        if (remainingRtAccounts.length === 0) {
          setKontakDarurat(prev => {
            const nextList = prev.filter(k => k.rt_id !== target.rt_id && k.id !== `emg-rt-${target.rt_id}`)
            saveStorageItem('kontak_darurat', nextList)
            return nextList
          })
        }
      }

      showToast(`Akun ${target.username} telah dihapus.`, 'warning')
    }
  }

  // --- Jenis Iuran Actions ---
  const addJenisIuran = (data) => {
    const newItem = {
      ...data,
      id: `ji-${Date.now()}`,
      nominal: Number(data.nominal) || 0,
      aktif: true
    }
    const updated = [...jenisIuran, newItem]
    setJenisIuran(updated)
    saveStorageItem('jenis_iuran', updated)
    showToast(`Jenis iuran ${newItem.nama} ditambahkan!`)
  }

  const updateJenisIuran = (id, data) => {
    const updated = jenisIuran.map(item => item.id === id ? { ...item, ...data, nominal: Number(data.nominal) || 0 } : item)
    setJenisIuran(updated)
    saveStorageItem('jenis_iuran', updated)
    showToast('Jenis iuran diperbarui!')
  }

  const toggleJenisIuran = (id) => {
    const updated = jenisIuran.map(item => item.id === id ? { ...item, aktif: !item.aktif } : item)
    setJenisIuran(updated)
    saveStorageItem('jenis_iuran', updated)
  }

  // --- Notifications & Audit Logs ---
  const addNotification = (notif) => {
    const newNotif = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      user_id: notif.user_id || null,
      warga_id: notif.warga_id || null,
      title: notif.title || 'Notifikasi Pembayaran',
      message: notif.message || '',
      type: notif.type || 'info',
      tagihan_id: notif.tagihan_id || null,
      read: false,
      created_at: new Date().toISOString()
    }
    const updated = [newNotif, ...notifications]
    setNotifications(updated)
    saveStorageItem('notifications', updated)
    return newNotif
  }

  const markNotificationRead = (notifId) => {
    const updated = notifications.map(n => n.id === notifId ? { ...n, read: true } : n)
    setNotifications(updated)
    saveStorageItem('notifications', updated)
  }

  const addAuditLog = (log) => {
    const actorName = currentUser?.name || (currentUser?.role === 'admin' ? 'Super Administrator' : currentUser?.role === 'rt' ? 'Pengurus RT' : 'Warga')
    const newLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      actor_id: currentUser?.id || 'sys',
      actor_name: log.actor_name || actorName,
      actor_role: currentUser?.role || 'system',
      action: log.action || 'TRANSACTION',
      target_id: log.target_id || null,
      target_type: log.target_type || 'tagihan',
      reason: log.reason || null,
      details: log.details || {},
      created_at: new Date().toISOString()
    }
    const updated = [newLog, ...auditLogs]
    setAuditLogs(updated)
    saveStorageItem('audit_logs', updated)
    return newLog
  }

  // --- Bank & QRIS Accounts CRUD ---
  const addBankAccount = async (data) => {
    const newAcc = {
      id: `ba-${Date.now()}`,
      owner_type: data.owner_type || 'RT',
      owner_id: data.owner_id || 'rt-1',
      bank_name: data.bank_name || 'BCA',
      account_number: data.account_number || '',
      account_holder: data.account_holder || '',
      is_primary: data.is_primary ?? false,
      is_active: data.is_active ?? true,
      created_at: new Date().toISOString()
    }
    let updated = [...bankAccounts]
    if (newAcc.is_primary) {
      updated = updated.map(b => (b.owner_type === newAcc.owner_type && b.owner_id === newAcc.owner_id) ? { ...b, is_primary: false } : b)
    }
    updated.push(newAcc)
    setBankAccounts(updated)
    saveStorageItem('bank_accounts', updated)
    showToast(`Rekening ${newAcc.bank_name} berhasil ditambahkan!`)
    return newAcc
  }

  const updateBankAccount = async (id, data) => {
    let updated = [...bankAccounts]
    const target = updated.find(b => b.id === id)
    if (!target) return
    if (data.is_primary) {
      const ownerType = target.owner_type
      const ownerId = target.owner_id
      updated = updated.map(b => (b.owner_type === ownerType && b.owner_id === ownerId) ? { ...b, is_primary: false } : b)
    }
    updated = updated.map(b => b.id === id ? { ...b, ...data } : b)
    setBankAccounts(updated)
    saveStorageItem('bank_accounts', updated)
    showToast('Rekening berhasil diperbarui!')
  }

  const deleteBankAccount = async (id) => {
    const updated = bankAccounts.filter(b => b.id !== id)
    setBankAccounts(updated)
    saveStorageItem('bank_accounts', updated)
    deleteFromSupabase('bank_accounts', id)
    showToast('Rekening telah dihapus.', 'info')
  }

  const addQrisAccount = async (data) => {
    const newQris = {
      id: `qa-${Date.now()}`,
      owner_type: data.owner_type || 'RT',
      owner_id: data.owner_id || 'rt-1',
      qris_name: data.qris_name || 'QRIS',
      image_url: data.image_url || '',
      nmid: data.nmid || '',
      is_primary: data.is_primary ?? false,
      is_active: data.is_active ?? true,
      created_at: new Date().toISOString()
    }
    let updated = [...qrisAccounts]
    if (newQris.is_primary) {
      updated = updated.map(q => (q.owner_type === newQris.owner_type && q.owner_id === newQris.owner_id) ? { ...q, is_primary: false } : q)
    }
    updated.push(newQris)
    setQrisAccounts(updated)
    saveStorageItem('qris_accounts', updated)
    showToast(`QRIS ${newQris.qris_name} berhasil ditambahkan!`)
    return newQris
  }

  const updateQrisAccount = async (id, data) => {
    let updated = [...qrisAccounts]
    const target = updated.find(q => q.id === id)
    if (!target) return
    if (data.is_primary) {
      const ownerType = target.owner_type
      const ownerId = target.owner_id
      updated = updated.map(q => (q.owner_type === ownerType && q.owner_id === ownerId) ? { ...q, is_primary: false } : q)
    }
    updated = updated.map(q => q.id === id ? { ...q, ...data } : q)
    setQrisAccounts(updated)
    saveStorageItem('qris_accounts', updated)
    showToast('QRIS berhasil diperbarui!')
  }

  const deleteQrisAccount = async (id) => {
    const updated = qrisAccounts.filter(q => q.id !== id)
    setQrisAccounts(updated)
    saveStorageItem('qris_accounts', updated)
    deleteFromSupabase('qris_accounts', id)
    showToast('QRIS telah dihapus.', 'info')
  }

  // --- Tagihan Actions ---
  const generateTagihanMassal = (bulan, tahun, targetRtId = null, scope = 'ALL') => {
    const b = Number(bulan)
    const t = Number(tahun)
    
    // Ambil jenis iuran yang aktif berdasarkan scope
    const activeIuran = jenisIuran.filter(j => {
      if (!j.aktif) return false
      if (scope === 'RT') return j.payment_scope !== 'RW'
      if (scope === 'RW') return j.payment_scope === 'RW'
      return true
    })
    const totalTarif = activeIuran.reduce((acc, curr) => acc + (curr.nominal || 0), 0)
    const rincian = activeIuran.map(j => ({ nama: j.nama, nominal: j.nominal, scope: j.payment_scope || 'RT' }))

    const isRtUser = currentUser?.role === 'rt'
    const finalRtId = isRtUser ? (currentUser?.rt_id || 'rt-1') : targetRtId

    const targetWargaList = warga.filter(w => {
      if (w.aktif === false) return false
      if (finalRtId) return w.rt_id === finalRtId
      return true
    })

    let countCreated = 0
    const newInvoices = []

    targetWargaList.forEach(w => {
      // Cek apakah sudah ada tagihan untuk warga ini di periode tsb
      const exists = tagihan.some(tag => tag.wargaId === w.id && tag.bulan === b && tag.tahun === t && (scope === 'ALL' || tag.payment_scope === scope))
      if (!exists) {
        const rtObj = rts.find(r => r.id === (w.rt_id || 'rt-1'))
        const rtName = rtObj?.name || 'RT 01'
        const paymentScope = scope === 'RW' ? 'RW' : (scope === 'RT' ? 'RT' : (finalRtId ? 'RT' : 'RW'))
        const recipientLabel = paymentScope === 'RW' ? 'RW 15' : rtName

        newInvoices.push({
          id: `tag-${t}-${String(b).padStart(2, '0')}-${w.id}-${scope !== 'ALL' ? scope.toLowerCase() : 'all'}`,
          wargaId: w.id,
          namaWarga: w.nama,
          blok: w.blok,
          noRumah: w.noRumah,
          bulan: b,
          tahun: t,
          total: totalTarif,
          rincian: rincian,
          status: 'Belum Lunas',
          payment_scope: paymentScope,
          pembayaran_kepada: recipientLabel,
          target_rt_id: w.rt_id || 'rt-1',
          submissions: [],
          tanggalBayar: null,
          metodeBayar: null,
          noKwitansi: null,
          catatan: ''
        })
        countCreated++
      }
    })

    if (countCreated === 0) {
      const rtLabel = finalRtId ? ((rts.find(r => r.id === finalRtId)?.name || 'RT') + ' ') : ''
      showToast(`Semua warga ${rtLabel}sudah memiliki tagihan untuk periode ${b}/${t}`, 'info')
      return 0
    }

    const updated = [...newInvoices, ...tagihan]
    setTagihan(updated)
    saveStorageItem('tagihan', updated)
    const targetLabel = finalRtId ? ` untuk warga ${rts.find(r => r.id === finalRtId)?.name || 'RT'}` : ''
    showToast(`Berhasil menerbitkan ${countCreated} tagihan iuran baru${targetLabel}!`)
    return countCreated
  }

  const addTagihanManual = (data) => {
    const { wargaId, bulan, tahun, total, rincian, status, metodeBayar, tanggalBayar, catatan, payment_scope, target_rt_id } = data
    const isPaid = status === 'Lunas'
    const targetWarga = warga.find(w => w.id === wargaId)
    const rtObj = rts.find(r => r.id === (target_rt_id || targetWarga?.rt_id || 'rt-1'))
    const rtName = rtObj?.name || 'RT 01'
    const scope = payment_scope || 'RT'
    const isRw = scope === 'RW'
    const rtCode = isRw ? 'RW15' : rtName.replace(/\s+/g, '').toUpperCase()
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const randomSeq = String(Math.floor(1000 + Math.random() * 9000)).padStart(6, '0')
    const noKwitansi = isPaid ? `${rtCode}-${datePart}-${randomSeq}` : null
    const tId = `tag-${tahun}-${String(bulan).padStart(2, '0')}-${wargaId}-${Date.now().toString().slice(-4)}`

    const newBill = {
      id: tId,
      wargaId,
      namaWarga: targetWarga?.nama || 'Warga',
      blok: targetWarga?.blok || 'A',
      noRumah: targetWarga?.noRumah || '01',
      bulan: Number(bulan),
      tahun: Number(tahun),
      total: Number(total),
      rincian: rincian || [],
      status: isPaid ? 'Lunas' : (status || 'Belum Lunas'),
      payment_scope: scope,
      pembayaran_kepada: isRw ? 'RW 15' : rtName,
      target_rt_id: targetWarga?.rt_id || 'rt-1',
      submissions: [],
      tanggalBayar: isPaid ? (tanggalBayar || new Date().toISOString().slice(0, 10)) : null,
      metodeBayar: isPaid ? (metodeBayar || 'Tunai') : null,
      noKwitansi,
      catatan: catatan || ''
    }

    const updatedTagihan = [newBill, ...tagihan]
    setTagihan(updatedTagihan)
    saveStorageItem('tagihan', updatedTagihan)

    if (isPaid) {
      const newKasEntry = {
        id: `kas-auto-${Date.now()}`,
        tanggal: newBill.tanggalBayar,
        tipe: 'Masuk',
        kategori: 'Iuran Warga',
        deskripsi: `IPL ${targetWarga?.nama || 'Warga'} (${targetWarga?.blok}/${targetWarga?.noRumah}) bln ${bulan}/${tahun} (${noKwitansi})`,
        nominal: newBill.total,
        tagihanId: newBill.id,
        scope: isRw ? 'rw' : 'rt',
        rt_id: targetWarga?.rt_id || 'rt-1'
      }
      const updatedKas = [newKasEntry, ...kas]
      setKas(updatedKas)
      saveStorageItem('kas', updatedKas)
    }

    showToast(`Tagihan untuk ${targetWarga?.nama || 'Warga'} berhasil ditambahkan!`)
    return newBill
  }

  const bayarTagihan = (tagihanId, { metodeBayar, tanggalBayar, catatan }) => {
    if (isWarga) {
      showToast('Akses ditolak: Hanya Pengurus RT atau Admin yang berwenang mencatat pelunasan iuran.', 'error')
      return
    }

    const targetTagihan = tagihan.find(t => t.id === tagihanId)
    if (!targetTagihan) return

    const wargaData = warga.find(w => w.id === targetTagihan.wargaId)
    const today = tanggalBayar || new Date().toISOString().slice(0, 10)
    const isRwScope = targetTagihan.payment_scope === 'RW'
    const rtCode = isRwScope ? 'RW15' : ((rts.find(r => r.id === (targetTagihan.target_rt_id || wargaData?.rt_id))?.name || 'RT01').replace(/\s+/g, '').toUpperCase())
    const datePart = today.replace(/-/g, '')
    const randomSeq = String(Math.floor(1000 + Math.random() * 9000)).padStart(6, '0')
    const noKwitansi = `${rtCode}-${datePart}-${randomSeq}`

    const verifierName = currentUser?.name || (currentUser?.role === 'admin' ? 'Super Administrator' : 'Bendahara ' + (isRwScope ? 'RW 15' : 'RT'))

    // Update tagihan
    const updatedTagihan = tagihan.map(t => {
      if (t.id === tagihanId) {
        return {
          ...t,
          status: 'Lunas',
          tanggalBayar: today,
          metodeBayar: metodeBayar || 'Tunai',
          noKwitansi: noKwitansi,
          catatan: catatan || '',
          alasanPenolakan: null,
          alasanTolak: null,
          diverifikasi_oleh: verifierName
        }
      }
      return t
    })

    // Otomatis masukkan ke Kas sebagai pemasukan
    const newKasEntry = {
      id: `kas-auto-${Date.now()}`,
      tanggal: today,
      tipe: 'Masuk',
      kategori: 'Iuran Warga',
      deskripsi: `IPL ${wargaData?.nama || 'Warga'} (${wargaData?.blok}/${wargaData?.noRumah}) bln ${targetTagihan.bulan}/${targetTagihan.tahun} (${noKwitansi})`,
      nominal: targetTagihan.total,
      tagihanId: tagihanId,
      scope: isRwScope ? 'rw' : 'rt',
      rt_id: wargaData?.rt_id || 'rt-1'
    }

    const updatedKas = [newKasEntry, ...kas]

    setTagihan(updatedTagihan)
    setKas(updatedKas)
    saveStorageItem('tagihan', updatedTagihan)
    saveStorageItem('kas', updatedKas)

    addNotification({
      user_id: targetTagihan.wargaId,
      warga_id: targetTagihan.wargaId,
      title: 'Pembayaran Diterima (Lunas)',
      message: `Pembayaran IPL periode ${targetTagihan.bulan}/${targetTagihan.tahun} telah dicatat Lunas oleh ${verifierName}. (No. Kwitansi: ${noKwitansi})`,
      type: 'success',
      tagihan_id: tagihanId
    })

    addAuditLog({
      action: 'BAYAR_MANUAL',
      actor_name: verifierName,
      target_id: tagihanId,
      target_type: 'tagihan',
      reason: null,
      details: {
        nominal: targetTagihan.total,
        receipt_no: noKwitansi,
        metode: metodeBayar || 'Tunai'
      }
    })

    // Trigger celebration effect
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 }
      })
    } catch (e) {}

    showToast(`Pembayaran Rp ${targetTagihan.total.toLocaleString()} berhasil dicatat (Kwitansi: ${noKwitansi})`)
  }

  const batalBayarTagihan = (tagihanId) => {
    if (isWarga) {
      showToast('Akses ditolak: Hanya Pengurus RT atau Admin yang dapat membatalkan pembayaran.', 'error')
      return
    }

    const updatedTagihan = tagihan.map(t => {
      if (t.id === tagihanId) {
        return {
          ...t,
          status: 'Belum Lunas',
          tanggalBayar: null,
          metodeBayar: null,
          noKwitansi: null,
          catatan: '',
          alasanPenolakan: null,
          alasanTolak: null
        }
      }
      return t
    })

    // Hapus transaksi kas otomatis yang berelasi
    const updatedKas = kas.filter(k => k.tagihanId !== tagihanId)

    setTagihan(updatedTagihan)
    setKas(updatedKas)
    saveStorageItem('tagihan', updatedTagihan)
    saveStorageItem('kas', updatedKas)
    showToast('Status pembayaran berhasil dibatalkan.', 'warning')
  }

  const deleteTagihan = (tagihanId) => {
    if (isWarga) {
      showToast('Akses ditolak: Hanya Pengurus RT atau Admin yang dapat menghapus tagihan.', 'error')
      return
    }

    const updated = tagihan.filter(t => t.id !== tagihanId)
    setTagihan(updated)
    saveStorageItem('tagihan', updated)
    showToast('Tagihan telah dihapus.', 'info')
  }

  const uploadBuktiTransfer = (tagihanId, { buktiTransferUrl, bankPengirim, catatanWarga, nominalBayar }) => {
    const targetTagihan = tagihan.find(t => t.id === tagihanId)
    if (!targetTagihan) return
    const targetWarga = warga.find(w => w.id === targetTagihan.wargaId)

    const nowIso = new Date().toISOString()
    const currentSubmissions = Array.isArray(targetTagihan.submissions) ? [...targetTagihan.submissions] : []
    const newSubmissionNum = currentSubmissions.length + 1
    const newSubmission = {
      id: `sub-${tagihanId}-${newSubmissionNum}`,
      submission_no: newSubmissionNum,
      nominal: Number(nominalBayar) || targetTagihan.total,
      tanggal: nowIso,
      bukti_url: buktiTransferUrl || null,
      metode: bankPengirim || 'Transfer Bank',
      status: 'Menunggu Verifikasi',
      catatan: catatanWarga || '',
      alasan_penolakan: null
    }

    const updatedSubmissions = [...currentSubmissions, newSubmission]

    const updated = tagihan.map(t => {
      if (t.id === tagihanId) {
        return {
          ...t,
          status: 'Menunggu Verifikasi',
          buktiTransferUrl,
          tanggalUploadBukti: nowIso,
          bankPengirim: bankPengirim || 'Transfer Bank',
          catatanWarga: catatanWarga || '',
          alasanPenolakan: null,
          alasanTolak: null,
          submissions: updatedSubmissions
        }
      }
      return t
    })

    setTagihan(updated)
    saveStorageItem('tagihan', updated)

    addNotification({
      user_id: targetTagihan.wargaId,
      warga_id: targetTagihan.wargaId,
      title: 'Bukti Pembayaran Diunggah',
      message: `Bukti pembayaran #${newSubmissionNum} untuk tagihan ${targetTagihan.bulan}/${targetTagihan.tahun} sedang diverifikasi pengurus.`,
      type: 'info',
      tagihan_id: tagihanId
    })

    // Notifikasi untuk Pengurus RT / Admin
    addNotification({
      user_id: 'admin',
      target_role: 'admin',
      target_rt_id: targetWarga?.rt_id,
      title: '💳 Bukti Pembayaran Masuk',
      message: `Warga ${targetWarga?.nama || 'Warga'} (Blok ${targetWarga?.blok || 'A'}/${targetWarga?.noRumah || '-'}) telah membayar IPL periode ${targetTagihan.bulan}/${targetTagihan.tahun}.`,
      type: 'payment_pending',
      tagihan_id: tagihanId
    })

    addAuditLog({
      action: 'UPLOAD_BUKTI',
      actor_name: targetWarga?.nama || 'Warga',
      target_id: tagihanId,
      target_type: 'tagihan',
      reason: null,
      details: {
        submission_no: newSubmissionNum,
        nominal: newSubmission.nominal,
        metode: newSubmission.metode
      }
    })

    showToast('Bukti transfer berhasil diunggah! Menunggu verifikasi pengurus.')
  }

  const verifikasiBuktiTransfer = (tagihanId, action, { alasanTolak, metodeBayar, catatan } = {}) => {
    const targetTagihan = tagihan.find(t => t.id === tagihanId)
    if (!targetTagihan) return
    const targetWarga = warga.find(w => w.id === targetTagihan.wargaId)

    const isRwScope = targetTagihan.payment_scope === 'RW'
    const rtCode = isRwScope ? 'RW15' : ((rts.find(r => r.id === (targetTagihan.target_rt_id || targetWarga?.rt_id))?.name || 'RT01').replace(/\s+/g, '').toUpperCase())
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const randomSeq = String(Math.floor(1000 + Math.random() * 9000)).padStart(6, '0')
    const receiptNo = `${rtCode}-${datePart}-${randomSeq}`

    const verifierName = currentUser?.name || (currentUser?.role === 'admin' ? 'Super Administrator' : 'Bendahara ' + (isRwScope ? 'RW 15' : 'RT'))
    const nowIso = new Date().toISOString()
    const today = nowIso.slice(0, 10)

    if (action === 'terima') {
      const finalMetode = metodeBayar || targetTagihan.bankPengirim || 'Transfer Bank'
      const currentSubmissions = Array.isArray(targetTagihan.submissions) ? [...targetTagihan.submissions] : []
      const updatedSubmissions = currentSubmissions.length > 0 
        ? currentSubmissions.map((s, idx) => idx === currentSubmissions.length - 1 ? {
            ...s,
            status: 'Lunas',
            verified_at: nowIso,
            verified_by: verifierName
          } : s)
        : [{
            id: `sub-${tagihanId}-1`,
            submission_no: 1,
            nominal: targetTagihan.total,
            tanggal: nowIso,
            metode: finalMetode,
            status: 'Lunas',
            verified_by: verifierName
          }]

      const updated = tagihan.map(t => {
        if (t.id === tagihanId) {
          return {
            ...t,
            status: 'Lunas',
            tanggalBayar: today,
            metodeBayar: finalMetode,
            noKwitansi: receiptNo,
            alasanPenolakan: null,
            alasanTolak: null,
            diverifikasi_oleh: verifierName,
            submissions: updatedSubmissions
          }
        }
        return t
      })

      const newKasEntry = {
        id: `kas-auto-${Date.now()}`,
        tanggal: today,
        tipe: 'Masuk',
        kategori: 'Iuran Warga',
        deskripsi: `IPL ${targetWarga?.nama || 'Warga'} (${targetWarga?.blok}/${targetWarga?.noRumah}) bln ${targetTagihan.bulan}/${targetTagihan.tahun} (${receiptNo})`,
        nominal: targetTagihan.total,
        tagihanId: tagihanId,
        scope: isRwScope ? 'rw' : 'rt',
        rt_id: targetWarga?.rt_id || 'rt-1'
      }
      const updatedKas = [newKasEntry, ...kas]

      setTagihan(updated)
      setKas(updatedKas)
      saveStorageItem('tagihan', updated)
      saveStorageItem('kas', updatedKas)

      addNotification({
        user_id: targetTagihan.wargaId,
        warga_id: targetTagihan.wargaId,
        title: 'Pembayaran Diterima (Lunas)',
        message: `Pembayaran IPL periode ${targetTagihan.bulan}/${targetTagihan.tahun} telah diverifikasi dan dinyatakan LUNAS. (No. Kwitansi: ${receiptNo})`,
        type: 'success',
        tagihan_id: tagihanId
      })

      addAuditLog({
        action: 'VERIFIKASI_TERIMA',
        actor_name: verifierName,
        target_id: tagihanId,
        target_type: 'tagihan',
        reason: null,
        details: {
          nominal: targetTagihan.total,
          receipt_no: receiptNo,
          metode: finalMetode
        }
      })

      try {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.7 } })
      } catch (e) {}

      showToast(`Pembayaran ${targetWarga?.nama || 'Warga'} diverifikasi Lunas! (${receiptNo})`)
    } else if (action === 'tolak') {
      const rejectReason = (alasanTolak || 'Nominal tidak sesuai atau bukti pembayaran tidak jelas.').trim()
      const currentSubmissions = Array.isArray(targetTagihan.submissions) ? [...targetTagihan.submissions] : []
      const updatedSubmissions = currentSubmissions.length > 0 
        ? currentSubmissions.map((s, idx) => idx === currentSubmissions.length - 1 ? {
            ...s,
            status: 'Ditolak',
            alasan_penolakan: rejectReason,
            rejected_at: nowIso,
            rejected_by: verifierName
          } : s)
        : [{
            id: `sub-${tagihanId}-1`,
            submission_no: 1,
            nominal: targetTagihan.total,
            tanggal: nowIso,
            status: 'Ditolak',
            alasan_penolakan: rejectReason,
            rejected_by: verifierName
          }]

      const updated = tagihan.map(t => {
        if (t.id === tagihanId) {
          return {
            ...t,
            status: 'Perlu Diperbaiki',
            alasanPenolakan: rejectReason,
            alasanTolak: rejectReason,
            ditolak_oleh: verifierName,
            submissions: updatedSubmissions
          }
        }
        return t
      })

      setTagihan(updated)
      saveStorageItem('tagihan', updated)

      addNotification({
        user_id: targetTagihan.wargaId,
        warga_id: targetTagihan.wargaId,
        title: 'Pembayaran Perlu Diperbaiki',
        message: `Pembayaran IPL ${targetTagihan.bulan}/${targetTagihan.tahun} belum dapat diverifikasi. Alasan: ${rejectReason}. Silakan upload ulang bukti pembayaran yang benar.`,
        type: 'warning',
        tagihan_id: tagihanId
      })

      addAuditLog({
        action: 'VERIFIKASI_TOLAK',
        actor_name: verifierName,
        target_id: tagihanId,
        target_type: 'tagihan',
        reason: rejectReason,
        details: {
          alasan: rejectReason
        }
      })

      showToast(`Bukti transfer ${targetWarga?.nama || 'Warga'} ditolak. Status: Perlu Diperbaiki.`, 'warning')
    }
  }

  // --- Kas Actions ---
  const addKas = (data) => {
    // Tentukan scope dan rt_id sesuai akun yang mencatat
    const isRtUser = currentUser?.role === 'rt'
    const targetScope = isRtUser ? 'rt' : (data.scope || 'rw')
    const targetRtId = isRtUser ? (currentUser?.rt_id || 'rt-1') : (targetScope === 'rt' ? (data.rt_id || 'rt-1') : null)

    const newKas = {
      id: `kas-${Date.now()}`,
      tanggal: data.tanggal || new Date().toISOString().slice(0, 10),
      tipe: data.tipe || 'Masuk',
      kategori: data.kategori || 'Umum',
      deskripsi: data.deskripsi || '',
      nominal: Number(data.nominal) || 0,
      scope: targetScope,
      rt_id: targetRtId
    }
    const updated = [newKas, ...kas]
    setKas(updated)
    saveStorageItem('kas', updated)
    showToast(`Transaksi kas Rp ${newKas.nominal.toLocaleString()} (${newKas.tipe}) dicatat!`)
  }

  const deleteKas = (id) => {
    const updated = kas.filter(k => k.id !== id)
    setKas(updated)
    saveStorageItem('kas', updated)
    deleteFromSupabase('kas', id)
    showToast('Catatan kas dihapus.', 'info')
  }

  // --- Events & Iuran Insidental Actions ---
  const addEvent = (data) => {
    const isRtUser = currentUser?.role === 'rt'
    const targetScope = isRtUser ? 'rt' : (data.scope || 'rw')
    const targetRtId = isRtUser ? (currentUser?.rt_id || 'rt-1') : (targetScope === 'rt' ? (data.rt_id || 'rt-1') : null)

    const newEvent = {
      ...data,
      id: `evt-${Date.now()}`,
      scope: targetScope,
      rt_id: targetRtId,
      targetType: data.targetType || 'all', // 'all' | 'personal'
      targetWargaId: data.targetWargaId || null,
      tipePengumuman: data.tipePengumuman || (Number(data.nominalPerKK) > 0 ? 'iuran' : 'info'),
      nominalPerKK: Number(data.nominalPerKK) || 0,
      tanggalDibuat: new Date().toISOString().slice(0, 10),
      autoHapus: !!data.autoHapus,
      expiredAt: data.expiredAt || null,
      aktif: true
    }
    const updated = [newEvent, ...events]
    setEvents(updated)
    saveStorageItem('events', updated)

    const targetLabel = newEvent.targetType === 'personal' ? 'Khusus Perorangan' : (targetScope === 'rw' ? 'Tingkat RW' : 'Tingkat RT')
    showToast(`Pengumuman "${newEvent.judul}" (${targetLabel}) berhasil diterbitkan!`)
    return newEvent
  }

  const updateEvent = (id, data) => {
    const updated = events.map(e => e.id === id ? { 
      ...e, 
      ...data, 
      nominalPerKK: Number(data.nominalPerKK) || e.nominalPerKK,
      autoHapus: !!data.autoHapus,
      expiredAt: data.expiredAt || null
    } : e)
    setEvents(updated)
    saveStorageItem('events', updated)
    showToast('Data kegiatan berhasil diperbarui!')
  }

  const deleteEvent = (id) => {
    const target = events.find(e => e.id === id)
    const updated = events.filter(e => e.id !== id)
    const updatedTagihanEvents = tagihanEvents.filter(te => te.eventId !== id)
    setEvents(updated)
    setTagihanEvents(updatedTagihanEvents)
    saveStorageItem('events', updated)
    saveStorageItem('tagihan_events', updatedTagihanEvents)
    deleteFromSupabase('events', id)
    showToast(`Kegiatan "${target?.judul || ''}" telah dihapus.`, 'warning')
  }

  const generateTagihanEventMassal = (eventId) => {
    const targetEvent = events.find(e => e.id === eventId)
    if (!targetEvent) return 0

    if (targetEvent.nominalPerKK <= 0) {
      showToast('Pengumuman ini bersifat informasi gratis (Rp 0), tidak perlu tagihan iuran.', 'info')
      return 0
    }

    // Tentukan target warga sesuai targetType (Perorangan vs RT vs RW)
    let targetWargaList = []
    if (targetEvent.targetType === 'personal' && targetEvent.targetWargaId) {
      targetWargaList = warga.filter(w => w.id === targetEvent.targetWargaId)
    } else if (targetEvent.scope === 'rt' && targetEvent.rt_id) {
      targetWargaList = warga.filter(w => w.aktif && w.rt_id === targetEvent.rt_id)
    } else {
      targetWargaList = warga.filter(w => w.aktif)
    }

    let countCreated = 0
    const newInvoices = []

    targetWargaList.forEach(w => {
      const exists = tagihanEvents.some(te => te.eventId === eventId && te.wargaId === w.id)
      if (!exists) {
        newInvoices.push({
          id: `tevt-${Date.now()}-${w.id}`,
          eventId: eventId,
          wargaId: w.id,
          nominal: targetEvent.nominalPerKK,
          status: 'Belum Lunas',
          tanggalBayar: null,
          metodeBayar: null,
          noKwitansi: null,
          catatan: ''
        })
        countCreated++
      }
    })

    if (countCreated === 0) {
      showToast('Semua warga target sudah terdaftar pada tagihan kegiatan ini.', 'info')
      return 0
    }

    const updated = [...newInvoices, ...tagihanEvents]
    setTagihanEvents(updated)
    saveStorageItem('tagihan_events', updated)
    showToast(`Berhasil menerbitkan ${countCreated} tagihan kegiatan "${targetEvent.judul}"!`)
    return countCreated
  }

  const bayarTagihanEvent = (teId, { metodeBayar, tanggalBayar, catatan }) => {
    const targetTE = tagihanEvents.find(te => te.id === teId)
    if (!targetTE) return

    const targetEvent = events.find(e => e.id === targetTE.eventId)
    const targetWarga = warga.find(w => w.id === targetTE.wargaId)
    const today = tanggalBayar || new Date().toISOString().slice(0, 10)
    const randomSeq = Math.floor(100 + Math.random() * 900)
    const noKwitansi = `KW-EVT-${randomSeq}`

    const updatedTE = tagihanEvents.map(te => {
      if (te.id === teId) {
        return {
          ...te,
          status: 'Lunas',
          tanggalBayar: today,
          metodeBayar: metodeBayar || 'Tunai',
          noKwitansi,
          catatan: catatan || ''
        }
      }
      return te
    })

    // Dana kegiatan & lomba dikelola terpisah per event (tidak masuk ke Kas Rutin RT/RW)
    setTagihanEvents(updatedTE)
    saveStorageItem('tagihan_events', updatedTE)

    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } })
    } catch (e) {}

    showToast(`Pembayaran kegiatan Rp ${targetTE.nominal.toLocaleString()} dari ${targetWarga?.nama} lunas!`)
  }

  const batalBayarTagihanEvent = (teId) => {
    const updatedTE = tagihanEvents.map(te => {
      if (te.id === teId) {
        return {
          ...te,
          status: 'Belum Lunas',
          tanggalBayar: null,
          metodeBayar: null,
          noKwitansi: null,
          catatan: ''
        }
      }
      return te
    })

    const updatedKas = kas.filter(k => k.tagihanEventId !== teId)
    setTagihanEvents(updatedTE)
    setKas(updatedKas)
    saveStorageItem('tagihan_events', updatedTE)
    saveStorageItem('kas', updatedKas)
    showToast('Status pembayaran iuran kegiatan dibatalkan.', 'warning')
  }

  const deleteTagihanEvent = (teId) => {
    const updated = tagihanEvents.filter(te => te.id !== teId)
    setTagihanEvents(updated)
    saveStorageItem('tagihan_events', updated)
    deleteFromSupabase('tagihan_events', teId)
    showToast('Tagihan kegiatan dihapus.', 'info')
  }

  const uploadBuktiTagihanEvent = ({ eventId, teId, wargaId, buktiTransferUrl, bankPengirim, catatanWarga }) => {
    const targetEvent = events.find(e => e.id === eventId)
    const targetWId = wargaId || currentUser?.resident_id || warga[0]?.id
    
    // Check if tagihanEvent already exists
    const existingTE = teId 
      ? tagihanEvents.find(te => te.id === teId)
      : tagihanEvents.find(te => te.eventId === eventId && te.wargaId === targetWId)

    let updatedTE = []
    if (existingTE) {
      updatedTE = tagihanEvents.map(te => {
        if (te.id === existingTE.id) {
          return {
            ...te,
            status: 'Menunggu Verifikasi',
            buktiTransferUrl,
            tanggalUploadBukti: new Date().toISOString(),
            bankPengirim: bankPengirim || 'Transfer Bank',
            catatanWarga: catatanWarga || '',
            alasanTolak: null
          }
        }
        return te
      })
    } else {
      const newTE = {
        id: `tevt-${Date.now()}-${targetWId}`,
        eventId: eventId,
        wargaId: targetWId,
        nominal: Number(targetEvent?.nominalPerKK) || 0,
        status: 'Menunggu Verifikasi',
        buktiTransferUrl,
        tanggalUploadBukti: new Date().toISOString(),
        bankPengirim: bankPengirim || 'Transfer Bank',
        catatanWarga: catatanWarga || '',
        tanggalBayar: null,
        metodeBayar: null,
        noKwitansi: null,
        alasanTolak: null
      }
      updatedTE = [newTE, ...tagihanEvents]
    }

    setTagihanEvents(updatedTE)
    saveStorageItem('tagihan_events', updatedTE)

    const senderW = warga.find(w => w.id === targetWId)
    addNotification({
      user_id: 'admin',
      target_role: 'admin',
      title: '🏆 Bukti Iuran Kegiatan Masuk',
      message: `Warga ${senderW?.nama || 'Warga'} telah mengunggah bukti bayar untuk ${targetEvent?.judul || 'Kegiatan'}.`,
      type: 'event_payment_pending',
      tagihan_event_id: existingTE?.id || `tevt-${Date.now()}-${targetWId}`
    })

    showToast('Bukti transfer iuran acara berhasil dikirim! Menunggu verifikasi pengurus.', 'success')
  }

  const verifikasiBuktiTagihanEvent = (teId, action, { alasanTolak, metodeBayar } = {}) => {
    const targetTE = tagihanEvents.find(te => te.id === teId)
    if (!targetTE) return

    const targetEvent = events.find(e => e.id === targetTE.eventId)
    const targetWarga = warga.find(w => w.id === targetTE.wargaId)

    if (action === 'terima') {
      const today = new Date().toISOString().slice(0, 10)
      const randomSeq = Math.floor(100 + Math.random() * 900)
      const noKwitansi = `KW-EVT-${randomSeq}`
      const finalMetode = metodeBayar || targetTE.bankPengirim || 'Transfer'

      const updatedTE = tagihanEvents.map(te => {
        if (te.id === teId) {
          return {
            ...te,
            status: 'Lunas',
            tanggalBayar: today,
            metodeBayar: finalMetode,
            noKwitansi,
            alasanTolak: null
          }
        }
        return te
      })

      const isRwEvent = targetEvent?.scope === 'rw' || !targetEvent?.rt_id
      const targetKasScope = isRwEvent ? 'rw' : 'rt'
      const targetKasRtId = isRwEvent ? null : (targetEvent?.rt_id || targetWarga?.rt_id || 'rt-1')

      const newKasEntry = {
        id: `kas-evt-${Date.now()}`,
        tanggal: today,
        tipe: 'Masuk',
        kategori: 'Iuran Event',
        deskripsi: `Iuran ${targetEvent?.judul || 'Kegiatan'} - ${targetWarga?.nama || 'Warga'} (Verifikasi)`,
        nominal: targetTE.nominal,
        tagihanEventId: teId,
        scope: targetKasScope,
        rt_id: targetKasRtId
      }
      const updatedKas = [newKasEntry, ...kas]

      setTagihanEvents(updatedTE)
      setKas(updatedKas)
      saveStorageItem('tagihan_events', updatedTE)
      saveStorageItem('kas', updatedKas)

      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 } })
      } catch (e) {}

      showToast(`Iuran acara dari ${targetWarga?.nama || 'Warga'} berhasil diverifikasi LUNAS!`, 'success')
    } else if (action === 'tolak') {
      const updatedTE = tagihanEvents.map(te => {
        if (te.id === teId) {
          return {
            ...te,
            status: 'Belum Lunas',
            alasanTolak: alasanTolak || 'Bukti transfer tidak valid atau nominal tidak sesuai.'
          }
        }
        return te
      })

      setTagihanEvents(updatedTE)
      saveStorageItem('tagihan_events', updatedTE)
      showToast(`Bukti transfer kegiatan dari ${targetWarga?.nama || 'Warga'} ditolak.`, 'warning')
    }
  }

  // --- Layanan Pengaduan / Aduan Warga ---
  const tambahPengaduan = (data) => {
    const targetWarga = warga.find(w => w.id === (currentUser?.resident_id || data.wargaId)) || warga[0]
    const targetRtId = targetWarga?.rt_id || currentUser?.rt_id || 'rt-1'

    const newAduan = {
      id: `lapor-${Date.now().toString().slice(-4)}`,
      wargaId: targetWarga.id,
      rt_id: targetRtId,
      judul: data.judul || 'Laporan Warga',
      kategori: data.kategori || 'Fasilitas & Lampu Jalan',
      lokasi: data.lokasi || `Blok ${targetWarga.blok} No. ${targetWarga.noRumah}`,
      deskripsi: data.deskripsi || '',
      status: 'Menunggu Tindak Lanjut',
      tanggal: new Date().toISOString().split('T')[0],
      fotoUrl: data.fotoUrl || '',
      tanggapan: '',
      tanggalTanggapan: null
    }

    const updated = [newAduan, ...pengaduan]
    setPengaduan(updated)
    saveStorageItem('pengaduan', updated)
    showToast('Laporan keluhan Anda berhasil dikirim ke pengurus RT!', 'success')
    return newAduan
  }

  const updateStatusPengaduan = (id, status, tanggapan) => {
    const updated = pengaduan.map(p => {
      if (p.id === id) {
        return {
          ...p,
          status,
          tanggapan: tanggapan !== undefined ? tanggapan : p.tanggapan,
          tanggalTanggapan: tanggapan ? new Date().toISOString().split('T')[0] : p.tanggalTanggapan
        }
      }
      return p
    })
    setPengaduan(updated)
    saveStorageItem('pengaduan', updated)
    showToast(`Status laporan pengaduan diperbarui menjadi: ${status}!`, 'success')
  }

  const deletePengaduan = (id) => {
    const updated = pengaduan.filter(p => p.id !== id)
    setPengaduan(updated)
    saveStorageItem('pengaduan', updated)
    deleteFromSupabase('pengaduan', id)
    showToast('Laporan pengaduan berhasil dihapus.', 'info')
  }

  // --- Layanan Surat Pengantar RT/RW ---
  const ajukanSurat = (data) => {
    const targetWarga = warga.find(w => w.id === (currentUser?.resident_id || data.wargaId)) || warga[0]
    const targetRtId = targetWarga?.rt_id || currentUser?.rt_id || 'rt-1'
    const targetRt = rts.find(r => r.id === targetRtId) || rts[0]

    const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
    const curMonth = new Date().getMonth()
    const curYear = new Date().getFullYear()
    const countToday = surat.filter(s => s.rt_id === targetRtId).length + 1
    const padNumber = countToday.toString().padStart(3, '0')
    const noSuratDraft = `470/${padNumber}/${targetRt.code || 'RT.01'}-RW.15/${romanMonths[curMonth]}/${curYear}`

    const newSurat = {
      id: `srt-${Date.now().toString().slice(-4)}`,
      noSurat: noSuratDraft,
      wargaId: targetWarga.id,
      rt_id: targetRtId,
      jenisSurat: data.jenisSurat || 'Surat Pengantar KTP / KK',
      keperluan: data.keperluan || '',
      status: 'Diajukan',
      tanggalPengajuan: new Date().toISOString().split('T')[0],
      tanggalDisetujui: null,
      catatanPengurus: '',
      nikPemohon: data.nikPemohon || '3201011204850001',
      pekerjaan: targetWarga.pekerjaan || 'Wiraswasta',
      alamatLengkap: `${config?.namaLingkungan || 'Perumahan Alam Tirta Lestari'}, Blok ${targetWarga.blok} No. ${targetWarga.noRumah}, ${targetRt.name} / RW ${targetRt.rw || '15'}, ${config?.kelurahan || 'Pagelaran'}, ${config?.kecamatan || 'Ciomas'}`
    }

    const updated = [newSurat, ...surat]
    setSurat(updated)
    saveStorageItem('surat', updated)
    showToast('Permohonan surat pengantar berhasil diajukan!', 'success')
    return newSurat
  }

  const updateStatusSurat = (id, status, catatanPengurus, customNoSurat) => {
    const targetSurat = surat.find(s => s.id === id)
    let finalNoSurat = customNoSurat || targetSurat?.noSurat

    // Jika disetujui dan belum punya nomor surat, buat nomor surat resmi berseri otomatis
    if (status === 'Disetujui' && !finalNoSurat) {
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1
      const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
      const romanMonth = romanMonths[month - 1]

      const suratRtId = targetSurat?.rt_id || currentUser?.rt_id || 'rt-1'
      const rtObj = rts.find(r => r.id === suratRtId)
      const rtNumber = rtObj?.number || '01'
      const rwNumber = rtObj?.rw || '15'

      // Hitung urutan surat yang sudah disetujui tahun ini di RT tsb
      const countThisYear = surat.filter(s => s.status === 'Disetujui' && s.rt_id === suratRtId && (s.tanggalDisetujui || '').startsWith(String(year))).length + 1
      finalNoSurat = `${String(countThisYear).padStart(3, '0')}/RT.${rtNumber}-RW.${rwNumber}/${romanMonth}/${year}`
    }

    const updated = surat.map(s => {
      if (s.id === id) {
        return {
          ...s,
          status,
          catatanPengurus: catatanPengurus !== undefined ? catatanPengurus : s.catatanPengurus,
          noSurat: finalNoSurat || s.noSurat,
          tanggalDisetujui: status === 'Disetujui' ? (s.tanggalDisetujui || new Date().toISOString().split('T')[0]) : s.tanggalDisetujui
        }
      }
      return s
    })
    setSurat(updated)
    saveStorageItem('surat', updated)
    showToast(`Status surat pengantar diperbarui: ${status}!${finalNoSurat ? ` (No: ${finalNoSurat})` : ''}`, 'success')
  }

  const deleteSurat = (id) => {
    const updated = surat.filter(s => s.id !== id)
    setSurat(updated)
    saveStorageItem('surat', updated)
    deleteFromSupabase('surat', id)
    showToast('Data permohonan surat berhasil dihapus.', 'info')
  }

  // --- Kontak Darurat ---
  const updateKontakDarurat = (id, updatedData) => {
    const updated = kontakDarurat.map(k => {
      if (k.id === id) {
        return { ...k, ...updatedData }
      }
      return k
    })
    setKontakDarurat(updated)
    saveStorageItem('kontak_darurat', updated)
    showToast('Nomor kontak darurat berhasil diperbarui!', 'success')
  }

  const addKontakDarurat = (newContact) => {
    const contactObj = {
      id: `emg-${Date.now()}`,
      nama: newContact.nama || 'Kontak Darurat Baru',
      kategori: newContact.kategori || 'Layanan Publik',
      nomor: newContact.nomor || '',
      wa: newContact.wa || '',
      deskripsi: newContact.deskripsi || '',
      icon: newContact.icon || 'PhoneCall',
      urgent: Boolean(newContact.urgent),
      color: newContact.color || 'bg-slate-50 text-slate-800 border-slate-200',
      rt_id: newContact.rt_id !== undefined ? newContact.rt_id : null
    }
    const updated = [...kontakDarurat, contactObj]
    setKontakDarurat(updated)
    saveStorageItem('kontak_darurat', updated)
    showToast('Kontak darurat baru berhasil ditambahkan!', 'success')
    return contactObj
  }

  const deleteKontakDarurat = (id) => {
    const updated = kontakDarurat.filter(k => k.id !== id)
    setKontakDarurat(updated)
    saveStorageItem('kontak_darurat', updated)
    deleteFromSupabase('kontak_darurat', id)
    showToast('Kontak darurat berhasil dihapus.', 'info')
  }

  const resetKontakDarurat = () => {
    setKontakDarurat(INITIAL_KONTAK_DARURAT)
    saveStorageItem('kontak_darurat', INITIAL_KONTAK_DARURAT)
    showToast('Kontak darurat direset ke nomor standar nasional (110, 119, 113, 112).', 'success')
  }

  const updateConfig = (newConfig) => {
    setConfig(newConfig)
    saveStorageItem('config', newConfig)
    showToast('Pengaturan profil RW disimpan!')
  }

  const updateRtData = (rtId, data) => {
    const updated = rts.map(r => {
      if (r.id === rtId) {
        return {
          ...r,
          ...data
        }
      }
      return r
    })
    setRts(updated)
    saveStorageItem('rts', updated)

    // Jika kontak atau ketua diupdate, sinkronkan ke kontak darurat
    if (data.kontak || data.ketua) {
      setKontakDarurat(prev => {
        const nextList = prev.map(k => {
          if (k.rt_id === rtId || k.id === `emg-rt-${rtId}` || (rtId === 'rt-1' && k.id === 'emg-2')) {
            const rtName = updated.find(r => r.id === rtId)?.name || 'RT'
            return {
              ...k,
              nama: data.ketua ? `Ketua ${rtName} (${data.ketua})` : k.nama,
              nomor: data.kontak || k.nomor,
              wa: data.kontak || k.wa
            }
          }
          return k
        })
        saveStorageItem('kontak_darurat', nextList)
        return nextList
      })
    }

    const rtObj = updated.find(r => r.id === rtId)
    showToast(`Profil & rekening ${rtObj?.name || 'RT'} berhasil diperbarui!`, 'success')
  }

  const addRtData = (data) => {
    const nextSeq = rts.length + 1
    const rawNumber = String(data.number || nextSeq).replace(/[^0-9]/g, '') || String(nextSeq)
    const formattedNum = rawNumber.padStart(2, '0')
    const newId = `rt-${Date.now()}`
    const newItem = {
      id: newId,
      name: data.name?.trim() || `RT ${formattedNum}`,
      number: formattedNum,
      rw: data.rw || config?.rw?.replace(/[^0-9]/g, '') || '15',
      user_id: null,
      status: 'active',
      keterangan: data.keterangan?.trim() || `Mencakup wilayah warga RT ${formattedNum}`,
      ketua: data.ketua?.trim() || '',
      bendahara: data.bendahara?.trim() || '',
      kontak: data.kontak?.trim() || '',
      rekening: data.rekening?.trim() || '',
      lat: Number(data.lat) || Number((-6.59715 - (rts.length * 0.0004)).toFixed(6)),
      lng: Number(data.lng) || Number((106.76415 + (rts.length * 0.0005)).toFixed(6)),
      lokasi: data.lokasi?.trim() || `Pos Balai Warga ${data.name?.trim() || `RT ${formattedNum}`}`
    }
    const updated = [...rts, newItem]
    setRts(updated)
    saveStorageItem('rts', updated)
    showToast(`Wilayah ${newItem.name} berhasil ditambahkan!`, 'success')
    return newItem
  }

  const deleteRtData = (rtId) => {
    if (rts.length <= 1) {
      showToast('Minimal harus ada 1 RT dalam sistem!', 'warning')
      return false
    }
    const target = rts.find(r => r.id === rtId)
    const updated = rts.filter(r => r.id !== rtId)
    setRts(updated)
    saveStorageItem('rts', updated)
    deleteFromSupabase('rts', rtId)
    showToast(`Wilayah ${target?.name || 'RT'} telah dihapus.`, 'info')
    return true
  }

  const handleResetData = async () => {
    const ok = await confirmDialog({
      title: 'Reset seluruh data aplikasi?',
      message: 'Ini akan mereset seluruh data warga, iuran, kas, pengaduan, surat, dan kegiatan ke data demo awal.',
      subtext: 'Semua perubahan yang Anda buat akan dikembalikan ke setelan default.',
      confirmText: 'Reset Data'
    })

    if (ok) {
      resetAllStorage()
      const data = loadInitialStorage()
      setConfig(data.config)
      setJenisIuran(data.jenisIuran)
      setWarga(data.warga)
      setTagihan(data.tagihan)
      setKas(data.kas)
      setEvents(data.events || [])
      setTagihanEvents(data.tagihanEvents || [])
      setPengaduan(data.pengaduan || [])
      setSurat(data.surat || [])
      setKontakDarurat(data.kontakDarurat || [])
      showToast('Data berhasil direset ke setelan awal!', 'info')
    }
  }

  const handleImportData = (imported) => {
    try {
      if (imported.warga && imported.tagihan && imported.kas) {
        setConfig(imported.config || config)
        setJenisIuran(imported.jenisIuran || jenisIuran)
        setWarga(imported.warga)
        setTagihan(imported.tagihan)
        setKas(imported.kas)
        setEvents(imported.events || events)
        setTagihanEvents(imported.tagihanEvents || tagihanEvents)
        if (imported.pengaduan) setPengaduan(imported.pengaduan)
        if (imported.surat) setSurat(imported.surat)

        saveStorageItem('config', imported.config || config)
        saveStorageItem('jenis_iuran', imported.jenisIuran || jenisIuran)
        saveStorageItem('warga', imported.warga)
        saveStorageItem('tagihan', imported.tagihan)
        saveStorageItem('kas', imported.kas)
        saveStorageItem('events', imported.events || events)
        saveStorageItem('tagihan_events', imported.tagihanEvents || tagihanEvents)
        if (imported.pengaduan) saveStorageItem('pengaduan', imported.pengaduan)
        if (imported.surat) saveStorageItem('surat', imported.surat)

        showToast('Data backup berhasil diimpor!')
      } else {
        showToast('Format file JSON tidak valid!', 'error')
      }
    } catch (e) {
      showToast('Gagal memproses data backup!', 'error')
    }
  }

  // --- Multi-Role Auth Actions (Admin, RT, Warga) ---
  const isAdmin = currentUser?.role === 'admin'
  const isRT = currentUser?.role === 'rt'
  const isWarga = currentUser?.role === 'warga'
  const isAdminLoggedIn = isAdmin || isRT

  const openLoginModal = (targetTab = 'dashboard') => {
    setPendingAdminTab(targetTab)
    setLoginModalOpen(true)
  }

  const closeLoginModal = () => {
    setLoginModalOpen(false)
  }

  const navigateToTab = (tabId) => {
    // Permission check for Super Admin only
    if ((tabId === 'settings' || tabId === 'data-akses') && !isAdmin) {
      showToast('Menu ini hanya untuk Super Admin.', 'warning')
      return
    }

    // Role Warga access check (whitelist allowed tabs for citizens)
    if (isWarga) {
      const allowedWargaTabs = [
        'warga-dashboard',
        'events',
        'pengaduan',
        'surat',
        'kas-warga',
        'kontak-darurat',
        'portal'
      ]
      if (allowedWargaTabs.includes(tabId)) {
        setActiveTab(tabId)
        return
      } else {
        showToast('Menu ini khusus untuk Pengurus RT / Admin.', 'warning')
        return
      }
    }

    // Unauthenticated access
    if (!currentUser && tabId !== 'portal') {
      setPendingAdminTab(tabId)
      setLoginModalOpen(true)
      showToast('Silakan login terlebih dahulu untuk mengakses menu ini.', 'info')
      return
    }

    setActiveTab(tabId)
  }

  const loginUser = async (username, password, rememberMe = true) => {
    const res = await apiLogin({ username, password, users, adminAuth })
    if (res.success && res.user) {
      setCurrentUser(res.user)
      if (rememberMe) {
        saveStorageItem('current_user', res.user)
      } else {
        sessionStorage.setItem('wargaku_current_user', JSON.stringify(res.user))
      }
      setLoginModalOpen(false)

      const rtInfo = rts.find(r => r.id === res.user.rt_id)

      if (res.user.role === 'warga') {
        setActiveTab('warga-dashboard')
        showToast(`Selamat datang, ${res.user.name}!`)
      } else if (res.user.role === 'rt') {
        setActiveTab('rt-dashboard')
        showToast(`Login berhasil sebagai Pengurus ${rtInfo?.name || 'RT'} (${res.user.name})`)
      } else {
        setActiveTab(pendingAdminTab === 'portal' ? 'dashboard' : (pendingAdminTab || 'dashboard'))
        showToast(`Login berhasil sebagai Super Administrator (${res.user.name})`)
      }
      return res
    }
    return res
  }

  const [profileModalOpen, setProfileModalOpen] = useState(false)

  const logoutUser = async () => {
    const ok = await confirmDialog({
      title: 'Keluar dari Sesi?',
      message: `Anda akan keluar dari akun ${currentUser?.name || currentUser?.username || 'saat ini'}.`,
      subtext: 'Anda dapat masuk kembali kapan saja dengan username & password Anda.',
      confirmText: 'Ya, Keluar',
      cancelText: 'Batal'
    })

    if (ok) {
      setCurrentUser(null)
      localStorage.removeItem('wargaku_current_user')
      sessionStorage.removeItem('wargaku_current_user')
      localStorage.removeItem('wargaku_admin_logged_in')
      sessionStorage.removeItem('wargaku_admin_logged_in')
      setActiveTab('dashboard')
      showToast('Anda telah keluar dari sesi.', 'info')
    }
  }

  const updateUserProfile = ({ name, noHp, pekerjaan, jumlahJiwa, kontakRt, rekeningBank, password }) => {
    if (!currentUser) return

    // Update currentUser
    const updatedUser = {
      ...currentUser,
      name: name || currentUser.name
    }
    if (password) {
      updatedUser.password = password
      updatedUser.passwords = [password, ...(currentUser.passwords || [])]
    }
    setCurrentUser(updatedUser)
    saveStorageItem('current_user', updatedUser)

    // Update in users array
    const updatedUsers = users.map(u => {
      if (u.id === currentUser.id || u.username === currentUser.username) {
        return {
          ...u,
          name: name || u.name,
          password: password || u.password,
          passwords: password ? [password, ...(u.passwords || [])] : u.passwords
        }
      }
      return u
    })
    setUsers(updatedUsers)
    saveStorageItem('users', updatedUsers)

    // If Warga: update in warga array
    if (currentUser.role === 'warga' && currentUser.resident_id) {
      const updatedWargaList = warga.map(w => {
        if (w.id === currentUser.resident_id) {
          return {
            ...w,
            nama: name || w.nama,
            noHp: noHp !== undefined ? noHp : w.noHp,
            pekerjaan: pekerjaan !== undefined ? pekerjaan : w.pekerjaan,
            jumlahJiwa: jumlahJiwa !== undefined ? Number(jumlahJiwa) : w.jumlahJiwa
          }
        }
        return w
      })
      setWarga(updatedWargaList)
      saveStorageItem('warga', updatedWargaList)
    }

    // If RT: update in rts array
    if (currentUser.role === 'rt' && currentUser.rt_id) {
      const updatedRts = rts.map(r => {
        if (r.id === currentUser.rt_id) {
          return {
            ...r,
            ketua: name || r.ketua,
            kontak: kontakRt || r.kontak,
            rekening: rekeningBank || r.rekening
          }
        }
        return r
      })
      setRts(updatedRts)
      saveStorageItem('rts', updatedRts)
    }

    // If Admin (RW): update config
    if (currentUser.role === 'admin') {
      const updatedCfg = {
        ...config,
        kontakRt: kontakRt || config.kontakRt,
        rekeningBank: rekeningBank || config.rekeningBank
      }
      setConfig(updatedCfg)
      saveStorageItem('config', updatedCfg)
    }

    showToast('Profil & akun berhasil diperbarui!', 'success')
  }

  const updateAdminAuth = (newUsername, newPassword) => {
    const updated = {
      username: (newUsername || 'admin').trim(),
      password: newPassword || 'admin123'
    }
    setAdminAuth(updated)
    saveStorageItem('admin_auth', updated)

    // Update juga di list users
    const updatedUsers = users.map(u => u.role === 'admin' ? { ...u, username: updated.username, password: updated.password } : u)
    setUsers(updatedUsers)
    saveStorageItem('users', updatedUsers)

    showToast('Kredensial login admin berhasil diperbarui!')
  }

  // Computed Role & Scoped Selectors
  const currentRT = rts.find(r => r.id === currentUser?.rt_id) || (rts.length ? rts[0] : null)
  const currentWarga = warga.find(w => w.id === currentUser?.resident_id) || (warga.length ? warga[0] : null)
  const scopedWarga = filterResidentsByRole(warga, currentUser)
  const scopedTagihan = filterBillsByRole(tagihan, warga, currentUser)
  const scopedKas = filterKasByRole(kas, currentUser)
  const scopedEvents = filterEventsByRole(events, currentUser)
  const scopedTagihanEvents = filterTagihanEventsByRole(tagihanEvents, warga, currentUser)

  // Scoped Pengaduan, Surat, dan Kontak Darurat
  const scopedPengaduan = isRT 
    ? pengaduan.filter(p => p.rt_id === currentUser?.rt_id)
    : isWarga
      ? pengaduan.filter(p => p.rt_id === (currentWarga?.rt_id || 'rt-1'))
      : pengaduan

  const scopedSurat = isRT
    ? surat.filter(s => s.rt_id === currentUser?.rt_id)
    : isWarga
      ? surat.filter(s => s.wargaId === currentUser?.resident_id)
      : surat

  const scopedKontakDarurat = filterKontakDaruratByRole(kontakDarurat, currentUser, currentWarga)

  if (!initialLoaded) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-100 font-sans text-slate-600">Memuat WargaKu IPL...</div>
  }

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab: navigateToTab,
        forceSetActiveTab: setActiveTab,
        users,
        addUserAccount,
        updateUserAccount,
        deleteUserAccount,
        rts,
        currentUser,
        isAdmin,
        isRT,
        isWarga,
        currentRT,
        currentWarga,
        scopedWarga,
        scopedTagihan,
        scopedKas,
        scopedEvents,
        scopedTagihanEvents,
        scopedPengaduan,
        scopedSurat,
        adminAuth,
        isAdminLoggedIn: isAdmin || isRT,
        loginModalOpen,
        openLoginModal,
        closeLoginModal,
        loginUser,
        logoutUser,
        loginAdmin: loginUser,
        logoutAdmin: logoutUser,
        updateAdminAuth,
        addRtData,
        updateRtData,
        deleteRtData,
        jenisIuran,
        addJenisIuran,
        updateJenisIuran,
        toggleJenisIuran,
        warga,
        addWarga,
        addWargaWithAccount,
        updateWarga,
        updateAnggotaKeluarga,
        updateLokasiRumah,
        deleteWarga,
        generateUniqueUsername: (name) => generateUniqueUsername(name, users),
        isUsernameAvailable: (u, excludeId) => isUsernameAvailable(u, users, excludeId),
        generateUniqueKodeUnik: () => generateUniqueKodeUnik(warga),
        tagihan,
        generateTagihanMassal,
        addTagihanManual,
        bayarTagihan,
        batalBayarTagihan,
        deleteTagihan,
        kas,
        addKas,
        deleteKas,
        events,
        addEvent,
        updateEvent,
        deleteEvent,
        readEventIds,
        markEventAsRead,
        markAllEventsAsRead,
        unreadEventsCount: isWarga ? (scopedEvents || []).filter(e => !readEventIds.includes(e.id)).length : 0,
        tagihanEvents,
        generateTagihanEventMassal,
        bayarTagihanEvent,
        batalBayarTagihanEvent,
        deleteTagihanEvent,
        uploadBuktiTagihanEvent,
        verifikasiBuktiTagihanEvent,
        uploadBuktiTransfer,
        verifikasiBuktiTransfer,
        pengaduan,
        tambahPengaduan,
        updateStatusPengaduan,
        deletePengaduan,
        surat,
        ajukanSurat,
        updateStatusSurat,
        deleteSurat,
        kontakDarurat,
        scopedKontakDarurat,
        updateKontakDarurat,
        addKontakDarurat,
        deleteKontakDarurat,
        resetKontakDarurat,
        bankAccounts,
        addBankAccount,
        updateBankAccount,
        deleteBankAccount,
        qrisAccounts,
        addQrisAccount,
        updateQrisAccount,
        deleteQrisAccount,
        notifications,
        addNotification,
        markNotificationRead,
        auditLogs,
        addAuditLog,
        selectedTagihanKwitansi,
        setSelectedTagihanKwitansi,
        selectedTagihanBayar,
        setSelectedTagihanBayar,
        selectedTagihanVerifikasi,
        setSelectedTagihanVerifikasi,
        handleResetData,
        handleImportData,
        isSupabaseConfigured,
        supabaseUrl,
        setSupabaseCredentials,
        toast,
        showToast,
        confirmState,
        confirmDialog,
        handleConfirmDialogConfirm,
        handleConfirmDialogCancel,
        profileModalOpen,
        setProfileModalOpen,
        updateUserProfile
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
