import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import clsx from 'clsx'

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const sizeClass = {
    sm: 'md:max-w-md',
    md: 'md:max-w-xl',
    lg: 'md:max-w-2xl',
    xl: 'md:max-w-4xl',
  }[size]

  return (
    <div className="fixed inset-0 z-50 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Contenedor: bottom-sheet en móvil, centrado en desktop */}
      <div className="absolute inset-0 flex items-end md:items-center justify-center md:p-4">
        <div className={clsx(
          'relative w-full bg-white shadow-apple-xl animate-slide-up',
          // Móvil: ocupa hasta 92% de la pantalla, bordes redondeados arriba
          'rounded-t-apple-xl max-h-[92vh]',
          // Desktop: centrado con bordes en todos los lados
          'md:rounded-apple-xl',
          sizeClass,
        )}>
          {/* Handle visual en móvil */}
          <div className="flex justify-center pt-3 pb-1 md:hidden">
            <div className="w-10 h-1 bg-apple-gray-200 rounded-full" />
          </div>

          {/* Header del modal */}
          <div className="flex items-center justify-between px-5 py-3 md:px-6 md:pt-5 md:pb-4 border-b border-apple-gray-100">
            <h2 className="text-base md:text-lg font-semibold text-apple-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-apple-gray-400 hover:text-apple-gray-700 hover:bg-apple-gray-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Contenido scrolleable */}
          <div className="px-5 py-4 md:px-6 md:py-5 overflow-y-auto"
            style={{ maxHeight: 'calc(92vh - 80px)' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
