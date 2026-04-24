import React, { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import Layout from './components/layout/Layout'
import Login from './components/auth/Login'
import Dashboard from './components/dashboard/Dashboard'
import Clientes from './components/clientes/Clientes'
import Cheques from './components/cheques/Cheques'
import Divisas from './components/divisas/Divisas'
import Creditos from './components/creditos/Creditos'
import Alertas from './components/alertas/Alertas'
import CajaDiariaModal from './components/caja/CajaDiariaModal'
import { isConfigured } from './lib/supabase'
import { today } from './utils/caja'
import { Loader2 } from 'lucide-react'

function AppContent() {
  const { state, user, loading } = useApp()
  const [cajaOpen, setCajaOpen] = useState(false)

  // Abrir modal de caja al primer login del día
  useEffect(() => {
    if (loading || !user) return
    const hoy = today()
    const yaCargada = state.cajas.some(c => c.fecha === hoy)
    const sessionKey = `caja-prompt-${user.id}-${hoy}`
    const yaMostrado = sessionStorage.getItem(sessionKey)
    if (!yaCargada && !yaMostrado) {
      setCajaOpen(true)
      sessionStorage.setItem(sessionKey, '1')
    }
  }, [loading, user, state.cajas])

  if (loading) {
    return (
      <div className="min-h-screen bg-apple-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-apple-blue" />
          <p className="text-sm text-apple-gray-500">Cargando datos...</p>
        </div>
      </div>
    )
  }

  if (!user) return <Login />

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/cheques" element={<Cheques />} />
        <Route path="/divisas" element={<Divisas />} />
        <Route path="/creditos" element={<Creditos />} />
        <Route path="/alertas" element={<Alertas />} />
      </Routes>
      <CajaDiariaModal open={cajaOpen} onClose={() => setCajaOpen(false)} />
    </Layout>
  )
}

export default function App() {
  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-apple-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <p className="text-2xl mb-3">⚙️</p>
          <h1 className="text-lg font-semibold text-gray-800 mb-2">Variables de entorno faltantes</h1>
          <p className="text-sm text-gray-500 mb-4">
            Configurá <code className="bg-gray-100 px-1 rounded">VITE_SUPABASE_URL</code> y{' '}
            <code className="bg-gray-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> en Vercel y redeplogá.
          </p>
          <p className="text-xs text-gray-400">
            URL correcta: <code>https://TU-ID.supabase.co</code>
          </p>
        </div>
      </div>
    )
  }

  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
