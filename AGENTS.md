# Wargaku IPL — Agent Guidelines & Instructions

Panduan wajib bagi setiap agent sebelum mengeksekusi task di workspace ini. Baca sebelum menulis kode.

---

## 1. Ringkasan Project

Workspace ini berisi ekosistem manajemen iuran dan lingkungan **Wargaku IPL 2.0**:
- **Mobile (`ipl/`):** Aplikasi utama Expo SDK 57 / React Native 0.86, React 19, TypeScript.
- **Web (`src/`):** Dashboard admin dan portal mandiri berbasis Vite + React + Tailwind CSS.
- **Scheduler (`backend-scheduler/`):** Cron node.js untuk penerbitan tagihan bulanan otomatis Asia/Jakarta.
- **Supabase (`supabase/`, SQL files):** Database dokumen JSONB, storage `bukti-transfer`, and Edge Functions.

Dokumentasi arsitektur lengkap: [`docs/PROJECT_CONTEXT.md`](file:///home/adly/Projects/ipl-mobile/docs/PROJECT_CONTEXT.md)  
Spesifikasi visual kanonikal: [`ipl/desain.md`](file:///home/adly/Projects/ipl-mobile/ipl/desain.md)

---

## 2. Aturan Arsitektur & Navigasi (Mobile)

- **React Navigation, BUKAN Expo Router:**
  - Aplikasi mobile menggunakan `@react-navigation/native-stack` dan `@react-navigation/bottom-tabs`.
  - **Dilarang** membuat folder `src/app/` atau mengimpor dari `expo-router`.
  - Daftarkan screen baru di [`ipl/src/navigation/RootNavigator.js`](file:///home/adly/Projects/ipl-mobile/ipl/src/navigation/RootNavigator.js).
- **Offline-First Storage:**
  - Gunakan `AsyncStorage` melalui helper [`ipl/src/utils/storage.js`](file:///home/adly/Projects/ipl-mobile/ipl/src/utils/storage.js) (`getStorageItem`, `saveStorageItem`).
  - Jangan bypass `saveStorageItem` karena helper ini menangani penulisan cache lokal sekaligus sinkronisasi non-blocking ke Supabase.
- **Continuous Native Generation (CNG):**
  - Folder `android/` dan `ios/` tidak boleh diedit manual. Atur perilaku native via `ipl/app.json`.

---

## 3. Batasan Perubahan Backend & Database

- **Dilarang Mengubah Backend Tanpa Instruksi:**
  - Dilarang memodifikasi skema tabel Supabase, SQL migration, atau API contract kecuali tugasnya secara spesifik meminta perubahan backend.
  - Setiap tabel Supabase menyimpan data dalam format JSONB (`id`, `data`, `updated_at`). Jangan mengubah struktur ini menjadi relational kolom biasa tanpa izin pengguna.
- **Kredensial & Lingkungan:**
  - Jangan pernah menampilkan isi rahasia file `.env` atau token JWT/kunci anon di chat.
  - Untuk konfigurasi dynamic client Supabase di mobile, gunakan [`ipl/src/api/supabase.js`](file:///home/adly/Projects/ipl-mobile/ipl/src/api/supabase.js).

---

## 4. Aturan Role & Permission

Sistem memiliki **6 role login** yang terverifikasi: `admin`, `rw`, `rt`, `bendahara`, `pengurus`, `warga`.

- **Satpam:** Bukan akun login. Satpam adalah entitas jadwal piket dan nomor kontak darurat.
- **Scoping Data:**
  - Warga (`isWarga`): Hanya boleh melihat tagihan, profil, dan data rumah sendiri (`currentUser.resident_id`).
  - Ketua RT (`isRT`): Hanya boleh melihat data, warga, kas, dan surat di wilayah RT-nya (`currentUser.rt_id`).
  - Ketua RW (`isRW`): Mengelola seluruh RT di bawah RW-nya (`currentUser.rw_id`).
  - Bendahara (`isBendahara`): Memiliki akses audit finansial, buku kas, verifikasi bukti bayar, dan Peta Warga.
  - Pengurus (`isPengurus`): Mengelola kegiatan/fasum dan layanan operasional.
  - Admin IT (`isAdmin`): Full akses konfigurasi sistem dan database.
- **Dual Role:**
  - Pengguna dengan jabatan struktural (`isOfficial`) memiliki properti `hasDualRole`.
  - Selalu hormati `activeMode` ('jabatan' vs 'warga') saat menampilkan view dan komponen hero di dashboard.

---

## 5. Design System & UI Consistency (`desain.md` v2.0.0)

- **Tokens Kanonikal:** Gunakan token dari [`ipl/src/theme/index.ts`](file:///home/adly/Projects/ipl-mobile/ipl/src/theme/index.ts).
- **Aturan Warna & Aksen:**
  - Warna primer: Emerald `#059669` (utama), `#064E3B` (deep), `#022C22` (dark forest).
  - Teks muted: Selalu `#64748B` (lolos rasio kontras WCAG AA 4.75:1). Dilarang memakai `#94A3B8` untuk teks informasi.
  - Neon Lime `#D4F636`: HANYA untuk fill tombol/pill dengan teks `#022C22` atau aksen di atas latar emerald gelap. Dilarang keras sebagai warna teks/border di atas putih.
  - Status Jatuh Tempo: Gunakan warna Amber `#B45309` (bukan Merah), sesuai prinsip penagihan ramah warga.
- **Format Data Indonesia:**
  - Mata uang: Selalu gunakan `formatRupiah(num)` dari `src/utils/format.ts` (`Rp\u00A0150.000`).
  - Nominal finansial: Wajib `fontVariant: ['tabular-nums']`.
  - Unit rumah: Monospace (`Blok B-12 / No. 04`).
- **Komponen Baru:** Buat komponen UI baru dalam TypeScript (`.tsx`) di bawah `ipl/src/components/ui/` dan gunakan kembali komponen yang ada (`VirtualResidentCard`, `QuickActionGrid`, `KasWidget`, `ReceiptModal`).

---

## 6. Perintah Menjalankan, Type-Check, & Build

Jalankan perintah ini dari dalam folder `ipl/` untuk mobile:

```bash
# 1. Jalankan development server mobile (offline-ready)
cd ipl && npm run start       # atau: npx expo start --offline

# 2. Jalankan di Android Emulator
cd ipl && npm run android

# 3. Jalankan di Web
cd ipl && npm run web

# 4. Verifikasi TypeScript (WAJIB dijalankan sebelum selesai)
cd ipl && npx tsc --noEmit

# 5. Diagnosa kesehatan dependensi Expo
cd ipl && npx expo-doctor

# 6. Build Android APK Preview (EAS)
cd ipl && npx eas-cli build --profile preview --platform android
```

Untuk aplikasi Web Admin (dari root):
```bash
npm run dev     # Menjalankan Vite dev server
npm run build   # Build production web
```

---

## 7. Aturan Verifikasi Sebelum Menyatakan Selesai

Sebelum menyelesaikan tugas apa pun:
1. Jalankan `cd ipl && npx tsc --noEmit` untuk memastikan tidak ada compile/type error.
2. Periksa bahwa perubahan tidak merusak style sheet atau menyebabkan overflow teks pada layar sempit (360dp) atau font scale 130%.
3. Jangan pernah melakukan refactor massal di luar lingkup tugas yang diberikan pengguna.
4. Pertahankan 9 file modifikasi aktif yang belum dicommit di `ipl/` tanpa menimpanya secara sembarangan.

---

## 8. Panduan Penggunaan Skill

- **`/caveman`:**
  - Gunakan saat pengguna meminta eksekusi ringkas, to-the-point, tanpa basa-basi, langsung ke hasil teknis.
  - Pertahankan semua fakta teknis, path, perintah, dan angka secara presisi.
- **`/graphify`:**
  - Gunakan untuk memahami hubungan antarkomponen lintas modul, melacak alur data/fungsi, atau menganalisis dampak sebelum melakukan perubahan besar.
  - Periksa `ipl/graphify-out/` terlebih dahulu sebelum menjalankan build ulang graf penuh.
