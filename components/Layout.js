import { useState } from 'react'
import Sidebar from './Navigation/Sidebar'
import Header from './Navigation/Header'
import ProtectedRoute from './ProtectedRoute'
import { Analytics } from "@vercel/analytics/next"
export default function Layout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <Header onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 p-4 md:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
      <Analytics />
    </ProtectedRoute>
  )
}
