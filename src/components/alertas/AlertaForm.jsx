import React, { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import ClienteInput from '../ui/ClienteInput'
import { resolveClienteId } from '../../hooks/useClienteAutoCreate'
import { formatCurrency } from '../../utils/formatters'

const empty = {
  clienteId: '',
  nombre: '',
  telefono: '',
  monto: '',
  fechaAlerta: new Date().toISOString().slice(0, 10),
  descripcion: '',
  tipo: 'otro',
  estado: 'pendiente',
}

export default function AlertaForm({ initial, onClose }) {
  const { dispatch, notify } = useApp()
  const [form, setForm] = useState(initial || empty)

  useEffect(() => { if (initial) setForm(initial) }, [initial])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleClienteChange = ({ nombre, telefono, clienteId }) => {
    setForm(f => ({ ...f, nombre, telefono, clienteId }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.nombre || !form.monto || !form.telefono) return

    const finalClienteId = resolveClienteId(form, dispatch)

    if (initial) {
      dispatch({ type: 'UPDATE_ALERTA', payload: { ...form, clienteId: finalClienteId } })
      notify('Alerta actualizada')
    } else {
      dispatch({ type: 'ADD_ALERTA', payload: { ...form, clienteId: finalClienteId } })
      notify('Alerta creada correctamente')
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
          <label className="label">Monto a cobrar *</label>
          <input className="input" type="number" min="0" step="0.01" value={form.monto} onChange={e => set('monto', e.target.value)} placeholder="50000" required />
        </div>
        <div>
          <label className="label">Fecha de alerta</label>
          <input className="input" type="date" value={form.fechaAlerta} onChange={e => set('fechaAlerta', e.target.value)} />
        </div>

        <div>
          <label className="label">Tipo</label>
          <select className="input" value={form.tipo} onChange={e => set('tipo', e.target.value)}>
            <option value="cheque">Cheque</option>
            <option value="credito">Crédito</option>
            <option value="divisa">Divisa</option>
            <option value="otro">Otro</option>
          </select>
        </div>
        <div>
          <label className="label">Estado</label>
          <select className="input" value={form.estado} onChange={e => set('estado', e.target.value)}>
            <option value="pendiente">Pendiente</option>
            <option value="enviada">Enviada</option>
            <option value="completada">Completada</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="label">Descripción del cobro</label>
          <textarea className="input resize-none" rows={2} value={form.descripcion} onChange={e => set('descripcion', e.target.value)} placeholder="Ej: Vencimiento cuota 3/12 del crédito..." />
        </div>
      </div>

      {/* WhatsApp preview */}
      {form.nombre && form.monto && form.telefono && (
        <div className="bg-green-50 border border-green-100 rounded-apple px-4 py-3">
          <p className="text-xs font-semibold text-apple-gray-500 uppercase tracking-wide mb-1">Vista previa mensaje WhatsApp</p>
          <p className="text-sm text-apple-gray-700 italic">
            "Hola {form.nombre}, te recordamos que tenés un pago pendiente de {formatCurrency(Number(form.monto))}. {form.descripcion || ''} Por favor contactate a la brevedad."
          </p>
          <a
            href={`https://wa.me/54${form.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${form.nombre}, te recordamos que tenés un pago pendiente de ${formatCurrency(Number(form.monto))}. ${form.descripcion || ''} Por favor contactate a la brevedad.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-2 text-xs font-medium text-apple-green hover:underline"
          >
            📱 Abrir en WhatsApp
          </a>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
        <button type="submit" className="btn-primary flex-1">
          {initial ? 'Guardar cambios' : 'Crear alerta'}
        </button>
      </div>
    </form>
  )
}
