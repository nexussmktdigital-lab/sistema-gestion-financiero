import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import Layout from './components/layout/Layout'
import Login from './components/auth/Login'
import SetupScreen from './components/auth/SetupScreen'
import Dashboard from './components/dashboard/Dashboard'
import Clientes from './components/clientes/Clientes'
import Cheques from './components/cheques/Cheques'
import Divisas from './components/divisas/Divisas'
import Creditos from './components/creditos/Creditos'
import Alertas from './components/alertas/Alertas'
import { isConfigured } from './lib/supabase'
import { Loader2 } from 'lucide-react'

function AppContent() {
  const { user, loading } = useApp()

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
    </Layout>
  )
}

export default function App() {
  // Muestra los pasos de configuración si Supabase no está conectado
  if (!isConfigured) return <SetupScreen />

  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
