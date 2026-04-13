import { useState, useCallback, useEffect } from 'react'
import { supabase } from './lib/supabase.js'
import { calcMes } from './constants.js'
import NavBar from './components/NavBar.jsx'
import Dashboard from './screens/Dashboard.jsx'
import Anadir from './screens/Anadir.jsx'
import Historial from './screens/Historial.jsx'
import Estadisticas from './screens/Estadisticas.jsx'
import Metas from './screens/Metas.jsx'
import Presupuesto from './screens/Presupuesto.jsx'
import Onboarding from './screens/Onboarding.jsx'
import Login from './screens/Login.jsx'
import {
  getTransacciones, addTransaccion, deleteTransaccion,
  getFijos, addFijo, deleteFijo,
  getPresupuesto, savePresupuesto,
  getSaldoInicial, saveSaldoInicial,
  getMetas, addMeta, deleteMeta, aportarMeta,
  getPerfil, savePerfil,
} from './storage.js'

async function pedirPermisoNotificacion() {
  if (!('Notification' in window) || Notification.permission !== 'default') return
  await Notification.requestPermission()
}

async function checkNotifPresupuesto(txs, fijos, presupuesto) {
  if (!presupuesto || !('Notification' in window) || Notification.permission !== 'granted') return
  const now = new Date()
  const mes = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const { totalGastado } = calcMes(txs, fijos, mes)
  const pct = (totalGastado / presupuesto) * 100
  const key80  = `kio_notif_80_${mes}`
  const key100 = `kio_notif_100_${mes}`
  const sw = await navigator.serviceWorker.ready.catch(() => null)
  if (!sw) return
  if (pct >= 100 && !localStorage.getItem(key100)) {
    localStorage.setItem(key100, '1')
    sw.showNotification('Kio 💰', { body: '⚠️ Has superado tu presupuesto mensual', icon: '/icons/icon-192.png' })
  } else if (pct >= 80 && !localStorage.getItem(key80)) {
    localStorage.setItem(key80, '1')
    sw.showNotification('Kio 💰', { body: `⚠️ Llevas el ${pct.toFixed(0)}% del presupuesto gastado`, icon: '/icons/icon-192.png' })
  }
}

export default function App() {
  const [tema, setTema] = useState(() => {
    const saved = localStorage.getItem('kio_tema')
    if (saved) return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema)
  }, [tema])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => {
      if (!localStorage.getItem('kio_tema')) {
        setTema(e.matches ? 'dark' : 'light')
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  function toggleTema() {
    const nuevo = tema === 'dark' ? 'light' : 'dark'
    setTema(nuevo)
    localStorage.setItem('kio_tema', nuevo)
  }

  const [session, setSession]             = useState(undefined)
  const [cargando, setCargando]           = useState(true)
  const [perfil, setPerfil]               = useState(null)
  const [screen, setScreen]               = useState('dashboard')
  const [transacciones, setTransacciones] = useState([])
  const [fijos, setFijos]                 = useState([])
  const [presupuesto, setPresupuesto]     = useState(0)
  const [saldoInicial, setSaldoInicial]   = useState(null)
  const [metas, setMetas]                 = useState([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) cargarDatos()
      else setCargando(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      if (event === 'SIGNED_IN') cargarDatos()
      if (event === 'SIGNED_OUT') {
        setPerfil(null)
        setTransacciones([]); setFijos([]); setMetas([])
        setPresupuesto(0); setSaldoInicial(null)
        setCargando(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function cargarDatos() {
    setCargando(true)
    try {
      const [txs, fjs, pres, saldo, mts, perf] = await Promise.all([
        getTransacciones(),
        getFijos(),
        getPresupuesto(),
        getSaldoInicial(),
        getMetas(),
        getPerfil(),
      ])
      setTransacciones(txs)
      setFijos(fjs)
      setPresupuesto(pres)
      setSaldoInicial(saldo)
      setMetas(mts)
      setPerfil(perf)
    } finally {
      setCargando(false)
    }
  }

  const handleAdd = useCallback(async t => {
    await addTransaccion(t)
    const newTxs = await getTransacciones()
    setTransacciones(newTxs)
    checkNotifPresupuesto(newTxs, fijos, presupuesto)
  }, [fijos, presupuesto])
  const handleDelete      = useCallback(async id => { await deleteTransaccion(id); setTransacciones(await getTransacciones()) }, [])
  const handleAddFijo     = useCallback(async f  => { await addFijo(f);  setFijos(await getFijos()) }, [])
  const handleDeleteFijo  = useCallback(async id => { await deleteFijo(id); setFijos(await getFijos()) }, [])
  const handlePresupuesto = useCallback(async n  => {
    await savePresupuesto(n)
    setPresupuesto(n)
    if (n > 0) pedirPermisoNotificacion()
  }, [])
  const handleSaldoInicial= useCallback(async n  => { await saveSaldoInicial(n); setSaldoInicial(n) }, [])
  const handleAddMeta     = useCallback(async m  => { await addMeta(m);  setMetas(await getMetas()) }, [])
  const handleDeleteMeta  = useCallback(async id => { await deleteMeta(id); setMetas(await getMetas()) }, [])
  const handleAportarMeta = useCallback(async (id, n) => { await aportarMeta(id, n); setMetas(await getMetas()) }, [])

  async function handleOnboarding(datos) {
    try {
      await savePerfil(datos)
    } catch (e) {
      console.error('savePerfil error:', e)
    }
    setPerfil(datos)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setScreen('dashboard')
  }

  // Cargando sesión o datos
  if (session === undefined || cargando) return <Splash />

  // Sin sesión → Login
  if (!session) return <Login />

  // Con sesión pero sin perfil → Onboarding
  if (!perfil) return <Onboarding onComplete={handleOnboarding} />

  const screens = {
    dashboard: (
      <Dashboard
        transacciones={transacciones} fijos={fijos}
        presupuesto={presupuesto} saldoInicial={saldoInicial}
        onSaldoInicial={handleSaldoInicial} setScreen={setScreen}
        metas={metas} onAddMeta={handleAddMeta}
        onDeleteMeta={handleDeleteMeta} onAportarMeta={handleAportarMeta}
        perfil={perfil} onLogout={handleLogout}
        tema={tema} onToggleTema={toggleTema}
      />
    ),
    anadir: (
      <Anadir onAdd={handleAdd} onAddFijo={handleAddFijo}
        fijos={fijos} onDeleteFijo={handleDeleteFijo} setScreen={setScreen} />
    ),
    historial: (
      <Historial transacciones={transacciones} fijos={fijos} onDelete={handleDelete} />
    ),
    estadisticas: (
      <Estadisticas transacciones={transacciones} fijos={fijos} />
    ),
    metas: (
      <Metas metas={metas} onAddMeta={handleAddMeta}
        onDeleteMeta={handleDeleteMeta} onAportarMeta={handleAportarMeta} />
    ),
    presupuesto: (
      <Presupuesto presupuesto={presupuesto} onSave={handlePresupuesto}
        transacciones={transacciones} fijos={fijos}
        metas={metas} onAddMeta={handleAddMeta}
        onDeleteMeta={handleDeleteMeta} onAportarMeta={handleAportarMeta} />
    ),
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] safe-top">
      <div className="max-w-md mx-auto pb-20 min-h-screen">
        {screens[screen] ?? screens.dashboard}
      </div>
      <NavBar screen={screen} setScreen={setScreen} />
    </div>
  )
}

function Splash() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
      <div className="text-center">
        <img src="/icons/icon-192.png" alt="Kio" className="w-20 h-20 rounded-3xl mx-auto mb-4 shadow-lg" />
        <p className="text-[var(--text-3)] text-sm mt-2">Kio...</p>
      </div>
    </div>
  )
}
