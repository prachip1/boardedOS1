import { useState } from 'react'
import { FiSearch, FiBell, FiSettings, FiLogOut, FiUser, FiMenu } from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/router'

export default function Header({ onMenuClick }) {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const userInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() || 'U'

  return (
    <header className="no-print bg-background border-b border-border sticky top-0 z-40">
      <div className="flex items-center justify-between gap-3 px-4 md:px-6 py-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 text-text-secondary hover:text-text-primary hover:bg-background-secondary rounded-md transition-colors"
          aria-label="Open menu"
        >
          <FiMenu size={22} />
        </button>

        {/* Search */}
        <div className="flex-1 max-w-md relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
          <input
            type="text"
            placeholder="Search..."
            className="input pl-10 bg-background-secondary"
          />
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-background-secondary rounded-md transition-colors">
            <FiBell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
          </button>

          {/* Settings */}
          <button className="p-2 text-text-secondary hover:text-text-primary hover:bg-background-secondary rounded-md transition-colors">
            <FiSettings size={20} />
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-2 hover:bg-background-secondary rounded-md transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent-purple text-black flex items-center justify-center font-semibold text-sm">
                {userInitials}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-sm font-medium text-text-primary">
                  {user?.user_metadata?.full_name || 'User'}
                </div>
                <div className="text-xs text-text-tertiary">
                  {user?.email}
                </div>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-background-elevated border border-border rounded-lg shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {user?.user_metadata?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-text-tertiary truncate">{user?.email}</p>
                  </div>
                  
                  <button
                    onClick={() => router.push('/settings')}
                    className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:text-text-primary hover:bg-background-secondary transition-colors flex items-center gap-3"
                  >
                    <FiUser size={16} />
                    Profile Settings
                  </button>
                  
                  <button
                    onClick={() => router.push('/settings')}
                    className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:text-text-primary hover:bg-background-secondary transition-colors flex items-center gap-3"
                  >
                    <FiSettings size={16} />
                    Account Settings
                  </button>
                  
                  <div className="border-t border-border my-2" />
                  
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-3"
                  >
                    <FiLogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
