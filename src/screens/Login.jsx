import { useState } from 'react'
import { supabase } from '../lib/supabase.js'

export default function Login() {
  const [tab, setTab]         = useState('entrar') // 'entrar' | 'registrar'
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)

  async function handleEntrar(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message === 'Invalid login credentials' ? 'Email o contraseña incorrectos' : error.message)
    setLoading(false)
  }

  async function handleRegistrar(e) {
    e.preventDefault()
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    setError(''); setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setError(error.message)
    else setEnviado(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="mb-10 text-center">
        <img src="/icons/icon-192.png" alt="Kio" className="w-20 h-20 rounded-3xl mx-auto mb-4 shadow-lg" />
        <h1 className="text-3xl font-bold text-[var(--text-1)]">Kio</h1>
        <p className="text-[var(--text-2)] text-sm mt-1">Dame mi dinero</p>
      </div>

      <div className="w-full max-w-sm">
        {/* Tabs */}
        <div className="bg-[var(--card)] rounded-2xl p-1 flex border border-[var(--border)] mb-4">
          {[['entrar','Entrar'], ['registrar','Crear cuenta']].map(([t, l]) => (
            <button key={t} onClick={() => { setTab(t); setError(''); setEnviado(false) }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === t ? 'bg-red-500 text-white' : 'text-[var(--text-2)]'
              }`}>
              {l}
            </button>
          ))}
        </div>

        {/* Formulario */}
        {enviado ? (
          <div className="bg-[var(--card)] rounded-3xl p-6 border border-green-500/20 text-center">
            <p className="text-3xl mb-3">📧</p>
            <p className="text-[var(--text-1)] font-semibold mb-2">Revisa tu email</p>
            <p className="text-sm text-[var(--text-2)]">
              Te hemos enviado un enlace de confirmación a <span className="text-[var(--text-1)]">{email}</span>.<br />
              Confírmalo y después inicia sesión.
            </p>
            <button onClick={() => { setTab('entrar'); setEnviado(false) }}
              className="mt-5 w-full bg-red-500 text-white font-semibold py-3 rounded-2xl text-sm">
              Ir a Entrar
            </button>
          </div>
        ) : (
          <form onSubmit={tab === 'entrar' ? handleEntrar : handleRegistrar}
            className="bg-[var(--card)] rounded-3xl p-6 border border-[var(--border)] space-y-3">

            <div className="bg-[var(--input)] rounded-2xl px-4 py-3">
              <label className="text-[10px] text-[var(--text-3)] font-semibold uppercase tracking-widest">Email</label>
              <input type="email" placeholder="tu@email.com" value={email}
                onChange={e => setEmail(e.target.value)} required autoFocus
                autoComplete="email" name="email"
                className="w-full text-base font-semibold text-[var(--text-1)] outline-none mt-0.5 bg-transparent placeholder-gray-700"
              />
            </div>

            <div className="bg-[var(--input)] rounded-2xl px-4 py-3">
              <label className="text-[10px] text-[var(--text-3)] font-semibold uppercase tracking-widest">Contraseña</label>
              <input type="password" placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)} required minLength={6}
                autoComplete={tab === 'entrar' ? 'current-password' : 'new-password'} name="password"
                className="w-full text-base font-semibold text-[var(--text-1)] outline-none mt-0.5 bg-transparent placeholder-gray-700"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-4 rounded-2xl font-semibold text-white text-base bg-red-500 active:scale-95 transition-all disabled:opacity-50">
              {loading ? 'Cargando...' : tab === 'entrar' ? 'Entrar' : 'Crear cuenta'}
            </button>
          </form>
        )}

        <p className="text-[var(--text-3)] text-xs mt-6 text-center">
          Tus datos se guardan de forma privada y segura.
        </p>
      </div>
    </div>
  )
}
