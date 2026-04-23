import React, { useState, useMemo } from 'react'
import { Plus, CreditCard, Pencil, Trash2, Search, AlertCircle } from 'lucide-react'
import Header from '../layout/Header'
import Modal from '../ui/Modal'
import ConfirmDialog from '../ui/ConfirmDialog'
import EmptyState from '../ui/EmptyState'
import CreditoForm from './CreditoForm'
import Badge from '../ui/Badge'
import { useApp } from '../../context/AppContext'
import { formatCurrency, formatDate, calcCuotaCredito, getDaysUntil } from '../../utils/formatters'
import clsx from 'clsx'

const estadoConfig = {
  activo: { label: 'Activo', variant: 'green' },
  mora: { label: 'En mora', variant: 'red' },
  completado: { label: 'Completado', variant: 'gray' },
}

export default function Creditos() {
  const { state, dispatch, notify } = useApp()
  const [search, setSearch] = useState('')
  const [filterEstado, setFilterEstado] = useState('todos')
  const [showAdd, setShowAdd] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filtered = useMemo(() =>
    state.creditos.filter(c => {
      const q = search.toLowerCase()
      const matchSearch = !search || c.nombre?.toLowerCase().includes(q) || c.telefono?.includes(q)
      const matchEstado = filterEstado === 'todos' || c.estado === filterEstado
      return matchSearch && matchEstado
    }).sort((a, b) => new Date(b.fechaEmision) - new Date(a.fechaEmision)),
    [state.creditos, search, filterEstado]
  )

  const totals = useMemo(() => {
    const activos = state.creditos.filter(c => c.estado !== 'completado')
    return {
      totalCartera: activos.reduce((s, c) => s + Number(c.importe || 0), 0),
      mora: state.creditos.filter(c => c.estado === 'mora').length,
      activos: state.creditos.filter(c => c.estado === 'activo').length,
    }
  }, [state.creditos])

  const getClienteName = (id) => state.clientes.find(c => c.id === id)?.nombre

  const handleDelete = (id) => {
    dispatch({ type: 'DELETE_CREDITO', payload: id })
    notify('Crédito eliminado', 'error')
  }

  const getProgress = (c) => {
    const total = Number(c.cuotas || 1)
    const pagadas = Number(c.cuotasPagadas || 0)
    return Math.min((pagadas / total) * 100, 100)
  }

  return (
    <div>
      <Header
        title="Créditos Personales"
        subtitle="Gestión de préstamos y cuotas"
        actions={
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-1.5 text-sm px-3 py-2">
            <Plus size={15} /> <span className="hidden sm:inline">Nuevo crédito</span><span className="sm:hidden">Nuevo</span>
          </button>
        }
      />

      <div className="p-4 md:p-8 space-y-4 md:space-y-5">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          <div className="p-3 md:p-4 rounded-apple border bg-green-50 border-green-100">
            <p className="text-[10px] md:text-xs text-apple-gray-500 mb-0.5">Cartera activa</p>
            <p className="text-sm md:text-xl font-bold text-apple-gray-900 truncate">{formatCurrency(totals.totalCartera)}</p>
          </div>
          <div className="p-3 md:p-4 rounded-apple border bg-blue-50 border-blue-100">
            <p className="text-[10px] md:text-xs text-apple-gray-500 mb-0.5">Créditos activos</p>
            <p className="text-sm md:text-xl font-bold text-apple-gray-900">{totals.activos}</p>
          </div>
          <div className={clsx('p-3 md:p-4 rounded-apple border', totals.mora > 0 ? 'bg-red-50 border-red-100' : 'bg-apple-gray-50 border-apple-gray-100')}>
            <div className="flex items-center gap-1 mb-0.5">
              {totals.mora > 0 && <AlertCircle size={10} className="text-apple-red" />}
              <p className="text-[10px] md:text-xs text-apple-gray-500">En mora</p>
            </div>
            <p className={clsx('text-sm md:text-xl font-bold', totals.mora > 0 ? 'text-apple-red' : 'text-apple-gray-900')}>{totals.mora}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[140px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-apple-gray-400" />
            <input className="input pl-8 text-sm" placeholder="Buscar por nombre..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {['todos', 'activo', 'mora', 'completado'].map(f => (
              <button key={f} onClick={() => setFilterEstado(f)}
                className={clsx('px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  filterEstado === f ? 'bg-apple-blue text-white' : 'bg-white border border-apple-gray-200 text-apple-gray-600')}>
                {f === 'todos' ? 'Todos' : estadoConfig[f]?.label || f}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        {filtered.length === 0 ? (
          <EmptyState icon={CreditCard} title="Sin créditos" description="Registrá el primer crédito personal." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(credito => {
              const cuota = calcCuotaCredito(Number(credito.importe), Number(credito.cuotas), Number(credito.interes))
              const progress = getProgress(credito)
              const diasFin = getDaysUntil(credito.fechaFinalizar)
              const cfg = estadoConfig[credito.estado] || {}
              const saldo = cuota * (Number(credito.cuotas) - Number(credito.cuotasPagadas || 0))

              return (
                <div key={credito.id} className={clsx('card p-5 hover:shadow-apple-lg transition-shadow duration-200', credito.estado === 'mora' && 'border-red-200')}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-apple-gray-900">{credito.nombre}</p>
                      {credito.telefono && <p className="text-xs text-apple-gray-400 mt-0.5">{credito.telefono}</p>}
                      {getClienteName(credito.clienteId) && credito.clienteId && (
                        <p className="text-xs text-apple-blue">{getClienteName(credito.clienteId)}</p>
                      )}
                    </div>
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <p className="text-xs text-apple-gray-400">Capital</p>
                      <p className="text-base font-bold text-apple-gray-900">{formatCurrency(credito.importe)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-apple-gray-400">Cuota mensual</p>
                      <p className="text-base font-bold text-apple-blue">{formatCurrency(cuota)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-apple-gray-400">Saldo</p>
                      <p className="text-sm font-semibold text-apple-gray-700">{formatCurrency(saldo)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-apple-gray-400">Interés</p>
                      <p className="text-sm font-semibold text-apple-gray-700">{credito.interes || 0}%</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-apple-gray-400 mb-1">
                      <span>{credito.cuotasPagadas || 0} de {credito.cuotas} cuotas</span>
                      <span>{progress.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-apple-gray-100 rounded-full overflow-hidden">
                      <div
                        className={clsx('h-full rounded-full transition-all duration-300', credito.estado === 'mora' ? 'bg-apple-red' : 'bg-apple-green')}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-apple-gray-50 pt-3">
                    <div className="text-xs text-apple-gray-400">
                      {credito.fechaEmision && <span>Desde {formatDate(credito.fechaEmision)}</span>}
                      {credito.fechaFinalizar && diasFin !== null && (
                        <span className={clsx('ml-2', diasFin < 0 ? 'text-apple-red' : diasFin <= 30 ? 'text-apple-orange' : '')}>
                          · {diasFin < 0 ? `Venció hace ${Math.abs(diasFin)}d` : `${diasFin}d restantes`}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setEditTarget(credito)} className="p-1.5 rounded-lg hover:bg-apple-gray-100 text-apple-gray-400 hover:text-apple-blue transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => setDeleteTarget(credito.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-apple-gray-400 hover:text-apple-red transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Nuevo crédito" size="lg">
        <CreditoForm onClose={() => setShowAdd(false)} />
      </Modal>
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Editar crédito" size="lg">
        <CreditoForm initial={editTarget} onClose={() => setEditTarget(null)} />
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => handleDelete(deleteTarget)} />
    </div>
  )
}
