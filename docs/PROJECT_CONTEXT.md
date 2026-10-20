# IPL Warga — Project Context & Master Technical Reference

**Document Version:** 2.0.0  
**Last Updated:** 2026-10-20  
**Target Codebase:** Monorepo Wargaku IPL (`ipl/` Mobile Expo + Root Web + `backend-scheduler/` + Supabase)

---

## 1. Ringkasan & Arsitektur Monorepo

Project **IPL Warga (Wargaku IPL)** adalah sistem manajemen iuran pengelolaan lingkungan, administrasi warga, transparansi kas, dan layanan digital untuk skala RT/RW.

### 1.1 Struktur Modul Utama

```
ipl-mobile/ (Root Workspace)
├── ipl/                   # [UTAMA] Aplikasi Mobile Expo / React Native (Android & iOS)
│   ├── App.js             # Root component mobile (SafeAreaProvider, AppProvider, RootNavigator)
│   ├── index.js           # Entry point Expo (registerRootComponent, LogBox ignores)
│   ├── app.json           # Konfigurasi Expo SDK 57, permissions, package com.wargaku.ipl
│   ├── eas.json           # Konfigurasi build cloud EAS (development, preview APK, production AAB)
│   ├── desain.md          # Spesifikasi kanonikal Design System v2.0.0 (1162 baris)
│   ├── patches/           # patch-package untuk library expo-notifications (TopicSubscription)
│   ├── scripts/           # Skrip postinstall patch runner (apply-patches.js)
│   ├── graphify-out/      # Knowledge graph & analisis ketergantungan Graphify
│   └── src/               # Source code mobile (components, screens, navigation, context, theme)
├── src/                   # Aplikasi Web Admin & Portal Mandiri (React 18, Vite 6, Tailwind CSS)
├── backend-scheduler/     # Microservice cron terpisah untuk auto-billing Asia/Jakarta
├── supabase/              # Deno Edge Functions (moota-webhook, auto-billing)
├── docker/ & Dockerfile   # Konfigurasi containerization web app & Nginx
├── fix_supabase_storage.sql   # SQL setup bucket storage 'bukti-transfer'
├── supabase_setup.sql         # SQL skema tabel JSONB Supabase
├── supabase_auto_billing.sql  # SQL stored procedure & pg_cron auto-billing
└── docs/                  # Dokumentasi kontekstual sistem
```

---

## 2. Arsitektur Aplikasi Mobile (`ipl/`)

### 2.1 Entry Point & Runtime
- **Entry Point:** [`ipl/index.js`](file:///home/adly/Projects/ipl-mobile/ipl/index.js)
  - Mengabaikan log peringatan `expo-notifications` yang tidak relevan di emulator/Expo Go.
  - Mengabaikan error third-party extension browser pada run web.
  - Memanggil `registerRootComponent(App)`.
- **Root Component:** [`ipl/App.js`](file:///home/adly/Projects/ipl-mobile/ipl/App.js)
  - Hierarchy: `SafeAreaProvider` → `ErrorBoundary` → `AppProvider` → `StatusBar` (`style="light"`, `#0f172a`) → `RootNavigator` → `CustomAlertModal`.

### 2.2 Navigasi & Routing (React Navigation, BUKAN Expo Router!)
> [!IMPORTANT]
> Aplikasi mobile menggunakan **React Navigation v7** (`@react-navigation/native-stack` dan `@react-navigation/bottom-tabs`). **Dilarang** membuat struktur `src/app/` atau mengasumsikan Expo Router.

File konfigurasi navigasi: [`ipl/src/navigation/RootNavigator.js`](file:///home/adly/Projects/ipl-mobile/ipl/src/navigation/RootNavigator.js).

#### A. MainTabNavigator (5 Dynamic Tabs)
Tab disesuaikan secara dinamis berdasarkan role user (`useApp()`):
1. **Tab 1: Beranda / Dashboard** (`DashboardTab`)
   - Warga: Beranda (`Home` icon)
   - Bendahara: Keuangan (`LayoutDashboard` icon)
   - Pengurus: Fasum/Pengurus (`LayoutDashboard` icon)
   - RT: RT 01 (`LayoutDashboard` icon)
   - RW: RW 15 / RW 01 (`LayoutDashboard` icon)
   - Admin: Admin IT (`LayoutDashboard` icon)
2. **Tab 2: Finansial / Warga** (`TagihanTab`)
   - Warga: Tagihan (`Receipt` icon)
   - Bendahara: Buku Kas (`Wallet` icon)
   - RT / RW / Pengurus / Admin: Data Warga (`Users` icon)
3. **Tab 3: Profil Melayang (Center Floating Tab)** (`ProfileTab`)
   - Semua role: Profil Warga / Akun (`User` icon)
4. **Tab 4: Layanan / Verifikasi / Kas** (`LayananTab`)
   - Warga: Layanan Mandiri (`Grid` icon)
   - Pengurus: Fasilitas Umum (`Grid` icon)
   - Bendahara: Verifikasi Tagihan (`Receipt` icon)
   - RT: Kas RT (`Wallet` icon)
   - RW: Kas RW (`Wallet` icon)
   - Admin: Kas Lingkungan (`Wallet` icon)
5. **Tab 5: Aksi Cepat** (`PengaturanTab`)
   - Semua role: Aksi Cepat & Menu Konfigurasi (`Zap` icon)

#### B. Stack Screens (Detail & Modal)
- `Splash`, `Login`, `Register`, `Main`
- `DetailWarga`, `DetailTagihan`, `Pembayaran`, `Pengaduan`, `Surat`, `Events`, `KontakDarurat`, `JadwalSatpam`, `PetaWarga`, `DataAkses`, `Kas`, `WargaList`, `Tagihan`, `Layanan`, `Pengaturan`, `Profile`
- Layanan Aksi Cepat: `RekeningBank`, `PosIuran`, `IdentitasLingkungan`, `NotifikasiPerangkat`, `MootaGateway`, `EditProfileWarga`.

---

## 3. Autentikasi, State Management, & Permission Role

### 3.1 State Management ([`ipl/src/context/AppContext.js`](file:///home/adly/Projects/ipl-mobile/ipl/src/context/AppContext.js))
- Global state menggunakan React Context (`AppContext` & `AppProvider`).
- Data yang dikelola:
  - `currentUser`, `activeMode`, `activeRoleOverride`
  - `warga`, `tagihan`, `kas`, `jenisIuran`, `config`, `events`, `pengaduan`, `surat`, `kontakDarurat`, `jadwalSatpam`, `petugasSatpam`, `bankAccounts`, `qrisAccounts`, `notifications`, `auditLogs`.

### 3.2 Alur Autentikasi ([`ipl/src/services/authService.js`](file:///home/adly/Projects/ipl-mobile/ipl/src/services/authService.js))
- **Token:** JWT lokal dengan format `wargaku_jwt_${role}_${id}_${timestamp}_${random}` disimpan di `AsyncStorage` (`STORAGE_KEYS.AUTH_TOKEN` dan `STORAGE_KEYS.CURRENT_USER`).
- **Verifikasi Sandi:** SHA-256 melalui [`ipl/src/utils/crypto.js`](file:///home/adly/Projects/ipl-mobile/ipl/src/utils/crypto.js) (`hashPassword`, `verifyPassword`).
- **Mode Login:**
  1. Login standar database via username/alias dan password.
  2. Fallback demo shortcut (password `'password'`):
     - `admin` / `superadmin` → Super Administrator IT
     - `bendahara` / `bendahara01` → Ibu Hj. Ratna Dewi (Bendahara Keuangan)
     - `pengurus` / `pengurus01` → Bpk. Mulyadi Pratama (Pengurus Fasum)
     - `rw` / `rw01` → Bpk. H. Rahmat Hidayat (Ketua RW 01)
     - `rt` / `rt01` / `rt01.rw01` → Bpk. Syahdan (Ketua RT 01 / RW 01)
     - `rt02` / `rt2` → Bpk. Suryanto Wijaya (Ketua RT 02 / RW 01)
  3. Login warga fallback berdasarkan NIK, nomor HP, nama slug, kode unik, atau resident ID.
- **Pemeriksaan Status Akun:**
  - `pending_approval`: Dilarang masuk sampai disetujui pengurus RT/RW.
  - `ditolak` / `rejected`: Pendaftaran ditolak.
  - `inactive`: Akun dinonaktifkan.

### 3.3 Pemetaan Role & Hak Akses (Terverifikasi di Source Code)

Terdapat **6 role pengguna** yang valid dalam sistem (`VALID_JABATAN`):

| Role | Identitas di Kode | Cakupan Data (Scope) | Hak Akses Utama |
|---|---|---|---|
| **Admin IT** | `admin` | Global (Semua RW & RT) | Akses konfigurasi sistem, API Supabase, reset kredensial, Peta Warga GIS, seluruh audit log. |
| **Ketua RW** | `rw` | 1 Lingkungan RW (`rw_id`) | Monitoring seluruh RT dalam RW, validasi surat antar-RT, melihat konsolidasi kas dan tagihan se-RW. |
| **Ketua RT** | `rt` | 1 Wilayah RT (`rt_id`) | Manajemen warga RT, persetujuan akun warga baru, penerbitan surat pengantar RT, tanggapan pengaduan warga. |
| **Bendahara** | `bendahara` | Finansial RW / RT | Audit buku kas, verifikasi manual bukti bayar, rekonsiliasi gateway Moota, akses Peta Warga GIS & status iuran. |
| **Pengurus** | `pengurus` | Fasum & Operasional | Manajemen acara lingkungan, fasilitas umum, pemantauan pengaduan warga, koordinasi kegiatan sosial. |
| **Warga** | `warga` | Pribadi (`resident_id`) | Kartu warga virtual, bayar iuran, unggah bukti transfer, ajukan surat, buat laporan pengaduan, jadwal satpam. |

> [!NOTE]
> **Satpam BUKAN Role Login:**
> Satpam tidak memiliki akun login/peran terpisah di `VALID_JABATAN`. Satpam adalah **entitas data operasional** (`petugasSatpam` & `jadwalSatpam`) yang dikelola di `JadwalSatpamScreen.js` dan dihubungi via `KontakDaruratScreen.js`.

### 3.4 Fitur Dual Role (Mode Jabatan vs Mode Warga)
Setiap user yang memiliki jabatan struktural (`rt`, `rw`, `bendahara`, `pengurus`, `admin`) memiliki properti `hasDualRole = true`. User dapat beralih antara:
- **Mode Jabatan (`activeMode: 'jabatan'`):** Melihat dashboard manajemen, approval, dan data warga yang di-scope.
- **Mode Warga (`activeMode: 'warga'`):** Melihat tagihan pribadi unit rumah mereka, kartu warga virtual, dan riwayat pembayaran sendiri.
- Fungsi: `toggleActiveMode()` atau `switchActiveRole(targetRole)` di `AppContext`.

---

## 4. Alur Data, Database, & Sinkronisasi

### 4.1 Pola Penyimpanan: Offline-First
Aplikasi mengadopsi prinsip offline-first melalui [`ipl/src/utils/storage.js`](file:///home/adly/Projects/ipl-mobile/ipl/src/utils/storage.js):
1. **Lokal Utama:** `AsyncStorage` menggunakan prefix key `wargaku_*`.
2. **Fallback Seed:** Jika `AsyncStorage` kosong, data dimuat dari [`ipl/src/data/initialData.js`](file:///home/adly/Projects/ipl-mobile/ipl/src/data/initialData.js).
3. **Sinkronisasi Supabase Non-Blocking:**
   - Ketika data disimpan melalui `saveStorageItem(key, data)`, fungsi langsung menulis ke `AsyncStorage` dan secara asinkron (non-blocking background) melakukan upsert ke Supabase jika `isSupabaseConfigured = true`.
   - Ketika item dihapus via `deleteFromSupabase(key, id)`, dikirim request delete dengan timeout 3 detik agar tidak memblokir UI.
   - `syncAllFromSupabase()` melakukan pull sinkronisasi menyeluruh dari server ke cache lokal saat refresh.

### 4.2 Skema Tabel Supabase
Semua tabel Supabase menggunakan pola fleksibel dokumen JSONB:
```sql
CREATE TABLE wargaku_<nama_tabel> (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

Daftar tabel:
`wargaku_config`, `wargaku_jenis_iuran`, `wargaku_warga`, `wargaku_tagihan`, `wargaku_kas`, `wargaku_events`, `wargaku_tagihan_events`, `wargaku_rts`, `wargaku_rws`, `wargaku_users`, `wargaku_pengaduan`, `wargaku_surat`, `wargaku_kontak_darurat`, `wargaku_bank_accounts`, `wargaku_qris_accounts`, `wargaku_notifications`, `wargaku_audit_logs`, `wargaku_jadwal_satpam`, `wargaku_petugas_satpam`.

### 4.3 Supabase Storage
- Bucket: `bukti-transfer` (Status: Public).
- Digunakan untuk: Upload gambar bukti pembayaran transfer bank dari `PembayaranScreen.js` menggunakan `expo-image-picker`.

---

## 5. Integrasi Layanan Eksternal

### 5.1 Moota Payment Gateway (Verifikasi Otomatis)
- **Implementasi Mobile:** [`ipl/src/services/mootaService.js`](file:///home/adly/Projects/ipl-mobile/ipl/src/services/mootaService.js) dan [`ipl/src/screens/MootaGatewayScreen.js`](file:///home/adly/Projects/ipl-mobile/ipl/src/screens/MootaGatewayScreen.js).
- **Edge Function:** [`supabase/functions/moota-webhook/index.ts`](file:///home/adly/Projects/ipl-mobile/supabase/functions/moota-webhook/index.ts).
- **Mekanisme Pencocokan:**
  - Warga membayar dengan nominal: `Nominal Pokok + Kode Unik Warga (3 digit)`.
  - Mutasi bank kredit (`type: "CR"`) dikirim oleh webhook Moota ke edge function.
  - Webhook mencocokkan nominal mutasi dengan tagihan warga yang berstatus belum lunas.
  - Jika cocok: Tagihan otomatis diubah menjadi `Lunas`, nomor kuitansi otomatis di-generate (`MOOTA-YYYYMMDD-XXXXXX`), dan dicatat ke `wargaku_kas` serta audit log.

### 5.2 Auto-Billing Scheduler (Penerbitan Tagihan Otomatis)
- **Logika Inti:** [`ipl/src/utils/billingScheduler.js`](file:///home/adly/Projects/ipl-mobile/ipl/src/utils/billingScheduler.js) (Zona Waktu: `Asia/Jakarta`).
- **Mekanisme Eksekusi:**
  1. *Mobile Foreground:* Diperiksa saat aplikasi dijalankan (`shouldExecuteAutoBilling`, `buildAutoBillingInvoices`).
  2. *Supabase Edge Function:* [`supabase/functions/auto-billing/index.ts`](file:///home/adly/Projects/ipl-mobile/supabase/functions/auto-billing/index.ts).
  3. *Standalone Microservice:* [`backend-scheduler/scheduler.js`](file:///home/adly/Projects/ipl-mobile/backend-scheduler/scheduler.js).

### 5.3 Peta & GIS Warga
- **Implementasi:** [`ipl/src/screens/PetaWargaScreen.js`](file:///home/adly/Projects/ipl-mobile/ipl/src/screens/PetaWargaScreen.js).
- **Engine Peta:** Leaflet 1.9.4 + OpenStreetMap tiles via `react-native-webview` (Android & iOS) dan `iframe` (Web). **Bebas Google Maps API Key**.
- **Fitur:**
  - Tab Peta Leaflet: Marker interaktif unit rumah warga (Hijau Emerald = Lunas, Amber = Belum Lunas) & Balai RT dengan pin kustom.
  - Live GPS: Lokasi pengguna saat ini dengan animasi pulse radar via `expo-location`.
  - Tab Denah: Layout kotak blok perumahan (Blok A, B, C, dst.).
  - Tab Posko: Titik fasum (Pos Satpam, Balai Warga, Lapangan).
  - Bridge Komunikasi: Tapping pin mengirim postMessage ke React Native untuk membuka bottom sheet drawer / navigasi.
- **Proteksi Akses:** Khusus role `Admin IT` dan `Bendahara`.

### 5.4 Push Notifications
- **Implementasi:** [`ipl/src/services/notificationService.js`](file:///home/adly/Projects/ipl-mobile/ipl/src/services/notificationService.js).
- **Status:** `ENABLE_PUSH_NOTIFICATIONS = false` secara default untuk mencegah error/crash pada emulator dan Expo Go.
- **Saluran Notifikasi Android:** `ipl-tagihan`, `ipl-pengumuman`, `ipl-pengaduan`, `ipl-darurat`.

---

## 6. Design System & Standar UI (`desain.md` v2.0.0)

Kanonikal styling didefinisikan di [`ipl/src/theme/index.ts`](file:///home/adly/Projects/ipl-mobile/ipl/src/theme/index.ts) dan di-reexport untuk kompatibilitas di [`ipl/src/utils/theme.js`](file:///home/adly/Projects/ipl-mobile/ipl/src/utils/theme.js).

### 6.1 Token Warna & WCAG AA Compliance
- **Brand Emerald:**
  - `primaryDark`: `#022C22`
  - `primaryDeep`: `#064E3B`
  - `primary`: `#059669`
  - `primaryLight`: `#10B981`
  - `primarySubtle`: `#ECFDF5`
- **Neo-Banking Accent:**
  - `accentLime`: `#D4F636`
  - *Aturan Ketat:* Neon Lime HANYA boleh dipakai sebagai fill tombol dengan teks gelap `#022C22` (kontras 12.3:1) atau aksen di atas latar gelap emerald. **DILARANG** sebagai teks atau border di atas putih/off-white.
- **Teks:**
  - `textPrimary`: `#0F172A`
  - `textSecondary`: `#475569`
  - `textMuted`: `#64748B` (memenuhi standar WCAG AA 4.75:1 di atas putih, menggantikan `#94A3B8` dari v1.0).
- **Status Badges (Anti-Intimidasi):**
  - `paid`: Hijau (`fg: #047857`, `bg: #ECFDF5`)
  - `unpaid`: Amber (`fg: #B45309`, `bg: #FFFBEB`)
  - `overdue`: Amber (`fg: #B45309`, `bg: #FFFBEB`) — **Bukan Merah**, demi prinsip penagihan ramah warga.
  - `pending`: Biru (`fg: #1D4ED8`, `bg: #EFF6FF`)
  - `rejected`: Merah (`fg: #B91C1C`, `bg: #FEF2F2`)

### 6.2 Format Standar Data Indonesia
- Rupiah: `Rp` + non-breaking space (`\u00A0`) + titik ribuan (`Rp 150.000`).
- Tanggal: `14 Okt 2026` (`formatDateIndo`).
- Waktu: `09:12 WIB`.
- Unit Rumah: `Blok B-12 / No. 04` (selalu font monospace).
- Finansial: Wajib `fontVariant: ['tabular-nums']` agar angka vertikal rata.

### 6.3 Komponen Hero & Widget Reusable
- [`VirtualResidentCard.tsx`](file:///home/adly/Projects/ipl-mobile/ipl/src/components/VirtualResidentCard.tsx): Kartu identitas virtual warga interaktif.
- [`QuickActionGrid.tsx`](file:///home/adly/Projects/ipl-mobile/ipl/src/components/QuickActionGrid.tsx): Grid menu cepat 8 aksi dengan tint 50-level dan ikon 700-level.
- [`KasWidget.tsx`](file:///home/adly/Projects/ipl-mobile/ipl/src/components/KasWidget.tsx): Widget transparansi kas masuk/keluar.
- [`ReceiptModal.tsx`](file:///home/adly/Projects/ipl-mobile/ipl/src/components/ReceiptModal.tsx): Modal kuitansi pembayaran resmi siap unduh/cetak.
- Hero Cards per Role: `BendaharaHeroCard.tsx`, `RTHeroCard.tsx`, `RWHeroCard.tsx`, `PengurusHeroCard.tsx`.
- Komponen Desain Baru: [`ipl/src/components/ui/`](file:///home/adly/Projects/ipl-mobile/ipl/src/components/ui/) (`Button.tsx`, `Badge.tsx`, `Input.tsx`, `Skeleton.tsx`, `NotificationBadge.tsx`).

---

## 7. Status Implementasi & Analisis Kesenjangan

| Modul / Fitur | Status | Keterangan Verifikasi Source Code |
|---|---|---|
| **Expo Native Navigation** | **SUDAH ADA** | React Navigation v7 berjalan baik dengan 5 dynamic tabs dan native stack. |
| **Role & Dual-Role Switch** | **SUDAH ADA** | Berfungsi penuh untuk Admin, RW, RT, Bendahara, Pengurus, dan Warga. |
| **Buku Kas & Transparansi** | **SUDAH ADA** | Pencatatan kas masuk/keluar, saldo kas, pemisahan kas RT vs kas RW. |
| **Layanan Pengaduan Warga** | **SUDAH ADA** | Pengajuan tiket komplain, foto bukti, respon status penanganan dari RT/RW. |
| **Surat Pengantar RT/RW** | **SUDAH ADA** | Pengajuan surat pengantar domisili, KTP, SKCK, dll. dengan approval RT. |
| **Kegiatan & Acara Warga** | **SUDAH ADA** | Pengumuman gotong royong, arisan, iuran insidental. |
| **Jadwal Satpam & Roster** | **SUDAH ADA** | Informasi regu jaga harian, shift pagi/siang/malam, lokasi pos. |
| **Moota Bank Reconciliation** | **PARSIAL** | Edge Function & service ada. Sandbox aktif dengan akun default, live akun butuh webhook Supabase aktif. |
| **Peta Warga GIS** | **SUDAH ADA** | Berbasis Leaflet & OpenStreetMap via `react-native-webview` (mobile) dan `iframe` (web). Bebas Google Maps API Key. |
| **Push Notifications FCM** | **PARSIAL** | Saluran Android dan listener siap. Toggle dinonaktifkan (`false`) demi stabilitas runtime dev. |
| **Standalone Backend Cron** | **PARSIAL** | Script `scheduler.js` ada, namun folder `backend-scheduler` belum memiliki `node_modules` tersendiri. |
| **Role Khusus Satpam** | **TIDAK ADA** | Bukan bug: Satpam adalah entitas jadwal/kontak, bukan role login akun. |

---

## 8. Technical Debt & Risiko yang Teridentifikasi

1. **Inkonsistensi Komponen JS vs TSX:**
   Terdapat komponen lama bertipe `.js` (`AppButton.js`, `AppBadge.js`) berdampingan dengan komponen baru bertipe `.tsx` (`ui/Button.tsx`, `ui/Badge.tsx`).
   *Aturan:* Setiap fitur baru WAJIB menggunakan komponen `.tsx` di bawah `src/components/ui/`.
2. **Ketergantungan `backend-scheduler`:**
   File `backend-scheduler/test_suite.js` mengimpor `../ipl-mobile/src/utils/billingScheduler.js` (path direktori lama sebelum berganti nama menjadi `ipl/`).
3. **Peta Warga Mandiri (Leaflet):**
   Peta telah dimigrasi ke Leaflet + OpenStreetMap via `react-native-webview`. Konfigurasi `googleMaps.apiKey` telah dihapus dari `app.json` sehingga build APK Android tidak lagi membutuhkan Google Cloud Platform API Key.
4. **9 File Uncommitted di `ipl/`:**
   Terdapat modifikasi aktif di komponen utama (`VirtualResidentCard.tsx`, `QuickActionGrid.tsx`, `DashboardScreen.js`, dll.). Jangan pernah melakukan `git restore` atau modifikasi destructive tanpa izin eksplisit pengguna.

---

## 9. Panduan Memulai Task Baru Tanpa Analisis Ulang

Jika Anda adalah agen yang baru menerima task di project ini:
1. Baca [`AGENTS.md`](file:///home/adly/Projects/ipl-mobile/AGENTS.md) untuk aturan eksekusi cepat.
2. Identifikasi apakah task terkait **Mobile (`ipl/`)**, **Web (`src/`)**, atau **Database/Scheduler**.
3. Jika mobile:
   - Gunakan `cd ipl && npx tsc --noEmit` untuk memverifikasi type safety.
   - Jangan menyentuh backend schema kecuali diminta.
   - Gunakan token warna dari [`ipl/src/theme/index.ts`](file:///home/adly/Projects/ipl-mobile/ipl/src/theme/index.ts).
   - Patuhi role permission di `authService.js` dan `AppContext.js`.
4. Jika task membutuhkan navigasi graph atau pengecekan dependensi, gunakan laporan yang sudah ada di [`ipl/graphify-out/GRAPH_REPORT.md`](file:///home/adly/Projects/ipl-mobile/ipl/graphify-out/GRAPH_REPORT.md).
