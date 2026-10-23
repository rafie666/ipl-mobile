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

    const rawText = await req.text()
    if (!rawText || rawText.trim() === "") {
      return new Response(JSON.stringify({ status: "ok", message: "Empty body received" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      })
    }

    // Verifikasi tanda tangan / signature Moota jika MOOTA_WEBHOOK_SECRET dikonfigurasi
    const signature = req.headers.get("Signature") || req.headers.get("signature") || req.headers.get("X-Moota-Signature")
    const secret = Deno.env.get("MOOTA_WEBHOOK_SECRET")

    if (secret && signature) {
      const encoder = new TextEncoder()
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      )
      const sigBuf = await crypto.subtle.sign("HMAC", key, encoder.encode(rawText))
      const calculatedSig = Array.from(new Uint8Array(sigBuf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
      if (calculatedSig !== signature.trim().toLowerCase()) {
        console.warn("Moota signature mismatch! Received:", signature, "Calculated:", calculatedSig)
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        })
      }
    }

    let rawBody: any
    try {
      rawBody = JSON.parse(rawText)
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }
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
      const rawMutationId = String(m.mutation_id || m.id || `gen-${Date.now()}-${Math.floor(Math.random() * 10000)}`)
      const mutationDbKey = `mut-${rawMutationId}`
      
      // Idempotency check: jika mutasi sudah pernah diproses Lunas sebelumnya, abaikan webhook duplikat
      if (m.mutation_id || m.id) {
        try {
          const { data: existingMut } = await supabase
            .from("wargaku_moota_mutations")
            .select("id, data")
            .eq("id", mutationDbKey)
            .maybeSingle()

          if (existingMut && (existingMut.data || existingMut)?.status === "matched") {
            console.log(`Mutation ${rawMutationId} already processed, skipping duplicate hit.`)
            processedResults.push({
              mutationId: rawMutationId,
              status: "already_processed",
              note: "Duplicate webhook hit ignored"
            })
            continue
          }
        } catch (checkErr) {
          console.warn("Idempotency check warning:", checkErr)
        }
      }

      if (!isCredit || mutationAmount <= 0) {
        // Log transaksi non-credit atau debet (uang keluar / biaya admin bank)
        try {
          await supabase.from("wargaku_moota_mutations").upsert({
            id: mutationDbKey,
            data: {
              mutation_id: m.mutation_id || m.id || rawMutationId,
              bank_id: m.bank_id || null,
              account_number: m.account_number || null,
              amount: mutationAmount,
              type: m.type || "DB",
              description: m.description || "",
              status: "ignored_not_cr",
              raw_payload: m,
              created_at: new Date().toISOString()
            },
            updated_at: new Date().toISOString()
          })
        } catch (logErr) {
          console.warn("Log non-credit error:", logErr)
        }
        continue
      }

      let isMatched = false

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
          isMatched = true
          const today = new Date().toISOString().slice(0, 10)
          const randomSeq = Math.floor(100000 + Math.random() * 900000)
          const noKwitansi = `MOOTA-${today.replace(/-/g, "")}-${randomSeq}`
          const verifiedTimestamp = new Date().toISOString()

          // 1. Simpan/Update Log Mutasi ke tabel staging terpisah: wargaku_moota_mutations
          try {
            await supabase.from("wargaku_moota_mutations").upsert({
              id: mutationDbKey,
              data: {
                mutation_id: m.mutation_id || m.id || rawMutationId,
                bank_id: m.bank_id || null,
                account_number: m.account_number || null,
                amount: mutationAmount,
                type: "CR",
                description: m.description || "",
                status: "matched",
                matched_tagihan_id: t.id,
                resident_id: t.wargaId,
                resident_nama: targetWarga.nama || "Warga",
                no_kwitansi: noKwitansi,
                raw_payload: m,
                created_at: verifiedTimestamp
              },
              updated_at: verifiedTimestamp
            })
          } catch (mutLogErr) {
            console.warn("Log matched mutation warning:", mutLogErr)
          }

          // 2. Update Tagihan jadi Lunas
          const updatedTagihan = {
            ...t,
            status: "Lunas",
            verifikator: "Moota Auto-Verify (Sandbox)",
            verified_by: "Moota Auto-Verify (Sandbox)",
            tglVerifikasi: verifiedTimestamp,
            verified_at: verifiedTimestamp,
            tanggalBayar: verifiedTimestamp,
            tglBayar: verifiedTimestamp,
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

          // 3. Tambahkan ke Kas otomatis
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

          // 4. Tambah Notifikasi Warga
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

      // Jika mutasi kredit masuk tapi TIDAK ADA tagihan yang cocok (misal kode unik salah / uang nyasar)
      if (!isMatched) {
        try {
          await supabase.from("wargaku_moota_mutations").upsert({
            id: mutationDbKey,
            data: {
              mutation_id: m.mutation_id || m.id || rawMutationId,
              bank_id: m.bank_id || null,
              account_number: m.account_number || null,
              amount: mutationAmount,
              type: "CR",
              description: m.description || "",
              status: "unmatched",
              note: "Tidak ditemukan tagihan belum lunas dengan nominal yang cocok",
              raw_payload: m,
              created_at: new Date().toISOString()
            },
            updated_at: new Date().toISOString()
          })
          console.log(`Unmatched mutation recorded to wargaku_moota_mutations: ${rawMutationId} (Rp ${mutationAmount})`)
        } catch (unmatchErr) {
          console.warn("Log unmatched mutation warning:", unmatchErr)
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
