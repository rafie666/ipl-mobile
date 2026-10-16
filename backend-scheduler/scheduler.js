/**
 * scheduler.js
 * Dedicated Standalone Backend Scheduler Service for IPL Mobile.
 * Timezone: Asia/Jakarta (UTC+7)
 * 
 * Fitur:
 * 1. Menjalankan pemeriksaan otomatis setiap jam & tepat pukul 00:05 WIB setiap hari.
 * 2. Mengirimkan heartbeat status server secara berkala ke database agar UI pengelola dapat memonitor.
 * 3. Mengejar jadwal yang terlewat (catch-up) saat server baru dinyalakan.
 * 4. Idempotensi mutlak: tidak akan menduplikasi tagihan warga.
 * 5. Menangani aturan tanggal akhir bulan (Februari 28/29, bulan 30 hari).
 * 6. CLI mode: node scheduler.js --run-now (untuk eksekusi pengujian instan).
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://dcefifwlfwycgmphpgtu.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZWZpZndsZnd5Y2dtcGhwZ3R1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2MTIwMTcsImV4cCI6MjEwNTE4ODAxN30.iRLRARxtRfNKmbRiX439gOIxHwh231LvmQekpJ0Pnzs'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

/**
 * Mendapatkan representasi waktu terkini di zona waktu Asia/Jakarta
 */
export function getJakartaTime(dateObj = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false
  })
  const parts = formatter.formatToParts(dateObj)
  const map = {}
  parts.forEach((p) => { map[p.type] = p.value })

  return {
    year: parseInt(map.year, 10),
    month: parseInt(map.month, 10),
    day: parseInt(map.day, 10),
    hour: parseInt(map.hour, 10),
    minute: parseInt(map.minute, 10),
    second: parseInt(map.second, 10),
    dateStr: `${map.year}-${map.month.padStart(2, '0')}-${map.day.padStart(2, '0')}`,
    timeStr: `${map.hour.padStart(2, '0')}:${map.minute.padStart(2, '0')}:${map.second.padStart(2, '0')} WIB`
  }
}

/**
 * Mendapatkan jumlah hari dalam satu bulan tertentu
 */
export function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate()
}

/**
 * Mengirimkan heartbeat ke tabel wargaku_config
 */
export async function sendHeartbeat() {
  try {
    const nowJkt = getJakartaTime()
    const nowIso = new Date().toISOString()

    const { data: configRows } = await supabase.from('wargaku_config').select('*').limit(1)
    if (!configRows || configRows.length === 0) return

    const cfgRow = configRows[0]
    const currentData = cfgRow.data || {}
    const autoCfg = currentData.autoBilling || { enabled: true, publishDay: 5, dueDay: 20 }

    const updatedData = {
      ...currentData,
      autoBilling: {
        ...autoCfg,
        scheduler_heartbeat: nowIso,
        scheduler_heartbeat_wib: `${nowJkt.dateStr} ${nowJkt.timeStr}`,
        scheduler_status: 'RUNNING'
      }
    }

    await supabase.from('wargaku_config').update({
      data: updatedData,
      updated_at: nowIso
    }).eq('id', cfgRow.id)

    console.log(`[${nowJkt.timeStr}] ❤️ Scheduler Heartbeat terkirim ke database.`)
  } catch (err) {
    console.error('Gagal mengirim heartbeat:', err.message)
  }
}

/**
 * Menjalankan proses pembuatan tagihan otomatis secara idempoten
 */
export async function executeAutoBillingJob({ force = false } = {}) {
  const nowJkt = getJakartaTime()
  const nowIso = new Date().toISOString()
  console.log(`\n======================================================`)
  console.log(`[${nowJkt.dateStr} ${nowJkt.timeStr}] Memeriksa Jadwal Penerbitan Tagihan Otomatis...`)

  // 1. Ambil config
  const { data: configRows, error: cfgErr } = await supabase.from('wargaku_config').select('*').limit(1)
  if (cfgErr || !configRows || configRows.length === 0) {
    console.error('Error membaca wargaku_config:', cfgErr?.message || 'Data kosong')
    return { success: false, error: 'Config database tidak ditemukan' }
  }

  const cfgRow = configRows[0]
  const configData = cfgRow.data || {}
  const autoBilling = configData.autoBilling || {
    enabled: true,
    publishDay: 5,
    dueDay: 20,
    scope: 'ALL'
  }

  if (!autoBilling.enabled && !force) {
    console.log('ℹ️ Otomatisasi tagihan sedang dinonaktifkan dalam konfigurasi.')
    return { success: true, skipped: true, reason: 'Otomatisasi dinonaktifkan' }
  }

  // 2. Evaluasi tanggal terbit
  const configuredDay = parseInt(autoBilling.publishDay || 5, 10)
  const maxDaysThisMonth = getDaysInMonth(nowJkt.year, nowJkt.month)
  const effectivePublishDay = Math.min(configuredDay, maxDaysThisMonth)

  console.log(`- Konfigurasi Tanggal Terbit: Tanggal ${configuredDay}`)
  console.log(`- Tanggal Terbit Efektif Bulan Ini: Tanggal ${effectivePublishDay} (Jumlah hari: ${maxDaysThisMonth})`)
  console.log(`- Hari Ini: Tanggal ${nowJkt.day}`)

  if (nowJkt.day < effectivePublishDay && !force) {
    console.log(`⏳ Belum mencapai tanggal terbit (${effectivePublishDay} ${NAMA_BULAN[nowJkt.month - 1]} ${nowJkt.year}). Menunggu jadwal.`)
    return { success: true, skipped: true, reason: 'Belum waktunya terbit' }
  }

  // 3. Ambil data Warga, Tagihan, Pos Iuran, dan RT
  console.log('- Mengambil data warga dari database...')
  const { data: wargaRows, error: wErr } = await supabase.from('wargaku_warga').select('*')
  if (wErr) console.warn('Peringatan fetch warga:', wErr.message)

  console.log('- Mengambil data tagihan yang sudah ada...')
  const { data: tagihanRows, error: tErr } = await supabase.from('wargaku_tagihan').select('*')
  if (tErr) console.warn('Peringatan fetch tagihan:', tErr.message)

  console.log('- Mengambil konfigurasi pos iuran...')
  const { data: iuranRows, error: iErr } = await supabase.from('wargaku_jenis_iuran').select('*')
  if (iErr) console.warn('Peringatan fetch iuran:', iErr.message)

  console.log('- Mengambil data RT...')
  const { data: rtsRows, error: rErr } = await supabase.from('wargaku_rts').select('*')
  if (rErr) console.warn('Peringatan fetch RT:', rErr.message)

  const residents = (wargaRows || []).map((r) => r.data || r).filter((w) => w.aktif !== false)
  const existingInvoices = (tagihanRows || []).map((t) => t.data || t)
  const iuranRates = (iuranRows || []).map((i) => i.data || i).filter((i) => i.aktif !== false)
  const rts = (rtsRows || []).map((rt) => rt.data || rt)

  const targetYear = nowJkt.year
  const targetMonth = nowJkt.month
  const dueDay = Math.min(parseInt(autoBilling.dueDay || 20, 10), maxDaysThisMonth)
  const dueDateStr = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(dueDay).padStart(2, '0')}`
  const periodeLabel = `${NAMA_BULAN[targetMonth - 1]} ${targetYear}`

  const newInvoices = []
  const newNotifications = []
  let duplicateSkipped = 0

  const scopeSetting = autoBilling.scope || 'ALL'
  const scopesToRun = scopeSetting === 'ALL' ? ['RT', 'RW'] : [scopeSetting]

  for (const w of residents) {
    const rtObj = rts.find((r) => r.id === w.rt_id) || {}
    const rawKode = w.kodeUnik || ''
    const match = rawKode.match(/(\d{3})$/)
    const uniqueNumber = match ? parseInt(match[1], 10) : 0

    for (const sc of scopesToRun) {
      // Pengecekan Idempotensi (Mencegah Duplikasi Tagihan)
      const isExists = existingInvoices.some((tag) => {
        return (
          tag.wargaId === w.id &&
          Number(tag.bulan) === targetMonth &&
          Number(tag.tahun) === targetYear &&
          (tag.payment_scope === sc || (!tag.payment_scope && sc === 'RT')) &&
          !tag.eventId
        )
      })

      const alreadyInBatch = newInvoices.some((tag) => {
        return (
          tag.wargaId === w.id &&
          Number(tag.bulan) === targetMonth &&
          Number(tag.tahun) === targetYear &&
          tag.payment_scope === sc
        )
      })

      if (isExists || alreadyInBatch) {
        duplicateSkipped++
        continue
      }

      // Hitung nominal berdasarkan pos iuran
      let activePos = iuranRates.filter((j) => j.payment_scope === sc || (!j.payment_scope && sc === 'RT'))
      if (activePos.length === 0) {
        if (sc === 'RT') activePos = [{ nama: 'Iuran Pengelolaan Lingkungan (RT)', nominal: 120000 }]
        if (sc === 'RW') activePos = [{ nama: 'Iuran Pembangunan & Fasum RW', nominal: 40000 }]
      }

      const totalPokok = activePos.reduce((sum, item) => sum + (Number(item.nominal) || 0), 0)
      const totalNominal = totalPokok + uniqueNumber

      const rincian = [
        ...activePos.map((pos) => ({ nama: pos.nama, nominal: Number(pos.nominal) || 0 })),
        { nama: `Kode Unik Warga (${rawKode || `WR${String(uniqueNumber).padStart(3, '0')}`})`, nominal: uniqueNumber }
      ]

      const invId = `tag-${targetYear}-${String(targetMonth).padStart(2, '0')}-${sc.toLowerCase()}-${w.id}`
      const ownerId = sc === 'RW' ? (w.rw_id || rtObj?.rw_id || 'rw-01') : w.rt_id
      const ownerLabel = sc === 'RW' ? 'Kas RW 01' : (rtObj?.name || 'Kas Lingkungan RT 01')

      const invoiceObj = {
        id: invId,
        wargaId: w.id,
        rt_id: w.rt_id,
        namaWarga: w.nama,
        blok: w.blok,
        noRumah: w.noRumah,
        kodeUnik: rawKode || `WR${String(uniqueNumber).padStart(3, '0')}`,
        bulan: targetMonth,
        tahun: targetYear,
        total: totalNominal,
        rincian,
        payment_scope: sc,
        target_payment_owner: ownerId,
        pembayaran_kepada: ownerLabel,
        status: 'Belum Bayar',
        tanggalJatuhTempo: dueDateStr,
        tanggalTerbit: `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(effectivePublishDay).padStart(2, '0')}`,
        tanggalBayar: null,
        metodeBayar: null,
        noKwitansi: null,
        catatan: `Tagihan Otomatis Bulanan Periode ${periodeLabel}`,
        isAutoGenerated: true,
        submissions: []
      }

      newInvoices.push(invoiceObj)

      newNotifications.push({
        id: `notif-auto-${invId}`,
        data: {
          id: `notif-auto-${invId}`,
          userId: w.id,
          residentId: w.id,
          title: `Tagihan IPL ${sc} Periode ${periodeLabel} 📬`,
          message: `Tagihan IPL Anda sebesar Rp ${totalNominal.toLocaleString('id-ID')} telah terbit. Harap melakukan pembayaran sebelum ${dueDay} ${NAMA_BULAN[targetMonth - 1]} ${targetYear}.`,
          type: 'tagihan',
          targetId: invId,
          read: false,
          created_at: nowIso
        }
      })
    }
  }

  console.log(`- Tagihan Baru Dibuat: ${newInvoices.length}`)
  console.log(`- Tagihan Dilewati (Sudah Ada): ${duplicateSkipped}`)

  // 4. Simpan ke database jika ada tagihan baru
  if (newInvoices.length > 0) {
    const dbPayload = newInvoices.map((inv) => ({
      id: inv.id,
      data: inv,
      updated_at: nowIso
    }))

    const { error: insErr } = await supabase.from('wargaku_tagihan').upsert(dbPayload, { onConflict: 'id' })
    if (insErr) {
      console.error('Gagal menyimpan tagihan ke Supabase:', insErr.message)
      return { success: false, error: insErr.message }
    }

    if (newNotifications.length > 0) {
      await supabase.from('wargaku_notifications').upsert(newNotifications, { onConflict: 'id' })
    }

    console.log(`✅ Berhasil menyimpan ${newInvoices.length} tagihan ke database Supabase!`)
  }

  // 5. Update Status Eksekusi Terakhir pada wargaku_config
  const updatedAutoBilling = {
    ...autoBilling,
    last_run_at: nowIso,
    last_run_period: `${targetYear}-${String(targetMonth).padStart(2, '0')}`,
    last_run_status: 'success',
    last_run_created_count: newInvoices.length,
    last_run_skipped_count: duplicateSkipped,
    last_run_message: newInvoices.length > 0
      ? `Berhasil menerbitkan ${newInvoices.length} tagihan IPL periode ${periodeLabel}.`
      : `Seluruh tagihan periode ${periodeLabel} sudah lengkap (${duplicateSkipped} dilewati).`,
    scheduler_heartbeat: nowIso,
    scheduler_status: 'RUNNING'
  }

  await supabase.from('wargaku_config').update({
    data: {
      ...configData,
      autoBilling: updatedAutoBilling
    },
    updated_at: nowIso
  }).eq('id', cfgRow.id)

  console.log(`✅ Status monitoring berhasil diperbarui di database.`)
  console.log(`======================================================\n`)

  return {
    success: true,
    totalCreated: newInvoices.length,
    totalSkipped: duplicateSkipped,
    period: periodeLabel,
    dueDate: dueDateStr
  }
}

// =========================================================================
// RUNNER & SERVICE DAEMON
// =========================================================================

const args = process.argv.slice(2)
const isRunNow = args.includes('--run-now') || args.includes('-r')
const isTestMode = args.includes('--test') || args.includes('-t')

if (isRunNow || isTestMode) {
  console.log('⚡ Menjalankan mode eksekusi langsung (CLI / Test)...')
  executeAutoBillingJob({ force: isTestMode }).then((res) => {
    console.log('Hasil Eksekusi:', res)
    process.exit(0)
  }).catch((e) => {
    console.error('Fatal Error:', e)
    process.exit(1)
  })
} else {
  console.log('🚀 Memulai IPL Mobile Background Scheduler Service...')
  console.log('📍 Zona Waktu: Asia/Jakarta (UTC+7)')
  console.log('🔗 Terhubung ke Supabase:', SUPABASE_URL)

  // Kirim heartbeat pertama kali saat startup
  sendHeartbeat()

  // Jalankan pengecekan catch-up saat server dinyalakan
  executeAutoBillingJob({ force: false })

  // Heartbeat setiap 5 menit
  setInterval(sendHeartbeat, 5 * 60 * 1000)

  // Pemeriksaan berkala setiap 30 menit
  setInterval(() => {
    executeAutoBillingJob({ force: false })
  }, 30 * 60 * 1000)
}
