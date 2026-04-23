import React, { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'

const empty = {
  nombre: '', telefono: '', email: '', cuit: '', direccion: '', notas: ''
}

export default function ClienteForm({ initial, onClose }) {
  const { dispatch, notify } = useApp()
  const [form, setForm] = useState(initial || empty)

  useEffect(() => {
    if (initial) setForm(initial)
  }, [initial])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.nombre.trim()) return
    if (initial) {
      dispatch({ type: 'UPDATE_CLIENTE', payload: form })
      notify('Cliente actualizado correctamente')
    } else {
      dispatch({ type: 'ADD_CLIENTE', payload: form })
      notify('Cliente agregado correctamente')
    }
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="label">Nombre completo *</label>
          <input className="input" value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Juan Pérez" required />
        </div>
        <div>
          <label className="label">Teléfono</label>
          <input className="input" value={form.telefono} onChange={e => set('telefono', e.target.value)} placeholder="1112345678" />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="correo@email.com" />
        </div>
        <div>
          <label className="label">CUIT</label>
          <input className="input" value={form.cuit} onChange={e => set('cuit', e.target.value)} placeholder="20-12345678-9" />
        </div>
        <div>
          <label className="label">Dirección</label>
          <input className="input" value={form.direccion} onChange={e => set('direccion', e.target.value)} placeholder="Av. Corrientes 1234" />
        </div>
        <div className="col-span-2">
          <label className="label">Notas internas</label>
          <textarea className="input resize-none" rows={2} value={form.notas} onChange={e => set('notas', e.target.value)} placeholder="Observaciones sobre el cliente..." />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
        <button type="submit" className="btn-primary flex-1">
          {initial ? 'Guardar cambios' : 'Agregar cliente'}
        </button>
      </div>
    </form>
  )
}
