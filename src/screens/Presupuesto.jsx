import { useState, useMemo } from 'react'
import { formatEur, mesActual, labelMes, calcMes, recomendarPresupuesto } from '../constants.js'
import Metas from './Metas.jsx'

export default function Presupuesto({ presupuesto, onSave, transacciones, fijos, metas, onAddMeta, onDeleteMeta, onAportarMeta }) {
  const [tab, setTab] = useState('budget')

  return (
    <div className="pb-2">
      {/* Tab switcher */}
      <div className="px-4 pt-8 pb-3">
        <h1 className="text-2xl font-bold text-[var(--text-1)] mb-4">Budget</h1>
        <div className="bg-[var(--card)] rounded-2xl p-1 flex border border-[var(--border)]">
          {[['budget','💳 Presupuesto'], ['metas','🎯 Objetivos']].map(([t, l]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === t ? 'bg-red-500 text-white' : 'text-[var(--text-2)]'
              }`}
            >{l}</button>
          ))}
        </div>
      </div>

      {tab === 'budget'
        ? <TabBudget presupuesto={presupuesto} onSave={onSave} transacciones={transacciones} fijos={fijos} />
        : <div className="px-0"><Metas metas={metas} onAddMeta={onAddMeta} onDeleteMeta={onDeleteMeta} onAportarMeta={onAportarMeta} /></div>
      }
    </div>
  )
}

function TabBudget({ presupuesto, onSave, transacciones, fijos }) {
  const [editando, setEditando] = useState(false)
  const [valor, setValor]       = useState('')

  const mes = mesActual()
  const { totalGastado } = useMemo(() => calcMes(transacciones, fijos, mes), [transacciones, fijos, mes])
  const recom = useMemo(() => recomendarPresupuesto(fijos, transacciones), [fijos, transacciones])

  const restante = presupuesto - totalGastado
  const pct      = presupuesto > 0 ? Math.min((totalGastado / presupuesto) * 100, 100) : 0
  const superado = restante < 0
  const alerta   = !superado && pct >= 80

  const hoy         = new Date()
  const diaActual   = hoy.getDate()
  const diasMes     = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate()
  const diasPasados = Math.max(diaActual - 1, 1)
  const diasQuedan  = diasMes - diaActual + 1
  const ritmo       = totalGastado / diasPasados
  const proyeccion  = totalGastado + ritmo * diasQuedan
  const presupDiario = presupuesto > 0 && !superado ? restante / diasQuedan : 0

  function guardar() {
    const num = parseFloat(valor.replace(',', '.'))
    if (num > 0) onSave(num)
    setEditando(false)
  }

  function aplicarRecom() {
    if (!recom) return
    onSave(recom.recomendado)
    setEditando(false)
  }

  if (!presupuesto) {
    return (
      <div className="px-4 space-y-4">
        <p className="text-sm text-[var(--text-3)] capitalize">{labelMes(mes)}</p>

        {recom ? (
          <div className="bg-[var(--card)] rounded-3xl p-5 border border-[var(--border)]">
            <p className="text-[10px] text-red-400 font-semibold uppercase tracking-widest mb-1">Recomendación personalizada</p>
            <p className="text-4xl font-bold text-[var(--text-1)] mt-2 mb-1">{formatEur(recom.recomendado)}</p>
            <p className="text-sm text-[var(--text-2)] mb-4">
              {recom.base === 'ingresos'
                ? `Basado en tus ingresos de ${formatEur(recom.ingresoFijo)}/mes, ahorrando un 20%`
                : `Basado en tu media de gastos históricos`}
            </p>
            <DesgloseCálculo lineas={recom.lineas} />
            <button onClick={aplicarRecom}
              className="w-full mt-4 bg-red-500 text-white font-semibold py-3.5 rounded-2xl text-sm active:scale-95 transition-all">
              Usar este presupuesto
            </button>
            <button onClick={() => setEditando(true)} className="w-full mt-2 text-[var(--text-3)] text-sm py-2">
              Introducir manualmente
            </button>
          </div>
        ) : (
          <div className="bg-[var(--card)] rounded-3xl p-5 border border-[var(--border)] text-center">
            <p className="text-4xl mb-3">🎯</p>
            <p className="text-[var(--text-1)] font-semibold mb-1">Sin presupuesto</p>
            <p className="text-sm text-[var(--text-3)] mb-5 leading-relaxed">
              Añade ingresos y gastos fijos para recibir una recomendación personalizada.
            </p>
            <button onClick={() => setEditando(true)}
              className="w-full bg-red-500 text-white font-semibold py-3.5 rounded-2xl text-sm active:scale-95 transition-all">
              Establecer presupuesto
            </button>
          </div>
        )}

        {editando && <FormEditar valor={valor} setValor={setValor} onGuardar={guardar} onCancelar={() => setEditando(false)} />}
      </div>
    )
  }

  const estadoColor = superado ? 'text-red-400' : alerta ? 'text-amber-400' : 'text-[var(--text-1)]'
  const barColor    = superado ? 'bg-red-500'   : alerta ? 'bg-amber-500'   : 'bg-red-500'

  return (
    <div className="px-4 space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-sm text-[var(--text-3)] capitalize">{labelMes(mes)}</p>
        <button onClick={() => { setValor(String(presupuesto)); setEditando(v => !v) }}
          className="text-sm text-red-400 font-semibold">
          {editando ? 'Cancelar' : 'Editar'}
        </button>
      </div>

      {editando && <FormEditar valor={valor} setValor={setValor} onGuardar={guardar} onCancelar={() => setEditando(false)} />}

      {!editando && (
        <div className="bg-[var(--card)] rounded-3xl p-5 border border-[var(--border)]">
          <p className="text-[10px] text-[var(--text-3)] uppercase tracking-widest font-semibold mb-3">
            {superado ? 'Presupuesto superado' : 'Disponible este mes'}
          </p>
          <p className={`text-5xl font-bold tracking-tight mb-1 ${estadoColor}`}>
            {superado ? '-' : ''}{formatEur(Math.abs(restante))}
          </p>
          <p className="text-sm text-[var(--text-3)] mb-4">
            {superado
              ? `${formatEur(totalGastado)} gastado de ${formatEur(presupuesto)}`
              : `de ${formatEur(presupuesto)} · ${formatEur(totalGastado)} gastado`}
          </p>
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden mb-3">
            <div className={`h-full rounded-full transition-all duration-700 ${barColor}`}
              style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between">
            <span className={`text-xs font-bold ${estadoColor}`}>{pct.toFixed(0)}% usado</span>
            <span className="text-xs text-[var(--text-3)]">{diasQuedan} días restantes</span>
          </div>
        </div>
      )}

      {!editando && (
        <div className="grid grid-cols-3 gap-2">
          <MetricCard label="Gasto/día"  value={formatEur(ritmo)}      sub="ritmo actual"    warn={presupDiario > 0 && ritmo > presupDiario} />
          <MetricCard label="Budget/día" value={formatEur(Math.abs(presupDiario))} sub={superado ? 'superado' : 'para no pasarte'} highlight={!superado} />
          <MetricCard label="Proyección" value={formatEur(proyeccion)} sub="fin de mes"      warn={proyeccion > presupuesto} />
        </div>
      )}

      {!editando && (superado || alerta) && (
        <div className={`rounded-2xl px-4 py-3 ${superado ? 'bg-red-500/10 border border-red-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
          <p className={`text-sm font-semibold ${superado ? 'text-red-400' : 'text-amber-400'}`}>
            {superado ? `⚠ ${formatEur(-restante)} por encima del límite` : `⚠ ${pct.toFixed(0)}% del presupuesto usado`}
          </p>
          <p className={`text-xs mt-0.5 ${superado ? 'text-red-500/70' : 'text-amber-500/70'}`}>
            {superado ? 'Considera revisar tus gastos o ajustar el límite.'
              : `A este ritmo proyectas gastar ${formatEur(proyeccion)} este mes.`}
          </p>
        </div>
      )}

      {!editando && recom && (
        <div className="bg-[var(--card)] rounded-3xl p-4 border border-[var(--border)]">
          <p className="text-[10px] text-red-400 font-semibold uppercase tracking-widest mb-2">
            {recom.base === 'ingresos' ? '🧠 Basado en tus ingresos' : '🧠 Basado en tu historial'}
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--text-3)] mb-0.5">Sugerido</p>
              <p className="text-2xl font-bold text-[var(--text-1)]">{formatEur(recom.recomendado)}</p>
              <p className="text-xs text-[var(--text-3)] mt-0.5">
                {recom.base === 'ingresos'
                  ? `Ingresos ${formatEur(recom.ingresoFijo)} − ahorro 20%`
                  : `Fijos + media ${formatEur(Math.round(recom.avgVar))}`}
              </p>
            </div>
            {recom.recomendado !== presupuesto
              ? <button onClick={aplicarRecom}
                  className="bg-red-500/20 text-red-400 font-semibold text-sm px-4 py-2 rounded-xl">
                  Aplicar
                </button>
              : <span className="bg-green-500/10 text-green-400 text-xs font-semibold px-3 py-1.5 rounded-xl">✓ Aplicado</span>
            }
          </div>
        </div>
      )}

      {!editando && (
        <button onClick={() => onSave(0)} className="w-full text-sm text-red-500/50 font-medium py-3">
          Eliminar presupuesto
        </button>
      )}
    </div>
  )
}

function MetricCard({ label, value, sub, warn, highlight }) {
  return (
    <div className={`rounded-2xl px-3 py-3 border ${
      warn ? 'bg-red-500/10 border-red-500/20' : highlight ? 'bg-red-500/10 border-red-500/20' : 'bg-[var(--card)] border-[var(--border)]'
    }`}>
      <p className={`text-xs font-medium mb-1 ${warn ? 'text-red-400' : highlight ? 'text-red-400' : 'text-[var(--text-3)]'}`}>{label}</p>
      <p className={`text-sm font-bold leading-tight ${warn ? 'text-red-400' : highlight ? 'text-[var(--text-1)]' : 'text-[var(--text-1)]'}`}>{value}</p>
      <p className={`text-[10px] mt-0.5 ${warn ? 'text-red-500/60' : 'text-[var(--text-3)]'}`}>{sub}</p>
    </div>
  )
}

function DesgloseCálculo({ lineas }) {
  const [abierto, setAbierto] = useState(false)
  return (
    <div>
      <button onClick={() => setAbierto(v => !v)} className="text-xs text-[var(--text-2)] font-medium flex items-center gap-1">
        {abierto ? '▾' : '▸'} Cómo se calcula
      </button>
      {abierto && (
        <div className="mt-2 bg-[var(--input)] rounded-xl p-3 space-y-1.5">
          {lineas.map((l, i) => (
            <div key={i} className={`flex justify-between ${i === lineas.length - 1 ? 'border-t border-gray-700 pt-1.5 mt-1' : ''}`}>
              <span className={`text-xs ${i === lineas.length - 1 ? 'font-semibold text-[var(--text-1)]' : 'text-[var(--text-2)]'}`}>{l.label}</span>
              <span className={`text-xs font-semibold ${i === lineas.length - 1 ? 'text-red-400' : l.valor < 0 ? 'text-red-400' : 'text-[var(--text-2)]'}`}>
                {l.signo !== '=' && l.signo + ' '}{formatEur(Math.abs(l.valor))}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function FormEditar({ valor, setValor, onGuardar, onCancelar }) {
  return (
    <div className="bg-[var(--card)] rounded-3xl p-5 border border-[var(--border)]">
      <label className="text-[10px] text-[var(--text-3)] font-semibold uppercase tracking-widest">Límite mensual (€)</label>
      <input type="number" inputMode="decimal" placeholder="0" value={valor}
        onChange={e => setValor(e.target.value)} autoFocus
        className="w-full text-4xl font-bold text-[var(--text-1)] outline-none mt-2 mb-4 bg-transparent"
        min="1" step="1" onKeyDown={e => { if (e.key === 'Enter') onGuardar() }} />
      <div className="flex gap-2">
        <button onClick={onCancelar} className="flex-1 py-3 rounded-2xl text-sm font-semibold text-[var(--text-3)] bg-[var(--input)]">Cancelar</button>
        <button onClick={onGuardar} className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white bg-red-500 active:scale-95 transition-all">Guardar</button>
      </div>
    </div>
  )
}
