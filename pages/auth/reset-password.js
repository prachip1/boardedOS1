import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../../contexts/AuthContext'
import { FiLock, FiAlertCircle, FiCheckCircle, FiLoader } from 'react-icons/fi'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { updatePassword } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      await updatePassword(password)
      setSuccess(true)
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (err) {
      setError(err.message || 'Failed to update password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Reset Password - Boarded</title>
      </Head>

      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <h1 className="text-2xl font-bold text-white">boarded.</h1>
            </Link>
            <p className="text-text-secondary mt-2">Set your new password</p>
          </div>

          {/* Reset Card */}
          <div className="card">
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={16} />
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-2">
                <FiCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={16} />
                <div className="text-sm text-green-500">
                  <p className="font-medium mb-1">Password updated successfully!</p>
                  <p className="text-green-400">Redirecting to dashboard...</p>
                </div>
              </div>
            )}

            {!success ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="text-text-tertiary" size={18} />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input pl-10"
                      placeholder="••••••••"
                      required
                      disabled={loading}
                      minLength={6}
                    />
                  </div>
                  <p className="text-xs text-text-tertiary mt-1">
                    Must be at least 6 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="text-text-tertiary" size={18} />
                    </div>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input pl-10"
                      placeholder="••••••••"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn btn-primary flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <FiLoader className="animate-spin" size={18} />
                      Updating password...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center py-4">
                <Link href="/dashboard" className="btn btn-primary">
                  Go to Dashboard
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

