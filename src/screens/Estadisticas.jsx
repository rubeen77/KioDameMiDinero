import { useMemo, useState, useRef, useEffect } from 'react'
import { CATEGORIA_MAP, formatEur, calcMes } from '../constants.js'

const MESES_CORTO = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

export default function Estadisticas({ transacciones, fijos }) {
  const now     = new Date()
  const anyo    = now.getFullYear()
  const mesHoy  = now.getMonth()
  const [mesIdx, setMesIdx] = useState(mesHoy)
  const [tab, setTab]       = useState('gastos') // 'gastos' | 'comparativa' | 'anual'
  const mesRef = useRef(null)

  useEffect(() => {
    if (mesRef.current) {
      const btn = mesRef.current.children[mesHoy]
      btn?.scrollIntoView({ inline: 'center', behavior: 'smooth' })
    }
  }, [])

  const mesStr = `${anyo}-${String(mesIdx + 1).padStart(2, '0')}`

  return (
    <div className="pb-2">
      {/* Header */}
      <div className="px-4 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-[var(--text-1)] mb-4">Estadísticas</h1>

        {/* Selector de mes */}
        <div ref={mesRef} className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {MESES_CORTO.map((m, i) => (
            <button key={m} onClick={() => setMesIdx(i)}
              disabled={i > mesHoy}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap shrink-0 transition-all ${
                i === mesIdx
                  ? 'bg-red-500 text-white'
                  : i > mesHoy ? 'bg-[var(--card)] text-[var(--text-3)]' : 'bg-[var(--card)] text-[var(--text-2)]'
              }`}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="bg-[var(--card)] rounded-2xl p-1 flex border border-[var(--border)]">
          {[['gastos','📊 Gastos'], ['comparativa','⚖️ Comparativa'], ['anual','📈 Año']].map(([t, l]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                tab === t ? 'bg-red-500 text-white' : 'text-[var(--text-2)]'
              }`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {tab === 'gastos'     && <TabGastos mesStr={mesStr} mesIdx={mesIdx} transacciones={transacciones} fijos={fijos} />}
      {tab === 'comparativa'&& <TabComparativa mesIdx={mesIdx} anyo={anyo} transacciones={transacciones} fijos={fijos} />}
      {tab === 'anual'      && <TabAnual anyo={anyo} mesHoy={mesHoy} transacciones={transacciones} fijos={fijos} />}
    </div>
  )
}

// ── Tab Gastos ────────────────────────────────────────────────────────────────

function TabGastos({ mesStr, mesIdx, transacciones, fijos }) {
  const { datos, total, totalIngresos } = useMemo(() => {
    const mapa = {}
    transacciones.filter(t => t.fecha.startsWith(mesStr) && t.tipo === 'gasto')
      .forEach(t => { mapa[t.categoria] = (mapa[t.categoria] || 0) + t.cantidad })
    fijos.filter(f => f.tipo === 'gasto')
      .forEach(f => { mapa[f.categoria] = (mapa[f.categoria] || 0) + f.cantidad })
    const total = Object.values(mapa).reduce((s, v) => s + v, 0)

    const ingresoVar = transacciones.filter(t => t.fecha.startsWith(mesStr) && t.tipo === 'ingreso').reduce((s,t) => s + t.cantidad, 0)
    const ingresoFijo = fijos.filter(f => f.tipo === 'ingreso').reduce((s,f) => s + f.cantidad, 0)
    const totalIngresos = ingresoVar + ingresoFijo

    const datos = Object.entries(mapa)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, val]) => {
        const info = CATEGORIA_MAP[cat]
        return { cat, val, info, pct: total > 0 ? (val / total) * 100 : 0, color: info?.color || '#6b7280' }
      })
    return { datos, total, totalIngresos }
  }, [transacciones, fijos, mesStr])

  const SIZE = 200, R = 72, CIRCUM = 2 * Math.PI * R
  let acum = 0
  const arcos = datos.map(d => {
    const len = (d.pct / 100) * CIRCUM
    const offset = CIRCUM - acum
    acum += len
    return { ...d, len, offset }
  })

  const saldo = totalIngresos - total

  if (datos.length === 0) return (
    <div className="text-center py-16">
      <p className="text-4xl mb-3">📊</p>
      <p className="text-[var(--text-3)] text-sm">Sin gastos en {MESES_CORTO[mesIdx]}</p>
    </div>
  )

  return (
    <div className="px-4 space-y-3">
      {/* Ingresos vs Gastos */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[var(--card)] rounded-2xl p-3 border border-[var(--border)]">
          <p className="text-[10px] text-[var(--text-3)] font-semibold uppercase tracking-widest mb-1">Ingresos</p>
          <p className="text-base font-bold text-green-400">{formatEur(totalIngresos)}</p>
        </div>
        <div className="bg-[var(--card)] rounded-2xl p-3 border border-[var(--border)]">
          <p className="text-[10px] text-[var(--text-3)] font-semibold uppercase tracking-widest mb-1">Gastos</p>
          <p className="text-base font-bold text-red-400">{formatEur(total)}</p>
        </div>
        <div className="bg-[var(--card)] rounded-2xl p-3 border border-[var(--border)]">
          <p className="text-[10px] text-[var(--text-3)] font-semibold uppercase tracking-widest mb-1">Balance</p>
          <p className={`text-base font-bold ${saldo >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {saldo >= 0 ? '+' : ''}{formatEur(saldo)}
          </p>
        </div>
      </div>

      {/* Donut */}
      <div className="bg-[var(--card)] rounded-3xl p-5 border border-[var(--border)] flex flex-col items-center">
        <p className="text-sm font-semibold text-[var(--text-2)] mb-3 self-start">Distribución de gastos</p>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <circle cx={SIZE/2} cy={SIZE/2} r={R} fill="none" stroke="var(--input)" strokeWidth="30" />
          {arcos.map((a, i) => (
            <circle key={i} cx={SIZE/2} cy={SIZE/2} r={R}
              fill="none" stroke={a.color} strokeWidth="30"
              strokeDasharray={`${a.len} ${CIRCUM - a.len}`}
              strokeDashoffset={a.offset}
              transform={`rotate(-90 ${SIZE/2} ${SIZE/2})`} />
          ))}
          <text x={SIZE/2} y={SIZE/2 - 8} textAnchor="middle" fill="var(--text-3)" fontSize="11">Total</text>
          <text x={SIZE/2} y={SIZE/2 + 12} textAnchor="middle" fill="var(--text-1)" fontSize="16" fontWeight="700">
            {formatEur(total)}
          </text>
        </svg>
      </div>

      {/* Barras por categoría */}
      <div className="bg-[var(--card)] rounded-3xl p-4 border border-[var(--border)] space-y-4">
        <p className="text-sm font-semibold text-[var(--text-2)]">Por categoría</p>
        {datos.map((d, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-base">{d.info?.emoji}</span>
                <span className="text-sm font-medium text-[var(--text-1)]">{d.info?.label || d.cat}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-[var(--text-1)]">{formatEur(d.val)}</span>
                <span className="text-xs text-[var(--text-3)] ml-1.5">{d.pct.toFixed(1)}%</span>
              </div>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${d.pct}%`, backgroundColor: d.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Tab Comparativa ───────────────────────────────────────────────────────────

function TabComparativa({ mesIdx, anyo, transacciones, fijos }) {
  const mesActStr  = `${anyo}-${String(mesIdx + 1).padStart(2, '0')}`
  const mesAntIdx  = mesIdx === 0 ? null : mesIdx - 1
  const mesAntStr  = mesAntIdx !== null ? `${anyo}-${String(mesAntIdx + 1).padStart(2, '0')}` : null

  const datosAct = useMemo(() => calcMes(transacciones, fijos, mesActStr), [transacciones, fijos, mesActStr])
  const datosAnt = useMemo(() => mesAntStr ? calcMes(transacciones, fijos, mesAntStr) : null, [transacciones, fijos, mesAntStr])

  const filas = [
    { label: 'Ingresos',   act: datosAct.totalIngresos, ant: datosAnt?.totalIngresos, color: 'text-green-400', positivo: true },
    { label: 'Gastos',     act: datosAct.totalGastado,  ant: datosAnt?.totalGastado,  color: 'text-red-400',   positivo: false },
    { label: 'Fijos',      act: datosAct.gastoFijo,     ant: datosAnt?.gastoFijo,     color: 'text-[var(--text-2)]',  positivo: false },
    { label: 'Variables',  act: datosAct.gastoVar,      ant: datosAnt?.gastoVar,      color: 'text-[var(--text-2)]',  positivo: false },
    { label: 'Balance',    act: datosAct.saldo,         ant: datosAnt?.saldo,         color: datosAct.saldo >= 0 ? 'text-green-400' : 'text-red-400', positivo: true },
  ]

  const maxGasto = Math.max(datosAct.totalGastado, datosAnt?.totalGastado || 0, 1)
  const maxIngreso = Math.max(datosAct.totalIngresos, datosAnt?.totalIngresos || 0, 1)

  return (
    <div className="px-4 space-y-3">
      {/* Barras comparativas ingresos vs gastos */}
      <div className="bg-[var(--card)] rounded-3xl p-4 border border-[var(--border)]">
        <p className="text-sm font-semibold text-[var(--text-2)] mb-4">Ingresos vs Gastos</p>

        {/* Ingresos */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-[var(--text-2)] mb-2">
            <span>Ingresos</span>
          </div>
          <div className="space-y-1.5">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--text-2)]">{MESES_CORTO[mesIdx]}</span>
                <span className="text-green-400 font-semibold">{formatEur(datosAct.totalIngresos)}</span>
              </div>
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all duration-700"
                  style={{ width: `${(datosAct.totalIngresos / maxIngreso) * 100}%` }} />
              </div>
            </div>
            {datosAnt && mesAntIdx !== null && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--text-3)]">{MESES_CORTO[mesAntIdx]}</span>
                  <span className="text-[var(--text-2)] font-semibold">{formatEur(datosAnt.totalIngresos)}</span>
                </div>
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-green-900 rounded-full transition-all duration-700"
                    style={{ width: `${(datosAnt.totalIngresos / maxIngreso) * 100}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Gastos */}
        <div>
          <div className="flex justify-between text-xs text-[var(--text-2)] mb-2">
            <span>Gastos</span>
          </div>
          <div className="space-y-1.5">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--text-2)]">{MESES_CORTO[mesIdx]}</span>
                <span className="text-red-400 font-semibold">{formatEur(datosAct.totalGastado)}</span>
              </div>
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full transition-all duration-700"
                  style={{ width: `${(datosAct.totalGastado / maxGasto) * 100}%` }} />
              </div>
            </div>
            {datosAnt && mesAntIdx !== null && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--text-3)]">{MESES_CORTO[mesAntIdx]}</span>
                  <span className="text-[var(--text-2)] font-semibold">{formatEur(datosAnt.totalGastado)}</span>
                </div>
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-red-900 rounded-full transition-all duration-700"
                    style={{ width: `${(datosAnt.totalGastado / maxGasto) * 100}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabla comparativa */}
      <div className="bg-[var(--card)] rounded-3xl p-4 border border-[var(--border)]">
        <div className="flex justify-between text-[10px] text-[var(--text-3)] font-semibold uppercase tracking-widest mb-3 px-1">
          <span>Concepto</span>
          <div className="flex gap-6">
            {mesAntIdx !== null && <span>{MESES_CORTO[mesAntIdx]}</span>}
            <span>{MESES_CORTO[mesIdx]}</span>
            {datosAnt && <span>Dif.</span>}
          </div>
        </div>
        <div className="space-y-3">
          {filas.map((f, i) => {
            const diff = datosAnt ? f.act - (f.ant || 0) : null
            const diffPositivo = f.positivo ? diff >= 0 : diff <= 0
            return (
              <div key={i} className={`flex justify-between items-center px-1 ${i === filas.length - 1 ? 'border-t border-[var(--border)] pt-3' : ''}`}>
                <span className="text-sm text-[var(--text-2)]">{f.label}</span>
                <div className="flex gap-6 items-center">
                  {mesAntIdx !== null && (
                    <span className="text-xs text-[var(--text-3)] w-16 text-right">{formatEur(f.ant || 0)}</span>
                  )}
                  <span className={`text-sm font-bold w-16 text-right ${f.color}`}>{formatEur(f.act)}</span>
                  {diff !== null && (
                    <span className={`text-xs font-semibold w-14 text-right ${diffPositivo ? 'text-green-400' : 'text-red-400'}`}>
                      {diff >= 0 ? '+' : ''}{formatEur(diff)}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {!datosAnt && (
        <p className="text-xs text-[var(--text-3)] text-center py-2">Sin datos del mes anterior para comparar</p>
      )}
    </div>
  )
}

// ── Tab Anual ─────────────────────────────────────────────────────────────────

function TabAnual({ anyo, mesHoy, transacciones, fijos }) {
  const meses = useMemo(() => {
    return Array.from({ length: mesHoy + 1 }, (_, i) => {
      const mesStr = `${anyo}-${String(i + 1).padStart(2, '0')}`
      const { totalGastado, totalIngresos, saldo } = calcMes(transacciones, fijos, mesStr)
      return { mesStr, label: MESES_CORTO[i], totalGastado, totalIngresos, saldo }
    })
  }, [transacciones, fijos, anyo, mesHoy])

  const maxVal = Math.max(...meses.map(m => Math.max(m.totalGastado, m.totalIngresos)), 1)
  const totalAnioGasto   = meses.reduce((s, m) => s + m.totalGastado, 0)
  const totalAnioIngreso = meses.reduce((s, m) => s + m.totalIngresos, 0)
  const totalAnioSaldo   = totalAnioIngreso - totalAnioGasto
  const mejorMes  = [...meses].sort((a, b) => b.saldo - a.saldo)[0]
  const peorMes   = [...meses].sort((a, b) => a.saldo - b.saldo)[0]

  const BAR_H = 120

  return (
    <div className="px-4 space-y-3">
      {/* Resumen anual */}
      <div className="rounded-3xl p-5 border border-[var(--border)]" style={{ background: 'linear-gradient(135deg, #1a1040, #2d1b5e)' }}>
        <p className="text-[10px] text-purple-300/60 uppercase tracking-widest font-semibold mb-1">Resumen {anyo}</p>
        <p className={`text-4xl font-bold mt-1 mb-1 ${totalAnioSaldo >= 0 ? 'text-[var(--text-1)]' : 'text-red-400'}`}>
          {totalAnioSaldo >= 0 ? '+' : ''}{formatEur(totalAnioSaldo)}
        </p>
        <p className="text-sm text-purple-300/50">balance total del año</p>
        <div className="flex gap-4 mt-3">
          <div>
            <p className="text-[10px] text-[var(--text-2)]">Ingresos</p>
            <p className="text-sm font-bold text-green-400">{formatEur(totalAnioIngreso)}</p>
          </div>
          <div>
            <p className="text-[10px] text-[var(--text-2)]">Gastos</p>
            <p className="text-sm font-bold text-red-400">{formatEur(totalAnioGasto)}</p>
          </div>
        </div>
      </div>

      {/* Gráfico de barras mensual */}
      <div className="bg-[var(--card)] rounded-3xl p-4 border border-[var(--border)]">
        <p className="text-sm font-semibold text-[var(--text-2)] mb-4">Evolución mensual</p>
        <div className="flex items-end justify-between gap-1" style={{ height: BAR_H + 24 }}>
          {meses.map((m, i) => {
            const hGasto   = maxVal > 0 ? (m.totalGastado / maxVal) * BAR_H : 0
            const hIngreso = maxVal > 0 ? (m.totalIngresos / maxVal) * BAR_H : 0
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                <div className="w-full flex items-end justify-center gap-0.5" style={{ height: BAR_H }}>
                  <div className="flex-1 rounded-t-sm bg-green-600/70 transition-all duration-700"
                    style={{ height: hIngreso }} />
                  <div className="flex-1 rounded-t-sm bg-red-500/70 transition-all duration-700"
                    style={{ height: hGasto }} />
                </div>
                <p className="text-[9px] text-[var(--text-3)]">{m.label}</p>
              </div>
            )
          })}
        </div>
        {/* Leyenda */}
        <div className="flex gap-4 mt-2 justify-center">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-green-600/70" />
            <span className="text-xs text-[var(--text-3)]">Ingresos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-red-500/70" />
            <span className="text-xs text-[var(--text-3)]">Gastos</span>
          </div>
        </div>
      </div>

      {/* Mejor y peor mes */}
      {meses.length > 1 && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[var(--card)] rounded-2xl p-4 border border-green-500/20">
            <p className="text-[10px] text-green-400 font-semibold uppercase tracking-widest mb-1">Mejor mes</p>
            <p className="text-lg font-bold text-[var(--text-1)]">{mejorMes.label}</p>
            <p className="text-sm font-semibold text-green-400">{mejorMes.saldo >= 0 ? '+' : ''}{formatEur(mejorMes.saldo)}</p>
          </div>
          <div className="bg-[var(--card)] rounded-2xl p-4 border border-red-500/20">
            <p className="text-[10px] text-red-400 font-semibold uppercase tracking-widest mb-1">Peor mes</p>
            <p className="text-lg font-bold text-[var(--text-1)]">{peorMes.label}</p>
            <p className={`text-sm font-semibold ${peorMes.saldo >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {peorMes.saldo >= 0 ? '+' : ''}{formatEur(peorMes.saldo)}
            </p>
          </div>
        </div>
      )}

      {/* Tabla mensual */}
      <div className="bg-[var(--card)] rounded-3xl p-4 border border-[var(--border)]">
        <p className="text-sm font-semibold text-[var(--text-2)] mb-3">Detalle por mes</p>
        <div className="flex justify-between text-[10px] text-[var(--text-3)] font-semibold uppercase tracking-widest mb-2 px-1">
          <span>Mes</span>
          <div className="flex gap-4">
            <span className="w-16 text-right">Ingresos</span>
            <span className="w-14 text-right">Gastos</span>
            <span className="w-14 text-right">Balance</span>
          </div>
        </div>
        <div className="space-y-2">
          {[...meses].reverse().map((m, i) => (
            <div key={i} className="flex justify-between items-center px-1">
              <span className="text-sm text-[var(--text-2)] w-8">{m.label}</span>
              <div className="flex gap-4 items-center">
                <span className="text-xs text-green-400 font-semibold w-16 text-right">{formatEur(m.totalIngresos)}</span>
                <span className="text-xs text-red-400 font-semibold w-14 text-right">{formatEur(m.totalGastado)}</span>
                <span className={`text-xs font-bold w-14 text-right ${m.saldo >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {m.saldo >= 0 ? '+' : ''}{formatEur(m.saldo)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
