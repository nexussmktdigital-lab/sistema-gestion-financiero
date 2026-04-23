import React, { useState, useEffect, useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import ClienteInput from '../ui/ClienteInput'
import { resolveClienteId } from '../../hooks/useClienteAutoCreate'
import { formatCurrency, calcCuotaCredito } from '../../utils/formatters'

const empty = {
  clienteId: '',
  nombre: '',
  telefono: '',
  importe: '',
  fechaEmision: new Date().toISOString().slice(0, 10),
  cuotas: '',
  interes: '',
  fechaFinalizar: '',
  cuotasPagadas: 0,
  estado: 'activo',
  notas: '',
}

export default function CreditoForm({ initial, onClose }) {
  const { dispatch, notify } = useApp()
  const [form, setForm] = useState(initial || empty)

  useEffect(() => { if (initial) setForm(initial) }, [initial])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleClienteChange = ({ nombre, telefono, clienteId }) => {
    setForm(f => ({ ...f, nombre, telefono, clienteId }))
  }

  const cuotaCalc = useMemo(() =>
    calcCuotaCredito(Number(form.importe), Number(form.cuotas), Number(form.interes)),
    [form.importe, form.cuotas, form.interes]
  )
  const totalConInteres = useMemo(() =>
    Number(form.importe || 0) * (1 + Number(form.interes || 0) / 100),
    [form.importe, form.interes]
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.nombre || !form.importe || !form.cuotas) return

    const finalClienteId = resolveClienteId(form, dispatch)

    if (initial) {
      dispatch({ type: 'UPDATE_CREDITO', payload: { ...form, clienteId: finalClienteId } })
      notify('Crédito actualizado correctamente')
    } else {
      dispatch({ type: 'ADD_CREDITO', payload: { ...form, clienteId: finalClienteId } })
      notify('Crédito registrado correctamente')
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
            required
          />
        </div>

        <div>
          <label className="label">Importe *</label>
          <input className="input" type="number" min="0" step="0.01" value={form.importe} onChange={e => set('importe', e.target.value)} placeholder="100000" required />
        </div>
        <div>
          <label className="label">Interés (%)</label>
          <input className="input" type="number" min="0" step="0.1" value={form.interes} onChange={e => set('interes', e.target.value)} placeholder="15" />
        </div>

        <div>
          <label className="label">Cuotas *</label>
          <input className="input" type="number" min="1" step="1" value={form.cuotas} onChange={e => set('cuotas', e.target.value)} placeholder="12" required />
        </div>
        <div>
          <label className="label">Cuotas pagadas</label>
          <input className="input" type="number" min="0" step="1" value={form.cuotasPagadas} onChange={e => set('cuotasPagadas', e.target.value)} placeholder="0" />
        </div>

        {/* Preview calculadora */}
        {form.importe && form.cuotas && (
          <div className="col-span-2 bg-blue-50 border border-blue-100 rounded-apple px-4 py-3 grid grid-cols-3 gap-2">
            <div>
              <p className="text-xs text-apple-gray-500">Total a devolver</p>
              <p className="text-sm font-bold text-apple-gray-900">{formatCurrency(totalConInteres)}</p>
            </div>
            <div>
              <p className="text-xs text-apple-gray-500">Cuota mensual</p>
              <p className="text-sm font-bold text-apple-blue">{formatCurrency(cuotaCalc)}</p>
            </div>
            <div>
              <p className="text-xs text-apple-gray-500">Saldo restante</p>
              <p className="text-sm font-bold text-apple-gray-900">
                {formatCurrency(cuotaCalc * (Number(form.cuotas) - Number(form.cuotasPagadas || 0)))}
              </p>
            </div>
          </div>
        )}

        <div>
          <label className="label">Fecha de emisión</label>
          <input className="input" type="date" value={form.fechaEmision} onChange={e => set('fechaEmision', e.target.value)} />
        </div>
        <div>
          <label className="label">Fecha a finalizar</label>
          <input className="input" type="date" value={form.fechaFinalizar} onChange={e => set('fechaFinalizar', e.target.value)} />
        </div>

        <div className="col-span-2">
          <label className="label">Estado</label>
          <select className="input" value={form.estado} onChange={e => set('estado', e.target.value)}>
            <option value="activo">Activo</option>
            <option value="mora">En mora</option>
            <option value="completado">Completado</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="label">Notas</label>
          <textarea className="input resize-none" rows={2} value={form.notas} onChange={e => set('notas', e.target.value)} placeholder="Observaciones..." />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
        <button type="submit" className="btn-primary flex-1">
          {initial ? 'Guardar cambios' : 'Registrar crédito'}
        </button>
      </div>
    </form>
  )
}
