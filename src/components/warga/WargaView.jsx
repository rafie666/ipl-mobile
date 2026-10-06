import React, { useState } from 'react'
import { 
  Users, 
  Search, 
  UserPlus, 
  Phone, 
  Edit3, 
  Trash2, 
  MessageCircle, 
  Home, 
  CheckCircle2, 
  Clock,
  Filter,
  Eye,
  Hash,
  MapPin,
  Building2,
  FileSpreadsheet
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { generateWaReminder } from '../../utils/formatters'
import WargaDetailModal from './WargaDetailModal'

export default function WargaView({ onOpenAddWarga, onEditWarga }) {
  const { warga, scopedWarga, deleteWarga, tagihan, scopedTagihan, config, confirmDialog, isRT, currentRT, rts } = useApp()

  const [searchTerm, setSearchTerm] = useState('')
  const [filterBlok, setFilterBlok] = useState('Semua')
  const [filterStatus, setFilterStatus] = useState('Semua')
  const [selectedDetailWarga, setSelectedDetailWarga] = useState(null)

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const activeWargaList = scopedWarga || warga
  const activeTagihanList = scopedTagihan || tagihan

  // Filter data warga
  const filteredWarga = activeWargaList.filter(w => {
    const term = searchTerm.toLowerCase()
    const matchSearch = 
      (w.nama && w.nama.toLowerCase().includes(term)) ||
      (w.noRumah && w.noRumah.toLowerCase().includes(term)) ||
      (w.kodeUnik && String(w.kodeUnik).includes(term)) ||
      (w.nik && w.nik.includes(term)) ||
      (w.noKk && w.noKk.includes(term)) ||
      (w.noHp && w.noHp.includes(term)) ||
      (w.pekerjaan && w.pekerjaan.toLowerCase().includes(term))
    
    const matchBlok = filterBlok === 'Semua' || w.blok === filterBlok
    const matchStatus = filterStatus === 'Semua' || w.statusHuni === filterStatus

    return matchSearch && matchBlok && matchStatus
  })

  // Get status iuran bulan ini untuk setiap warga
  const getStatusIuran = (wargaId) => {
    const bill = activeTagihanList.find(t => t.wargaId === wargaId && t.bulan === currentMonth && t.tahun === currentYear)
    if (!bill) return { status: 'Belum Terbit', bill: null }
    return { status: bill.status, bill }
  }

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            Data Kependudukan & Kode Unik Warga
          </h1>
          <p className="text-xs text-slate-500">
            Kelola data lengkap kepala keluarga, NIK, anggota keluarga, nomor rumah, koordinat GIS, dan kode unik iuran warga
          </p>
        </div>

        <button
          onClick={onOpenAddWarga}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md self-start sm:self-auto cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Tambah Warga Baru
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama, kode unik (#101), NIK, nomor rumah, atau HP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>

        {/* Filter Blok */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Blok:
          </span>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            {['Semua', 'A', 'B', 'C', 'D'].map(b => (
              <button
                key={b}
                onClick={() => setFilterBlok(b)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  filterBlok === b ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Status Hunian */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="Semua">Semua Status Huni</option>
          <option value="Tetap">Warga Tetap</option>
          <option value="Kontrak">Warga Kontrak</option>
          <option value="Kosong">Rumah Kosong</option>
        </select>

      </div>

      {/* Tabel Data Warga */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3 text-center font-bold">Kode Unik</th>
                <th className="py-3 px-4 text-left font-bold">Unit / Rumah</th>
                <th className="py-3 px-4 text-left font-bold">Nama Kepala Keluarga & NIK</th>
                <th className="py-3 px-4 text-left font-bold">Status Huni / Milik</th>
                <th className="py-3 px-4 text-left font-bold">Kontak WA</th>
                <th className="py-3 px-3 text-center font-bold">Keluarga</th>
                <th className="py-3 px-3 text-center font-bold">Titik GIS</th>
                <th className="py-3 px-4 text-left font-bold">Status Iuran Bln Ini</th>
                <th className="py-3 px-4 text-right font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWarga.length > 0 ? (
                filteredWarga.map((w) => {
                  const { status, bill } = getStatusIuran(w.id)
                  const waReminderLink = bill && status !== 'Lunas' 
                    ? generateWaReminder(w, bill, `${config?.namaLingkungan} ${config?.rtRw}`)
                    : ''

                  const familyCount = Array.isArray(w.anggotaKeluarga) ? w.anggotaKeluarga.length : (w.jumlahJiwa || 1)
                  const hasGps = Boolean(w.lat && w.lng)

                  return (
                    <tr 
                      key={w.id} 
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      onClick={() => setSelectedDetailWarga(w)}
                    >
                      {/* Kode Unik Badge */}
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block font-mono font-extrabold text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-lg border border-emerald-200 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          #{w.kodeUnik || '---'}
                        </span>
                      </td>

                      {/* Unit Rumah */}
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center font-mono text-xs font-extrabold">
                            {w.blok}
                          </span>
                          <span>No. {w.noRumah}</span>
                        </div>
                      </td>

                      {/* Nama & NIK */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800 text-sm">{w.nama}</div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                          {w.nik ? <span>NIK: {w.nik}</span> : <span>{w.pekerjaan || 'Warga'}</span>}
                        </div>
                      </td>

                      {/* Status Huni & Kepemilikan */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            w.statusHuni === 'Tetap' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : w.statusHuni === 'Kontrak'
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {w.statusHuni}
                          </span>
                          {w.statusKepemilikan && (
                            <div className="text-[10px] text-slate-400 font-medium">{w.statusKepemilikan}</div>
                          )}
                        </div>
                      </td>

                      {/* Kontak */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        {w.noHp ? (
                          <a
                            href={`https://wa.me/${w.noHp.replace(/\D/g, '').replace(/^0/, '62')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 font-mono text-slate-700 hover:text-emerald-700 hover:underline"
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{w.noHp}</span>
                          </a>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Keluarga / Jiwa */}
                      <td className="py-3.5 px-3 text-center">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full text-[11px]" title={`${familyCount} Anggota Keluarga`}>
                          👨‍👩‍👧‍👦 {familyCount}
                        </span>
                      </td>

                      {/* Titik GPS */}
                      <td className="py-3.5 px-3 text-center">
                        {hasGps ? (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md" title={`Lat: ${w.lat}, Lng: ${w.lng}`}>
                            <MapPin className="w-3 h-3 text-emerald-600" /> Ada
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">-</span>
                        )}
                      </td>

                      {/* Status Iuran */}
                      <td className="py-3.5 px-4">
                        {status === 'Lunas' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Lunas
                          </span>
                        ) : status === 'Belum Lunas' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Belum Bayar
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Belum Ada Tagihan</span>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Detail button */}
                          <button
                            onClick={() => setSelectedDetailWarga(w)}
                            className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Lihat Detail Profil Warga"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Reminder WA button if unpaid */}
                          {waReminderLink && (
                            <a
                              href={waReminderLink}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Kirim Pesan Tagihan WA"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          )}

                          {/* Edit button */}
                          <button
                            onClick={() => onEditWarga(w)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Data Warga"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={async () => {
                              const ok = await confirmDialog({
                                title: 'Hapus data warga?',
                                message: `Ini akan menghapus data warga **${w.nama}** (Blok ${w.blok}/${w.noRumah}).`,
                                subtext: 'Data warga yang dihapus tidak dapat dipulihkan kembali.',
                                confirmText: 'Hapus'
                              })
                              if (ok) {
                                deleteWarga(w.id)
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Warga"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Tidak ada data warga yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Menampilkan <span className="font-bold text-slate-800">{filteredWarga.length}</span> dari <span className="font-bold text-slate-800">{warga.length}</span> total warga terdaftar
          </div>
          <div className="flex gap-4">
            <span>Tetap: <strong className="text-slate-700">{warga.filter(w => w.statusHuni === 'Tetap').length}</strong></span>
            <span>Kontrak: <strong className="text-slate-700">{warga.filter(w => w.statusHuni === 'Kontrak').length}</strong></span>
            <span>Total Jiwa: <strong className="text-slate-700">{warga.reduce((acc, curr) => acc + (curr.jumlahJiwa || 1), 0)} orang</strong></span>
          </div>
        </div>

      </div>

      {/* Modal Detail Profil Lengkap Warga */}
      <WargaDetailModal
        isOpen={!!selectedDetailWarga}
        onClose={() => setSelectedDetailWarga(null)}
        warga={selectedDetailWarga}
        onEdit={(w) => {
          setSelectedDetailWarga(null)
          onEditWarga(w)
        }}
        rts={rts}
        config={config}
      />

    </div>
  )
}
