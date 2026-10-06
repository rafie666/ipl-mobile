import React from 'react'
import { Printer, MessageCircle, X, CheckCircle2, Building2 } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { formatRupiah, formatTanggalIndo, NAMA_BULAN, generateWaKwitansi } from '../../utils/formatters'

export default function KwitansiModal() {
  const { selectedTagihanKwitansi, setSelectedTagihanKwitansi, warga, config, rts } = useApp()

  if (!selectedTagihanKwitansi) return null

  const tagihan = selectedTagihanKwitansi
  const targetWarga = warga.find(w => w.id === tagihan.wargaId) || {
    nama: 'Warga',
    blok: '-',
    noRumah: '-',
    noHp: ''
  }

  const targetRt = (rts || []).find(r => r.id === targetWarga.rt_id) || rts?.[0]
  const rtLabel = targetRt?.name || 'RT'
  const rwLabel = config?.rw || config?.rtRw || 'RW 15'
  const kopRtRw = `${rtLabel} / ${rwLabel}`

  const bulanNama = NAMA_BULAN[tagihan.bulan - 1] || `Bulan ${tagihan.bulan}`
  const waUrl = generateWaKwitansi(targetWarga, tagihan, `${config?.namaLingkungan || 'Perumahan'} ${kopRtRw}`)

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        
        {/* Modal Top Bar (Hidden on print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-800">Kwitansi Tanda Terima IPL</h3>
              <p className="text-xs text-slate-500">Bukti resmi pembayaran iuran warga</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedTagihanKwitansi(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PRINTABLE RECEIPT CONTENT */}
        <div id="printable-receipt" className="p-8 bg-white text-slate-800">
          {/* Header Kop Kwitansi */}
          <div className="border-b-2 border-slate-800 pb-4 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md">
                  <Building2 className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 tracking-tight uppercase">
                    {config?.namaLingkungan || 'Perumahan Alam Tirta Lestari'}
                  </h2>
                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                    {kopRtRw} • {config?.kelurahan || 'Pagelaran'}, {config?.kecamatan || 'Ciomas'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Sistem Iuran Pengelolaan Lingkungan (IPL) & Kas Mandiri
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 font-extrabold text-xs rounded-full border border-emerald-300">
                  LUNAS / VERIFIED
                </span>
                <p className="text-[11px] text-slate-500 mt-1 font-mono">
                  {tagihan.noKwitansi || 'KW-OFFICIAL'}
                </p>
              </div>
            </div>
          </div>

          {/* Info Warga & Tanggal */}
          <div className="grid grid-cols-2 gap-4 text-xs mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div className="space-y-1.5">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Diterima Dari</span>
                <span className="font-bold text-slate-800 text-sm">{targetWarga.nama}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Alamat Rumah</span>
                <span className="font-medium text-slate-700">Blok {targetWarga.blok} No. {targetWarga.noRumah}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">No. WhatsApp</span>
                <span className="font-mono text-slate-600">{targetWarga.noHp || '-'}</span>
              </div>
            </div>
            <div className="space-y-1.5 text-right sm:text-left">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Periode Tagihan</span>
                <span className="font-bold text-emerald-700 text-sm">{bulanNama} {tagihan.tahun}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Tanggal Bayar</span>
                <span className="font-medium text-slate-700">{formatTanggalIndo(tagihan.tanggalBayar, true)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Metode Pembayaran</span>
                <span className="font-semibold text-slate-700">{tagihan.metodeBayar || 'Tunai'}</span>
              </div>
            </div>
          </div>

          {/* Rincian Iuran Table */}
          <div className="mb-6">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-300 text-slate-500 uppercase tracking-wider text-[11px]">
                  <th className="py-2 text-left font-semibold">No</th>
                  <th className="py-2 text-left font-semibold">Pos Iuran</th>
                  <th className="py-2 text-right font-semibold">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tagihan.rincian && tagihan.rincian.length > 0 ? (
                  tagihan.rincian.map((item, idx) => (
                    <tr key={idx} className="text-slate-700">
                      <td className="py-2.5 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2.5 font-medium">{item.nama}</td>
                      <td className="py-2.5 text-right font-semibold text-slate-900">{formatRupiah(item.nominal)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-2 text-slate-400 font-mono">1</td>
                    <td className="py-2 font-medium">Iuran Bulanan IPL RT</td>
                    <td className="py-2 text-right font-semibold text-slate-900">{formatRupiah(tagihan.total)}</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-800 font-bold text-sm text-slate-900">
                  <td colSpan={2} className="py-3 text-right uppercase tracking-wider">Total Pembayaran:</td>
                  <td className="py-3 text-right text-emerald-700 text-base">{formatRupiah(tagihan.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {tagihan.catatan && (
            <div className="mb-6 p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900">
              <span className="font-bold">Catatan: </span> {tagihan.catatan}
            </div>
          )}

          {/* Signature / Tanda Tangan */}
          <div className="pt-4 border-t border-dashed border-slate-200 grid grid-cols-2 text-center text-xs">
            <div>
              <p className="text-slate-400 mb-12">Warga Pembayar,</p>
              <p className="font-bold text-slate-800 border-t border-slate-300 pt-1 inline-block min-w-[120px]">
                {targetWarga.nama}
              </p>
            </div>
            <div>
              <p className="text-slate-400 mb-12">Bendahara / Pengurus {rtLabel},</p>
              <p className="font-bold text-slate-800 border-t border-slate-300 pt-1 inline-block min-w-[120px]">
                {targetRt?.bendahara || targetRt?.ketua || config?.bendahara || 'Pengurus Kas RT'}
              </p>
            </div>
          </div>

          <div className="mt-6 text-center text-[10px] text-slate-400 font-mono">
            Dokumen ini dicetak otomatis via WargaKu IPL • Simpan sebagai bukti bayar sah
          </div>
        </div>

        {/* Modal Actions Footer (Hidden on Print) */}
        <div className="no-print p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => setSelectedTagihanKwitansi(null)}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-200/60 transition-colors"
          >
            Tutup
          </button>
          <div className="flex items-center gap-2">
            {targetWarga.noHp && (
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow"
              >
                <MessageCircle className="w-4 h-4" />
                Share WhatsApp
              </a>
            )}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow"
            >
              <Printer className="w-4 h-4" />
              Cetak Kwitansi (PDF)
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
