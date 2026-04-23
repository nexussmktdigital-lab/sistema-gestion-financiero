import React, { useMemo } from 'react'
import { Phone, Mail, MapPin, FileText, FileCheck, ArrowLeftRight, CreditCard, Calendar } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { formatCurrency, formatDate, formatCUIT } from '../../utils/formatters'
import Badge from '../ui/Badge'

function HistoryItem({ icon: Icon, color, title, sub, amount, date, badgeText, badgeVariant }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-apple-gray-50 last:border-0">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={15} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-apple-gray-800">{title}</p>
          {badgeText && <Badge variant={badgeVariant}>{badgeText}</Badge>}
        </div>
        {sub && <p className="text-xs text-apple-gray-400 mt-0.5">{sub}</p>}
      </div>
      <div className="text-right flex-shrink-0">
        {amount && <p className="text-sm font-semibold text-apple-gray-900">{formatCurrency(amount)}</p>}
        <p className="text-xs text-apple-gray-400">{formatDate(date)}</p>
      </div>
    </div>
  )
}

export default function ClienteDetail({ cliente, onClose }) {
  const { state } = useApp()
  const { cheques, divisas, creditos, alertas } = state

  const history = useMemo(() => {
    const items = []
    cheques.filter(c => c.clienteId === cliente.id).forEach(c => items.push({ type: 'cheque', ...c }))
    divisas.filter(d => d.clienteId === cliente.id).forEach(d => items.push({ type: 'divisa', ...d }))
    creditos.filter(c => c.clienteId === cliente.id).forEach(c => items.push({ type: 'credito', ...c }))
    return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [cheques, divisas, creditos, cliente.id])

  const clientAlerts = alertas.filter(a => a.clienteId === cliente.id)

  const estadoBadge = {
    pendiente: { text: 'Pendiente', variant: 'orange' },
    cobrado: { text: 'Cobrado', variant: 'green' },
    rechazado: { text: 'Rechazado', variant: 'red' },
    activo: { text: 'Activo', variant: 'green' },
    mora: { text: 'En mora', variant: 'red' },
    completado: { text: 'Completado', variant: 'gray' },
  }

  return (
    <div className="space-y-6">
      {/* Info */}
      <div className="grid grid-cols-2 gap-3">
        {cliente.telefono && (
          <div className="flex items-center gap-2 text-sm text-apple-gray-700">
            <Phone size={14} className="text-apple-gray-400" />
            <span>{cliente.telefono}</span>
          </div>
        )}
        {cliente.email && (
          <div className="flex items-center gap-2 text-sm text-apple-gray-700">
            <Mail size={14} className="text-apple-gray-400" />
            <span className="truncate">{cliente.email}</span>
          </div>
        )}
        {cliente.cuit && (
          <div className="flex items-center gap-2 text-sm text-apple-gray-700">
            <FileText size={14} className="text-apple-gray-400" />
            <span>{formatCUIT(cliente.cuit)}</span>
          </div>
        )}
        {cliente.direccion && (
          <div className="flex items-center gap-2 text-sm text-apple-gray-700">
            <MapPin size={14} className="text-apple-gray-400" />
            <span className="truncate">{cliente.direccion}</span>
          </div>
        )}
        {cliente.createdAt && (
          <div className="flex items-center gap-2 text-sm text-apple-gray-500">
            <Calendar size={14} className="text-apple-gray-400" />
            <span>Cliente desde {formatDate(cliente.createdAt)}</span>
          </div>
        )}
      </div>

      {cliente.notas && (
        <div className="bg-apple-gray-50 rounded-apple px-4 py-3">
          <p className="text-xs font-semibold text-apple-gray-500 uppercase tracking-wide mb-1">Notas</p>
          <p className="text-sm text-apple-gray-700">{cliente.notas}</p>
        </div>
      )}

      {/* Alerts */}
      {clientAlerts.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-apple-gray-500 uppercase tracking-wide mb-2">Alertas</p>
          <div className="space-y-1">
            {clientAlerts.map(a => (
              <div key={a.id} className="flex justify-between items-center py-1.5 px-3 bg-orange-50 rounded-lg">
                <span className="text-sm text-apple-orange font-medium">{a.descripcion || 'Alerta de cobro'}</span>
                <span className="text-sm font-semibold text-apple-gray-800">{formatCurrency(a.monto)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      <div>
        <p className="text-xs font-semibold text-apple-gray-500 uppercase tracking-wide mb-2">
          Historial de operaciones ({history.length})
        </p>
        {history.length === 0 ? (
          <p className="text-sm text-apple-gray-400 text-center py-6">Sin operaciones registradas</p>
        ) : (
          <div>
            {history.map(item => {
              if (item.type === 'cheque') {
                const badge = estadoBadge[item.estado] || {}
                return (
                  <HistoryItem
                    key={item.id}
                    icon={FileCheck}
                    color="bg-orange-50 text-apple-orange"
                    title={`Cheque Nº ${item.numeroCheque}`}
                    sub={`Titular: ${item.nombreTitular}`}
                    amount={item.importe}
                    date={item.fechaCobro || item.createdAt}
                    badgeText={badge.text}
                    badgeVariant={badge.variant}
                  />
                )
              }
              if (item.type === 'divisa') {
                return (
                  <HistoryItem
                    key={item.id}
                    icon={ArrowLeftRight}
                    color="bg-green-50 text-apple-green"
                    title={`${item.tipoAccion === 'compra' ? 'Compra' : 'Venta'} de ${item.divisa}`}
                    sub={`${item.monto} ${item.divisa}`}
                    amount={Number(item.monto || 0) * Number(item.tipoAccion === 'compra' ? item.precioCompra : item.precioVenta || 0)}
                    date={item.fechaTransaccion || item.createdAt}
                    badgeText={item.tipoAccion === 'compra' ? 'Compra' : 'Venta'}
                    badgeVariant={item.tipoAccion === 'compra' ? 'blue' : 'green'}
                  />
                )
              }
              if (item.type === 'credito') {
                const badge = estadoBadge[item.estado] || {}
                return (
                  <HistoryItem
                    key={item.id}
                    icon={CreditCard}
                    color="bg-purple-50 text-apple-purple"
                    title={`Crédito personal`}
                    sub={`${item.cuotas} cuotas · ${item.interes}% interés`}
                    amount={item.importe}
                    date={item.fechaEmision || item.createdAt}
                    badgeText={badge.text}
                    badgeVariant={badge.variant}
                  />
                )
              }
              return null
            })}
          </div>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <button onClick={onClose} className="btn-secondary">Cerrar</button>
      </div>
    </div>
  )
}
