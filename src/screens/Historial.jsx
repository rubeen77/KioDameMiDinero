import { useState, useMemo } from 'react'
import { CATEGORIAS_GASTO, CATEGORIAS_INGRESO, CATEGORIA_MAP, formatEur, labelMes } from '../constants.js'

const TODAS = [...CATEGORIAS_GASTO, ...CATEGORIAS_INGRESO]

export default function Historial({ transacciones, fijos, onDelete }) {
  const meses = useMemo(() => {
    const set = new Set(transacciones.map(t => t.fecha.slice(0, 7)))
    const now = new Date()
    set.add(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
    return [...set].sort((a, b) => b.localeCompare(a))
  }, [transacciones])

  const [mes, setMes]         = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [cat, setCat]         = useState('todas')
  const [tipo, setTipo]       = useState('todos')
  const [confirm, setConfirm] = useState(null)

  const filtradas = useMemo(() =>
    transacciones.filter(t =>
      t.fecha.startsWith(mes) &&
      (cat === 'todas' || t.categoria === cat) &&
      (tipo === 'todos' || t.tipo === tipo)
    ),
    [transacciones, mes, cat, tipo]
  )
  const fijosFiltrados = fijos.filter(f =>
    (cat === 'todas' || f.categoria === cat) &&
    (tipo === 'todos' || f.tipo === tipo)
  )

  const totalGasto   = filtradas.filter(t => t.tipo === 'gasto').reduce((s, t) => s + t.cantidad, 0)
  const totalIngreso = filtradas.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.cantidad, 0)

  function handleDelete(id) {
    if (confirm === id) { onDelete(id); setConfirm(null) }
    else { setConfirm(id); setTimeout(() => setConfirm(c => c === id ? null : c), 2500) }
  }

  return (
    <div className="px-4 pt-8 pb-2">
      <h1 className="text-2xl font-bold text-[var(--text-1)] mb-4">Historial</h1>

      {/* Filtro mes */}
      <div className="bg-[var(--card)] rounded-2xl px-4 py-3 mb-3 border border-[var(--border)]">
        <label className="text-[10px] text-[var(--text-3)] font-semibold uppercase tracking-widest">Mes</label>
        <select value={mes} onChange={e => setMes(e.target.value)}
          className="w-full text-[var(--text-1)] bg-transparent outline-none mt-1 text-sm font-medium">
          {meses.map(m => <option key={m} value={m} className="bg-[var(--card)]">{labelMes(m)}</option>)}
        </select>
      </div>

      {/* Filtro tipo */}
      <div className="flex gap-2 mb-3">
        {[['todos','Todos'], ['gasto','Gastos'], ['ingreso','Ingresos']].map(([t, l]) => (
          <Chip key={t} active={tipo === t} onClick={() => setTipo(t)}>{l}</Chip>
        ))}
      </div>

      {/* Filtro categoría */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-3">
        <Chip active={cat === 'todas'} onClick={() => setCat('todas')}>Todas</Chip>
        {TODAS.map(c => (
          <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>
            {c.emoji} {c.label}
          </Chip>
        ))}
      </div>

      {/* Resumen */}
      {(filtradas.length > 0 || fijosFiltrados.length > 0) && (
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-[var(--card)] rounded-2xl px-3 py-2.5 border border-[var(--border)] text-center">
            <p className="text-xs text-[var(--text-3)]">Ingresos</p>
            <p className="text-base font-bold text-green-400">{formatEur(totalIngreso)}</p>
          </div>
          <div className="bg-[var(--card)] rounded-2xl px-3 py-2.5 border border-[var(--border)] text-center">
            <p className="text-xs text-[var(--text-3)]">Gastos</p>
            <p className="text-base font-bold text-red-400">{formatEur(totalGasto)}</p>
          </div>
        </div>
      )}

      {/* Fijos */}
      {fijosFiltrados.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] text-[var(--text-3)] font-semibold uppercase tracking-widest px-1 mb-2">Recurrentes</p>
          <div className="space-y-2">
            {fijosFiltrados.map(f => {
              const info = CATEGORIA_MAP[f.categoria]
              return (
                <div key={f.id} className="bg-[var(--card)] rounded-2xl px-4 py-3 flex items-center gap-3 border border-[var(--border)]">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0 bg-[var(--input)]">
                    {info?.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-[var(--text-1)] truncate">{f.nota || info?.label}</p>
                      <span className="text-[10px] bg-blue-500/20 text-blue-400 font-semibold px-1.5 py-0.5 rounded-full shrink-0">↩ fijo</span>
                    </div>
                    <p className="text-xs text-[var(--text-3)] capitalize">{f.tipo}{f.dia ? ` · día ${f.dia}` : ''}</p>
                  </div>
                  <span className={`text-sm font-bold ${f.tipo === 'ingreso' ? 'text-green-400' : 'text-[var(--text-1)]'}`}>
                    {f.tipo === 'ingreso' ? '+' : '-'}{formatEur(f.cantidad)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Transacciones */}
      {filtradas.length > 0 && (
        <div className="space-y-2">
          {filtradas.map(t => {
            const info  = CATEGORIA_MAP[t.categoria]
            const fecha = new Date(t.fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
            return (
              <div key={t.id} className="bg-[var(--card)] rounded-2xl px-4 py-3 flex items-center gap-3 border border-[var(--border)]">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0 bg-[var(--input)]">
                  {info?.emoji || '📦'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-1)] truncate">{t.nota || info?.label}</p>
                  <p className="text-xs text-[var(--text-3)]">{fecha}</p>
                </div>
                <span className={`text-sm font-bold ${t.tipo === 'ingreso' ? 'text-green-400' : 'text-[var(--text-1)]'}`}>
                  {t.tipo === 'ingreso' ? '+' : '-'}{formatEur(t.cantidad)}
                </span>
                <button onClick={() => handleDelete(t.id)}
                  className={`text-xs px-2 py-1 rounded-lg font-medium shrink-0 ml-1 ${
                    confirm === t.id ? 'bg-red-500/20 text-red-400' : 'text-[var(--text-3)]'
                  }`}>
                  {confirm === t.id ? '¿Borrar?' : '✕'}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {filtradas.length === 0 && fijosFiltrados.length === 0 && (
        <div className="text-center py-16">
          <p className="text-3xl mb-2">📭</p>
          <p className="text-[var(--text-3)] text-sm">Sin movimientos este mes</p>
        </div>
      )}
    </div>
  )
}

function Chip({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
        active ? 'bg-red-500 text-white' : 'bg-[var(--card)] text-[var(--text-2)] border border-[var(--border)]'
      }`}
    >{children}</button>
  )
}
