import React, { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '../lib/supabase'
import { api } from '../lib/api'

const AppContext = createContext(null)

const initialState = {
  clientes: [],
  cheques: [],
  divisas: [],
  creditos: [],
  alertas: [],
  searchQuery: '',
  notification: null,
}

function reducer(state, action) {
  const today = new Date().toISOString().slice(0, 10)
  switch (action.type) {
    // ─── CLIENTES ─────────────────────────────────────────────────────────
    case 'ADD_CLIENTE':
      return { ...state, clientes: [...state.clientes, { ...action.payload, id: action.payload.id, createdAt: action.payload.createdAt || today }] }
    case 'UPDATE_CLIENTE':
      return { ...state, clientes: state.clientes.map(c => c.id === action.payload.id ? { ...c, ...action.payload } : c) }
    case 'DELETE_CLIENTE':
      return { ...state, clientes: state.clientes.filter(c => c.id !== action.payload) }

    // ─── CHEQUES ──────────────────────────────────────────────────────────
    case 'ADD_CHEQUE':
      return { ...state, cheques: [...state.cheques, { ...action.payload, id: action.payload.id, createdAt: action.payload.createdAt || today }] }
    case 'UPDATE_CHEQUE':
      return { ...state, cheques: state.cheques.map(c => c.id === action.payload.id ? { ...c, ...action.payload } : c) }
    case 'DELETE_CHEQUE':
      return { ...state, cheques: state.cheques.filter(c => c.id !== action.payload) }

    // ─── DIVISAS ──────────────────────────────────────────────────────────
    case 'ADD_DIVISA':
      return { ...state, divisas: [...state.divisas, { ...action.payload, id: action.payload.id, createdAt: action.payload.createdAt || today }] }
    case 'UPDATE_DIVISA':
      return { ...state, divisas: state.divisas.map(d => d.id === action.payload.id ? { ...d, ...action.payload } : d) }
    case 'DELETE_DIVISA':
      return { ...state, divisas: state.divisas.filter(d => d.id !== action.payload) }

    // ─── CRÉDITOS ─────────────────────────────────────────────────────────
    case 'ADD_CREDITO':
      return { ...state, creditos: [...state.creditos, { ...action.payload, id: action.payload.id, createdAt: action.payload.createdAt || today }] }
    case 'UPDATE_CREDITO':
      return { ...state, creditos: state.creditos.map(c => c.id === action.payload.id ? { ...c, ...action.payload } : c) }
    case 'DELETE_CREDITO':
      return { ...state, creditos: state.creditos.filter(c => c.id !== action.payload) }

    // ─── ALERTAS ──────────────────────────────────────────────────────────
    case 'ADD_ALERTA':
      return { ...state, alertas: [...state.alertas, { ...action.payload, id: action.payload.id, createdAt: action.payload.createdAt || today }] }
    case 'UPDATE_ALERTA':
      return { ...state, alertas: state.alertas.map(a => a.id === action.payload.id ? { ...a, ...action.payload } : a) }
    case 'DELETE_ALERTA':
      return { ...state, alertas: state.alertas.filter(a => a.id !== action.payload) }

    // ─── UI ───────────────────────────────────────────────────────────────
    case 'SET_SEARCH':     return { ...state, searchQuery: action.payload }
    case 'SHOW_NOTIFICATION': return { ...state, notification: action.payload }
    case 'CLEAR_NOTIFICATION': return { ...state, notification: null }
    case 'LOAD_STATE':     return { ...state, ...action.payload }
    default:               return state
  }
}

// Enriquece acciones ADD_ con un uuid pre-generado para poder usarlo en Supabase
function enrich(action) {
  if (!action.type.startsWith('ADD_')) return action
  return {
    ...action,
    payload: {
      id: uuidv4(),
      ...action.payload,
    },
  }
}

// Mapa de action.type → función de API
async function syncToDb(action) {
  const p = action.payload
  switch (action.type) {
    case 'ADD_CLIENTE':    return api.insertCliente(p)
    case 'UPDATE_CLIENTE': return api.updateCliente(p)
    case 'DELETE_CLIENTE': return api.deleteCliente(p)
    case 'ADD_CHEQUE':     return api.insertCheque(p)
    case 'UPDATE_CHEQUE':  return api.updateCheque(p)
    case 'DELETE_CHEQUE':  return api.deleteCheque(p)
    case 'ADD_DIVISA':     return api.insertDivisa(p)
    case 'UPDATE_DIVISA':  return api.updateDivisa(p)
    case 'DELETE_DIVISA':  return api.deleteDivisa(p)
    case 'ADD_CREDITO':    return api.insertCredito(p)
    case 'UPDATE_CREDITO': return api.updateCredito(p)
    case 'DELETE_CREDITO': return api.deleteCredito(p)
    case 'ADD_ALERTA':     return api.insertAlerta(p)
    case 'UPDATE_ALERTA':  return api.updateAlerta(p)
    case 'DELETE_ALERTA':  return api.deleteAlerta(p)
    default: return null
  }
}

const DB_ACTIONS = new Set([
  'ADD_CLIENTE','UPDATE_CLIENTE','DELETE_CLIENTE',
  'ADD_CHEQUE','UPDATE_CHEQUE','DELETE_CHEQUE',
  'ADD_DIVISA','UPDATE_DIVISA','DELETE_DIVISA',
  'ADD_CREDITO','UPDATE_CREDITO','DELETE_CREDITO',
  'ADD_ALERTA','UPDATE_ALERTA','DELETE_ALERTA',
])

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Carga inicial desde Supabase
  const loadFromDb = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.fetchAll()
      dispatch({ type: 'LOAD_STATE', payload: data })
    } catch (err) {
      console.error('Error cargando datos:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Auth + carga inicial
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        loadFromDb()
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        loadFromDb()
      }
      if (event === 'SIGNED_OUT') {
        setUser(null)
        dispatch({ type: 'LOAD_STATE', payload: { clientes: [], cheques: [], divisas: [], creditos: [], alertas: [] } })
      }
    })

    return () => subscription.unsubscribe()
  }, [loadFromDb])

  // Auto-dismiss notification
  useEffect(() => {
    if (state.notification) {
      const t = setTimeout(() => dispatch({ type: 'CLEAR_NOTIFICATION' }), 3500)
      return () => clearTimeout(t)
    }
  }, [state.notification])

  const notify = (message, type = 'success') => {
    dispatch({ type: 'SHOW_NOTIFICATION', payload: { message, type } })
  }

  // dbDispatch: actualiza estado local (optimistic) y persiste en Supabase
  const dbDispatch = useCallback(async (action) => {
    if (!DB_ACTIONS.has(action.type)) {
      dispatch(action)
      return
    }
    const enriched = enrich(action)
    dispatch(enriched) // optimistic update inmediato
    try {
      await syncToDb(enriched)
    } catch (err) {
      console.error('Supabase sync error:', err)
      notify('Error al guardar en la base de datos. Reintentá.', 'error')
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AppContext.Provider value={{ state, dispatch: dbDispatch, notify, user, loading, signOut }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
