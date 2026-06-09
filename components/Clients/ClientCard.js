import Link from 'next/link'
import { useState } from 'react'
import { FiMail, FiPhone, FiBriefcase, FiMapPin, FiShare2, FiCopy, FiCheck } from 'react-icons/fi'
import { format } from 'date-fns'

export default function ClientCard({ client }) {
  const [copied, setCopied] = useState(false)
  
  const initials = client.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const portalToken = client.portal_token || client.id?.slice(-8)
  const portalLink = `${window.location.origin}/client-portal/${portalToken}`

  const copyPortalLink = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(portalLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <Link href={`/clients/${client.id}`}>
      <div className="card group cursor-pointer hover:shadow-lg transition-all">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent-purple text-black flex items-center justify-center font-semibold">
              {initials}
            </div>
            <div>
              <h3 className="font-semibold text-text-primary group-hover:text-white transition-colors">
                {client.name}
              </h3>
              <p className="text-xs text-text-tertiary">{client.company || 'No company'}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {client.email && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <FiMail size={14} />
              <span className="truncate">{client.email}</span>
            </div>
          )}
          {client.phone && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <FiPhone size={14} />
              <span>{client.phone}</span>
            </div>
          )}
          {client.address && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <FiMapPin size={14} />
              <span className="truncate">{client.address}</span>
            </div>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className={`badge ${client.status === 'active' ? 'badge-success' : 'text-text-tertiary'}`}>
              {client.status || 'active'}
            </span>
            <span className="text-xs text-text-tertiary">
              Added {format(new Date(client.created_at), 'MMM dd, yyyy')}
            </span>
          </div>
          
          {/* Client Portal Link */}
          <button
            onClick={copyPortalLink}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-background-elevated hover:bg-background-tertiary rounded-lg text-xs text-text-secondary hover:text-text-primary transition-colors"
          >
            <FiShare2 size={12} />
            {copied ? (
              <>
                <FiCheck size={12} />
                Portal link copied!
              </>
            ) : (
              'Copy client portal link'
            )}
          </button>
        </div>
      </div>
    </Link>
  )
}
