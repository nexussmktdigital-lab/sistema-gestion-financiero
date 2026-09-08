import React, { useEffect, useState } from 'react'
import { Clock, Lock } from 'lucide-react'
import { useApp } from '../../context/AppContext'

// Lee la expiración que el script demo.mjs guarda en app_metadata.
function getExpiry(user) {
  const raw = user?.app_metadata?.demo_expires_at
  const ts = raw ? new Date(raw).getTime() : NaN
  return Number.isFinite(ts) ? ts : null
}

function label(ms) {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h`
  return `${h}h ${m}m`
}

export default function DemoNotice() {
  const { user, signOut } = useApp()
  const expiry = getExpiry(user)
  const [remaining, setRemaining] = useState(expiry ? expiry - Date.now() : null)

  useEffect(() => {
    if (!expiry) return
    const tick = () => setRemaining(expiry - Date.now())
    tick()
    const t = setInterval(tick, 30000)
    return () => clearInterval(t)
  }, [expiry])

  // Al expirar, cerramos la sesión (el backstop de pg_cron ya borró la cuenta).
  useEffect(() => {
    if (remaining !== null && remaining <= 0) signOut()
  }, [remaining, signOut])

  if (!expiry) return null // no es la cuenta demo → no renderiza nada

  if (remaining <= 0) {
    return (
      <div className="fixed inset-0 z-50 bg-apple-gray-900/95 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
          <div className="w-14 h-14 bg-apple-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock size={26} className="text-apple-gray-500" />
          </div>
          <h2 className="text-lg font-semibold text-apple-gray-900 mb-2">La demo finalizó</h2>
          <p className="text-sm text-apple-gray-500">
            El período de prueba terminó. Escribinos para coordinar un acceso completo.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="sticky top-0 z-20 flex items-center justify-center gap-2 bg-amber-500 text-white text-xs font-medium px-4 py-1.5">
      <Clock size={13} />
      <span>Versión de demostración — expira en {label(remaining)}</span>
    </div>
  )
}
