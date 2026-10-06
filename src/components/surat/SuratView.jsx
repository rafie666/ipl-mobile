import React, { useState } from 'react'
import { 
  FileText, 
  Plus, 
  Search, 
  Clock, 
  CheckCircle2, 
  Printer, 
  AlertCircle, 
  Trash2, 
  Check, 
  X, 
  User, 
  FileCheck,
  Building2,
  ExternalLink
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { formatTanggalIndo } from '../../utils/formatters'
import SuratModal from './SuratModal'
import CetakSuratModal from './CetakSuratModal'

export default function SuratView() {
  const { 
    surat, 
    scopedSurat, 
    updateStatusSurat, 
    deleteSurat, 
    warga, 
    currentUser, 
    isWarga, 
    isAdminLoggedIn, 
    confirmDialog 
  } = useApp()

  const [modalOpen, setModalOpen] = useState(false)
  const [cetakModalSurat, setCetakModalSurat] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('Semua')

  const activeList = scopedSurat || surat || []

  // Stats
  const totalSurat = activeList.length
  const pendingCount = activeList.filter(s => s.status === 'Diajukan' || s.status === 'Diproses').length
  const disetujuiCount = activeList.filter(s => s.status === 'Disetujui').length

  // Filtered List
  const filteredList = activeList.filter(item => {
    const targetWarga = warga.find(w => w.id === item.wargaId)
    const matchSearch = item.jenisSurat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.keperluan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.noSurat && item.noSurat.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (targetWarga?.nama && targetWarga.nama.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchStatus = filterStatus === 'Semua' || item.status === filterStatus

    return matchSearch && matchStatus
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Disetujui':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Disetujui & Siap Cetak
          </span>
        )
      case 'Diproses':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Sedang Diproses RT
          </span>
        )
      case 'Ditolak':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            Ditolak
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Menunggu Verifikasi RT
          </span>
        )
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <FileText className="w-5 h-5" />
            </div>
            <span>Layanan Surat Pengantar RT/RW Online</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pengajuan permohonan surat pengantar KTP, Domisili, SKCK, Usaha, dan cetak surat resmi mandiri
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Ajukan Surat Baru</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Permohonan</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalSurat}</div>
          <span className="text-[11px] text-slate-500">Berkas surat diajukan</span>
        </div>

        <div className="bg-amber-50/60 p-4 sm:p-5 rounded-2xl border border-amber-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Menunggu Persetujuan</span>
          <div className="text-2xl font-black text-amber-900 mt-1">{pendingCount}</div>
          <span className="text-[11px] text-amber-700">Perlu diproses pengurus RT</span>
        </div>

        <div className="bg-emerald-50/60 p-4 sm:p-5 rounded-2xl border border-emerald-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Surat Disetujui</span>
          <div className="text-2xl font-black text-emerald-900 mt-1">{disetujuiCount}</div>
          <span className="text-[11px] text-emerald-700">Siap dicetak / diambil</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari jenis surat, keperluan, atau nomor surat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium transition-all"
          />
        </div>

        {/* Filter Status */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold hidden sm:inline">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="Semua">Semua Status</option>
            <option value="Diajukan">Diajukan (Menunggu)</option>
            <option value="Diproses">Sedang Diproses</option>
            <option value="Disetujui">Disetujui (Siap Cetak)</option>
            <option value="Ditolak">Ditolak</option>
          </select>
        </div>
      </div>

      {/* List of Letters */}
      <div className="space-y-4">
        {filteredList.length > 0 ? (
          filteredList.map((item) => {
            const pemohonWarga = warga.find(w => w.id === item.wargaId)
            const isMine = currentUser?.resident_id === item.wargaId
            const isApproved = item.status === 'Disetujui'

            return (
              <div 
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all space-y-4"
              >
                {/* Top Row: Jenis Surat, Tanggal, Status */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-extrabold border border-emerald-200 flex items-center gap-1.5">
                        <FileCheck className="w-4 h-4 text-emerald-600" />
                        {item.jenisSurat}
                      </span>
                      {isMine && (
                        <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">
                          Surat Anda
                        </span>
                      )}
                    </div>
                    {item.noSurat && (
                      <span className="text-[11px] font-mono text-slate-400 block">
                        No: {item.noSurat}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(item.status)}

                    {/* Tombol Cetak Dokumen jika sudah disetujui */}
                    {isApproved && (
                      <button
                        onClick={() => setCetakModalSurat(item)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Cetak Surat</span>
                      </button>
                    )}

                    {/* Actions for RT/Admin (Approve / Reject) */}
                    {isAdminLoggedIn && item.status !== 'Disetujui' && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            updateStatusSurat(item.id, 'Disetujui', 'Surat telah diverifikasi dan disetujui oleh Ketua RT.')
                          }}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-200 transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Setujui</span>
                        </button>
                        <button
                          onClick={() => {
                            updateStatusSurat(item.id, 'Ditolak', 'Mohon lengkapi persyaratan administrasi di rumah RT terlebih dahulu.')
                          }}
                          className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold border border-rose-200 transition-colors flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Tolak</span>
                        </button>
                      </div>
                    )}

                    {/* Delete button (Admin or Owner) */}
                    {(isAdminLoggedIn || isMine) && (
                      <button
                        onClick={async () => {
                          const ok = await confirmDialog({
                            title: 'Hapus Permohonan Surat?',
                            message: `Hapus permohonan ${item.jenisSurat}?`,
                            subtext: 'Tindakan ini tidak dapat dibatalkan.',
                            confirmText: 'Hapus'
                          })
                          if (ok) deleteSurat(item.id)
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hapus Permohonan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Content: Pemohon, NIK, Keperluan */}
                <div className="space-y-2 text-xs">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-600">
                    <span className="font-bold text-slate-900 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {pemohonWarga?.nama || 'Warga'} (Blok {pemohonWarga?.blok || 'A'}-{pemohonWarga?.noRumah || '01'})
                    </span>
                    <span>•</span>
                    <span className="font-mono text-slate-500">NIK: {item.nikPemohon}</span>
                    <span>•</span>
                    <span className="text-slate-400">Diajukan: {formatTanggalIndo(item.tanggalPengajuan)}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                    <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider mb-0.5">
                      Maksud & Keperluan:
                    </span>
                    <p className="text-slate-800 font-medium">
                      {item.keperluan}
                    </p>
                  </div>

                  {/* Catatan Pengurus jika ada */}
                  {item.catatanPengurus && (
                    <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-emerald-900">
                      <span className="font-bold block text-[11px] mb-0.5">📌 Catatan Pengurus RT:</span>
                      <p className="font-medium text-slate-700">{item.catatanPengurus}</p>
                    </div>
                  )}
                </div>

              </div>
            )
          })
        ) : (
          <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-sm">Belum ada permohonan surat pengantar</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Warga dapat mengajukan surat pengantar resmi secara online kapan saja tanpa harus mengisi formulir manual.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Ajukan Permohonan Surat Sekarang</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal Ajukan Surat */}
      <SuratModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      {/* Modal Cetak Surat Resmi */}
      <CetakSuratModal
        suratItem={cetakModalSurat}
        isOpen={!!cetakModalSurat}
        onClose={() => setCetakModalSurat(null)}
      />

    </div>
  )
}
