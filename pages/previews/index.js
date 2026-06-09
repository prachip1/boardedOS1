import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../../components/Layout'
import { FiPlus, FiLink, FiCopy, FiTrash2, FiEye, FiClock, FiLoader, FiX } from 'react-icons/fi'
import { format } from 'date-fns'
import { getPreviewLinks, deletePreviewLink } from '../../lib/api/preview-links'
import QRCodeDisplay from '../../components/PreviewLinks/QRCodeDisplay'

export default function Previews() {
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showQR, setShowQR] = useState(null)

  useEffect(() => {
    const loadLinks = async () => {
      try {
        const data = await getPreviewLinks()
        setLinks(data)
      } catch (err) {
        console.error('Error loading preview links:', err)
      } finally {
        setLoading(false)
      }
    }
    loadLinks()
  }, [])

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('Link copied to clipboard!')
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this preview link?')) return
    
    try {
      await deletePreviewLink(id)
      setLinks(links.filter(l => l.id !== id))
    } catch (err) {
      console.error('Error deleting link:', err)
    }
  }

  const getShareUrl = (shortCode) => {
    return `${window.location.origin}/preview/${shortCode}`
  }

  return (
    <>
      <Head>
        <title>Live Previews - Boarded</title>
      </Head>
      <Layout>
        <div className="space-y-6 fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-text-primary mb-2">
                Live Preview Links
              </h1>
              <p className="text-text-secondary">
                Share your work instantly with temporary preview links
              </p>
            </div>
            <Link href="/previews/new" className="btn btn-primary">
              <FiPlus size={18} />
              New Preview Link
            </Link>
          </div>

          {loading && (
            <div className="text-center py-12">
              <FiLoader className="animate-spin text-accent mx-auto mb-4" size={32} />
              <p className="text-text-secondary">Loading preview links...</p>
            </div>
          )}

          {!loading && links.length === 0 && (
            <div className="card text-center py-12">
              <FiLink className="mx-auto mb-4 text-text-tertiary" size={48} />
              <p className="text-text-secondary mb-4">No preview links yet</p>
              <Link href="/previews/new" className="btn btn-primary inline-flex">
                <FiPlus size={18} />
                Create Your First Preview Link
              </Link>
            </div>
          )}

          {!loading && links.length > 0 && (
            <div className="grid grid-cols-1 gap-4">
              {links.map(link => {
                const shareUrl = getShareUrl(link.short_code)
                const isExpired = link.status === 'expired' || (link.expires_at && new Date(link.expires_at) < new Date())
                
                return (
                  <div key={link.id} className="card">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-text-primary mb-1">
                          {link.title}
                        </h3>
                        <p className="text-xs text-text-tertiary mb-2">
                          {link.client?.name || 'No client'} • Created {format(new Date(link.created_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowQR(link)}
                          className="btn btn-secondary btn-sm"
                          disabled={isExpired}
                        >
                          📱 QR Code
                        </button>
                        <button
                          onClick={() => copyToClipboard(shareUrl)}
                          className="btn btn-secondary btn-sm"
                          disabled={isExpired}
                        >
                          <FiCopy size={14} />
                          Copy
                        </button>
                        <button
                          onClick={() => handleDelete(link.id)}
                          className="btn btn-ghost btn-sm text-red-500 hover:bg-red-500/10"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="bg-background-secondary rounded p-3 mb-3">
                      <code className="text-xs text-accent break-all">{shareUrl}</code>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-text-tertiary">
                      <div className="flex items-center gap-1">
                        <FiEye size={12} />
                        <span>{link.views || 0} views</span>
                        {link.max_views && <span>/ {link.max_views}</span>}
                      </div>
                      {link.expires_at && (
                        <div className="flex items-center gap-1">
                          <FiClock size={12} />
                          <span className={isExpired ? 'text-red-500' : ''}>
                            {isExpired ? 'Expired' : `Expires ${format(new Date(link.expires_at), 'MMM dd')}`}
                          </span>
                        </div>
                      )}
                      <span className={`badge ${link.status === 'active' ? 'badge-success' : 'text-text-tertiary'}`}>
                        {link.status}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* QR Code Modal */}
          {showQR && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="card max-w-md w-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-text-primary">
                    QR Code for Preview Link
                  </h2>
                  <button
                    onClick={() => setShowQR(null)}
                    className="text-text-tertiary hover:text-text-primary transition-colors"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                <div className="text-center mb-4">
                  <h3 className="text-lg font-medium text-text-primary mb-2">
                    {showQR.title}
                  </h3>
                  <p className="text-sm text-text-secondary mb-6">
                    Scan this QR code with your phone camera
                  </p>
                </div>

                <div className="flex justify-center mb-6 bg-white p-6 rounded-xl">
                  <QRCodeDisplay 
                    url={getShareUrl(showQR.short_code)} 
                    title={showQR.title}
                  />
                </div>

                <div className="bg-background-elevated rounded-lg p-4 mb-4">
                  <p className="text-xs text-text-tertiary mb-2">Preview URL:</p>
                  <code className="text-xs text-accent break-all">
                    {getShareUrl(showQR.short_code)}
                  </code>
                </div>

                <div className="flex items-center gap-2 text-xs text-text-tertiary">
                  <FiEye size={12} />
                  <span>{showQR.views || 0} views</span>
                  {showQR.max_views && <span>/ {showQR.max_views} max</span>}
                  {showQR.expires_at && (
                    <>
                      <span className="mx-2">•</span>
                      <FiClock size={12} />
                      <span>Expires {format(new Date(showQR.expires_at), 'MMM dd, yyyy')}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </>
  )
}
