import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../../contexts/AuthContext'
import { FiMail, FiLock, FiUser, FiAlertCircle, FiCheckCircle, FiGithub, FiLoader } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'

export default function SignUp() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signUp, signInWithOAuth } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // Validation
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
      await signUp(email, password, {
        full_name: fullName,
      })
      setSuccess(true)
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthSignup = async (provider) => {
    setError('')
    setLoading(true)
    try {
      await signInWithOAuth(provider)
    } catch (err) {
      setError(err.message || `Failed to sign up with ${provider}`)
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Sign Up - Boarded</title>
      </Head>

      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <h1 className="text-2xl font-bold text-white">boarded.</h1>
            </Link>
            <p className="text-text-secondary mt-2">Create your free account</p>
          </div>

          {/* Signup Card */}
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
                <p className="text-sm text-green-500">
                  Account created successfully! Redirecting to dashboard...
                </p>
              </div>
            )}

            {/* OAuth Buttons */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleOAuthSignup('google')}
                disabled={loading || success}
                className="w-full btn btn-secondary flex items-center justify-center gap-2"
              >
                <FcGoogle size={20} />
                Continue with Google
              </button>
              <button
                onClick={() => handleOAuthSignup('github')}
                disabled={loading || success}
                className="w-full btn btn-secondary flex items-center justify-center gap-2"
              >
                <FiGithub size={20} />
                Continue with GitHub
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-background-elevated text-text-tertiary">Or continue with email</span>
              </div>
            </div>

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-text-tertiary" size={18} />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input pl-10"
                    placeholder="John Doe"
                    required
                    disabled={loading || success}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Email
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
                    disabled={loading || success}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Password
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
                    disabled={loading || success}
                    minLength={6}
                  />
                </div>
                <p className="text-xs text-text-tertiary mt-1">
                  Must be at least 6 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Confirm Password
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
                    disabled={loading || success}
                  />
                </div>
              </div>

              <div className="text-xs text-text-secondary">
                By signing up, you agree to our{' '}
                <Link href="#" className="text-accent hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="#" className="text-accent hover:underline">
                  Privacy Policy
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading || success}
                className="w-full btn btn-primary flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FiLoader className="animate-spin" size={18} />
                    Creating account...
                  </>
                ) : success ? (
                  <>
                    <FiCheckCircle size={18} />
                    Account created!
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          </div>

          {/* Login Link */}
          <p className="text-center text-sm text-text-secondary mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-accent hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}

