// Supabase Edge Function: moota-webhook
// File: supabase/functions/moota-webhook/index.ts
// URL Endpoint: https://<your-project-id>.supabase.co/functions/v1/moota-webhook

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "https://dcefifwlfwycgmphpgtu.supabase.co"
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const rawBody = await req.json()
    console.log("Moota Webhook Received:", JSON.stringify(rawBody))

    // Moota sends an array of mutations or an object with data array
    const mutations = Array.isArray(rawBody)
      ? rawBody
      : Array.isArray(rawBody?.data)
      ? rawBody.data
      : [rawBody]

    // Fetch all current tagihan and warga
    const { data: tagihanRows } = await supabase.from("wargaku_tagihan").select("*")
    const { data: wargaRows } = await supabase.from("wargaku_warga").select("*")
    const { data: kasRows } = await supabase.from("wargaku_kas").select("*")

    const wargaMap = new Map()
    ;(wargaRows || []).forEach((row: any) => {
      const item = row.data || row
      wargaMap.set(item.id, item)
    })

    const processedResults = []

    for (const m of mutations) {
      const isCredit = String(m.type || "").toUpperCase() === "CR" || Number(m.amount) > 0
      const mutationAmount = Math.round(Number(m.amount || m.nominal || 0))
      
      if (!isCredit || mutationAmount <= 0) continue

      // Cari tagihan yang belum lunas yang totalnya cocok persis dengan nominal mutasi
      for (const row of tagihanRows || []) {
        const t = row.data || row
        if (t.status === "Lunas") continue

        const targetWarga = wargaMap.get(t.wargaId) || {}
        
        // Cek apakah nominal mutasi persis cocok dengan tagihan + kode unik warga
        // Hitung kode unik 3 digit
        const rawCode = targetWarga.kodeUnik ? String(targetWarga.kodeUnik).replace(/\D/g, "") : ""
        const rawId = targetWarga.id || ""
        const numId = parseInt(rawId.replace(/\D/g, "") || "1", 10)
        const codeNum = rawCode ? parseInt(rawCode.slice(-3), 10) : (100 + ((numId * 7) % 900))
        
        const baseNum = Number(t.total || 0)
        const roundBase = Math.floor(baseNum / 1000) * 1000
        const expectedTotalWithCode = roundBase + codeNum

        if (mutationAmount === expectedTotalWithCode || mutationAmount === baseNum) {
          const today = new Date().toISOString().slice(0, 10)
          const randomSeq = Math.floor(100000 + Math.random() * 900000)
          const noKwitansi = `MOOTA-${today.replace(/-/g, "")}-${randomSeq}`
          const verifiedTimestamp = new Date().toISOString()

          // Update Tagihan jadi Lunas
          const updatedTagihan = {
            ...t,
            status: "Lunas",
            verifikator: "Moota Auto-Verify (Sandbox)",
            verified_by: "Moota Auto-Verify (Sandbox)",
            tglVerifikasi: verifiedTimestamp,
            verified_at: verifiedTimestamp,
            tanggalBayar: today,
            tglBayar: today,
            metodeBayar: "Transfer Bank (Moota Auto)",
            metode: "Transfer Bank (Moota Auto)",
            noKwitansi: noKwitansi,
            moota_mutation_id: m.mutation_id || m.id || null,
            moota_bank_id: m.bank_id || null,
            keteranganBayar: m.description || "Transfer terverifikasi otomatis oleh Moota"
          }

          await supabase.from("wargaku_tagihan").upsert({
            id: t.id,
            data: updatedTagihan,
            updated_at: new Date().toISOString()
          })

          // Tambahkan ke Kas otomatis
          const isRw = t.payment_scope === "RW"
          const newKasEntry = {
            id: `kas-moota-${Date.now()}-${randomSeq}`,
            tanggal: today,
            tipe: "Masuk",
            kategori: isRw ? "Iuran RW" : "Iuran RT",
            deskripsi: `${t.pembayaran_kepada || "IPL"} - ${targetWarga.nama || "Warga"} (${targetWarga.blok || "-"}/${targetWarga.noRumah || "-"}) bln ${t.bulan}/${t.tahun}`,
            keterangan: `Kwitansi: ${noKwitansi} (Moota Mutasi Otomatis)`,
            nominal: t.total,
            tagihanId: t.id,
            scope: isRw ? "rw" : "rt",
            rt_id: isRw ? null : (targetWarga.rt_id || "rt-1"),
            pj: "Sistem Otomatis Moota"
          }

          await supabase.from("wargaku_kas").upsert({
            id: newKasEntry.id,
            data: newKasEntry,
            updated_at: new Date().toISOString()
          })

          // Tambah Notifikasi
          const notifEntry = {
            id: `notif-${Date.now()}-${randomSeq}`,
            userId: `u-${t.wargaId}`,
            residentId: t.wargaId,
            title: "Pembayaran Terverifikasi Otomatis (Moota) ⚡",
            message: `Pembayaran ${t.pembayaran_kepada || "IPL"} Rp ${mutationAmount.toLocaleString("id-ID")} berhasil diverifikasi secara otomatis oleh sistem Moota. Kwitansi: ${noKwitansi}`,
            type: "payment_approved",
            tagihanId: t.id,
            isRead: false,
            created_at: new Date().toISOString()
          }

          await supabase.from("wargaku_notifications").upsert({
            id: notifEntry.id,
            data: notifEntry,
            updated_at: new Date().toISOString()
          })

          processedResults.push({
            tagihanId: t.id,
            wargaName: targetWarga.nama,
            amount: mutationAmount,
            noKwitansi: noKwitansi
          })

          break // sudah matched
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${processedResults.length} payments successfully`,
        results: processedResults
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    )
  } catch (error) {
    console.error("Webhook processing error:", error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    )
  }
})
