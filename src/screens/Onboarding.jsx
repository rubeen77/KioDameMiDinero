import { useState } from 'react'

export default function Onboarding({ onComplete }) {
  const [paso, setPaso]       = useState(1) // 1 = nombre, 2 = edad
  const [nombre, setNombre]   = useState('')
  const [edad, setEdad]       = useState('')

  function siguientePaso(e) {
    e.preventDefault()
    if (paso === 1 && nombre.trim()) setPaso(2)
  }

  function terminar(e) {
    e.preventDefault()
    const edadNum = parseInt(edad)
    if (!edadNum || edadNum < 1 || edadNum > 120) return
    onComplete({ nombre: nombre.trim(), edad: edadNum })
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center px-6">
      {/* Logo / header */}
      <div className="mb-10 text-center">
        <div className="w-20 h-20 rounded-3xl bg-red-500 flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg shadow-red-500/30">
          💰
        </div>
        <h1 className="text-3xl font-bold text-[var(--text-1)]">Kio</h1>
        <p className="text-[var(--text-2)] text-sm mt-1">Dame mi dinero</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-[var(--card)] rounded-3xl p-6 border border-[var(--border)]">

        {/* Paso 1 — Nombre */}
        {paso === 1 && (
          <form onSubmit={siguientePaso} className="space-y-5">
            <div>
              <p className="text-[10px] text-red-400 font-semibold uppercase tracking-widest mb-1">Paso 1 de 2</p>
              <h2 className="text-xl font-bold text-[var(--text-1)] mb-1">¿Cómo te llamas?</h2>
              <p className="text-sm text-[var(--text-2)]">Así podré saludarte cada vez que abras la app.</p>
            </div>

            <div className="bg-[var(--input)] rounded-2xl px-4 py-3">
              <label className="text-[10px] text-[var(--text-3)] font-semibold uppercase tracking-widest">Nombre</label>
              <input
                type="text" placeholder="Tu nombre..." value={nombre}
                onChange={e => setNombre(e.target.value)}
                autoFocus maxLength={20}
                className="w-full text-2xl font-bold text-[var(--text-1)] outline-none mt-1 bg-transparent placeholder-gray-700"
              />
            </div>

            <button type="submit" disabled={!nombre.trim()}
              className={`w-full py-4 rounded-2xl font-semibold text-white text-base transition-all ${
                nombre.trim() ? 'bg-red-500 active:scale-95' : 'bg-gray-700 opacity-40'
              }`}>
              Siguiente →
            </button>
          </form>
        )}

        {/* Paso 2 — Edad */}
        {paso === 2 && (
          <form onSubmit={terminar} className="space-y-5">
            <div>
              <p className="text-[10px] text-red-400 font-semibold uppercase tracking-widest mb-1">Paso 2 de 2</p>
              <h2 className="text-xl font-bold text-[var(--text-1)] mb-1">¿Cuántos años tienes, {nombre}?</h2>
              <p className="text-sm text-[var(--text-2)]">Te ayuda a personalizar los consejos financieros.</p>
            </div>

            <div className="bg-[var(--input)] rounded-2xl px-4 py-3">
              <label className="text-[10px] text-[var(--text-3)] font-semibold uppercase tracking-widest">Edad</label>
              <input
                type="number" inputMode="numeric" placeholder="0" value={edad}
                onChange={e => setEdad(e.target.value)}
                autoFocus min="1" max="120"
                className="w-full text-2xl font-bold text-[var(--text-1)] outline-none mt-1 bg-transparent placeholder-gray-700"
              />
            </div>

            <button type="submit" disabled={!edad || parseInt(edad) < 1}
              className={`w-full py-4 rounded-2xl font-semibold text-white text-base transition-all ${
                edad && parseInt(edad) > 0 ? 'bg-red-500 active:scale-95' : 'bg-gray-700 opacity-40'
              }`}>
              Empezar
            </button>

            <button type="button" onClick={() => setPaso(1)}
              className="w-full text-[var(--text-3)] text-sm py-1">
              ← Volver
            </button>
          </form>
        )}
      </div>

      <p className="text-[var(--text-3)] text-xs mt-6 text-center">
        Todos tus datos se guardan solo en este dispositivo.
      </p>
    </div>
  )
}
