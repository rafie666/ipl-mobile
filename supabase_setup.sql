-- =========================================================================
-- SKRIP SETUP DATABASE SUPABASE LENGKAP UNTUK WARGAKU IPL 2.0
-- Buka Supabase Dashboard -> Project Anda -> SQL Editor -> Klik "New query" 
-- -> Paste seluruh skrip ini -> Klik "Run"
-- =========================================================================

-- 1. Buat Tabel Config Lingkungan (RT/RW Profil, Biaya Default, dll)
create table if not exists wargaku_config (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

-- 2. Buat Tabel Master Pos Iuran
create table if not exists wargaku_jenis_iuran (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

-- 3. Buat Tabel Data Warga
create table if not exists wargaku_warga (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

-- 4. Buat Tabel Tagihan IPL
create table if not exists wargaku_tagihan (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

-- 5. Buat Tabel Kas RT & RW
create table if not exists wargaku_kas (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

-- 6. Buat Tabel Kegiatan & Edaran
create table if not exists wargaku_events (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

-- 7. Buat Tabel Tagihan Kegiatan/Lomba/Acara
create table if not exists wargaku_tagihan_events (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

-- 8. Buat Tabel Master RT/RW
create table if not exists wargaku_rts (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

-- 9. Buat Tabel Multi-User & Autentikasi
create table if not exists wargaku_users (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

-- 10. Buat Tabel Rekening Bank (Multi Rekening Scoped RT & RW)
create table if not exists wargaku_bank_accounts (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

-- 11. Buat Tabel Akun QRIS (Multi QRIS Scoped RT & RW)
create table if not exists wargaku_qris_accounts (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

-- 12. Buat Tabel Notifikasi Warga & Admin
create table if not exists wargaku_notifications (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

-- 13. Buat Tabel Audit Trail & Log Keamanan
create table if not exists wargaku_audit_logs (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

-- 14. Buat Tabel Pengaduan & Aspirasi Warga
create table if not exists wargaku_pengaduan (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

-- 15. Buat Tabel Surat Pengantar Warga
create table if not exists wargaku_surat (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

-- 16. Buat Tabel Kontak Darurat Warga
create table if not exists wargaku_kontak_darurat (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

-- 17. Buat Tabel Log Mutasi Gateway Moota (Staging & Audit Trail Bank Mutation)
create table if not exists wargaku_moota_mutations (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

-- =========================================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- =========================================================================
alter table wargaku_config enable row level security;
alter table wargaku_jenis_iuran enable row level security;
alter table wargaku_warga enable row level security;
alter table wargaku_tagihan enable row level security;
alter table wargaku_kas enable row level security;
alter table wargaku_events enable row level security;
alter table wargaku_tagihan_events enable row level security;
alter table wargaku_rts enable row level security;
alter table wargaku_users enable row level security;
alter table wargaku_bank_accounts enable row level security;
alter table wargaku_qris_accounts enable row level security;
alter table wargaku_notifications enable row level security;
alter table wargaku_audit_logs enable row level security;
alter table wargaku_pengaduan enable row level security;
alter table wargaku_surat enable row level security;
alter table wargaku_kontak_darurat enable row level security;
alter table wargaku_moota_mutations enable row level security;

-- =========================================================================
-- KEBIJAKAN AKSES RLS (CLIENT-SIDE DUAL-STORAGE ARCHITECTURE)
-- =========================================================================

drop policy if exists "Akses wargaku_config" on wargaku_config;
create policy "Akses wargaku_config" on wargaku_config for all using (true) with check (true);

drop policy if exists "Akses wargaku_jenis_iuran" on wargaku_jenis_iuran;
create policy "Akses wargaku_jenis_iuran" on wargaku_jenis_iuran for all using (true) with check (true);

drop policy if exists "Akses wargaku_warga" on wargaku_warga;
create policy "Akses wargaku_warga" on wargaku_warga for all using (true) with check (true);

drop policy if exists "Akses wargaku_tagihan" on wargaku_tagihan;
create policy "Akses wargaku_tagihan" on wargaku_tagihan for all using (true) with check (true);

drop policy if exists "Akses wargaku_kas" on wargaku_kas;
create policy "Akses wargaku_kas" on wargaku_kas for all using (true) with check (true);

drop policy if exists "Akses wargaku_events" on wargaku_events;
create policy "Akses wargaku_events" on wargaku_events for all using (true) with check (true);

drop policy if exists "Akses wargaku_tagihan_events" on wargaku_tagihan_events;
create policy "Akses wargaku_tagihan_events" on wargaku_tagihan_events for all using (true) with check (true);

drop policy if exists "Akses wargaku_rts" on wargaku_rts;
create policy "Akses wargaku_rts" on wargaku_rts for all using (true) with check (true);

drop policy if exists "Akses wargaku_users" on wargaku_users;
create policy "Akses wargaku_users" on wargaku_users for all using (true) with check (true);

drop policy if exists "Akses wargaku_bank_accounts" on wargaku_bank_accounts;
create policy "Akses wargaku_bank_accounts" on wargaku_bank_accounts for all using (true) with check (true);

drop policy if exists "Akses wargaku_qris_accounts" on wargaku_qris_accounts;
create policy "Akses wargaku_qris_accounts" on wargaku_qris_accounts for all using (true) with check (true);

drop policy if exists "Akses wargaku_notifications" on wargaku_notifications;
create policy "Akses wargaku_notifications" on wargaku_notifications for all using (true) with check (true);

drop policy if exists "Akses wargaku_audit_logs" on wargaku_audit_logs;
create policy "Akses wargaku_audit_logs" on wargaku_audit_logs for all using (true) with check (true);

drop policy if exists "Akses wargaku_pengaduan" on wargaku_pengaduan;
create policy "Akses wargaku_pengaduan" on wargaku_pengaduan for all using (true) with check (true);

drop policy if exists "Akses wargaku_surat" on wargaku_surat;
create policy "Akses wargaku_surat" on wargaku_surat for all using (true) with check (true);

drop policy if exists "Akses wargaku_kontak_darurat" on wargaku_kontak_darurat;
create policy "Akses wargaku_kontak_darurat" on wargaku_kontak_darurat for all using (true) with check (true);

drop policy if exists "Akses wargaku_moota_mutations" on wargaku_moota_mutations;
create policy "Akses wargaku_moota_mutations" on wargaku_moota_mutations for all using (true) with check (true);

-- =========================================================================
-- AKTIFKAN REALTIME PUBLIKASI
-- =========================================================================
do $$
begin
  alter publication supabase_realtime add table wargaku_config;
  alter publication supabase_realtime add table wargaku_jenis_iuran;
  alter publication supabase_realtime add table wargaku_warga;
  alter publication supabase_realtime add table wargaku_tagihan;
  alter publication supabase_realtime add table wargaku_kas;
  alter publication supabase_realtime add table wargaku_events;
  alter publication supabase_realtime add table wargaku_tagihan_events;
  alter publication supabase_realtime add table wargaku_rts;
  alter publication supabase_realtime add table wargaku_users;
  alter publication supabase_realtime add table wargaku_bank_accounts;
  alter publication supabase_realtime add table wargaku_qris_accounts;
  alter publication supabase_realtime add table wargaku_notifications;
  alter publication supabase_realtime add table wargaku_audit_logs;
  alter publication supabase_realtime add table wargaku_pengaduan;
  alter publication supabase_realtime add table wargaku_surat;
  alter publication supabase_realtime add table wargaku_kontak_darurat;
  alter publication supabase_realtime add table wargaku_moota_mutations;
exception when others then
  null; -- Abaikan jika ada tabel yang sudah terdaftar di publication
end $$;

-- =========================================================================
-- INDEXING & HELPER UNTUK INTEGRASI MOOTA (KODE UNIK 2 HURUF + 3 DIGIT)
-- =========================================================================
-- Format kode unik warga: 2 Huruf + 3 Angka (contoh: WR101, WR102, ...)
-- Nominal tagihan disesuaikan pada 3 digit terakhir (contoh: Pokok 120.000 + 101 -> Total 120.101)
-- Memudahkan pencocokan mutasi bank otomatis via Moota Webhook berdasarkan exact amount.

create index if not exists idx_wargaku_warga_kode_unik on wargaku_warga ((data->>'kodeUnik'));
create index if not exists idx_wargaku_tagihan_total on wargaku_tagihan (((data->>'total')::numeric));
create index if not exists idx_wargaku_tagihan_status on wargaku_tagihan ((data->>'status'));
create index if not exists idx_wargaku_tagihan_periode on wargaku_tagihan ((data->>'bulan'), (data->>'tahun'));
create index if not exists idx_wargaku_moota_mutation_id on wargaku_moota_mutations ((data->>'mutation_id'));
create index if not exists idx_wargaku_moota_status on wargaku_moota_mutations ((data->>'status'));
create index if not exists idx_wargaku_moota_amount on wargaku_moota_mutations (((data->>'amount')::numeric));

-- =========================================================================
-- SETUP SUPABASE STORAGE BUCKET: BUKTI TRANSFER & QRIS
-- =========================================================================
insert into storage.buckets (id, name, public)
values ('bukti-transfer', 'bukti-transfer', true)
on conflict (id) do update set public = true;

drop policy if exists "Akses Publik Bukti Transfer" on storage.objects;
create policy "Akses Publik Bukti Transfer" on storage.objects
for all using (bucket_id = 'bukti-transfer') with check (bucket_id = 'bukti-transfer');


