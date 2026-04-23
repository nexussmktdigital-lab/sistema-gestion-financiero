import React from 'react'
import clsx from 'clsx'

const variants = {
  blue: 'bg-blue-50 text-apple-blue',
  green: 'bg-green-50 text-apple-green',
  red: 'bg-red-50 text-apple-red',
  orange: 'bg-orange-50 text-apple-orange',
  purple: 'bg-purple-50 text-apple-purple',
  gray: 'bg-apple-gray-100 text-apple-gray-600',
  teal: 'bg-teal-50 text-apple-teal',
}

export default function Badge({ children, variant = 'gray', className }) {
  return (
    <span className={clsx('badge', variants[variant], className)}>
      {children}
    </span>
  )
}
