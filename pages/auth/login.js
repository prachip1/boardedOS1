import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../../contexts/AuthContext'
import { FiMail, FiLock, FiAlertCircle, FiGithub, FiLoader } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signInWithOAuth } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
      router.push('/dashboard')
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthLogin = async (provider) => {
    setError('')
    setLoading(true)
    try {
      await signInWithOAuth(provider)
    } catch (err) {
      setError(err.message || `Failed to sign in with ${provider}`)
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Sign In - Boarded</title>
      </Head>

      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <h1 className="text-2xl font-bold text-white">boarded.</h1>
            </Link>
            <p className="text-text-secondary mt-2">Sign in to your account</p>
          </div>

          {/* Login Card */}
          <div className="card">
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={16} />
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            {/* OAuth Buttons */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleOAuthLogin('google')}
                disabled={loading}
                className="w-full btn btn-secondary flex items-center justify-center gap-2"
              >
                <FcGoogle size={20} />
                Continue with Google
              </button>
              <button
                onClick={() => handleOAuthLogin('github')}
                disabled={loading}
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

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    disabled={loading}
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
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-text-secondary">Remember me</span>
                </label>
                <Link href="/auth/forgot-password" className="text-accent hover:underline">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FiLoader className="animate-spin" size={18} />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-text-secondary mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-accent hover:underline font-medium">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}

