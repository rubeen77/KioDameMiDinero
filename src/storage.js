import { supabase } from './lib/supabase.js'

// ── Transacciones ─────────────────────────────────────────────────────────────

export async function getTransacciones() {
  const { data } = await supabase.from('transacciones').select('*').order('fecha', { ascending: false })
  return data || []
}

export async function addTransaccion(t) {
  const { data: { user } } = await supabase.auth.getUser()
  const nueva = { ...t, id: Date.now().toString(), user_id: user.id }
  await supabase.from('transacciones').insert(nueva)
  return nueva
}

export async function deleteTransaccion(id) {
  await supabase.from('transacciones').delete().eq('id', id)
}

// ── Fijos ─────────────────────────────────────────────────────────────────────

export async function getFijos() {
  const { data } = await supabase.from('fijos').select('*').order('created_at', { ascending: true })
  return data || []
}

export async function addFijo(f) {
  const { data: { user } } = await supabase.auth.getUser()
  const nuevo = { ...f, id: Date.now().toString(), user_id: user.id }
  await supabase.from('fijos').insert(nuevo)
  return nuevo
}

export async function deleteFijo(id) {
  await supabase.from('fijos').delete().eq('id', id)
}

// ── Saldo inicial ─────────────────────────────────────────────────────────────

export async function getSaldoInicial() {
  const { data: { user } } = await supabase.auth.getUser()
  const { data } = await supabase.from('saldo_inicial').select('cantidad').eq('user_id', user.id).single()
  return data ? data.cantidad : null
}

export async function saveSaldoInicial(n) {
  const { data: { user } } = await supabase.auth.getUser()
  await supabase.from('saldo_inicial').upsert({ user_id: user.id, cantidad: n })
}

// ── Metas ─────────────────────────────────────────────────────────────────────

export async function getMetas() {
  const { data } = await supabase.from('metas').select('*').order('created_at', { ascending: true })
  return data || []
}

export async function addMeta(m) {
  const { data: { user } } = await supabase.auth.getUser()
  const nueva = { ...m, id: Date.now().toString(), user_id: user.id }
  await supabase.from('metas').insert(nueva)
  return nueva
}

export async function deleteMeta(id) {
  await supabase.from('metas').delete().eq('id', id)
}

export async function aportarMeta(id, cantidad) {
  const { data } = await supabase.from('metas').select('actual, meta').eq('id', id).single()
  if (!data) return
  const nuevo = Math.min(data.actual + cantidad, data.meta)
  await supabase.from('metas').update({ actual: nuevo }).eq('id', id)
}

// ── Presupuesto ───────────────────────────────────────────────────────────────

export async function getPresupuesto() {
  const { data: { user } } = await supabase.auth.getUser()
  const { data } = await supabase.from('presupuesto').select('cantidad').eq('user_id', user.id).single()
  return data ? data.cantidad : 0
}

export async function savePresupuesto(n) {
  const { data: { user } } = await supabase.auth.getUser()
  await supabase.from('presupuesto').upsert({ user_id: user.id, cantidad: n })
}

// ── Perfil ────────────────────────────────────────────────────────────────────

export async function getPerfil() {
  const { data: { user } } = await supabase.auth.getUser()
  const { data } = await supabase.from('perfiles').select('nombre, edad').eq('user_id', user.id).single()
  return data || null
}

export async function savePerfil(perfil) {
  const { data: { user } } = await supabase.auth.getUser()
  await supabase.from('perfiles').upsert({ user_id: user.id, ...perfil })
}
