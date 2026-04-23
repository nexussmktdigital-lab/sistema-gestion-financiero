import React from 'react'

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-apple-gray-100 flex items-center justify-center mb-2">
          <Icon size={28} className="text-apple-gray-400" />
        </div>
      )}
      <h3 className="text-base font-semibold text-apple-gray-800">{title}</h3>
      {description && <p className="text-sm text-apple-gray-500 text-center max-w-xs">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
