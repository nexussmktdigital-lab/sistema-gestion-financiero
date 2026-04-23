import React, { useState } from 'react'
import { Banknote, Eye, EyeOff, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const ERROR_MSGS = {
  'Invalid login credentials':  'Email o contraseña incorrectos.',
  'Email not confirmed':        'Revisá tu bandeja y confirmá el email antes de ingresar.',
  'User already registered':    'Ese email ya tiene una cuenta. Iniciá sesión.',
  'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
}

export default function Login() {
  const [mode, setMode]         = useState('login')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')

  const switchMode = (m) => { setMode(m); setError(''); setSuccess('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (mode === 'login') {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password })
        if (err) throw err
      } else {
        const { error: err } = await supabase.auth.signUp({ email, password })
        if (err) throw err
        setSuccess('Cuenta creada. Ya podés iniciar sesión.')
        switchMode('login')
      }
    } catch (err) {
      setError(ERROR_MSGS[err.message] || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-apple-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-apple-blue rounded-2xl flex items-center justify-center shadow-apple-lg mb-4">
            <Banknote size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-apple-gray-900">FinanceApp</h1>
          <p className="text-sm text-apple-gray-500 mt-1">Gestión Financiera</p>
        </div>

        <div className="card-lg p-6 space-y-4">
          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-apple-gray-100 rounded-lg">
            {[['login','Iniciar sesión'],['signup','Registrarse']].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => switchMode(id)}
                className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                  mode === id ? 'bg-white shadow-sm text-apple-gray-900' : 'text-apple-gray-500'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label">Contraseña</label>
              <div className="relative">
                <input
                  className="input pr-10"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-apple-gray-400 hover:text-apple-gray-700"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                <p className="text-xs text-apple-red">{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                <p className="text-xs text-apple-green">{success}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-2.5"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-apple-gray-400 mt-5">
          Acceso protegido · Cada cuenta tiene sus propios datos
        </p>
      </div>
    </div>
  )
}
