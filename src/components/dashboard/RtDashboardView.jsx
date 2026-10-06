import React, { useState } from 'react'
import { 
  Building2, 
  Users, 
  CheckCircle2, 
  Clock, 
  Wallet, 
  TrendingUp, 
  ShieldCheck, 
  Phone, 
  Home, 
  Search, 
  CreditCard, 
  Printer, 
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  MessageCircle,
  Trophy,
  ChevronRight,
  Building,
  MessageSquareText,
  FileText
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { formatRupiah, formatTanggalIndo, NAMA_BULAN, generateWaReminder } from '../../utils/formatters'

export default function RtDashboardView({ onOpenGenerate, onOpenAddWarga, onOpenAddKas }) {
  const { 
    currentUser, 
    currentRT, 
    scopedWarga, 
    scopedTagihan, 
    scopedKas,
    scopedEvents,
    scopedTagihanEvents,
    scopedPengaduan,
    scopedSurat,
    config, 
    setSelectedTagihanKwitansi, 
    setSelectedTagihanBayar, 
    setActiveTab,
    setProfileModalOpen
  } = useApp()

  const pendingPengaduan = (scopedPengaduan || []).filter(p => p.status === 'Menunggu Tindak Lanjut').length
  const pendingSurat = (scopedSurat || []).filter(s => s.status === 'Diajukan' || s.status === 'Diproses').length

  const [searchWarga, setSearchWarga] = useState('')
  const [filterBlok, setFilterBlok] = useState('ALL')

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  // Tagihan bulan ini khusus untuk warga RT ini
  const rtBillsThisMonth = scopedTagihan.filter(t => t.bulan === currentMonth && t.tahun === currentYear)
  const paidBillsThisMonth = rtBillsThisMonth.filter(t => t.status === 'Lunas')
  const unpaidBillsThisMonth = rtBillsThisMonth.filter(t => t.status !== 'Lunas')

  const totalTerkumpulBulanIni = paidBillsThisMonth.reduce((acc, curr) => acc + curr.total, 0)
  const totalTunggakanBulanIni = unpaidBillsThisMonth.reduce((acc, curr) => acc + curr.total, 0)
  const totalPotensiBulanIni = rtBillsThisMonth.reduce((acc, curr) => acc + curr.total, 0)
  const rasioKepatuhan = totalPotensiBulanIni > 0 
    ? Math.round((totalTerkumpulBulanIni / totalPotensiBulanIni) * 100) 
    : 0

  // Total Kas Riil RT (Terisolasi hanya untuk RT ini)
  const currentRtKas = scopedKas || []
  const totalKasMasuk = currentRtKas.filter(k => k.tipe === 'Masuk').reduce((acc, curr) => acc + curr.nominal, 0)
  const totalKasKeluar = currentRtKas.filter(k => k.tipe === 'Keluar').reduce((acc, curr) => acc + curr.nominal, 0)
  const saldoKasSaatIni = totalKasMasuk - totalKasKeluar

  // Filter daftar warga RT
  const filteredWarga = scopedWarga.filter(w => {
    const matchSearch = w.nama.toLowerCase().includes(searchWarga.toLowerCase()) ||
                        w.noRumah.toLowerCase().includes(searchWarga.toLowerCase()) ||
                        (w.noHp && w.noHp.includes(searchWarga))
    const matchBlok = filterBlok === 'ALL' || w.blok === filterBlok
    return matchSearch && matchBlok
  })

  // List blok yang ada di RT ini
  const availableBloks = Array.from(new Set(scopedWarga.map(w => w.blok))).sort()

  // Analisis Kepatuhan per Blok khusus di wilayah RT ini
  const blockStats = availableBloks.map(b => {
    const wargaInBlock = scopedWarga.filter(w => w.blok === b && w.aktif)
    const wargaIds = wargaInBlock.map(w => w.id)
    const blockBills = rtBillsThisMonth.filter(t => wargaIds.includes(t.wargaId))
    const paidBlockBills = blockBills.filter(t => t.status === 'Lunas')
    const percent = blockBills.length > 0 ? Math.round((paidBlockBills.length / blockBills.length) * 100) : 0
    return {
      blok: b,
      totalWarga: wargaInBlock.length,
      paidCount: paidBlockBills.length,
      totalCount: blockBills.length,
      percent
    }
  })

  // Transaksi Pembayaran Terbaru Warga RT ini
  const recentPayments = scopedTagihan
    .filter(t => t.status === 'Lunas' && t.tanggalBayar)
    .sort((a, b) => new Date(b.tanggalBayar) - new Date(a.tanggalBayar))
    .slice(0, 5)

  // Pengeluaran Kas RT Terbaru
  const recentExpenses = currentRtKas
    .filter(k => k.tipe === 'Keluar')
    .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
    .slice(0, 4)

  // Event & Kegiatan yang relevan dengan warga RT ini
  const relevantEvents = scopedEvents || []

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Top Banner / Welcome RT */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-emerald-500/10 backdrop-blur-3xl rounded-l-full pointer-events-none transform translate-x-1/3"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold backdrop-blur-sm border border-emerald-500/30 font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Pusat Kendali Pengurus {currentRT?.name || 'RT 01'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Dashboard Eksekutif {currentRT?.name || 'RT 01'} — {NAMA_BULAN[currentMonth - 1]} {currentYear}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Monitoring realisasi iuran IPL wilayah {currentRT?.name || 'RT 01'}, kelola saldo buku kas lokal RT, dan koordinasi kegiatan warga.
            </p>
          </div>

          {/* Quick Actions in Banner */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenGenerate}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              Generate IPL RT
            </button>
            <button
              onClick={onOpenAddKas}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl backdrop-blur-sm transition-all border border-white/10"
            >
              <Wallet className="w-4 h-4" />
              + Catat Kas RT
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-600/70 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl backdrop-blur-sm transition-all border border-amber-400/30"
            >
              <Trophy className="w-4 h-4" />
              Acara / Lomba
            </button>
            <button
              onClick={() => setProfileModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl backdrop-blur-sm transition-all border border-white/10"
              title="Edit Profil Ketua RT & Rekening"
            >
              <span>⚙️ Profil RT</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pelayanan Warga Quick Notification Badges (Pengaduan & Surat Masuk) */}
      {(pendingPengaduan > 0 || pendingSurat > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {pendingPengaduan > 0 && (
            <div 
              onClick={() => setActiveTab('pengaduan')}
              className="p-4 rounded-2xl bg-amber-500/10 border border-amber-300/60 hover:bg-amber-500/15 cursor-pointer transition-all flex items-center justify-between gap-3 shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                  <MessageSquareText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-amber-950">
                    {pendingPengaduan} Laporan Keluhan Warga Baru
                  </h4>
                  <p className="text-[11px] text-amber-800">Menunggu tanggapan & tindak lanjut RT</p>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-700 hover:underline">Tanggapi &rarr;</span>
            </div>
          )}

          {pendingSurat > 0 && (
            <div 
              onClick={() => setActiveTab('surat')}
              className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-300/60 hover:bg-emerald-500/15 cursor-pointer transition-all flex items-center justify-between gap-3 shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-emerald-950">
                    {pendingSurat} Permohonan Surat Pengantar Masuk
                  </h4>
                  <p className="text-[11px] text-emerald-800">Menunggu persetujuan pengurus RT</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 hover:underline">Periksa &rarr;</span>
            </div>
          )}
        </div>
      )}

      {/* 4 Stat Cards Scoped RT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Iuran Terkumpul RT */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">IPL Masuk {currentRT?.name}</span>
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {formatRupiah(totalTerkumpulBulanIni)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>{paidBillsThisMonth.length} dari {rtBillsThisMonth.length} KK Lunas</span>
            <span className="font-bold text-emerald-600">{rasioKepatuhan}%</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${rasioKepatuhan}%` }}
            />
          </div>
        </div>

        {/* Tunggakan Belum Bayar RT */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tunggakan {currentRT?.name}</span>
            <span className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <Clock className="w-5 h-5" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-amber-600 font-mono">
            {formatRupiah(totalTunggakanBulanIni)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>{unpaidBillsThisMonth.length} KK Belum Bayar</span>
            <button 
              onClick={() => setActiveTab('iuran')} 
              className="text-amber-700 font-bold hover:underline"
            >
              Tagihan RT &rarr;
            </button>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-amber-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${100 - rasioKepatuhan}%` }}
            />
          </div>
        </div>

        {/* Saldo Kas Riil RT */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Saldo Kas {currentRT?.name}</span>
            <span className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
              <Wallet className="w-5 h-5" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-indigo-700 font-mono">
            {formatRupiah(saldoKasSaatIni)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span className="text-emerald-600 font-medium">+{formatRupiah(totalKasMasuk)}</span>
            <span className="text-rose-600 font-medium">-{formatRupiah(totalKasKeluar)}</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Kas Otonom Wilayah {currentRT?.name || 'RT'}
          </div>
        </div>

        {/* Total Warga RT Terdata */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Warga {currentRT?.name}</span>
            <span className="p-2 bg-slate-100 text-slate-700 rounded-xl">
              <Users className="w-5 h-5" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {scopedWarga.length} <span className="text-sm font-normal text-slate-500">Rumah / KK</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>{scopedWarga.filter(w => w.statusHuni === 'Tetap').length} Tetap</span>
            <span>{scopedWarga.filter(w => w.statusHuni === 'Kontrak').length} Kontrak</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Tersebar di Blok {availableBloks.join(', ') || '-'}
          </div>
        </div>

      </div>

      {/* Grid: Analisis Kepatuhan per Blok di RT & Transaksi Pembayaran Terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolom Kiri: Kepatuhan Pembayaran Tiap Blok RT */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-600" />
              Kepatuhan IPL per Blok ({currentRT?.name})
            </h2>
            <span className="text-xs text-slate-400">{NAMA_BULAN[currentMonth - 1]}</span>
          </div>

          <div className="space-y-4 pt-2">
            {blockStats.length > 0 ? (
              blockStats.map(stat => (
                <div key={stat.blok} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-800">Blok {stat.blok}</span>
                    <span className="text-slate-500 font-medium">
                      {stat.paidCount}/{stat.totalCount} KK Lunas ({stat.percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-700" 
                      style={{ width: `${stat.percent}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">Belum ada data blok di RT ini.</p>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Rata-rata kepatuhan RT:</span>
            <span className="font-extrabold text-emerald-700 text-sm">{rasioKepatuhan}%</span>
          </div>
        </div>

        {/* Kolom Kanan: Penerimaan Iuran Terbaru Warga RT */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                Penerimaan Iuran Terkini {currentRT?.name}
              </h2>
              <p className="text-xs text-slate-400">Pembayaran IPL warga RT yang telah lunas</p>
            </div>
            <button
              onClick={() => setActiveTab('iuran')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              Semua Tagihan RT &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 text-left">Warga & Unit</th>
                  <th className="py-2.5 text-left">Periode</th>
                  <th className="py-2.5 text-left">Tgl & Metode</th>
                  <th className="py-2.5 text-right">Nominal</th>
                  <th className="py-2.5 text-center">Kwitansi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentPayments.length > 0 ? (
                  recentPayments.map(p => {
                    const wargaItem = scopedWarga.find(w => w.id === p.wargaId)
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 font-semibold text-slate-800">
                          <div>{wargaItem?.nama || 'Warga'}</div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            Blok {wargaItem?.blok} No. {wargaItem?.noRumah}
                          </div>
                        </td>
                        <td className="py-3 text-slate-600 font-medium">
                          {NAMA_BULAN[p.bulan - 1]} {p.tahun}
                        </td>
                        <td className="py-3">
                          <div className="text-slate-700 font-medium">{formatTanggalIndo(p.tanggalBayar)}</div>
                          <span className="inline-block px-2 py-0.5 text-[10px] rounded-md bg-slate-100 text-slate-600 font-semibold">
                            {p.metodeBayar || 'Tunai'}
                          </span>
                        </td>
                        <td className="py-3 text-right font-bold text-emerald-700 font-mono">
                          {formatRupiah(p.total)}
                        </td>
                        <td className="py-3 text-center">
                          <button
                            onClick={() => setSelectedTagihanKwitansi(p)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Cetak Kwitansi"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      Belum ada catatan pembayaran lunas di {currentRT?.name}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Grid: Pengeluaran Kas RT Terkini & Monitoring Acara Relevan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Box Pengeluaran Kas RT */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-rose-500" />
                Pengeluaran Kas {currentRT?.name} Terkini
              </h2>
              <p className="text-xs text-slate-400">Biaya operasional lokal wilayah {currentRT?.name}</p>
            </div>
            <button
              onClick={() => setActiveTab('kas')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              Buku Kas RT &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentExpenses.length > 0 ? (
              recentExpenses.map(exp => (
                <div key={exp.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                      {exp.kategori}
                    </span>
                    <span>{formatTanggalIndo(exp.tanggal)}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 line-clamp-2">
                    {exp.deskripsi}
                  </p>
                  <div className="text-sm font-extrabold text-rose-600 font-mono pt-0.5">
                    -{formatRupiah(exp.nominal)}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 py-6 text-center text-slate-400 text-xs">
                Belum ada pengeluaran kas dicatat di {currentRT?.name}.
              </div>
            )}
          </div>
        </div>

        {/* Box Iuran Kegiatan / Lomba Relevan */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                Kegiatan & Iuran Acara Aktif
              </h2>
              <p className="text-xs text-slate-400">Iuran insidental tingkat RW dan RT {currentRT?.name}</p>
            </div>
            <button
              onClick={() => setActiveTab('events')}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline"
            >
              Kelola Acara &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {relevantEvents.slice(0, 3).map(evt => {
              const isRw = evt.scope === 'rw' || !evt.rt_id
              const bills = (scopedTagihanEvents || []).filter(te => te.eventId === evt.id)
              const paidCount = bills.filter(te => te.status === 'Lunas').length
              const percent = bills.length > 0 ? Math.round((paidCount / bills.length) * 100) : 0

              return (
                <div key={evt.id} className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/70 space-y-2 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase font-mono border ${
                          isRw ? 'bg-purple-100 text-purple-900 border-purple-200' : 'bg-emerald-100 text-emerald-900 border-emerald-200'
                        }`}>
                          {isRw ? 'Tingkat RW' : `Tingkat ${currentRT?.name || 'RT'}`}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold">{evt.kategori}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{evt.judul}</h4>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-extrabold text-slate-900 font-mono">{formatRupiah(evt.nominalPerKK)}</span>
                      <span className="text-[10px] text-slate-400 block">per KK</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <span>Partisipasi Warga RT: <strong>{paidCount}/{bills.length || scopedWarga.length} KK</strong></span>
                    <span className="font-bold text-emerald-600">{percent}% Lunas</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>

      {/* Main Section: Daftar Warga RT (Terisolasi hanya pada RT ini) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {/* Header & Filter Controls */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <span>Daftar Warga Wilayah {currentRT?.name || 'RT 01'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Menampilkan data {filteredWarga.length} kepala keluarga yang terdaftar pada {currentRT?.name}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute inset-y-0 left-3 my-auto pointer-events-none" />
              <input
                type="text"
                value={searchWarga}
                onChange={(e) => setSearchWarga(e.target.value)}
                placeholder="Cari nama / no. rumah..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            {/* Blok Filter */}
            {availableBloks.length > 1 && (
              <select
                value={filterBlok}
                onChange={(e) => setFilterBlok(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">Semua Blok</option>
                {availableBloks.map(b => (
                  <option key={b} value={b}>Blok {b}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Table of RT Residents */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Kepala Keluarga</th>
                <th className="py-3 px-4">Unit Rumah</th>
                <th className="py-3 px-4">No. HP / WhatsApp</th>
                <th className="py-3 px-4">Status Hunian</th>
                <th className="py-3 px-4">Status IPL {NAMA_BULAN[currentMonth - 1]}</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWarga.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400 font-medium">
                    Tidak ada warga yang sesuai pencarian di {currentRT?.name}.
                  </td>
                </tr>
              ) : (
                filteredWarga.map((w) => {
                  const bill = rtBillsThisMonth.find(t => t.wargaId === w.id)
                  const isPaid = bill?.status === 'Lunas'

                  return (
                    <tr key={w.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {w.nama}
                        <div className="text-[10px] text-slate-400 font-normal">
                          {w.pekerjaan || 'Warga'} • {w.jumlahJiwa || 1} Jiwa
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                          <Home className="w-3 h-3 text-slate-400" />
                          Blok {w.blok} / {w.noRumah}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {w.noHp ? (
                          <a 
                            href={!isPaid && bill 
                              ? generateWaReminder(w, bill, `${config?.namaLingkungan || 'Perumahan'} ${currentRT?.name || 'RT'}`)
                              : `https://wa.me/${w.noHp.replace(/\D/g, '')}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold"
                            title={!isPaid && bill ? "Kirim Pengingat Tagihan via WhatsApp" : "Hubungi via WhatsApp"}
                          >
                            <Phone className="w-3 h-3" />
                            <span>{w.noHp}</span>
                          </a>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          w.statusHuni === 'Tetap' 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {w.statusHuni || 'Tetap'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[10px]">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Lunas</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[10px]">
                            <Clock className="w-3 h-3" />
                            <span>Belum Bayar</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isPaid && bill ? (
                          <button
                            onClick={() => setSelectedTagihanKwitansi(bill)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                            title="Cetak Kwitansi"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Kwitansi</span>
                          </button>
                        ) : bill ? (
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            {w.noHp && (
                              <a
                                href={generateWaReminder(w, bill, `${config?.namaLingkungan || 'Perumahan'} ${currentRT?.name || 'RT'}`)}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center"
                                title="Kirim Pengingat Tagihan ke WhatsApp Warga"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              onClick={() => setSelectedTagihanBayar(bill)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>Bayar</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-[11px]">-</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  )
}
