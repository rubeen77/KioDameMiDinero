import { useState } from 'react'
import { CATEGORIAS_GASTO, CATEGORIAS_INGRESO, CATEGORIA_MAP, formatEur } from '../constants.js'

const hoy = () => new Date().toISOString().split('T')[0]

export default function Anadir({ onAdd, onAddFijo, fijos, onDeleteFijo, setScreen }) {
  const [tab, setTab] = useState('unico')

  return (
    <div className="px-4 pt-8 pb-2">
      <h1 className="text-2xl font-bold text-[var(--text-1)] mb-4">Añadir</h1>

      <div className="bg-[var(--card)] rounded-2xl p-1 flex mb-5 border border-[var(--border)]">
        {[['unico','Transacción única'], ['fijo','Recurrente mensual']].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === t ? 'bg-red-500 text-white' : 'text-[var(--text-3)]'
            }`}
          >{l}</button>
        ))}
      </div>

      {tab === 'unico'
        ? <FormUnico onAdd={onAdd} setScreen={setScreen} />
        : <FormFijo onAddFijo={onAddFijo} fijos={fijos} onDeleteFijo={onDeleteFijo} />
      }
    </div>
  )
}

// ── Formulario transacción única ─────────────────────────────────────────────

function FormUnico({ onAdd, setScreen }) {
  const [tipo, setTipo]           = useState('gasto')
  const [cantidad, setCantidad]   = useState('')
  const [categoria, setCategoria] = useState('comida')
  const [nota, setNota]           = useState('')
  const [fecha, setFecha]         = useState(hoy())
  const [ok, setOk]               = useState(false)

  const cats = tipo === 'gasto' ? CATEGORIAS_GASTO : CATEGORIAS_INGRESO

  function cambiarTipo(t) { setTipo(t); setCategoria(t === 'gasto' ? 'comida' : 'trabajo') }

  function handleSubmit(e) {
    e.preventDefault()
    const num = parseFloat(cantidad.replace(',', '.'))
    if (!num || num <= 0) return
    onAdd({ tipo, cantidad: num, categoria, nota: nota.trim(), fecha })
    setOk(true)
    setCantidad(''); setNota(''); setFecha(hoy())
    setTimeout(() => { setOk(false); setScreen('dashboard') }, 800)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Tipo */}
      <div className="bg-[var(--card)] rounded-2xl p-1 flex border border-[var(--border)]">
        {[['gasto','Gasto'], ['ingreso','Ingreso']].map(([t, l]) => (
          <button key={t} type="button" onClick={() => cambiarTipo(t)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tipo === t ? t === 'gasto' ? 'bg-red-500 text-white' : 'bg-green-500 text-white' : 'text-[var(--text-3)]'
            }`}
          >{l}</button>
        ))}
      </div>

      {/* Cantidad */}
      <div className="bg-[var(--card)] rounded-2xl px-4 py-3 border border-[var(--border)]">
        <label className="text-[10px] text-[var(--text-3)] font-semibold uppercase tracking-widest">Cantidad (€)</label>
        <input type="number" inputMode="decimal" placeholder="0,00"
          value={cantidad} onChange={e => setCantidad(e.target.value)}
          className="w-full text-3xl font-bold text-[var(--text-1)] outline-none mt-1 bg-transparent"
          required min="0.01" step="0.01" />
      </div>

      {/* Categoría */}
      <div className="bg-[var(--card)] rounded-2xl px-4 py-3 border border-[var(--border)]">
        <label className="text-[10px] text-[var(--text-3)] font-semibold uppercase tracking-widest block mb-3">Categoría</label>
        <div className="grid grid-cols-4 gap-2">
          {cats.map(cat => (
            <button key={cat.id} type="button" onClick={() => setCategoria(cat.id)}
              className={`flex flex-col items-center py-2.5 px-1 rounded-xl transition-all border-2 ${
                categoria === cat.id ? 'border-red-500 bg-red-500/10' : 'border-transparent bg-[var(--input)]'
              }`}
            >
              <span className="text-xl">{cat.emoji}</span>
              <span className="text-[10px] text-[var(--text-2)] mt-0.5 leading-tight text-center">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Nota + Fecha */}
      <div className="bg-[var(--card)] rounded-2xl px-4 py-3 border border-[var(--border)] space-y-3">
        <div>
          <label className="text-[10px] text-[var(--text-3)] font-semibold uppercase tracking-widest">Nota (opcional)</label>
          <input type="text" placeholder="Descripción breve..." value={nota}
            onChange={e => setNota(e.target.value)} maxLength={60}
            className="w-full text-[var(--text-1)] outline-none mt-1 bg-transparent text-sm placeholder-gray-700" />
        </div>
        <div className="border-t border-[var(--border)] pt-3">
          <label className="text-[10px] text-[var(--text-3)] font-semibold uppercase tracking-widest">Fecha</label>
          <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
            className="w-full text-[var(--text-1)] outline-none mt-1 bg-transparent text-sm" />
        </div>
      </div>

      <button type="submit"
        className={`w-full py-4 rounded-2xl font-semibold text-white text-base transition-all ${
          ok ? 'bg-green-500 scale-95' : tipo === 'gasto' ? 'bg-red-500 active:scale-95' : 'bg-green-500 active:scale-95'
        }`}
      >
        {ok ? '✓ Guardado' : 'Guardar'}
      </button>
    </form>
  )
}

// ── Formulario recurrente ────────────────────────────────────────────────────

function FormFijo({ onAddFijo, fijos, onDeleteFijo }) {
  const [tipo, setTipo]           = useState('gasto')
  const [cantidad, setCantidad]   = useState('')
  const [categoria, setCategoria] = useState('comida')
  const [nota, setNota]           = useState('')
  const [dia, setDia]             = useState('')
  const [ok, setOk]               = useState(false)
  const [confirm, setConfirm]     = useState(null)

  const cats = tipo === 'gasto' ? CATEGORIAS_GASTO : CATEGORIAS_INGRESO
  function cambiarTipo(t) { setTipo(t); setCategoria(t === 'gasto' ? 'comida' : 'trabajo') }

  function handleSubmit(e) {
    e.preventDefault()
    const num = parseFloat(cantidad.replace(',', '.'))
    if (!num || num <= 0) return
    onAddFijo({ tipo, cantidad: num, categoria, nota: nota.trim(), dia: dia ? parseInt(dia) : null })
    setOk(true)
    setCantidad(''); setNota(''); setDia('')
    setTimeout(() => setOk(false), 1200)
  }

  function handleDelete(id) {
    if (confirm === id) { onDeleteFijo(id); setConfirm(null) }
    else { setConfirm(id); setTimeout(() => setConfirm(c => c === id ? null : c), 2500) }
  }

  const totalFijoGasto   = fijos.filter(f => f.tipo === 'gasto').reduce((s, f) => s + f.cantidad, 0)
  const totalFijoIngreso = fijos.filter(f => f.tipo === 'ingreso').reduce((s, f) => s + f.cantidad, 0)

  return (
    <div className="space-y-3">
      {fijos.length > 0 && (
        <div className="bg-[var(--card)] rounded-2xl p-4 border border-[var(--border)]">
          <p className="text-[10px] text-[var(--text-3)] font-semibold uppercase tracking-widest mb-3">Activos este mes</p>
          <div className="space-y-2 mb-3">
            {fijos.map(f => {
              const info = CATEGORIA_MAP[f.categoria]
              return (
                <div key={f.id} className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 bg-[var(--input)]">
                    {info?.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-1)] truncate">{f.nota || info?.label}</p>
                    <p className="text-xs text-[var(--text-3)] capitalize">{f.tipo}{f.dia ? ` · día ${f.dia}` : ''}</p>
                  </div>
                  <span className={`text-sm font-semibold mr-2 ${f.tipo === 'ingreso' ? 'text-green-400' : 'text-[var(--text-2)]'}`}>
                    {f.tipo === 'ingreso' ? '+' : '-'}{formatEur(f.cantidad)}
                  </span>
                  <button onClick={() => handleDelete(f.id)}
                    className={`text-xs px-2 py-1 rounded-lg font-medium shrink-0 ${
                      confirm === f.id ? 'bg-red-500/20 text-red-400' : 'text-[var(--text-3)]'
                    }`}>
                    {confirm === f.id ? '¿Borrar?' : '✕'}
                  </button>
                </div>
              )
            })}
          </div>
          <div className="border-t border-[var(--border)] pt-3 flex justify-between">
            <span className="text-xs text-[var(--text-3)]">Neto mensual recurrente</span>
            <span className={`text-sm font-bold ${totalFijoIngreso - totalFijoGasto >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatEur(totalFijoIngreso - totalFijoGasto)}
            </span>
          </div>
        </div>
      )}

      <p className="text-[10px] text-[var(--text-3)] font-semibold uppercase tracking-widest px-1 pt-1">Nuevo recurrente</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="bg-[var(--card)] rounded-2xl p-1 flex border border-[var(--border)]">
          {[['gasto','Gasto fijo'], ['ingreso','Ingreso fijo']].map(([t, l]) => (
            <button key={t} type="button" onClick={() => cambiarTipo(t)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tipo === t ? t === 'gasto' ? 'bg-red-500 text-white' : 'bg-green-500 text-white' : 'text-[var(--text-3)]'
              }`}
            >{l}</button>
          ))}
        </div>

        <div className="bg-[var(--card)] rounded-2xl px-4 py-3 border border-[var(--border)]">
          <label className="text-[10px] text-[var(--text-3)] font-semibold uppercase tracking-widest">Cantidad mensual (€)</label>
          <input type="number" inputMode="decimal" placeholder="0,00"
            value={cantidad} onChange={e => setCantidad(e.target.value)}
            className="w-full text-3xl font-bold text-[var(--text-1)] outline-none mt-1 bg-transparent"
            required min="0.01" step="0.01" />
        </div>

        <div className="bg-[var(--card)] rounded-2xl px-4 py-3 border border-[var(--border)]">
          <label className="text-[10px] text-[var(--text-3)] font-semibold uppercase tracking-widest block mb-3">Categoría</label>
          <div className="grid grid-cols-4 gap-2">
            {cats.map(cat => (
              <button key={cat.id} type="button" onClick={() => setCategoria(cat.id)}
                className={`flex flex-col items-center py-2.5 px-1 rounded-xl transition-all border-2 ${
                  categoria === cat.id ? 'border-red-500 bg-red-500/10' : 'border-transparent bg-[var(--input)]'
                }`}
              >
                <span className="text-xl">{cat.emoji}</span>
                <span className="text-[10px] text-[var(--text-2)] mt-0.5 leading-tight text-center">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[var(--card)] rounded-2xl px-4 py-3 border border-[var(--border)] space-y-3">
          <div>
            <label className="text-[10px] text-[var(--text-3)] font-semibold uppercase tracking-widest">Nombre / descripción</label>
            <input type="text" placeholder="Ej: Alquiler, Nómina, Netflix..." value={nota}
              onChange={e => setNota(e.target.value)} maxLength={50}
              className="w-full text-[var(--text-1)] outline-none mt-1 bg-transparent text-sm placeholder-gray-700" />
          </div>
          <div className="border-t border-[var(--border)] pt-3">
            <label className="text-[10px] text-[var(--text-3)] font-semibold uppercase tracking-widest">Día del mes (opcional)</label>
            <div className="flex items-center gap-2 mt-1">
              <input type="number" inputMode="numeric" placeholder="—"
                value={dia} onChange={e => setDia(e.target.value)} min="1" max="31"
                className="w-14 text-lg font-bold text-[var(--text-1)] outline-none bg-transparent" />
              <span className="text-xs text-[var(--text-3)]">
                {dia ? `cada mes el día ${dia}` : 'sin fecha fija'}
              </span>
            </div>
          </div>
        </div>

        <button type="submit"
          className={`w-full py-4 rounded-2xl font-semibold text-white text-base transition-all ${
            ok ? 'bg-green-500 scale-95' : 'bg-red-500 active:scale-95'
          }`}
        >
          {ok ? '✓ Añadido' : 'Añadir recurrente'}
        </button>
      </form>
    </div>
  )
}
