import React, { useEffect } from 'react'
import { useApp } from '../../context/AppContext'

export default function ConfirmModal() {
  const { confirmState, handleConfirmDialogConfirm, handleConfirmDialogCancel } = useApp()

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (confirmState?.isOpen && e.key === 'Escape') {
        handleConfirmDialogCancel()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [confirmState?.isOpen, handleConfirmDialogCancel])

  if (!confirmState?.isOpen) return null

  const {
    title = 'Konfirmasi Tindakan',
    message = 'Apakah Anda yakin ingin melanjutkan?',
    subtext = '',
    confirmText = 'Lanjutkan',
    cancelText = 'Batal',
    variant = 'emerald'
  } = confirmState

  // Helper untuk render format **teks tebal** di dalam pesan
  const renderFormattedMessage = (msg) => {
    if (!msg) return null
    if (typeof msg !== 'string') return msg

    const parts = msg.split(/(\*\*.*?\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-white">
            {part.slice(2, -2)}
          </strong>
        )
      }
      return part
    })
  }

  // Tombol aksi: default emerald hijau sesuai tema web
  const confirmBtnClass =
    variant === 'danger-red'
      ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/40'
      : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40 focus:ring-emerald-400'

  return (
    <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-[#181a1f] border border-emerald-500/30 text-slate-100 rounded-[26px] p-6 max-w-md w-full shadow-2xl shadow-emerald-950/50 space-y-3.5 animate-in zoom-in-95 duration-200 relative overflow-hidden"
      >
        {/* Subtle top glow line emerald */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-80" />
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Title */}
        <h3 className="text-lg font-bold text-white tracking-tight">
          {title}
        </h3>

        {/* Body Message */}
        <div className="text-sm text-slate-200 leading-relaxed font-normal">
          {renderFormattedMessage(message)}
        </div>

        {/* Subtext Note */}
        {subtext && (
          <p className="text-xs text-slate-400 leading-relaxed pt-0.5">
            {renderFormattedMessage(subtext)}
          </p>
        )}

        {/* Action Buttons (Pill shape) */}
        <div className="flex items-center justify-end gap-2.5 pt-3">
          <button
            type="button"
            onClick={handleConfirmDialogCancel}
            className="px-5 py-2 rounded-full text-xs font-semibold bg-[#26282f] hover:bg-[#32353e] text-slate-200 border border-slate-700/60 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirmDialogConfirm}
            className={`px-5 py-2 rounded-full text-xs font-bold text-white shadow-lg transition-all cursor-pointer focus:outline-none focus:ring-2 ${confirmBtnClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
