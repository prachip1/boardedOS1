import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAuth } from '../../contexts/AuthContext'
import {
  FiHome,
  FiUsers,
  FiFileText,
  FiDollarSign,
  FiClock,
  FiLink,
  FiMessageSquare,
  FiFolder,
  FiFolderPlus,
  FiBell,
  FiMenu,
  FiX,
  FiTrello,
  FiBarChart2,
  FiSettings
} from 'react-icons/fi'

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: FiHome },
    { name: 'Projects', href: '/projects', icon: FiFolderPlus },
    { name: 'Clients', href: '/clients', icon: FiUsers },
    { name: 'Task Management', href: '/tasks', icon: FiTrello },
    { name: 'Contracts', href: '/contracts', icon: FiFileText },
    { name: 'Invoices', href: '/invoices', icon: FiDollarSign },
    { name: 'Time Tracking', href: '/time-tracking', icon: FiClock },
    { name: 'Tracker Hub', href: '/trackers', icon: FiBarChart2 },
    { name: 'Timesheets', href: '/timesheets', icon: FiClock },
    { name: 'Live Previews', href: '/previews', icon: FiLink },
    { name: 'Collaboration', href: '/collaboration', icon: FiMessageSquare },
    { name: 'Files', href: '/files', icon: FiFolder },
    { name: 'Notifications', href: '/notifications', icon: FiBell },
    { name: 'Settings', href: '/settings', icon: FiSettings },
  ]

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const router = useRouter()
  const { user } = useAuth()

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`no-print bg-background-secondary border-r border-border flex flex-col h-screen overflow-y-auto transition-all duration-base
          fixed top-0 left-0 z-50 md:sticky md:z-auto md:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          ${collapsed ? 'md:w-20' : 'md:w-60'}
          w-64`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border min-h-[64px]">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium text-text-primary">boarded.</span>
            </div>
          )}
          {/* Desktop collapse toggle */}
          <button
            onClick={onToggle}
            className="hidden md:flex text-text-secondary p-2 rounded-sm transition-all duration-base hover:text-text-primary hover:bg-background-elevated items-center justify-center"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <FiMenu size={20} /> : <FiX size={20} />}
          </button>
          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="md:hidden text-text-secondary p-2 rounded-sm transition-all duration-base hover:text-text-primary hover:bg-background-elevated flex items-center justify-center"
            aria-label="Close menu"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 flex flex-col gap-0.5">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = router.pathname === item.href || router.pathname.startsWith(item.href + '/')

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={`flex items-center gap-4 px-4 py-2 rounded-md text-sm font-medium transition-all duration-base relative
                  ${collapsed ? 'md:justify-center md:px-2' : ''}
                  ${isActive
                    ? 'text-text-primary bg-background-elevated'
                    : 'text-text-secondary hover:text-text-primary hover:bg-background-elevated'
                  }
                `}
                title={collapsed ? item.name : ''}
              >
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3/5 bg-accent rounded-r" />}
                <Icon size={20} className="flex-shrink-0" />
                <span className={`whitespace-nowrap overflow-hidden text-ellipsis ${collapsed ? 'md:hidden' : ''}`}>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className={`flex items-center gap-4 p-2 rounded-md cursor-pointer transition-all duration-base hover:bg-background-elevated ${collapsed ? 'md:justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className={`flex-1 min-w-0 ${collapsed ? 'md:hidden' : ''}`}>
              <div className="text-sm font-medium text-text-primary whitespace-nowrap overflow-hidden text-ellipsis">
                {user?.user_metadata?.full_name || 'User'}
              </div>
              <div className="text-xs text-text-tertiary whitespace-nowrap overflow-hidden text-ellipsis">
                {user?.email || 'user@email.com'}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
