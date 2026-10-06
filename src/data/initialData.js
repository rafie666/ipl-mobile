import { INITIAL_RTS } from './rtsData'
export { INITIAL_RTS }

export const INITIAL_USERS = [
  { 
    id: 'u-admin', 
    username: 'admin', 
    aliases: ['admin', 'admin@ipl.test', 'administrator'], 
    password_hash: 'c699afa220b2b8d1587025c7c0bb839b95358f0cb72a70fadca0e699fd0fb20e', // password: 'password'
    name: 'Super Administrator', 
    role: 'admin',
    resident_id: null,
    rt_id: null,
    status: 'active'
  },
  { 
    id: 'u-rt', 
    username: 'rt', 
    aliases: ['rt', 'rt@ipl.test', 'rt01', 'rt01@ipl.test', 'pengurus'], 
    password_hash: 'c699afa220b2b8d1587025c7c0bb839b95358f0cb72a70fadca0e699fd0fb20e', // password: 'password'
    name: 'Bpk. Syahdan (Ketua RT 01)', 
    role: 'rt',
    resident_id: null,
    rt_id: 'rt-1',
    status: 'active'
  },
  { 
    id: 'u-warga', 
    username: 'bambang.sutrisno', 
    aliases: ['bambang.sutrisno', 'warga', 'warga@ipl.test', 'w-1', 'bambang'], 
    password_hash: 'c699afa220b2b8d1587025c7c0bb839b95358f0cb72a70fadca0e699fd0fb20e', // password: 'password'
    name: 'Bambang Sutrisno (Warga A-01)', 
    role: 'warga', 
    resident_id: 'w-1',
    rt_id: 'rt-1',
    status: 'active'
  }
]

export const INITIAL_ADMIN_AUTH = {
  username: 'admin@ipl.test',
  password_hash: 'c699afa220b2b8d1587025c7c0bb839b95358f0cb72a70fadca0e699fd0fb20e'
}

export const INITIAL_CONFIG = {
  namaLingkungan: 'Perumahan Alam Tirta Lestari',
  rw: 'RW 15',
  rtRw: 'RW 15',
  kelurahan: 'Pagelaran',
  kecamatan: 'Ciomas',
  kota: 'Kabupaten Bogor',
  ketuaRw: 'Bpk. H. Rahmat Hidayat',
  bendaharaRw: 'Bpk. Mulyadi',
  kontakRw: '081122334455',
  rekeningRw: 'BCA 7788990011 a.n Kas RW 15',
  ketuaRt: 'Bpk. Syahdan',
  bendahara: 'Ibu Siti Aminah',
  kontakRt: '081234567890',
  rekeningBank: 'BCA 8730192831 a.n Kas RT 01'
}

export const INITIAL_JENIS_IURAN = [
  // Iuran Scope RT
  { id: 'ji-1', nama: 'Iuran Kebersihan & Sampah RT', nominal: 35000, wajib: true, aktif: true, payment_scope: 'RT', target_id: 'ALL_RT', periode: 'Bulanan', keterangan: 'Biaya angkut sampah rutin 3x seminggu' },
  { id: 'ji-2', nama: 'Iuran Keamanan & Portal RT', nominal: 50000, wajib: true, aktif: true, payment_scope: 'RT', target_id: 'ALL_RT', periode: 'Bulanan', keterangan: 'Honor satpam jaga pos RT' },
  { id: 'ji-3', nama: 'Kas Pemeliharaan & Fasum RT', nominal: 25000, wajib: true, aktif: true, payment_scope: 'RT', target_id: 'ALL_RT', periode: 'Bulanan', keterangan: 'Lampu jalan, taman warga, dan sarana RT' },
  { id: 'ji-4', nama: 'Dana Sosial & Kematian RT', nominal: 10000, wajib: false, aktif: true, payment_scope: 'RT', target_id: 'ALL_RT', periode: 'Bulanan', keterangan: 'Bantuan santunan warga RT' },
  // Iuran Scope RW
  { id: 'ji-rw-1', nama: 'Iuran Pembangunan & Fasum RW', nominal: 25000, wajib: true, aktif: true, payment_scope: 'RW', target_id: 'rw-15', periode: 'Bulanan', keterangan: 'Perbaikan jalan utama, pos keamanan gerbang RW' },
  { id: 'ji-rw-2', nama: 'Iuran Kegiatan Bersama RW', nominal: 15000, wajib: false, aktif: true, payment_scope: 'RW', target_id: 'rw-15', periode: 'Bulanan', keterangan: 'Event bersama tingkat RW' }
]

export const INITIAL_BANK_ACCOUNTS = [
  // Rekening RW 15
  {
    id: 'ba-rw-1',
    owner_type: 'RW',
    owner_id: 'rw-15',
    bank_name: 'BCA',
    account_number: '7788990011',
    account_holder: 'Bendahara RW 15 (Bpk. Mulyadi)',
    is_primary: true,
    is_active: true
  },
  {
    id: 'ba-rw-2',
    owner_type: 'RW',
    owner_id: 'rw-15',
    bank_name: 'Mandiri',
    account_number: '1330099887766',
    account_holder: 'Kas Pembangunan RW 15',
    is_primary: false,
    is_active: true
  },
  // Rekening RT 01
  {
    id: 'ba-rt1-1',
    owner_type: 'RT',
    owner_id: 'rt-1',
    bank_name: 'BCA',
    account_number: '8730192831',
    account_holder: 'Bendahara RT 01 (Ibu Siti Aminah)',
    is_primary: true,
    is_active: true
  },
  {
    id: 'ba-rt1-2',
    owner_type: 'RT',
    owner_id: 'rt-1',
    bank_name: 'BRI',
    account_number: '012301098765501',
    account_holder: 'Kas Sosial RT 01',
    is_primary: false,
    is_active: true
  },
  // Rekening RT 02
  {
    id: 'ba-rt2-1',
    owner_type: 'RT',
    owner_id: 'rt-2',
    bank_name: 'Mandiri',
    account_number: '1330019283123',
    account_holder: 'Bendahara RT 02 (Ibu Ratna Dewi)',
    is_primary: true,
    is_active: true
  },
  // Rekening RT 03
  {
    id: 'ba-rt3-1',
    owner_type: 'RT',
    owner_id: 'rt-3',
    bank_name: 'BRI',
    account_number: '019201029384501',
    account_holder: 'Bendahara RT 03 (Bpk. Agus Santoso)',
    is_primary: true,
    is_active: true
  }
]

export const INITIAL_QRIS_ACCOUNTS = [
  // QRIS RW 15
  {
    id: 'qris-rw-1',
    owner_type: 'RW',
    owner_id: 'rw-15',
    qris_name: 'QRIS RW 15 Utama',
    image_url: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021126580014ID.CO.QRIS.WWW01189360099900000000155204581253033605802ID5914KAS%20RW%2015%20BOGOR6005BOGOR61051661063046D94',
    is_primary: true,
    is_active: true
  },
  {
    id: 'qris-rw-2',
    owner_type: 'RW',
    owner_id: 'rw-15',
    qris_name: 'QRIS RW 15 Pembangunan',
    image_url: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021126580014ID.CO.QRIS.WWW01189360099900000000155204581253033605802ID5914KAS%20PEMBANGUNAN%20RW%20156005BOGOR61051661063046D94',
    is_primary: false,
    is_active: true
  },
  // QRIS RT 01
  {
    id: 'qris-rt1-1',
    owner_type: 'RT',
    owner_id: 'rt-1',
    qris_name: 'QRIS RT 01 Utama',
    image_url: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021126580014ID.CO.QRIS.WWW01189360099900000000015204581253033605802ID5914KAS%20RT%2001%20BOGOR6005BOGOR61051661063046D94',
    is_primary: true,
    is_active: true
  },
  // QRIS RT 02
  {
    id: 'qris-rt2-1',
    owner_type: 'RT',
    owner_id: 'rt-2',
    qris_name: 'QRIS RT 02 Utama',
    image_url: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021126580014ID.CO.QRIS.WWW01189360099900000000025204581253033605802ID5914KAS%20RT%2002%20BOGOR6005BOGOR61051661063046D94',
    is_primary: true,
    is_active: true
  },
  // QRIS RT 03
  {
    id: 'qris-rt3-1',
    owner_type: 'RT',
    owner_id: 'rt-3',
    qris_name: 'QRIS RT 03 Utama',
    image_url: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021126580014ID.CO.QRIS.WWW01189360099900000000035204581253033605802ID5914KAS%20RT%2003%20BOGOR6005BOGOR61051661063046D94',
    is_primary: true,
    is_active: true
  }
]

export const ALASAN_PENOLAKAN_PRESET = [
  'Nominal tidak sesuai',
  'Bukti pembayaran tidak jelas',
  'Bukti pembayaran tidak ditemukan',
  'Rekening tujuan tidak sesuai',
  'QRIS tujuan tidak sesuai',
  'Tanggal pembayaran tidak sesuai',
  'Bukti pembayaran sudah pernah digunakan',
  'Bukti pembayaran tidak sesuai dengan tagihan',
  'Lainnya'
]

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    userId: 'u-warga',
    residentId: 'w-1',
    title: 'Pembayaran IPL Terverifikasi ✅',
    message: 'Pembayaran IPL September 2026 sebesar Rp 120.000 telah disetujui oleh Bendahara RT 01.',
    type: 'payment_verified',
    tagihanId: 'tag-2026-09-w-1',
    read: false,
    created_at: '2026-09-05T14:30:00Z'
  }
]

export const INITIAL_AUDIT_LOGS = [
  {
    id: 'audit-1',
    userId: 'u-rt',
    userName: 'Bpk. Syahdan (Bendahara RT 01)',
    userRole: 'rt',
    action: 'VERIFY_PAYMENT',
    entity: 'tagihan',
    entityId: 'tag-2026-09-w-1',
    details: 'Menyetujui pembayaran IPL September 2026 warga Bambang Sutrisno (Lunas). No Kwitansi: RT01-20260905-000001',
    created_at: '2026-09-05T14:30:00Z'
  }
]

export const INITIAL_WARGA = [
  { 
    id: 'w-1', 
    rt_id: 'rt-1', 
    kodeUnik: '101',
    nama: 'Bambang Sutrisno', 
    nik: '3201011504820001',
    noKk: '3201011504820001',
    blok: 'A', 
    noRumah: '01', 
    noHp: '081234567890', 
    email: 'bambang.sutrisno@gmail.com',
    statusHuni: 'Tetap', 
    statusKepemilikan: 'Milik Sendiri',
    jenisKelamin: 'Laki-laki',
    agama: 'Islam',
    statusPernikahan: 'Kawin',
    jumlahJiwa: 4, 
    pekerjaan: 'PNS',
    lat: -6.59715,
    lng: 106.76415,
    kontakDaruratNama: 'Ibu Siti Aminah (Istri)',
    kontakDaruratHp: '081234567891',
    kontakDaruratHubungan: 'Istri',
    tglMasuk: '2018-05-12',
    catatan: 'Ketua Seksi Kebersihan RT',
    aktif: true,
    anggotaKeluarga: [
      { id: 'ak-1-1', nama: 'Bambang Sutrisno', nik: '3201011504820001', hubungan: 'Kepala Keluarga', jenisKelamin: 'Laki-laki', tempatLahir: 'Bogor', tanggalLahir: '1982-04-15', agama: 'Islam', pendidikan: 'S1', pekerjaan: 'PNS', statusPernikahan: 'Kawin', golonganDarah: 'O', noHp: '081234567890' },
      { id: 'ak-1-2', nama: 'Siti Aminah', nik: '3201015208860001', hubungan: 'Istri', jenisKelamin: 'Perempuan', tempatLahir: 'Jakarta', tanggalLahir: '1986-08-12', agama: 'Islam', pendidikan: 'S1', pekerjaan: 'Ibu Rumah Tangga', statusPernikahan: 'Kawin', golonganDarah: 'A', noHp: '081234567891' },
      { id: 'ak-1-3', nama: 'Rizky Pratama', nik: '3201011210100001', hubungan: 'Anak', jenisKelamin: 'Laki-laki', tempatLahir: 'Bogor', tanggalLahir: '2010-10-12', agama: 'Islam', pendidikan: 'SMP', pekerjaan: 'Pelajar / Mahasiswa', statusPernikahan: 'Belum Kawin', golonganDarah: 'O', noHp: '' },
      { id: 'ak-1-4', nama: 'Nadia Salsabila', nik: '3201016503150001', hubungan: 'Anak', jenisKelamin: 'Perempuan', tempatLahir: 'Bogor', tanggalLahir: '2015-03-25', agama: 'Islam', pendidikan: 'SD', pekerjaan: 'Pelajar / Mahasiswa', statusPernikahan: 'Belum Kawin', golonganDarah: 'A', noHp: '' }
    ]
  },
  { 
    id: 'w-2', 
    rt_id: 'rt-1', 
    kodeUnik: '102',
    nama: 'Hendra Gunawan', 
    nik: '3201012208850002',
    noKk: '3201012208850002',
    blok: 'A', 
    noRumah: '02', 
    noHp: '081398765432', 
    email: 'hendra.gunawan@yahoo.com',
    statusHuni: 'Tetap', 
    statusKepemilikan: 'Milik Sendiri',
    jenisKelamin: 'Laki-laki',
    agama: 'Islam',
    statusPernikahan: 'Kawin',
    jumlahJiwa: 3, 
    pekerjaan: 'Wiraswasta',
    lat: -6.59728,
    lng: 106.76428,
    kontakDaruratNama: 'Lestari Handayani',
    kontakDaruratHp: '081398765433',
    kontakDaruratHubungan: 'Istri',
    tglMasuk: '2019-02-10',
    catatan: 'Usaha percetakan & sablon',
    aktif: true,
    anggotaKeluarga: [
      { id: 'ak-2-1', nama: 'Hendra Gunawan', nik: '3201012208850002', hubungan: 'Kepala Keluarga', jenisKelamin: 'Laki-laki', tempatLahir: 'Bandung', tanggalLahir: '1985-08-22', agama: 'Islam', pendidikan: 'D3', pekerjaan: 'Wiraswasta', statusPernikahan: 'Kawin', golonganDarah: 'B', noHp: '081398765432' },
      { id: 'ak-2-2', nama: 'Lestari Handayani', nik: '3201014104880002', hubungan: 'Istri', jenisKelamin: 'Perempuan', tempatLahir: 'Bogor', tanggalLahir: '1988-04-01', agama: 'Islam', pendidikan: 'SMA/SMK', pekerjaan: 'Wiraswasta', statusPernikahan: 'Kawin', golonganDarah: 'AB', noHp: '081398765433' },
      { id: 'ak-2-3', nama: 'Dimas Aditya', nik: '3201011809140002', hubungan: 'Anak', jenisKelamin: 'Laki-laki', tempatLahir: 'Bogor', tanggalLahir: '2014-09-18', agama: 'Islam', pendidikan: 'SD', pekerjaan: 'Pelajar / Mahasiswa', statusPernikahan: 'Belum Kawin', golonganDarah: 'B', noHp: '' }
    ]
  },
  { 
    id: 'w-3', 
    rt_id: 'rt-1', 
    kodeUnik: '103',
    nama: 'Rian Hidayat', 
    nik: '3201011103930003',
    noKk: '3201011103930003',
    blok: 'A', 
    noRumah: '03', 
    noHp: '085712345678', 
    email: 'rian.hidayat@outlook.com',
    statusHuni: 'Kontrak', 
    statusKepemilikan: 'Sewa / Kontrak',
    jenisKelamin: 'Laki-laki',
    agama: 'Islam',
    statusPernikahan: 'Kawin',
    jumlahJiwa: 2, 
    pekerjaan: 'Karyawan Swasta',
    lat: -6.59740,
    lng: 106.76440,
    kontakDaruratNama: 'Dina Puspitasari',
    kontakDaruratHp: '085712345679',
    kontakDaruratHubungan: 'Istri',
    tglMasuk: '2023-08-01',
    catatan: 'Kontrak 2 tahun s.d Agustus 2027',
    aktif: true,
    anggotaKeluarga: [
      { id: 'ak-3-1', nama: 'Rian Hidayat', nik: '3201011103930003', hubungan: 'Kepala Keluarga', jenisKelamin: 'Laki-laki', tempatLahir: 'Sukabumi', tanggalLahir: '1993-03-11', agama: 'Islam', pendidikan: 'S1', pekerjaan: 'Karyawan Swasta', statusPernikahan: 'Kawin', golonganDarah: 'O', noHp: '085712345678' },
      { id: 'ak-3-2', nama: 'Dina Puspitasari', nik: '3201015911950003', hubungan: 'Istri', jenisKelamin: 'Perempuan', tempatLahir: 'Cianjur', tanggalLahir: '1995-11-19', agama: 'Islam', pendidikan: 'S1', pekerjaan: 'Karyawan Swasta', statusPernikahan: 'Kawin', golonganDarah: 'A', noHp: '085712345679' }
    ]
  },
  { 
    id: 'w-4', 
    rt_id: 'rt-1', 
    kodeUnik: '104',
    nama: 'Ahmad Fauzi', 
    nik: '3201010906780004',
    noKk: '3201010906780004',
    blok: 'A', 
    noRumah: '04', 
    noHp: '081987654321', 
    email: 'ahmad.fauzi@univ.ac.id',
    statusHuni: 'Tetap', 
    statusKepemilikan: 'Milik Sendiri',
    jenisKelamin: 'Laki-laki',
    agama: 'Islam',
    statusPernikahan: 'Kawin',
    jumlahJiwa: 5, 
    pekerjaan: 'Dosen',
    lat: -6.59752,
    lng: 106.76452,
    kontakDaruratNama: 'Nurul Hidayati',
    kontakDaruratHp: '081987654322',
    kontakDaruratHubungan: 'Istri',
    tglMasuk: '2017-11-20',
    catatan: 'Penasehat Takmir Masjid',
    aktif: true,
    anggotaKeluarga: [
      { id: 'ak-4-1', nama: 'Dr. Ahmad Fauzi, M.Si', nik: '3201010906780004', hubungan: 'Kepala Keluarga', jenisKelamin: 'Laki-laki', tempatLahir: 'Semarang', tanggalLahir: '1978-06-09', agama: 'Islam', pendidikan: 'S3', pekerjaan: 'Dosen', statusPernikahan: 'Kawin', golonganDarah: 'A', noHp: '081987654321' },
      { id: 'ak-4-2', nama: 'Nurul Hidayati, M.Pd', nik: '3201014807800004', hubungan: 'Istri', jenisKelamin: 'Perempuan', tempatLahir: 'Solo', tanggalLahir: '1980-07-08', agama: 'Islam', pendidikan: 'S2', pekerjaan: 'Guru', statusPernikahan: 'Kawin', golonganDarah: 'O', noHp: '081987654322' },
      { id: 'ak-4-3', nama: 'Faisal Ramadhan', nik: '3201011409050004', hubungan: 'Anak', jenisKelamin: 'Laki-laki', tempatLahir: 'Bogor', tanggalLahir: '2005-09-14', agama: 'Islam', pendidikan: 'SMA/SMK', pekerjaan: 'Mahasiswa', statusPernikahan: 'Belum Kawin', golonganDarah: 'A', noHp: '' },
      { id: 'ak-4-4', nama: 'Aisyah Putri', nik: '3201016203090004', hubungan: 'Anak', jenisKelamin: 'Perempuan', tempatLahir: 'Bogor', tanggalLahir: '2009-03-22', agama: 'Islam', pendidikan: 'SMA/SMK', pekerjaan: 'Pelajar / Mahasiswa', statusPernikahan: 'Belum Kawin', golonganDarah: 'O', noHp: '' },
      { id: 'ak-4-5', nama: 'Ibu Sumiati (Mertua)', nik: '3201015001550004', hubungan: 'Orang Tua', jenisKelamin: 'Perempuan', tempatLahir: 'Solo', tanggalLahir: '1955-01-10', agama: 'Islam', pendidikan: 'SD', pekerjaan: 'Pensiunan', statusPernikahan: 'Cerai Mati', golonganDarah: 'O', noHp: '' }
    ]
  },
  
  { 
    id: 'w-5', 
    rt_id: 'rt-1', 
    kodeUnik: '105',
    nama: 'Joko Prasetyo', 
    nik: '3201011802800005',
    noKk: '3201011802800005',
    blok: 'B', 
    noRumah: '01', 
    noHp: '082112345678', 
    email: 'joko.prasetyo@bumn.co.id',
    statusHuni: 'Tetap', 
    statusKepemilikan: 'Milik Sendiri',
    jenisKelamin: 'Laki-laki',
    agama: 'Islam',
    statusPernikahan: 'Kawin',
    jumlahJiwa: 4, 
    pekerjaan: 'BUMN',
    lat: -6.59735,
    lng: 106.76475,
    kontakDaruratNama: 'Endang Sulastri',
    kontakDaruratHp: '082112345679',
    kontakDaruratHubungan: 'Istri',
    tglMasuk: '2019-06-15',
    catatan: 'Seksi Keamanan Lingkungan',
    aktif: true,
    anggotaKeluarga: [
      { id: 'ak-5-1', nama: 'Joko Prasetyo', nik: '3201011802800005', hubungan: 'Kepala Keluarga', jenisKelamin: 'Laki-laki', tempatLahir: 'Yogyakarta', tanggalLahir: '1980-02-18', agama: 'Islam', pendidikan: 'S1', pekerjaan: 'Karyawan BUMN', statusPernikahan: 'Kawin', golonganDarah: 'B', noHp: '082112345678' },
      { id: 'ak-5-2', nama: 'Endang Sulastri', nik: '3201014505830005', hubungan: 'Istri', jenisKelamin: 'Perempuan', tempatLahir: 'Klaten', tanggalLahir: '1983-05-05', agama: 'Islam', pendidikan: 'S1', pekerjaan: 'Ibu Rumah Tangga', statusPernikahan: 'Kawin', golonganDarah: 'B', noHp: '082112345679' },
      { id: 'ak-5-3', nama: 'Bagas Prasetya', nik: '3201011008080005', hubungan: 'Anak', jenisKelamin: 'Laki-laki', tempatLahir: 'Bogor', tanggalLahir: '2008-08-10', agama: 'Islam', pendidikan: 'SMA/SMK', pekerjaan: 'Pelajar / Mahasiswa', statusPernikahan: 'Belum Kawin', golonganDarah: 'B', noHp: '' },
      { id: 'ak-5-4', nama: 'Sekar Arum', nik: '3201015502130005', hubungan: 'Anak', jenisKelamin: 'Perempuan', tempatLahir: 'Bogor', tanggalLahir: '2013-02-15', agama: 'Islam', pendidikan: 'SMP', pekerjaan: 'Pelajar / Mahasiswa', statusPernikahan: 'Belum Kawin', golonganDarah: 'B', noHp: '' }
    ]
  },
  { 
    id: 'w-6', 
    rt_id: 'rt-1', 
    kodeUnik: '106',
    nama: 'Ibu Ratna Dewi', 
    nik: '3201014509840006',
    noKk: '3201014509840006',
    blok: 'B', 
    noRumah: '02', 
    noHp: '081598765432', 
    email: 'ratnadewi.guru@gmail.com',
    statusHuni: 'Tetap', 
    statusKepemilikan: 'Milik Sendiri',
    jenisKelamin: 'Perempuan',
    agama: 'Islam',
    statusPernikahan: 'Kawin',
    jumlahJiwa: 3, 
    pekerjaan: 'Guru',
    lat: -6.59748,
    lng: 106.76488,
    kontakDaruratNama: 'Surya Pratama',
    kontakDaruratHp: '081598765433',
    kontakDaruratHubungan: 'Suami',
    tglMasuk: '2020-01-10',
    catatan: 'Koordinator Posyandu Balita',
    aktif: true,
    anggotaKeluarga: [
      { id: 'ak-6-1', nama: 'Surya Pratama', nik: '3201011204820006', hubungan: 'Kepala Keluarga', jenisKelamin: 'Laki-laki', tempatLahir: 'Bogor', tanggalLahir: '1982-04-12', agama: 'Islam', pendidikan: 'S1', pekerjaan: 'Karyawan Swasta', statusPernikahan: 'Kawin', golonganDarah: 'O', noHp: '081598765433' },
      { id: 'ak-6-2', nama: 'Ratna Dewi, S.Pd', nik: '3201014509840006', hubungan: 'Istri', jenisKelamin: 'Perempuan', tempatLahir: 'Bogor', tanggalLahir: '1984-09-05', agama: 'Islam', pendidikan: 'S1', pekerjaan: 'Guru', statusPernikahan: 'Kawin', golonganDarah: 'A', noHp: '081598765432' },
      { id: 'ak-6-3', nama: 'Anisa Rahma', nik: '3201016011160006', hubungan: 'Anak', jenisKelamin: 'Perempuan', tempatLahir: 'Bogor', tanggalLahir: '2016-11-20', agama: 'Islam', pendidikan: 'SD', pekerjaan: 'Pelajar / Mahasiswa', statusPernikahan: 'Belum Kawin', golonganDarah: 'A', noHp: '' }
    ]
  },
  { 
    id: 'w-7', 
    rt_id: 'rt-1', 
    kodeUnik: '107',
    nama: 'Eko Wahyudi', 
    nik: '3201012712950007',
    noKk: '3201012712950007',
    blok: 'B', 
    noRumah: '03', 
    noHp: '087812345678', 
    email: 'eko.wahyudi.dev@gmail.com',
    statusHuni: 'Kontrak', 
    statusKepemilikan: 'Sewa / Kontrak',
    jenisKelamin: 'Laki-laki',
    agama: 'Islam',
    statusPernikahan: 'Belum Kawin',
    jumlahJiwa: 2, 
    pekerjaan: 'Programmer',
    lat: -6.59760,
    lng: 106.76500,
    kontakDaruratNama: 'Ibu Maryati (Ibu Kandung)',
    kontakDaruratHp: '087812345679',
    kontakDaruratHubungan: 'Orang Tua',
    tglMasuk: '2024-03-01',
    catatan: 'Pengembang Web & IT',
    aktif: true,
    anggotaKeluarga: [
      { id: 'ak-7-1', nama: 'Eko Wahyudi', nik: '3201012712950007', hubungan: 'Kepala Keluarga', jenisKelamin: 'Laki-laki', tempatLahir: 'Malang', tanggalLahir: '1995-12-27', agama: 'Islam', pendidikan: 'S1', pekerjaan: 'Software Engineer', statusPernikahan: 'Belum Kawin', golonganDarah: 'O', noHp: '087812345678' },
      { id: 'ak-7-2', nama: 'Ibu Maryati', nik: '3201015103680007', hubungan: 'Orang Tua', jenisKelamin: 'Perempuan', tempatLahir: 'Malang', tanggalLahir: '1968-03-11', agama: 'Islam', pendidikan: 'SMA/SMK', pekerjaan: 'Ibu Rumah Tangga', statusPernikahan: 'Cerai Mati', golonganDarah: 'O', noHp: '087812345679' }
    ]
  },
  { 
    id: 'w-8', 
    rt_id: 'rt-1', 
    kodeUnik: '108',
    nama: 'Dedi Kurniawan', 
    nik: '3201010305880008',
    noKk: '3201010305880008',
    blok: 'B', 
    noRumah: '04', 
    noHp: '081312349876', 
    email: 'dedi.kurniawan@kurniateknik.com',
    statusHuni: 'Tetap', 
    statusKepemilikan: 'Milik Sendiri',
    jenisKelamin: 'Laki-laki',
    agama: 'Islam',
    statusPernikahan: 'Kawin',
    jumlahJiwa: 4, 
    pekerjaan: 'Wiraswasta',
    lat: -6.59772,
    lng: 106.76512,
    kontakDaruratNama: 'Fitri Handayani',
    kontakDaruratHp: '081312349877',
    kontakDaruratHubungan: 'Istri',
    tglMasuk: '2018-09-18',
    catatan: 'Bengkel las & konstruksi',
    aktif: true,
    anggotaKeluarga: [
      { id: 'ak-8-1', nama: 'Dedi Kurniawan', nik: '3201010305880008', hubungan: 'Kepala Keluarga', jenisKelamin: 'Laki-laki', tempatLahir: 'Cirebon', tanggalLahir: '1988-05-03', agama: 'Islam', pendidikan: 'SMA/SMK', pekerjaan: 'Wiraswasta', statusPernikahan: 'Kawin', golonganDarah: 'AB', noHp: '081312349876' },
      { id: 'ak-8-2', nama: 'Fitri Handayani', nik: '3201016012900008', hubungan: 'Istri', jenisKelamin: 'Perempuan', tempatLahir: 'Bogor', tanggalLahir: '1990-12-20', agama: 'Islam', pendidikan: 'SMA/SMK', pekerjaan: 'Wiraswasta', statusPernikahan: 'Kawin', golonganDarah: 'B', noHp: '081312349877' },
      { id: 'ak-8-3', nama: 'Rafi Kurnia', nik: '3201011506140008', hubungan: 'Anak', jenisKelamin: 'Laki-laki', tempatLahir: 'Bogor', tanggalLahir: '2014-06-15', agama: 'Islam', pendidikan: 'SD', pekerjaan: 'Pelajar / Mahasiswa', statusPernikahan: 'Belum Kawin', golonganDarah: 'AB', noHp: '' },
      { id: 'ak-8-4', nama: 'Zahra Kurnia', nik: '3201015809180008', hubungan: 'Anak', jenisKelamin: 'Perempuan', tempatLahir: 'Bogor', tanggalLahir: '2018-09-18', agama: 'Islam', pendidikan: 'Belum Sekolah', pekerjaan: 'Belum Bekerja', statusPernikahan: 'Belum Kawin', golonganDarah: 'B', noHp: '' }
    ]
  },

  { 
    id: 'w-9', 
    rt_id: 'rt-2', 
    kodeUnik: '109',
    nama: 'Suryanto Wijaya', 
    nik: '3201011407760009',
    noKk: '3201011407760009',
    blok: 'C', 
    noRumah: '01', 
    noHp: '085212345678', 
    email: 'suryanto.wijaya@consultant.id',
    statusHuni: 'Tetap', 
    statusKepemilikan: 'Milik Sendiri',
    jenisKelamin: 'Laki-laki',
    agama: 'Kristen Protestan',
    statusPernikahan: 'Kawin',
    jumlahJiwa: 5, 
    pekerjaan: 'Konsultan',
    lat: -6.59800,
    lng: 106.76410,
    kontakDaruratNama: 'Grace Natalia',
    kontakDaruratHp: '085212345679',
    kontakDaruratHubungan: 'Istri',
    tglMasuk: '2016-04-12',
    catatan: 'Ketua Seksi Pembangunan RW',
    aktif: true,
    anggotaKeluarga: [
      { id: 'ak-9-1', nama: 'Suryanto Wijaya, S.T', nik: '3201011407760009', hubungan: 'Kepala Keluarga', jenisKelamin: 'Laki-laki', tempatLahir: 'Medan', tanggalLahir: '1976-07-14', agama: 'Kristen Protestan', pendidikan: 'S1', pekerjaan: 'Konsultan', statusPernikahan: 'Kawin', golonganDarah: 'O', noHp: '085212345678' },
      { id: 'ak-9-2', nama: 'Grace Natalia', nik: '3201015212790009', hubungan: 'Istri', jenisKelamin: 'Perempuan', tempatLahir: 'Jakarta', tanggalLahir: '1979-12-12', agama: 'Kristen Protestan', pendidikan: 'S1', pekerjaan: 'Ibu Rumah Tangga', statusPernikahan: 'Kawin', golonganDarah: 'A', noHp: '085212345679' },
      { id: 'ak-9-3', nama: 'Jonathan Wijaya', nik: '3201011005040009', hubungan: 'Anak', jenisKelamin: 'Laki-laki', tempatLahir: 'Bogor', tanggalLahir: '2004-05-10', agama: 'Kristen Protestan', pendidikan: 'S1', pekerjaan: 'Mahasiswa', statusPernikahan: 'Belum Kawin', golonganDarah: 'O', noHp: '' },
      { id: 'ak-9-4', nama: 'Michelle Wijaya', nik: '3201014808080009', hubungan: 'Anak', jenisKelamin: 'Perempuan', tempatLahir: 'Bogor', tanggalLahir: '2008-08-08', agama: 'Kristen Protestan', pendidikan: 'SMA/SMK', pekerjaan: 'Pelajar / Mahasiswa', statusPernikahan: 'Belum Kawin', golonganDarah: 'A', noHp: '' },
      { id: 'ak-9-5', nama: 'Kevin Wijaya', nik: '3201012002140009', hubungan: 'Anak', jenisKelamin: 'Laki-laki', tempatLahir: 'Bogor', tanggalLahir: '2014-02-20', agama: 'Kristen Protestan', pendidikan: 'SD', pekerjaan: 'Pelajar / Mahasiswa', statusPernikahan: 'Belum Kawin', golonganDarah: 'O', noHp: '' }
    ]
  },
  { 
    id: 'w-10', 
    rt_id: 'rt-2', 
    kodeUnik: '110',
    nama: 'Arif Rachman', 
    nik: '3201012901860010',
    noKk: '3201012901860010',
    blok: 'C', 
    noRumah: '02', 
    noHp: '081898765432', 
    email: 'arif.rachman.akuntan@gmail.com',
    statusHuni: 'Tetap', 
    statusKepemilikan: 'Milik Sendiri',
    jenisKelamin: 'Laki-laki',
    agama: 'Islam',
    statusPernikahan: 'Kawin',
    jumlahJiwa: 3, 
    pekerjaan: 'Akuntan',
    lat: -6.59812,
    lng: 106.76422,
    kontakDaruratNama: 'Maya Anggraini',
    kontakDaruratHp: '081898765433',
    kontakDaruratHubungan: 'Istri',
    tglMasuk: '2019-10-05',
    catatan: 'Bendahara Koperasi Warga',
    aktif: true,
    anggotaKeluarga: [
      { id: 'ak-10-1', nama: 'Arif Rachman, S.E, Ak', nik: '3201012901860010', hubungan: 'Kepala Keluarga', jenisKelamin: 'Laki-laki', tempatLahir: 'Padang', tanggalLahir: '1986-01-29', agama: 'Islam', pendidikan: 'S1', pekerjaan: 'Akuntan Publik', statusPernikahan: 'Kawin', golonganDarah: 'B', noHp: '081898765432' },
      { id: 'ak-10-2', nama: 'Maya Anggraini', nik: '3201015006890010', hubungan: 'Istri', jenisKelamin: 'Perempuan', tempatLahir: 'Bogor', tanggalLahir: '1989-06-10', agama: 'Islam', pendidikan: 'S1', pekerjaan: 'Karyawan Swasta', statusPernikahan: 'Kawin', golonganDarah: 'O', noHp: '081898765433' },
      { id: 'ak-10-3', nama: 'Kendra Rachman', nik: '3201011504170010', hubungan: 'Anak', jenisKelamin: 'Laki-laki', tempatLahir: 'Bogor', tanggalLahir: '2017-04-15', agama: 'Islam', pendidikan: 'SD', pekerjaan: 'Pelajar / Mahasiswa', statusPernikahan: 'Belum Kawin', golonganDarah: 'B', noHp: '' }
    ]
  },
  { 
    id: 'w-11', 
    rt_id: 'rt-2', 
    kodeUnik: '111',
    nama: 'Budi Santoso', 
    nik: '3201010811810011',
    noKk: '3201010811810011',
    blok: 'C', 
    noRumah: '03', 
    noHp: '089612345678', 
    email: 'dr.budi.santoso@rsia.com',
    statusHuni: 'Tetap', 
    statusKepemilikan: 'Milik Sendiri',
    jenisKelamin: 'Laki-laki',
    agama: 'Islam',
    statusPernikahan: 'Kawin',
    jumlahJiwa: 4, 
    pekerjaan: 'Dokter',
    lat: -6.59825,
    lng: 106.76435,
    kontakDaruratNama: 'dr. Anita Safitri',
    kontakDaruratHp: '089612345679',
    kontakDaruratHubungan: 'Istri',
    tglMasuk: '2017-01-20',
    catatan: 'Dokter Umum Klinik Warga',
    aktif: true,
    anggotaKeluarga: [
      { id: 'ak-11-1', nama: 'dr. Budi Santoso, Sp.A', nik: '3201010811810011', hubungan: 'Kepala Keluarga', jenisKelamin: 'Laki-laki', tempatLahir: 'Surabaya', tanggalLahir: '1981-11-08', agama: 'Islam', pendidikan: 'Spesialis', pekerjaan: 'Dokter Spesialis', statusPernikahan: 'Kawin', golonganDarah: 'O', noHp: '089612345678' },
      { id: 'ak-11-2', nama: 'dr. Anita Safitri', nik: '3201014903840011', hubungan: 'Istri', jenisKelamin: 'Perempuan', tempatLahir: 'Malang', tanggalLahir: '1984-03-09', agama: 'Islam', pendidikan: 'S1 Profesi', pekerjaan: 'Dokter Gigi', statusPernikahan: 'Kawin', golonganDarah: 'A', noHp: '089612345679' },
      { id: 'ak-11-3', nama: 'Arya Santoso', nik: '3201011207110011', hubungan: 'Anak', jenisKelamin: 'Laki-laki', tempatLahir: 'Bogor', tanggalLahir: '2011-07-12', agama: 'Islam', pendidikan: 'SMP', pekerjaan: 'Pelajar / Mahasiswa', statusPernikahan: 'Belum Kawin', golonganDarah: 'O', noHp: '' },
      { id: 'ak-11-4', nama: 'Tiara Santoso', nik: '3201015501160011', hubungan: 'Anak', jenisKelamin: 'Perempuan', tempatLahir: 'Bogor', tanggalLahir: '2016-01-15', agama: 'Islam', pendidikan: 'SD', pekerjaan: 'Pelajar / Mahasiswa', statusPernikahan: 'Belum Kawin', golonganDarah: 'A', noHp: '' }
    ]
  },
  { 
    id: 'w-12', 
    rt_id: 'rt-2', 
    kodeUnik: '112',
    nama: 'Fajar Nugroho', 
    nik: '3201011904970012',
    noKk: '3201011904970012',
    blok: 'C', 
    noRumah: '04', 
    noHp: '082212345678', 
    email: 'fajar.nugroho@fiber.net',
    statusHuni: 'Kontrak', 
    statusKepemilikan: 'Sewa / Kontrak',
    jenisKelamin: 'Laki-laki',
    agama: 'Islam',
    statusPernikahan: 'Belum Kawin',
    jumlahJiwa: 1, 
    pekerjaan: 'Teknisi IT',
    lat: -6.59838,
    lng: 106.76448,
    kontakDaruratNama: 'Slamet Riadi (Ayah)',
    kontakDaruratHp: '082212345679',
    kontakDaruratHubungan: 'Orang Tua',
    tglMasuk: '2024-01-15',
    catatan: 'PIC Jaringan CCTV Lingkungan',
    aktif: true,
    anggotaKeluarga: [
      { id: 'ak-12-1', nama: 'Fajar Nugroho', nik: '3201011904970012', hubungan: 'Kepala Keluarga', jenisKelamin: 'Laki-laki', tempatLahir: 'Purwokerto', tanggalLahir: '1997-04-19', agama: 'Islam', pendidikan: 'D3', pekerjaan: 'Network Engineer', statusPernikahan: 'Belum Kawin', golonganDarah: 'B', noHp: '082212345678' }
    ]
  },

  { 
    id: 'w-13', 
    rt_id: 'rt-3', 
    kodeUnik: '113',
    nama: 'Gita Maharani', 
    nik: '3201015606900013',
    noKk: '3201015606900013',
    blok: 'D', 
    noRumah: '01', 
    noHp: '081387654321', 
    email: 'gita.maharani.arch@studio.id',
    statusHuni: 'Tetap', 
    statusKepemilikan: 'Milik Sendiri',
    jenisKelamin: 'Perempuan',
    agama: 'Hindu',
    statusPernikahan: 'Kawin',
    jumlahJiwa: 3, 
    pekerjaan: 'Arsitek',
    lat: -6.59820,
    lng: 106.76490,
    kontakDaruratNama: 'I Made Bagus',
    kontakDaruratHp: '081387654322',
    kontakDaruratHubungan: 'Suami',
    tglMasuk: '2021-07-10',
    catatan: 'Perancang Taman Fasum RW',
    aktif: true,
    anggotaKeluarga: [
      { id: 'ak-13-1', nama: 'I Made Bagus, S.T', nik: '3201011002880013', hubungan: 'Kepala Keluarga', jenisKelamin: 'Laki-laki', tempatLahir: 'Denpasar', tanggalLahir: '1988-02-10', agama: 'Hindu', pendidikan: 'S1', pekerjaan: 'Civil Engineer', statusPernikahan: 'Kawin', golonganDarah: 'O', noHp: '081387654322' },
      { id: 'ak-13-2', nama: 'Gita Maharani, IAI', nik: '3201015606900013', hubungan: 'Istri', jenisKelamin: 'Perempuan', tempatLahir: 'Bogor', tanggalLahir: '1990-06-16', agama: 'Hindu', pendidikan: 'S1', pekerjaan: 'Arsitek', statusPernikahan: 'Kawin', golonganDarah: 'A', noHp: '081387654321' },
      { id: 'ak-13-3', nama: 'Ni Wayan Kania', nik: '3201016209190013', hubungan: 'Anak', jenisKelamin: 'Perempuan', tempatLahir: 'Bogor', tanggalLahir: '2019-09-22', agama: 'Hindu', pendidikan: 'Belum Sekolah', pekerjaan: 'Belum Bekerja', statusPernikahan: 'Belum Kawin', golonganDarah: 'A', noHp: '' }
    ]
  },
  { 
    id: 'w-14', 
    rt_id: 'rt-3', 
    kodeUnik: '114',
    nama: 'Herman Susilo', 
    nik: '3201012309830014',
    noKk: '3201012309830014',
    blok: 'D', 
    noRumah: '02', 
    noHp: '085612345678', 
    email: 'herman.susilo@logistik.com',
    statusHuni: 'Tetap', 
    statusKepemilikan: 'Milik Sendiri',
    jenisKelamin: 'Laki-laki',
    agama: 'Katolik',
    statusPernikahan: 'Kawin',
    jumlahJiwa: 4, 
    pekerjaan: 'Manajer',
    lat: -6.59832,
    lng: 106.76505,
    kontakDaruratNama: 'Theresia Maria',
    kontakDaruratHp: '085612345679',
    kontakDaruratHubungan: 'Istri',
    tglMasuk: '2018-12-01',
    catatan: 'Pengurus Seksi Olahraga RT 03',
    aktif: true,
    anggotaKeluarga: [
      { id: 'ak-14-1', nama: 'Herman Susilo', nik: '3201012309830014', hubungan: 'Kepala Keluarga', jenisKelamin: 'Laki-laki', tempatLahir: 'Semarang', tanggalLahir: '1983-09-23', agama: 'Katolik', pendidikan: 'S1', pekerjaan: 'Manajer Operasional', statusPernikahan: 'Kawin', golonganDarah: 'AB', noHp: '085612345678' },
      { id: 'ak-14-2', nama: 'Theresia Maria', nik: '3201014810850014', hubungan: 'Istri', jenisKelamin: 'Perempuan', tempatLahir: 'Jakarta', tanggalLahir: '1985-10-08', agama: 'Katolik', pendidikan: 'S1', pekerjaan: 'Guru', statusPernikahan: 'Kawin', golonganDarah: 'B', noHp: '085612345679' },
      { id: 'ak-14-3', nama: 'Gabriel Susilo', nik: '3201011403120014', hubungan: 'Anak', jenisKelamin: 'Laki-laki', tempatLahir: 'Bogor', tanggalLahir: '2012-03-14', agama: 'Katolik', pendidikan: 'SMP', pekerjaan: 'Pelajar / Mahasiswa', statusPernikahan: 'Belum Kawin', golonganDarah: 'B', noHp: '' },
      { id: 'ak-14-4', nama: 'Clara Susilo', nik: '3201015607160014', hubungan: 'Anak', jenisKelamin: 'Perempuan', tempatLahir: 'Bogor', tanggalLahir: '2016-07-16', agama: 'Katolik', pendidikan: 'SD', pekerjaan: 'Pelajar / Mahasiswa', statusPernikahan: 'Belum Kawin', golonganDarah: 'AB', noHp: '' }
    ]
  },
  { 
    id: 'w-15', 
    rt_id: 'rt-3', 
    kodeUnik: '115',
    nama: 'Indra Gunawan', 
    nik: '3201011608920015',
    noKk: '3201011608920015',
    blok: 'D', 
    noRumah: '03', 
    noHp: '087798765432', 
    email: 'indra.gunawan.kuliner@gmail.com',
    statusHuni: 'Tetap', 
    statusKepemilikan: 'Milik Sendiri',
    jenisKelamin: 'Laki-laki',
    agama: 'Islam',
    statusPernikahan: 'Kawin',
    jumlahJiwa: 2, 
    pekerjaan: 'Wiraswasta',
    lat: -6.59845,
    lng: 106.76518,
    kontakDaruratNama: 'Novita Sari',
    kontakDaruratHp: '087798765433',
    kontakDaruratHubungan: 'Istri',
    tglMasuk: '2022-04-18',
    catatan: 'Usaha Kuliner & Katering Warga',
    aktif: true,
    anggotaKeluarga: [
      { id: 'ak-15-1', nama: 'Indra Gunawan', nik: '3201011608920015', hubungan: 'Kepala Keluarga', jenisKelamin: 'Laki-laki', tempatLahir: 'Bogor', tanggalLahir: '1992-08-16', agama: 'Islam', pendidikan: 'D3', pekerjaan: 'Pengusaha Kuliner', statusPernikahan: 'Kawin', golonganDarah: 'O', noHp: '087798765432' },
      { id: 'ak-15-2', nama: 'Novita Sari', nik: '3201015104940015', hubungan: 'Istri', jenisKelamin: 'Perempuan', tempatLahir: 'Bandung', tanggalLahir: '1994-04-11', agama: 'Islam', pendidikan: 'D3', pekerjaan: 'Wiraswasta', statusPernikahan: 'Kawin', golonganDarah: 'A', noHp: '087798765433' }
    ]
  },
  { 
    id: 'w-16', 
    rt_id: 'rt-3', 
    kodeUnik: '116',
    nama: 'Agus Salim', 
    nik: '3201010503750016',
    noKk: '3201010503750016',
    blok: 'D', 
    noRumah: '04', 
    noHp: '081298761234', 
    email: 'agus.salim.pemda@bogorkab.go.id',
    statusHuni: 'Tetap', 
    statusKepemilikan: 'Milik Sendiri',
    jenisKelamin: 'Laki-laki',
    agama: 'Islam',
    statusPernikahan: 'Kawin',
    jumlahJiwa: 5, 
    pekerjaan: 'PNS',
    lat: -6.59858,
    lng: 106.76530,
    kontakDaruratNama: 'Hj. Zubaedah',
    kontakDaruratHp: '081298761235',
    kontakDaruratHubungan: 'Istri',
    tglMasuk: '2015-08-17',
    catatan: 'Ketua RW 15',
    aktif: true,
    anggotaKeluarga: [
      { id: 'ak-16-1', nama: 'Drs. H. Agus Salim, M.Si', nik: '3201010503750016', hubungan: 'Kepala Keluarga', jenisKelamin: 'Laki-laki', tempatLahir: 'Bogor', tanggalLahir: '1975-03-05', agama: 'Islam', pendidikan: 'S2', pekerjaan: 'PNS Pemda', statusPernikahan: 'Kawin', golonganDarah: 'O', noHp: '081298761234' },
      { id: 'ak-16-2', nama: 'Hj. Zubaedah', nik: '3201014809780016', hubungan: 'Istri', jenisKelamin: 'Perempuan', tempatLahir: 'Bogor', tanggalLahir: '1978-09-08', agama: 'Islam', pendidikan: 'S1', pekerjaan: 'Ibu Rumah Tangga', statusPernikahan: 'Kawin', golonganDarah: 'B', noHp: '081298761235' },
      { id: 'ak-16-3', nama: 'Rahmat Hidayatullah', nik: '3201011111020016', hubungan: 'Anak', jenisKelamin: 'Laki-laki', tempatLahir: 'Bogor', tanggalLahir: '2002-11-11', agama: 'Islam', pendidikan: 'S1', pekerjaan: 'Mahasiswa', statusPernikahan: 'Belum Kawin', golonganDarah: 'O', noHp: '' },
      { id: 'ak-16-4', nama: 'Nurul Azizah', nik: '3201015605060016', hubungan: 'Anak', jenisKelamin: 'Perempuan', tempatLahir: 'Bogor', tanggalLahir: '2006-05-16', agama: 'Islam', pendidikan: 'SMA/SMK', pekerjaan: 'Pelajar / Mahasiswa', statusPernikahan: 'Belum Kawin', golonganDarah: 'B', noHp: '' },
      { id: 'ak-16-5', nama: 'Muhammad Ilham', nik: '3201012010120016', hubungan: 'Anak', jenisKelamin: 'Laki-laki', tempatLahir: 'Bogor', tanggalLahir: '2012-10-20', agama: 'Islam', pendidikan: 'SMP', pekerjaan: 'Pelajar / Mahasiswa', statusPernikahan: 'Belum Kawin', golonganDarah: 'O', noHp: '' }
    ]
  }
]

// Standar total iuran default per warga: 35k + 50k + 25k + 10k = 120k
export const INITIAL_TAGIHAN = [
  // Tagihan September 2026 (Bulan berjalan)
  {
    id: 'tag-2026-09-w-1',
    wargaId: 'w-1',
    bulan: 9,
    tahun: 2026,
    total: 120000,
    rincian: [
      { nama: 'Iuran Kebersihan & Sampah', nominal: 35000 },
      { nama: 'Iuran Keamanan & Portal', nominal: 50000 },
      { nama: 'Kas Pemeliharaan & Fasum', nominal: 25000 },
      { nama: 'Dana Sosial & Kematian', nominal: 10000 }
    ],
    status: 'Lunas',
    tanggalBayar: '2026-09-05',
    metodeBayar: 'Transfer BCA',
    noKwitansi: 'KW-202609-001',
    catatan: 'Dibayar via m-Banking'
  },
  {
    id: 'tag-2026-09-w-2',
    wargaId: 'w-2',
    bulan: 9,
    tahun: 2026,
    total: 120000,
    rincian: [
      { nama: 'Iuran Kebersihan & Sampah', nominal: 35000 },
      { nama: 'Iuran Keamanan & Portal', nominal: 50000 },
      { nama: 'Kas Pemeliharaan & Fasum', nominal: 25000 },
      { nama: 'Dana Sosial & Kematian', nominal: 10000 }
    ],
    status: 'Lunas',
    tanggalBayar: '2026-09-06',
    metodeBayar: 'Tunai',
    noKwitansi: 'KW-202609-002',
    catatan: 'Titip ke Pak RT saat ronda'
  },
  {
    id: 'tag-2026-09-w-3',
    wargaId: 'w-3',
    bulan: 9,
    tahun: 2026,
    total: 120000,
    rincian: [
      { nama: 'Iuran Kebersihan & Sampah', nominal: 35000 },
      { nama: 'Iuran Keamanan & Portal', nominal: 50000 },
      { nama: 'Kas Pemeliharaan & Fasum', nominal: 25000 },
      { nama: 'Dana Sosial & Kematian', nominal: 10000 }
    ],
    status: 'Belum Lunas',
    tanggalBayar: null,
    metodeBayar: null,
    noKwitansi: null,
    catatan: ''
  },
  {
    id: 'tag-2026-09-w-4',
    wargaId: 'w-4',
    bulan: 9,
    tahun: 2026,
    total: 120000,
    rincian: [
      { nama: 'Iuran Kebersihan & Sampah', nominal: 35000 },
      { nama: 'Iuran Keamanan & Portal', nominal: 50000 },
      { nama: 'Kas Pemeliharaan & Fasum', nominal: 25000 },
      { nama: 'Dana Sosial & Kematian', nominal: 10000 }
    ],
    status: 'Lunas',
    tanggalBayar: '2026-09-10',
    metodeBayar: 'QRIS',
    noKwitansi: 'KW-202609-003',
    catatan: 'Scan QRIS Bendahara'
  },
  {
    id: 'tag-2026-09-w-5',
    wargaId: 'w-5',
    bulan: 9,
    tahun: 2026,
    total: 120000,
    rincian: [
      { nama: 'Iuran Kebersihan & Sampah', nominal: 35000 },
      { nama: 'Iuran Keamanan & Portal', nominal: 50000 },
      { nama: 'Kas Pemeliharaan & Fasum', nominal: 25000 },
      { nama: 'Dana Sosial & Kematian', nominal: 10000 }
    ],
    status: 'Lunas',
    tanggalBayar: '2026-09-08',
    metodeBayar: 'Transfer BCA',
    noKwitansi: 'KW-202609-004',
    catatan: ''
  },
  {
    id: 'tag-2026-09-w-6',
    wargaId: 'w-6',
    bulan: 9,
    tahun: 2026,
    total: 120000,
    rincian: [
      { nama: 'Iuran Kebersihan & Sampah', nominal: 35000 },
      { nama: 'Iuran Keamanan & Portal', nominal: 50000 },
      { nama: 'Kas Pemeliharaan & Fasum', nominal: 25000 },
      { nama: 'Dana Sosial & Kematian', nominal: 10000 }
    ],
    status: 'Belum Lunas',
    tanggalBayar: null,
    metodeBayar: null,
    noKwitansi: null,
    catatan: ''
  },
  {
    id: 'tag-2026-09-w-7',
    wargaId: 'w-7',
    bulan: 9,
    tahun: 2026,
    total: 120000,
    rincian: [
      { nama: 'Iuran Kebersihan & Sampah', nominal: 35000 },
      { nama: 'Iuran Keamanan & Portal', nominal: 50000 },
      { nama: 'Kas Pemeliharaan & Fasum', nominal: 25000 },
      { nama: 'Dana Sosial & Kematian', nominal: 10000 }
    ],
    status: 'Belum Lunas',
    tanggalBayar: null,
    metodeBayar: null,
    noKwitansi: null,
    catatan: ''
  },
  {
    id: 'tag-2026-09-w-8',
    wargaId: 'w-8',
    bulan: 9,
    tahun: 2026,
    total: 120000,
    rincian: [
      { nama: 'Iuran Kebersihan & Sampah', nominal: 35000 },
      { nama: 'Iuran Keamanan & Portal', nominal: 50000 },
      { nama: 'Kas Pemeliharaan & Fasum', nominal: 25000 },
      { nama: 'Dana Sosial & Kematian', nominal: 10000 }
    ],
    status: 'Lunas',
    tanggalBayar: '2026-09-12',
    metodeBayar: 'Tunai',
    noKwitansi: 'KW-202609-005',
    catatan: ''
  },
  {
    id: 'tag-2026-09-w-9',
    wargaId: 'w-9',
    bulan: 9,
    tahun: 2026,
    total: 120000,
    rincian: [
      { nama: 'Iuran Kebersihan & Sampah', nominal: 35000 },
      { nama: 'Iuran Keamanan & Portal', nominal: 50000 },
      { nama: 'Kas Pemeliharaan & Fasum', nominal: 25000 },
      { nama: 'Dana Sosial & Kematian', nominal: 10000 }
    ],
    status: 'Lunas',
    tanggalBayar: '2026-09-04',
    metodeBayar: 'QRIS',
    noKwitansi: 'KW-202609-006',
    catatan: ''
  },
  {
    id: 'tag-2026-09-w-10',
    wargaId: 'w-10',
    bulan: 9,
    tahun: 2026,
    total: 120000,
    rincian: [
      { nama: 'Iuran Kebersihan & Sampah', nominal: 35000 },
      { nama: 'Iuran Keamanan & Portal', nominal: 50000 },
      { nama: 'Kas Pemeliharaan & Fasum', nominal: 25000 },
      { nama: 'Dana Sosial & Kematian', nominal: 10000 }
    ],
    status: 'Belum Lunas',
    tanggalBayar: null,
    metodeBayar: null,
    noKwitansi: null,
    catatan: ''
  },
  {
    id: 'tag-2026-09-w-11',
    wargaId: 'w-11',
    bulan: 9,
    tahun: 2026,
    total: 120000,
    rincian: [
      { nama: 'Iuran Kebersihan & Sampah', nominal: 35000 },
      { nama: 'Iuran Keamanan & Portal', nominal: 50000 },
      { nama: 'Kas Pemeliharaan & Fasum', nominal: 25000 },
      { nama: 'Dana Sosial & Kematian', nominal: 10000 }
    ],
    status: 'Lunas',
    tanggalBayar: '2026-09-09',
    metodeBayar: 'Transfer BCA',
    noKwitansi: 'KW-202609-007',
    catatan: ''
  },
  {
    id: 'tag-2026-09-w-12',
    wargaId: 'w-12',
    bulan: 9,
    tahun: 2026,
    total: 120000,
    rincian: [
      { nama: 'Iuran Kebersihan & Sampah', nominal: 35000 },
      { nama: 'Iuran Keamanan & Portal', nominal: 50000 },
      { nama: 'Kas Pemeliharaan & Fasum', nominal: 25000 },
      { nama: 'Dana Sosial & Kematian', nominal: 10000 }
    ],
    status: 'Belum Lunas',
    tanggalBayar: null,
    metodeBayar: null,
    noKwitansi: null,
    catatan: ''
  },
  {
    id: 'tag-2026-09-w-13',
    wargaId: 'w-13',
    bulan: 9,
    tahun: 2026,
    total: 120000,
    rincian: [
      { nama: 'Iuran Kebersihan & Sampah', nominal: 35000 },
      { nama: 'Iuran Keamanan & Portal', nominal: 50000 },
      { nama: 'Kas Pemeliharaan & Fasum', nominal: 25000 },
      { nama: 'Dana Sosial & Kematian', nominal: 10000 }
    ],
    status: 'Lunas',
    tanggalBayar: '2026-09-11',
    metodeBayar: 'Tunai',
    noKwitansi: 'KW-202609-008',
    catatan: ''
  },
  {
    id: 'tag-2026-09-w-14',
    wargaId: 'w-14',
    bulan: 9,
    tahun: 2026,
    total: 120000,
    rincian: [
      { nama: 'Iuran Kebersihan & Sampah', nominal: 35000 },
      { nama: 'Iuran Keamanan & Portal', nominal: 50000 },
      { nama: 'Kas Pemeliharaan & Fasum', nominal: 25000 },
      { nama: 'Dana Sosial & Kematian', nominal: 10000 }
    ],
    status: 'Belum Lunas',
    tanggalBayar: null,
    metodeBayar: null,
    noKwitansi: null,
    catatan: ''
  },
  {
    id: 'tag-2026-09-w-15',
    wargaId: 'w-15',
    bulan: 9,
    tahun: 2026,
    total: 120000,
    rincian: [
      { nama: 'Iuran Kebersihan & Sampah', nominal: 35000 },
      { nama: 'Iuran Keamanan & Portal', nominal: 50000 },
      { nama: 'Kas Pemeliharaan & Fasum', nominal: 25000 },
      { nama: 'Dana Sosial & Kematian', nominal: 10000 }
    ],
    status: 'Lunas',
    tanggalBayar: '2026-09-03',
    metodeBayar: 'QRIS',
    noKwitansi: 'KW-202609-009',
    catatan: ''
  },
  {
    id: 'tag-2026-09-w-16',
    wargaId: 'w-16',
    bulan: 9,
    tahun: 2026,
    total: 120000,
    rincian: [
      { nama: 'Iuran Kebersihan & Sampah', nominal: 35000 },
      { nama: 'Iuran Keamanan & Portal', nominal: 50000 },
      { nama: 'Kas Pemeliharaan & Fasum', nominal: 25000 },
      { nama: 'Dana Sosial & Kematian', nominal: 10000 }
    ],
    status: 'Belum Lunas',
    tanggalBayar: null,
    metodeBayar: null,
    noKwitansi: null,
    catatan: ''
  }
]

export const INITIAL_KAS = [
  // --- KAS RW (Terpusat) ---
  {
    id: 'kas-rw-1',
    tanggal: '2026-09-01',
    tipe: 'Masuk',
    kategori: 'Saldo Awal',
    deskripsi: 'Saldo kas awal RW 15 periode September 2026',
    nominal: 7500000,
    scope: 'rw',
    rt_id: null
  },
  {
    id: 'kas-rw-2',
    tanggal: '2026-09-03',
    tipe: 'Keluar',
    kategori: 'Keamanan',
    deskripsi: 'Honor Koordinator Satpam Gerbang Utama RW 15',
    nominal: 1800000,
    scope: 'rw',
    rt_id: null
  },
  {
    id: 'kas-rw-3',
    tanggal: '2026-09-07',
    tipe: 'Keluar',
    kategori: 'Pemeliharaan',
    deskripsi: 'Perbaikan portal otomatis & lampu gerbang utama RW',
    nominal: 650000,
    scope: 'rw',
    rt_id: null
  },
  {
    id: 'kas-rw-4',
    tanggal: '2026-09-10',
    tipe: 'Masuk',
    kategori: 'Iuran Warga',
    deskripsi: 'Iuran kas gabungan RW periode awal September',
    nominal: 1200000,
    scope: 'rw',
    rt_id: null
  },

  // --- KAS RT 01 ---
  {
    id: 'kas-rt1-1',
    tanggal: '2026-09-01',
    tipe: 'Masuk',
    kategori: 'Saldo Awal',
    deskripsi: 'Saldo kas awal RT 01 bulan September 2026',
    nominal: 3200000,
    scope: 'rt',
    rt_id: 'rt-1'
  },
  {
    id: 'kas-rt1-2',
    tanggal: '2026-09-04',
    tipe: 'Keluar',
    kategori: 'Kebersihan',
    deskripsi: 'Operasional retribusi sampah lingkungan Blok A & B',
    nominal: 450000,
    scope: 'rt',
    rt_id: 'rt-1'
  },
  {
    id: 'kas-rt1-3',
    tanggal: '2026-09-06',
    tipe: 'Keluar',
    kategori: 'Pemeliharaan',
    deskripsi: 'Ganti 3 bohlam LED tiang jalan Blok A & B RT 01',
    nominal: 135000,
    scope: 'rt',
    rt_id: 'rt-1'
  },
  {
    id: 'kas-rt1-4',
    tanggal: '2026-09-08',
    tipe: 'Masuk',
    kategori: 'Iuran Warga',
    deskripsi: 'Penerimaan IPL rutin warga RT 01 gelombang 1',
    nominal: 600000,
    scope: 'rt',
    rt_id: 'rt-1'
  },

  // --- KAS RT 02 ---
  {
    id: 'kas-rt2-1',
    tanggal: '2026-09-01',
    tipe: 'Masuk',
    kategori: 'Saldo Awal',
    deskripsi: 'Saldo kas awal RT 02 bulan September 2026',
    nominal: 2400000,
    scope: 'rt',
    rt_id: 'rt-2'
  },
  {
    id: 'kas-rt2-2',
    tanggal: '2026-09-05',
    tipe: 'Keluar',
    kategori: 'Kebersihan',
    deskripsi: 'Pengadaan sapu lidi & tempat sampah komunal Blok C',
    nominal: 220000,
    scope: 'rt',
    rt_id: 'rt-2'
  },
  {
    id: 'kas-rt2-3',
    tanggal: '2026-09-09',
    tipe: 'Masuk',
    kategori: 'Iuran Warga',
    deskripsi: 'Penerimaan IPL rutin warga RT 02',
    nominal: 480000,
    scope: 'rt',
    rt_id: 'rt-2'
  },

  // --- KAS RT 03 ---
  {
    id: 'kas-rt3-1',
    tanggal: '2026-09-01',
    tipe: 'Masuk',
    kategori: 'Saldo Awal',
    deskripsi: 'Saldo kas awal RT 03 bulan September 2026',
    nominal: 2800000,
    scope: 'rt',
    rt_id: 'rt-3'
  },
  {
    id: 'kas-rt3-2',
    tanggal: '2026-09-06',
    tipe: 'Keluar',
    kategori: 'Pemeliharaan',
    deskripsi: 'Pembersihan selokan & taman Blok D RT 03',
    nominal: 300000,
    scope: 'rt',
    rt_id: 'rt-3'
  },
  {
    id: 'kas-rt3-3',
    tanggal: '2026-09-11',
    tipe: 'Masuk',
    kategori: 'Iuran Warga',
    deskripsi: 'Penerimaan IPL rutin warga RT 03',
    nominal: 480000,
    scope: 'rt',
    rt_id: 'rt-3'
  }
]

export const INITIAL_EVENTS = [
  {
    id: 'evt-17an-2026',
    judul: 'Semarak Peringatan HUT RI ke-81 Tingkat RW 15',
    kategori: 'Agustusan',
    scope: 'rw',
    rt_id: null,
    targetType: 'all',
    targetWargaId: null,
    tipePengumuman: 'iuran',
    nominalPerKK: 50000,
    batasTanggal: '2026-08-14',
    deskripsi: 'Panggung gembira malam tirakatan, pameran UMKM, jalan santai akbar seluruh warga RW 15 & pembagian doorprize.',
    posterUrl: null,
    tanggalDibuat: '2026-08-01',
    aktif: true
  },
  {
    id: 'evt-lomba-rt1',
    judul: 'Lomba Anak & Senam Sehat Khusus Warga RT 01',
    kategori: 'Lomba',
    scope: 'rt',
    rt_id: 'rt-1',
    targetType: 'all',
    targetWargaId: null,
    tipePengumuman: 'iuran',
    nominalPerKK: 35000,
    batasTanggal: '2026-08-17',
    deskripsi: 'Lomba mewarnai anak, makan kerupuk, balap kelereng, dan senam sehat Minggu pagi khusus keluarga RT 01.',
    posterUrl: null,
    tanggalDibuat: '2026-08-03',
    aktif: true
  },
  {
    id: 'evt-personal-bambang',
    judul: 'Pemberitahuan Khusus: Konfirmasi Data Kartu Keluarga & Ronda',
    kategori: 'Sosial',
    scope: 'rt',
    rt_id: 'rt-1',
    targetType: 'personal',
    targetWargaId: 'w-1',
    tipePengumuman: 'info',
    nominalPerKK: 0,
    batasTanggal: '2026-09-30',
    deskripsi: 'Yth. Bpk Bambang Sutrisno (Blok A-01), mohon kesediaannya mengirimkan foto KK terbaru untuk update data SIPL dan jadwal ronda malam Sabtu.',
    posterUrl: null,
    tanggalDibuat: '2026-09-15',
    aktif: true
  },
  {
    id: 'evt-pos-ronda',
    judul: 'Iuran Pengadaan CCTV & Renovasi Pos Keamanan RW',
    kategori: 'Fasilitas',
    scope: 'rw',
    rt_id: null,
    targetType: 'all',
    targetWargaId: null,
    tipePengumuman: 'iuran',
    nominalPerKK: 75000,
    batasTanggal: '2026-09-30',
    deskripsi: 'Pemasangan 4 titik kamera CCTV online di gerbang utama dan jalan poros lingkungan RW demi keamanan 24 jam.',
    posterUrl: null,
    tanggalDibuat: '2026-09-01',
    aktif: true
  }
]

export const INITIAL_TAGIHAN_EVENTS = [
  {
    id: 'tevt-17an-w-1',
    eventId: 'evt-17an-2026',
    wargaId: 'w-1',
    nominal: 50000,
    status: 'Lunas',
    tanggalBayar: '2026-08-05',
    metodeBayar: 'Transfer BCA',
    noKwitansi: 'KW-EVT-17AN-001',
    catatan: ''
  },
  {
    id: 'tevt-17an-w-2',
    eventId: 'evt-17an-2026',
    wargaId: 'w-2',
    nominal: 50000,
    status: 'Lunas',
    tanggalBayar: '2026-08-07',
    metodeBayar: 'Tunai',
    noKwitansi: 'KW-EVT-17AN-002',
    catatan: ''
  },
  {
    id: 'tevt-17an-w-3',
    eventId: 'evt-17an-2026',
    wargaId: 'w-3',
    nominal: 50000,
    status: 'Belum Lunas',
    tanggalBayar: null,
    metodeBayar: null,
    noKwitansi: null,
    catatan: ''
  },
  {
    id: 'tevt-17an-w-4',
    eventId: 'evt-17an-2026',
    wargaId: 'w-4',
    nominal: 50000,
    status: 'Lunas',
    tanggalBayar: '2026-08-10',
    metodeBayar: 'QRIS',
    noKwitansi: 'KW-EVT-17AN-003',
    catatan: ''
  },
  {
    id: 'tevt-pos-w-1',
    eventId: 'evt-pos-ronda',
    wargaId: 'w-1',
    nominal: 75000,
    status: 'Lunas',
    tanggalBayar: '2026-09-08',
    metodeBayar: 'Transfer BCA',
    noKwitansi: 'KW-EVT-CCTV-001',
    catatan: ''
  },
  {
    id: 'tevt-pos-w-2',
    eventId: 'evt-pos-ronda',
    wargaId: 'w-2',
    nominal: 75000,
    status: 'Belum Lunas',
    tanggalBayar: null,
    metodeBayar: null,
    noKwitansi: null,
    catatan: ''
  },
  {
    id: 'tevt-pos-w-3',
    eventId: 'evt-pos-ronda',
    wargaId: 'w-3',
    nominal: 75000,
    status: 'Belum Lunas',
    tanggalBayar: null,
    metodeBayar: null,
    noKwitansi: null,
    catatan: ''
  },
  {
    id: 'tevt-lomba-w-1',
    eventId: 'evt-lomba-rt1',
    wargaId: 'w-1',
    nominal: 35000,
    status: 'Lunas',
    tanggalBayar: '2026-08-06',
    metodeBayar: 'QRIS',
    noKwitansi: 'KW-EVT-RT1-001',
    catatan: ''
  },
  {
    id: 'tevt-lomba-w-2',
    eventId: 'evt-lomba-rt1',
    wargaId: 'w-2',
    nominal: 35000,
    status: 'Lunas',
    tanggalBayar: '2026-08-08',
    metodeBayar: 'Tunai',
    noKwitansi: 'KW-EVT-RT1-002',
    catatan: ''
  },
  {
    id: 'tevt-lomba-w-3',
    eventId: 'evt-lomba-rt1',
    wargaId: 'w-3',
    nominal: 35000,
    status: 'Belum Lunas',
    tanggalBayar: null,
    metodeBayar: null,
    noKwitansi: null,
    catatan: ''
  },
  {
    id: 'tevt-lomba-w-4',
    eventId: 'evt-lomba-rt1',
    wargaId: 'w-4',
    nominal: 35000,
    status: 'Lunas',
    tanggalBayar: '2026-08-09',
    metodeBayar: 'Transfer BCA',
    noKwitansi: 'KW-EVT-RT1-003',
    catatan: ''
  }
]

// Data Layanan Pengaduan & Lapor Masalah Warga
export const INITIAL_PENGADUAN = [
  {
    id: 'lapor-001',
    wargaId: 'w-1',
    rt_id: 'rt-1',
    judul: 'Lampu Penerangan Jalan Mati di Depan Blok A-02',
    kategori: 'Fasilitas & Lampu Jalan',
    lokasi: 'Jalan Utama Blok A (depan unit A-02)',
    deskripsi: 'Lampu PJU sudah 3 malam padam sehingga jalanan sangat gelap saat malam hari. Mohon dibantu pengecekan fitting atau bohlamnya.',
    status: 'Sedang Ditangani', // 'Menunggu Tindak Lanjut' | 'Sedang Ditangani' | 'Selesai' | 'Ditolak'
    tanggal: '2026-09-18',
    fotoUrl: '',
    tanggapan: 'Teknisi fasilitas RT sudah dihubungi, penggantian bohlam LED 50W dijadwalkan besok siang (Bpk. Syahdan).',
    tanggalTanggapan: '2026-09-19'
  },
  {
    id: 'lapor-002',
    wargaId: 'w-3',
    rt_id: 'rt-1',
    judul: 'Sampah Rumah Tangga Belum Diangkut',
    kategori: 'Kebersihan & Sampah',
    lokasi: 'Gang Blok A No 01-04',
    deskripsi: 'Jadwal hari Rabu truk sampah tidak melintas sehingga tong sampah warga mulai penuh.',
    status: 'Selesai',
    tanggal: '2026-09-14',
    fotoUrl: '',
    tanggapan: 'Sudah dikoordinasikan dengan dinas kebersihan, armada pengganti sudah mengangkut sampah per hari Kamis pagi.',
    tanggalTanggapan: '2026-09-15'
  },
  {
    id: 'lapor-003',
    wargaId: 'w-5',
    rt_id: 'rt-1',
    judul: 'Saluran Air / Selokan Tersumbat Daun Kering',
    kategori: 'Saluran Air & Drainase',
    lokasi: 'Tikungan Blok B',
    deskripsi: 'Air agak menggenang saat hujan lebat kemarin sore akibat tumpukan ranting dan sampah daun.',
    status: 'Menunggu Tindak Lanjut',
    tanggal: '2026-09-20',
    fotoUrl: '',
    tanggapan: '',
    tanggalTanggapan: null
  }
]

// Data Permohonan Surat Pengantar RT/RW Online
export const INITIAL_SURAT_PENGANTAR = [
  {
    id: 'srt-2026-001',
    noSurat: '470/012/RT.01-RW.15/IX/2026',
    wargaId: 'w-1',
    rt_id: 'rt-1',
    jenisSurat: 'Surat Pengantar KTP / KK',
    keperluan: 'Pembuatan Kartu Identitas Anak (KIA) untuk anak kedua',
    status: 'Disetujui', // 'Diajukan' | 'Diproses' | 'Disetujui' | 'Ditolak'
    tanggalPengajuan: '2026-09-15',
    tanggalDisetujui: '2026-09-16',
    catatanPengurus: 'Surat sudah disetujui & ditandatangani Ketua RT. Silakan unduh/cetak mandiri atau ambil cap basah di rumah RT.',
    nikPemohon: '3201011204850001',
    pekerjaan: 'PNS',
    alamatLengkap: 'Perumahan Alam Tirta Lestari, Blok A No. 01, RT 01 / RW 15, Pagelaran, Ciomas'
  },
  {
    id: 'srt-2026-002',
    noSurat: '470/015/RT.01-RW.15/IX/2026',
    wargaId: 'w-1',
    rt_id: 'rt-1',
    jenisSurat: 'Surat Keterangan Domisili',
    keperluan: 'Persyaratan pembukaan rekening payroll kantor',
    status: 'Diproses',
    tanggalPengajuan: '2026-09-20',
    tanggalDisetujui: null,
    catatanPengurus: 'Sedang diverifikasi berkas oleh sekretaris RT.',
    nikPemohon: '3201011204850001',
    pekerjaan: 'PNS',
    alamatLengkap: 'Perumahan Alam Tirta Lestari, Blok A No. 01, RT 01 / RW 15, Pagelaran, Ciomas'
  }
]

// Data Kontak Darurat & Pos Keamanan
export const INITIAL_KONTAK_DARURAT = [
  {
    id: 'emg-110',
    nama: 'Kepolisian RI (Polisi)',
    kategori: 'Kepolisian',
    nomor: '110',
    wa: '',
    deskripsi: 'Layanan darurat kepolisian 24 jam bebas pulsa untuk aduan kejahatan, kecelakaan, dan ancaman keamanan',
    icon: 'BadgeAlert',
    urgent: true,
    color: 'bg-sky-50 text-sky-800 border-sky-200',
    rt_id: null
  },
  {
    id: 'emg-119',
    nama: 'Layanan Ambulans & Medis (Kemenkes)',
    kategori: 'Medis & Kesehatan',
    nomor: '119',
    wa: '081388001199',
    deskripsi: 'Layanan tanggap darurat medis nasional 24 jam & panggilan ambulans siaga terdekat',
    icon: 'HeartPulse',
    urgent: true,
    color: 'bg-rose-50 text-rose-800 border-rose-200',
    rt_id: null
  },
  {
    id: 'emg-113',
    nama: 'Pemadam Kebakaran (Damkar)',
    kategori: 'Kebakaran & Penyelamatan',
    nomor: '113',
    wa: '',
    deskripsi: 'Penanganan kebakaran darurat, evakuasi bencana, pohon tumbang & penyelamatan hewan liar',
    icon: 'Flame',
    urgent: true,
    color: 'bg-amber-50 text-amber-900 border-amber-200',
    rt_id: null
  },
  {
    id: 'emg-112',
    nama: 'Panggilan Darurat Terpadu (Darurat 112)',
    kategori: 'Panggilan Darurat Nasional',
    nomor: '112',
    wa: '',
    deskripsi: 'Pusat panggilan darurat bebas pulsa & tanpa SIM card untuk segala jenis kondisi genting',
    icon: 'ShieldAlert',
    urgent: true,
    color: 'bg-red-50 text-red-800 border-red-200',
    rt_id: null
  },
  {
    id: 'emg-1',
    nama: 'Pos Keamanan & Satpam Gerbang 24 Jam',
    kategori: 'Keamanan Lingkungan',
    nomor: '081299887766',
    wa: '081299887766',
    deskripsi: 'Pos utama gerbang perumahan, patroli malam & penutupan portal darurat',
    icon: 'Shield',
    urgent: true,
    color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    rt_id: null
  },
  {
    id: 'emg-2',
    nama: 'Ketua RT 01 (Pelayanan Warga)',
    kategori: 'Pengurus Lingkungan',
    nomor: '081234567890',
    wa: '081234567890',
    deskripsi: 'Pelayanan koordinasi cepat pengurus lingkungan dan warga darurat RT 01',
    icon: 'User',
    urgent: false,
    color: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    rt_id: 'rt-1'
  },
  {
    id: 'emg-rt-2',
    nama: 'Ketua RT 02 (Bpk. Suryanto Wijaya)',
    kategori: 'Pengurus Lingkungan',
    nomor: '085212345678',
    wa: '085212345678',
    deskripsi: 'Pelayanan koordinasi cepat pengurus lingkungan dan warga darurat RT 02',
    icon: 'User',
    urgent: false,
    color: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    rt_id: 'rt-2'
  },
  {
    id: 'emg-rt-3',
    nama: 'Ketua RT 03 (Bpk. Herman Susilo)',
    kategori: 'Pengurus Lingkungan',
    nomor: '085612345678',
    wa: '085612345678',
    deskripsi: 'Pelayanan koordinasi cepat pengurus lingkungan dan warga darurat RT 03',
    icon: 'User',
    urgent: false,
    color: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    rt_id: 'rt-3'
  }
]

