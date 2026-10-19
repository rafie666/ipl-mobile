// Supabase Edge Function: auto-billing
// Path: supabase/functions/auto-billing/index.ts
// Endpoint: https://<your-project-id>.supabase.co/functions/v1/auto-billing
// Description: Eksekusi otomatis penerbitan tagihan bulanan IPL dengan zona waktu Asia/Jakarta dan proteksi idempotensi mutlak.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const NAMA_BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
]

function getJakartaDate(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false
  })
  const parts = formatter.formatToParts(date)
  const map: Record<string, string> = {}
  parts.forEach(p => { map[p.type] = p.value })

  return {
    year: parseInt(map.year, 10),
    month: parseInt(map.month, 10),
    day: parseInt(map.day, 10),
    hour: parseInt(map.hour, 10),
    minute: parseInt(map.minute, 10),
    second: parseInt(map.second, 10)
  }
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "https://dcefifwlfwycgmphpgtu.supabase.co"
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Parse query params or body for manual test override (misal: force=true)
    let forceRun = false
    try {
      if (req.method === "POST") {
        const body = await req.json()
        if (body?.force === true) forceRun = true
      }
    } catch (_) {}

    const now = getJakartaDate()
    const nowIso = new Date().toISOString()

    // 1. Ambil Config Lingkungan dari database
    const { data: configRows, error: cfgErr } = await supabase.from("wargaku_config").select("*")
    if (cfgErr) {
      throw new Error(`Gagal membaca config: ${cfgErr.message}`)
    }

    const mainConfigRow = configRows?.[0] || { id: "config-main", data: {} }
    const configData = mainConfigRow.data || {}
    const autoBilling = configData.autoBilling || {
      enabled: true,
      publishDay: 5,
      dueDay: 20,
      scope: "ALL"
    }

    // Periksa status otomatisasi
    if (!autoBilling.enabled && !forceRun) {
      return new Response(JSON.stringify({
        success: true,
        skipped: true,
        message: "Otomatisasi tagihan sedang dinonaktifkan dalam pengaturan."
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }

    // 2. Evaluasi aturan tanggal (termasuk aturan akhir bulan untuk Februari / bulan 30 hari)
    const configuredDay = parseInt(autoBilling.publishDay || 5, 10)
    const maxDaysThisMonth = getDaysInMonth(now.year, now.month)
    const effectivePublishDay = Math.min(configuredDay, maxDaysThisMonth)

    // Jika hari ini belum mencapai tanggal terbit bulan ini dan bukan force run, tunda
    if (now.day < effectivePublishDay && !forceRun) {
      return new Response(JSON.stringify({
        success: true,
        skipped: true,
        message: `Belum mencapai tanggal terbit (${effectivePublishDay} ${NAMA_BULAN[now.month - 1]} ${now.year}). Hari ini tanggal ${now.day}.`
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }

    // 3. Ambil data Warga, Tagihan yang sudah ada, Jenis Iuran, dan RTs
    const { data: wargaRows } = await supabase.from("wargaku_warga").select("*")
    const { data: tagihanRows } = await supabase.from("wargaku_tagihan").select("*")
    const { data: iuranRows } = await supabase.from("wargaku_jenis_iuran").select("*")
    const { data: rtsRows } = await supabase.from("wargaku_rts").select("*")

    const residents = (wargaRows || []).map((r: any) => r.data || r).filter((w: any) => w.aktif !== false)
    const existingInvoices = (tagihanRows || []).map((t: any) => t.data || t)
    const iuranRates = (iuranRows || []).map((i: any) => i.data || i).filter((i: any) => i.aktif !== false)
    const rts = (rtsRows || []).map((rt: any) => rt.data || rt)

    const targetYear = now.year
    const targetMonth = now.month
    const dueDay = Math.min(parseInt(autoBilling.dueDay || 20, 10), maxDaysThisMonth)
    const dueDateStr = `${targetYear}-${String(targetMonth).padStart(2, "0")}-${String(dueDay).padStart(2, "0")}`
    const periodeLabel = `${NAMA_BULAN[targetMonth - 1]} ${targetYear}`

    const newInvoices: any[] = []
    const newNotifications: any[] = []
    let duplicateSkipped = 0

    const scopeSetting = autoBilling.scope || "ALL"
    const scopesToRun = scopeSetting === "ALL" ? ["RT", "RW"] : [scopeSetting]

    for (const w of residents) {
      const rtObj = rts.find((r: any) => r.id === w.rt_id) || {}
      const rawKode = w.kodeUnik || ""
      const match = rawKode.match(/(\d{3})$/)
      const uniqueNumber = match ? parseInt(match[1], 10) : 0

      for (const sc of scopesToRun) {
        // Cek duplikasi (IDEMPOTEN)
        const isExists = existingInvoices.some((tag: any) => {
          return (
            tag.wargaId === w.id &&
            Number(tag.bulan) === targetMonth &&
            Number(tag.tahun) === targetYear &&
            (tag.payment_scope === sc || (!tag.payment_scope && sc === "RT")) &&
            !tag.eventId
          )
        })

        const alreadyInBatch = newInvoices.some((tag: any) => {
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

        // Tentukan tarif pos iuran untuk scope ini
        let activePos = iuranRates.filter((j: any) => j.payment_scope === sc || (!j.payment_scope && sc === "RT"))
        if (activePos.length === 0) {
          if (sc === "RT") activePos = [{ nama: "Iuran Pengelolaan Lingkungan (RT)", nominal: 120000 }]
          if (sc === "RW") activePos = [{ nama: "Iuran Pembangunan & Fasum RW", nominal: 40000 }]
        }

        const totalPokok = activePos.reduce((sum: number, item: any) => sum + (Number(item.nominal) || 0), 0)
        const totalNominal = totalPokok + uniqueNumber

        const rincian = [
          ...activePos.map((pos: any) => ({ nama: pos.nama, nominal: Number(pos.nominal) || 0 })),
          { nama: `Kode Unik Warga (${rawKode || `WR${String(uniqueNumber).padStart(3, "0")}`})`, nominal: uniqueNumber }
        ]

        const invId = `tag-${targetYear}-${String(targetMonth).padStart(2, "0")}-${sc.toLowerCase()}-${w.id}`
        const ownerId = sc === "RW" ? (w.rw_id || rtObj?.rw_id || "rw-01") : w.rt_id
        const ownerLabel = sc === "RW" ? "Kas RW 01" : (rtObj?.name || "Kas Lingkungan RT 01")

        const invoiceObj = {
          id: invId,
          wargaId: w.id,
          rt_id: w.rt_id,
          namaWarga: w.nama,
          blok: w.blok,
          noRumah: w.noRumah,
          kodeUnik: rawKode || `WR${String(uniqueNumber).padStart(3, "0")}`,
          bulan: targetMonth,
          tahun: targetYear,
          total: totalNominal,
          rincian,
          payment_scope: sc,
          target_payment_owner: ownerId,
          pembayaran_kepada: ownerLabel,
          status: "Belum Bayar",
          tanggalJatuhTempo: dueDateStr,
          tanggalTerbit: `${targetYear}-${String(targetMonth).padStart(2, "0")}-${String(effectivePublishDay).padStart(2, "0")}`,
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
            message: `Tagihan IPL Anda sebesar Rp ${totalNominal.toLocaleString("id-ID")} telah terbit. Harap melakukan pembayaran sebelum ${dueDay} ${NAMA_BULAN[targetMonth - 1]} ${targetYear}.`,
            type: "tagihan",
            targetId: invId,
            read: false,
            created_at: nowIso
          }
        })
      }
    }

    // 4. Batch Insert ke tabel wargaku_tagihan & wargaku_notifications
    if (newInvoices.length > 0) {
      const dbPayload = newInvoices.map((inv) => ({
        id: inv.id,
        data: inv,
        updated_at: nowIso
      }))

      const { error: insErr } = await supabase.from("wargaku_tagihan").upsert(dbPayload, { onConflict: "id" })
      if (insErr) {
        throw new Error(`Gagal menyimpan tagihan ke database: ${insErr.message}`)
      }

      if (newNotifications.length > 0) {
        await supabase.from("wargaku_notifications").upsert(newNotifications, { onConflict: "id" })
      }
    }

    // 5. Update Status Eksekusi pada wargaku_config
    const updatedAutoBilling = {
      ...autoBilling,
      last_run_at: nowIso,
      last_run_period: `${targetYear}-${String(targetMonth).padStart(2, "0")}`,
      last_run_status: "success",
      last_run_created_count: newInvoices.length,
      last_run_skipped_count: duplicateSkipped,
      last_run_message: newInvoices.length > 0
        ? `Berhasil menerbitkan ${newInvoices.length} tagihan IPL periode ${periodeLabel}.`
        : `Semua warga sudah memiliki tagihan untuk periode ${periodeLabel} (${duplicateSkipped} dilewati).`,
      scheduler_heartbeat: nowIso
    }

    const updatedConfigData = {
      ...configData,
      autoBilling: updatedAutoBilling
    }

    await supabase.from("wargaku_config").upsert({
      id: mainConfigRow.id || "config-main",
      data: updatedConfigData,
      updated_at: nowIso
    })

    return new Response(JSON.stringify({
      success: true,
      period: periodeLabel,
      totalCreated: newInvoices.length,
      totalSkipped: duplicateSkipped,
      effectivePublishDay,
      dueDate: dueDateStr,
      message: updatedAutoBilling.last_run_message
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  } catch (error: any) {
    console.error("Auto-Billing Error:", error)
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "https://dcefifwlfwycgmphpgtu.supabase.co"
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? ""
      const supabase = createClient(supabaseUrl, supabaseKey)
      const nowIso = new Date().toISOString()
      const { data: configRows } = await supabase.from("wargaku_config").select("*").limit(1)
      if (configRows && configRows.length > 0) {
        const row = configRows[0]
        const currentData = row.data || {}
        await supabase.from("wargaku_config").update({
          data: {
            ...currentData,
            autoBilling: {
              ...(currentData.autoBilling || {}),
              last_run_at: nowIso,
              last_run_status: "failed",
              last_run_error: error?.message || "Unknown error",
              last_run_message: `Gagal: ${error?.message || "Kesalahan server"}`
            }
          },
          updated_at: nowIso
        }).eq("id", row.id)
      }
    } catch (_) {}

    return new Response(JSON.stringify({
      success: false,
      error: error?.message || "Terjadi kesalahan internal server"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }
})
