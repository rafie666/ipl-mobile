import React from 'react'
import {
  LayoutDashboard,
  Users,
  Receipt,
  Wallet,
  Settings,
  Sparkles,
  Download,
  RotateCcw,
  X,
  Building2,
  Trophy,
  Lock,
  LogOut,
  Key,
  MessageSquareText,
  FileText,
  PhoneCall,
  BarChart3,
  MessageSquarePlus,
  MapPin
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { exportDataAsJson } from '../../utils/storage'

export default function Sidebar({ mobileMenuOpen, setMobileMenuOpen, onOpenGenerate }) {
  const {
    activeTab,
    setActiveTab,
    tagihan,
    scopedTagihan,
    scopedPengaduan,
    scopedSurat,
    pengaduan,
    surat,
    config,
    handleResetData,
    currentUser,
    currentRT,
    currentWarga,
    isAdminLoggedIn,
    isAdmin,
    isRT,
    isWarga,
    unreadEventsCount = 0,
    openLoginModal,
    logoutUser,
    setProfileModalOpen
  } = useApp()

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const activeTagihanList = scopedTagihan || tagihan

  // Tagihan belum bayar bulan ini
  const unpaidCount = activeTagihanList.filter(t => t.bulan === currentMonth && t.tahun === currentYear && t.status !== 'Lunas').length
  const pendingVerifikasi = activeTagihanList.filter(t => t.status === 'Menunggu Verifikasi').length

  // Pending pengaduan & surat counts
  const activePengaduanList = scopedPengaduan || pengaduan || []
  const pendingPengaduanCount = activePengaduanList.filter(p => p.status === 'Menunggu Tindak Lanjut').length

  const activeSuratList = scopedSurat || surat || []
  const pendingSuratCount = activeSuratList.filter(s => s.status === 'Diajukan' || s.status === 'Diproses').length

  const handleNavClick = (id) => {
    if (id === 'settings-warga') {
      setProfileModalOpen(true)
      setMobileMenuOpen(false)
      return
    }
    setActiveTab(id)
    setMobileMenuOpen(false)
  }

  // Dynamic menu based on user role
  let menuSections = []

  if (isWarga) {
    menuSections = [
      {
        title: 'Layanan Utama',
        items: [
          { id: 'warga-dashboard', label: 'Dashboard Saya', icon: LayoutDashboard, badge: 'Mandiri' },
          {
            id: 'events',
            label: 'Pengumuman & Lomba',
            icon: Trophy,
            badge: unreadEventsCount > 0 ? (unreadEventsCount === 1 ? '1 Baru' : `${unreadEventsCount} Baru`) : null,
            badgeColor: unreadEventsCount > 0
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 font-medium'
              : null
          }
        ]
      },
      {
        title: 'Layanan Mandiri',
        items: [
          { id: 'pengaduan', label: 'Lapor Masalah / Aduan', icon: MessageSquareText, badge: null },
          { id: 'surat', label: 'Surat Pengantar RT/RW', icon: FileText, badge: null },
          { id: 'settings-warga', label: 'Pengaturan & Keluarga', icon: Settings, badge: 'Setting' }
        ]
      },
      {
        title: 'Informasi & Bantuan',
        items: [
          {
            id: 'kontak-darurat',
            label: 'Kontak Darurat',
            icon: PhoneCall,
            badge: '24 Jam',
            badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
          }
        ]
      }
    ]
  } else if (isRT) {
    menuSections = [
      {
        title: 'Pengurus RT',
        items: [
          { id: 'rt-dashboard', label: 'Dashboard RT', icon: LayoutDashboard, badge: 'RT' }
        ]
      },
      {
        title: 'Kependudukan & Iuran',
        items: [
          { id: 'warga', label: 'Data Warga RT', icon: Users, badge: null },
          { id: 'peta-warga', label: 'Peta Rumah Warga', icon: MapPin, badge: 'GIS' },
          {
            id: 'iuran',
            label: 'Tagihan IPL RT',
            icon: Receipt,
            badge: pendingVerifikasi > 0 ? `${pendingVerifikasi} Cek` : null,
            badgeColor: 'bg-amber-500 text-slate-950 font-bold border-amber-400'
          },
          { id: 'kas', label: 'Buku Kas RT', icon: Wallet, badge: null },
          { id: 'events', label: 'Iuran Acara & Lomba', icon: Trophy, badge: null }
        ]
      },
      {
        title: 'Pelayanan Warga',
        items: [
          {
            id: 'pengaduan',
            label: 'Laporan Masalah Warga',
            icon: MessageSquareText,
            badge: pendingPengaduanCount > 0 ? `${pendingPengaduanCount} Baru` : null,
            badgeColor: 'bg-amber-500 text-slate-950 font-bold border-amber-400'
          },
          {
            id: 'surat',
            label: 'Permohonan Surat Masuk',
            icon: FileText,
            badge: pendingSuratCount > 0 ? `${pendingSuratCount} Surat` : null,
            badgeColor: 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
          },
          { id: 'kontak-darurat', label: 'Kontak Darurat', icon: PhoneCall, badge: null }
        ]
      }
    ]
  } else {
    // Super Administrator
    menuSections = [
      {
        title: 'Ringkasan',
        items: [
          { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard, badge: null },
          { id: 'peta-warga', label: 'Peta Pemetaan GIS', icon: MapPin, badge: 'Peta' }
        ]
      },
      {
        title: 'Master Data & Akses',
        items: [
          { id: 'warga', label: 'Data Warga & Blok', icon: Users, badge: 'Master' },
          { id: 'data-akses', label: 'Data Akses Admin', icon: Key, badge: 'Akses' },
          { id: 'settings', label: 'Pengaturan Sistem', icon: Settings, badge: 'Admin' }
        ]
      },
      {
        title: 'Keuangan & Pembukuan',
        items: [
          {
            id: 'iuran',
            label: 'Iuran Warga (IPL)',
            icon: Receipt,
            badge: pendingVerifikasi > 0
              ? `${pendingVerifikasi} Butuh Cek`
              : unpaidCount > 0
                ? `${unpaidCount} Tagihan`
                : 'Transaksi',
            badgeColor: pendingVerifikasi > 0
              ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
              : unpaidCount > 0
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : null
          },
          {
            id: 'events',
            label: 'Iuran Lomba & Acara',
            icon: Trophy,
            badge: 'Insidental',
            badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
          },
          { id: 'kas', label: 'Buku Kas RW', icon: Wallet, badge: 'Arus Kas' }
        ]
      },
      {
        title: 'Layanan Komunitas',
        items: [
          {
            id: 'pengaduan',
            label: 'Laporan & Pengaduan',
            icon: MessageSquareText,
            badge: pendingPengaduanCount > 0 ? `${pendingPengaduanCount}` : null,
            badgeColor: 'bg-amber-500 text-slate-950 font-bold border-amber-400'
          },
          {
            id: 'surat',
            label: 'Surat Pengantar RT/RW',
            icon: FileText,
            badge: pendingSuratCount > 0 ? `${pendingSuratCount}` : null,
            badgeColor: 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
          },
          { id: 'kontak-darurat', label: 'Kontak Darurat', icon: PhoneCall, badge: null }
        ]
      }
    ]
  }

  return (
    <>
      {/* Mobile/Tablet Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Main Docked Sidebar */}
      <aside className={`no-print fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 flex flex-col shrink-0 transition-transform duration-300 ease-in-out border-r border-slate-800 lg:static lg:translate-x-0 lg:h-screen lg:sticky lg:top-0 ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}>

        {/* Sidebar Brand Header */}
        <div className="h-14 flex items-center justify-between px-5 bg-slate-950/60 border-b border-slate-800/80 shrink-0">
          <div
            onClick={() => handleNavClick(isWarga ? 'warga-dashboard' : isRT ? 'rt-dashboard' : 'dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white text-sm tracking-tight leading-none">
                  IPL Warga
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                  v2.0
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium block truncate max-w-[150px]">
                {config?.namaLingkungan || 'Perumahan Alam Tirta Lestari'}
              </span>
            </div>
          </div>

          {/* Close button on Mobile */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items (Scrollable) */}
        <nav className="flex-1 px-3 py-3 space-y-3 overflow-y-auto">

          {menuSections.map((sec, idx) => (
            <div key={idx}>
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {sec.title}
              </div>
              <div className="space-y-0.5">
                {sec.items.map(item => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id
                  const isProtected = item.id !== 'portal' && !isAdminLoggedIn && !isWarga

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold rounded-xl transition duration-150 group ${isActive
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                        }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                          }`} />
                        <span>{item.label}</span>
                      </span>

                      <div className="flex items-center gap-1.5">
                        {isProtected && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" />
                          </span>
                        )}

                        {item.badge && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium border ${item.badgeColor || (isActive
                              ? 'bg-emerald-700/60 text-white border-emerald-500/40'
                              : 'bg-slate-800 text-slate-400 border-slate-700/60')
                            }`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Action Button: Conditional based on Role */}
          <div className="pt-1.5">
            {isAdminLoggedIn ? (
              <button
                onClick={() => {
                  onOpenGenerate()
                  setMobileMenuOpen(false)
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Tagihan Baru</span>
              </button>
            ) : isWarga ? (
              <button
                onClick={() => {
                  handleNavClick('pengaduan')
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98]"
              >
                <MessageSquarePlus className="w-4 h-4" />
                <span>+ Buat Laporan / Aduan</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  openLoginModal('dashboard')
                  setMobileMenuOpen(false)
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98]"
              >
                <Key className="w-4 h-4 text-emerald-200" />
                <span>Login Administrator</span>
              </button>
            )}
          </div>

          {/* Card Profil Pengurus / User - Tepat di bawah tombol Generate Tagihan Baru */}
          {currentUser && (
            <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs font-mono border shrink-0 ${
                currentUser.role === 'admin'
                  ? 'bg-purple-950 text-purple-300 border-purple-800/60'
                  : currentUser.role === 'rt'
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800/60'
                    : 'bg-sky-950 text-sky-300 border-sky-800/60'
              }`}>
                {currentUser.role === 'admin' ? 'ADM' : currentUser.role === 'rt' ? 'RT' : 'WRG'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {currentUser.name}
                </div>
                <div className="text-[10px] flex items-center gap-1.5 font-medium">
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                    currentUser.role === 'admin' ? 'bg-purple-400' : currentUser.role === 'rt' ? 'bg-emerald-400' : 'bg-sky-400'
                  }`}></span>
                  <span className={
                    currentUser.role === 'admin' 
                      ? 'text-purple-300' 
                      : currentUser.role === 'rt' 
                        ? `Pengurus ${currentRT?.name || 'RT 01'}` 
                        : `Warga (${currentWarga?.blok ? `Blok ${currentWarga.blok}/${currentWarga.noRumah}` : 'Tetap'})`
                  }>
                    {currentUser.role === 'admin' 
                      ? 'Super Administrator' 
                      : currentUser.role === 'rt' 
                        ? `Pengurus ${currentRT?.name || 'RT 01'}` 
                        : `Warga (${currentWarga?.blok ? `Blok ${currentWarga.blok}/${currentWarga.noRumah}` : 'Tetap'})`}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={() => setProfileModalOpen(true)}
                  className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Edit Profil & Akun"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={logoutUser}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </nav>

        {/* Sidebar Footer: Tools & Actions */}
        {((currentUser && isAdminLoggedIn) || !currentUser) && (
          <div className="p-2.5 bg-slate-950/70 border-t border-slate-800/80 space-y-2 shrink-0">
            {currentUser ? (
              /* Backup & Reset for Admin / RT */
              isAdminLoggedIn && (
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={exportDataAsJson}
                    className="flex items-center justify-center gap-1.5 px-2 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-[11px] font-semibold transition-colors"
                    title="Download cadangan data JSON"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Backup</span>
                  </button>

                  <button
                    onClick={handleResetData}
                    className="flex items-center justify-center gap-1.5 px-2 py-2 bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 rounded-xl text-[11px] font-semibold transition-colors"
                    title="Reset ke data awal"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>
              )
            ) : (
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-2">
                <div className="text-[11px] text-slate-400 font-medium">
                  Belum login akun
                </div>
                <button
                  onClick={() => openLoginModal('dashboard')}
                  className="w-full py-1.5 px-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Key className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Pilih Login (3 Role)</span>
                </button>
              </div>
            )}
          </div>
        )}

      </aside>
    </>
  )
}
