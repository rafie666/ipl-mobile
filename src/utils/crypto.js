/**
 * Utility Cryptographic Hashing untuk password menggunakan Web Crypto API
 * SHA-256 dengan secure salting
 */

const DEFAULT_SALT_PREFIX = 'wargaku_salt_2026_'

/**
 * Generate cryptographic random salt
 */
export function generateRandomSalt(length = 16) {
  const array = new Uint8Array(length)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array)
  } else {
    for (let i = 0; i < length; i++) array[i] = Math.floor(Math.random() * 256)
  }
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Hash password menggunakan SHA-256
 * @param {string} password - Plain text password
 * @param {string} [customSalt] - Salt string
 * @returns {Promise<string>} Hex hash string
 */
export async function hashPassword(password, customSalt = null) {
  if (!password) return ''
  const salt = customSalt || DEFAULT_SALT_PREFIX
  const salted = `${salt}${password}`
  const encoder = new TextEncoder()
  const data = encoder.encode(salted)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Verifikasi apakah plaintext password cocok dengan hash yang tersimpan.
 * Catatan Keamanan: Tidak mengizinkan fallback perbandingan plaintext (SEC-04/SEC-05 Fix).
 * @param {string} plainPassword 
 * @param {string} storedHash 
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(plainPassword, storedHash) {
  if (!plainPassword || !storedHash) return false

  // Verifikasi hash SHA-256
  const computedHash = await hashPassword(plainPassword)
  return computedHash === storedHash
}

/**
 * Normalisasi nama kepala keluarga menjadi username unik
 * Contoh: "Bpk. Bambang Sutrisno" -> "bambang.sutrisno"
 * @param {string} name 
 * @returns {string}
 */
export function normalizeUsername(name) {
  if (!name) return ''
  return name
    .toLowerCase()
    .replace(/^(bpk\.|bapak\.|ibu\.|h\.|hj\.|dr\.|drs\.)\s*/gi, '')
    .trim()
    .replace(/[^a-z0-9\s._-]/g, '')
    .replace(/\s+/g, '.')
    .replace(/\.+/g, '.')
}
