import React, { useState, useMemo } from 'react'
import { Plus, Bell, Pencil, Trash2, Search, Phone, CheckCircle, Send, MessageCircle } from 'lucide-react'
import Header from '../layout/Header'
import Modal from '../ui/Modal'
import ConfirmDialog from '../ui/ConfirmDialog'
import EmptyState from '../ui/EmptyState'
import AlertaForm from './AlertaForm'
import Badge from '../ui/Badge'
import { useApp } from '../../context/AppContext'
import { formatCurrency, formatDate, getDaysUntil } from '../../utils/formatters'
import clsx from 'clsx'

const estadoConfig = {
  pendiente: { label: 'Pendiente', variant: 'orange' },
  enviada: { label: 'Enviada', variant: 'blue' },
  completada: { label: 'Completada', variant: 'green' },
}

const tipoConfig = {
  cheque: { label: 'Cheque', icon: '📄' },
  credito: { label: 'Crédito', icon: '💳' },
  divisa: { label: 'Divisa', icon: '💱' },
  otro: { label: 'Otro', icon: '🔔' },
}

export default function Alertas() {
  const { state, dispatch, notify } = useApp()
  const [search, setSearch] = useState('')
  const [filterEstado, setFilterEstado] = useState('todos')
  const [showAdd, setShowAdd] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filtered = useMemo(() =>
    state.alertas
      .filter(a => {
        const q = search.toLowerCase()
        const matchSearch = !search ||
          a.nombre?.toLowerCase().includes(q) ||
          a.telefono?.includes(q) ||
          a.descripcion?.toLowerCase().includes(q)
        const matchEstado = filterEstado === 'todos' || a.estado === filterEstado
        return matchSearch && matchEstado
      })
      .sort((a, b) => {
        const order = { pendiente: 0, enviada: 1, completada: 2 }
        if (order[a.estado] !== order[b.estado]) return order[a.estado] - order[b.estado]
        return new Date(a.fechaAlerta) - new Date(b.fechaAlerta)
      }),
    [state.alertas, search, filterEstado]
  )

  const totals = useMemo(() => ({
    pendientes: state.alertas.filter(a => a.estado === 'pendiente').length,
    montoPendiente: state.alertas.filter(a => a.estado === 'pendiente').reduce((s, a) => s + Number(a.monto || 0), 0),
    completadas: state.alertas.filter(a => a.estado === 'completada').length,
  }), [state.alertas])

  const handleDelete = (id) => {
    dispatch({ type: 'DELETE_ALERTA', payload: id })
    notify('Alerta eliminada', 'error')
  }

  const markAs = (alerta, estado) => {
    dispatch({ type: 'UPDATE_ALERTA', payload: { ...alerta, estado } })
    notify(`Alerta marcada como ${estadoConfig[estado]?.label || estado}`)
  }

  const buildWhatsApp = (a) => {
    const phone = `54${a.telefono?.replace(/\D/g, '')}`
    const msg = `Hola ${a.nombre}, te recordamos que tenés un pago pendiente de ${formatCurrency(a.monto)}. ${a.descripcion || ''} Por favor contactate a la brevedad.`
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
  }

  return (
    <div>
      <Header
        title="Alertas de Cobro"
        subtitle="Seguimiento de cobros pendientes"
        actions={
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-1.5 text-sm px-3 py-2">
            <Plus size={15} /> <span className="hidden sm:inline">Nueva alerta</span><span className="sm:hidden">Nueva</span>
          </button>
        }
      />

      <div className="p-4 md:p-8 space-y-4 md:space-y-5">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          <div className={clsx('p-3 md:p-4 rounded-apple border', totals.pendientes > 0 ? 'bg-red-50 border-red-100' : 'bg-apple-gray-50 border-apple-gray-100')}>
            <p className="text-[10px] md:text-xs text-apple-gray-500 mb-0.5">Pendientes</p>
            <p className={clsx('text-sm md:text-xl font-bold', totals.pendientes > 0 ? 'text-apple-red' : 'text-apple-gray-900')}>{totals.pendientes}</p>
          </div>
          <div className="p-3 md:p-4 rounded-apple border bg-orange-50 border-orange-100">
            <p className="text-[10px] md:text-xs text-apple-gray-500 mb-0.5">Monto pendiente</p>
            <p className="text-sm md:text-xl font-bold text-apple-orange truncate">{formatCurrency(totals.montoPendiente)}</p>
          </div>
          <div className="p-3 md:p-4 rounded-apple border bg-green-50 border-green-100">
            <p className="text-[10px] md:text-xs text-apple-gray-500 mb-0.5">Completadas</p>
            <p className="text-sm md:text-xl font-bold text-apple-green">{totals.completadas}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[140px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-apple-gray-400" />
            <input className="input pl-8 text-sm" placeholder="Buscar alerta..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {['todos', 'pendiente', 'enviada', 'completada'].map(f => (
              <button key={f} onClick={() => setFilterEstado(f)}
                className={clsx('px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  filterEstado === f ? 'bg-apple-blue text-white' : 'bg-white border border-apple-gray-200 text-apple-gray-600')}>
                {f === 'todos' ? 'Todas' : estadoConfig[f]?.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <EmptyState icon={Bell} title="Sin alertas" description="Creá una alerta para hacer seguimiento de un cobro pendiente." />
        ) : (
          <div className="space-y-3">
            {filtered.map(alerta => {
              const dias = getDaysUntil(alerta.fechaAlerta)
              const cfg = estadoConfig[alerta.estado] || {}
              const tipoCfg = tipoConfig[alerta.tipo] || tipoConfig.otro
              const isOverdue = dias !== null && dias < 0 && alerta.estado === 'pendiente'
              const isToday = dias === 0 && alerta.estado === 'pendiente'

              return (
                <div key={alerta.id} className={clsx('card p-5 hover:shadow-apple-lg transition-shadow duration-200', isOverdue && 'border-red-200 bg-red-50/30', isToday && 'border-orange-200 bg-orange-50/30')}>
                  <div className="flex items-start gap-4">
                    <div className={clsx('w-10 h-10 rounded-apple flex items-center justify-center text-lg flex-shrink-0',
                      alerta.estado === 'pendiente' ? 'bg-orange-50' :
                      alerta.estado === 'enviada' ? 'bg-blue-50' : 'bg-green-50')}>
                      {tipoCfg.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-apple-gray-900">{alerta.nombre}</p>
                            <Badge variant={cfg.variant}>{cfg.label}</Badge>
                            <span className="text-xs text-apple-gray-400">{tipoCfg.label}</span>
                          </div>
                          {alerta.descripcion && (
                            <p className="text-xs text-apple-gray-500 mt-0.5">{alerta.descripcion}</p>
                          )}
                        </div>
                        <p className="text-lg font-bold text-apple-gray-900 flex-shrink-0">{formatCurrency(alerta.monto)}</p>
                      </div>

                      <div className="flex items-center gap-4 mt-2 flex-wrap">
                        <div className="flex items-center gap-1.5 text-xs text-apple-gray-500">
                          <Phone size={12} />
                          <span>{alerta.telefono}</span>
                        </div>
                        {alerta.fechaAlerta && (
                          <span className={clsx('text-xs',
                            isOverdue ? 'text-apple-red font-medium' :
                            isToday ? 'text-apple-orange font-medium' : 'text-apple-gray-400')}>
                            {isOverdue ? `Vencida hace ${Math.abs(dias)} días` :
                             isToday ? '¡Hoy!' :
                             `${formatDate(alerta.fechaAlerta)}`}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-0.5 md:gap-1 flex-shrink-0">
                      {/* WhatsApp */}
                      <a
                        href={buildWhatsApp(alerta)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Enviar por WhatsApp"
                        className="p-1.5 rounded-lg hover:bg-green-50 text-apple-gray-400 hover:text-apple-green transition-colors"
                      >
                        <MessageCircle size={15} />
                      </a>

                      {alerta.estado === 'pendiente' && (
                        <button
                          onClick={() => markAs(alerta, 'enviada')}
                          title="Marcar como enviada"
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-apple-gray-400 hover:text-apple-blue transition-colors"
                        >
                          <Send size={15} />
                        </button>
                      )}

                      {alerta.estado !== 'completada' && (
                        <button
                          onClick={() => markAs(alerta, 'completada')}
                          title="Marcar como completada"
                          className="p-1.5 rounded-lg hover:bg-green-50 text-apple-gray-400 hover:text-apple-green transition-colors"
                        >
                          <CheckCircle size={15} />
                        </button>
                      )}

                      <button onClick={() => setEditTarget(alerta)} className="p-1.5 rounded-lg hover:bg-apple-gray-100 text-apple-gray-400 hover:text-apple-blue transition-colors">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => setDeleteTarget(alerta.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-apple-gray-400 hover:text-apple-red transition-colors">
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

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Nueva alerta de cobro" size="lg">
        <AlertaForm onClose={() => setShowAdd(false)} />
      </Modal>
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Editar alerta" size="lg">
        <AlertaForm initial={editTarget} onClose={() => setEditTarget(null)} />
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => handleDelete(deleteTarget)} />
    </div>
  )
}
