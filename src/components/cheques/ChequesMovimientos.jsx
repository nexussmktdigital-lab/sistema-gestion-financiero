import React, { useMemo, useState } from 'react'
import { Wallet, ArrowLeftRight, CreditCard, Package, Receipt, HelpCircle, FileCheck, Search, Pencil } from 'lucide-react'
import Badge from '../ui/Badge'
import EmptyState from '../ui/EmptyState'
import { useApp } from '../../context/AppContext'
import { formatCurrency, formatDate } from '../../utils/formatters'
import clsx from 'clsx'

const destinoConfig = {
  caja:      { label: 'Caja',         icon: Wallet,         color: 'text-apple-green', bg: 'bg-green-50' },
  divisa:    { label: 'Compra divisa',icon: ArrowLeftRight, color: 'text-apple-blue',  bg: 'bg-blue-50' },
  credito:   { label: 'Crédito',      icon: CreditCard,     color: 'text-apple-orange',bg: 'bg-orange-50' },
  proveedor: { label: 'Proveedor',    icon: Package,        color: 'text-apple-purple',bg: 'bg-purple-50' },
  gasto:     { label: 'Gasto',        icon: Receipt,        color: 'text-apple-red',   bg: 'bg-red-50' },
  otro:      { label: 'Otro',         icon: HelpCircle,     color: 'text-apple-gray-600', bg: 'bg-apple-gray-100' },
}

export default function ChequesMovimientos({ onEdit }) {
  const { state } = useApp()
  const [filterDestino, setFilterDestino] = useState('todos')
  const [search, setSearch] = useState('')

  const movimientos = useMemo(() => {
    return state.cheques
      .filter(c => c.destino)
      .filter(c => filterDestino === 'todos' || c.destino === filterDestino)
      .filter(c => {
        if (!search) return true
        const q = search.toLowerCase()
        return (
          c.numeroCheque?.toLowerCase().includes(q) ||
          c.destinoDetalle?.toLowerCase().includes(q) ||
          c.nombre?.toLowerCase().includes(q) ||
          c.nombreTitular?.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => {
        const fa = a.fechaUso || a.fechaCobro || a.createdAt
        const fb = b.fechaUso || b.fechaCobro || b.createdAt
        return fb.localeCompare(fa)
      })
  }, [state.cheques, filterDestino, search])

  // Resumen por destino
  const resumen = useMemo(() => {
    const r = {}
    state.cheques.filter(c => c.destino).forEach(c => {
      r[c.destino] = (r[c.destino] || 0) + Number(c.importe || 0)
    })
    return r
  }, [state.cheques])

  const totalUsado = Object.values(resumen).reduce((s, v) => s + v, 0)
  const totalCheques = state.cheques.reduce((s, c) => s + Number(c.importe || 0), 0)
  const sinDestino = totalCheques - totalUsado

  return (
    <div className="space-y-4">
      {/* Resumen por destino */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
        {Object.entries(destinoConfig).map(([key, cfg]) => {
          const Icon = cfg.icon
          const monto = resumen[key] || 0
          return (
            <button
              key={key}
              onClick={() => setFilterDestino(filterDestino === key ? 'todos' : key)}
              className={clsx(
                'p-3 rounded-apple border text-left transition-all',
                filterDestino === key ? 'border-apple-blue shadow-apple' : 'border-apple-gray-100 hover:border-apple-gray-200',
                cfg.bg,
              )}
            >
              <div className={clsx('flex items-center gap-1.5 mb-1', cfg.color)}>
                <Icon size={13} />
                <p className="text-[10px] md:text-xs font-medium">{cfg.label}</p>
              </div>
              <p className="text-sm md:text-base font-bold text-apple-gray-900 truncate">{formatCurrency(monto)}</p>
            </button>
          )
        })}
      </div>

      {sinDestino > 0 && (
        <div className="bg-orange-50 border border-orange-100 rounded-apple p-3 flex items-center justify-between text-xs">
          <span className="text-apple-gray-700">
            Hay <strong>{formatCurrency(sinDestino)}</strong> en cheques sin destino asignado
          </span>
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap items-center">
        <div className="relative flex-1 min-w-[140px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-apple-gray-400" />
          <input className="input pl-8 text-sm" placeholder="Buscar movimiento..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {filterDestino !== 'todos' && (
          <button onClick={() => setFilterDestino('todos')} className="text-xs text-apple-blue hover:underline">
            Quitar filtro
          </button>
        )}
      </div>

      {/* Timeline */}
      {movimientos.length === 0 ? (
        <EmptyState
          icon={FileCheck}
          title="Sin movimientos registrados"
          description="Editá un cheque y asignale un destino para verlo acá."
        />
      ) : (
        <div className="space-y-2">
          {movimientos.map(c => {
            const cfg = destinoConfig[c.destino] || destinoConfig.otro
            const Icon = cfg.icon
            return (
              <div key={c.id} className="card p-3 md:p-4 flex items-start gap-3">
                <div className={clsx('w-9 h-9 md:w-10 md:h-10 rounded-apple flex items-center justify-center flex-shrink-0', cfg.bg)}>
                  <Icon size={16} className={cfg.color} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-semibold text-apple-gray-800 text-sm">Nº {c.numeroCheque || '—'}</span>
                        <Badge variant={c.destino === 'gasto' ? 'red' : c.destino === 'caja' ? 'green' : 'blue'}>
                          {cfg.label}
                        </Badge>
                      </div>
                      {c.destinoDetalle && (
                        <p className="text-xs text-apple-gray-600 mt-0.5">{c.destinoDetalle}</p>
                      )}
                      <p className="text-[11px] text-apple-gray-400 mt-0.5">
                        {c.nombreTitular && <span>Titular: {c.nombreTitular} · </span>}
                        {c.fechaUso ? `Usado ${formatDate(c.fechaUso)}` : c.fechaCobro ? `Cobrado ${formatDate(c.fechaCobro)}` : ''}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm md:text-base font-bold text-apple-gray-900">{formatCurrency(c.importe)}</p>
                      {onEdit && (
                        <button onClick={() => onEdit(c)} className="text-xs text-apple-blue hover:underline flex items-center gap-1 justify-end mt-1">
                          <Pencil size={11} /> Editar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
