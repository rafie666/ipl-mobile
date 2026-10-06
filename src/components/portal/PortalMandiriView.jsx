import React, { useState } from 'react'
import { 
  SearchCheck, 
  Home, 
  User, 
  CheckCircle2, 
  Clock, 
  Printer, 
  MessageCircle, 
  Building2,
  Calendar,
  CreditCard,
  Phone,
  Trophy,
  Image,
  X,
  Upload
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { formatRupiah, formatTanggalIndo, NAMA_BULAN } from '../../utils/formatters'
import UploadBuktiModal from './UploadBuktiModal'
import UploadBuktiEventModal from '../events/UploadBuktiEventModal'

export default function PortalMandiriView() {
  const { warga, rts, tagihan, events, tagihanEvents, config, setSelectedTagihanKwitansi } = useApp()

  const [selectedWargaId, setSelectedWargaId] = useState(warga[0]?.id || '')
  const [filterSearch, setFilterSearch] = useState('')
  const [zoomPoster, setZoomPoster] = useState(null)
  const [uploadModalTagihan, setUploadModalTagihan] = useState(null)
  const [uploadModalEventItem, setUploadModalEventItem] = useState(null)

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  // Selected warga object
  const activeWarga = warga.find(w => w.id === selectedWargaId) || warga[0]
  const targetRt = rts?.find(r => r.id === activeWarga?.rt_id) || rts?.[0]
  const rtPhone = targetRt?.kontak || config?.kontakRt || '081234567890'

  // All bills for this warga sorted newest first
  const wargaBills = tagihan
    .filter(t => t.wargaId === activeWarga?.id)
    .sort((a, b) => (b.tahun * 12 + b.bulan) - (a.tahun * 12 + a.bulan))

  const currentBill = wargaBills.find(b => b.bulan === currentMonth && b.tahun === currentYear)
  const isCurrentPaid = currentBill?.status === 'Lunas'

  // Filtered dropdown options
  const searchOptions = warga.filter(w => 
    w.nama.toLowerCase().includes(filterSearch.toLowerCase()) ||
    w.noRumah.toLowerCase().includes(filterSearch.toLowerCase()) ||
    w.blok.toLowerCase().includes(filterSearch.toLowerCase())
  )

  // Link konfirmasi bayar via WhatsApp ke Bendahara RT
  const getConfirmWaLink = () => {
    let cleanPhone = rtPhone.replace(/\D/g, '')
    if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1)
    
    const text = `Halo Pengurus ${targetRt?.name || 'RT'},%0ASaya *${activeWarga?.nama}* dari *Blok ${activeWarga?.blok} No. ${activeWarga?.noRumah}* ingin konfirmasi pembayaran iuran IPL periode *${NAMA_BULAN[currentMonth - 1]} ${currentYear}* sebesar *${formatRupiah(currentBill?.total || 120000)}*.%0AMohon dicek. Terima kasih! 🙏`
    return `https://wa.me/${cleanPhone}?text=${text}`
  }

  // Link konfirmasi bayar iuran Event / Lomba ke Panitia / Bendahara RT
  const getConfirmEventWaLink = (evt, userEventBill) => {
    if (!config?.kontakRt) return '#'
    let cleanPhone = config.kontakRt.replace(/\D/g, '')
    if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1)

    const nominalVal = userEventBill?.nominal || evt?.nominalPerKK || 0
    const formattedNominal = formatRupiah(nominalVal).replace(/\s/g, '')

    const text = `Halo Pengurus RT / Panitia,%0ASaya *${activeWarga?.nama}* dari *Blok ${activeWarga?.blok} No. ${activeWarga?.noRumah}* ingin konfirmasi pembayaran iuran kegiatan *${evt?.judul || 'Acara Warga'}* sebesar *${formattedNominal}*.%0AMohon dicek. Terima kasih! 🙏`
    return `https://wa.me/${cleanPhone}?text=${text}`
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Welcome Card */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="max-w-xl space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-emerald-200">
            <SearchCheck className="w-4 h-4" />
            <span>Portal Layanan Warga Mandiri</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Cek Status Iuran & Tagihan Rumah Anda
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
            Pilih unit rumah atau cari nama Anda untuk melihat status pembayaran iuran lingkungan bulan ini dan riwayat tanda terima kwitansi.
          </p>
        </div>
      </div>

      {/* Selector Unit Rumah & Warga */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Pilih Unit Rumah / Nama Anda:
        </label>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <input
              type="text"
              placeholder="Ketik untuk memfilter daftar nama..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          <div>
            <select
              value={selectedWargaId}
              onChange={(e) => setSelectedWargaId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white cursor-pointer"
            >
              {searchOptions.map(w => (
                <option key={w.id} value={w.id}>
                  Blok {w.blok} No. {w.noRumah} — {w.nama}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Warga Info Badge */}
        {activeWarga && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center font-mono">
                {activeWarga.blok}-{activeWarga.noRumah}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <div className="font-extrabold text-slate-900 text-sm">{activeWarga.nama}</div>
                  <span className="font-mono font-bold text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                    Kode Unik: #{activeWarga.kodeUnik || '---'}
                  </span>
                </div>
                <div className="text-slate-500">
                  Status: {activeWarga.statusHuni} • {activeWarga.statusKepemilikan || 'Milik Sendiri'} • {activeWarga.jumlahJiwa} Jiwa
                </div>
              </div>
            </div>

            <div className="text-slate-500">
              {activeWarga.noHp && (
                <span className="flex items-center gap-1 font-mono font-semibold text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  {activeWarga.noHp}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Status Tagihan Bulan Berjalan */}
      {currentBill ? (
        <div className={`p-6 rounded-2xl border shadow-xs space-y-4 ${
          isCurrentPaid 
            ? 'bg-emerald-50/50 border-emerald-200' 
            : 'bg-amber-50/50 border-amber-200'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-slate-200/60">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Tagihan Periode Bulan Ini
              </span>
              <h2 className="text-xl font-extrabold text-slate-900">
                {NAMA_BULAN[currentMonth - 1]} {currentYear}
              </h2>
            </div>

            <div>
              {isCurrentPaid ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  LUNAS / SUDAH DIBAYAR
                </div>
              ) : currentBill.status === 'Menunggu Verifikasi' ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-100 text-amber-900 font-extrabold text-xs">
                  <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                  MENUNGGU VERIFIKASI BENDAHARA RT
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-100 text-rose-900 font-extrabold text-xs">
                  <Clock className="w-4 h-4 text-rose-600" />
                  BELUM DIBAYAR / MENUNGGAK
                </div>
              )}
            </div>
          </div>

          {/* Alert jika bukti transfer sebelumnya ditolak */}
          {currentBill.alasanTolak && currentBill.status === 'Belum Lunas' && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
              <span className="font-bold">⚠️ Bukti transfer sebelumnya ditolak: </span>
              <span>{currentBill.alasanTolak}</span>
              <span className="block mt-0.5 text-[11px] text-rose-600">Silakan kirim ulang foto bukti transfer yang jelas dan sesuai nominal.</span>
            </div>
          )}

          {/* Rincian dan Nominal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <span className="text-xs font-bold text-slate-600 block mb-2">Rincian Pos Iuran:</span>
              <div className="space-y-1 text-xs text-slate-600">
                {currentBill.rincian?.map((r, idx) => (
                  <div key={idx} className="flex justify-between py-1 border-b border-slate-200/40">
                    <span>{r.nama}</span>
                    <span className="font-semibold text-slate-800 font-mono">{formatRupiah(r.nominal)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex flex-col justify-between">
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Total Tagihan</span>
                <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
                  {formatRupiah(currentBill.total)}
                </div>
                {isCurrentPaid && (
                  <p className="text-xs text-emerald-700 font-medium mt-1">
                    Dibayar: {formatTanggalIndo(currentBill.tanggalBayar)} ({currentBill.metodeBayar || 'Tunai'})
                  </p>
                )}
                {currentBill.status === 'Menunggu Verifikasi' && (
                  <div className="mt-2 p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900">
                    <p className="font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      Bukti Transfer Terkirim
                    </p>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      Sedang diverifikasi oleh pengurus RT. Status akan otomatis berubah menjadi Lunas setelah disetujui.
                    </p>
                    {currentBill.buktiTransferUrl && (
                      <button
                        onClick={() => setZoomPoster(currentBill.buktiTransferUrl)}
                        className="mt-1.5 text-[10px] font-bold text-emerald-700 hover:underline"
                      >
                        🔍 Lihat Foto Bukti yang Dikirim
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex flex-wrap gap-2">
                {isCurrentPaid ? (
                  <button
                    onClick={() => setSelectedTagihanKwitansi(currentBill)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    <Printer className="w-4 h-4" />
                    Lihat / Cetak Kwitansi
                  </button>
                ) : currentBill.status === 'Menunggu Verifikasi' ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setUploadModalTagihan(currentBill)}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                    >
                      Unggah Ulang Bukti
                    </button>
                    <a
                      href={getConfirmWaLink()}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Chat Pengurus
                    </a>
                  </div>
                ) : (
                  <div className="space-y-2 w-full">
                    <p className="text-[11px] text-slate-500">
                      Transfer ke rekening {targetRt?.name || 'RT'}: <strong className="text-slate-700">{targetRt?.rekening || config?.rekeningBank}</strong>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setUploadModalTagihan(currentBill)}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
                      >
                        <Upload className="w-4 h-4" />
                        Upload Bukti Transfer
                      </button>
                      <a
                        href={getConfirmWaLink()}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        Konfirmasi WA
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-slate-100 rounded-2xl text-center text-slate-500 text-xs">
          Belum ada tagihan yang diterbitkan untuk periode {NAMA_BULAN[currentMonth - 1]} {currentYear}.
        </div>
      )}

      {/* Riwayat Pembayaran Tagihan Terdahulu */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          Riwayat Tagihan & Pembayaran Anda
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 text-left">Periode</th>
                <th className="py-2.5 text-right">Nominal</th>
                <th className="py-2.5 text-left">Status</th>
                <th className="py-2.5 text-left">Tgl Bayar & No Kwitansi</th>
                <th className="py-2.5 text-center">Kwitansi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {wargaBills.length > 0 ? (
                wargaBills.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 font-semibold text-slate-800">
                      {NAMA_BULAN[b.bulan - 1]} {b.tahun}
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-slate-900">
                      {formatRupiah(b.total)}
                    </td>
                    <td className="py-3">
                      {b.status === 'Lunas' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Lunas
                        </span>
                      ) : b.status === 'Menunggu Verifikasi' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          ⏳ Verifikasi
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          Belum Lunas
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-slate-600 font-medium">
                      {b.status === 'Lunas' ? (
                        <div>
                          <div>{formatTanggalIndo(b.tanggalBayar)} ({b.metodeBayar || 'Tunai'})</div>
                          <div className="text-[10px] text-slate-400 font-mono">{b.noKwitansi}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3 text-center">
                      {b.status === 'Lunas' ? (
                        <button
                          onClick={() => setSelectedTagihanKwitansi(b)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Lihat Kwitansi"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    Belum ada riwayat tagihan tercatat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION SURAT EDARAN & IURAN KEGIATAN LINGKUNGAN */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              Surat Edaran & Iuran Kegiatan Warga
            </h3>
            <p className="text-xs text-slate-400">Pengumuman lomba, peringatan hari besar, dan kegiatan sosial lingkungan</p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            {events.length} Kegiatan
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {events.filter(e => e.scope === 'rw' || !e.rt_id || e.rt_id === activeWarga?.rt_id).map(evt => {
            const userEventBill = tagihanEvents.find(te => te.eventId === evt.id && te.wargaId === activeWarga?.id)
            const isLunas = userEventBill?.status === 'Lunas'
            const waConfirm = getConfirmEventWaLink(evt, userEventBill)
            const isRw = evt.scope === 'rw' || !evt.rt_id
            const rtObj = rts?.find(r => r.id === evt.rt_id)

            return (
              <div key={evt.id} className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  
                  {/* Poster Thumbnail */}
                  {evt.posterUrl ? (
                    <div 
                      onClick={() => setZoomPoster(evt.posterUrl)}
                      className="w-full h-40 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 cursor-pointer group relative shadow-xs"
                      title="Klik untuk memperbesar poster"
                    >
                      <img src={evt.posterUrl} alt="Poster Kegiatan" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                        🔍 Perbesar Poster
                      </div>
                    </div>
                  ) : null}

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase font-mono border ${
                        isRw ? 'bg-purple-100 text-purple-900 border-purple-200' : 'bg-emerald-100 text-emerald-900 border-emerald-200'
                      }`}>
                        {isRw ? 'Tingkat RW' : `Tingkat ${rtObj?.name || 'RT'}`}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold">
                        {evt.kategori}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Batas: {formatTanggalIndo(evt.batasTanggal)}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-slate-900 text-sm">{evt.judul}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{evt.deskripsi || 'Kegiatan kebersamaan warga.'}</p>
                </div>

                <div className="pt-3 border-t border-slate-200/70 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Iuran per KK:</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">{formatRupiah(evt.nominalPerKK)}</span>
                  </div>

                  {/* Status Partisipasi Warga ini */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500">Status Anda:</span>
                    {userEventBill ? (
                      isLunas ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Lunas
                        </span>
                      ) : userEventBill.status === 'Menunggu Verifikasi' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Verifikasi
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Belum Lunas
                        </span>
                      )
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Belum Bayar</span>
                    )}
                  </div>

                  {/* Tombol Aksi Pembayaran Event */}
                  {!isLunas && (
                    <div className="flex flex-col gap-1.5 pt-1">
                      <button
                        onClick={() => setUploadModalEventItem({ event: evt, tagihan: userEventBill })}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{userEventBill?.status === 'Menunggu Verifikasi' ? 'Unggah Ulang Bukti' : 'Bayar / Upload Bukti'}</span>
                      </button>
                      {waConfirm && (
                        <a
                          href={waConfirm}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Konfirmasi WhatsApp</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal Zoom Poster */}
      {zoomPoster && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
            <div className="flex justify-between items-center p-3 border-b border-slate-800 bg-slate-950/70">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Image className="w-4 h-4 text-amber-500" />
                Surat Edaran / Poster Resmi
              </span>
              <button
                onClick={() => setZoomPoster(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center max-h-[80vh] overflow-auto">
              <img src={zoomPoster} alt="Poster Acara" className="max-h-[75vh] w-auto object-contain rounded-lg shadow-lg" />
            </div>
          </div>
        </div>
      )}

      {/* Modal Upload Bukti Transfer Warga (IPL) */}
      <UploadBuktiModal
        isOpen={!!uploadModalTagihan}
        onClose={() => setUploadModalTagihan(null)}
        tagihan={uploadModalTagihan}
        warga={activeWarga}
      />

      {/* Modal Upload Bukti Transfer Warga (Event) */}
      {uploadModalEventItem && (
        <UploadBuktiEventModal
          isOpen={true}
          onClose={() => setUploadModalEventItem(null)}
          event={uploadModalEventItem.event}
          tagihanItem={uploadModalEventItem.tagihan}
          wargaItem={activeWarga}
        />
      )}

    </div>
  )
}
