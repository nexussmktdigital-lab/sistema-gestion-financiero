import React, { useState, useRef, useEffect } from 'react'
import { Search, UserPlus, User, Phone, X } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import clsx from 'clsx'

/**
 * Campo inteligente de cliente: busca existentes y crea nuevos al vuelo.
 * Props:
 *   nombre, telefono, clienteId  — valores actuales
 *   onChange({ nombre, telefono, clienteId })  — callback
 *   required — hace obligatorio el nombre
 */
export default function ClienteInput({ nombre = '', telefono = '', clienteId = '', onChange, required = false }) {
  const { state } = useApp()
  const [query, setQuery] = useState(nombre)
  const [open, setOpen] = useState(false)
  const [isNew, setIsNew] = useState(!clienteId && !!nombre)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  // Sincronizar query si el formulario se resetea externamente
  useEffect(() => {
    setQuery(nombre)
    setIsNew(!clienteId && !!nombre)
  }, [nombre, clienteId])

  // Cerrar dropdown al hacer click afuera
  useEffect(() => {
    const handler = (e) => {
      if (!dropdownRef.current?.contains(e.target) && !inputRef.current?.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const matches = state.clientes.filter(c =>
    query.length >= 1 &&
    (c.nombre.toLowerCase().includes(query.toLowerCase()) ||
     c.telefono?.includes(query))
  ).slice(0, 6)

  const exactMatch = state.clientes.find(c => c.nombre.toLowerCase() === query.toLowerCase())

  const handleQueryChange = (value) => {
    setQuery(value)
    setOpen(true)
    setIsNew(false)
    // Si el usuario borra el nombre, limpiamos todo
    if (!value) {
      onChange({ nombre: '', telefono: '', clienteId: '' })
      return
    }
    // Actualiza el nombre en el formulario padre mientras tipea
    onChange({ nombre: value, telefono, clienteId: '' })
  }

  const selectCliente = (cliente) => {
    setQuery(cliente.nombre)
    setIsNew(false)
    setOpen(false)
    onChange({ nombre: cliente.nombre, telefono: cliente.telefono || '', clienteId: cliente.id })
  }

  const createNew = () => {
    setIsNew(true)
    setOpen(false)
    onChange({ nombre: query, telefono: '', clienteId: '' })
  }

  const clear = () => {
    setQuery('')
    setIsNew(false)
    setOpen(false)
    onChange({ nombre: '', telefono: '', clienteId: '' })
    inputRef.current?.focus()
  }

  const selectedCliente = state.clientes.find(c => c.id === clienteId)

  return (
    <div className="space-y-3">
      <div>
        <label className="label">
          Cliente {required && <span className="text-apple-red ml-0.5">*</span>}
        </label>

        {/* Input principal */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-apple-gray-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            className={clsx(
              'input pl-9 pr-8',
              selectedCliente && 'border-apple-blue bg-blue-50/40',
              isNew && 'border-apple-green bg-green-50/40'
            )}
            value={query}
            placeholder="Buscar cliente o escribir nuevo nombre..."
            required={required}
            onChange={e => handleQueryChange(e.target.value)}
            onFocus={() => query && setOpen(true)}
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={clear}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-apple-gray-400 hover:text-apple-gray-700"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Estado visual del cliente */}
        {selectedCliente && (
          <div className="mt-1.5 flex items-center gap-2 text-xs text-apple-blue">
            <User size={11} />
            <span>Cliente existente vinculado</span>
            {selectedCliente.telefono && (
              <span className="text-apple-gray-400">· {selectedCliente.telefono}</span>
            )}
          </div>
        )}
        {isNew && query && !selectedCliente && (
          <div className="mt-1.5 flex items-center gap-2 text-xs text-apple-green">
            <UserPlus size={11} />
            <span>Se creará como nuevo cliente al guardar</span>
          </div>
        )}

        {/* Dropdown */}
        {open && query.length >= 1 && (
          <div
            ref={dropdownRef}
            className="absolute left-0 right-0 z-50 mt-1 bg-white border border-apple-gray-100 rounded-apple shadow-apple-lg overflow-hidden"
          >
            {matches.length > 0 && (
              <div>
                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-apple-gray-400 bg-apple-gray-50">
                  Clientes existentes
                </p>
                {matches.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onMouseDown={() => selectCliente(c)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-apple-gray-50 text-left transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-apple-blue/10 flex items-center justify-center flex-shrink-0">
                      <User size={13} className="text-apple-blue" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-apple-gray-900 truncate">{c.nombre}</p>
                      {c.telefono && (
                        <p className="text-xs text-apple-gray-400 flex items-center gap-1">
                          <Phone size={10} /> {c.telefono}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Opción crear nuevo */}
            {!exactMatch && query.trim().length >= 2 && (
              <button
                type="button"
                onMouseDown={createNew}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-green-50 text-left transition-colors border-t border-apple-gray-100"
              >
                <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <UserPlus size={13} className="text-apple-green" />
                </div>
                <div>
                  <p className="text-sm font-medium text-apple-green">Crear "{query}"</p>
                  <p className="text-xs text-apple-gray-400">Nuevo cliente — se agrega automáticamente</p>
                </div>
              </button>
            )}

            {matches.length === 0 && query.trim().length < 2 && (
              <p className="px-3 py-3 text-xs text-apple-gray-400 text-center">Escribí al menos 2 caracteres</p>
            )}
          </div>
        )}
      </div>

      {/* Teléfono — siempre visible, obligatorio si es nuevo cliente */}
      <div className="relative">
        <div>
          <label className="label">
            Teléfono
            {isNew && <span className="ml-1 text-apple-green font-normal normal-case tracking-normal">(requerido para nuevo cliente)</span>}
          </label>
          <div className="relative">
            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-apple-gray-400 pointer-events-none" />
            <input
              type="tel"
              className={clsx('input pl-9', isNew && 'border-apple-green')}
              value={telefono}
              placeholder="1112345678"
              required={isNew}
              onChange={e => onChange({ nombre: query, telefono: e.target.value, clienteId })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
