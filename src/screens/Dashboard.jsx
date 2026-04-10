import { useMemo, useState, useRef, useEffect } from 'react'
import { CATEGORIA_MAP, formatEur, calcMes } from '../constants.js'

const MESES_CORTO = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

export default function Dashboard({ transacciones, fijos, presupuesto, saldoInicial, onSaldoInicial, metas, onAddMeta, onDeleteMeta, onAportarMeta, setScreen, perfil, onLogout, tema, onToggleTema }) {
  const now        = new Date()
  const anyo       = now.getFullYear()
  const mesHoy     = now.getMonth() // 0-based
  const [mesIdx, setMesIdx]   = useState(mesHoy)
  const mesRef = useRef(null)

  const mesStr = `${anyo}-${String(mesIdx + 1).padStart(2, '0')}`

  const { totalGastado, totalIngresos, saldo, gastoFijo, ingresoFijo } = useMemo(
    () => calcMes(transacciones, fijos, mesStr),
    [transacciones, fijos, mesStr]
  )

  const netTotal = useMemo(() =>
    transacciones.reduce((s, t) => t.tipo === 'ingreso' ? s + t.cantidad : s - t.cantidad, 0),
    [transacciones]
  )
  const saldoCuenta   = saldoInicial !== null ? saldoInicial + netTotal : null
  const metasActivas  = metas.filter(m => m.actual < m.meta).length

  const porCategoria = useMemo(() => {
    const mapa = {}
    transacciones.filter(t => t.fecha.startsWith(mesStr) && t.tipo === 'gasto')
      .forEach(t => { mapa[t.categoria] = (mapa[t.categoria] || 0) + t.cantidad })
    fijos.filter(f => f.tipo === 'gasto')
      .forEach(f => { mapa[f.categoria] = (mapa[f.categoria] || 0) + f.cantidad })
    return Object.entries(mapa).sort((a, b) => b[1] - a[1])
  }, [transacciones, fijos, mesStr])

  const recientes = transacciones.filter(t => t.fecha.startsWith(mesStr)).slice(0, 4)

  // Scroll al mes actual al montar
  useEffect(() => {
    if (mesRef.current) {
      const btn = mesRef.current.children[mesHoy]
      btn?.scrollIntoView({ inline: 'center', behavior: 'smooth' })
    }
  }, [])

  const hora    = now.getHours()
  const saludo  = hora < 13 ? 'Buenos días' : hora < 20 ? 'Buenas tardes' : 'Buenas noches'
  const fechaHoy = now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
  const nombre  = perfil?.nombre || 'tú'

  return (
    <div className="pb-2">
      {/* ── Header gradiente ── */}
      <div className="header-gradient px-5 pt-10 pb-5 rounded-b-3xl">
        <div className="flex items-center justify-between">
          <p className="text-xs text-white/50 uppercase tracking-widest font-semibold">{saludo}, {nombre} 👋</p>
          <div className="flex items-center gap-2">
            <button onClick={onToggleTema}
              className="text-lg w-8 h-8 flex items-center justify-center rounded-lg bg-white/10">
              {tema === 'dark' ? '☀️' : '🌙'}
            </button>
            <button onClick={onLogout}
              className="text-[10px] text-white/30 font-medium px-2 py-1 rounded-lg bg-white/5">
              Salir
            </button>
          </div>
        </div>
        <div className="flex items-end justify-between mt-1 mb-4">
          <h1 className="text-3xl font-bold text-[var(--text-1)]">Kio 💰</h1>
          <p className="text-xs text-white/60 capitalize pb-1">{fechaHoy}</p>
        </div>

        {/* Selector de mes */}
        <div ref={mesRef} className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {MESES_CORTO.map((m, i) => (
            <button key={m} onClick={() => setMesIdx(i)}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${
                i === mesIdx
                  ? 'bg-white text-gray-900'
                  : i > mesHoy ? 'bg-white/10 text-white/30' : 'bg-white/20 text-white'
              }`}
              disabled={i > mesHoy}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* ── Saldo en cuenta ── */}
      <div className="px-4 mt-4">
        <SaldoCuenta saldoCuenta={saldoCuenta} saldoInicial={saldoInicial} onSaldoInicial={onSaldoInicial} />
      </div>

      <TabGastos {...{ mesStr, mesIdx, MESES_CORTO, totalGastado, totalIngresos, saldo, gastoFijo, ingresoFijo, presupuesto, porCategoria, recientes, metas, metasActivas, setScreen }} />
    </div>
  )
}

// ── Tab Gastos ────────────────────────────────────────────────────────────────

function TabGastos({ mesStr, mesIdx, MESES_CORTO, totalGastado, totalIngresos, saldo, gastoFijo, ingresoFijo, presupuesto, porCategoria, recientes, metas, metasActivas, setScreen }) {
  const pct      = presupuesto > 0 ? Math.min((totalGastado / presupuesto) * 100, 100) : 0
  const superado = presupuesto > 0 && totalGastado >= presupuesto
  const alerta   = presupuesto > 0 && !superado && pct >= 80

  return (
    <div className="px-4 mt-3 space-y-3">
      {/* Card total gastos */}
      <div className="rounded-3xl p-5" style={{ background: 'linear-gradient(135deg, #7b1fa2, #c62828)' }}>
        <p className="text-xs text-white/60 uppercase tracking-widest font-semibold">
          Total {MESES_CORTO[mesIdx]}
        </p>
        <p className="text-4xl font-bold text-[var(--text-1)] mt-2">{formatEur(totalGastado)}</p>
        <p className="text-sm text-white/60 mt-1">{recientes.length} transacciones</p>
      </div>

      {/* Ingresos / Gastos */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-xs text-[var(--text-2)] font-medium mb-1">Ingresos</p>
          <p className="text-lg font-bold text-green-400">{formatEur(totalIngresos)}</p>
          {ingresoFijo > 0 && <p className="text-[10px] text-[var(--text-3)] mt-0.5">↩ {formatEur(ingresoFijo)} fijos</p>}
        </Card>
        <Card>
          <p className="text-xs text-[var(--text-2)] font-medium mb-1">Gastos</p>
          <p className="text-lg font-bold text-red-400">{formatEur(totalGastado)}</p>
          {gastoFijo > 0 && <p className="text-[10px] text-[var(--text-3)] mt-0.5">↩ {formatEur(gastoFijo)} fijos</p>}
        </Card>
      </div>

      {/* Balance */}
      <Card>
        <div className="flex justify-between items-center">
          <p className="text-sm text-[var(--text-2)]">Balance del mes</p>
          <p className={`text-lg font-bold ${saldo >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {saldo >= 0 ? '+' : ''}{formatEur(saldo)}
          </p>
        </div>
      </Card>

      {/* Metas shortcut */}
      <button onClick={() => setScreen('metas')} className="w-full text-left">
        <div className="bg-[var(--card)] rounded-3xl p-4 border border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--input)] flex items-center justify-center text-xl">🎯</div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-1)]">Objetivos de ahorro</p>
              <p className="text-xs text-[var(--text-2)]">
                {metas.length === 0
                  ? 'Sin objetivos todavía'
                  : metasActivas > 0
                    ? `${metasActivas} objetivo${metasActivas !== 1 ? 's' : ''} en curso`
                    : '¡Todos completados!'}
              </p>
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </button>

      {/* Presupuesto */}
      {presupuesto > 0 && (
        <Card>
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-semibold text-[var(--text-1)]">Presupuesto</p>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
              superado ? 'bg-red-500/20 text-red-400' : alerta ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
            }`}>
              {superado ? '⚠ Superado' : alerta ? '⚠ Al límite' : `${(100-pct).toFixed(0)}% libre`}
            </span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${superado ? 'bg-red-500' : alerta ? 'bg-amber-500' : 'bg-blue-500'}`}
              style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between mt-1.5">
            <p className="text-[11px] text-[var(--text-2)]">{formatEur(totalGastado)} gastado</p>
            <p className="text-[11px] text-[var(--text-2)]">de {formatEur(presupuesto)}</p>
          </div>
        </Card>
      )}

      {/* Por categoría */}
      {porCategoria.length > 0 && (
        <Card>
          <p className="text-sm font-semibold text-[var(--text-1)] mb-3">Por categoría</p>
          <div className="space-y-3">
            {porCategoria.slice(0, 4).map(([cat, total]) => {
              const info = CATEGORIA_MAP[cat]
              const pctCat = totalGastado > 0 ? (total / totalGastado) * 100 : 0
              return (
                <div key={cat} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                    style={{ backgroundColor: info?.bg + '33' || '#ffffff11' }}>
                    {info?.emoji || '📦'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-[var(--text-2)] font-medium">{info?.label || cat}</span>
                      <span className="text-xs font-bold text-[var(--text-1)]">{formatEur(total)}</span>
                    </div>
                    <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full"
                        style={{ width: `${pctCat}%`, backgroundColor: info?.color || '#6b7280' }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Recientes */}
      {recientes.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-[var(--text-2)] mb-2">Últimos movimientos</p>
          <div className="space-y-2">
            {recientes.map(t => <TxRow key={t.id} t={t} />)}
          </div>
        </div>
      )}

      {recientes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-4xl mb-2">💸</p>
          <p className="text-[var(--text-3)] text-sm">Sin movimientos este mes</p>
        </div>
      )}
    </div>
  )
}


// ── Saldo en cuenta ───────────────────────────────────────────────────────────

function SaldoCuenta({ saldoCuenta, saldoInicial, onSaldoInicial }) {
  const [editando, setEditando] = useState(false)
  const [valor, setValor]       = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (editando) {
      setValor(saldoInicial !== null ? String(saldoInicial) : '')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [editando, saldoInicial])

  function confirmar() {
    const num = parseFloat(valor.replace(',', '.'))
    if (!isNaN(num) && num >= 0) onSaldoInicial(num)
    setEditando(false)
  }

  return (
    <div className="bg-[var(--card)] rounded-3xl px-5 py-4 border border-[var(--border)]">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-[10px] text-[var(--text-3)] uppercase tracking-widest font-semibold mb-1">Saldo en cuenta</p>
          {editando ? (
            <input ref={inputRef} type="number" inputMode="decimal"
              value={valor} onChange={e => setValor(e.target.value)}
              onBlur={confirmar} onKeyDown={e => { if (e.key === 'Enter') confirmar() }}
              className="text-2xl font-bold text-[var(--text-1)] outline-none bg-transparent w-full"
              placeholder="0,00"
            />
          ) : (
            <button onClick={() => setEditando(true)} className="text-left">
              {saldoCuenta !== null
                ? <p className="text-2xl font-bold text-[var(--text-1)]">{formatEur(saldoCuenta)}</p>
                : <p className="text-lg font-semibold text-[var(--text-3)]">Toca para configurar</p>
              }
            </button>
          )}
        </div>
        {!editando
          ? <button onClick={() => setEditando(true)} className="w-8 h-8 rounded-xl bg-[var(--input)] flex items-center justify-center ml-3">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-2)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          : <button onClick={confirmar} className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center ml-3">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
        }
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Card({ children }) {
  return (
    <div className="bg-[var(--card)] rounded-3xl p-4 border border-[var(--border)]">
      {children}
    </div>
  )
}

function TxRow({ t }) {
  const info  = CATEGORIA_MAP[t.categoria]
  const fecha = new Date(t.fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  return (
    <div className="bg-[var(--card)] rounded-2xl px-4 py-3 flex items-center gap-3 border border-[var(--border)]">
      <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0"
        style={{ backgroundColor: (info?.bg || '#f9fafb') + '22' }}>
        {info?.emoji || '📦'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text-1)] truncate">{t.nota || info?.label}</p>
        <p className="text-xs text-[var(--text-3)]">{fecha}</p>
      </div>
      <span className={`text-sm font-bold ${t.tipo === 'ingreso' ? 'text-green-400' : 'text-[var(--text-1)]'}`}>
        {t.tipo === 'ingreso' ? '+' : '-'}{formatEur(t.cantidad)}
      </span>
    </div>
  )
}
