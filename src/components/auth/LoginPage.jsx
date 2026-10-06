import React, { useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import loginBg from '../../assets/login-bg.jpg'

export default function LoginPage() {
  const { loginUser, config } = useApp()

  const [email, setEmail] = useState('admin')
  const [password, setPassword] = useState('password')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setIsLoading(true)

    try {
      const res = await loginUser(email, password, true)
      setIsLoading(false)
      if (!res.success) {
        setErrorMsg(res.message || 'Username atau password salah!')
      }
    } catch (err) {
      setIsLoading(false)
      setErrorMsg('Terjadi kesalahan saat memproses login.')
    }
  }

  const handleQuickFill = (demoEmail, demoPass) => {
    setEmail(demoEmail)
    setPassword(demoPass)
    setErrorMsg('')
  }

  return (
    <section className="bg-slate-950 min-h-screen flex box-border justify-center items-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl flex max-w-3xl p-5 items-center shadow-2xl">
        {/* Kolom Kiri: Form Login */}
        <div className="md:w-1/2 px-6 sm:px-8 w-full">
          <h2 className="font-bold text-3xl text-emerald-400">Login</h2>
          <p className="text-sm mt-4 text-slate-300">
            If you already a member, easily log in now.
          </p>

          {errorMsg && (
            <div className="mt-3 p-2 bg-rose-950/80 border border-rose-800 rounded-xl text-xs text-rose-300">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              className="p-2 mt-8 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              type="text"
              name="email"
              placeholder="Username / Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errorMsg) setErrorMsg('')
              }}
              required
            />

            <div className="relative">
              <input
                className="p-2 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder-slate-400 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm pr-9"
                type={showPassword ? 'text' : 'password'}
                name="password"
                id="password"
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errorMsg) setErrorMsg('')
                }}
                required
              />

              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  onClick={() => setShowPassword(false)}
                  className="bi bi-eye-slash-fill absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer z-20 text-slate-400 hover:text-white"
                  viewBox="0 0 16 16"
                >
                  <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588zM5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z" />
                  <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12-.708.708z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  onClick={() => setShowPassword(true)}
                  className="bi bi-eye absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer z-20 text-slate-400 hover:text-white"
                  viewBox="0 0 16 16"
                >
                  <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
                  <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
                </svg>
              )}
            </div>

            <button
              className="bg-emerald-600 text-white py-2 rounded-xl hover:scale-105 duration-300 hover:bg-emerald-500 font-medium cursor-pointer disabled:opacity-50 text-sm mt-2"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Memproses...' : 'Login'}
            </button>
          </form>

          {/* Bantuan Akun / Lupa Password */}
          <div className="mt-3 text-center">
            {(() => {
              const cleanPhone = (config?.kontakRt || '081234567890').replace(/\D/g, '').replace(/^0/, '62')
              const waUrl = `https://wa.me/${cleanPhone}?text=Halo%20Pengurus%20RT,%20saya%20warga%20butuh%20bantuan%20akses%20login%20portal%20WargaKu`
              return (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-slate-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Lupa password / Bantuan akun? Chat RT</span>
                </a>
              )
            })()}
          </div>

          {/* Quick Demo Accounts */}
          <div className="mt-5 pt-4 border-t border-slate-800">
            <p className="text-xs text-slate-400 mb-2 font-medium">Akun Demo (Klik untuk isi cepat):</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin', 'password')}
                className={`flex-1 py-1.5 px-2 rounded-xl border text-xs font-medium transition cursor-pointer ${
                  email === 'admin'
                    ? 'bg-purple-950/80 border-purple-500 text-purple-200'
                    : 'bg-slate-800 hover:bg-slate-700 text-purple-300 border-slate-700'
                }`}
              >
                👑 Admin
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('rt', 'password')}
                className={`flex-1 py-1.5 px-2 rounded-xl border text-xs font-medium transition cursor-pointer ${
                  email === 'rt'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                    : 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border-slate-700'
                }`}
              >
                🏢 RT 01
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('bambang.sutrisno', 'password')}
                className={`flex-1 py-1.5 px-2 rounded-xl border text-xs font-medium transition cursor-pointer ${
                  email === 'bambang.sutrisno'
                    ? 'bg-sky-950/80 border-sky-500 text-sky-200'
                    : 'bg-slate-800 hover:bg-slate-700 text-sky-300 border-slate-700'
                }`}
              >
                👤 Warga
              </button>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Gambar Lingkungan Hunian Asri */}
        <div className="md:block hidden w-1/2 self-stretch">
          <img
            className="rounded-2xl max-h-[1600px] object-cover h-full w-full shadow-md"
            src={loginBg}
            alt="Perumahan Alam Tirta Lestari"
          />
        </div>
      </div>
    </section>
  )
}
