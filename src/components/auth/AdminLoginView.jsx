import React, { useState } from 'react'
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  KeyRound, 
  ArrowRight, 
  Building2,
  Users,
  SearchCheck,
  CheckCircle2
} from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function AdminLoginView() {
  const { loginAdmin, adminAuth, setActiveTab, config } = useApp()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setErrorMsg('')
    setIsLoading(true)

    setTimeout(() => {
      const res = loginAdmin(username, password, rememberMe)
      setIsLoading(false)
      if (!res.success) {
        setErrorMsg(res.message || 'Username atau password salah!')
      }
    }, 250)
  }

  const handleAutofillDemo = () => {
    setUsername(adminAuth?.username || 'admin')
    setPassword(adminAuth?.password || 'admin123')
    setErrorMsg('')
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden transform transition-all">
        
        {/* Header Visual */}
        <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 p-8 text-white text-center relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-28 h-28 bg-emerald-400/20 rounded-full blur-xl"></div>
          <div className="absolute -left-6 -bottom-6 w-28 h-28 bg-teal-300/20 rounded-full blur-xl"></div>

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md text-emerald-200 border border-white/20 shadow-lg mb-3">
            <ShieldCheck className="w-8 h-8 text-emerald-300" />
          </div>

          <div className="text-xs font-semibold uppercase tracking-widest text-emerald-300 mb-1">
            Panel Administrator
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            Login Dashboard RT
          </h2>
          <p className="text-xs text-emerald-100/80 mt-1.5 max-w-xs mx-auto leading-relaxed">
            {config?.namaLingkungan || 'Perumahan Alam Tirta Lestari'} • {config?.rtRw || 'RT 01 / RW 15'}
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Gagal Masuk: </span>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {/* Username Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Username Admin
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                placeholder="Masukkan username admin"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  if (errorMsg) setErrorMsg('')
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                autoFocus
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password Admin
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Masukkan password admin"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errorMsg) setErrorMsg('')
                }}
                className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 3 User Role Quick Selection Pills */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Pilih Role Akun Demo:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setUsername('admin')
                  setPassword('admin123')
                  setErrorMsg('')
                }}
                className={`p-2 rounded-xl border text-center transition-all ${
                  username === 'admin' 
                    ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-500 text-purple-900' 
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="text-sm">👑</div>
                <div className="text-[11px] font-extrabold mt-0.5">1. Admin</div>
                <div className="text-[9px] text-slate-400 font-mono">admin / admin123</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setUsername('rt')
                  setPassword('rt123')
                  setErrorMsg('')
                }}
                className={`p-2 rounded-xl border text-center transition-all ${
                  username === 'rt' 
                    ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500 text-emerald-900' 
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="text-sm">🏢</div>
                <div className="text-[11px] font-extrabold mt-0.5">2. Pengurus RT</div>
                <div className="text-[9px] text-slate-400 font-mono">rt / rt123</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setUsername('warga')
                  setPassword('warga123')
                  setErrorMsg('')
                }}
                className={`p-2 rounded-xl border text-center transition-all ${
                  username === 'warga' 
                    ? 'bg-sky-50 border-sky-300 ring-2 ring-sky-500 text-sky-900' 
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="text-sm">👤</div>
                <div className="text-[11px] font-extrabold mt-0.5">3. Warga</div>
                <div className="text-[9px] text-slate-400 font-mono">warga / warga123</div>
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
              />
              <span className="text-xs font-medium text-slate-600">Ingat sesi di perangkat ini</span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-70 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Masuk Aplikasi</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('portal')}
              className="w-full py-2.5 px-4 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <SearchCheck className="w-4 h-4 text-emerald-600" />
              <span>Buka Portal Cek Mandiri Warga</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}
