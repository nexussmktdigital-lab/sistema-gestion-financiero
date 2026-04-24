import React, { useState, useEffect } from 'react'
import { Wallet, DollarSign, Info } from 'lucide-react'
import Modal from '../ui/Modal'
import { useApp } from '../../context/AppContext'
import { formatCurrency } from '../../utils/formatters'
import { saldoSugerido, today } from '../../utils/caja'

export default function CajaDiariaModal({ open, onClose }) {
  const { state, dispatch, notify } = useApp()
  const [pesos, setPesos] = useState('')
  const [dolares, setDolares] = useState('')
  const [notas, setNotas] = useState('')
  const sugerido = saldoSugerido(state)

  useEffect(() => {
    if (open) {
      setPesos(sugerido.pesos ? String(sugerido.pesos.toFixed(2)) : '')
      setDolares(sugerido.dolares ? String(sugerido.dolares.toFixed(2)) : '')
      setNotas('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleSubmit = (e) => {
    e.preventDefault()
    const fecha = today()
    const existing = state.cajas.find(c => c.fecha === fecha)
    const payload = {
      fecha,
      pesosInicial: Number(pesos) || 0,
      dolaresInicial: Number(dolares) || 0,
      notas: notas || '',
    }
    if (existing) {
      dispatch({ type: 'UPDATE_CAJA', payload: { ...existing, ...payload } })
      notify('Caja actualizada')
    } else {
      dispatch({ type: 'ADD_CAJA', payload })
      notify('Caja del día establecida')
    }
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Establecer caja diaria" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {sugerido.fechaReferencia && (
          <div className="bg-blue-50 border border-blue-100 rounded-apple p-3 flex items-start gap-2">
            <Info size={14} className="text-apple-blue mt-0.5 flex-shrink-0" />
            <div className="text-xs text-apple-gray-700">
              Saldo sugerido desde el cierre del <strong>{sugerido.fechaReferencia}</strong>.
              Podés modificar los valores si ingresaste dinero extra o necesitás ajustar.
            </div>
          </div>
        )}

        {!sugerido.fechaReferencia && (
          <div className="bg-orange-50 border border-orange-100 rounded-apple p-3 flex items-start gap-2">
            <Info size={14} className="text-apple-orange mt-0.5 flex-shrink-0" />
            <div className="text-xs text-apple-gray-700">
              Es tu primera carga. Ingresá la caja inicial con la que arrancás hoy.
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-apple-gray-600 mb-1">
              <Wallet size={12} className="inline mr-1" /> Pesos (ARS)
            </label>
            <input
              type="number"
              step="0.01"
              className="input"
              value={pesos}
              onChange={e => setPesos(e.target.value)}
              placeholder="0"
              autoFocus
            />
            {sugerido.pesos > 0 && (
              <p className="text-[11px] text-apple-gray-400 mt-1">
                Sugerido: {formatCurrency(sugerido.pesos)}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-apple-gray-600 mb-1">
              <DollarSign size={12} className="inline mr-1" /> Dólares (USD)
            </label>
            <input
              type="number"
              step="0.01"
              className="input"
              value={dolares}
              onChange={e => setDolares(e.target.value)}
              placeholder="0"
            />
            {sugerido.dolares > 0 && (
              <p className="text-[11px] text-apple-gray-400 mt-1">
                Sugerido: {sugerido.dolares.toLocaleString('es-AR', { minimumFractionDigits: 2 })} USD
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-apple-gray-600 mb-1">Notas (opcional)</label>
          <input
            className="input"
            value={notas}
            onChange={e => setNotas(e.target.value)}
            placeholder="Ej: ingresé $50k extra"
          />
        </div>

        <div className="flex gap-2 justify-end pt-2 border-t border-apple-gray-100">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-apple-gray-600 hover:bg-apple-gray-100">
            Más tarde
          </button>
          <button type="submit" className="btn-primary text-sm px-4 py-2">
            Guardar caja del día
          </button>
        </div>
      </form>
    </Modal>
  )
}
