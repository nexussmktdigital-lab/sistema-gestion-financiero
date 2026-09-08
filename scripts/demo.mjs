#!/usr/bin/env node
/**
 * Gestión de la cuenta DEMO con expiración (72 h por defecto).
 *
 * Uso (PowerShell, desde la carpeta del proyecto):
 *   $env:SUPABASE_SERVICE_ROLE_KEY="eyJ..."   # 1 sola vez por terminal
 *   node scripts/demo.mjs create        # crea la demo + datos de ejemplo, expira en 72 h
 *   node scripts/demo.mjs create 24     # expira en 24 h
 *   node scripts/demo.mjs status        # muestra estado y fecha de expiración
 *   node scripts/demo.mjs extend 48     # extiende: nueva expiración a 48 h desde AHORA
 *   node scripts/demo.mjs revoke        # borra YA la cuenta demo y todos sus datos
 *
 * - VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY se leen de .env.local automáticamente.
 * - El SERVICE_ROLE key NUNCA se guarda en el repo: se pasa por variable de entorno.
 * - La expiración real (server-side) la garantiza supabase/demo_expiry.sql (pg_cron).
 *   Este script es el control manual; el cron es el backstop automático.
 */
import { readFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

const DEMO_EMAIL = process.env.DEMO_EMAIL || 'demo@financeapp.com'
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'DemoFinance2026!'

// ── Cargar variables de .env.local / .env ───────────────────────────────────
function loadEnv() {
  const env = {}
  for (const file of ['.env', '.env.local']) {
    try {
      const txt = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')
      for (const line of txt.split('\n')) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
        if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
      }
    } catch { /* archivo opcional */ }
  }
  return env
}

const fileEnv = loadEnv()
const SUPA_URL = process.env.SUPABASE_URL || fileEnv.VITE_SUPABASE_URL
const ANON_KEY = process.env.SUPABASE_ANON_KEY || fileEnv.VITE_SUPABASE_ANON_KEY
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPA_URL || !ANON_KEY) {
  console.error('✖ Falta VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Creá .env.local (ver .env.example).')
  process.exit(1)
}
if (!SERVICE_KEY) {
  console.error('✖ Falta SUPABASE_SERVICE_ROLE_KEY.\n  En PowerShell:  $env:SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key"\n  (Supabase → Project Settings → API → service_role secret)')
  process.exit(1)
}

const admin = createClient(SUPA_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (ts) => new Date(ts).toLocaleString('es-AR', { dateStyle: 'long', timeStyle: 'short' })
const dstr = (offsetDays) => new Date(Date.now() + offsetDays * 86400000).toISOString().slice(0, 10)

async function findDemoUser() {
  let page = 1
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) throw error
    const u = data.users.find((u) => u.email === DEMO_EMAIL)
    if (u) return u
    if (data.users.length < 1000) return null
    page++
  }
}

// ── Datos de ejemplo (se insertan iniciando sesión como la demo, vía RLS) ─────
async function seed() {
  const sb = createClient(SUPA_URL, ANON_KEY, { auth: { persistSession: false } })
  const { error: signInErr } = await sb.auth.signInWithPassword({ email: DEMO_EMAIL, password: DEMO_PASSWORD })
  if (signInErr) throw signInErr

  const cli = Array.from({ length: 5 }, () => randomUUID())
  const clientes = [
    { id: cli[0], nombre: 'Martín García',    telefono: '1145678901', email: 'martin.garcia@email.com',  cuit: '20-12345678-9', direccion: 'Av. Corrientes 1234, CABA', notas: 'Cliente frecuente', created_at: dstr(-120) },
    { id: cli[1], nombre: 'Laura Fernández',   telefono: '1156789012', email: 'laura.fernandez@email.com', cuit: '27-23456789-0', direccion: 'Belgrano 567, GBA',        notas: '',                  created_at: dstr(-90) },
    { id: cli[2], nombre: 'Carlos Rodríguez',  telefono: '1167890123', email: 'carlos.r@email.com',        cuit: '20-34567890-1', direccion: 'San Martín 890, Rosario',  notas: 'Empresario pyme',   created_at: dstr(-60) },
    { id: cli[3], nombre: 'Sofía Martínez',    telefono: '1178901234', email: 'sofia.m@email.com',         cuit: '27-45678901-2', direccion: 'Mitre 321, Córdoba',       notas: '',                  created_at: dstr(-40) },
    { id: cli[4], nombre: 'Distribuidora Sur', telefono: '1189012345', email: 'pagos@distrisur.com',       cuit: '30-56789012-3', direccion: 'Ruta 9 Km 12, GBA',        notas: 'Cuenta corriente',  created_at: dstr(-25) },
  ]
  const cheques = [
    { id: randomUUID(), cliente_id: cli[0], nombre: 'Martín García',    telefono: '1145678901', fecha_cobro: dstr(5),  numero_cheque: '00012345', importe: 850000,  nombre_titular: 'Martín García',    cuit: '20-12345678-9', es_digital: false, comision: 12000, estado: 'pendiente', notas: 'Banco Nación' },
    { id: randomUUID(), cliente_id: cli[2], nombre: 'Carlos Rodríguez', telefono: '1167890123', fecha_cobro: dstr(12), numero_cheque: '00098872', importe: 1200000, nombre_titular: 'Carlos Rodríguez', cuit: '20-34567890-1', es_digital: true,  comision: 18000, estado: 'pendiente', notas: 'Echeq' },
    { id: randomUUID(), cliente_id: cli[1], nombre: 'Laura Fernández',  telefono: '1156789012', fecha_cobro: dstr(-3), numero_cheque: '00056120', importe: 450000,  nombre_titular: 'Laura Fernández',  cuit: '27-23456789-0', es_digital: false, comision: 6500,  estado: 'cobrado', destino: 'caja', fecha_uso: dstr(-3), notas: '' },
    { id: randomUUID(), cliente_id: cli[4], nombre: 'Distribuidora Sur',telefono: '1189012345', fecha_cobro: dstr(20), numero_cheque: '00077410', importe: 2300000, nombre_titular: 'Distribuidora Sur',cuit: '30-56789012-3', es_digital: true,  comision: 34000, estado: 'pendiente', notas: 'A confirmar fondos' },
  ]
  const divisas = [
    { id: randomUUID(), cliente_id: cli[0], nombre: 'Martín García',   divisa: 'USD', tipo_accion: 'compra', precio_compra: 1010, precio_venta: 1045, monto: 2000, fecha_transaccion: dstr(-7), notas: '' },
    { id: randomUUID(), cliente_id: cli[3], nombre: 'Sofía Martínez',  divisa: 'USD', tipo_accion: 'venta',  precio_compra: 1005, precio_venta: 1050, monto: 1500, fecha_transaccion: dstr(-2), notas: 'Pago contado' },
    { id: randomUUID(), cliente_id: cli[2], nombre: 'Carlos Rodríguez',divisa: 'EUR', tipo_accion: 'compra', precio_compra: 1120, precio_venta: 1160, monto: 800,  fecha_transaccion: dstr(-1), notas: '' },
  ]
  const creditos = [
    { id: randomUUID(), cliente_id: cli[1], nombre: 'Laura Fernández',  telefono: '1156789012', importe: 600000,  fecha_emision: dstr(-50), cuotas: 6,  interes: 8,  fecha_finalizar: dstr(130), cuotas_pagadas: 3, estado: 'activo', notas: '' },
    { id: randomUUID(), cliente_id: cli[2], nombre: 'Carlos Rodríguez', telefono: '1167890123', importe: 1500000, fecha_emision: dstr(-80), cuotas: 12, interes: 10, fecha_finalizar: dstr(280), cuotas_pagadas: 3, estado: 'mora',   notas: 'Atrasado 1 cuota' },
    { id: randomUUID(), cliente_id: cli[3], nombre: 'Sofía Martínez',   telefono: '1178901234', importe: 300000,  fecha_emision: dstr(-200),cuotas: 6,  interes: 7,  fecha_finalizar: dstr(-20), cuotas_pagadas: 6, estado: 'completado', notas: '' },
  ]
  const alertas = [
    { id: randomUUID(), cliente_id: cli[0], nombre: 'Martín García',   telefono: '1145678901', monto: 850000,  fecha_alerta: dstr(5),  descripcion: 'Vence cheque 00012345', tipo: 'cheque',  estado: 'pendiente' },
    { id: randomUUID(), cliente_id: cli[2], nombre: 'Carlos Rodríguez',telefono: '1167890123', monto: 125000,  fecha_alerta: dstr(2),  descripcion: 'Cuota en mora',          tipo: 'credito', estado: 'pendiente' },
    { id: randomUUID(), cliente_id: cli[4], nombre: 'Distribuidora Sur',telefono:'1189012345', monto: 2300000, fecha_alerta: dstr(20), descripcion: 'Confirmar echeq',         tipo: 'cheque',  estado: 'pendiente' },
  ]
  const caja = [
    { id: randomUUID(), fecha: dstr(0),  pesos_inicial: 1500000, dolares_inicial: 3200, notas: 'Apertura del día' },
    { id: randomUUID(), fecha: dstr(-1), pesos_inicial: 1200000, dolares_inicial: 3000, notas: '' },
  ]

  const ins = async (table, rows) => {
    const { error } = await sb.from(table).insert(rows)
    if (error) throw new Error(`${table}: ${error.message}`)
  }
  await ins('clientes', clientes)
  await ins('cheques', cheques)
  await ins('divisas', divisas)
  await ins('creditos', creditos)
  await ins('alertas', alertas)
  await ins('caja_diaria', caja)
  await sb.auth.signOut()
}

function printCreds(expiresIso) {
  console.log('\n┌─────────────────────────────────────────────┐')
  console.log('│  CREDENCIALES DE LA DEMO                       │')
  console.log('├─────────────────────────────────────────────┤')
  console.log(`   Email:       ${DEMO_EMAIL}`)
  console.log(`   Contraseña:  ${DEMO_PASSWORD}`)
  console.log(`   Expira:      ${fmt(expiresIso)}`)
  console.log('└─────────────────────────────────────────────┘')
  console.log('Pasale el link de Vercel + estas credenciales al cliente.\n')
}

// ── Comandos ───────────────────────────────────────────────────────────────
async function create(hours) {
  const existing = await findDemoUser()
  if (existing) {
    console.log('⚠ Ya existía una demo. La borro y la recreo limpia...')
    await admin.auth.admin.deleteUser(existing.id)
  }
  const expires = new Date(Date.now() + hours * 3600000).toISOString()
  const { error } = await admin.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
    app_metadata: { role: 'demo', demo_expires_at: expires },
  })
  if (error) throw error
  console.log('✓ Usuario demo creado. Cargando datos de ejemplo...')
  await seed()
  console.log('✓ Datos de ejemplo cargados.')
  printCreds(expires)
}

async function extend(hours) {
  const user = await findDemoUser()
  if (!user) return console.error('✖ No existe la demo. Creala con: node scripts/demo.mjs create')
  const expires = new Date(Date.now() + hours * 3600000).toISOString()
  const { error } = await admin.auth.admin.updateUserById(user.id, {
    app_metadata: { ...user.app_metadata, role: 'demo', demo_expires_at: expires },
  })
  if (error) throw error
  console.log(`✓ Demo extendida. Nueva expiración: ${fmt(expires)}`)
}

async function status() {
  const user = await findDemoUser()
  if (!user) return console.log('No existe la cuenta demo.')
  const exp = user.app_metadata?.demo_expires_at
  const expired = exp && new Date(exp).getTime() < Date.now()
  console.log(`Demo:    ${user.email}`)
  console.log(`Estado:  ${expired ? '⛔ EXPIRADA' : '✓ activa'}`)
  console.log(`Expira:  ${exp ? fmt(exp) : '(sin fecha)'}`)
}

async function revoke() {
  const user = await findDemoUser()
  if (!user) return console.log('No hay cuenta demo para borrar.')
  await admin.auth.admin.deleteUser(user.id)
  console.log('✓ Cuenta demo y todos sus datos eliminados.')
}

// ── Dispatch ─────────────────────────────────────────────────────────────────
const [cmd, arg] = process.argv.slice(2)
const hours = Number(arg) > 0 ? Number(arg) : 72
try {
  switch (cmd) {
    case 'create': await create(hours); break
    case 'extend': await extend(hours); break
    case 'status': await status(); break
    case 'revoke': await revoke(); break
    default:
      console.log('Comandos: create [horas] | extend <horas> | status | revoke')
  }
} catch (err) {
  console.error('✖ Error:', err.message || err)
  process.exit(1)
}
