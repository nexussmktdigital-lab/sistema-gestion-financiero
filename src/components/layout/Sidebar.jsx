import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, FileCheck, ArrowLeftRight,
  CreditCard, Bell, Banknote, LogOut, X
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import clsx from 'clsx'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/cheques', label: 'Cambio Cheque', icon: FileCheck },
  { to: '/divisas', label: 'Cambio Divisa', icon: ArrowLeftRight },
  { to: '/creditos', label: 'Créditos', icon: CreditCard },
  { to: '/alertas', label: 'Alertas de Cobro', icon: Bell },
]

export default function Sidebar({ open, onClose }) {
  const { state, user, signOut } = useApp()
  const pendingAlerts = state.alertas.filter(a => a.estado === 'pendiente').length
  const userEmail = user?.email || ''
  const username = userEmail.split('@')[0]
  const userInitial = username?.[0]?.toUpperCase() || 'U'

  return (
    <aside className={clsx(
      // Siempre: tamaño y estilos base
      'w-64 h-screen flex flex-col bg-white border-r border-apple-gray-100 shadow-sm z-40',
      // Posición: fixed en móvil (overlay), sticky en desktop (en flujo)
      'fixed top-0 left-0 lg:sticky',
      // Transición solo en móvil
      'transition-transform duration-300 ease-in-out lg:transition-none',
      // Visibilidad: controlada por 'open' en móvil, siempre visible en desktop
      open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
    )}>
      {/* Logo + cerrar en móvil */}
      <div className="px-5 py-5 border-b border-apple-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-apple-blue rounded-lg flex items-center justify-center shadow-sm">
            <Banknote size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-apple-gray-900 leading-none">FinanceApp</p>
            <p className="text-[10px] text-apple-gray-500 mt-0.5">Gestión Financiera</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-apple-gray-400 hover:bg-apple-gray-100 lg:hidden"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-apple-gray-400">Menú</p>
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) => clsx('sidebar-item group', isActive && 'active')}
          >
            <Icon size={18} />
            <span className="flex-1">{label}</span>
            {label === 'Alertas de Cobro' && pendingAlerts > 0 && (
              <span className="bg-apple-red text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {pendingAlerts}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-apple-gray-100 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-apple-blue flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {userInitial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-apple-gray-800 truncate">{userEmail}</p>
            <p className="text-[10px] text-apple-gray-400">Sistema v1.0</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-apple-gray-500 hover:bg-red-50 hover:text-apple-red transition-colors"
        >
          <LogOut size={13} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
