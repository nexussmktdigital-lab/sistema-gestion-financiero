import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL || ''
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// La app muestra una pantalla de configuración si esto es false
export const isConfigured =
  url.startsWith('https://') &&
  url.includes('.supabase.co') &&
  key.length > 20

export const supabase = isConfigured
  ? createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null
