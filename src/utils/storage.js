import { 
  INITIAL_CONFIG, 
  INITIAL_JENIS_IURAN, 
  INITIAL_WARGA, 
  INITIAL_TAGIHAN, 
  INITIAL_KAS, 
  INITIAL_EVENTS, 
  INITIAL_TAGIHAN_EVENTS, 
  INITIAL_ADMIN_AUTH, 
  INITIAL_USERS, 
  INITIAL_RTS,
  INITIAL_PENGADUAN,
  INITIAL_SURAT_PENGANTAR,
  INITIAL_KONTAK_DARURAT,
  INITIAL_BANK_ACCOUNTS,
  INITIAL_QRIS_ACCOUNTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS
} from '../data/initialData'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export const STORAGE_KEYS = {
  CONFIG: 'wargaku_config',
  JENIS_IURAN: 'wargaku_jenis_iuran',
  WARGA: 'wargaku_warga',
  TAGIHAN: 'wargaku_tagihan',
  KAS: 'wargaku_kas',
  EVENTS: 'wargaku_events',
  TAGIHAN_EVENTS: 'wargaku_tagihan_events',
  RTS: 'wargaku_rts',
  USERS: 'wargaku_users',
  CURRENT_USER: 'wargaku_current_user',
  ADMIN_AUTH: 'wargaku_admin_auth',
  ADMIN_LOGGED_IN: 'wargaku_admin_logged_in',
  PENGADUAN: 'wargaku_pengaduan',
  SURAT: 'wargaku_surat',
  KONTAK_DARURAT: 'wargaku_kontak_darurat',
  BANK_ACCOUNTS: 'wargaku_bank_accounts',
  QRIS_ACCOUNTS: 'wargaku_qris_accounts',
  NOTIFICATIONS: 'wargaku_notifications',
  AUDIT_LOGS: 'wargaku_audit_logs',
  MOOTA_MUTATIONS: 'wargaku_moota_mutations',
  SEEDED: 'wargaku_seeded_v11'
}

export function loadInitialStorage() {
  const isSeeded = localStorage.getItem(STORAGE_KEYS.SEEDED)
  if (isSeeded !== 'v10') {
    // Pastikan master RTS terisi
    const existingRts = getStorageItem(STORAGE_KEYS.RTS, null)
    if (!existingRts || !existingRts.length) {
      localStorage.setItem(STORAGE_KEYS.RTS, JSON.stringify(INITIAL_RTS))
    }

    // Migrasi data warga existing agar memiliki koordinat lat/lng, anggotaKeluarga & kodeUnik
    const existingWarga = getStorageItem(STORAGE_KEYS.WARGA, INITIAL_WARGA)
    const migratedWarga = existingWarga.map((w, idx) => {
      const initMatch = INITIAL_WARGA.find(iw => iw.id === w.id)
      const family = (w.anggotaKeluarga && w.anggotaKeluarga.length > 0)
        ? w.anggotaKeluarga 
        : (initMatch?.anggotaKeluarga || [
            { 
              id: `ak-${w.id}-1`, 
              nama: w.nama || 'Kepala Keluarga', 
              nik: w.nik || `320101${String(1000000000 + idx + 1)}`, 
              hubungan: 'Kepala Keluarga', 
              jenisKelamin: w.jenisKelamin || 'Laki-laki', 
              tempatLahir: 'Bogor', 
              tanggalLahir: '1985-01-01', 
              agama: w.agama || 'Islam', 
              pendidikan: 'SMA/SMK', 
              pekerjaan: w.pekerjaan || 'Wiraswasta', 
              statusPernikahan: w.statusPernikahan || 'Kawin', 
              golonganDarah: 'O', 
              noHp: w.noHp || '' 
            }
          ])

      return {
        ...initMatch,
        ...w,
        rt_id: w.rt_id || initMatch?.rt_id || (w.blok === 'C' ? 'rt-2' : w.blok === 'D' ? 'rt-3' : 'rt-1'),
        kodeUnik: w.kodeUnik || initMatch?.kodeUnik || String(100 + idx + 1).padStart(3, '0'),
        nik: w.nik || initMatch?.nik || `320101${String(1000000000 + idx + 1)}`,
        noKk: w.noKk || initMatch?.noKk || `320101${String(1000000000 + idx + 1)}`,
        email: w.email || initMatch?.email || '',
        statusKepemilikan: w.statusKepemilikan || (w.statusHuni === 'Kontrak' ? 'Sewa / Kontrak' : 'Milik Sendiri'),
        jenisKelamin: w.jenisKelamin || initMatch?.jenisKelamin || 'Laki-laki',
        agama: w.agama || initMatch?.agama || 'Islam',
        statusPernikahan: w.statusPernikahan || initMatch?.statusPernikahan || 'Kawin',
        lat: w.lat || initMatch?.lat || (-6.59715 - (idx * 0.00010)),
        lng: w.lng || initMatch?.lng || (106.76415 + (idx * 0.00008)),
        kontakDaruratNama: w.kontakDaruratNama || initMatch?.kontakDaruratNama || '',
        kontakDaruratHp: w.kontakDaruratHp || initMatch?.kontakDaruratHp || '',
        kontakDaruratHubungan: w.kontakDaruratHubungan || initMatch?.kontakDaruratHubungan || 'Keluarga',
        tglMasuk: w.tglMasuk || initMatch?.tglMasuk || '2020-01-01',
        catatan: w.catatan || initMatch?.catatan || '',
        jumlahJiwa: family.length || w.jumlahJiwa || 1,
        anggotaKeluarga: family
      }
    })
    localStorage.setItem(STORAGE_KEYS.WARGA, JSON.stringify(migratedWarga))

    // Pastikan users terisi dengan skema baru
    const existingUsers = getStorageItem(STORAGE_KEYS.USERS, null)
    if (!existingUsers || existingUsers.length < 3) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS))
    } else {
      // Merge initial users jika belum ada
      const mergedUsers = [...INITIAL_USERS]
      existingUsers.forEach(eu => {
        if (!mergedUsers.some(mu => mu.id === eu.id || mu.username === eu.username)) {
          mergedUsers.push(eu)
        }
      })
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mergedUsers))
    }

    // Refresh default events dengan field targetType & pengumuman baru
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS))
    localStorage.setItem(STORAGE_KEYS.TAGIHAN_EVENTS, JSON.stringify(INITIAL_TAGIHAN_EVENTS))
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(getStorageItem(STORAGE_KEYS.CONFIG, INITIAL_CONFIG)))
    
    // Seed pengaduan, surat, dan kontak darurat jika belum ada
    const existingPengaduan = getStorageItem(STORAGE_KEYS.PENGADUAN, null)
    if (!existingPengaduan) localStorage.setItem(STORAGE_KEYS.PENGADUAN, JSON.stringify(INITIAL_PENGADUAN))

    const existingSurat = getStorageItem(STORAGE_KEYS.SURAT, null)
    if (!existingSurat) localStorage.setItem(STORAGE_KEYS.SURAT, JSON.stringify(INITIAL_SURAT_PENGANTAR))

    const existingDarurat = getStorageItem(STORAGE_KEYS.KONTAK_DARURAT, null)
    if (!existingDarurat || !existingDarurat.some(k => k.nomor === '110' || k.nomor === '112')) {
      localStorage.setItem(STORAGE_KEYS.KONTAK_DARURAT, JSON.stringify(INITIAL_KONTAK_DARURAT))
    } else {
      let needUpdate = false
      const updatedDarurat = existingDarurat.map(k => {
        if (!k.rt_id) {
          if (k.id === 'emg-2' || (k.nama && k.nama.includes('RT 01'))) {
            needUpdate = true
            return { ...k, rt_id: 'rt-1' }
          }
          if (k.id === 'emg-rt-2' || (k.nama && k.nama.includes('RT 02'))) {
            needUpdate = true
            return { ...k, rt_id: 'rt-2' }
          }
          if (k.id === 'emg-rt-3' || (k.nama && k.nama.includes('RT 03'))) {
            needUpdate = true
            return { ...k, rt_id: 'rt-3' }
          }
        }
        return k
      })
      if (needUpdate) {
        localStorage.setItem(STORAGE_KEYS.KONTAK_DARURAT, JSON.stringify(updatedDarurat))
      }
    }

    // Seed bank accounts, qris accounts, notifications, and audit logs jika belum ada
    const existingBank = getStorageItem(STORAGE_KEYS.BANK_ACCOUNTS, null)
    if (!existingBank || !existingBank.length) {
      localStorage.setItem(STORAGE_KEYS.BANK_ACCOUNTS, JSON.stringify(INITIAL_BANK_ACCOUNTS))
    }

    const existingQris = getStorageItem(STORAGE_KEYS.QRIS_ACCOUNTS, null)
    if (!existingQris || !existingQris.length) {
      localStorage.setItem(STORAGE_KEYS.QRIS_ACCOUNTS, JSON.stringify(INITIAL_QRIS_ACCOUNTS))
    }

    const existingNotif = getStorageItem(STORAGE_KEYS.NOTIFICATIONS, null)
    if (!existingNotif) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS))
    }

    const existingAudit = getStorageItem(STORAGE_KEYS.AUDIT_LOGS, null)
    if (!existingAudit) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS))
    }

    localStorage.setItem(STORAGE_KEYS.SEEDED, 'v11')
  }

  return {
    config: getStorageItem(STORAGE_KEYS.CONFIG, INITIAL_CONFIG),
    jenisIuran: getStorageItem(STORAGE_KEYS.JENIS_IURAN, INITIAL_JENIS_IURAN),
    warga: getStorageItem(STORAGE_KEYS.WARGA, INITIAL_WARGA),
    tagihan: getStorageItem(STORAGE_KEYS.TAGIHAN, INITIAL_TAGIHAN),
    kas: getStorageItem(STORAGE_KEYS.KAS, INITIAL_KAS),
    events: getStorageItem(STORAGE_KEYS.EVENTS, INITIAL_EVENTS),
    tagihanEvents: getStorageItem(STORAGE_KEYS.TAGIHAN_EVENTS, INITIAL_TAGIHAN_EVENTS),
    rts: getStorageItem(STORAGE_KEYS.RTS, INITIAL_RTS),
    users: getStorageItem(STORAGE_KEYS.USERS, INITIAL_USERS),
    currentUser: getStorageItem(STORAGE_KEYS.CURRENT_USER, null),
    adminAuth: getStorageItem(STORAGE_KEYS.ADMIN_AUTH, INITIAL_ADMIN_AUTH),
    pengaduan: getStorageItem(STORAGE_KEYS.PENGADUAN, INITIAL_PENGADUAN),
    surat: getStorageItem(STORAGE_KEYS.SURAT, INITIAL_SURAT_PENGANTAR),
    kontakDarurat: getStorageItem(STORAGE_KEYS.KONTAK_DARURAT, INITIAL_KONTAK_DARURAT),
    bankAccounts: getStorageItem(STORAGE_KEYS.BANK_ACCOUNTS, INITIAL_BANK_ACCOUNTS),
    qrisAccounts: getStorageItem(STORAGE_KEYS.QRIS_ACCOUNTS, INITIAL_QRIS_ACCOUNTS),
    notifications: getStorageItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS),
    auditLogs: getStorageItem(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS)
  }
}

export function getStorageItem(key, defaultValue) {
  try {
    const val = localStorage.getItem(key)
    return val ? JSON.parse(val) : defaultValue
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e)
    return defaultValue
  }
}

export function deleteFromSupabase(keyName, itemId) {
  if (!isSupabaseConfigured || !supabase || !itemId) return
  try {
    const fullKey = STORAGE_KEYS[keyName.toUpperCase()] || (keyName.startsWith('wargaku_') ? keyName : `wargaku_${keyName}`)
    supabase
      .from(fullKey)
      .delete()
      .eq('id', itemId)
      .then(({ error }) => {
        if (error) console.warn(`Supabase delete warning on ${fullKey}:`, error.message)
      })
      .catch(err => console.warn(`Supabase delete catch on ${fullKey}:`, err))
  } catch (err) {
    console.warn(`Supabase delete [${keyName}/${itemId}] warning:`, err)
  }
}

export function saveStorageItem(keyName, data) {
  try {
    const fullKey = STORAGE_KEYS[keyName.toUpperCase()] || (keyName.startsWith('wargaku_') ? keyName : `wargaku_${keyName}`)
    localStorage.setItem(fullKey, JSON.stringify(data))

    // Asynchronous background sync ke Supabase jika terhubung
    if (isSupabaseConfigured && supabase) {
      const tableName = fullKey
      if (Array.isArray(data)) {
        const currentIds = data.map(item => item.id).filter(Boolean)
        const rows = data.map(item => ({
          id: item.id || 'id_' + Math.random().toString(36).substring(2, 9),
          data: item,
          updated_at: new Date().toISOString()
        }))
        if (rows.length > 0) {
          supabase
            .from(tableName)
            .upsert(rows)
            .then(({ error }) => {
              if (error) console.warn(`Supabase upsert warning on ${tableName}:`, error.message)
            })
            .catch(err => console.warn(`Supabase sync catch on ${tableName}:`, err))

          // Hapus data yang sudah tidak ada di list
          const inFilter = `(${currentIds.map(id => `"${id}"`).join(',')})`
          supabase
            .from(tableName)
            .delete()
            .not('id', 'in', inFilter)
            .then(({ error }) => {
              if (error) console.warn(`Supabase delete removed rows warning on ${tableName}:`, error.message)
            })
            .catch(err => console.warn(`Supabase delete removed rows catch on ${tableName}:`, err))
        } else {
          // Jika array kosong, hapus semua
          supabase
            .from(tableName)
            .delete()
            .neq('id', '__dummy_impossible_key__')
            .catch(err => console.warn(`Supabase clear catch on ${tableName}:`, err))
        }
      } else if (data && typeof data === 'object') {
        supabase
          .from(tableName)
          .upsert({
            id: 'main',
            data: data,
            updated_at: new Date().toISOString()
          })
          .then(({ error }) => {
            if (error) console.warn(`Supabase upsert warning on ${tableName}:`, error.message)
          })
          .catch(err => console.warn(`Supabase sync catch on ${tableName}:`, err))
      }
    }
  } catch (e) {
    console.error(`Error saving ${keyName} to storage:`, e)
  }
}

/**
 * Tarik data dari Supabase saat aplikasi dibuka
 */
export async function syncAllFromSupabase() {
  if (!isSupabaseConfigured || !supabase) return null

  try {
    const [cfgRes, jiRes, wRes, tRes, kRes, evRes, teRes, uRes, rtsRes, pRes, sRes, kdRes, baRes, qaRes, notifRes, auditRes] = await Promise.all([
      supabase.from(STORAGE_KEYS.CONFIG).select('*'),
      supabase.from(STORAGE_KEYS.JENIS_IURAN).select('*'),
      supabase.from(STORAGE_KEYS.WARGA).select('*'),
      supabase.from(STORAGE_KEYS.TAGIHAN).select('*'),
      supabase.from(STORAGE_KEYS.KAS).select('*'),
      supabase.from(STORAGE_KEYS.EVENTS).select('*'),
      supabase.from(STORAGE_KEYS.TAGIHAN_EVENTS).select('*'),
      supabase.from(STORAGE_KEYS.USERS).select('*'),
      supabase.from(STORAGE_KEYS.RTS).select('*'),
      supabase.from(STORAGE_KEYS.PENGADUAN).select('*'),
      supabase.from(STORAGE_KEYS.SURAT).select('*'),
      supabase.from(STORAGE_KEYS.KONTAK_DARURAT).select('*'),
      supabase.from(STORAGE_KEYS.BANK_ACCOUNTS).select('*'),
      supabase.from(STORAGE_KEYS.QRIS_ACCOUNTS).select('*'),
      supabase.from(STORAGE_KEYS.NOTIFICATIONS).select('*'),
      supabase.from(STORAGE_KEYS.AUDIT_LOGS).select('*')
    ])

    const extractRows = (res) => (res.data || []).map(r => r.data)
    const extractSingle = (res) => res.data?.[0]?.data || null

    const result = {
      config: extractSingle(cfgRes),
      jenisIuran: extractRows(jiRes),
      warga: extractRows(wRes),
      tagihan: extractRows(tRes),
      kas: extractRows(kRes),
      events: extractRows(evRes),
      tagihanEvents: extractRows(teRes),
      users: extractRows(uRes),
      rts: extractRows(rtsRes),
      pengaduan: extractRows(pRes),
      surat: extractRows(sRes),
      kontakDarurat: extractRows(kdRes),
      bankAccounts: extractRows(baRes),
      qrisAccounts: extractRows(qaRes),
      notifications: extractRows(notifRes),
      auditLogs: extractRows(auditRes)
    }

    // Jika Supabase masih kosong baru dibuat, auto seed dari localStorage
    if (!result.warga || result.warga.length === 0) {
      console.log('Seeding initial data ke Supabase...')
      const initial = loadInitialStorage()
      saveStorageItem('config', initial.config)
      saveStorageItem('jenis_iuran', initial.jenisIuran)
      saveStorageItem('warga', initial.warga)
      saveStorageItem('tagihan', initial.tagihan)
      saveStorageItem('kas', initial.kas)
      saveStorageItem('events', initial.events)
      saveStorageItem('tagihan_events', initial.tagihanEvents)
      saveStorageItem('users', initial.users)
      saveStorageItem('rts', initial.rts)
      saveStorageItem('pengaduan', initial.pengaduan)
      saveStorageItem('surat', initial.surat)
      saveStorageItem('kontak_darurat', initial.kontakDarurat)
      saveStorageItem('bank_accounts', initial.bankAccounts)
      saveStorageItem('qris_accounts', initial.qrisAccounts)
      saveStorageItem('notifications', initial.notifications)
      saveStorageItem('audit_logs', initial.auditLogs)
      return null
    }

    // Perbarui cache localStorage
    if (result.config) localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(result.config))
    if (result.jenisIuran.length) localStorage.setItem(STORAGE_KEYS.JENIS_IURAN, JSON.stringify(result.jenisIuran))
    if (result.warga.length) localStorage.setItem(STORAGE_KEYS.WARGA, JSON.stringify(result.warga))
    if (result.tagihan.length) localStorage.setItem(STORAGE_KEYS.TAGIHAN, JSON.stringify(result.tagihan))
    if (result.kas.length) localStorage.setItem(STORAGE_KEYS.KAS, JSON.stringify(result.kas))
    if (result.events.length) localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(result.events))
    if (result.tagihanEvents.length) localStorage.setItem(STORAGE_KEYS.TAGIHAN_EVENTS, JSON.stringify(result.tagihanEvents))
    if (result.users.length) localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(result.users))
    if (result.rts.length) localStorage.setItem(STORAGE_KEYS.RTS, JSON.stringify(result.rts))
    if (result.pengaduan.length) localStorage.setItem(STORAGE_KEYS.PENGADUAN, JSON.stringify(result.pengaduan))
    if (result.surat.length) localStorage.setItem(STORAGE_KEYS.SURAT, JSON.stringify(result.surat))
    if (result.kontakDarurat.length) localStorage.setItem(STORAGE_KEYS.KONTAK_DARURAT, JSON.stringify(result.kontakDarurat))

    return result
  } catch (err) {
    console.error('Failed to sync from Supabase:', err)
    return null
  }
}

export function resetAllStorage() {
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(INITIAL_CONFIG))
  localStorage.setItem(STORAGE_KEYS.JENIS_IURAN, JSON.stringify(INITIAL_JENIS_IURAN))
  localStorage.setItem(STORAGE_KEYS.WARGA, JSON.stringify(INITIAL_WARGA))
  localStorage.setItem(STORAGE_KEYS.TAGIHAN, JSON.stringify(INITIAL_TAGIHAN))
  localStorage.setItem(STORAGE_KEYS.KAS, JSON.stringify(INITIAL_KAS))
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS))
  localStorage.setItem(STORAGE_KEYS.TAGIHAN_EVENTS, JSON.stringify(INITIAL_TAGIHAN_EVENTS))
  localStorage.setItem(STORAGE_KEYS.SEEDED, 'true')

  // Jika terhubung Supabase, seed ulang juga
  if (isSupabaseConfigured && supabase) {
    saveStorageItem('config', INITIAL_CONFIG)
    saveStorageItem('jenis_iuran', INITIAL_JENIS_IURAN)
    saveStorageItem('warga', INITIAL_WARGA)
    saveStorageItem('tagihan', INITIAL_TAGIHAN)
    saveStorageItem('kas', INITIAL_KAS)
    saveStorageItem('events', INITIAL_EVENTS)
    saveStorageItem('tagihan_events', INITIAL_TAGIHAN_EVENTS)
  }
}

export function exportDataAsJson() {
  const data = {
    exportDate: new Date().toISOString(),
    config: getStorageItem(STORAGE_KEYS.CONFIG, INITIAL_CONFIG),
    jenisIuran: getStorageItem(STORAGE_KEYS.JENIS_IURAN, INITIAL_JENIS_IURAN),
    warga: getStorageItem(STORAGE_KEYS.WARGA, INITIAL_WARGA),
    tagihan: getStorageItem(STORAGE_KEYS.TAGIHAN, INITIAL_TAGIHAN),
    kas: getStorageItem(STORAGE_KEYS.KAS, INITIAL_KAS),
    events: getStorageItem(STORAGE_KEYS.EVENTS, INITIAL_EVENTS),
    tagihanEvents: getStorageItem(STORAGE_KEYS.TAGIHAN_EVENTS, INITIAL_TAGIHAN_EVENTS)
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `backup_wargaku_ipl_${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}
