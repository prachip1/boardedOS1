import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'

/**
 * Custom hook to protect routes that require authentication
 * Redirects to login if user is not authenticated
 */
export const useRequireAuth = (redirectUrl = '/auth/login') => {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectUrl)
    }
  }, [user, loading, router, redirectUrl])

  return { user, loading }
}

export default useRequireAuth

