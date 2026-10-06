/**
 * Format angka ke format mata uang Rupiah
 * @param {number} value 
 * @returns {string} Contoh: "Rp 120.000"
 */
export function formatRupiah(value) {
  if (value === null || value === undefined || isNaN(value)) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(value)
}

export const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

/**
 * Format string tanggal YYYY-MM-DD ke Bahasa Indonesia
 */
export function formatTanggalIndo(dateStr, withTime = false) {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {})
    })
  } catch {
    return dateStr
  }
}

/**
 * Buat template link pesan WhatsApp untuk pengingat tagihan
 */
export function generateWaReminder(warga, tagihan, infoLingkungan = 'Perumahan Alam Tirta Lestari RT 01 / RW 15') {
  if (!warga?.noHp) return ''
  
  // Format nomor WhatsApp: ganti awalan 08 dengan 628
  let cleanPhone = warga.noHp.replace(/\D/g, '')
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.slice(1)
  }

  const bulanNama = NAMA_BULAN[tagihan.bulan - 1] || `Bulan ${tagihan.bulan}`
  const formattedNominal = formatRupiah(tagihan.total).replace(/\s/g, '')

  const text = `Halo Yth. Bpk/Ibu *${warga.nama}*%0A` +
    `Rumah: ${warga.blok} No. ${warga.noRumah}%0A%0A` +
    `Kami dari Pengurus ${infoLingkungan} menginformasikan tagihan *Iuran Pengelolaan Lingkungan (IPL)* untuk periode *${bulanNama} ${tagihan.tahun}*.%0A%0A` +
    `💰 *Total Tagihan: ${formattedNominal}*%0A` +
    `📌 *Status: BELUM LUNAS*%0A%0A` +
    `Mohon kesediaannya untuk melakukan pembayaran melalui:%0A` +
    `• Tunai kepada Pengurus RT%0A` +
    `• Transfer%0A` +
    `• QRIS%0A%0A` +
    `Apabila Bpk/Ibu sudah melakukan pembayaran, mohon abaikan pesan ini.%0A%0A` +
    `Terima kasih atas perhatian dan kerja samanya dalam menjaga kenyamanan dan keamanan lingkungan kita bersama.`

  return `https://wa.me/${cleanPhone}?text=${text}`
}

/**
 * Buat template link pesan WhatsApp untuk bukti tanda terima / kwitansi
 */
export function generateWaKwitansi(warga, tagihan, infoLingkungan = 'Perumahan Alam Tirta Lestari RT 01 / RW 15') {
  if (!warga?.noHp) return ''
  
  let cleanPhone = warga.noHp.replace(/\D/g, '')
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.slice(1)
  }

  const bulanNama = NAMA_BULAN[tagihan.bulan - 1] || `Bulan ${tagihan.bulan}`
  const text = `*BUKTI PEMBAYARAN IURAN RT/RW (IPL)*%0A` +
    `${infoLingkungan}%0A%0A` +
    `Yth. Bpk/Ibu: *${warga.nama}*%0A` +
    `Alamat: *${warga.blok}/${warga.noRumah}*%0A` +
    `No. Kwitansi: *${tagihan.noKwitansi || '-'}*%0A` +
    `Periode: *${bulanNama} ${tagihan.tahun}*%0A` +
    `Tgl Bayar: *${formatTanggalIndo(tagihan.tanggalBayar)}*%0A` +
    `Metode: *${tagihan.metodeBayar || 'Tunai'}*%0A` +
    `Jumlah: *${formatRupiah(tagihan.total)}*%0A` +
    `Status: *LUNAS (Verified)* ✅%0A%0A` +
    `Terima kasih banyak atas partisipasinya dalam iuran lingkungan! 🙏`

  return `https://wa.me/${cleanPhone}?text=${text}`
}

/**
 * Buat template link pesan WhatsApp untuk Iuran Event / Lomba
 * Menampilkan penanda jelas tingkat RT vs RW
 */
export function generateWaEvent(warga, event, tagihanEvent, infoLingkungan = 'Perumahan Alam Tirta Lestari', rekeningBank = '') {
  if (!warga?.noHp) return ''

  let cleanPhone = warga.noHp.replace(/\D/g, '')
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.slice(1)
  }

  const isLunas = tagihanEvent?.status === 'Lunas'
  const nominalVal = tagihanEvent?.nominal || event?.nominalPerKK || 0
  const formattedNominal = formatRupiah(nominalVal).replace(/\s/g, '')
  const batasTgl = event?.batasTanggal ? formatTanggalIndo(event.batasTanggal) : '-'
  
  // Penyelenggara RT atau RW
  const isRwLevel = event?.scope === 'rw' || !event?.rt_id
  const labelTingkat = isRwLevel ? 'Tingkat RW' : `Tingkat ${event?.rt_id === 'rt-1' ? 'RT 01' : event?.rt_id === 'rt-2' ? 'RT 02' : event?.rt_id === 'rt-3' ? 'RT 03' : 'RT'}`
  const pengurusLabel = isRwLevel ? 'Pengurus / Panitia RW' : `Pengurus / Panitia ${labelTingkat}`

  if (isLunas) {
    const text = `*BUKTI PEMBAYARAN IURAN KEGIATAN [${labelTingkat.toUpperCase()}]*%0A` +
      `${infoLingkungan}%0A%0A` +
      `Yth. Bpk/Ibu: *${warga.nama}*%0A` +
      `Alamat: *Blok ${warga.blok} No. ${warga.noRumah}*%0A` +
      `Kegiatan: *${event?.judul || 'Acara Warga'}* (${labelTingkat})%0A` +
      `Jumlah: *${formattedNominal}*%0A` +
      `Penyelenggara: *${pengurusLabel}*%0A` +
      `Status: *LUNAS (Verified)* ✅ (${tagihanEvent?.metodeBayar || 'Tunai'})%0A%0A` +
      `Terima kasih banyak atas partisipasinya dalam kegiatan lingkungan kita! 🙏🎉`
    return `https://wa.me/${cleanPhone}?text=${text}`
  }

  // Jika belum lunas (Surat Edaran WhatsApp)
  const bankInfo = rekeningBank ? ` (${rekeningBank})` : ''

  let text = `*SURAT EDARAN & TAGIHAN KEGIATAN [${labelTingkat.toUpperCase()}]*%0A` +
    `Halo Yth. Bpk/Ibu *${warga.nama}*%0A` +
    `Rumah: Blok ${warga.blok} No. ${warga.noRumah}%0A%0A` +
    `Kami dari *${pengurusLabel}* menginformasikan partisipasi iuran untuk kegiatan:%0A` +
    `🏆 *${event?.judul || 'Acara Warga'}*%0A` +
    `📍 *Lingkup: ${labelTingkat}*%0A` +
    `💰 *Nominal Iuran: ${formattedNominal}*%0A` +
    `📅 *Batas Pembayaran: ${batasTgl}*%0A` +
    `📌 *Status: BELUM LUNAS*%0A%0A`

  if (event?.deskripsi) {
    text += `ℹ️ *Rincian / Rundown Kegiatan:*%0A${event.deskripsi}%0A%0A`
  }

  text += `Mohon kesediaannya untuk melakukan pembayaran melalui:%0A` +
    `• Tunai kepada ${pengurusLabel}%0A` +
    `• Transfer${bankInfo}%0A` +
    `• QRIS / Portal Mandiri Warga%0A%0A` +
    `Apabila Bpk/Ibu sudah melakukan pembayaran, mohon konfirmasikan bukti transfer. Terima kasih atas dukungan dan partisipasinya!`

  return `https://wa.me/${cleanPhone}?text=${text}`
}

/**
 * Buat template link pesan WhatsApp untuk membagikan akun baru ke warga
 */
export function generateWaAkunWarga(warga, username, password, infoLingkungan = 'Perumahan Alam Tirta Lestari') {
  if (!warga?.noHp) return ''
  let cleanPhone = warga.noHp.replace(/\D/g, '')
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.slice(1)
  }

  const text = `*INFORMASI AKUN PORTAL WARGAKU*%0A` +
    `${infoLingkungan}%0A%0A` +
    `Halo Bpk/Ibu *${warga.nama}* (Blok ${warga.blok}/${warga.noRumah}),%0A` +
    `Akun login portal warga Anda telah aktif. Anda dapat masuk untuk cek tagihan IPL, kirim bukti transfer, pengajuan surat pengantar, dan kontak darurat.%0A%0A` +
    `🔑 *Data Akses Login Anda:*%0A` +
    `• Username : *${username}*%0A` +
    `• Kata Sandi : *${password}*%0A%0A` +
    `Silakan login dan simpan kata sandi ini dengan aman. Terima kasih! 🙏`

  return `https://wa.me/${cleanPhone}?text=${text}`
}

/**
 * Buat template link pesan WhatsApp untuk konfirmasi bukti bayar ke pengurus RT
 */
export function generateWaKonfirmasiBayar(warga, tagihan, bankPengirim, targetPhone, rtName = 'Pengurus RT', infoLingkungan = 'Perumahan Alam Tirta Lestari') {
  if (!targetPhone) return ''
  let cleanPhone = targetPhone.replace(/\D/g, '')
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.slice(1)
  }
  const bulanNama = NAMA_BULAN[tagihan.bulan - 1] || `Bulan ${tagihan.bulan}`
  const formattedNominal = formatRupiah(tagihan.total).replace(/\s/g, '')

  const text = `*KONFIRMASI PEMBAYARAN IURAN (IPL)*%0A` +
    `${infoLingkungan}%0A%0A` +
    `Halo ${rtName}, saya telah melakukan pembayaran iuran melalui portal WargaKu:%0A%0A` +
    `👤 *Nama Warga:* ${warga.nama}%0A` +
    `🏠 *Rumah:* Blok ${warga.blok} No. ${warga.noRumah}%0A` +
    `📅 *Periode:* ${bulanNama} ${tagihan.tahun}%0A` +
    `💰 *Nominal:* ${formattedNominal}%0A` +
    `🏦 *Metode / Bank:* ${bankPengirim || 'Transfer'}%0A%0A` +
    `Bukti struk sudah saya unggah di sistem WargaKu. Mohon bantuan untuk dicek dan diverifikasi. Terima kasih! 🙏`

  return `https://wa.me/${cleanPhone}?text=${text}`
}

