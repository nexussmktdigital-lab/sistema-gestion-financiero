import React, { useState, useEffect, useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import ClienteInput from '../ui/ClienteInput'
import { resolveClienteId } from '../../hooks/useClienteAutoCreate'

const DIVISAS = ['USD', 'EUR', 'BRL', 'UYU', 'CLP', 'GBP', 'CHF']

const empty = {
  clienteId: '',
  nombre: '',
  telefono: '',
  divisa: 'USD',
  tipoAccion: 'compra',
  precioCompra: '',
  precioVenta: '',
  monto: '',
  fechaTransaccion: new Date().toISOString().slice(0, 10),
  notas: '',
}

export default function DivisaForm({ initial, onClose }) {
  const { dispatch, notify } = useApp()
  const [form, setForm] = useState(initial || empty)

  useEffect(() => { if (initial) setForm(initial) }, [initial])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleClienteChange = ({ nombre, telefono, clienteId }) => {
    setForm(f => ({ ...f, nombre, telefono, clienteId }))
  }

  const totalARS = useMemo(() => {
    const monto = Number(form.monto || 0)
    const precio = form.tipoAccion === 'compra' ? Number(form.precioCompra || 0) : Number(form.precioVenta || 0)
    return monto * precio
  }, [form.monto, form.tipoAccion, form.precioCompra, form.precioVenta])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.divisa || !form.monto || !form.fechaTransaccion) return

    const finalClienteId = resolveClienteId(form, dispatch)

    if (initial) {
      dispatch({ type: 'UPDATE_DIVISA', payload: { ...form, clienteId: finalClienteId } })
      notify('Operación actualizada correctamente')
    } else {
      dispatch({ type: 'ADD_DIVISA', payload: { ...form, clienteId: finalClienteId } })
      notify('Operación registrada correctamente')
    }
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Cliente inteligente */}
        <div className="col-span-2 relative">
          <ClienteInput
            nombre={form.nombre}
            telefono={form.telefono}
            clienteId={form.clienteId}
            onChange={handleClienteChange}
          />
        </div>

        <div>
          <label className="label">Divisa *</label>
          <select className="input" value={form.divisa} onChange={e => set('divisa', e.target.value)} required>
            {DIVISAS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Tipo de acción *</label>
          <div className="flex gap-2">
            {['compra', 'venta'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => set('tipoAccion', t)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors border ${
                  form.tipoAccion === t
                    ? t === 'compra' ? 'bg-apple-blue text-white border-apple-blue' : 'bg-apple-green text-white border-apple-green'
                    : 'bg-white border-apple-gray-200 text-apple-gray-600'
                }`}
              >
                {t === 'compra' ? 'Compra' : 'Venta'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Precio compra (ARS)</label>
          <input className="input" type="number" min="0" step="0.01" value={form.precioCompra} onChange={e => set('precioCompra', e.target.value)} placeholder="1000.00" />
        </div>
        <div>
          <label className="label">Precio venta (ARS)</label>
          <input className="input" type="number" min="0" step="0.01" value={form.precioVenta} onChange={e => set('precioVenta', e.target.value)} placeholder="1050.00" />
        </div>

        <div>
          <label className="label">Monto ({form.divisa}) *</label>
          <input className="input" type="number" min="0" step="0.01" value={form.monto} onChange={e => set('monto', e.target.value)} placeholder="100" required />
        </div>
        <div>
          <label className="label">Total estimado (ARS)</label>
          <div className="input bg-apple-gray-100 text-apple-gray-700 font-semibold">
            {totalARS > 0 ? new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(totalARS) : '—'}
          </div>
        </div>

        <div className="col-span-2">
          <label className="label">Fecha de transacción *</label>
          <input className="input" type="date" value={form.fechaTransaccion} onChange={e => set('fechaTransaccion', e.target.value)} required />
        </div>

        <div className="col-span-2">
          <label className="label">Notas</label>
          <textarea className="input resize-none" rows={2} value={form.notas} onChange={e => set('notas', e.target.value)} placeholder="Observaciones..." />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
        <button type="submit" className="btn-primary flex-1">
          {initial ? 'Guardar cambios' : 'Registrar operación'}
        </button>
      </div>
    </form>
  )
}
