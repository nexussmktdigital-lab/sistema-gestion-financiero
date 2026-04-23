import React from 'react'
import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'

export default function ConfirmDialog({ open, onClose, onConfirm, title = '¿Confirmar eliminación?', message }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
          <AlertTriangle size={24} className="text-apple-red" />
        </div>
        <p className="text-sm text-apple-gray-600">
          {message || 'Esta acción no se puede deshacer.'}
        </p>
        <div className="flex gap-3 w-full">
          <button onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button
            onClick={() => { onConfirm(); onClose() }}
            className="btn-danger flex-1"
          >
            Eliminar
          </button>
        </div>
      </div>
    </Modal>
  )
}
