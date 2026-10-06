import React from 'react'
import { CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function Toast() {
  const { toast } = useApp()

  if (!toast) return null

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />,
    error: <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-400 flex-shrink-0" />
  }

  const borderColors = {
    success: 'border-emerald-500/40 bg-slate-900 text-slate-100',
    warning: 'border-amber-500/40 bg-slate-900 text-slate-100',
    error: 'border-rose-500/40 bg-slate-900 text-slate-100',
    info: 'border-sky-500/40 bg-slate-900 text-slate-100'
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border ${borderColors[toast.type || 'success']}`}>
        {icons[toast.type || 'success']}
        <p className="text-xs font-semibold">{toast.message}</p>
      </div>
    </div>
  )
}
