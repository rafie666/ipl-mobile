import React, { useState } from 'react'
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar, 
  CheckCircle2, 
  ShieldCheck, 
  Search, 
  Filter,
  PieChart,
  Building2,
  Receipt
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { formatRupiah, formatTanggalIndo } from '../../utils/formatters'

export default function KasWargaView() {
  const { kas, scopedKas, currentRT, config } = useApp()

  const [searchTerm, setSearchTerm] = useState('')
  const [filterTipe, setFilterTipe] = useState('Semua')

  const activeKasList = scopedKas || kas || []

  // Hitung total saldo, pemasukan, dan pengeluaran
  const totalPemasukan = activeKasList
    .filter(k => k.tipe === 'Masuk')
    .reduce((acc, curr) => acc + Number(curr.nominal), 0)

  const totalPengeluaran = activeKasList
    .filter(k => k.tipe === 'Keluar')
    .reduce((acc, curr) => acc + Number(curr.nominal), 0)

  const saldoKas = totalPemasukan - totalPengeluaran

  // Filter list
  const filteredKas = activeKasList.filter(item => {
    const matchSearch = item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kategori.toLowerCase().includes(searchTerm.toLowerCase())
    const matchTipe = filterTipe === 'Semua' || item.tipe === filterTipe
    return matchSearch && matchTipe
  })

  // Kategori ringkasan
  const kategoriKeluar = activeKasList
    .filter(k => k.tipe === 'Keluar')
    .reduce((acc, curr) => {
      acc[curr.kategori] = (acc[curr.kategori] || 0) + Number(curr.nominal)
      return acc
    }, {})

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-200 border border-white/10 text-xs font-bold font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Transparansi Kas Lingkungan Terbuka</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Laporan Keuangan & Kas Warga
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
            Laporan akuntabilitas publik pengelolaan dana Iuran Pengelolaan Lingkungan (IPL) untuk kebersihan, keamanan satpam, dan fasilitas umum {currentRT?.name || 'RT 01'}.
          </p>
        </div>
      </div>

      {/* KPI Cards: Saldo, Pemasukan, Pengeluaran */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Saldo Akhir */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Saldo Kas Tersedia</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-800 font-mono">
            {formatRupiah(saldoKas)}
          </div>
          <p className="text-[11px] text-slate-500">
            Saldo kas riil kas lingkungan saat ini
          </p>
        </div>

        {/* Total Pemasukan */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Total Pemasukan Kas</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {formatRupiah(totalPemasukan)}
          </div>
          <p className="text-[11px] text-emerald-700 font-medium">
            Dari Iuran IPL bulanan & kegiatan warga
          </p>
        </div>

        {/* Total Pengeluaran */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">Total Pengeluaran Kas</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {formatRupiah(totalPengeluaran)}
          </div>
          <p className="text-[11px] text-rose-700 font-medium">
            Honor satpam, armada sampah, & perbaikan
          </p>
        </div>
      </div>

      {/* Alokasi Pengeluaran Fasilitas & Operasional */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <PieChart className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-extrabold text-slate-900">
            Rincian Alokasi Penggunaan Anggaran Kas Lingkungan
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(kategoriKeluar).length > 0 ? (
            Object.entries(kategoriKeluar).map(([kat, nominal], idx) => {
              const persentase = totalPengeluaran > 0 ? Math.round((nominal / totalPengeluaran) * 100) : 0
              return (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <span className="truncate">{kat}</span>
                    <span className="text-emerald-700">{persentase}%</span>
                  </div>
                  <div className="text-base font-extrabold text-slate-900 font-mono">
                    {formatRupiah(nominal)}
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-full rounded-full" 
                      style={{ width: `${persentase}%` }}
                    />
                  </div>
                </div>
              )
            })
          ) : (
            <p className="text-xs text-slate-400 col-span-full">Belum ada data rincian pengeluaran.</p>
          )}
        </div>
      </div>

      {/* Rincian Transaksi Arus Kas */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Riwayat Transaksi Pemasukan & Pengeluaran Terbuka
            </h2>
            <p className="text-xs text-slate-500">
              Daftar seluruh mutasi kas lingkungan yang tercatat resmi
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <select
              value={filterTipe}
              onChange={(e) => setFilterTipe(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="Semua">Semua Arus</option>
              <option value="Masuk">Pemasukan (+)</option>
              <option value="Keluar">Pengeluaran (-)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 text-left font-bold">Tanggal</th>
                <th className="py-3 px-4 text-left font-bold">Jenis / Pos</th>
                <th className="py-3 px-4 text-left font-bold">Keterangan Transaksi</th>
                <th className="py-3 px-4 text-right font-bold">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredKas.length > 0 ? (
                filteredKas.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {formatTanggalIndo(k.tanggal)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        k.tipe === 'Masuk' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {k.tipe === 'Masuk' ? '📥 Pemasukan' : '📤 Pengeluaran'}
                      </span>
                      <span className="block text-[11px] text-slate-500 font-semibold mt-0.5">
                        {k.kategori}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-medium">
                      {k.deskripsi}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap">
                      <span className={k.tipe === 'Masuk' ? 'text-emerald-700' : 'text-rose-700'}>
                        {k.tipe === 'Masuk' ? '+' : '-'}{formatRupiah(k.nominal)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 italic">
                    Tidak ada transaksi kas yang sesuai dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
