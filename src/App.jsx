import { useState, useCallback, useEffect } from 'react'
import { supabase } from './lib/supabase.js'
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

export default function App() {
  const [tema, setTema] = useState(() => localStorage.getItem('kio_tema') || 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema)
  }, [tema])

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

  const handleAdd         = useCallback(async t  => { await addTransaccion(t);  setTransacciones(await getTransacciones()) }, [])
  const handleDelete      = useCallback(async id => { await deleteTransaccion(id); setTransacciones(await getTransacciones()) }, [])
  const handleAddFijo     = useCallback(async f  => { await addFijo(f);  setFijos(await getFijos()) }, [])
  const handleDeleteFijo  = useCallback(async id => { await deleteFijo(id); setFijos(await getFijos()) }, [])
  const handlePresupuesto = useCallback(async n  => { await savePresupuesto(n); setPresupuesto(n) }, [])
  const handleSaldoInicial= useCallback(async n  => { await saveSaldoInicial(n); setSaldoInicial(n) }, [])
  const handleAddMeta     = useCallback(async m  => { await addMeta(m);  setMetas(await getMetas()) }, [])
  const handleDeleteMeta  = useCallback(async id => { await deleteMeta(id); setMetas(await getMetas()) }, [])
  const handleAportarMeta = useCallback(async (id, n) => { await aportarMeta(id, n); setMetas(await getMetas()) }, [])

  async function handleOnboarding(datos) {
    await savePerfil(datos)
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
        <div className="w-20 h-20 rounded-3xl bg-red-500 flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg shadow-red-500/30">
          💰
        </div>
        <p className="text-gray-600 text-sm mt-2">Kio...</p>
      </div>
    </div>
  )
}
