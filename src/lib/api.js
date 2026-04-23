import { supabase } from './supabase'
import {
  clienteFromDb, clienteToDb,
  chequeFromDb, chequeToDb,
  divisaFromDb, divisaToDb,
  creditoFromDb, creditoToDb,
  alertaFromDb, alertaToDb,
} from './mappers'

// ─── Helper ─────────────────────────────────────────────────────────────────
async function query(promise) {
  const { data, error } = await promise
  if (error) throw error
  return data
}

// ─── CLIENTES ────────────────────────────────────────────────────────────────
export const api = {
  async fetchAll() {
    const [clientes, cheques, divisas, creditos, alertas] = await Promise.all([
      query(supabase.from('clientes').select('*').order('nombre')),
      query(supabase.from('cheques').select('*').order('fecha_cobro')),
      query(supabase.from('divisas').select('*').order('fecha_transaccion', { ascending: false })),
      query(supabase.from('creditos').select('*').order('fecha_emision', { ascending: false })),
      query(supabase.from('alertas').select('*').order('fecha_alerta')),
    ])
    return {
      clientes: clientes.map(clienteFromDb),
      cheques: cheques.map(chequeFromDb),
      divisas: divisas.map(divisaFromDb),
      creditos: creditos.map(creditoFromDb),
      alertas: alertas.map(alertaFromDb),
    }
  },

  // Clientes
  insertCliente: (c) => query(supabase.from('clientes').insert(clienteToDb(c))),
  updateCliente: (c) => query(supabase.from('clientes').update(clienteToDb(c)).eq('id', c.id)),
  deleteCliente: (id) => query(supabase.from('clientes').delete().eq('id', id)),

  // Cheques
  insertCheque: (c) => query(supabase.from('cheques').insert(chequeToDb(c))),
  updateCheque: (c) => query(supabase.from('cheques').update(chequeToDb(c)).eq('id', c.id)),
  deleteCheque: (id) => query(supabase.from('cheques').delete().eq('id', id)),

  // Divisas
  insertDivisa: (d) => query(supabase.from('divisas').insert(divisaToDb(d))),
  updateDivisa: (d) => query(supabase.from('divisas').update(divisaToDb(d)).eq('id', d.id)),
  deleteDivisa: (id) => query(supabase.from('divisas').delete().eq('id', id)),

  // Créditos
  insertCredito: (c) => query(supabase.from('creditos').insert(creditoToDb(c))),
  updateCredito: (c) => query(supabase.from('creditos').update(creditoToDb(c)).eq('id', c.id)),
  deleteCredito: (id) => query(supabase.from('creditos').delete().eq('id', id)),

  // Alertas
  insertAlerta: (a) => query(supabase.from('alertas').insert(alertaToDb(a))),
  updateAlerta: (a) => query(supabase.from('alertas').update(alertaToDb(a)).eq('id', a.id)),
  deleteAlerta: (id) => query(supabase.from('alertas').delete().eq('id', id)),
}
