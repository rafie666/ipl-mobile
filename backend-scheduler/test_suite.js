/**
 * test_suite.js
 * Test suite otomatis untuk memverifikasi 9 skenario wajib otomatisasi tagihan IPL:
 * 1. Jadwal tanggal 5 menghasilkan tagihan otomatis sesuai jadwal.
 * 2. Pengaturan tanggal dapat diubah dinamis tanpa edit kode.
 * 3. Server mati saat tanggal terbit dan mengejar proses setelah aktif kembali (Catch-up).
 * 4. Scheduler berjalan berkali-kali tetapi tidak membuat tagihan ganda (Idempotensi).
 * 5. Bulan Februari dan bulan dengan 30 atau 31 hari ditangani dengan benar.
 * 6. Tagihan yang sudah dibayar tidak berubah (Immutability).
 * 7. Iuran kegiatan tidak tercampur dengan IPL reguler.
 * 8. Notifikasi tidak terkirim berulang untuk tagihan yang sama.
 * 9. Otomatisasi nonaktif benar-benar menghentikan penerbitan berikutnya.
 */

import {
  getEffectivePublishDay,
  getEffectiveDueDay,
  getDaysInMonth,
  calculateNextRunDate,
  buildDeterministicInvoiceId,
  shouldExecuteAutoBilling,
  buildAutoBillingInvoices
} from '../ipl-mobile/src/utils/billingScheduler.js'

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`)
  } else {
    console.error(`  ❌ FAIL: ${testName}`)
    throw new Error(`Test failed: ${testName}`)
  }
}

console.log('🧪 Memulai Test Suite Otomatisasi Tagihan IPL...\n')

// =========================================================================
// UJI 1: Jadwal tanggal 5 menghasilkan tagihan otomatis sesuai jadwal
// =========================================================================
console.log('Test 1: Evaluasi Jadwal Tanggal 5')
const evalOnDay5 = shouldExecuteAutoBilling({
  autoBillingConfig: { enabled: true, publishDay: 5, dueDay: 20 },
  existingInvoices: [],
  currentTime: new Date('2026-10-05T08:00:00+07:00')
})
assert(evalOnDay5.shouldRun === true, 'Pada tanggal 5 jam 08:00 WIB, jadwal harus berjalan (shouldRun = true)')
assert(evalOnDay5.effectivePublishDay === 5, 'Tanggal terbit efektif harus 5')

const evalBeforeDay5 = shouldExecuteAutoBilling({
  autoBillingConfig: { enabled: true, publishDay: 5, dueDay: 20 },
  existingInvoices: [],
  currentTime: new Date('2026-10-04T23:59:00+07:00')
})
assert(evalBeforeDay5.shouldRun === false, 'Sebelum tanggal 5 (tanggal 4), jadwal tidak boleh berjalan (shouldRun = false)')

// =========================================================================
// UJI 2: Pengaturan tanggal dapat diubah tanpa mengedit kode
// =========================================================================
console.log('\nTest 2: Pengaturan Tanggal Dinamis (Tanpa Edit Kode)')
const configA = { enabled: true, publishDay: 1, dueDay: 15 }
const configB = { enabled: true, publishDay: 10, dueDay: 25 }

const nextRunA = calculateNextRunDate(configA.publishDay, new Date('2026-10-15T00:00:00+07:00'))
const nextRunB = calculateNextRunDate(configB.publishDay, new Date('2026-10-15T00:00:00+07:00'))

assert(nextRunA.day === 1, 'Pengaturan tanggal 1 menghasilkan jadwal tanggal 1')
assert(nextRunB.day === 10, 'Pengaturan tanggal 10 menghasilkan jadwal tanggal 10')
assert(nextRunA.day !== nextRunB.day, 'Perubahan tanggal terbit langsung mengubah jadwal berikutnya secara dinamis')

// =========================================================================
// UJI 3: Server mati saat tanggal terbit dan mengejar proses setelah aktif (Catch-up)
// =========================================================================
console.log('\nTest 3: Server Mati Saat Tanggal Terbit & Catch-Up')
// Skenario: Tagihan diset tanggal 5, server baru nyala tanggal 12 (terlewat 7 hari)
const catchUpEval = shouldExecuteAutoBilling({
  autoBillingConfig: { enabled: true, publishDay: 5, dueDay: 20 },
  existingInvoices: [], // Belum ada tagihan bulan 10
  currentTime: new Date('2026-10-12T10:00:00+07:00')
})
assert(catchUpEval.shouldRun === true, 'Server yang baru nyala tanggal 12 harus mengejar (catch-up) tagihan periode bulan 10 yang terlewat')
assert(catchUpEval.targetMonth === 10, 'Target bulan catch-up harus bulan 10')

// =========================================================================
// UJI 4: Scheduler berjalan berkali-kali tetapi tidak membuat tagihan ganda (Idempotensi)
// =========================================================================
console.log('\nTest 4: Pencegahan Tagihan Ganda (Idempotensi)')
const mockWarga = [
  { id: 'w-1', nama: 'Bambang Sutrisno', kodeUnik: 'WR101', aktif: true, rt_id: 'rt-01-01' },
  { id: 'w-2', nama: 'Ahmad Fauzi', kodeUnik: 'WR102', aktif: true, rt_id: 'rt-01-01' }
]
const mockIuran = [
  { id: 'ji-1', nama: 'Iuran Sampah RT', nominal: 35000, aktif: true, payment_scope: 'RT' },
  { id: 'ji-2', nama: 'Iuran Fasum RW', nominal: 25000, aktif: true, payment_scope: 'RW' }
]

// Putaran pertama
const batch1 = buildAutoBillingInvoices({
  targetYear: 2026,
  targetMonth: 10,
  dueDay: 20,
  scope: 'ALL',
  residents: mockWarga,
  iuranRates: mockIuran,
  existingInvoices: []
})
assert(batch1.totalCreated === 4, 'Batch 1 harus membuat 4 tagihan (2 warga x 2 scope: RT + RW)')

// Putaran kedua dengan tagihan dari batch 1 sudah ada di database
const batch2 = buildAutoBillingInvoices({
  targetYear: 2026,
  targetMonth: 10,
  dueDay: 20,
  scope: 'ALL',
  residents: mockWarga,
  iuranRates: mockIuran,
  existingInvoices: batch1.createdInvoices
})
assert(batch2.totalCreated === 0, 'Batch 2 yang dijalankan ulang harus menghasilkan 0 tagihan baru (Semua dilewati)')

// =========================================================================
// UJI 5: Bulan Februari dan bulan dengan 30 atau 31 hari ditangani dengan benar
// =========================================================================
console.log('\nTest 5: Penanganan Bulan 30 Hari & Februari')
// Bulan April (30 hari), publishDay diatur 31
const aprilPublishDay = getEffectivePublishDay(2026, 4, 31)
assert(aprilPublishDay === 30, 'Jika publishDay = 31 pada bulan April (30 hari), harus terbit tanggal 30')

// Bulan Februari 2026 (Bukan kabisat -> 28 hari)
const feb2026PublishDay = getEffectivePublishDay(2026, 2, 31)
assert(feb2026PublishDay === 28, 'Jika publishDay = 31 pada Februari 2026 (non-kabisat), harus terbit tanggal 28')

// Bulan Februari 2028 (Tahun kabisat -> 29 hari)
const feb2028PublishDay = getEffectivePublishDay(2028, 2, 31)
assert(feb2028PublishDay === 29, 'Jika publishDay = 31 pada Februari 2028 (kabisat), harus terbit tanggal 29')

// =========================================================================
// UJI 6: Tagihan yang sudah dibayar tidak berubah (Immutability)
// =========================================================================
console.log('\nTest 6: Tagihan yang Sudah Dibayar Tidak Berubah')
const paidInvoice = {
  id: 'tag-2026-10-rt-w-1',
  wargaId: 'w-1',
  bulan: 10,
  tahun: 2026,
  payment_scope: 'RT',
  total: 120101,
  status: 'Lunas',
  tanggalBayar: '2026-10-06',
  noKwitansi: 'KW-12345'
}

const batchWithPaid = buildAutoBillingInvoices({
  targetYear: 2026,
  targetMonth: 10,
  dueDay: 20,
  scope: 'RT',
  residents: [{ id: 'w-1', nama: 'Bambang Sutrisno', kodeUnik: 'WR101', aktif: true }],
  iuranRates: [{ id: 'ji-1', nama: 'Iuran RT', nominal: 150000, aktif: true, payment_scope: 'RT' }], // Tarif naik
  existingInvoices: [paidInvoice]
})

assert(batchWithPaid.totalCreated === 0, 'Tagihan yang sudah berstatus Lunas tidak boleh dibuat ulang')
assert(paidInvoice.status === 'Lunas', 'Status Lunas tetap terjaga')
assert(paidInvoice.total === 120101, 'Nominal tagihan lama yang sudah dibayar tidak boleh berubah meskipun tarif naik')

// =========================================================================
// UJI 7: Iuran kegiatan tidak tercampur dengan IPL reguler
// =========================================================================
console.log('\nTest 7: Pemisahan Iuran Kegiatan dan IPL Reguler')
const eventInvoice = {
  id: 'tag-event-17an-w-1',
  eventId: 'evt-17an',
  wargaId: 'w-1',
  bulan: 10,
  tahun: 2026,
  namaTagihan: 'Iuran Lomba 17 Agustus',
  total: 50000,
  status: 'Belum Bayar'
}

// Meskipun ada tagihan event di bulan 10, tagihan IPL reguler tetap harus diterbitkan
const batchWithEvent = buildAutoBillingInvoices({
  targetYear: 2026,
  targetMonth: 10,
  dueDay: 20,
  scope: 'RT',
  residents: [{ id: 'w-1', nama: 'Bambang Sutrisno', kodeUnik: 'WR101', aktif: true }],
  iuranRates: [{ id: 'ji-1', nama: 'Iuran RT', nominal: 120000, aktif: true, payment_scope: 'RT' }],
  existingInvoices: [eventInvoice]
})
assert(batchWithEvent.totalCreated === 1, 'Tagihan IPL reguler harus tetap terbit terpisah dari tagihan kegiatan')
assert(batchWithEvent.createdInvoices[0].id === 'tag-2026-10-rt-w-1', 'ID tagihan reguler memiliki format terpisah')

// =========================================================================
// UJI 8: Notifikasi tidak terkirim berulang untuk tagihan yang sama
// =========================================================================
console.log('\nTest 8: Notifikasi Tidak Terkirim Berulang')
assert(batch1.createdNotifications.length === 4, 'Batch 1 menghasilkan tepat 1 notifikasi per tagihan baru')
assert(batch2.createdNotifications.length === 0, 'Batch 2 yang dilewati tidak menghasilkan notifikasi sama sekali')

// =========================================================================
// UJI 9: Otomatisasi nonaktif benar-benar menghentikan penerbitan
// =========================================================================
console.log('\nTest 9: Otomatisasi Nonaktif Menghentikan Penerbitan')
const disabledEval = shouldExecuteAutoBilling({
  autoBillingConfig: { enabled: false, publishDay: 5, dueDay: 20 },
  existingInvoices: [],
  currentTime: new Date('2026-10-05T08:00:00+07:00')
})
assert(disabledEval.shouldRun === false, 'Jika enabled = false, proses tidak boleh berjalan sama sekali')

console.log('\n🎉 SELURUH 9 SKENARIO UJI BERHASIL (100% PASS)!')
