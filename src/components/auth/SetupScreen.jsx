import React, { useState } from 'react'
import { Banknote, CheckCircle, Circle, ExternalLink, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react'

const steps = [
  {
    n: 1,
    title: 'Crear proyecto en Supabase',
    detail: (
      <div className="space-y-2 text-sm text-apple-gray-600">
        <p>1. Entrá a <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-apple-blue underline inline-flex items-center gap-1">supabase.com <ExternalLink size={11} /></a> y creá una cuenta gratuita.</p>
        <p>2. Click en <strong>New project</strong>.</p>
        <p>3. Elegí un nombre (ej: <code className="bg-apple-gray-100 px-1 rounded text-xs">financeapp</code>), contraseña de DB y región.</p>
        <p>4. Esperá ~2 minutos a que se provisione.</p>
      </div>
    ),
  },
  {
    n: 2,
    title: 'Desactivar confirmación de email',
    detail: (
      <div className="space-y-2 text-sm text-apple-gray-600">
        <p>En tu proyecto Supabase:</p>
        <p><strong>Authentication → Providers → Email</strong></p>
        <p>Desactivar el toggle <strong>"Confirm email"</strong> y guardar.</p>
        <p className="text-xs text-apple-gray-400">Esto permite crear usuarios con nombre de usuario sin necesitar un email real.</p>
      </div>
    ),
  },
  {
    n: 3,
    title: 'Crear las tablas (SQL)',
    detail: (
      <div className="space-y-2 text-sm text-apple-gray-600">
        <p><strong>SQL Editor → New query</strong></p>
        <p>Copiar el contenido del archivo <code className="bg-apple-gray-100 px-1 rounded text-xs">supabase/schema.sql</code> de este proyecto, pegarlo y hacer click en <strong>Run</strong>.</p>
      </div>
    ),
  },
  {
    n: 4,
    title: 'Obtener las credenciales',
    detail: (
      <div className="space-y-2 text-sm text-apple-gray-600">
        <p><strong>Project Settings → API</strong></p>
        <p>Necesitás dos valores:</p>
        <ul className="space-y-1 list-disc list-inside text-xs">
          <li><strong>Project URL</strong> — empieza con <code className="bg-apple-gray-100 px-1 rounded">https://</code></li>
          <li><strong>anon public</strong> — clave larga que empieza con <code className="bg-apple-gray-100 px-1 rounded">eyJ</code></li>
        </ul>
      </div>
    ),
  },
  {
    n: 5,
    title: 'Crear el archivo .env.local',
    detail: (
      <EnvStep />
    ),
  },
]

function EnvStep() {
  const [copied, setCopied] = useState(false)
  const text = `VITE_SUPABASE_URL=https://xxxx.supabase.co\nVITE_SUPABASE_ANON_KEY=eyJ...`
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="space-y-2 text-sm text-apple-gray-600">
      <p>En la carpeta raíz del proyecto, crear el archivo <code className="bg-apple-gray-100 px-1 rounded text-xs">.env.local</code> con:</p>
      <div className="relative">
        <pre className="bg-apple-gray-900 text-green-400 text-xs rounded-lg p-3 overflow-x-auto leading-relaxed">{text}</pre>
        <button onClick={copy} className="absolute top-2 right-2 p-1.5 rounded bg-apple-gray-700 hover:bg-apple-gray-600 text-white transition-colors">
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </button>
      </div>
      <p>Reemplazá los valores con los del paso 4.</p>
      <p className="text-apple-orange font-medium text-xs">⚡ Reiniciá el servidor (<code>npm run dev</code>) después de crear el archivo.</p>
    </div>
  )
}

function Step({ step, index }) {
  const [open, setOpen] = useState(index === 0)
  return (
    <div className="border border-apple-gray-100 rounded-apple overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-apple-gray-50 transition-colors"
      >
        <div className="w-6 h-6 rounded-full bg-apple-blue flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {step.n}
        </div>
        <span className="flex-1 text-sm font-medium text-apple-gray-800">{step.title}</span>
        {open ? <ChevronUp size={15} className="text-apple-gray-400" /> : <ChevronDown size={15} className="text-apple-gray-400" />}
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-apple-gray-50">
          <div className="pt-3">{step.detail}</div>
        </div>
      )}
    </div>
  )
}

export default function SetupScreen() {
  return (
    <div className="min-h-screen bg-apple-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-apple-blue rounded-2xl flex items-center justify-center shadow-apple-lg mb-4">
            <Banknote size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-apple-gray-900">Configuración inicial</h1>
          <p className="text-sm text-apple-gray-500 mt-1 text-center max-w-xs">
            Seguí estos 5 pasos para conectar la app a tu base de datos.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-2 mb-6">
          {steps.map((step, i) => (
            <Step key={step.n} step={step} index={i} />
          ))}
        </div>

        {/* Refresh hint */}
        <div className="card p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
            <span className="text-base">🔄</span>
          </div>
          <div>
            <p className="text-sm font-medium text-apple-gray-800">Cuando termines</p>
            <p className="text-xs text-apple-gray-500 mt-0.5">
              Reiniciá el servidor con <code className="bg-apple-gray-100 px-1 rounded">npm run dev</code> y recargá la página.
              Esta pantalla desaparecerá y podrás crear tu usuario.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
