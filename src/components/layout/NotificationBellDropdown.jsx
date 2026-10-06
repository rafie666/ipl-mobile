import React, { useState, useRef, useEffect } from 'react'
import { Bell, Check, X, Clock, Eye, AlertTriangle, ShieldCheck, ChevronRight, CheckCircle2, User, Trophy, Calendar } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { formatRupiah, formatTanggalIndo, NAMA_BULAN } from '../../utils/formatters'

export default function NotificationBellDropdown() {
  const {
    currentUser,
    isAdminLoggedIn,
    isRT,
    isWarga,
    currentRT,
    tagihan,
    tagihanEvents,
    events,
    warga,
    verifikasiBuktiTransfer,
    verifikasiBuktiTagihanEvent,
    bayarTagihanEvent,
    setSelectedTagihanVerifikasi,
    setActiveTab,
    notifications,
    markNotificationRead
  } = useApp()

  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveNotifTab] = useState('verifikasi') // 'verifikasi' | 'riwayat'
  const dropdownRef = useRef(null)

  // Filter tagihan IPL yang butuh persetujuan
  const pendingIpl = (tagihan || []).filter(t => {
    if (t.status !== 'Menunggu Verifikasi') return false
    if (isRT) {
      const targetW = warga.find(w => w.id === t.wargaId)
      return targetW?.rt_id === currentRT?.id || t.target_rt_id === currentRT?.id
    }
    return true
  })

  // Filter tagihan Event/Kegiatan yang butuh persetujuan
  const pendingEvents = (tagihanEvents || []).filter(te => {
    if (te.status !== 'Menunggu Verifikasi') return false
    const ev = (events || []).find(e => e.id === te.eventId)
    if (isRT && ev?.scope === 'rt') {
      return ev.targetRtId === currentRT?.id || ev.rt_id === currentRT?.id
    }
    return true
  })

  const totalPending = pendingIpl.length + pendingEvents.length
  const unreadNotifs = (notifications || []).filter(n => !n.read).length

  // Total badge count di lonceng
  const badgeCount = isAdminLoggedIn ? totalPending : unreadNotifs

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Handler 1-Click Approval Lunas IPL
  const handleQuickApproveIpl = (tId, e) => {
    e.stopPropagation()
    verifikasiBuktiTransfer(tId, 'terima')
  }

  // Handler 1-Click Tolak IPL
  const handleQuickRejectIpl = (tId, e) => {
    e.stopPropagation()
    verifikasiBuktiTransfer(tId, 'tolak', { alasanTolak: 'Bukti transfer tidak sesuai atau buram.' })
  }

  // Handler 1-Click Approval Lunas Event
  const handleQuickApproveEvent = (teId, e) => {
    e.stopPropagation()
    const targetTe = pendingEvents.find(te => te.id === teId)
    bayarTagihanEvent(teId, {
      metodeBayar: targetTe?.metodeBayar || 'Transfer Bank'
    })
  }

  // Handler 1-Click Tolak Event
  const handleQuickRejectEvent = (teId, e) => {
    e.stopPropagation()
    if (verifikasiBuktiTagihanEvent) {
      verifikasiBuktiTagihanEvent(teId, 'tolak', { alasanTolak: 'Bukti transfer tidak sesuai atau buram.' })
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Tombol Lonceng Notifikasi */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl transition-all duration-200 ${
          isOpen
            ? 'bg-emerald-100 text-emerald-800'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
        title="Pemberitahuan & Persetujuan Pembayaran"
      >
        <Bell className="w-5 h-5" />
        {badgeCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-600 px-1 text-[11px] font-extrabold text-white ring-2 ring-white shadow-xs animate-pulse">
            {badgeCount > 99 ? '99+' : badgeCount}
          </span>
        )}
      </button>

      {/* Pop-up Panel Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-96 sm:w-[420px] bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header Panel */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold tracking-tight">Pemberitahuan & Persetujuan</h4>
                <p className="text-[11px] text-slate-300">
                  {isAdminLoggedIn
                    ? `${totalPending} pembayaran warga butuh ACC Lunas`
                    : 'Aktivitas & informasi akun Anda'}
                </p>
              </div>
            </div>

            {totalPending > 0 && isAdminLoggedIn && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                {totalPending} Menunggu
              </span>
            )}
          </div>

          {/* Navigation Tabs (Khusus Admin/RT) */}
          {isAdminLoggedIn && (
            <div className="flex border-b border-slate-100 bg-slate-50/70 p-1 gap-1 text-xs font-semibold">
              <button
                onClick={() => setActiveNotifTab('verifikasi')}
                className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'verifikasi'
                    ? 'bg-white text-emerald-700 shadow-2xs font-bold border border-slate-200/60'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Perlu ACC ({totalPending})</span>
              </button>

              <button
                onClick={() => setActiveNotifTab('riwayat')}
                className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'riwayat'
                    ? 'bg-white text-emerald-700 shadow-2xs font-bold border border-slate-200/60'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Notifikasi ({notifications?.length || 0})</span>
              </button>
            </div>
          )}

          {/* List Content */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {activeTab === 'verifikasi' && isAdminLoggedIn ? (
              totalPending === 0 ? (
                <div className="py-12 px-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-800">Semua Pembayaran Telah Lunas!</p>
                  <p className="text-xs text-slate-500 mt-1">Tidak ada bukti transfer yang tertunda verifikasi saat ini.</p>
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {/* List Tagihan IPL */}
                  {pendingIpl.map(t => {
                    const targetW = (warga || []).find(w => w.id === t.wargaId) || {}
                    const bulanNama = NAMA_BULAN[(t.bulan || 1) - 1] || `Bulan ${t.bulan}`
                    const isRw = t.payment_scope === 'RW'

                    return (
                      <div
                        key={t.id}
                        className="p-3 bg-amber-50/40 hover:bg-amber-50/80 border border-amber-200/70 rounded-xl transition-all flex flex-col gap-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                              IPL
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h5 className="text-xs font-bold text-slate-900 leading-snug">
                                  {targetW.nama || t.namaWarga || 'Warga'}
                                </h5>
                                <span className="px-1.5 py-0.2 text-[9px] font-extrabold rounded bg-slate-200 text-slate-700">
                                  {targetW.blok ? `Blok ${targetW.blok}/${targetW.noRumah}` : '-'}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 mt-0.5">
                                Tagihan IPL {bulanNama} {t.tahun} • <span className="font-extrabold text-emerald-700">{formatRupiah(t.total)}</span>
                              </p>
                              {t.bankPengirim && (
                                <p className="text-[10px] text-slate-500">
                                  Metode: <span className="font-semibold text-slate-700">{t.bankPengirim}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-200/80 text-amber-900 shrink-0">
                            Butuh ACC
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-2 pt-1 border-t border-amber-200/40">
                          <button
                            onClick={() => {
                              setSelectedTagihanVerifikasi(t)
                              setIsOpen(false)
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>Periksa</span>
                          </button>

                          <button
                            onClick={(e) => handleQuickRejectIpl(t.id, e)}
                            className="px-2.5 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-all flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5 text-rose-600" />
                            <span>Tolak</span>
                          </button>

                          <button
                            onClick={(e) => handleQuickApproveIpl(t.id, e)}
                            className="px-3 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-2xs transition-all flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Setujui Lunas</span>
                          </button>
                        </div>
                      </div>
                    )
                  })}

                  {/* List Tagihan Event / Lomba */}
                  {pendingEvents.map(te => {
                    const targetW = (warga || []).find(w => w.id === te.wargaId) || {}
                    const ev = (events || []).find(e => e.id === te.eventId) || {}

                    return (
                      <div
                        key={te.id}
                        className="p-3 bg-purple-50/40 hover:bg-purple-50/80 border border-purple-200/70 rounded-xl transition-all flex flex-col gap-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                              <Trophy className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h5 className="text-xs font-bold text-slate-900 leading-snug">
                                  {targetW.nama || 'Warga'}
                                </h5>
                                <span className="px-1.5 py-0.2 text-[9px] font-extrabold rounded bg-slate-200 text-slate-700">
                                  {targetW.blok ? `Blok ${targetW.blok}/${targetW.noRumah}` : '-'}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 mt-0.5">
                                Kegiatan: <span className="font-bold text-slate-800">{ev.judul || 'Lomba/Acara'}</span>
                              </p>
                              <p className="text-[11px] text-purple-700 font-extrabold">
                                Nominal: {formatRupiah(ev.nominalPerKK || 0)}
                              </p>
                            </div>
                          </div>

                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-200/80 text-purple-900 shrink-0">
                            Iuran Acara
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-2 pt-1 border-t border-purple-200/40">
                          <button
                            onClick={() => {
                              setActiveTab('events')
                              setIsOpen(false)
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>Buka Acara</span>
                          </button>

                          <button
                            onClick={(e) => handleQuickRejectEvent(te.id, e)}
                            className="px-2.5 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-all flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5 text-rose-600" />
                            <span>Tolak</span>
                          </button>

                          <button
                            onClick={(e) => handleQuickApproveEvent(te.id, e)}
                            className="px-3 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-2xs transition-all flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Setujui Lunas</span>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            ) : (
              /* Tab Notifikasi Biasa / Activity Log */
              (notifications || []).length === 0 ? (
                <div className="py-12 px-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                    <Bell className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-slate-500 font-semibold">Belum ada riwayat notifikasi baru.</p>
                </div>
              ) : (
                <div className="p-2 space-y-1.5">
                  {(notifications || []).slice(0, 15).map(n => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead && markNotificationRead(n.id)}
                      className={`p-2.5 rounded-xl border transition-all text-xs cursor-pointer ${
                        n.read
                          ? 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                          : 'bg-emerald-50/50 border-emerald-200/70 text-slate-900 font-medium hover:bg-emerald-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-bold text-slate-900">{n.title}</span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>

          {/* Footer Panel */}
          {isAdminLoggedIn && (
            <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  setActiveTab('iuran')
                  setIsOpen(false)
                }}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
              >
                <span>Buka Seluruh Billing Tagihan</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  setActiveTab('events')
                  setIsOpen(false)
                }}
                className="text-xs font-bold text-purple-700 hover:text-purple-800 hover:underline flex items-center gap-1"
              >
                <span>Iuran Acara</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
