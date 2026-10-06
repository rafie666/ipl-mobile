/**
 * Authentication & Resident Authorization Service
 * Menangani login, session token, validasi role, relasi ID, dan transaksi pendaftaran akun.
 */

import { verifyPassword, hashPassword, normalizeUsername } from '../utils/crypto'

const SESSION_TOKEN_KEY = 'wargaku_session_token'
const CURRENT_USER_KEY = 'wargaku_current_user'

/**
 * Generate lightweight secure session token
 */
export function generateSessionToken(user) {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 10)
  return `wargaku_jwt_${user.role}_${user.id}_${timestamp}_${random}`
}

let failedLoginAttempts = 0
let lockoutUntil = 0

/**
 * Endpoint Login: POST /api/login
 * @param {Object} params - { username, password, users, adminAuth }
 * @returns {Promise<{ success: boolean, token?: string, user?: Object, message?: string }>}
 */
export async function apiLogin({ username, password, users = [], adminAuth = null }) {
  // Cek apakah masih dalam masa lockout brute-force
  const now = Date.now()
  if (now < lockoutUntil) {
    const remainingSeconds = Math.ceil((lockoutUntil - now) / 1000)
    return {
      success: false,
      message: `Terlalu banyak percobaan gagal. Silakan tunggu ${remainingSeconds} detik lagi.`
    }
  }

  const inputUser = (username || '').trim().toLowerCase()
  const inputPass = (password || '').trim()

  if (!inputUser || !inputPass) {
    return { success: false, message: 'Username dan kata sandi wajib diisi!' }
  }

  // 1. Cari user di daftar master users
  const matchedUser = users.find(u => {
    const uName = (u.username || '').toLowerCase()
    const matchAlias = u.aliases && u.aliases.map(a => a.toLowerCase()).includes(inputUser)
    return uName === inputUser || matchAlias
  })

  if (matchedUser) {
    let isMatch = false
    const targetHash = matchedUser.password_hash || (matchedUser.password ? await hashPassword(matchedUser.password) : '')
    
    if (targetHash) {
      isMatch = await verifyPassword(inputPass, targetHash)
    }

    if (isMatch) {
      failedLoginAttempts = 0 // Reset attempt counter
      const sanitizedUser = {
        id: matchedUser.id,
        username: matchedUser.username,
        name: matchedUser.name || matchedUser.username,
        role: matchedUser.role, // 'admin' | 'rt' | 'warga'
        resident_id: matchedUser.resident_id || null,
        rt_id: matchedUser.rt_id || null,
        status: matchedUser.status || 'active'
      }

      const token = generateSessionToken(sanitizedUser)
      return {
        success: true,
        token,
        user: sanitizedUser
      }
    }
  }

  // 2. Fallback cek adminAuth jika custom admin diatur (Tanpa backdoor bypass password)
  if (adminAuth && (inputUser === (adminAuth.username || 'admin').toLowerCase() || inputUser === 'admin@ipl.test')) {
    const targetAdminHash = adminAuth.password_hash || (adminAuth.password ? await hashPassword(adminAuth.password) : '')
    const isPassOk = targetAdminHash ? await verifyPassword(inputPass, targetAdminHash) : false
    
    if (isPassOk) {
      failedLoginAttempts = 0 // Reset attempt counter
      const adminUser = {
        id: 'u-admin',
        username: adminAuth.username || 'admin',
        name: 'Super Administrator',
        role: 'admin',
        resident_id: null,
        rt_id: null,
        status: 'active'
      }
      const token = generateSessionToken(adminUser)
      return {
        success: true,
        token,
        user: adminUser
      }
    }
  }

  // Tingkatkan hitungan gagal untuk proteksi brute force
  failedLoginAttempts++
  if (failedLoginAttempts >= 5) {
    lockoutUntil = Date.now() + 30000 // Lockout 30 detik setelah 5x gagal
    return {
      success: false,
      message: 'Terlalu banyak percobaan login yang salah. Akun ditangguhkan sementara selama 30 detik.'
    }
  }

  return {
    success: false,
    message: 'Username/email atau kata sandi tidak sesuai. Silakan periksa kembali!'
  }
}

/**
 * Validasi keunikan username di seluruh list user
 */
export function isUsernameAvailable(username, users = [], excludeUserId = null) {
  const normalized = (username || '').trim().toLowerCase()
  if (!normalized) return false

  return !users.some(u => {
    if (excludeUserId && u.id === excludeUserId) return false
    const uName = (u.username || '').toLowerCase()
    const matchAlias = u.aliases && u.aliases.map(a => a.toLowerCase()).includes(normalized)
    return uName === normalized || matchAlias
  })
}

/**
 * Menghasilkan username unik dari nama KK
 * Misal: Bambang Sutrisno -> bambang.sutrisno. Jika ada duplikat -> bambang.sutrisno2
 */
export function generateUniqueUsername(name, users = []) {
  const base = normalizeUsername(name) || 'warga'
  let candidate = base
  let counter = 1

  while (!isUsernameAvailable(candidate, users)) {
    counter++
    candidate = `${base}${counter}`
  }

  return candidate
}

/**
 * Menghasilkan kode unik warga (3 digit, misal: 101, 102, dst)
 */
export function generateUniqueKodeUnik(existingWarga = []) {
  const existingCodes = existingWarga.map(w => String(w.kodeUnik || '')).filter(Boolean)
  
  // Cari kode mulai dari 101 s.d 999 yang belum terpakai
  for (let i = 101; i <= 999; i++) {
    const code = String(i)
    if (!existingCodes.includes(code)) {
      return code
    }
  }

  // Fallback jika penuh: 3 digit random unik
  let rand = String(Math.floor(100 + Math.random() * 900))
  while (existingCodes.includes(rand)) {
    rand = String(Math.floor(100 + Math.random() * 900))
  }
  return rand
}

/**
 * Transaksi Registrasi Warga Baru (dengan / tanpa akun)
 * @param {Object} params - { wargaData, accountData, existingWarga, existingUsers, rts }
 * @returns {Promise<{ success: boolean, warga?: Object, user?: Object, message?: string }>}
 */
export async function createResidentTransaction({
  wargaData,
  accountData = null,
  existingWarga = [],
  existingUsers = [],
  rts = []
}) {
  try {
    // 1. Validasi Input Warga
    if (!wargaData.nama || !wargaData.nama.trim()) {
      return { success: false, message: 'Nama Kepala Keluarga (KK) wajib diisi!' }
    }
    if (!wargaData.blok || !wargaData.blok.trim()) {
      return { success: false, message: 'Blok Rumah wajib diisi!' }
    }
    if (!wargaData.noRumah || !wargaData.noRumah.trim()) {
      return { success: false, message: 'Nomor Rumah wajib diisi!' }
    }

    const selectedRtId = wargaData.rt_id || rts[0]?.id || 'rt-1'
    const finalKodeUnik = wargaData.kodeUnik ? String(wargaData.kodeUnik).trim() : generateUniqueKodeUnik(existingWarga)

    // 2. Buat objek data warga baru dengan seluruh detail kependudukan
    const newResidentId = `w-${Date.now()}`
    const familyMembers = (wargaData.anggotaKeluarga && wargaData.anggotaKeluarga.length > 0)
      ? wargaData.anggotaKeluarga
      : [
          {
            id: `ak-${newResidentId}-1`,
            nama: wargaData.nama.trim(),
            nik: wargaData.nik ? wargaData.nik.trim() : '',
            hubungan: 'Kepala Keluarga',
            jenisKelamin: wargaData.jenisKelamin || 'Laki-laki',
            tempatLahir: 'Bogor',
            tanggalLahir: '1985-01-01',
            agama: wargaData.agama || 'Islam',
            pendidikan: 'SMA/SMK',
            pekerjaan: wargaData.pekerjaan ? wargaData.pekerjaan.trim() : 'Wiraswasta',
            statusPernikahan: wargaData.statusPernikahan || 'Kawin',
            golonganDarah: 'O',
            noHp: wargaData.noHp ? wargaData.noHp.trim() : ''
          }
        ]

    const newResident = {
      id: newResidentId,
      rt_id: selectedRtId,
      kodeUnik: finalKodeUnik,
      nama: wargaData.nama.trim(),
      nik: wargaData.nik ? wargaData.nik.trim() : '',
      noKk: wargaData.noKk ? wargaData.noKk.trim() : '',
      blok: wargaData.blok.toUpperCase().trim(),
      noRumah: wargaData.noRumah.trim(),
      noHp: wargaData.noHp ? wargaData.noHp.trim() : '',
      email: wargaData.email ? wargaData.email.trim() : '',
      statusHuni: wargaData.statusHuni || 'Tetap',
      statusKepemilikan: wargaData.statusKepemilikan || (wargaData.statusHuni === 'Kontrak' ? 'Sewa / Kontrak' : 'Milik Sendiri'),
      jenisKelamin: wargaData.jenisKelamin || 'Laki-laki',
      agama: wargaData.agama || 'Islam',
      statusPernikahan: wargaData.statusPernikahan || 'Kawin',
      jumlahJiwa: familyMembers.length || Number(wargaData.jumlahJiwa) || 1,
      pekerjaan: wargaData.pekerjaan ? wargaData.pekerjaan.trim() : '',
      lat: Number(wargaData.lat) || -6.59715,
      lng: Number(wargaData.lng) || 106.76415,
      kontakDaruratNama: wargaData.kontakDaruratNama ? wargaData.kontakDaruratNama.trim() : '',
      kontakDaruratHp: wargaData.kontakDaruratHp ? wargaData.kontakDaruratHp.trim() : '',
      kontakDaruratHubungan: wargaData.kontakDaruratHubungan ? wargaData.kontakDaruratHubungan.trim() : 'Keluarga',
      tglMasuk: wargaData.tglMasuk || new Date().toISOString().slice(0, 10),
      catatan: wargaData.catatan ? wargaData.catatan.trim() : '',
      anggotaKeluarga: familyMembers,
      aktif: true,
      created_at: new Date().toISOString()
    }

    let newUser = null

    // 3. Jika opsi "Buat Akun Warga" aktif
    if (accountData && accountData.createAccount) {
      const username = (accountData.username || '').trim().toLowerCase()
      const password = accountData.password || ''
      const confirmPassword = accountData.confirmPassword || ''

      if (!username) {
        return { success: false, message: 'Username akun warga wajib diisi!' }
      }
      if (!isUsernameAvailable(username, existingUsers)) {
        return { success: false, message: `Username "${username}" sudah digunakan. Silakan pilih username lain!` }
      }
      if (!password || password.length < 4) {
        return { success: false, message: 'Kata sandi minimal 4 karakter!' }
      }
      if (password !== confirmPassword) {
        return { success: false, message: 'Konfirmasi kata sandi tidak cocok!' }
      }

      // Hash password
      const passwordHash = await hashPassword(password)

      const newUserId = `u-${Date.now()}`
      newUser = {
        id: newUserId,
        username: username,
        aliases: [username, newResidentId],
        password_hash: passwordHash,
        name: newResident.nama,
        role: 'warga',
        resident_id: newResidentId,
        rt_id: selectedRtId,
        status: 'active',
        created_at: new Date().toISOString()
      }
    }

    return {
      success: true,
      warga: newResident,
      user: newUser,
      message: newUser 
        ? 'Data warga dan akun login berhasil dibuat.' 
        : 'Data warga berhasil ditambahkan.'
    }
  } catch (err) {
    console.error('Transaction failed:', err)
    return { success: false, message: `Gagal memproses pendaftaran warga: ${err.message}` }
  }
}

/**
 * Filter data warga dan tagihan berdasarkan otorisasi role
 * - Admin: Semua data
 * - RT: Hanya data pada rt_id miliknya
 * - Warga: Hanya data pada resident_id miliknya
 */
export function filterResidentsByRole(residents = [], currentUser) {
  if (!currentUser) return []
  if (currentUser.role === 'admin') return residents
  if (currentUser.role === 'rt') {
    return residents.filter(r => r.rt_id === currentUser.rt_id)
  }
  if (currentUser.role === 'warga') {
    return residents.filter(r => r.id === currentUser.resident_id)
  }
  return []
}

export function filterBillsByRole(bills = [], residents = [], currentUser) {
  if (!currentUser) return []
  if (currentUser.role === 'admin') return bills
  
  const accessibleResidentIds = new Set(filterResidentsByRole(residents, currentUser).map(r => r.id))
  return bills.filter(b => accessibleResidentIds.has(b.wargaId))
}

/**
 * Filter catatan kas berdasarkan otorisasi role
 * - Admin: Kas tingkat RW (scope 'rw' atau tanpa rt_id), tidak melihat kas RT
 * - RT: Kas khusus RT miliknya (rt_id sesuai), tidak melihat kas RW ataupun kas RT lain
 */
export function filterKasByRole(kas = [], currentUser) {
  if (!currentUser) return []
  if (currentUser.role === 'admin') {
    return kas.filter(k => k.scope === 'rw' || (!k.scope && !k.rt_id))
  }
  if (currentUser.role === 'rt') {
    return kas.filter(k => k.rt_id === currentUser.rt_id || (k.scope === 'rt' && k.rt_id === currentUser.rt_id))
  }
  if (currentUser.role === 'warga') {
    return kas.filter(k => k.rt_id === currentUser.rt_id)
  }
  return []
}

/**
 * Filter acara/pengumuman berdasarkan otorisasi role dan target penerima (Semua Warga / Perorangan)
 * - Admin: Melihat seluruh pengumuman/acara
 * - RT: Melihat pengumuman RW + pengumuman RT miliknya
 * - Warga:
 *   * Pengumuman perorangan (targetType === 'personal'): hanya muncul jika targetWargaId === resident_id warga tsb
 *   * Pengumuman umum (targetType !== 'personal'): muncul jika tingkat RW atau tingkat RT milik warga tsb
 */
export function filterEventsByRole(events = [], currentUser) {
  if (!currentUser) return events.filter(e => e.scope === 'rw' || !e.rt_id)
  if (currentUser.role === 'admin') return events
  if (currentUser.role === 'rt') {
    return events.filter(e => e.scope === 'rw' || !e.rt_id || e.rt_id === currentUser.rt_id)
  }
  if (currentUser.role === 'warga') {
    return events.filter(e => {
      // Jika pesan/pengumuman khusus perorangan
      if (e.targetType === 'personal') {
        return e.targetWargaId === currentUser.resident_id
      }
      // Jika pengumuman umum broadcast
      return e.scope === 'rw' || !e.rt_id || e.rt_id === currentUser.rt_id
    })
  }
  return events
}

/**
 * Filter tagihan acara berdasarkan otorisasi role
 * - Admin: Semua tagihan acara
 * - RT: Tagihan acara warga yang berdomisili di RT tersebut
 * - Warga: Tagihan acara milik sendiri
 */
export function filterTagihanEventsByRole(tagihanEvents = [], residents = [], currentUser) {
  if (!currentUser) return []
  if (currentUser.role === 'admin') return tagihanEvents
  
  const accessibleResidentIds = new Set(filterResidentsByRole(residents, currentUser).map(r => r.id))
  return tagihanEvents.filter(te => accessibleResidentIds.has(te.wargaId))
}

/**
 * Filter kontak darurat berdasarkan role & wilayah RT:
 * - Admin: Melihat seluruh kontak darurat (nasional, umum, maupun seluruh RT)
 * - RT: Melihat kontak umum (tanpa rt_id) + kontak khusus wilayah RT miliknya saja
 * - Warga: Melihat kontak umum (tanpa rt_id) + kontak khusus wilayah RT domisilinya saja (misal RT 2 hanya lihat RT 2)
 */
export function filterKontakDaruratByRole(kontakList = [], currentUser, currentWarga = null) {
  if (!kontakList || kontakList.length === 0) return []
  if (!currentUser) return kontakList.filter(k => !k.rt_id)

  if (currentUser.role === 'admin') {
    return kontakList
  }

  const userRtId = currentUser.role === 'warga'
    ? (currentWarga?.rt_id || currentUser.rt_id)
    : (currentUser.rt_id)

  // Kontak umum (!k.rt_id) terbuka untuk semua warga & RT
  // Kontak RT spesifik hanya tampil untuk warga/pengurus di RT bersangkutan
  return kontakList.filter(k => !k.rt_id || k.rt_id === userRtId)
}

