import React, { useState, useMemo } from 'react'
import { Plus, ArrowLeftRight, Pencil, Trash2, Search, TrendingUp, TrendingDown } from 'lucide-react'
import Header from '../layout/Header'
import Modal from '../ui/Modal'
import ConfirmDialog from '../ui/ConfirmDialog'
import EmptyState from '../ui/EmptyState'
import DivisaForm from './DivisaForm'
import Badge from '../ui/Badge'
import { useApp } from '../../context/AppContext'
import { formatCurrency, formatDate } from '../../utils/formatters'
import clsx from 'clsx'

const DIVISA_FLAGS = { USD: '🇺🇸', EUR: '🇪🇺', BRL: '🇧🇷', UYU: '🇺🇾', CLP: '🇨🇱', GBP: '🇬🇧', CHF: '🇨🇭' }

export default function Divisas() {
  const { state, dispatch, notify } = useApp()
  const [search, setSearch] = useState('')
  const [filterAccion, setFilterAccion] = useState('todos')
  const [filterDivisa, setFilterDivisa] = useState('todas')
  const [showAdd, setShowAdd] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const availableDivisas = useMemo(() => {
    const s = new Set(state.divisas.map(d => d.divisa))
    return ['todas', ...s]
  }, [state.divisas])

  const filtered = useMemo(() => {
    return state.divisas
      .filter(d => {
        const q = search.toLowerCase()
        const matchSearch = !search ||
          d.nombre?.toLowerCase().includes(q) ||
          d.telefono?.includes(q) ||
          d.divisa?.toLowerCase().includes(q)
        const matchAccion = filterAccion === 'todos' || d.tipoAccion === filterAccion
        const matchDivisa = filterDivisa === 'todas' || d.divisa === filterDivisa
        return matchSearch && matchAccion && matchDivisa
      })
      .sort((a, b) => new Date(b.fechaTransaccion) - new Date(a.fechaTransaccion))
  }, [state.divisas, search, filterAccion, filterDivisa])

  const stats = useMemo(() => {
    const compras = state.divisas.filter(d => d.tipoAccion === 'compra')
    const ventas = state.divisas.filter(d => d.tipoAccion === 'venta')
    const totalCompras = compras.reduce((s, d) => s + Number(d.monto || 0) * Number(d.precioCompra || 0), 0)
    const totalVentas = ventas.reduce((s, d) => s + Number(d.monto || 0) * Number(d.precioVenta || 0), 0)
    return { totalCompras, totalVentas, ganancia: totalVentas - totalCompras }
  }, [state.divisas])

  const getClienteName = (id) => state.clientes.find(c => c.id === id)?.nombre

  const handleDelete = (id) => {
    dispatch({ type: 'DELETE_DIVISA', payload: id })
    notify('Operación eliminada', 'error')
  }

  const calcTotal = (d) => {
    const monto = Number(d.monto || 0)
    const precio = d.tipoAccion === 'compra' ? Number(d.precioCompra || 0) : Number(d.precioVenta || 0)
    return monto * precio
  }

  return (
    <div>
      <Header
        title="Cambio de Divisas"
        subtitle="Compra y venta de moneda extranjera"
        actions={
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-1.5 text-sm px-3 py-2">
            <Plus size={15} /> <span className="hidden sm:inline">Nueva operación</span><span className="sm:hidden">Nueva</span>
          </button>
        }
      />

      <div className="p-4 md:p-8 space-y-4 md:space-y-5">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          <div className="p-3 md:p-4 rounded-apple border bg-blue-50 border-blue-100">
            <div className="flex items-center gap-1.5 mb-0.5 md:mb-1">
              <TrendingDown size={12} className="text-apple-blue" />
              <p className="text-[10px] md:text-xs text-apple-gray-500">Total compras</p>
            </div>
            <p className="text-sm md:text-xl font-bold text-apple-gray-900 truncate">{formatCurrency(stats.totalCompras)}</p>
          </div>
          <div className="p-3 md:p-4 rounded-apple border bg-green-50 border-green-100">
            <div className="flex items-center gap-1.5 mb-0.5 md:mb-1">
              <TrendingUp size={12} className="text-apple-green" />
              <p className="text-[10px] md:text-xs text-apple-gray-500">Total ventas</p>
            </div>
            <p className="text-sm md:text-xl font-bold text-apple-gray-900 truncate">{formatCurrency(stats.totalVentas)}</p>
          </div>
          <div className={clsx('p-3 md:p-4 rounded-apple border', stats.ganancia >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100')}>
            <p className="text-[10px] md:text-xs text-apple-gray-500 mb-0.5 md:mb-1">Ganancia</p>
            <p className={clsx('text-sm md:text-xl font-bold truncate', stats.ganancia >= 0 ? 'text-apple-green' : 'text-apple-red')}>
              {formatCurrency(stats.ganancia)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[140px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-apple-gray-400" />
            <input className="input pl-8 text-sm" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {['todos', 'compra', 'venta'].map(f => (
              <button key={f} onClick={() => setFilterAccion(f)}
                className={clsx('px-2.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors',
                  filterAccion === f ? 'bg-apple-blue text-white' : 'bg-white border border-apple-gray-200 text-apple-gray-600')}>
                {f === 'todos' ? 'Todos' : f === 'compra' ? 'Compra' : 'Venta'}
              </button>
            ))}
          </div>
          <select className="input w-auto text-sm" value={filterDivisa} onChange={e => setFilterDivisa(e.target.value)}>
            {availableDivisas.map(d => <option key={d} value={d}>{d === 'todas' ? 'Todas' : d}</option>)}
          </select>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <EmptyState icon={ArrowLeftRight} title="Sin operaciones" description="Registrá la primera operación de cambio." />
        ) : (
          <>
            {/* ── MÓVIL: cards ─────────────────────────────────────────── */}
            <div className="space-y-3 md:hidden">
              {filtered.map(d => {
                const total = calcTotal(d)
                return (
                  <div key={d.id} className="card p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{DIVISA_FLAGS[d.divisa] || '💱'}</span>
                        <div>
                          <span className="font-semibold text-apple-gray-800 text-sm">{d.divisa}</span>
                          <Badge variant={d.tipoAccion === 'compra' ? 'blue' : 'green'} className="ml-2">
                            {d.tipoAccion === 'compra' ? 'Compra' : 'Venta'}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-base font-bold text-apple-gray-900">{formatCurrency(total)}</p>
                        <p className="text-xs text-apple-gray-400 font-mono">{Number(d.monto || 0).toLocaleString('es-AR')} {d.divisa}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs text-apple-gray-500 mb-3">
                      {(d.nombre || getClienteName(d.clienteId)) && (
                        <span>Cliente: {d.nombre || getClienteName(d.clienteId)}</span>
                      )}
                      {d.fechaTransaccion && <span>{formatDate(d.fechaTransaccion)}</span>}
                      {d.precioCompra && <span>Precio C: {formatCurrency(d.precioCompra)}</span>}
                      {d.precioVenta && <span>Precio V: {formatCurrency(d.precioVenta)}</span>}
                      {d.telefono && <span className="col-span-2">{d.telefono}</span>}
                    </div>
                    <div className="flex gap-2 border-t border-apple-gray-50 pt-2">
                      <button onClick={() => setEditTarget(d)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-apple-gray-100 text-xs font-medium text-apple-gray-700 hover:bg-apple-gray-200 transition-colors">
                        <Pencil size={13}/> Editar
                      </button>
                      <button onClick={() => setDeleteTarget(d.id)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-red-50 text-xs font-medium text-apple-red hover:bg-red-100 transition-colors">
                        <Trash2 size={13}/> Eliminar
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* ── DESKTOP: tabla ───────────────────────────────────────── */}
            <div className="card overflow-hidden hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-apple-gray-100">
                      {['Divisa', 'Acción', 'Monto', 'Precio', 'Total ARS', 'Cliente', 'Fecha', ''].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-apple-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(d => (
                      <tr key={d.id} className="table-row">
                        <td className="px-4 py-3">
                          <span className="text-lg">{DIVISA_FLAGS[d.divisa] || '💱'}</span>
                          <span className="ml-2 font-semibold text-apple-gray-800">{d.divisa}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={d.tipoAccion === 'compra' ? 'blue' : 'green'}>
                            {d.tipoAccion === 'compra' ? 'Compra' : 'Venta'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-mono font-medium text-apple-gray-800">
                          {Number(d.monto || 0).toLocaleString('es-AR')} {d.divisa}
                        </td>
                        <td className="px-4 py-3 text-apple-gray-600 text-xs">
                          {d.precioCompra && <div>C: {formatCurrency(d.precioCompra)}</div>}
                          {d.precioVenta && <div>V: {formatCurrency(d.precioVenta)}</div>}
                        </td>
                        <td className="px-4 py-3 font-semibold text-apple-gray-900">{formatCurrency(calcTotal(d))}</td>
                        <td className="px-4 py-3">
                          <p className="text-apple-gray-700">{d.nombre || getClienteName(d.clienteId) || '—'}</p>
                          {d.telefono && <p className="text-xs text-apple-gray-400">{d.telefono}</p>}
                        </td>
                        <td className="px-4 py-3 text-apple-gray-500">{formatDate(d.fechaTransaccion)}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button onClick={() => setEditTarget(d)} className="p-1.5 rounded-lg hover:bg-apple-gray-100 text-apple-gray-400 hover:text-apple-blue transition-colors"><Pencil size={14} /></button>
                            <button onClick={() => setDeleteTarget(d.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-apple-gray-400 hover:text-apple-red transition-colors"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-2 bg-apple-gray-50 border-t border-apple-gray-100 text-xs text-apple-gray-400">
                {filtered.length} de {state.divisas.length} operaciones
              </div>
            </div>
          </>
        )}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Nueva operación de cambio" size="lg">
        <DivisaForm onClose={() => setShowAdd(false)} />
      </Modal>
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Editar operación" size="lg">
        <DivisaForm initial={editTarget} onClose={() => setEditTarget(null)} />
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => handleDelete(deleteTarget)} />
    </div>
  )
}
