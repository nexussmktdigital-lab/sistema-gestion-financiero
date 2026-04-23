import React from 'react'
import { Search, Bell, Menu } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useLayout } from './LayoutContext'
import { useNavigate } from 'react-router-dom'

export default function Header({ title, subtitle, actions }) {
  const { state, dispatch } = useApp()
  const { openSidebar } = useLayout()
  const navigate = useNavigate()
  const pendingAlerts = state.alertas.filter(a => a.estado === 'pendiente').length

  return (
    <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-apple border-b border-apple-gray-100 px-4 md:px-8 py-3 md:py-4">
      <div className="flex items-center gap-3">
        {/* Hamburger — solo móvil */}
        <button
          onClick={openSidebar}
          className="p-2 -ml-1 rounded-lg text-apple-gray-500 hover:bg-apple-gray-100 transition-colors lg:hidden"
        >
          <Menu size={20} />
        </button>

        {/* Título */}
        <div className="flex-1 min-w-0">
          <h1 className="text-base md:text-xl font-bold text-apple-gray-900 truncate">{title}</h1>
          {subtitle && <p className="text-xs md:text-sm text-apple-gray-500 hidden sm:block">{subtitle}</p>}
        </div>

        {/* Buscador — oculto en móvil */}
        <div className="relative w-52 hidden md:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-apple-gray-400" />
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={state.searchQuery}
            onChange={e => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
            className="input pl-9 text-sm h-9"
          />
        </div>

        {/* Campana */}
        <button
          onClick={() => navigate('/alertas')}
          className="relative p-2 rounded-lg text-apple-gray-500 hover:bg-apple-gray-100 transition-colors"
        >
          <Bell size={18} />
          {pendingAlerts > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-apple-red rounded-full text-[9px] font-bold text-white flex items-center justify-center">
              {pendingAlerts}
            </span>
          )}
        </button>

        {/* Acciones custom */}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}
