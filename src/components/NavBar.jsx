export default function NavBar({ screen, setScreen }) {
  const items = [
    { id: 'dashboard',    label: 'Inicio',    icon: HomeIcon },
    { id: 'anadir',       label: 'Añadir',    icon: PlusIcon },
    { id: 'historial',    label: 'Historial', icon: ListIcon },
    { id: 'estadisticas', label: 'Stats',     icon: ChartIcon },
    { id: 'presupuesto',  label: 'Budget',    icon: WalletIcon },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--nav)] border-t border-[var(--nav-border)] safe-bottom z-50">
      <div className="flex justify-around items-center h-14 max-w-md mx-auto">
        {items.map(({ id, label, icon: Icon }) => {
          const active = screen === id
          return (
            <button key={id} onClick={() => setScreen(id)}
              className="flex flex-col items-center justify-center flex-1 h-full gap-0.5">
              <Icon active={active} />
              <span className={`text-[10px] font-medium ${active ? 'text-red-400' : 'text-[var(--text-3)]'}`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

function HomeIcon({ active }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#f87171' : 'var(--text-3)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
}
function PlusIcon({ active }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#f87171' : 'var(--text-3)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
}
function ListIcon({ active }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#f87171' : 'var(--text-3)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
}
function ChartIcon({ active }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#f87171' : 'var(--text-3)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
}
function WalletIcon({ active }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#f87171' : 'var(--text-3)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
}
