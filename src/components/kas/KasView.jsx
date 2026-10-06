import React, { useState } from 'react'
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Search, 
  Trash2, 
  Calendar,
  Filter,
  DollarSign
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { formatRupiah, formatTanggalIndo } from '../../utils/formatters'

export default function KasView({ onOpenAddKas }) {
  const { scopedKas, deleteKas, confirmDialog, isAdmin, isRT, currentRT } = useApp()

  const [filterTipe, setFilterTipe] = useState('Semua')
  const [searchTerm, setSearchTerm] = useState('')

  // Hitung total kas scoped (terisolasi per RT / RW)
  const currentKasList = scopedKas || []
  const totalMasuk = currentKasList.filter(k => k.tipe === 'Masuk').reduce((acc, curr) => acc + curr.nominal, 0)
  const totalKeluar = currentKasList.filter(k => k.tipe === 'Keluar').reduce((acc, curr) => acc + curr.nominal, 0)
  const saldoAkhir = totalMasuk - totalKeluar

  // Filter transaksi
  const filteredKas = currentKasList.filter(k => {
    const matchTipe = filterTipe === 'Semua' || k.tipe === filterTipe
    const matchSearch = !searchTerm || 
      k.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.kategori.toLowerCase().includes(searchTerm.toLowerCase())

    return matchTipe && matchSearch
  }).sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))

  return (
    <div className="space-y-6">
      
      {/* Header & Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase tracking-wider mb-1.5 border font-mono ${
            isRT 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-purple-50 text-purple-700 border-purple-200'
          }">
            <Wallet className="w-3.5 h-3.5" />
            <span>{isRT ? `Kas Otonom ${currentRT?.name || 'RT'}` : 'Kas Terpusat Lingkungan RW'}</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            {isRT ? `Buku Kas Keuangan ${currentRT?.name || 'RT'}` : 'Buku Kas & Keuangan Terpusat RW'}
          </h1>
          <p className="text-xs text-slate-500">
            {isRT 
              ? `Pencatatan arus dana masuk (IPL RT) dan pengeluaran operasional lokal ${currentRT?.name || 'RT'}. Terpisah dari kas RW.` 
              : 'Pencatatan arus kas khusus pengeluaran dan operasional tingkat lingkungan RW. Terpisah dari kas RT.'}
          </p>
        </div>

        <button
          onClick={onOpenAddKas}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          {isRT ? `Catat Kas ${currentRT?.name || 'RT'}` : 'Catat Kas RW'}
        </button>
      </div>

      {/* Saldo Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Saldo Kas Riil */}
        <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-md space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            {isRT ? `Saldo Kas Riil ${currentRT?.name || 'RT'} Saat Ini` : 'Saldo Kas Riil RW Saat Ini'}
          </span>
          <div className="text-2xl font-extrabold font-mono text-emerald-400">
            {formatRupiah(saldoAkhir)}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {isRT ? `Total Kas Masuk dikurangi Pengeluaran ${currentRT?.name || 'RT'}` : 'Total Kas Masuk dikurangi Pengeluaran RW'}
          </p>
        </div>

        {/* Total Pemasukan */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Total Pemasukan</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-700">
            {formatRupiah(totalMasuk)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dari {currentKasList.filter(k => k.tipe === 'Masuk').length} transaksi penerimaan
          </p>
        </div>

        {/* Total Pengeluaran */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Total Pengeluaran</span>
            <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <ArrowDownRight className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold font-mono text-rose-600">
            {formatRupiah(totalKeluar)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dari {currentKasList.filter(k => k.tipe === 'Keluar').length} pos pengeluaran
          </p>
        </div>

      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        
        {/* Filter Tipe */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {['Semua', 'Masuk', 'Keluar'].map(tp => (
            <button
              key={tp}
              onClick={() => setFilterTipe(tp)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filterTipe === tp ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tp === 'Masuk' ? 'Pemasukan' : tp === 'Keluar' ? 'Pengeluaran' : 'Semua Arus'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px] flex-1 sm:flex-initial">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari deskripsi atau kategori kas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

      </div>

      {/* Tabel Mutasi Kas */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 text-left font-bold">Tanggal</th>
                <th className="py-3 px-4 text-left font-bold">Arus & Kategori</th>
                <th className="py-3 px-4 text-left font-bold">Keterangan / Deskripsi</th>
                <th className="py-3 px-4 text-right font-bold">Nominal Mutasi</th>
                <th className="py-3 px-4 text-center font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredKas.length > 0 ? (
                filteredKas.map((k) => {
                  const isMasuk = k.tipe === 'Masuk'
                  return (
                    <tr key={k.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-700 whitespace-nowrap">
                        {formatTanggalIndo(k.tanggal)}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                            isMasuk ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {isMasuk ? <ArrowUpRight className="w-3 h-3 text-emerald-600" /> : <ArrowDownRight className="w-3 h-3 text-rose-600" />}
                            {k.tipe}
                          </span>
                          <span className="font-semibold text-slate-800 text-[11px]">{k.kategori}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {k.deskripsi}
                      </td>

                      <td className={`py-3.5 px-4 text-right font-extrabold font-mono text-sm whitespace-nowrap ${
                        isMasuk ? 'text-emerald-700' : 'text-rose-600'
                      }`}>
                        {isMasuk ? `+${formatRupiah(k.nominal)}` : `-${formatRupiah(k.nominal)}`}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={async () => {
                            const ok = await confirmDialog({
                              title: 'Hapus catatan kas?',
                              message: `Ini akan menghapus catatan kas **${k.deskripsi}** (${formatRupiah(k.nominal)}).`,
                              subtext: 'Saldo kas keseluruhan akan disesuaikan kembali.',
                              confirmText: 'Hapus'
                            })
                            if (ok) {
                              deleteKas(k.id)
                            }
                          }}
                          className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Catatan Kas"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Tidak ada catatan transaksi kas yang cocok dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Menampilkan {filteredKas.length} catatan mutasi</span>
          <span className="font-semibold">Transparansi Keuangan Terbuka</span>
        </div>
      </div>

    </div>
  )
}
