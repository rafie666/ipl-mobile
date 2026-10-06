import React from 'react'
import { X, Printer, Download, CheckCircle2, Building2 } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { formatTanggalIndo } from '../../utils/formatters'

export default function CetakSuratModal({ suratItem, isOpen, onClose }) {
  const { config, rts, warga } = useApp()

  if (!isOpen || !suratItem) return null

  const targetWarga = warga.find(w => w.id === suratItem.wargaId) || {
    nama: 'Bambang Sutrisno',
    blok: 'A',
    noRumah: '01',
    pekerjaan: 'PNS',
    statusHuni: 'Tetap'
  }

  const targetRt = rts.find(r => r.id === suratItem.rt_id) || {
    name: 'RT 01',
    rw: '15',
    ketua: config?.ketuaRt || 'Bpk. Syahdan'
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl my-8 space-y-6">
        
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Pratinjau Surat Pengantar Resmi
            </h2>
            <p className="text-xs text-slate-500">
              Dokumen resmi siap cetak atau simpan sebagai PDF
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet (Standard A4 Paper Look) */}
        <div className="bg-white border border-slate-300 rounded-xl p-8 sm:p-12 shadow-inner text-slate-900 text-xs sm:text-sm font-serif leading-relaxed space-y-6 print:border-none print:shadow-none print:p-0">
          
          {/* KOP SURAT RT/RW */}
          <div className="text-center space-y-0.5 border-b-4 border-double border-slate-900 pb-4">
            <h3 className="text-base sm:text-lg font-bold tracking-wider uppercase font-sans">
              PENGURUS {targetRt.name || 'RT 01'} / RW {targetRt.rw || '15'}
            </h3>
            <h4 className="text-xs sm:text-sm font-bold uppercase font-sans text-slate-800">
              {config?.namaLingkungan || 'PERUMAHAN ALAM TIRTA LESTARI'}
            </h4>
            <p className="text-[11px] font-sans text-slate-600">
              Kelurahan {config?.kelurahan || 'Pagelaran'}, Kecamatan {config?.kecamatan || 'Ciomas'}, {config?.kota || 'Kabupaten Bogor'}
            </p>
          </div>

          {/* JUDUL DAN NOMOR SURAT */}
          <div className="text-center space-y-1 pt-2">
            <h2 className="text-sm sm:text-base font-bold underline uppercase tracking-wide">
              {suratItem.jenisSurat?.toUpperCase() || 'SURAT PENGANTAR RT/RW'}
            </h2>
            <p className="text-xs font-mono font-bold text-slate-700">
              Nomor: {suratItem.noSurat || '470/012/RT.01-RW.15/IX/2026'}
            </p>
          </div>

          {/* PARAGRAF PENGANTAR */}
          <p className="indent-8 text-justify">
            Yang bertanda tangan di bawah ini, Pengurus {targetRt.name || 'RT 01'} / RW {targetRt.rw || '15'} {config?.namaLingkungan || 'Perumahan Alam Tirta Lestari'}, Kelurahan {config?.kelurahan || 'Pagelaran'}, Kecamatan {config?.kecamatan || 'Ciomas'}, {config?.kota || 'Kabupaten Bogor'}, dengan ini menerangkan bahwa:
          </p>

          {/* TABEL BIODATA PEMOHON */}
          <div className="pl-4 sm:pl-8 space-y-2 text-xs sm:text-sm font-sans">
            <div className="grid grid-cols-12 gap-2">
              <span className="col-span-4 sm:col-span-3 font-semibold text-slate-700">1. Nama Lengkap</span>
              <span className="col-span-1 text-center font-bold">:</span>
              <span className="col-span-7 sm:col-span-8 font-bold text-slate-950 uppercase">{targetWarga.nama}</span>
            </div>
            <div className="grid grid-cols-12 gap-2">
              <span className="col-span-4 sm:col-span-3 font-semibold text-slate-700">2. NIK</span>
              <span className="col-span-1 text-center font-bold">:</span>
              <span className="col-span-7 sm:col-span-8 font-mono font-bold text-slate-900">{suratItem.nikPemohon || '3201011204850001'}</span>
            </div>
            <div className="grid grid-cols-12 gap-2">
              <span className="col-span-4 sm:col-span-3 font-semibold text-slate-700">3. Status Hunian</span>
              <span className="col-span-1 text-center font-bold">:</span>
              <span className="col-span-7 sm:col-span-8">{targetWarga.statusHuni || 'Warga Tetap'}</span>
            </div>
            <div className="grid grid-cols-12 gap-2">
              <span className="col-span-4 sm:col-span-3 font-semibold text-slate-700">4. Pekerjaan</span>
              <span className="col-span-1 text-center font-bold">:</span>
              <span className="col-span-7 sm:col-span-8">{targetWarga.pekerjaan || suratItem.pekerjaan || 'Karyawan Swasta'}</span>
            </div>
            <div className="grid grid-cols-12 gap-2">
              <span className="col-span-4 sm:col-span-3 font-semibold text-slate-700">5. Alamat Domisili</span>
              <span className="col-span-1 text-center font-bold">:</span>
              <span className="col-span-7 sm:col-span-8">
                Blok {targetWarga.blok} No. {targetWarga.noRumah}, {config?.namaLingkungan || 'Perumahan Alam Tirta Lestari'}, {targetRt.name} / RW {targetRt.rw || '15'}, Kel. {config?.kelurahan || 'Pagelaran'}, Kec. {config?.kecamatan || 'Ciomas'}
              </span>
            </div>
            <div className="grid grid-cols-12 gap-2">
              <span className="col-span-4 sm:col-span-3 font-semibold text-slate-700">6. Maksud / Keperluan</span>
              <span className="col-span-1 text-center font-bold">:</span>
              <span className="col-span-7 sm:col-span-8 font-bold text-slate-950 underline">{suratItem.keperluan}</span>
            </div>
          </div>

          {/* PARAGRAF PENUTUP */}
          <p className="indent-8 text-justify">
            Demikian Surat Pengantar ini dibuat dengan sebenarnya dan diberikan kepada yang bersangkutan untuk dapat dipergunakan sebagaimana mestinya dan sesuai dengan keperluan di atas.
          </p>

          {/* TANDA TANGAN */}
          <div className="pt-8 grid grid-cols-2 text-center text-xs sm:text-sm font-sans">
            <div className="space-y-1">
              <p className="text-slate-600">Mengetahui,</p>
              <p className="font-bold">Ketua RW {targetRt.rw || '15'}</p>
              <div className="h-20 flex items-center justify-center">
                <span className="text-[10px] text-slate-300 italic border border-dashed border-slate-300 px-3 py-1 rounded">Stempel / TTD RW</span>
              </div>
              <p className="font-bold underline text-slate-900">( Bpk. H. Rahmat Hidayat )</p>
            </div>

            <div className="space-y-1">
              <p className="text-slate-600">
                {config?.kota || 'Bogor'}, {formatTanggalIndo(suratItem.tanggalDisetujui || suratItem.tanggalPengajuan || new Date())}
              </p>
              <p className="font-bold">Ketua {targetRt.name || 'RT 01'}</p>
              <div className="h-20 flex items-center justify-center relative">
                {/* Cap & Tanda Tangan Digital Stamp */}
                <div className="px-3 py-1 rounded-xl border-2 border-emerald-600 bg-emerald-50 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider transform -rotate-3">
                  ✓ TERVERIFIKASI DIGITAL RT 01
                </div>
              </div>
              <p className="font-bold underline text-slate-900">( {targetRt.ketua || config?.ketuaRt || 'Bpk. Syahdan'} )</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
