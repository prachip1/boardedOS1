import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { FiLock, FiLoader, FiAlertCircle, FiExternalLink, FiEye } from 'react-icons/fi'

/**
 * Public preview viewer — the page a client actually opens.
 *
 * Deliberately standalone: no Layout, no auth. All link validation, password
 * checking and view counting happen server-side in /api/preview/[code]; this
 * page only renders whatever that endpoint allows it to see.
 */
export default function PreviewViewer() {
  const router = useRouter()
  const { code } = router.query

  const [state, setState] = useState('loading') // loading | locked | viewing | error
  const [meta, setMeta] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [unlockError, setUnlockError] = useState('')

  const apply = (data) => {
    if (data.url) {
      setMeta(data)
      setState('viewing')
    } else if (data.requiresPassword) {
      setMeta(data)
      setState('locked')
    }
  }

  const fetchLink = useCallback(async () => {
    try {
      const res = await fetch(`/api/preview/${code}`)
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error || 'This preview link is unavailable.')
        setState('error')
        return
      }
      apply(data)
    } catch (err) {
      setErrorMsg('Could not reach the preview service. Please try again.')
      setState('error')
    }
  }, [code])

  useEffect(() => {
    if (code) fetchLink()
  }, [code, fetchLink])

  const handleUnlock = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setUnlockError('')
    try {
      const res = await fetch(`/api/preview/${code}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setUnlockError(data.error || 'Incorrect password.')
        return
      }
      apply(data)
    } catch (err) {
      setUnlockError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ---- Viewing: full-screen embed of the target URL -----------------------
  if (state === 'viewing' && meta?.url) {
    return (
      <>
        <Head>
          <title>{meta.title || 'Preview'} · Boarded</title>
        </Head>
        <div className="flex flex-col h-screen bg-background">
          <header className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-border bg-background-secondary">
            <div className="flex items-center gap-2 min-w-0">
              <FiEye className="text-accent flex-shrink-0" size={16} />
              <span className="text-sm font-medium text-text-primary truncate">{meta.title || 'Preview'}</span>
            </div>
            <a
              href={meta.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm flex-shrink-0"
            >
              <FiExternalLink size={14} />
              Open in new tab
            </a>
          </header>
          <iframe
            src={meta.url}
            title={meta.title || 'Preview'}
            className="flex-1 w-full border-0 bg-white"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
          <p className="text-center text-xs text-text-tertiary py-1.5 border-t border-border">
            Preview shared via <span className="text-accent">Boarded</span> · If the preview doesn&apos;t load,
            use &ldquo;Open in new tab&rdquo;.
          </p>
        </div>
      </>
    )
  }

  // ---- Shared centered shell for loading / locked / error -----------------
  return (
    <>
      <Head>
        <title>{state === 'locked' ? 'Protected preview' : 'Preview'} · Boarded</title>
      </Head>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {state === 'loading' && (
            <div className="card text-center py-12">
              <FiLoader className="animate-spin text-accent mx-auto mb-4" size={32} />
              <p className="text-text-secondary">Loading preview…</p>
            </div>
          )}

          {state === 'error' && (
            <div className="card text-center py-10">
              <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiAlertCircle className="text-red-500" size={28} />
              </div>
              <h1 className="text-lg font-semibold text-text-primary mb-2">Preview unavailable</h1>
              <p className="text-text-secondary text-sm">{errorMsg}</p>
              <p className="text-xs text-text-tertiary mt-6">Shared via Boarded</p>
            </div>
          )}

          {state === 'locked' && (
            <div className="card">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiLock className="text-accent" size={26} />
                </div>
                <h1 className="text-lg font-semibold text-text-primary mb-1">
                  {meta?.title || 'Protected preview'}
                </h1>
                <p className="text-text-secondary text-sm">This preview is password protected.</p>
              </div>

              <form onSubmit={handleUnlock} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input"
                    placeholder="Enter password"
                    autoFocus
                    required
                  />
                </div>
                {unlockError && <p className="text-red-400 text-sm">{unlockError}</p>}
                <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
                  {submitting ? (
                    <>
                      <FiLoader className="animate-spin" size={16} /> Unlocking…
                    </>
                  ) : (
                    <>
                      <FiLock size={16} /> View Preview
                    </>
                  )}
                </button>
              </form>
              <p className="text-xs text-text-tertiary text-center mt-6">Shared via Boarded</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
