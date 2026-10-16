/**
 * Moota Payment & Mutation Verification Service for Wargaku IPL (Web Version)
 * Mendukung Sandbox & Live Account Moota
 */

export const DEFAULT_MOOTA_CONFIG = {
  API_URL: 'https://app.moota.co/api/v2',
  API_TOKEN:
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJucWllNHN3OGxsdyIsImp0aSI6ImZlMTIyMzRlYzNjZmVkNjVhOTIyNDRkZmEwZDY3OGQ4YzQ2ZTU2OGU4NmZlZGNjMjJlZmQ2YTZhNmRhZGE3MmNiOTMyYjYyZjljYTVhYWZkIiwiaWF0IjoxNzkxNTM0MjY0Ljg0Nzc1NiwibmJmIjoxNzkxNTM0MjY0Ljg0Nzc2NywiZXhwIjoxODIzMDcwMjY0Ljg0MjczOSwic3ViIjoiNDYwMjIiLCJzY29wZXMiOlsiYXBpIiwidXNlciIsInVzZXJfcmVhZCIsImJhbmsiLCJiYW5rX3JlYWQiLCJtdXRhdGlvbiIsIm11dGF0aW9uX3JlYWQiXX0.cMZn2ocAg8po3P8bFbEklNyOnfTemUEXfWmJop0rwF8iXht6efMnxFaYYGkF62MqQg6nV5NjI_gd2PoFJ7LxnV_CLtkNlyiAsiUgp3Ofquh5V89fIfjp_u8yoFeqQdop3M5jW-ejL_7vLvq7DDh0zKacdvpXiamJeHIv-eAYNHFdevILEs_y3AdmzLz-QPBIwW33Jw8q2A8FCPdyEIQZzdfRjmy3MkR_31397WbjyCMZu8LlXwHcJ-wMW2lP0-EG5pGPHE3-YstpyjFALilYMTA7Faa-wU1UK0cOneclZC6ONoN8PA5Go1kTAAI0FgeVqNahZ0vxaY9vDVgrUxg_YhaD924J0DAP9kwXNIxmPNG4NoP9nDhIbAWlrmEK2Or4bWp--dI72lZBJfIuAKZTAt1jz3xDymcsKwfzwefMc9LwU0QKhgdequXub-ep9Q6mm-VfqtNi6IE9t68w0W1KFNBnUKBeSa1WovdlYHJ7-9hEu-gMtV4wTAurS9KHtphWLwzMcM4gCYdh2lC70rwSQLLQcVk7cktUSi4V8KIBNqywa4FvwRS26sRZjqkwkdqjeoM-PCDuCCC4EU9B-a8VCrwlVLOZJ_f-l_ueyOiugwbfL5L6XwtNIy9KsW3FXnCUuIA0kmGeclbAHXK19RVxuZ3m-dXSn3M5OHPfnxzOTXw',
  BANK_ID: 'Lagzqp0Pk42',
  BANK_ACCOUNT_NUMBER: '090908080777',
  BANK_HOLDER_NAME: 'Rafi Nurrahman',
  BANK_LABEL: 'Bank Transfer (Sandbox)',
  IS_ACTIVE: true
}

const STORAGE_MOOTA_CONFIG = 'wargaku_moota_config'

export function getMootaConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_MOOTA_CONFIG)
    if (saved) {
      const parsed = JSON.parse(saved)
      return { ...DEFAULT_MOOTA_CONFIG, ...parsed }
    }
  } catch (err) {
    console.warn('Gagal membaca config moota:', err)
  }
  return DEFAULT_MOOTA_CONFIG
}

export function saveMootaConfig(config) {
  try {
    localStorage.setItem(STORAGE_MOOTA_CONFIG, JSON.stringify(config))
    return true
  } catch (err) {
    console.warn('Gagal menyimpan config moota:', err)
    return false
  }
}

export async function getMootaBankDetail() {
  try {
    const config = getMootaConfig()
    const res = await fetch(`${config.API_URL}/bank`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${config.API_TOKEN}`
      }
    })

    if (res.ok) {
      const data = await res.json()
      const banks = data?.data || (Array.isArray(data) ? data : [])
      const matched = banks.find((b) => b.bank_id === config.BANK_ID || b.token === config.BANK_ID || b.id === config.BANK_ID) || banks[0]
      if (matched) {
        return {
          id: matched.bank_id || matched.token || config.BANK_ID,
          bank_id: matched.bank_id || matched.token || config.BANK_ID,
          bank_name: matched.label || matched.bank_type || 'Bank Transfer (Sandbox)',
          account_number: matched.account_number || config.BANK_ACCOUNT_NUMBER,
          account_holder: matched.atas_nama || config.BANK_HOLDER_NAME,
          username: matched.username,
          balance: matched.balance,
          icon: matched.icon
        }
      }
    }
  } catch (e) {
    console.warn('Gagal fetch live bank detail dari Moota, menggunakan default:', e)
  }

  return {
    id: DEFAULT_MOOTA_CONFIG.BANK_ID,
    bank_id: DEFAULT_MOOTA_CONFIG.BANK_ID,
    bank_name: DEFAULT_MOOTA_CONFIG.BANK_LABEL,
    account_number: DEFAULT_MOOTA_CONFIG.BANK_ACCOUNT_NUMBER,
    account_holder: DEFAULT_MOOTA_CONFIG.BANK_HOLDER_NAME,
    username: 'nurrahmanrafi78'
  }
}

export async function fetchMootaMutations(type = 'all', perPage = 50) {
  try {
    const config = getMootaConfig()
    let url = `${config.API_URL}/mutation?bank=${config.BANK_ID}&per_page=${perPage}`
    if (type && type !== 'all') {
      url += `&type=${type.toUpperCase()}`
    }

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${config.API_TOKEN}`
      }
    })

    if (!res.ok) {
      return {
        success: false,
        message: `Gagal membaca mutasi (${res.status})`,
        data: []
      }
    }

    const json = await res.json()
    const mutations = json?.data || (Array.isArray(json) ? json : [])

    return {
      success: true,
      total: json?.total ?? mutations.length,
      data: mutations
    }
  } catch (error) {
    return {
      success: false,
      message: error?.message || 'Gagal mengambil mutasi dari Moota',
      data: []
    }
  }
}

export async function checkMootaMutation(targetAmount, customBankId = null) {
  try {
    const config = getMootaConfig()
    const bankId = customBankId || config.BANK_ID
    const targetNominal = Number(targetAmount)

    if (isNaN(targetNominal) || targetNominal <= 0) {
      return { found: false, message: 'Nominal tidak valid.' }
    }

    const url = `${config.API_URL}/mutation?bank=${bankId}`
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${config.API_TOKEN}`
      }
    })

    if (!res.ok) {
      return {
        found: false,
        message: `Gagal membaca mutasi dari Moota (${res.status})`
      }
    }

    const json = await res.json()
    const mutations = json?.data || (Array.isArray(json) ? json : [])

    const match = mutations.find((m) => {
      const rawAmt = String(m.amount || m.nominal || 0).replace(/[^0-9.]/g, '')
      const amt = Math.round(parseFloat(rawAmt) || 0)
      const typeStr = String(m.type || '').toUpperCase()
      const isCredit = typeStr === 'CR' || typeStr === 'CREDIT' || typeStr === 'MASUK' || (!typeStr && amt > 0)
      return isCredit && amt === targetNominal
    })

    if (match) {
      return {
        found: true,
        mutation: match,
        message: `Mutasi transfer sebesar Rp ${targetNominal.toLocaleString('id-ID')} ditemukan!`
      }
    }

    return {
      found: false,
      mutationsChecked: mutations.length,
      message: `Belum ada mutasi masuk sebesar Rp ${targetNominal.toLocaleString('id-ID')}. Pastikan Anda sudah transfer dengan nominal yang persis.`
    }
  } catch (error) {
    return {
      found: false,
      error: true,
      message: error?.message || 'Gagal memeriksa mutasi transfer di Moota.'
    }
  }
}
