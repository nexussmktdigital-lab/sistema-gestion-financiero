import React, { useState, useCallback } from 'react'
import Sidebar from './Sidebar'
import Notification from '../ui/Notification'
import { LayoutContext } from './LayoutContext'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const openSidebar = useCallback(() => setSidebarOpen(true), [])

  return (
    <LayoutContext.Provider value={{ openSidebar }}>
      <div className="flex h-screen overflow-hidden bg-apple-gray-50">
        {/* Backdrop móvil */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 min-w-0 overflow-y-auto">
          {children}
        </main>

        <Notification />
      </div>
    </LayoutContext.Provider>
  )
}
