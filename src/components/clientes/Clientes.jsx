import React, { useState, useMemo } from 'react'
import { Plus, Search, User, Pencil, Trash2, Eye, Phone, Mail } from 'lucide-react'
import Header from '../layout/Header'
import Modal from '../ui/Modal'
import ConfirmDialog from '../ui/ConfirmDialog'
import EmptyState from '../ui/EmptyState'
import ClienteForm from './ClienteForm'
import ClienteDetail from './ClienteDetail'
import { useApp } from '../../context/AppContext'
import { formatDate } from '../../utils/formatters'

export default function Clientes() {
  const { state, dispatch, notify } = useApp()
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [viewTarget, setViewTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filtered = useMemo(() =>
    state.clientes.filter(c =>
      c.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      c.telefono?.includes(search) ||
      c.cuit?.includes(search) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [state.clientes, search]
  )

  const getInitials = (name) => name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'

  const colors = ['bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-purple-500', 'bg-teal-500', 'bg-red-500']
  const getColor = (id) => colors[id?.charCodeAt(0) % colors.length] || colors[0]

  const handleDelete = (id) => {
    dispatch({ type: 'DELETE_CLIENTE', payload: id })
    notify('Cliente eliminado', 'error')
  }

  return (
    <div>
      <Header
        title="Clientes"
        subtitle={`${state.clientes.length} clientes registrados`}
        actions={
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-1.5 text-sm px-3 py-2">
            <Plus size={15} /> <span className="hidden sm:inline">Nuevo cliente</span><span className="sm:hidden">Nuevo</span>
          </button>
        }
      />

      <div className="p-4 md:p-8">
        {/* Search */}
        <div className="relative mb-4 md:mb-6">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-apple-gray-400" />
          <input
            className="input pl-9"
            placeholder="Buscar por nombre, teléfono, CUIT..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={User}
            title="Sin clientes"
            description={search ? 'No se encontraron clientes con esa búsqueda.' : 'Agregá tu primer cliente para comenzar.'}
            action={!search && <button onClick={() => setShowAdd(true)} className="btn-primary">Agregar cliente</button>}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(cliente => {
              const ops = [
                ...state.cheques.filter(c => c.clienteId === cliente.id),
                ...state.divisas.filter(d => d.clienteId === cliente.id),
                ...state.creditos.filter(c => c.clienteId === cliente.id),
              ].length
              return (
                <div key={cliente.id} className="card p-5 hover:shadow-apple-lg transition-shadow duration-200">
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`w-11 h-11 rounded-full ${getColor(cliente.id)} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                      {getInitials(cliente.nombre)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-apple-gray-900 truncate">{cliente.nombre}</p>
                      {cliente.cuit && <p className="text-xs text-apple-gray-400 mt-0.5">{cliente.cuit}</p>}
                    </div>
                  </div>
                  <div className="space-y-1.5 mb-4">
                    {cliente.telefono && (
                      <div className="flex items-center gap-2 text-xs text-apple-gray-500">
                        <Phone size={12} /> {cliente.telefono}
                      </div>
                    )}
                    {cliente.email && (
                      <div className="flex items-center gap-2 text-xs text-apple-gray-500">
                        <Mail size={12} /> <span className="truncate">{cliente.email}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between border-t border-apple-gray-50 pt-3">
                    <span className="text-xs text-apple-gray-400">{ops} operaciones · desde {formatDate(cliente.createdAt)}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setViewTarget(cliente)} className="p-1.5 rounded-lg hover:bg-apple-gray-100 text-apple-gray-500 hover:text-apple-blue transition-colors">
                        <Eye size={15} />
                      </button>
                      <button onClick={() => setEditTarget(cliente)} className="p-1.5 rounded-lg hover:bg-apple-gray-100 text-apple-gray-500 hover:text-apple-blue transition-colors">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => setDeleteTarget(cliente.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-apple-gray-500 hover:text-apple-red transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Nuevo cliente">
        <ClienteForm onClose={() => setShowAdd(false)} />
      </Modal>

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Editar cliente">
        <ClienteForm initial={editTarget} onClose={() => setEditTarget(null)} />
      </Modal>

      <Modal open={!!viewTarget} onClose={() => setViewTarget(null)} title={viewTarget?.nombre} size="lg">
        {viewTarget && <ClienteDetail cliente={viewTarget} onClose={() => setViewTarget(null)} />}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDelete(deleteTarget)}
        message="¿Eliminar este cliente? Se perderán sus datos pero no sus operaciones."
      />
    </div>
  )
}
