import React, { useState } from 'react'
import { 
  X, 
  User, 
  Home, 
  Phone, 
  Mail, 
  ShieldAlert, 
  Calendar, 
  Heart, 
  Briefcase, 
  CreditCard, 
  FileText, 
  Edit3, 
  MessageCircle,
  Hash,
  Users,
  Building2,
  CheckCircle2,
  MapPin,
  GraduationCap,
  Droplet
} from 'lucide-react'
import { formatTanggalIndo } from '../../utils/formatters'
import KeluargaModal from './KeluargaModal'

export default function WargaDetailModal({ isOpen, onClose, warga, onEdit, rts, config }) {
  const [isKeluargaModalOpen, setIsKeluargaModalOpen] = useState(false)

  if (!isOpen || !warga) return null

  const targetRt = rts?.find(r => r.id === warga.rt_id)
  const rtLabel = targetRt?.name || 'RT 01'

  // Clean WA link
  const getWaLink = (phone, text = '') => {
    if (!phone) return '#'
    let clean = phone.replace(/\D/g, '')
    if (clean.startsWith('0')) clean = '62' + clean.slice(1)
    return `https://wa.me/${clean}${text ? `?text=${encodeURIComponent(text)}` : ''}`
  }

  const anggotaList = warga.anggotaKeluarga || []

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        
        {/* Header with Resident Summary & Kode Unik Badge */}
        <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg shrink-0">
              {warga.nama?.charAt(0) || 'W'}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono font-bold flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  Kode Unik: #{warga.kodeUnik || '---'}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  warga.statusHuni === 'Tetap' 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-amber-500 text-white'
                }`}>
                  Warga {warga.statusHuni}
                </span>
                {warga.statusKepemilikan && (
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200 text-[11px] font-semibold">
                    {warga.statusKepemilikan}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-black tracking-tight">{warga.nama}</h2>
              <p className="text-xs text-slate-300 flex items-center gap-2">
                <span>📍 Blok {warga.blok} No. {warga.noRumah}</span>
                <span>•</span>
                <span>{rtLabel} ({config?.namaLingkungan || 'Perumahan'})</span>
              </p>
            </div>
          </div>
        </div>

        {/* Content Body with detailed sections */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          
          {/* Section 1: Detail Anggota Keluarga (KK) */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Susunan Anggota Keluarga ({anggotaList.length || warga.jumlahJiwa || 1} Jiwa)</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsKeluargaModalOpen(true)}
                className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold rounded-lg text-[11px] transition-colors cursor-pointer"
              >
                ✏️ Kelola Data KK
              </button>
            </div>

            {anggotaList.length > 0 ? (
              <div className="divide-y divide-slate-200/60 bg-white rounded-xl border border-slate-200 overflow-hidden">
                {anggotaList.map((m, idx) => (
                  <div key={m.id || idx} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{m.nama}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.hubungan === 'Kepala Keluarga' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {m.hubungan}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {m.nik ? `NIK: ${m.nik}` : 'NIK: -'}
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-2">
                      <span>{m.jenisKelamin}</span>
                      <span>•</span>
                      <span>{m.pekerjaan || 'Belum Bekerja'}</span>
                      {m.golonganDarah && m.golonganDarah !== '-' && (
                        <>
                          <span>•</span>
                          <span className="font-bold text-rose-600">Gol. {m.golonganDarah}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-400 text-center">
                Belum ada rincian anggota keluarga. Klik 'Kelola Data KK' untuk melengkapi.
              </div>
            )}
          </div>

          {/* Grid Section 2: Data Rumah & Lokasi Koordinat */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <Home className="w-4 h-4 text-indigo-600" />
              <span>Unit Rumah & Titik Koordinat Lokasi</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Alamat Unit</span>
                <span className="font-bold text-slate-800">Blok {warga.blok} No. {warga.noRumah}</span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Status Kepemilikan</span>
                <span className="font-bold text-slate-800">{warga.statusKepemilikan || (warga.statusHuni === 'Kontrak' ? 'Sewa / Kontrak' : 'Milik Sendiri')}</span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Mulai Menetap Sejak</span>
                <span className="font-bold text-slate-800">
                  {warga.tglMasuk ? formatTanggalIndo(warga.tglMasuk) : 'Tahun 2020'}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Koordinat GIS Rumah</span>
                <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 inline-flex">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{warga.lat ? `${Number(warga.lat).toFixed(5)}, ${Number(warga.lng).toFixed(5)}` : 'Belum Ditandai'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Grid Section 3: Kontak & Kontak Darurat */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Kontak & Kontak Darurat</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Nomor WhatsApp / HP</span>
                {warga.noHp ? (
                  <a
                    href={getWaLink(warga.noHp)}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono font-bold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{warga.noHp}</span>
                  </a>
                ) : (
                  <span className="text-slate-400">-</span>
                )}
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Alamat Email</span>
                <span className="font-mono text-slate-700">{warga.email || '-'}</span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-rose-500 block">Nama Kontak Darurat</span>
                <span className="font-bold text-slate-800">
                  {warga.kontakDaruratNama ? `${warga.kontakDaruratNama} (${warga.kontakDaruratHubungan || 'Keluarga'})` : '-'}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-rose-500 block">No. HP Darurat</span>
                {warga.kontakDaruratHp ? (
                  <a
                    href={getWaLink(warga.kontakDaruratHp)}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono font-bold text-rose-600 hover:underline flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{warga.kontakDaruratHp}</span>
                  </a>
                ) : (
                  <span className="text-slate-400">-</span>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Catatan Pengurus Lingkungan */}
          {warga.catatan && (
            <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-1">
              <span className="text-[10px] uppercase font-bold text-amber-800 block flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                Catatan / Peran di Lingkungan:
              </span>
              <p className="text-slate-700 font-medium leading-relaxed">
                {warga.catatan}
              </p>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          {warga.noHp ? (
            <a
              href={getWaLink(warga.noHp, `Halo Bpk/Ibu ${warga.nama}, kami dari Pengurus ${rtLabel}...`)}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat WhatsApp</span>
            </a>
          ) : (
            <div></div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose()
                if (onEdit) onEdit(warga)
              }}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Data</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>

      {/* Modal Kelola Anggota Keluarga */}
      <KeluargaModal
        isOpen={isKeluargaModalOpen}
        onClose={() => setIsKeluargaModalOpen(false)}
        targetWarga={warga}
      />
    </div>
  )
}
