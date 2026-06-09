import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../../components/Layout'
import { FiArrowLeft, FiSave, FiX, FiLoader, FiLink, FiCopy, FiEye, FiClock, FiPlus } from 'react-icons/fi'
import { format } from 'date-fns'
import { getClients } from '../../lib/api/clients'
import { createPreviewLink } from '../../lib/api/preview-links'
import QRCodeDisplay from '../../components/PreviewLinks/QRCodeDisplay'
import TunnelSetup from '../../components/PreviewLinks/TunnelSetup'
import { isLocalhost } from '../../lib/tunnel'

export default function NewPreview() {
  const router = useRouter()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(false)
  const [createdLink, setCreatedLink] = useState(null)
  const [showTunnelSetup, setShowTunnelSetup] = useState(false)
  const [tunnelUrl, setTunnelUrl] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    client_id: '',
    expiry: '24',
    maxViews: '',
    password: '',
  })

  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await getClients()
        setClients(data)
      } catch (err) {
        console.error('Error loading clients:', err)
      }
    }
    loadClients()
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleNext = (e) => {
    e.preventDefault()
    
    // Check if URL is localhost
    if (isLocalhost(formData.url)) {
      setShowTunnelSetup(true)
    } else {
      // Direct URL, create link immediately
      handleCreateLink(formData.url)
    }
  }

  const handleTunnelCreated = (publicUrl) => {
    setTunnelUrl(publicUrl)
    setShowTunnelSetup(false)
    handleCreateLink(publicUrl)
  }

  const handleCreateLink = async (finalUrl) => {
    setLoading(true)

    try {
      const expiresAt = formData.expiry ? new Date(Date.now() + parseInt(formData.expiry) * 60 * 60 * 1000).toISOString() : null

      const newLink = await createPreviewLink({
        title: formData.title,
        url: finalUrl,
        client_id: formData.client_id || null,
        expires_at: expiresAt,
        max_views: formData.maxViews ? parseInt(formData.maxViews) : null,
        password: formData.password || null,
      })

      setCreatedLink(newLink)
    } catch (err) {
      console.error('Error creating preview link:', err)
      alert('Error creating preview link')
    } finally {
      setLoading(false)
    }
  }

  const getShareUrl = (shortCode) => {
    return `${window.location.origin}/preview/${shortCode}`
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('Link copied!')
  }

  // If link is created, show success screen with QR
  if (createdLink) {
    const shareUrl = getShareUrl(createdLink.short_code)
    
    return (
      <>
        <Head>
          <title>Preview Link Created - Boarded</title>
        </Head>
        <Layout>
          <div className="max-w-3xl mx-auto space-y-6 fade-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiLink className="text-green-500" size={32} />
              </div>
              <h1 className="text-2xl font-semibold text-text-primary mb-2">
                Preview Link Created! 🎉
              </h1>
              <p className="text-text-secondary">
                Share this link or QR code with your client
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Share URL */}
              <div className="card">
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  📎 Share Link
                </h3>
                
                <div className="bg-background-elevated rounded p-3 mb-4">
                  <code className="text-xs text-accent break-all">{shareUrl}</code>
                </div>

                <button
                  onClick={() => copyToClipboard(shareUrl)}
                  className="btn btn-primary w-full"
                >
                  <FiCopy size={16} />
                  Copy Link
                </button>

                <div className="mt-4 space-y-2 text-xs text-text-tertiary">
                  <p className="flex items-center gap-2">
                    <FiEye size={12} />
                    {createdLink.max_views ? `Max ${createdLink.max_views} views` : 'Unlimited views'}
                  </p>
                  {createdLink.expires_at && (
                    <p className="flex items-center gap-2">
                      <FiClock size={12} />
                      Expires {format(new Date(createdLink.expires_at), 'MMM dd, yyyy h:mm a')}
                    </p>
                  )}
                </div>
              </div>

              {/* QR Code */}
              <div className="card">
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  📱 QR Code
                </h3>
                
                <div className="flex justify-center">
                  <QRCodeDisplay url={shareUrl} title={createdLink.title} />
                </div>

                <p className="text-xs text-text-secondary text-center mt-4">
                  Client can scan this with their phone camera to open the preview instantly
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <Link href="/previews" className="btn btn-secondary">
                View All Links
              </Link>
              <button
                onClick={() => {
                  setCreatedLink(null)
                  setFormData({
                    title: '',
                    url: '',
                    client_id: '',
                    expiry: '24',
                    maxViews: '',
                    password: '',
                  })
                }}
                className="btn btn-primary"
              >
                <FiPlus size={18} />
                Create Another
              </button>
            </div>
          </div>
        </Layout>
      </>
    )
  }

  // Show tunnel setup if localhost URL
  if (showTunnelSetup) {
    return (
      <>
        <Head>
          <title>Setup Tunnel - Boarded</title>
        </Head>
        <Layout>
          <div className="max-w-3xl mx-auto space-y-6 fade-in">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowTunnelSetup(false)}
                className="text-text-secondary hover:text-text-primary"
              >
                <FiArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-text-primary">
                  Setup Public Tunnel
                </h1>
                <p className="text-text-secondary text-sm">
                  Make your localhost accessible to clients
                </p>
              </div>
            </div>

            <TunnelSetup 
              localUrl={formData.url} 
              onTunnelCreated={handleTunnelCreated}
            />
          </div>
        </Layout>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>New Preview Link - Boarded</title>
      </Head>
      <Layout>
        <div className="max-w-2xl mx-auto space-y-6 fade-in">
          <div className="flex items-center gap-4">
            <Link href="/previews" className="text-text-secondary hover:text-text-primary">
              <FiArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-text-primary">
                New Preview Link
              </h1>
              <p className="text-text-secondary text-sm">
                Generate a shareable preview link for your work
              </p>
            </div>
          </div>

          <form onSubmit={handleNext} className="space-y-6">
            <div className="card space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Preview Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input"
                  placeholder="Homepage Redesign Preview"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Target URL *
                </label>
                <input
                  type="text"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  className="input"
                  placeholder="http://localhost:3000 or https://your-site.com"
                  required
                />
                <p className="text-xs text-text-tertiary mt-2 flex items-start gap-2">
                  <span>💡</span>
                  <span>
                    <strong>Localhost URLs:</strong> We&apos;ll help you create a public tunnel automatically! 
                    <br/>
                    <strong>Public URLs:</strong> Use directly (e.g., deployed Vercel URLs)
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Client (Optional)
                </label>
                <select
                  name="client_id"
                  value={formData.client_id}
                  onChange={handleChange}
                  className="select"
                >
                  <option value="">No client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Expires In
                  </label>
                  <select
                    name="expiry"
                    value={formData.expiry}
                    onChange={handleChange}
                    className="select"
                  >
                    <option value="1">1 hour</option>
                    <option value="6">6 hours</option>
                    <option value="24">24 hours</option>
                    <option value="72">3 days</option>
                    <option value="168">1 week</option>
                    <option value="">Never</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Max Views (Optional)
                  </label>
                  <input
                    type="number"
                    name="maxViews"
                    value={formData.maxViews}
                    onChange={handleChange}
                    className="input"
                    placeholder="Unlimited"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Password Protection (Optional)
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input"
                  placeholder="Leave empty for no password"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Link href="/previews" className="btn btn-secondary">
                <FiX size={18} />
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <FiLoader className="animate-spin" size={18} />
                    Generating...
                  </>
                ) : (
                  <>
                    <FiLink size={18} />
                    Generate Link
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </Layout>
    </>
  )
}
