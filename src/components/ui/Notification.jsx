import React from 'react'
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import clsx from 'clsx'

const icons = {
  success: <CheckCircle size={18} className="text-apple-green" />,
  error: <XCircle size={18} className="text-apple-red" />,
  warning: <AlertCircle size={18} className="text-apple-orange" />,
  info: <Info size={18} className="text-apple-blue" />,
}

export default function Notification() {
  const { state } = useApp()
  const { notification } = state

  if (!notification) return null

  return (
    <div className="fixed top-5 right-5 z-[100] animate-slide-up">
      <div className={clsx(
        'flex items-center gap-3 px-4 py-3 rounded-apple shadow-apple-lg',
        'bg-white border border-apple-gray-100 min-w-[280px] max-w-sm'
      )}>
        {icons[notification.type] || icons.info}
        <p className="text-sm font-medium text-apple-gray-900 flex-1">{notification.message}</p>
      </div>
    </div>
  )
}
