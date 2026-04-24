import React, { useState, useMemo } from 'react'
import { Plus, FileCheck, Pencil, Trash2, Search, Smartphone, Building2, List, GitBranch } from 'lucide-react'
import Header from '../layout/Header'
import Modal from '../ui/Modal'
import ConfirmDialog from '../ui/ConfirmDialog'
import EmptyState from '../ui/EmptyState'
import ChequeForm from './ChequeForm'
import ChequesMovimientos from './ChequesMovimientos'
import Badge from '../ui/Badge'
import { useApp } from '../../context/AppContext'
import { formatCurrency, formatDate, formatCUIT, getDaysUntil } from '../../utils/formatters'
import clsx from 'clsx'

const estadoConfig = {
  pendiente: { label: 'Pendiente', variant: 'orange' },
  cobrado:   { label: 'Cobrado',   variant: 'green' },
  rechazado: { label: 'Rechazado', variant: 'red' },
}

export default function Cheques() {
  const { state, dispatch, notify } = useApp()
  const [tab, setTab] = useState('lista')
  const [search, setSearch]           = useState('')
  const [filterEstado, setFilterEstado] = useState('todos')
  const [showAdd, setShowAdd]         = useState(false)
  const [editTarget, setEditTarget]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filtered = useMemo(() =>
    state.cheques
      .filter(c => {
        const q = search.toLowerCase()
        const matchSearch = !search ||
          c.numeroCheque?.includes(q) ||
          c.nombreTrae?.toLowerCase().includes(q) ||
          c.nombreTitular?.toLowerCase().includes(q) ||
          c.cuit?.includes(q)
        return matchSearch && (filterEstado === 'todos' || c.estado === filterEstado)
      })
      .sort((a, b) => new Date(a.fechaCobro) - new Date(b.fechaCobro)),
    [state.cheques, search, filterEstado]
  )

  const totals = useMemo(() => ({
    total:     state.cheques.reduce((s, c) => s + Number(c.importe || 0), 0),
    pendiente: state.cheques.filter(c => c.estado === 'pendiente').reduce((s, c) => s + Number(c.importe || 0), 0),
    cobrado:   state.cheques.filter(c => c.estado === 'cobrado').reduce((s, c) => s + Number(c.importe || 0), 0),
  }), [state.cheques])

  const getClienteName = (id) => state.clientes.find(c => c.id === id)?.nombre

  const handleDelete = (id) => {
    dispatch({ type: 'DELETE_CHEQUE', payload: id })
    notify('Cheque eliminado', 'error')
  }

  const urgencyColor = (dias) => {
    if (dias === null) return ''
    if (dias < 0)  return 'text-apple-gray-400'
    if (dias === 0) return 'text-apple-red font-semibold'
    if (dias <= 2) return 'text-apple-orange'
    return 'text-apple-green'
  }

  const urgencyText = (dias, estado) => {
    if (estado !== 'pendiente' || dias === null) return null
    if (dias < 0)  return `Vencido ${Math.abs(dias)}d`
    if (dias === 0) return 'Hoy'
    return `En ${dias}d`
  }

  return (
    <div>
      <Header
        title="Cambio Cheque"
        subtitle="Gestión de cheques diferidos y al día"
        actions={
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-1.5 text-sm px-3 py-2">
            <Plus size={15} /> <span className="hidden sm:inline">Nuevo cheque</span><span className="sm:hidden">Nuevo</span>
          </button>
        }
      />

      <div className="p-4 md:p-8 space-y-4 md:space-y-5">
        {/* Resumen */}
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          {[
            { label: 'Total cartera', value: totals.total,     color: 'bg-blue-50 border-blue-100' },
            { label: 'Pendientes',    value: totals.pendiente, color: 'bg-orange-50 border-orange-100' },
            { label: 'Cobrados',      value: totals.cobrado,   color: 'bg-green-50 border-green-100' },
          ].map(item => (
            <div key={item.label} className={clsx('p-3 md:p-4 rounded-apple border', item.color)}>
              <p className="text-[10px] md:text-xs text-apple-gray-500 mb-0.5">{item.label}</p>
              <p className="text-sm md:text-xl font-bold text-apple-gray-900 truncate">{formatCurrency(item.value)}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-apple-gray-100">
          <button
            onClick={() => setTab('lista')}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === 'lista' ? 'border-apple-blue text-apple-blue' : 'border-transparent text-apple-gray-500 hover:text-apple-gray-700'
            )}
          >
            <List size={14} /> Lista de cheques
          </button>
          <button
            onClick={() => setTab('movimientos')}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === 'movimientos' ? 'border-apple-blue text-apple-blue' : 'border-transparent text-apple-gray-500 hover:text-apple-gray-700'
            )}
          >
            <GitBranch size={14} /> Movimientos
          </button>
        </div>

        {tab === 'movimientos' ? (
          <ChequesMovimientos onEdit={setEditTarget} />
        ) : (
        <>
        {/* Filtros */}
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[160px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-apple-gray-400" />
            <input className="input pl-8 text-sm" placeholder="Buscar cheque..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {['todos', 'pendiente', 'cobrado', 'rechazado'].map(f => (
              <button key={f} onClick={() => setFilterEstado(f)}
                className={clsx('px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  filterEstado === f ? 'bg-apple-blue text-white' : 'bg-white border border-apple-gray-200 text-apple-gray-600')}>
                {f === 'todos' ? 'Todos' : estadoConfig[f]?.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista */}
        {filtered.length === 0 ? (
          <EmptyState icon={FileCheck} title="Sin cheques" description="Registrá el primer cheque con el botón superior." />
        ) : (
          <>
            {/* ── MÓVIL: cards ─────────────────────────────────────────── */}
            <div className="space-y-3 md:hidden">
              {filtered.map(cheque => {
                const dias = getDaysUntil(cheque.fechaCobro)
                const cfg  = estadoConfig[cheque.estado] || {}
                const ut   = urgencyText(dias, cheque.estado)
                return (
                  <div key={cheque.id} className="card p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-semibold text-apple-gray-800 text-sm">Nº {cheque.numeroCheque}</span>
                          <Badge variant={cfg.variant}>{cfg.label}</Badge>
                          {cheque.esDigital
                            ? <span className="text-[10px] text-apple-blue flex items-center gap-0.5"><Smartphone size={10}/> Digital</span>
                            : <span className="text-[10px] text-apple-gray-400 flex items-center gap-0.5"><Building2 size={10}/> Papel</span>}
                        </div>
                        {getClienteName(cheque.clienteId) && (
                          <p className="text-xs text-apple-blue mt-0.5">{getClienteName(cheque.clienteId)}</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-base font-bold text-apple-gray-900">{formatCurrency(cheque.importe)}</p>
                        {cheque.comision > 0 && <p className="text-[10px] text-apple-gray-400">Com: {formatCurrency(cheque.comision)}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs text-apple-gray-500 mb-3">
                      {cheque.nombreTrae     && <span>Trae: {cheque.nombreTrae}</span>}
                      {cheque.fechaCobro     && <span className={clsx('font-medium', ut ? urgencyColor(dias) : '')}>{formatDate(cheque.fechaCobro)}{ut ? ` · ${ut}` : ''}</span>}
                      {cheque.nombreTitular  && <span className="col-span-2">Titular: {cheque.nombreTitular}</span>}
                      {cheque.cuit           && <span className="col-span-2 font-mono">{formatCUIT(cheque.cuit)}</span>}
                    </div>
                    <div className="flex gap-2 border-t border-apple-gray-50 pt-2">
                      <button onClick={() => setEditTarget(cheque)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-apple-gray-100 text-xs font-medium text-apple-gray-700 hover:bg-apple-gray-200 transition-colors">
                        <Pencil size={13}/> Editar
                      </button>
                      <button onClick={() => setDeleteTarget(cheque.id)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-red-50 text-xs font-medium text-apple-red hover:bg-red-100 transition-colors">
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
                      {['Nº Cheque', 'Importe', 'Trae', 'Titular / CUIT', 'Fecha cobro', 'Tipo', 'Estado', ''].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-apple-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(cheque => {
                      const dias = getDaysUntil(cheque.fechaCobro)
                      const cfg  = estadoConfig[cheque.estado] || {}
                      return (
                        <tr key={cheque.id} className="table-row">
                          <td className="px-4 py-3">
                            <p className="font-mono font-medium text-apple-gray-800">{cheque.numeroCheque}</p>
                            {getClienteName(cheque.clienteId) && <p className="text-xs text-apple-blue">{getClienteName(cheque.clienteId)}</p>}
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-apple-gray-900">{formatCurrency(cheque.importe)}</p>
                            {cheque.comision > 0 && <p className="text-xs text-apple-gray-400">Com: {formatCurrency(cheque.comision)}</p>}
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-apple-gray-700">{cheque.nombreTrae || '—'}</p>
                            {cheque.telefono && <p className="text-xs text-apple-gray-400">{cheque.telefono}</p>}
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-apple-gray-700">{cheque.nombreTitular || '—'}</p>
                            {cheque.cuit && <p className="text-xs text-apple-gray-400 font-mono">{formatCUIT(cheque.cuit)}</p>}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <p className="text-apple-gray-700">{formatDate(cheque.fechaCobro)}</p>
                            {cheque.estado === 'pendiente' && dias !== null && (
                              <p className={clsx('text-xs', urgencyColor(dias))}>
                                {dias < 0 ? `Vencido ${Math.abs(dias)}d` : dias === 0 ? 'Hoy' : `En ${dias}d`}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {cheque.esDigital
                              ? <span className="flex items-center gap-1 text-xs text-apple-blue"><Smartphone size={12}/> Digital</span>
                              : <span className="flex items-center gap-1 text-xs text-apple-gray-500"><Building2 size={12}/> Papel</span>}
                          </td>
                          <td className="px-4 py-3"><Badge variant={cfg.variant}>{cfg.label}</Badge></td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button onClick={() => setEditTarget(cheque)} className="p-1.5 rounded-lg hover:bg-apple-gray-100 text-apple-gray-400 hover:text-apple-blue transition-colors"><Pencil size={14}/></button>
                              <button onClick={() => setDeleteTarget(cheque.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-apple-gray-400 hover:text-apple-red transition-colors"><Trash2 size={14}/></button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-2 bg-apple-gray-50 border-t border-apple-gray-100 text-xs text-apple-gray-400">
                {filtered.length} de {state.cheques.length} registros
              </div>
            </div>
          </>
        )}
        </>
        )}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Registrar cheque" size="lg">
        <ChequeForm onClose={() => setShowAdd(false)} />
      </Modal>
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Editar cheque" size="lg">
        <ChequeForm initial={editTarget} onClose={() => setEditTarget(null)} />
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => handleDelete(deleteTarget)} />
    </div>
  )
}
