import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useAuth } from '../../contexts/AuthContext'
import { FiMail, FiAlertCircle, FiCheckCircle, FiArrowLeft, FiLoader } from 'react-icons/fi'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { resetPassword } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      await resetPassword(email)
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Failed to send reset email. Please try again.')
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
          {/* Back to Login */}
          <Link 
            href="/auth/login" 
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-8 transition-colors"
          >
            <FiArrowLeft size={16} />
            Back to login
          </Link>

          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <h1 className="text-2xl font-bold text-white">boarded.</h1>
            </Link>
            <p className="text-text-secondary mt-2">Reset your password</p>
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
                  <p className="font-medium mb-1">Check your email!</p>
                  <p className="text-green-400">
                    We&apos;ve sent a password reset link to <strong>{email}</strong>
                  </p>
                </div>
              </div>
            )}

            {!success ? (
              <>
                <p className="text-sm text-text-secondary mb-6">
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="text-text-tertiary" size={18} />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input pl-10"
                        placeholder="you@example.com"
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
                        Sending reset link...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <Link href="/auth/login" className="btn btn-secondary">
                  Back to Login
                </Link>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="mt-6 text-center text-xs text-text-tertiary">
            <p>Didn&apos;t receive an email? Check your spam folder or</p>
            <button 
              onClick={() => setSuccess(false)}
              className="text-accent hover:underline mt-1"
            >
              try again
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

