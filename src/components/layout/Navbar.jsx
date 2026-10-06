import React from 'react'
import { 
  Menu, 
  Sparkles, 
  UserCheck, 
  Shield, 
  Building2, 
  Clock,
  ExternalLink,
  LogOut,
  Key,
  ShieldCheck,
  User
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import NotificationBellDropdown from './NotificationBellDropdown'

export default function Navbar({ mobileMenuOpen, setMobileMenuOpen, onOpenGenerate }) {
  const { 
    config, 
    activeTab, 
    setActiveTab, 
    tagihan, 
    currentUser,
    currentRT,
    isAdminLoggedIn, 
    isAdmin,
    isRT,
    isWarga,
    openLoginModal, 
    logoutUser,
    setProfileModalOpen
  } = useApp()

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  // Hitung jumlah tagihan belum bayar bulan ini
  const unpaidThisMonth = tagihan.filter(t => t.bulan === currentMonth && t.tahun === currentYear && t.status !== 'Lunas').length

  // Hitung bukti transfer warga yang menunggu verifikasi admin
  const pendingVerifikasi = tagihan.filter(t => t.status === 'Menunggu Verifikasi').length

  const tabTitles = {
    dashboard: 'Dashboard Ringkasan Lingkungan (Super Admin)',
    'rt-dashboard': `Dashboard Pengurus ${currentRT?.name || 'RT'}`,
    'warga-dashboard': 'Portal Mandiri Warga',
    warga: 'Data Kependudukan & Unit Rumah',
    iuran: 'Billing & Tagihan Iuran Warga (IPL)',
    events: 'Iuran Kegiatan, Lomba & Surat Edaran',
    kas: 'Buku Kas & Keuangan RT/RW',
    pengaduan: 'Layanan Pengaduan & Aspirasi Warga',
    surat: 'Layanan Surat Pengantar RT/RW Digital',
    'kas-warga': 'Transparansi Kas & Anggaran Lingkungan',
    'kontak-darurat': 'Direktori Kontak Darurat & Keamanan Lingkungan',
    'data-akses': 'Manajemen Data Akses Admin & Pengurus RT',
    portal: 'Portal Cek Tagihan Mandiri Warga',
    settings: 'Pengaturan Sistem & Pos Iuran'
  }

  return (
    <header className="no-print sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Buka navigasi sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-600 hidden sm:inline">
              {config?.namaLingkungan} • {config?.rtRw}
            </span>
          </div>
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-none">
            {tabTitles[activeTab] || 'IPL Warga'}
          </h2>
        </div>
      </div>

      {/* Right Area Badges & Controls */}
      <div className="flex items-center gap-2.5">
        
        {/* Pending Verification Badge (Staff only) */}
        {isAdminLoggedIn && pendingVerifikasi > 0 && (
          <button
            onClick={() => setActiveTab('iuran')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            title={`${pendingVerifikasi} bukti transfer menunggu verifikasi`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{pendingVerifikasi} Verifikasi</span>
          </button>
        )}

        {/* Unpaid Badge (Staff only) */}
        {isAdminLoggedIn && unpaidThisMonth > 0 && (
          <button
            onClick={() => setActiveTab('iuran')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-xl text-xs font-semibold text-amber-800 transition-colors"
            title="Klik untuk melihat tagihan menunggak"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>{unpaidThisMonth} Menunggak</span>
          </button>
        )}

        {/* Generate Tagihan Button (Admin/RT only) */}
        {isAdminLoggedIn && (
          <button
            onClick={onOpenGenerate}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 rounded-xl text-xs font-bold transition-all shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Generate</span>
          </button>
        )}

        {/* Lonceng Notifikasi & Persetujuan Pembayaran */}
        <NotificationBellDropdown />

        {/* Current User Role Info & Controls */}
        {currentUser ? (
          <div className="flex items-center gap-2">
            {/* User Role Badge (Clickable to open Edit Profile) */}
            <button
              onClick={() => setProfileModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all hover:shadow-xs active:scale-95 ${
                currentUser.role === 'admin' 
                  ? 'bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-200' 
                  : currentUser.role === 'rt'
                    ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                    : 'bg-sky-50 hover:bg-sky-100 text-sky-800 border-sky-200'
              }`}
              title="Klik untuk Edit Profil & Ganti Kata Sandi"
            >
              <span>{currentUser.role === 'admin' ? '👑 Admin' : currentUser.role === 'rt' ? '🏢 RT 01' : '👤 Warga'}</span>
              <span className="font-normal text-slate-500 max-w-[100px] truncate">({currentUser.name.split(' ')[0]})</span>
              <span className="text-[10px] text-slate-400 font-semibold ml-0.5">⚙️</span>
            </button>



            {/* Logout Button */}
            <button
              onClick={logoutUser}
              className="flex items-center gap-1 px-3 py-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl text-xs font-bold transition-colors"
              title="Keluar / Logout"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-500" />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => openLoginModal('dashboard')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white shadow-md shadow-emerald-600/20 transition-all active:scale-95"
          >
            <Key className="w-3.5 h-3.5 text-emerald-200" />
            <span>Login (3 User)</span>
          </button>
        )}

      </div>

    </header>
  )
}
