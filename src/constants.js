export const CATEGORIAS_GASTO = [
  { id: 'comida',         label: 'Comida',        emoji: '🍔', color: '#f97316', bg: '#fff7ed' },
  { id: 'salidas',        label: 'Salidas',       emoji: '🍻', color: '#f59e0b', bg: '#fffbeb' },
  { id: 'transporte',     label: 'Transporte',    emoji: '🚌', color: '#3b82f6', bg: '#eff6ff' },
  { id: 'suscripciones',  label: 'Suscrip.',      emoji: '📱', color: '#8b5cf6', bg: '#f5f3ff' },
  { id: 'alcohol',        label: 'Alcohol',       emoji: '🍾', color: '#7c3aed', bg: '#f5f3ff' },
  { id: 'ropa',           label: 'Ropa',          emoji: '👕', color: '#ec4899', bg: '#fdf2f8' },
  { id: 'salud',          label: 'Salud',         emoji: '💊', color: '#ef4444', bg: '#fef2f2' },
  { id: 'onlyfans',       label: 'OnlyFans',      emoji: '💅', color: '#00aff0', bg: '#f0f9ff' },
  { id: 'pornhub',        label: 'PornHub',       emoji: '🍆', color: '#ff9000', bg: '#fff7ed' },
  { id: 'ruleta',         label: 'Ruleta',        emoji: '🎰', color: '#dc2626', bg: '#fef2f2' },
  { id: 'apuestas',       label: 'Apuestas',      emoji: '⚽', color: '#16a34a', bg: '#f0fdf4' },
  { id: 'drogas',         label: 'Drogas',        emoji: '💉', color: '#b91c1c', bg: '#fef2f2' },
  { id: 'tabaco',         label: 'Tabaco/Snus/Vaper', emoji: '🚬', color: '#78716c', bg: '#fafaf9' },
  { id: 'fifapoints',     label: 'FIFA Points',   emoji: '⚽🪙', color: '#2563eb', bg: '#eff6ff' },
  { id: 'juegospley',     label: 'Juegos de Pley', emoji: '🎮', color: '#003791', bg: '#e8f0ff' },
  { id: 'otros',          label: 'Otros',         emoji: '📦', color: '#6b7280', bg: '#f9fafb' },
]

export const CATEGORIAS_INGRESO = [
  { id: 'trabajo',  label: 'Trabajo',  emoji: '💼', color: '#10b981', bg: '#ecfdf5' },
  { id: 'paga',     label: 'Paga de mamá', emoji: '💰', color: '#3b82f6', bg: '#eff6ff' },
  { id: 'regalos',  label: 'Regalos',  emoji: '🎁', color: '#f59e0b', bg: '#fffbeb' },
  { id: 'joseo',    label: 'Joseo',    emoji: '🤝', color: '#059669', bg: '#ecfdf5' },
  { id: 'ruleta',   label: 'Ruleta',   emoji: '🎰', color: '#dc2626', bg: '#fef2f2' },
  { id: 'apuestas', label: 'Apuestas', emoji: '⚽', color: '#16a34a', bg: '#f0fdf4' },
  { id: 'otros',    label: 'Otros',    emoji: '📦', color: '#6b7280', bg: '#f9fafb' },
]

// Categorías antiguas — solo para mostrar datos ya guardados, no aparecen en el selector
const CATEGORIAS_LEGACY = [
  { id: 'ocio', label: 'Ocio', emoji: '🎮', color: '#a855f7', bg: '#faf5ff' },
  { id: 'casa', label: 'Casa', emoji: '🏠', color: '#10b981', bg: '#ecfdf5' },
]

// Mapa unificado para mostrar cualquier categoría en historial/dashboard
export const CATEGORIAS = [...CATEGORIAS_GASTO, ...CATEGORIAS_INGRESO]
export const CATEGORIA_MAP = Object.fromEntries(
  [...CATEGORIAS, ...CATEGORIAS_LEGACY].map(c => [c.id, c])
)

export function formatEur(n) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n)
}

export function mesActual() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function labelMes(mesStr) {
  const [y, m] = mesStr.split('-')
  const d = new Date(parseInt(y), parseInt(m) - 1, 1)
  return d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
}

// ── Cálculos que incluyen fijos ───────────────────────────────────────────────

export function calcMes(transacciones, fijos, mes) {
  const now        = new Date()
  const mesActual_ = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const diaHoy     = now.getDate()

  // Un fijo se aplica si:
  //  - no tiene día asignado → siempre cuenta
  //  - es un mes pasado → el mes ya terminó, cuenta entero
  //  - es el mes actual → solo si hoy >= su día
  const fijoAplicado = (f) => {
    if (!f.dia) return true
    if (mes !== mesActual_) return true
    return diaHoy >= f.dia
  }

  const vars = transacciones.filter(t => t.fecha.startsWith(mes))
  const gastoVar    = vars.filter(t => t.tipo === 'gasto').reduce((s, t) => s + t.cantidad, 0)
  const ingresoVar  = vars.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.cantidad, 0)
  const gastoFijo   = fijos.filter(f => f.tipo === 'gasto'   && fijoAplicado(f)).reduce((s, f) => s + f.cantidad, 0)
  const ingresoFijo = fijos.filter(f => f.tipo === 'ingreso' && fijoAplicado(f)).reduce((s, f) => s + f.cantidad, 0)

  const totalGastado  = gastoVar + gastoFijo
  const totalIngresos = ingresoVar + ingresoFijo
  const saldo = totalIngresos - totalGastado
  return { gastoVar, ingresoVar, gastoFijo, ingresoFijo, totalGastado, totalIngresos, saldo }
}

// ── Recomendación de presupuesto ─────────────────────────────────────────────

export function recomendarPresupuesto(fijos, transacciones) {
  const gastoFijo   = fijos.filter(f => f.tipo === 'gasto').reduce((s, f) => s + f.cantidad, 0)
  const ingresoFijo = fijos.filter(f => f.tipo === 'ingreso').reduce((s, f) => s + f.cantidad, 0)

  // Promedio de gastos variables de los últimos 3 meses
  const now = new Date()
  const gastosMeses = []
  for (let i = 1; i <= 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const g = transacciones
      .filter(t => t.fecha.startsWith(m) && t.tipo === 'gasto')
      .reduce((s, t) => s + t.cantidad, 0)
    if (g > 0) gastosMeses.push(g)
  }
  const avgVar = gastosMeses.length > 0
    ? gastosMeses.reduce((s, v) => s + v, 0) / gastosMeses.length
    : 0

  // Estrategia 1: basado en ingresos fijos → ahorro del 20%
  if (ingresoFijo > 0) {
    const totalIngresos = ingresoFijo
    const ahorro = Math.round(totalIngresos * 0.2)
    const recomendado = totalIngresos - ahorro
    return {
      recomendado,
      ahorro,
      gastoFijo,
      ingresoFijo,
      avgVar,
      base: 'ingresos',
      lineas: [
        { label: 'Ingresos fijos mensuales', valor: ingresoFijo, signo: '+' },
        { label: 'Objetivo de ahorro (20%)', valor: -ahorro, signo: '-' },
        { label: 'Presupuesto recomendado', valor: recomendado, signo: '=' },
      ],
    }
  }

  // Estrategia 2: basado en historial de gastos + 5% de margen
  if (avgVar > 0 || gastoFijo > 0) {
    const recomendado = Math.round(gastoFijo + avgVar * 1.05)
    return {
      recomendado,
      gastoFijo,
      avgVar,
      base: 'historial',
      lineas: [
        { label: 'Gastos fijos mensuales', valor: gastoFijo, signo: '+' },
        { label: `Media gastos variables (${gastosMeses.length}m)`, valor: Math.round(avgVar), signo: '+' },
        { label: 'Margen seguridad (5%)', valor: Math.round(avgVar * 0.05), signo: '+' },
        { label: 'Presupuesto recomendado', valor: recomendado, signo: '=' },
      ],
    }
  }

  return null
}
