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
 * 6. Mematuhi pengaturan waktu terbit (publishTime).
 * 7. Mematuhi toggle autoPost per pos iuran.
 * 8. REST API internal untuk trigger & health check status.
 * 9. CLI mode: node scheduler.js --run-now (untuk eksekusi pengujian instan).
 */

import http from 'node:http'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://dcefifwlfwycgmphpgtu.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZWZpZndsZnd5Y2dtcGhwZ3R1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2MTIwMTcsImV4cCI6MjEwNTE4ODAxN30.iRLRARxtRfNKmbRiX439gOIxHwh231LvmQekpJ0Pnzs'
const PORT = parseInt(process.env.PORT || '5001', 10)

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

    const { data: configRows } = await supabase.from('wargaku_config').select('*').eq('id', 'main')
    const cfgRow = configRows?.[0] || (await supabase.from('wargaku_config').select('*').limit(1))?.data?.[0]
    if (!cfgRow) return

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

    await supabase.from('wargaku_config').upsert({
      id: 'main',
      data: updatedData,
      updated_at: nowIso
    })

    console.log(`[${nowJkt.timeStr}] ❤️ Scheduler Heartbeat terkirim ke database.`)
  } catch (err) {
    console.error('Gagal mengirim heartbeat:', err.message)
  }
}

/**
 * Menjalankan proses pembuatan tagihan otomatis secara idempoten
 */
export async function executeAutoBillingJob({
  force = false,
  targetYear = null,
  targetMonth = null
} = {}) {
  const nowJkt = getJakartaTime()
  const nowIso = new Date().toISOString()
  console.log(`\n======================================================`)
  console.log(`[${nowJkt.dateStr} ${nowJkt.timeStr}] Memeriksa Jadwal Penerbitan Tagihan Otomatis...`)

  // 1. Ambil config dari baris id 'main'
  const { data: configRows, error: cfgErr } = await supabase.from('wargaku_config').select('*').eq('id', 'main')
  const cfgRow = configRows?.[0] || (await supabase.from('wargaku_config').select('*').limit(1))?.data?.[0]
  if (cfgErr || !cfgRow) {
    console.error('Error membaca wargaku_config:', cfgErr?.message || 'Data kosong')
    return { success: false, error: 'Config database tidak ditemukan' }
  }

  const configData = cfgRow.data || {}
  const autoBilling = configData.autoBilling || {
    enabled: true,
    publishDay: 5,
    publishTime: '08:00',
    dueDay: 20,
    scope: 'ALL'
  }

  if (!autoBilling.enabled && !force) {
    console.log('ℹ️ Otomatisasi tagihan sedang dinonaktifkan dalam konfigurasi.')
    return { success: true, skipped: true, reason: 'Otomatisasi dinonaktifkan' }
  }

  const effectiveTargetYear = targetYear || nowJkt.year
  const effectiveTargetMonth = targetMonth || nowJkt.month

  // 2. Evaluasi tanggal terbit
  const configuredDay = parseInt(autoBilling.publishDay || 5, 10)
  const maxDaysThisMonth = getDaysInMonth(effectiveTargetYear, effectiveTargetMonth)
  const effectivePublishDay = Math.min(configuredDay, maxDaysThisMonth)

  console.log(`- Konfigurasi Tanggal Terbit: Tanggal ${configuredDay}`)
  console.log(`- Tanggal Terbit Efektif: Tanggal ${effectivePublishDay} (Jumlah hari: ${maxDaysThisMonth})`)
  console.log(`- Hari Ini: Tanggal ${nowJkt.day}`)

  // Jika pengecekan otomatis (bukan force/manual) untuk bulan berjalan
  if (!force && effectiveTargetYear === nowJkt.year && effectiveTargetMonth === nowJkt.month) {
    if (nowJkt.day < effectivePublishDay) {
      console.log(`⏳ Belum mencapai tanggal terbit (${effectivePublishDay} ${NAMA_BULAN[nowJkt.month - 1]} ${nowJkt.year}). Menunggu jadwal.`)
      return { success: true, skipped: true, reason: 'Belum waktunya terbit' }
    }

    // Evaluasi jam/waktu terbit jika hari ini tepat tanggal terbit
    if (nowJkt.day === effectivePublishDay && autoBilling.publishTime) {
      const timeParts = String(autoBilling.publishTime).split(':').map((v) => parseInt(v, 10))
      const targetHour = isNaN(timeParts[0]) ? 0 : timeParts[0]
      const targetMinute = isNaN(timeParts[1]) ? 0 : timeParts[1]
      const currentMinutes = (nowJkt.hour || 0) * 60 + (nowJkt.minute || 0)
      const targetMinutes = targetHour * 60 + targetMinute

      if (currentMinutes < targetMinutes) {
        console.log(`⏳ Menunggu waktu posting pukul ${autoBilling.publishTime} WIB (Sekarang: ${String(nowJkt.hour).padStart(2, '0')}:${String(nowJkt.minute).padStart(2, '0')} WIB).`)
        return { success: true, skipped: true, reason: 'Belum mencapai jam terbit' }
      }
    }
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

  const dueDay = Math.min(parseInt(autoBilling.dueDay || 20, 10), maxDaysThisMonth)
  const dueDateStr = `${effectiveTargetYear}-${String(effectiveTargetMonth).padStart(2, '0')}-${String(dueDay).padStart(2, '0')}`
  const periodeLabel = `${NAMA_BULAN[effectiveTargetMonth - 1]} ${effectiveTargetYear}`

  const newInvoices = []
  const newNotifications = []
  let duplicateSkipped = 0

  const scopeSetting = autoBilling.scope || 'ALL'
  const scopesToRun = scopeSetting === 'ALL' ? ['RT', 'RW'] : [scopeSetting]

  for (const w of residents) {
    const rtObj = rts.find((r) => r.id === w.rt_id) || {}
    const rawKode = w.kodeUnik || w.kode_unik || ''
    const match = rawKode.match(/(\d{3})$/)
    const uniqueNumber = match ? parseInt(match[1], 10) : 0

    for (const sc of scopesToRun) {
      // Pengecekan Idempotensi (Mencegah Duplikasi Tagihan)
      const isExists = existingInvoices.some((tag) => {
        return (
          tag.wargaId === w.id &&
          Number(tag.bulan) === effectiveTargetMonth &&
          Number(tag.tahun) === effectiveTargetYear &&
          (tag.payment_scope === sc || (!tag.payment_scope && sc === 'RT')) &&
          !tag.eventId
        )
      })

      const alreadyInBatch = newInvoices.some((tag) => {
        return (
          tag.wargaId === w.id &&
          Number(tag.bulan) === effectiveTargetMonth &&
          Number(tag.tahun) === effectiveTargetYear &&
          tag.payment_scope === sc
        )
      })

      if (isExists || alreadyInBatch) {
        duplicateSkipped++
        continue
      }

      // Hitung nominal berdasarkan pos iuran (hanya pos yang autoPost !== false)
      let activePos = iuranRates.filter((j) => j.autoPost !== false && (j.payment_scope === sc || (!j.payment_scope && sc === 'RT')))
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

      const invId = `tag-${effectiveTargetYear}-${String(effectiveTargetMonth).padStart(2, '0')}-${sc.toLowerCase()}-${w.id}`
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
        bulan: effectiveTargetMonth,
        tahun: effectiveTargetYear,
        total: totalNominal,
        rincian,
        payment_scope: sc,
        target_payment_owner: ownerId,
        pembayaran_kepada: ownerLabel,
        status: 'Belum Bayar',
        tanggalJatuhTempo: dueDateStr,
        tanggalTerbit: `${effectiveTargetYear}-${String(effectiveTargetMonth).padStart(2, '0')}-${String(effectivePublishDay).padStart(2, '0')}`,
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
          message: `Tagihan IPL Anda sebesar Rp ${totalNominal.toLocaleString('id-ID')} telah terbit. Harap melakukan pembayaran sebelum ${dueDay} ${NAMA_BULAN[effectiveTargetMonth - 1]} ${effectiveTargetYear}.`,
          type: 'tagihan',
          targetId: invId,
          read: false,
          created_at: nowIso
        },
        updated_at: nowIso
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
      const failedAutoBilling = {
        ...autoBilling,
        last_run_at: nowIso,
        last_run_status: 'failed',
        last_run_error: insErr.message,
        last_run_message: `Gagal menyimpan tagihan ke database: ${insErr.message}`,
        scheduler_heartbeat: nowIso,
        scheduler_status: 'ERROR'
      }
      await supabase.from('wargaku_config').upsert({
        id: 'main',
        data: { ...configData, autoBilling: failedAutoBilling },
        updated_at: nowIso
      })

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
    last_run_period: `${effectiveTargetYear}-${String(effectiveTargetMonth).padStart(2, '0')}`,
    last_run_status: 'success',
    last_run_created_count: newInvoices.length,
    last_run_skipped_count: duplicateSkipped,
    last_run_message: newInvoices.length > 0
      ? `Berhasil menerbitkan ${newInvoices.length} tagihan IPL periode ${periodeLabel}.`
      : `Seluruh tagihan periode ${periodeLabel} sudah lengkap (${duplicateSkipped} dilewati).`,
    scheduler_heartbeat: nowIso,
    scheduler_status: 'RUNNING'
  }

  await supabase.from('wargaku_config').upsert({
    id: 'main',
    data: {
      ...configData,
      autoBilling: updatedAutoBilling
    },
    updated_at: nowIso
  })

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
// RUNNER & HTTP REST API SERVICE DAEMON
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

  // Buat HTTP Server untuk Endpoint API Health & Manual Trigger
  const server = http.createServer(async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
      res.writeHead(204)
      res.end()
      return
    }

    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)

    // 1. Health check & status
    if (req.method === 'GET' && (url.pathname === '/health' || url.pathname === '/status' || url.pathname === '/')) {
      const nowJkt = getJakartaTime()
      const { data: configRows } = await supabase.from('wargaku_config').select('*').eq('id', 'main')
      const cfgRow = configRows?.[0]
      const autoBilling = cfgRow?.data?.autoBilling || {}

      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({
        service: 'wargaku-backend-scheduler',
        status: 'RUNNING',
        currentTimeJakarta: `${nowJkt.dateStr} ${nowJkt.timeStr}`,
        config: autoBilling,
        uptimeSeconds: Math.floor(process.uptime())
      }, null, 2))
      return
    }

    // 2. Trigger auto-billing manual via API
    if (req.method === 'POST' && (url.pathname === '/api/trigger-billing' || url.pathname === '/trigger')) {
      let bodyStr = ''
      req.on('data', (chunk) => { bodyStr += chunk })
      req.on('end', async () => {
        try {
          const body = bodyStr ? JSON.parse(bodyStr) : {}
          const result = await executeAutoBillingJob({
            force: true,
            targetMonth: body.targetMonth ? parseInt(body.targetMonth, 10) : null,
            targetYear: body.targetYear ? parseInt(body.targetYear, 10) : null
          })

          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify(result))
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ success: false, error: err.message }))
        }
      })
      return
    }

    // Default 404
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Endpoint not found' }))
  })

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Backend Scheduler API Server aktif di http://localhost:${PORT}`)
  })

  // Kirim heartbeat pertama kali saat startup
  sendHeartbeat()

  // Jalankan pengecekan catch-up saat server dinyalakan
  executeAutoBillingJob({ force: false })

  // Heartbeat setiap 5 menit
  setInterval(sendHeartbeat, 5 * 60 * 1000)

  // Pemeriksaan berkala setiap 15 menit
  setInterval(() => {
    executeAutoBillingJob({ force: false })
  }, 15 * 60 * 1000)
}
