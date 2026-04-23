import React, { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import ClienteInput from '../ui/ClienteInput'
import { resolveClienteId } from '../../hooks/useClienteAutoCreate'

const empty = {
  clienteId: '',
  nombre: '',
  telefono: '',
  fechaCobro: '',
  numeroCheque: '',
  importe: '',
  nombreTitular: '',
  cuit: '',
  vigenciaCuenta: '',
  esDigital: false,
  comision: '',
  estado: 'pendiente',
  notas: '',
}

export default function ChequeForm({ initial, onClose }) {
  const { dispatch, notify } = useApp()
  const [form, setForm] = useState(initial || empty)

  useEffect(() => { if (initial) setForm(initial) }, [initial])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleClienteChange = ({ nombre, telefono, clienteId }) => {
    setForm(f => ({ ...f, nombre, telefono, clienteId }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.numeroCheque || !form.importe || !form.fechaCobro) return

    const finalClienteId = resolveClienteId(form, dispatch)

    if (initial) {
      dispatch({ type: 'UPDATE_CHEQUE', payload: { ...form, clienteId: finalClienteId } })
      notify('Cheque actualizado correctamente')
    } else {
      dispatch({ type: 'ADD_CHEQUE', payload: { ...form, clienteId: finalClienteId } })
      notify('Cheque registrado correctamente')
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
          <label className="label">Fecha de cobro *</label>
          <input className="input" type="date" value={form.fechaCobro} onChange={e => set('fechaCobro', e.target.value)} required />
        </div>
        <div>
          <label className="label">Número de cheque *</label>
          <input className="input" value={form.numeroCheque} onChange={e => set('numeroCheque', e.target.value)} placeholder="00012345" required />
        </div>

        <div>
          <label className="label">Importe *</label>
          <input className="input" type="number" min="0" step="0.01" value={form.importe} onChange={e => set('importe', e.target.value)} placeholder="0.00" required />
        </div>
        <div>
          <label className="label">Comisión ($)</label>
          <input className="input" type="number" min="0" step="0.01" value={form.comision} onChange={e => set('comision', e.target.value)} placeholder="0.00" />
        </div>

        <div>
          <label className="label">Nombre titular de la cuenta</label>
          <input className="input" value={form.nombreTitular} onChange={e => set('nombreTitular', e.target.value)} placeholder="Empresa SA" />
        </div>
        <div>
          <label className="label">CUIT del titular</label>
          <input className="input" value={form.cuit} onChange={e => set('cuit', e.target.value)} placeholder="30-12345678-9" />
        </div>

        <div>
          <label className="label">Vigencia de la cuenta</label>
          <input className="input" type="date" value={form.vigenciaCuenta} onChange={e => set('vigenciaCuenta', e.target.value)} />
        </div>
        <div>
          <label className="label">Estado</label>
          <select className="input" value={form.estado} onChange={e => set('estado', e.target.value)}>
            <option value="pendiente">Pendiente</option>
            <option value="cobrado">Cobrado</option>
            <option value="rechazado">Rechazado</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative flex-shrink-0">
              <input type="checkbox" className="sr-only" checked={form.esDigital} onChange={e => set('esDigital', e.target.checked)} />
              <div className={`w-10 h-6 rounded-full transition-colors duration-200 ${form.esDigital ? 'bg-apple-blue' : 'bg-apple-gray-200'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${form.esDigital ? 'translate-x-5' : 'translate-x-1'}`} />
              </div>
            </div>
            <span className="text-sm font-medium text-apple-gray-700">Cheque digital (e-cheq)</span>
          </label>
        </div>

        <div className="col-span-2">
          <label className="label">Notas</label>
          <textarea className="input resize-none" rows={2} value={form.notas} onChange={e => set('notas', e.target.value)} placeholder="Observaciones adicionales..." />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
        <button type="submit" className="btn-primary flex-1">
          {initial ? 'Guardar cambios' : 'Registrar cheque'}
        </button>
      </div>
    </form>
  )
}
