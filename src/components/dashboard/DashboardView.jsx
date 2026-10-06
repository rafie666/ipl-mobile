import React from 'react'
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  Wallet, 
  TrendingUp, 
  Sparkles, 
  UserPlus, 
  CreditCard, 
  Printer, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  Building,
  Key,
  Settings,
  Phone,
  MessageCircle,
  Award,
  ChevronRight
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { formatRupiah, formatTanggalIndo, NAMA_BULAN } from '../../utils/formatters'

export default function DashboardView({ onOpenGenerate, onOpenAddWarga, onOpenAddKas }) {
  const { warga, tagihan, kas, scopedKas, rts, setSelectedTagihanKwitansi, setSelectedTagihanBayar, setActiveTab } = useApp()

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  // Tagihan bulan ini
  const billsThisMonth = tagihan.filter(t => t.bulan === currentMonth && t.tahun === currentYear)
  const paidBillsThisMonth = billsThisMonth.filter(t => t.status === 'Lunas')
  const unpaidBillsThisMonth = billsThisMonth.filter(t => t.status !== 'Lunas')

  const totalTerkumpulBulanIni = paidBillsThisMonth.reduce((acc, curr) => acc + curr.total, 0)
  const totalTunggakanBulanIni = unpaidBillsThisMonth.reduce((acc, curr) => acc + curr.total, 0)
  const totalPotensiBulanIni = billsThisMonth.reduce((acc, curr) => acc + curr.total, 0)
  const rasioKepatuhan = totalPotensiBulanIni > 0 
    ? Math.round((totalTerkumpulBulanIni / totalPotensiBulanIni) * 100) 
    : 0

  // Total Kas Riil RW (Scoped khusus RW)
  const kasRW = scopedKas || kas.filter(k => k.scope === 'rw' || (!k.scope && !k.rt_id))
  const totalKasMasuk = kasRW.filter(k => k.tipe === 'Masuk').reduce((acc, curr) => acc + curr.nominal, 0)
  const totalKasKeluar = kasRW.filter(k => k.tipe === 'Keluar').reduce((acc, curr) => acc + curr.nominal, 0)
  const saldoKasSaatIni = totalKasMasuk - totalKasKeluar

  // Analisis Komparasi Antar RT (Level RW)
  const rtStats = (rts || []).map(rt => {
    const wargaInRT = warga.filter(w => (w.rt_id === rt.id || rt.blocks?.includes(w.blok)) && w.aktif)
    const wargaIds = wargaInRT.map(w => w.id)
    const rtBills = billsThisMonth.filter(t => wargaIds.includes(t.wargaId))
    const paidRtBills = rtBills.filter(t => t.status === 'Lunas')
    const unpaidRtBills = rtBills.filter(t => t.status !== 'Lunas')
    
    const terkumpul = paidRtBills.reduce((acc, curr) => acc + curr.total, 0)
    const tunggakan = unpaidRtBills.reduce((acc, curr) => acc + curr.total, 0)
    const totalTarget = rtBills.reduce((acc, curr) => acc + curr.total, 0)
    const percent = totalTarget > 0 ? Math.round((terkumpul / totalTarget) * 100) : 0

    return {
      ...rt,
      totalWarga: wargaInRT.length,
      paidCount: paidRtBills.length,
      totalCount: rtBills.length,
      terkumpul,
      tunggakan,
      totalTarget,
      percent
    }
  })

  // Analisis per Blok
  const bloks = ['A', 'B', 'C', 'D']
  const blockStats = bloks.map(b => {
    const wargaInBlock = warga.filter(w => w.blok === b && w.aktif)
    const wargaIds = wargaInBlock.map(w => w.id)
    const blockBills = billsThisMonth.filter(t => wargaIds.includes(t.wargaId))
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

  // Transaksi Pembayaran Terbaru
  const recentPayments = tagihan
    .filter(t => t.status === 'Lunas' && t.tanggalBayar)
    .sort((a, b) => new Date(b.tanggalBayar) - new Date(a.tanggalBayar))
    .slice(0, 5)

  // Pengeluaran Kas Terbaru RW
  const recentExpenses = kasRW
    .filter(k => k.tipe === 'Keluar')
    .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
    .slice(0, 4)

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Welcome RW */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-emerald-500/10 backdrop-blur-3xl rounded-l-full pointer-events-none transform translate-x-1/3"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold backdrop-blur-sm border border-purple-500/30 font-mono">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Pusat Kendali Pengurus RW / Super Admin</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Dashboard Eksekutif RW — {NAMA_BULAN[currentMonth - 1]} {currentYear}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Monitoring makro penerimaan IPL seluruh RT (01, 02, 03), pantau saldo kas lingkungan terpusat, dan kelola akun akses.
            </p>
          </div>

          {/* Quick Actions in Banner */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenGenerate}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              Generate Tagihan Massal
            </button>
            <button
              onClick={() => setActiveTab('data-akses')}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-600/60 hover:bg-purple-600 text-white font-semibold text-xs rounded-xl backdrop-blur-sm transition-all border border-purple-400/30"
            >
              <Key className="w-4 h-4" />
              Akses Admin & RT
            </button>
            <button
              onClick={onOpenAddKas}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl backdrop-blur-sm transition-all border border-white/10"
            >
              <Wallet className="w-4 h-4" />
              + Catat Kas RW
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Iuran Terkumpul */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Iuran Masuk (Bln Ini)</span>
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {formatRupiah(totalTerkumpulBulanIni)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>{paidBillsThisMonth.length} dari {billsThisMonth.length} KK Lunas</span>
            <span className="font-bold text-emerald-600">{rasioKepatuhan}%</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${rasioKepatuhan}%` }}
            />
          </div>
        </div>

        {/* Tunggakan Belum Bayar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tunggakan (Bln Ini)</span>
            <span className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <Clock className="w-5 h-5" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-amber-600 font-mono">
            {formatRupiah(totalTunggakanBulanIni)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>{unpaidBillsThisMonth.length} KK Belum Membayar</span>
            <button 
              onClick={() => setActiveTab('iuran')} 
              className="text-amber-700 font-bold hover:underline"
            >
              Lihat Daftar &rarr;
            </button>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-amber-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${100 - rasioKepatuhan}%` }}
            />
          </div>
        </div>

        {/* Saldo Kas Riil RW */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Saldo Kas RW</span>
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
            Kas Terpusat Lingkungan RW
          </div>
        </div>

        {/* Total Warga Terdata */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Warga / KK</span>
            <span className="p-2 bg-slate-100 text-slate-700 rounded-xl">
              <Users className="w-5 h-5" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {warga.length} <span className="text-sm font-normal text-slate-500">Rumah / KK</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>{warga.filter(w => w.statusHuni === 'Tetap').length} Warga Tetap</span>
            <span>{warga.filter(w => w.statusHuni === 'Kontrak').length} Kontrak</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Tersebar di {rts.length} Wilayah RT
          </div>
        </div>

      </div>

      {/* SECTION KHUSUS RW: Monitoring & Komparasi Kinerja Antar RT */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-purple-100 text-purple-700 rounded-lg">
                <Award className="w-4 h-4" />
              </span>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Monitoring & Performa Kepatuhan Antar RT
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Rekapitulasi pencapaian iuran IPL dan koordinasi dengan masing-masing Ketua RT
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('data-akses')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              <Key className="w-3.5 h-3.5 text-slate-500" />
              <span>Kelola Akun RT</span>
            </button>
            <button
              onClick={() => setActiveTab('iuran')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors"
            >
              <span>Rekap Semua IPL</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {rtStats.map((rt) => {
            const cleanWa = (rt.contact_wa || '').replace(/\D/g, '')
            const waPhone = cleanWa.startsWith('0') ? '62' + cleanWa.slice(1) : cleanWa
            const waUrl = waPhone ? `https://wa.me/${waPhone}?text=Halo%20Pak%20${encodeURIComponent(rt.leader_name || rt.name)},%20mohon%20update%20progres%20iuran%20IPL%20lingkungan%20RW` : null

            return (
              <div 
                key={rt.id} 
                className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-4.5 space-y-3.5 transition-all hover:shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">{rt.name}</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-100 text-purple-800 border border-purple-200 font-mono">
                        Blok {rt.blocks?.join(', ') || '-'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-1.5">
                      <span>Ketua: <strong className="text-slate-800">{rt.leader_name}</strong></span>
                    </div>
                  </div>

                  <span className={`px-2 py-1 text-[10px] font-bold rounded-lg ${
                    rt.percent >= 80 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                      : rt.percent >= 50
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}>
                    {rt.percent}% Lunas
                  </span>
                </div>

                {/* Progress bar kepatuhan */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>{rt.paidCount} dari {rt.totalCount} KK bayar</span>
                    <span className="font-semibold text-slate-700">{rt.totalWarga} KK Terdata</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        rt.percent >= 80 ? 'bg-emerald-500' : rt.percent >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      }`} 
                      style={{ width: `${rt.percent}%` }}
                    />
                  </div>
                </div>

                {/* Keuangan RT */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200/60 font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 font-sans block">Terkumpul:</span>
                    <span className="font-bold text-emerald-700">{formatRupiah(rt.terkumpul)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-sans block">Tunggakan:</span>
                    <span className="font-bold text-rose-600">{formatRupiah(rt.tunggakan)}</span>
                  </div>
                </div>

                {/* Action Contact RT */}
                {waUrl && (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Chat WA Ketua {rt.name}</span>
                  </a>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Grid: Analisis Kepatuhan per Blok & Transaksi Pembayaran Terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolom Kiri: Kepatuhan Pembayaran Tiap Blok */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-600" />
              Kepatuhan Iuran per Blok
            </h2>
            <span className="text-xs text-slate-400">{NAMA_BULAN[currentMonth - 1]}</span>
          </div>

          <div className="space-y-4 pt-2">
            {blockStats.map(stat => (
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
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Rata-rata kepatuhan:</span>
            <span className="font-extrabold text-emerald-700 text-sm">{rasioKepatuhan}%</span>
          </div>
        </div>

        {/* Kolom Tengah & Kanan: Pembayaran Iuran Terbaru */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-brand-600" />
                Penerimaan Iuran Terkini
              </h2>
              <p className="text-xs text-slate-400">Transaksi iuran yang baru saja dikonfirmasi lunas</p>
            </div>
            <button
              onClick={() => setActiveTab('iuran')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              Buka Semua Tagihan &rarr;
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
                    const wargaItem = warga.find(w => w.id === p.wargaId)
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
                      Belum ada catatan pembayaran lunas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Baris Bawah: Pengeluaran Kas Terkini */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-rose-500" />
              Pengeluaran Kas RW Terkini
            </h2>
            <p className="text-xs text-slate-400">Biaya operasional lingkungan RW yang telah dicairkan</p>
          </div>
          <button
            onClick={() => setActiveTab('kas')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            Buka Buku Kas &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentExpenses.map(exp => (
            <div key={exp.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                  {exp.kategori}
                </span>
                <span>{formatTanggalIndo(exp.tanggal)}</span>
              </div>
              <p className="text-xs font-semibold text-slate-800 line-clamp-2">
                {exp.deskripsi}
              </p>
              <div className="text-sm font-extrabold text-rose-600 font-mono pt-1">
                -{formatRupiah(exp.nominal)}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
