import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { getStorageItem, saveStorageItem } from '../utils/storage'

// Tabel mapping
export const TABLES = {
  CONFIG: 'wargaku_config',
  JENIS_IURAN: 'wargaku_jenis_iuran',
  WARGA: 'wargaku_warga',
  TAGIHAN: 'wargaku_tagihan',
  KAS: 'wargaku_kas',
  EVENTS: 'wargaku_events',
  TAGIHAN_EVENTS: 'wargaku_tagihan_events'
}

/**
 * Ambil data dari Supabase jika online, fallback ke localStorage
 */
export async function loadTableData(tableName, storageKey, defaultData) {
  // Always read localStorage first for instant render
  const localData = getStorageItem(storageKey, defaultData)

  if (!isSupabaseConfigured || !supabase) {
    return localData
  }

  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')

    if (error) {
      console.warn(`Supabase load error [${tableName}]:`, error.message)
      return localData
    }

    if (!data || data.length === 0) {
      // Jika di supabase masih kosong, seeding data awal dari local
      await seedTableToSupabase(tableName, localData)
      return localData
    }

    // Ekstrak data JSONB dari baris
    const parsedData = Array.isArray(localData)
      ? data.map(row => row.data)
      : data[0]?.data || localData

    // Simpan cache ke localStorage
    saveStorageItem(storageKey, parsedData)
    return parsedData
  } catch (err) {
    console.error(`Error connecting to Supabase for ${tableName}:`, err)
    return localData
  }
}

/**
 * Seed data lokal ke Supabase jika tabel baru dibuat
 */
export async function seedTableToSupabase(tableName, data) {
  if (!isSupabaseConfigured || !supabase) return

  try {
    if (Array.isArray(data)) {
      const rows = data.map(item => ({
        id: item.id || String(Math.random()),
        data: item,
        updated_at: new Date().toISOString()
      }))
      if (rows.length > 0) {
        await supabase.from(tableName).upsert(rows)
      }
    } else if (data && typeof data === 'object') {
      await supabase.from(tableName).upsert({
        id: 'main',
        data: data,
        updated_at: new Date().toISOString()
      })
    }
  } catch (err) {
    console.warn(`Seed failed for ${tableName}:`, err)
  }
}

/**
 * Simpan / update 1 item ke Supabase dan localStorage
 */
export async function upsertItem(tableName, storageKey, item, allItems) {
  // Simpan ke local dulu (instan)
  saveStorageItem(storageKey, allItems)

  if (!isSupabaseConfigured || !supabase) return

  try {
    await supabase.from(tableName).upsert({
      id: item.id || 'main',
      data: item,
      updated_at: new Date().toISOString()
    })
  } catch (err) {
    console.error(`Gagal sync item ${item.id} ke Supabase:`, err)
  }
}

/**
 * Hapus 1 item dari Supabase dan localStorage
 */
export async function removeItem(tableName, storageKey, itemId, allItems) {
  saveStorageItem(storageKey, allItems)

  if (!isSupabaseConfigured || !supabase) return

  try {
    await supabase.from(tableName).delete().eq('id', itemId)
  } catch (err) {
    console.error(`Gagal delete item ${itemId} di Supabase:`, err)
  }
}

/**
 * Simpan seluruh array/object (misal generate massal atau config)
 */
export async function syncFullTable(tableName, storageKey, fullData) {
  saveStorageItem(storageKey, fullData)

  if (!isSupabaseConfigured || !supabase) return

  try {
    if (Array.isArray(fullData)) {
      const rows = fullData.map(item => ({
        id: item.id,
        data: item,
        updated_at: new Date().toISOString()
      }))
      await supabase.from(tableName).upsert(rows)
    } else {
      await supabase.from(tableName).upsert({
        id: 'main',
        data: fullData,
        updated_at: new Date().toISOString()
      })
    }
  } catch (err) {
    console.error(`Gagal sync full table ${tableName}:`, err)
  }
}

/**
 * Pasang Realtime Listener agar jika warga di HP upload, admin langsung update otomatis
 */
export function subscribeToTable(tableName, onUpdate) {
  if (!isSupabaseConfigured || !supabase) return () => {}

  const channel = supabase
    .channel(`realtime:${tableName}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: tableName },
      (payload) => {
        onUpdate(payload)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
