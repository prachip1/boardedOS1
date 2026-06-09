import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'

/**
 * Higher-order component to protect routes
 * Redirects to login if user is not authenticated
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-border border-t-accent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  // Show nothing while redirecting
  if (!user) {
    return null
  }

  // Render children if authenticated
  return children
}

