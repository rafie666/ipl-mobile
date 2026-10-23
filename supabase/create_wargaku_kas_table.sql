-- =========================================================================
-- SETUP TABEL KAS DAN RESET SALDO TRANSAKSI RT/RW RELEVAN
-- Wargaku IPL 2.0
-- =========================================================================

-- 1. Buat Tabel Kas RT & RW jika belum ada
CREATE TABLE IF NOT EXISTS public.wargaku_kas (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Aktifkan Row Level Security (RLS)
ALTER TABLE public.wargaku_kas ENABLE ROW LEVEL SECURITY;

-- 3. Kebijakan Akses Transparansi Publik (Read & Write untuk Client)
DROP POLICY IF EXISTS "Public read wargaku_kas" ON public.wargaku_kas;
CREATE POLICY "Public read wargaku_kas" ON public.wargaku_kas FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public write wargaku_kas" ON public.wargaku_kas;
CREATE POLICY "Public write wargaku_kas" ON public.wargaku_kas FOR ALL USING (true);

-- 4. Reset & Kosongkan Data Kas Lama
TRUNCATE TABLE public.wargaku_kas;

-- 5. Insert Data Saldo Kas Relevan Per RT dan RW
INSERT INTO public.wargaku_kas (id, data, updated_at) VALUES
-- RW 01
('kas-rw-01-1', '{"id":"kas-rw-01-1","tanggal":"2026-09-01","tipe":"Masuk","kategori":"Saldo Awal","deskripsi":"Saldo kas awal RW 01 periode September 2026","nominal":14500000,"scope":"rw","rt_id":null,"rw_id":"rw-01","pj":"Bendahara RW 01 (Bpk. Mulyadi)"}'::jsonb, NOW()),
('kas-rw-01-2', '{"id":"kas-rw-01-2","tanggal":"2026-09-08","tipe":"Masuk","kategori":"Sewa Fasum","deskripsi":"Bagi hasil sewa lapangan serbaguna & pemanfaatan fasum RW 01","nominal":2250000,"scope":"rw","rt_id":null,"rw_id":"rw-01","pj":"Seksi Usaha & Fasum RW 01"}'::jsonb, NOW()),
('kas-out-rw-01-1', '{"id":"kas-out-rw-01-1","tanggal":"2026-09-10","tipe":"Keluar","kategori":"Keamanan Lingkungan","deskripsi":"Honor & konsumsi 4 personil petugas keamanan pos gerbang utama RW 01","nominal":2500000,"scope":"rw","rt_id":null,"rw_id":"rw-01","pj":"Koordinator Keamanan RW 01 (Bpk. Bambang)"}'::jsonb, NOW()),
('kas-out-rw-01-2', '{"id":"kas-out-rw-01-2","tanggal":"2026-09-18","tipe":"Keluar","kategori":"Perbaikan Fasum","deskripsi":"Perbaikan & penggantian pompa air sumur artesis fasum taman RW 01","nominal":850000,"scope":"rw","rt_id":null,"rw_id":"rw-01","pj":"Seksi Pembangunan RW 01 (Bpk. Mulyadi)"}'::jsonb, NOW()),
('kas-out-rw-01-3', '{"id":"kas-out-rw-01-3","tanggal":"2026-09-25","tipe":"Keluar","kategori":"Kebersihan","deskripsi":"Retribusi armada pengangkutan sampah ke TPA & pembersihan drainase RW","nominal":1200000,"scope":"rw","rt_id":null,"rw_id":"rw-01","pj":"Bendahara RW 01 (Ibu Ratna)"}'::jsonb, NOW()),

-- RT 01 / RW 01
('kas-rt-01-01-1', '{"id":"kas-rt-01-01-1","tanggal":"2026-09-01","tipe":"Masuk","kategori":"Saldo Awal","deskripsi":"Saldo kas awal RT 01 / RW 01 periode September 2026","nominal":3850000,"scope":"rt","rt_id":"rt-01-01","rw_id":"rw-01","pj":"Bendahara RT 01 (Ibu Siti Aminah)"}'::jsonb, NOW()),
('kas-rt-01-01-2', '{"id":"kas-rt-01-01-2","tanggal":"2026-09-05","tipe":"Masuk","kategori":"Sosial & Warga","deskripsi":"Dana sumbangan donatur warga Blok A-04 untuk kas rukun tetangga","nominal":650000,"scope":"rt","rt_id":"rt-01-01","rw_id":"rw-01","pj":"Ketua RT 01 (Bpk. Syahdan)"}'::jsonb, NOW()),
('kas-out-rt-01-01-1', '{"id":"kas-out-rt-01-01-1","tanggal":"2026-09-12","tipe":"Keluar","kategori":"Penerangan Jalan","deskripsi":"Penggantian 5 unit bohlam LED 50W & fitting lampu jalan PJU Blok A RT 01","nominal":375000,"scope":"rt","rt_id":"rt-01-01","rw_id":"rw-01","pj":"Seksi Sarana RT 01 (Bpk. Syahdan)"}'::jsonb, NOW()),
('kas-out-rt-01-01-2', '{"id":"kas-out-rt-01-01-2","tanggal":"2026-09-22","tipe":"Keluar","kategori":"Kebersihan Lingkungan","deskripsi":"Operasional kerja bakti lingkungan & pengadaan kantong sampah RT 01","nominal":250000,"scope":"rt","rt_id":"rt-01-01","rw_id":"rw-01","pj":"Bendahara RT 01"}'::jsonb, NOW()),
('kas-out-rt-01-01-3', '{"id":"kas-out-rt-01-01-3","tanggal":"2026-10-02","tipe":"Keluar","kategori":"Sosial & Warga","deskripsi":"Bantuan santunan duka cita warga Blok A-08 RT 01","nominal":300000,"scope":"rt","rt_id":"rt-01-01","rw_id":"rw-01","pj":"Ketua RT 01 / RW 01"}'::jsonb, NOW()),

-- RT 02 / RW 01
('kas-rt-01-02-1', '{"id":"kas-rt-01-02-1","tanggal":"2026-09-01","tipe":"Masuk","kategori":"Saldo Awal","deskripsi":"Saldo kas awal RT 02 / RW 01 periode September 2026","nominal":4600000,"scope":"rt","rt_id":"rt-01-02","rw_id":"rw-01","pj":"Bendahara RT 02 (Ibu Ratna Dewi)"}'::jsonb, NOW()),
('kas-rt-01-02-2', '{"id":"kas-rt-01-02-2","tanggal":"2026-09-14","tipe":"Masuk","kategori":"Iuran Warga","deskripsi":"Penerimaan kas jimpitan sukarela & iuran ronda warga Blok B","nominal":500000,"scope":"rt","rt_id":"rt-01-02","rw_id":"rw-01","pj":"Koordinator Ronda RT 02"}'::jsonb, NOW()),
('kas-out-rt-01-02-1', '{"id":"kas-out-rt-01-02-1","tanggal":"2026-09-16","tipe":"Keluar","kategori":"Perbaikan Fasum","deskripsi":"Servis mesin potong rumput & beli bensin kerja bakti Blok B RT 02","nominal":420000,"scope":"rt","rt_id":"rt-01-02","rw_id":"rw-01","pj":"Seksi Pemeliharaan RT 02"}'::jsonb, NOW()),
('kas-out-rt-01-02-2', '{"id":"kas-out-rt-01-02-2","tanggal":"2026-09-28","tipe":"Keluar","kategori":"Keamanan Lingkungan","deskripsi":"Pengadaan cermin cembung tikungan jalan Blok B-05 RT 02","nominal":350000,"scope":"rt","rt_id":"rt-01-02","rw_id":"rw-01","pj":"Ketua RT 02 (Bpk. Suryanto Wijaya)"}'::jsonb, NOW()),

-- RW 02
('kas-rw-02-1', '{"id":"kas-rw-02-1","tanggal":"2026-09-01","tipe":"Masuk","kategori":"Saldo Awal","deskripsi":"Saldo kas awal RW 02 periode September 2026","nominal":10800000,"scope":"rw","rt_id":null,"rw_id":"rw-02","pj":"Bendahara RW 02 (Ibu Ratna Sari)"}'::jsonb, NOW()),
('kas-rw-02-2', '{"id":"kas-rw-02-2","tanggal":"2026-09-11","tipe":"Masuk","kategori":"Sewa Fasum","deskripsi":"Penerimaan sewa aula serbaguna RW 02 untuk resepsi warga","nominal":1500000,"scope":"rw","rt_id":null,"rw_id":"rw-02","pj":"Pengurus Balai RW 02"}'::jsonb, NOW()),
('kas-out-rw-02-1', '{"id":"kas-out-rw-02-1","tanggal":"2026-09-15","tipe":"Keluar","kategori":"Keamanan Lingkungan","deskripsi":"Honor 2 petugas satpam gerbang barat RW 02 periode September","nominal":1800000,"scope":"rw","rt_id":null,"rw_id":"rw-02","pj":"Koordinator Keamanan RW 02"}'::jsonb, NOW()),
('kas-out-rw-02-2', '{"id":"kas-out-rw-02-2","tanggal":"2026-09-23","tipe":"Keluar","kategori":"Kebersihan","deskripsi":"Pembersihan gorong-gorong induk RW 02 antisipasi genangan hujan","nominal":650000,"scope":"rw","rt_id":null,"rw_id":"rw-02","pj":"Seksi Lingkungan RW 02"}'::jsonb, NOW()),

-- RT 01 / RW 02
('kas-rt-02-01-1', '{"id":"kas-rt-02-01-1","tanggal":"2026-09-01","tipe":"Masuk","kategori":"Saldo Awal","deskripsi":"Saldo kas awal RT 01 / RW 02 periode September 2026","nominal":2900000,"scope":"rt","rt_id":"rt-02-01","rw_id":"rw-02","pj":"Bendahara RT 01 (Bpk. Agus Santoso)"}'::jsonb, NOW()),
('kas-out-rt-02-01-1', '{"id":"kas-out-rt-02-01-1","tanggal":"2026-09-13","tipe":"Keluar","kategori":"Kesehatan","deskripsi":"Pengadaan obat fogging & operasional penyemprotan nyamuk DBD Blok C","nominal":280000,"scope":"rt","rt_id":"rt-02-01","rw_id":"rw-02","pj":"Kader Kesehatan RT 01"}'::jsonb, NOW()),
('kas-out-rt-02-01-2', '{"id":"kas-out-rt-02-01-2","tanggal":"2026-09-26","tipe":"Keluar","kategori":"Sosial & Warga","deskripsi":"Konsumsi & PMT posyandu balita serta lansia RT 01 Blok C","nominal":150000,"scope":"rt","rt_id":"rt-02-01","rw_id":"rw-02","pj":"Ketua RT 01 (Bpk. Herman Susilo)"}'::jsonb, NOW()),

-- RT 02 / RW 02
('kas-rt-02-02-1', '{"id":"kas-rt-02-02-1","tanggal":"2026-09-01","tipe":"Masuk","kategori":"Saldo Awal","deskripsi":"Saldo kas awal RT 02 / RW 02 periode September 2026","nominal":3450000,"scope":"rt","rt_id":"rt-02-02","rw_id":"rw-02","pj":"Bendahara RT 02 (Ibu Diana Kusuma)"}'::jsonb, NOW()),
('kas-rt-02-02-2', '{"id":"kas-rt-02-02-2","tanggal":"2026-09-17","tipe":"Masuk","kategori":"Operasional","deskripsi":"Hasil penjualan barang daur ulang bank sampah berkah RT 02","nominal":400000,"scope":"rt","rt_id":"rt-02-02","rw_id":"rw-02","pj":"Pengelola Bank Sampah RT 02"}'::jsonb, NOW()),
('kas-out-rt-02-02-1', '{"id":"kas-out-rt-02-02-1","tanggal":"2026-09-24","tipe":"Keluar","kategori":"Perbaikan Fasum","deskripsi":"Perbaikan palang portal otomatis & gembok pos RT 02 Blok D","nominal":320000,"scope":"rt","rt_id":"rt-02-02","rw_id":"rw-02","pj":"Ketua RT 02 (Bpk. Hendra Saputra)"}'::jsonb, NOW()),

-- RW 03
('kas-rw-03-1', '{"id":"kas-rw-03-1","tanggal":"2026-09-01","tipe":"Masuk","kategori":"Saldo Awal","deskripsi":"Saldo kas awal RW 03 periode September 2026","nominal":16500000,"scope":"rw","rt_id":null,"rw_id":"rw-03","pj":"Bendahara RW 03 (Bpk. Joko Susilo)"}'::jsonb, NOW()),
('kas-rw-03-2', '{"id":"kas-rw-03-2","tanggal":"2026-09-07","tipe":"Masuk","kategori":"Pembangunan","deskripsi":"Iuran partisipasi swadaya pengadaan kanopi balai pertemuan RW 03","nominal":2800000,"scope":"rw","rt_id":null,"rw_id":"rw-03","pj":"Panitia Kanopi Balai RW 03"}'::jsonb, NOW()),
('kas-out-rw-03-1', '{"id":"kas-out-rw-03-1","tanggal":"2026-09-19","tipe":"Keluar","kategori":"Perbaikan Fasum","deskripsi":"Pemasangan kanopi galvalum & pengecatan balai RW 03","nominal":3200000,"scope":"rw","rt_id":null,"rw_id":"rw-03","pj":"Seksi Pembangunan RW 03"}'::jsonb, NOW()),
('kas-out-rw-03-2', '{"id":"kas-out-rw-03-2","tanggal":"2026-09-29","tipe":"Keluar","kategori":"Operasional","deskripsi":"Honorarium 2 petugas satpam & armada kebersihan terpadu RW 03","nominal":1500000,"scope":"rw","rt_id":null,"rw_id":"rw-03","pj":"Ketua RW 03 (Bpk. Gunawan Wibowo)"}'::jsonb, NOW()),

-- RT 01 / RW 03
('kas-rt-03-01-1', '{"id":"kas-rt-03-01-1","tanggal":"2026-09-01","tipe":"Masuk","kategori":"Saldo Awal","deskripsi":"Saldo kas awal RT 01 / RW 03 periode September 2026","nominal":5200000,"scope":"rt","rt_id":"rt-03-01","rw_id":"rw-03","pj":"Bendahara RT 01 (Ibu Tri Astuti)"}'::jsonb, NOW()),
('kas-out-rt-03-01-1', '{"id":"kas-out-rt-03-01-1","tanggal":"2026-09-20","tipe":"Keluar","kategori":"Perbaikan Fasum","deskripsi":"Pembelian 2 unit tenda terpal lipat inventaris RT 01 Blok E","nominal":450000,"scope":"rt","rt_id":"rt-03-01","rw_id":"rw-03","pj":"Ketua RT 01 (Bpk. Bambang Pamungkas)"}'::jsonb, NOW()),

-- RT 02 / RW 03
('kas-rt-03-02-1', '{"id":"kas-rt-03-02-1","tanggal":"2026-09-01","tipe":"Masuk","kategori":"Saldo Awal","deskripsi":"Saldo kas awal RT 02 / RW 03 periode September 2026","nominal":4150000,"scope":"rt","rt_id":"rt-03-02","rw_id":"rw-03","pj":"Bendahara RT 02 (Bpk. Eko Wahyudi)"}'::jsonb, NOW()),
('kas-out-rt-03-02-1', '{"id":"kas-out-rt-03-02-1","tanggal":"2026-09-27","tipe":"Keluar","kategori":"Perbaikan Fasum","deskripsi":"Perbaikan paving block jalan amblas depan Blok F-07 RT 02","nominal":380000,"scope":"rt","rt_id":"rt-03-02","rw_id":"rw-03","pj":"Ketua RT 02 (Bpk. Doni Setiawan)"}'::jsonb, NOW()),

-- RW 04
('kas-rw-04-1', '{"id":"kas-rw-04-1","tanggal":"2026-09-01","tipe":"Masuk","kategori":"Saldo Awal","deskripsi":"Saldo kas awal RW 04 periode September 2026","nominal":8900000,"scope":"rw","rt_id":null,"rw_id":"rw-04","pj":"Bendahara RW 04 (Ibu Endang Lestari)"}'::jsonb, NOW()),
('kas-out-rw-04-1', '{"id":"kas-out-rw-04-1","tanggal":"2026-09-11","tipe":"Keluar","kategori":"Keamanan Lingkungan","deskripsi":"Pemeliharaan & peremajaan kabel CCTV lingkungan RW 04 (6 titik)","nominal":1400000,"scope":"rw","rt_id":null,"rw_id":"rw-04","pj":"Teknisi Keamanan RW 04"}'::jsonb, NOW()),
('kas-out-rw-04-2', '{"id":"kas-out-rw-04-2","tanggal":"2026-09-21","tipe":"Keluar","kategori":"Kebersihan","deskripsi":"Penebangan dahan pohon rimbun rawan tumbang di jalan utama RW 04","nominal":750000,"scope":"rw","rt_id":null,"rw_id":"rw-04","pj":"Ketua RW 04 (Bpk. Dedi Kurniawan)"}'::jsonb, NOW()),

-- RT 01 / RW 04
('kas-rt-04-01-1', '{"id":"kas-rt-04-01-1","tanggal":"2026-09-01","tipe":"Masuk","kategori":"Saldo Awal","deskripsi":"Saldo kas awal RT 01 / RW 04 periode September 2026","nominal":2650000,"scope":"rt","rt_id":"rt-04-01","rw_id":"rw-04","pj":"Bendahara RT 01 (Ibu Gita Gutawa)"}'::jsonb, NOW()),
('kas-out-rt-04-01-1', '{"id":"kas-out-rt-04-01-1","tanggal":"2026-09-14","tipe":"Keluar","kategori":"Keamanan Lingkungan","deskripsi":"Beli gembok pos ronda & senter patroli malam petugas siskamling RT 01","nominal":190000,"scope":"rt","rt_id":"rt-04-01","rw_id":"rw-04","pj":"Ketua RT 01 (Bpk. Farhan Maulana)"}'::jsonb, NOW()),

-- RT 02 / RW 04
('kas-rt-04-02-1', '{"id":"kas-rt-04-02-1","tanggal":"2026-09-01","tipe":"Masuk","kategori":"Saldo Awal","deskripsi":"Saldo kas awal RT 02 / RW 04 periode September 2026","nominal":3100000,"scope":"rt","rt_id":"rt-04-02","rw_id":"rw-04","pj":"Bendahara RT 02 (Bpk. Hari Prasetyo)"}'::jsonb, NOW()),
('kas-out-rt-04-02-1', '{"id":"kas-out-rt-04-02-1","tanggal":"2026-09-25","tipe":"Keluar","kategori":"Kebersihan Lingkungan","deskripsi":"Pengadaan 3 tong komposter sampah daun organik warga Blok H RT 02","nominal":260000,"scope":"rt","rt_id":"rt-04-02","rw_id":"rw-04","pj":"Ketua RT 02 (Bpk. Gunawan Wibisono)"}'::jsonb, NOW()),

-- RW 05
('kas-rw-05-1', '{"id":"kas-rw-05-1","tanggal":"2026-09-01","tipe":"Masuk","kategori":"Saldo Awal","deskripsi":"Saldo kas awal RW 05 periode September 2026","nominal":12200000,"scope":"rw","rt_id":null,"rw_id":"rw-05","pj":"Bendahara RW 05 (Bpk. Arif Rahman)"}'::jsonb, NOW()),
('kas-rw-05-2', '{"id":"kas-rw-05-2","tanggal":"2026-09-09","tipe":"Masuk","kategori":"Sosial & Warga","deskripsi":"Donasi CSR kemitraan untuk program penghijauan taman RW 05","nominal":1800000,"scope":"rw","rt_id":null,"rw_id":"rw-05","pj":"Panitia Penghijauan RW 05"}'::jsonb, NOW()),
('kas-out-rw-05-1', '{"id":"kas-out-rw-05-1","tanggal":"2026-09-16","tipe":"Keluar","kategori":"Keamanan Lingkungan","deskripsi":"Honor 3 petugas satpam shift malam gerbang timur RW 05","nominal":2100000,"scope":"rw","rt_id":null,"rw_id":"rw-05","pj":"Koordinator Keamanan RW 05"}'::jsonb, NOW()),
('kas-out-rw-05-2', '{"id":"kas-out-rw-05-2","tanggal":"2026-09-26","tipe":"Keluar","kategori":"Perbaikan Fasum","deskripsi":"Pembelian bibit pohon ketapang kencana & pupuk fasum RW 05","nominal":950000,"scope":"rw","rt_id":null,"rw_id":"rw-05","pj":"Ketua RW 05 (Bpk. Agus Salim)"}'::jsonb, NOW()),

-- RT 01 / RW 05
('kas-rt-05-01-1', '{"id":"kas-rt-05-01-1","tanggal":"2026-09-01","tipe":"Masuk","kategori":"Saldo Awal","deskripsi":"Saldo kas awal RT 01 / RW 05 periode September 2026","nominal":3750000,"scope":"rt","rt_id":"rt-05-01","rw_id":"rw-05","pj":"Bendahara RT 01 (Ibu Juwita Bahar)"}'::jsonb, NOW()),
('kas-out-rt-05-01-1', '{"id":"kas-out-rt-05-01-1","tanggal":"2026-09-18","tipe":"Keluar","kategori":"Keamanan Lingkungan","deskripsi":"Pemasangan banner imbauan 1x24 jam wajib lapor & stiker tamu Blok I","nominal":310000,"scope":"rt","rt_id":"rt-05-01","rw_id":"rw-05","pj":"Ketua RT 01 (Bpk. Irfan Hakim)"}'::jsonb, NOW()),

-- RT 02 / RW 05
('kas-rt-05-02-1', '{"id":"kas-rt-05-02-1","tanggal":"2026-09-01","tipe":"Masuk","kategori":"Saldo Awal","deskripsi":"Saldo kas awal RT 02 / RW 05 periode September 2026","nominal":4500000,"scope":"rt","rt_id":"rt-05-02","rw_id":"rw-05","pj":"Bendahara RT 02 (Ibu Kartika Putri)"}'::jsonb, NOW()),
('kas-out-rt-05-02-1', '{"id":"kas-out-rt-05-02-1","tanggal":"2026-09-30","tipe":"Keluar","kategori":"Perbaikan Fasum","deskripsi":"Pemberantasan sarang tawon & perbaikan atap pos ronda Blok J RT 02","nominal":480000,"scope":"rt","rt_id":"rt-05-02","rw_id":"rw-05","pj":"Ketua RT 02 (Bpk. Joko Anwar)"}'::jsonb, NOW());
