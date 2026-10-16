-- =========================================================================
-- FIX SUPABASE STORAGE: BUCKET 'bukti-transfer'
-- Jalankan skrip ini di: Supabase Dashboard -> SQL Editor -> Klik "Run"
-- =========================================================================

-- 1. Buat bucket 'bukti-transfer' dengan status Public
insert into storage.buckets (id, name, public)
values ('bukti-transfer', 'bukti-transfer', true)
on conflict (id) do update set public = true;

-- 2. Beri izin akses baca dan upload (RLS Policy) untuk aplikasi mobile
drop policy if exists "Akses Publik Bukti Transfer" on storage.objects;
create policy "Akses Publik Bukti Transfer" on storage.objects
for all using (bucket_id = 'bukti-transfer') with check (bucket_id = 'bukti-transfer');

-- 3. Verifikasi apakah bucket berhasil dibuat
select id, name, public, created_at from storage.buckets where id = 'bukti-transfer';
