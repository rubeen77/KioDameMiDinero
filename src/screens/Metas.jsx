import { useState } from 'react'
import { formatEur } from '../constants.js'

const GOAL_EMOJIS = ['✈️','🏖️','💻','🎮','🎸','🚗','🏠','💍','🎓','👟','📱','🎁','💪','🍕','🌍']

export default function Metas({ metas, onAddMeta, onDeleteMeta, onAportarMeta }) {
  const [creando, setCreando]   = useState(false)
  const [aportando, setAportando] = useState(null)

  const totalAhorrado = metas.reduce((s, m) => s + m.actual, 0)
  const totalObjetivo = metas.reduce((s, m) => s + m.meta,   0)

  return (
    <div className="px-4 pb-2">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-[var(--text-3)]">Ahorra para lo que más te importa</p>
        <button onClick={() => setCreando(true)}
          className="bg-red-500/20 text-red-400 text-sm font-semibold px-3 py-1.5 rounded-xl">
          + Nuevo
        </button>
      </div>

      {/* Resumen total */}
      {metas.length > 0 && (
        <div className="rounded-3xl p-5 mb-4" style={{ background: 'linear-gradient(135deg, #1b5e20, #2e7d32)' }}>
          <p className="text-xs text-white/60 uppercase tracking-widest font-semibold">Total ahorrado</p>
          <p className="text-4xl font-bold text-[var(--text-1)] mt-2">{formatEur(totalAhorrado)}</p>
          <p className="text-sm text-white/60 mt-1">de {formatEur(totalObjetivo)} en {metas.length} objetivo{metas.length !== 1 ? 's' : ''}</p>
          {totalObjetivo > 0 && (
            <div className="h-2 bg-white/20 rounded-full overflow-hidden mt-3">
              <div className="h-full bg-white/70 rounded-full transition-all duration-700"
                style={{ width: `${Math.min((totalAhorrado / totalObjetivo) * 100, 100)}%` }} />
            </div>
          )}
        </div>
      )}

      {/* Form nuevo objetivo */}
      {creando && (
        <FormNuevaMeta
          onSave={(meta) => { onAddMeta(meta); setCreando(false) }}
          onCancel={() => setCreando(false)}
        />
      )}

      {/* Sin objetivos */}
      {metas.length === 0 && !creando && (
        <div className="text-center py-14">
          <p className="text-5xl mb-3">🎯</p>
          <p className="text-[var(--text-1)] font-semibold mb-1">Sin objetivos todavía</p>
          <p className="text-sm text-[var(--text-3)] mb-5 leading-relaxed">
            Crea un objetivo de ahorro para un viaje,<br/>una compra o lo que quieras.
          </p>
          <button onClick={() => setCreando(true)}
            className="bg-red-500 text-white font-semibold px-6 py-3 rounded-2xl text-sm active:scale-95 transition-all">
            Crear el primero
          </button>
        </div>
      )}

      {/* Lista de metas */}
      <div className="space-y-3">
        {metas.map(meta => (
          <MetaCard
            key={meta.id}
            meta={meta}
            aportando={aportando === meta.id}
            onAportar={() => setAportando(meta.id)}
            onConfirmAportar={(n) => { onAportarMeta(meta.id, n); setAportando(null) }}
            onCancelAportar={() => setAportando(null)}
            onDelete={() => onDeleteMeta(meta.id)}
          />
        ))}
      </div>
    </div>
  )
}

function MetaCard({ meta, aportando, onAportar, onConfirmAportar, onCancelAportar, onDelete }) {
  const [valor, setValor]     = useState('')
  const [confirm, setConfirm] = useState(false)
  const pct       = meta.meta > 0 ? Math.min((meta.actual / meta.meta) * 100, 100) : 0
  const restante  = meta.meta - meta.actual
  const completado = meta.actual >= meta.meta

  function handleAportar() {
    const n = parseFloat(valor.replace(',', '.'))
    if (n > 0) onConfirmAportar(n)
    setValor('')
  }

  return (
    <div className="bg-[var(--card)] rounded-3xl p-4 border border-[var(--border)]">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[var(--input)] flex items-center justify-center text-2xl">
            {meta.emoji}
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--text-1)]">{meta.nombre}</p>
            <p className="text-xs text-[var(--text-2)]">
              {completado ? '✓ Completado' : `Faltan ${formatEur(restante)}`}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            if (confirm) onDelete()
            else { setConfirm(true); setTimeout(() => setConfirm(false), 2500) }
          }}
          className={`text-xs px-2 py-1 rounded-lg font-medium ${confirm ? 'bg-red-500/20 text-red-400' : 'text-[var(--text-3)]'}`}>
          {confirm ? '¿Borrar?' : '✕'}
        </button>
      </div>

      {/* Progreso */}
      <div className="flex justify-between text-xs mb-1.5">
        <span className="font-bold text-[var(--text-1)]">{formatEur(meta.actual)}</span>
        <span className="text-[var(--text-2)]">de {formatEur(meta.meta)}</span>
      </div>
      <div className="h-3 bg-gray-800 rounded-full overflow-hidden mb-1">
        <div className={`h-full rounded-full transition-all duration-700 ${completado ? 'bg-green-400' : 'bg-red-400'}`}
          style={{ width: `${pct}%` }} />
      </div>
      <p className="text-right text-xs text-[var(--text-3)] mb-3">{pct.toFixed(0)}%</p>

      {/* Aportar */}
      {!completado && (
        aportando ? (
          <div className="flex gap-2">
            <input
              type="number" inputMode="decimal" placeholder="Cantidad €"
              value={valor} onChange={e => setValor(e.target.value)}
              autoFocus onKeyDown={e => { if (e.key === 'Enter') handleAportar() }}
              className="flex-1 bg-[var(--input)] text-[var(--text-1)] rounded-xl px-3 py-2.5 text-sm outline-none"
            />
            <button onClick={handleAportar}
              className="bg-green-500/20 text-green-400 text-sm font-semibold px-4 py-2.5 rounded-xl">
              ✓ Guardar
            </button>
            <button onClick={onCancelAportar}
              className="bg-gray-700/40 text-[var(--text-2)] text-sm px-3 py-2.5 rounded-xl">
              ✕
            </button>
          </div>
        ) : (
          <button onClick={onAportar}
            className="w-full bg-[var(--input)] text-[var(--text-2)] text-sm font-semibold py-2.5 rounded-xl active:scale-95 transition-all">
            + Aportar dinero
          </button>
        )
      )}

      {completado && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2 text-center">
          <span className="text-green-400 text-sm font-semibold">🎉 ¡Objetivo completado!</span>
        </div>
      )}
    </div>
  )
}

function FormNuevaMeta({ onSave, onCancel }) {
  const [nombre, setNombre] = useState('')
  const [emoji, setEmoji]   = useState('🎯')
  const [meta, setMeta]     = useState('')

  function handleSave() {
    const n = parseFloat(meta.replace(',', '.'))
    if (!nombre.trim() || !n || n <= 0) return
    onSave({ nombre: nombre.trim(), emoji, meta: n, actual: 0 })
  }

  return (
    <div className="bg-[var(--card)] rounded-3xl p-4 border border-[var(--border)] space-y-3 mb-3">
      <p className="text-sm font-semibold text-[var(--text-1)]">Nuevo objetivo</p>

      {/* Emoji picker */}
      <div className="flex flex-wrap gap-2">
        {GOAL_EMOJIS.map(e => (
          <button key={e} onClick={() => setEmoji(e)}
            className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
              emoji === e ? 'bg-red-500/30 ring-2 ring-red-400' : 'bg-[var(--input)]'
            }`}>
            {e}
          </button>
        ))}
      </div>

      <input type="text" placeholder="Nombre del objetivo (ej: Viaje a Japón)"
        value={nombre} onChange={e => setNombre(e.target.value)} maxLength={30}
        className="w-full bg-[var(--input)] text-[var(--text-1)] rounded-xl px-3 py-3 text-sm outline-none placeholder-gray-600"
      />
      <input type="number" inputMode="decimal" placeholder="Cantidad objetivo (€)"
        value={meta} onChange={e => setMeta(e.target.value)} min="1"
        className="w-full bg-[var(--input)] text-[var(--text-1)] rounded-xl px-3 py-3 text-sm outline-none placeholder-gray-600"
      />

      <div className="flex gap-2">
        <button onClick={onCancel}
          className="flex-1 py-3 rounded-xl text-sm font-semibold text-[var(--text-2)] bg-[var(--input)]">
          Cancelar
        </button>
        <button onClick={handleSave}
          className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-red-500 active:scale-95 transition-all">
          Crear objetivo
        </button>
      </div>
    </div>
  )
}
