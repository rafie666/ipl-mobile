import React, { useState } from 'react'
import { 
  Receipt, 
  Sparkles, 
  Search, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  Printer, 
  MessageCircle, 
  RotateCcw, 
  Trash2,
  Calendar,
  Filter,
  PlusCircle,
  FileCheck,
  AlertCircle,
  Zap
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { formatRupiah, formatTanggalIndo, NAMA_BULAN, generateWaReminder, generateWaKwitansi } from '../../utils/formatters'

export default function IuranView({ onOpenGenerate, onOpenTambahTagihan }) {
  const { 
    tagihan, 
    scopedTagihan,
    warga, 
    scopedWarga,
    batalBayarTagihan, 
    deleteTagihan, 
    setSelectedTagihanBayar, 
    setSelectedTagihanKwitansi,
    setSelectedTagihanVerifikasi,
    config,
    confirmDialog,
    rts
  } = useApp()

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const [bulan, setBulan] = useState(currentMonth)
  const [tahun, setTahun] = useState(currentYear)
  const [statusFilter, setStatusFilter] = useState('Semua')
  const [blokFilter, setBlokFilter] = useState('Semua')
  const [search, setSearch] = useState('')

  const activeTagihanList = scopedTagihan || tagihan
  const activeWargaList = scopedWarga || warga

  // Filter tagihan sesuai kriteria
  const filteredTagihan = activeTagihanList.filter(t => {
    const matchPeriode = statusFilter === 'Menunggu Verifikasi'
      ? true
      : (t.bulan === Number(bulan) && t.tahun === Number(tahun))
    const matchStatus = statusFilter === 'Semua' || t.status === statusFilter
    
    const targetWarga = activeWargaList.find(w => w.id === t.wargaId)
    const matchBlok = blokFilter === 'Semua' || targetWarga?.blok === blokFilter
    
    const matchSearch = !search || 
      (targetWarga?.nama.toLowerCase().includes(search.toLowerCase())) ||
      (targetWarga?.noRumah.toLowerCase().includes(search.toLowerCase()))

    return matchPeriode && matchStatus && matchBlok && matchSearch
  })

  // Hitung ringkasan periode terpilih
  const allInPeriode = activeTagihanList.filter(t => t.bulan === Number(bulan) && t.tahun === Number(tahun))
  const paidInPeriode = allInPeriode.filter(t => t.status === 'Lunas')
  const unpaidInPeriode = allInPeriode.filter(t => t.status !== 'Lunas')

  const totalNominalPeriode = allInPeriode.reduce((acc, curr) => acc + curr.total, 0)
  const totalLunasPeriode = paidInPeriode.reduce((acc, curr) => acc + curr.total, 0)
  const totalTunggakanPeriode = unpaidInPeriode.reduce((acc, curr) => acc + curr.total, 0)

  // Hitung antrian verifikasi bukti transfer
  const allPendingVerifikasi = activeTagihanList.filter(t => t.status === 'Menunggu Verifikasi')
  const allPerluDiperbaiki = activeTagihanList.filter(t => t.status === 'Perlu Diperbaiki' || t.status === 'Ditolak')

  return (
    <div className="space-y-6">
      
      {/* Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-emerald-600" />
            Billing & Tagihan Iuran Warga (IPL)
          </h1>
          <p className="text-xs text-slate-500">
            Kelola tagihan bulanan, catat pelunasan kas, dan terbitkan kwitansi resmi (RT & RW terpisah)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onOpenGenerate}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Generate Massal
          </button>

          <button
            onClick={onOpenTambahTagihan}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
          >
            <PlusCircle className="w-4 h-4" />
            + Tambah Tagihan Manual
          </button>
        </div>
      </div>

      {/* Baris Ringkasan Keuangan Periode Terpilih */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Potensi Tagihan</span>
          <div className="text-xl font-extrabold text-slate-900 font-mono mt-1">
            {formatRupiah(totalNominalPeriode)}
          </div>
          <p className="text-xs text-slate-500 mt-1">{allInPeriode.length} Rumah terbit tagihan</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-emerald-100 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Sudah Diterima (Lunas)</span>
          <div className="text-xl font-extrabold text-emerald-700 font-mono mt-1">
            {formatRupiah(totalLunasPeriode)}
          </div>
          <p className="text-xs text-slate-500 mt-1">{paidInPeriode.length} Rumah sudah bayar</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-amber-100 shadow-xs">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">Belum Diterima (Tunggakan)</span>
          <div className="text-xl font-extrabold text-amber-600 font-mono mt-1">
            {formatRupiah(totalTunggakanPeriode)}
          </div>
          <p className="text-xs text-slate-500 mt-1">{unpaidInPeriode.length} Rumah menunggak</p>
        </div>
      </div>

      {/* Alert Notifikasi Bukti Transfer Menunggu Verifikasi */}
      {allPendingVerifikasi.length > 0 && (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-xs">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-950 flex items-center gap-2">
                Ada {allPendingVerifikasi.length} Bukti Transfer Warga Menunggu Verifikasi
                <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-extrabold animate-pulse">
                  Perlu Ditindak
                </span>
              </h4>
              <p className="text-xs text-amber-800">
                Warga telah mengunggah bukti transfer via portal mandiri. Cek keabsahan struk dan klik "Terima" untuk melunaskan tagihan.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter('Menunggu Verifikasi')}
            className="self-start sm:self-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 flex items-center gap-1.5"
          >
            <FileCheck className="w-4 h-4" />
            Cek Bukti ({allPendingVerifikasi.length})
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        
        {/* Pilih Bulan & Tahun */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={bulan}
              onChange={(e) => setBulan(Number(e.target.value))}
              className="bg-transparent font-bold focus:outline-none cursor-pointer"
            >
              {NAMA_BULAN.map((nama, idx) => (
                <option key={idx + 1} value={idx + 1}>{nama}</option>
              ))}
            </select>
            <select
              value={tahun}
              onChange={(e) => setTahun(Number(e.target.value))}
              className="bg-transparent font-bold focus:outline-none cursor-pointer"
            >
              {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Status Pembayaran */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {['Semua', 'Lunas', 'Belum Lunas', 'Menunggu Verifikasi', 'Perlu Diperbaiki'].map(st => {
            const isSelected = statusFilter === st
            const count = st === 'Menunggu Verifikasi' 
              ? allPendingVerifikasi.length 
              : st === 'Perlu Diperbaiki' 
                ? allPerluDiperbaiki.length 
                : null

            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  isSelected ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{st}</span>
                {count !== null && count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isSelected ? 'bg-amber-500 text-white' : 'bg-amber-200 text-amber-900'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Filter Blok */}
        <select
          value={blokFilter}
          onChange={(e) => setBlokFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="Semua">Semua Blok</option>
          <option value="A">Blok A</option>
          <option value="B">Blok B</option>
          <option value="C">Blok C</option>
          <option value="D">Blok D</option>
        </select>

        {/* Search */}
        <div className="relative min-w-[200px] flex-1 sm:flex-initial">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari warga / no rumah..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

      </div>

      {/* Tabel Tagihan */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 text-left font-bold">Warga & Rumah</th>
                <th className="py-3 px-4 text-left font-bold">Rincian Pos Iuran</th>
                <th className="py-3 px-4 text-right font-bold">Total Tagihan</th>
                <th className="py-3 px-4 text-left font-bold">Status Bayar</th>
                <th className="py-3 px-4 text-left font-bold">Waktu & Metode</th>
                <th className="py-3 px-4 text-right font-bold">Aksi Transaksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTagihan.length > 0 ? (
                filteredTagihan.map((item) => {
                  const targetWarga = warga.find(w => w.id === item.wargaId)
                  const targetRt = (rts || []).find(r => r.id === targetWarga?.rt_id)
                  const rtRwLabel = `${targetRt?.name || 'RT'} / ${config?.rw || config?.rtRw || 'RW 15'}`
                  const isPaid = item.status === 'Lunas'
                  const waReminderLink = !isPaid 
                    ? generateWaReminder(targetWarga, item, `${config?.namaLingkungan || 'Perumahan'} ${rtRwLabel}`)
                    : ''
                  const waKwitansiLink = isPaid 
                    ? generateWaKwitansi(targetWarga, item, `${config?.namaLingkungan || 'Perumahan'} ${rtRwLabel}`)
                    : ''

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      
                      {/* Warga & Rumah */}
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        <div className="text-sm">{targetWarga?.nama || 'Warga'}</div>
                        <div className="text-[11px] font-medium text-emerald-700 flex items-center gap-1.5 flex-wrap">
                          <span>Blok {targetWarga?.blok} No. {targetWarga?.noRumah}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-500 font-normal">{NAMA_BULAN[item.bulan - 1]} {item.tahun}</span>
                        </div>
                      </td>

                      {/* Rincian Pos */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5 text-[11px] text-slate-500">
                          {item.rincian && item.rincian.length > 0 ? (
                            item.rincian.map((r, i) => (
                              <div key={i} className="flex justify-between gap-2 max-w-[200px]">
                                <span className="truncate">{r.nama}:</span>
                                <span className="font-mono">{formatRupiah(r.nominal)}</span>
                              </div>
                            ))
                          ) : (
                            <span>Paket Lengkap IPL</span>
                          )}
                        </div>
                      </td>

                      {/* Total Tagihan */}
                      <td className="py-3.5 px-4 text-right font-extrabold text-sm text-slate-900 font-mono">
                        {formatRupiah(item.total)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Lunas
                          </span>
                        ) : item.status === 'Menunggu Verifikasi' ? (
                          (item.metodeBayar?.includes('Transfer') || !item.metodeBayar || item.metodeBayar === 'Transfer Bank') ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                              <Zap className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                              Sedang Dicek Bot Moota
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              Verifikasi Struk
                            </span>
                          )
                        ) : item.status === 'Perlu Diperbaiki' || item.status === 'Ditolak' ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-100 text-orange-900 border border-orange-300">
                              <AlertCircle className="w-3.5 h-3.5 text-orange-600" />
                              Perlu Diperbaiki
                            </span>
                            {item.alasanPenolakan && (
                              <p className="text-[10px] text-orange-800 line-clamp-1 max-w-[150px]" title={item.alasanPenolakan}>
                                {item.alasanPenolakan}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            <Clock className="w-3.5 h-3.5 text-rose-600" />
                            Menunggak
                          </span>
                        )}
                      </td>

                      {/* Waktu & Metode */}
                      <td className="py-3.5 px-4">
                        {isPaid ? (
                          <div>
                            <div className="font-semibold text-slate-700">{formatTanggalIndo(item.tanggalBayar)}</div>
                            <div className="text-[10px] text-slate-400 font-medium">
                              via {item.metodeBayar || 'Tunai'} • {item.noKwitansi}
                            </div>
                          </div>
                        ) : item.status === 'Menunggu Verifikasi' ? (
                          <div>
                            <div className="font-bold text-amber-800 text-[11px]">{item.bankPengirim || 'Transfer Bank'}</div>
                            <div className="text-[10px] text-slate-500">
                              Upload: {item.tanggalUploadBukti ? formatTanggalIndo(item.tanggalUploadBukti) : 'Baru saja'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Menunggu pembayaran</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* JIKA MENUNGGU VERIFIKASI */}
                          {item.status === 'Menunggu Verifikasi' ? (
                            (item.metodeBayar?.includes('Transfer') || !item.metodeBayar || item.metodeBayar === 'Transfer Bank') ? (
                              <button
                                onClick={() => setSelectedTagihanVerifikasi(item)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition-all shadow-xs"
                                title="Pantau Status Bot Moota"
                              >
                                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                                Pantau Bot
                              </button>
                            ) : (
                              <button
                                onClick={() => setSelectedTagihanVerifikasi(item)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                                title="Cek Bukti & Verifikasi"
                              >
                                <FileCheck className="w-3.5 h-3.5" />
                                Cek Bukti
                              </button>
                            )
                          ) : !isPaid ? (
                            <>
                              <button
                                onClick={() => setSelectedTagihanBayar(item)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                                title="Catat Pembayaran"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                Bayar
                              </button>

                              {waReminderLink && (
                                <a
                                  href={waReminderLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                  title="Kirim Pengingat WhatsApp"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                </a>
                              )}
                            </>
                          ) : (
                            /* JIKA SUDAH LUNAS */
                            <>
                              <button
                                onClick={() => setSelectedTagihanKwitansi(item)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                                title="Cetak Kwitansi"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                Kwitansi
                              </button>

                              {waKwitansiLink && (
                                <a
                                  href={waKwitansiLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                  title="Share Kwitansi WA"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                </a>
                              )}

                              <button
                                onClick={async () => {
                                  const ok = await confirmDialog({
                                    title: 'Batalkan status lunas?',
                                    message: `Ini akan membatalkan status lunas tagihan untuk **${targetWarga?.nama || 'Warga'}**.`,
                                    subtext: 'Catatan penerimaan kas terkait juga akan disesuaikan otomatis.',
                                    confirmText: 'Batalkan Lunas'
                                  })
                                  if (ok) {
                                    batalBayarTagihan(item.id)
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                title="Batalkan Pelunasan"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          {/* Tombol Hapus Tagihan */}
                          <button
                            onClick={async () => {
                              const ok = await confirmDialog({
                                title: 'Hapus invoice tagihan?',
                                message: `Ini akan menghapus invoice tagihan untuk **${targetWarga?.nama || 'Warga'}**.`,
                                subtext: 'Invoice yang dihapus tidak dapat dipulihkan kembali.',
                                confirmText: 'Hapus'
                              })
                              if (ok) {
                                deleteTagihan(item.id)
                              }
                            }}
                            className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus Invoice"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    <div className="space-y-2">
                      <p className="font-semibold text-slate-600">
                        Tidak ada tagihan untuk periode {NAMA_BULAN[bulan - 1]} {tahun} yang sesuai filter.
                      </p>
                      <button
                        onClick={onOpenGenerate}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-emerald-700 transition-all"
                      >
                        <Sparkles className="w-4 h-4" />
                        Generate Tagihan Periode Ini
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Menampilkan {filteredTagihan.length} tagihan</span>
          <span>Sistem Anti-Duplikasi Aktif</span>
        </div>

      </div>

    </div>
  )
}
