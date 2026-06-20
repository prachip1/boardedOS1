import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../../components/Layout'
import { FiArrowLeft, FiEdit2, FiTrash2, FiMail, FiPhone, FiGlobe, FiMapPin, FiDollarSign, FiBriefcase, FiFileText, FiClock, FiLoader, FiAlertCircle } from 'react-icons/fi'
import { format } from 'date-fns'
import { getClient, getClientStats, deleteClient } from '../../lib/api/clients'

export default function ClientDetail() {
  const router = useRouter()
  const { id } = router.query
  const [activeTab, setActiveTab] = useState('overview') // overview, projects, invoices, contracts, files

  const [client, setClient] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return // wait for the router to populate the dynamic param

    const fetchClient = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getClient(id)
        setClient(data)

        // Stats are best-effort: related tables may not exist yet.
        try {
          const clientStats = await getClientStats(id)
          setStats(clientStats)
        } catch (statsErr) {
          console.warn('Could not load client stats:', statsErr)
          setStats(null)
        }
      } catch (err) {
        console.error('Error fetching client:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchClient()
  }, [id])

  const handleDelete = async () => {
    if (!confirm('Delete this client? This cannot be undone.')) return
    try {
      await deleteClient(id)
      router.push('/clients')
    } catch (err) {
      alert('Failed to delete client: ' + err.message)
    }
  }

  // Loading state
  if (loading) {
    return (
      <Layout>
        <div className="text-center py-20">
          <FiLoader className="animate-spin text-accent mx-auto mb-4" size={32} />
          <p className="text-text-secondary">Loading client...</p>
        </div>
      </Layout>
    )
  }

  // Error / not-found state
  if (error || !client) {
    return (
      <Layout>
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle className="text-red-500" size={32} />
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-2">
            {error ? 'Error loading client' : 'Client not found'}
          </h3>
          <p className="text-text-secondary mb-6">
            {error || "This client doesn't exist or you don't have access to it."}
          </p>
          <Link href="/clients" className="btn btn-primary inline-flex">
            <FiArrowLeft size={16} />
            Back to Clients
          </Link>
        </div>
      </Layout>
    )
  }

  const activeProjects = stats?.activeProjects ?? 0
  const totalProjects = stats?.totalProjects ?? 0
  const outstandingAmount = stats ? Math.max(stats.totalInvoiced - 0, 0) : 0
  const totalPaid = stats?.totalInvoiced ?? 0

  const projects = []
  const invoices = []

  const initials = (client.name || '?')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <>
      <Head>
        <title>{client.name} - Boarded</title>
      </Head>
      <Layout>
        <div className="space-y-6 fade-in">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/clients" className="text-text-secondary hover:text-text-primary transition-colors">
                <FiArrowLeft size={20} />
              </Link>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center font-bold text-xl">
                  {initials}
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-text-primary">
                    {client.name}
                  </h1>
                  <p className="text-text-secondary">{client.company}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn btn-secondary">
                <FiEdit2 size={16} />
                Edit
              </button>
              <button onClick={handleDelete} className="btn btn-secondary text-red-500 hover:bg-red-500/10">
                <FiTrash2 size={16} />
              </button>
            </div>
          </div>

          {/* Contact Info & Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Contact Information */}
            <div className="card">
              <h2 className="text-lg font-semibold text-text-primary mb-4">Contact Information</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-text-secondary">
                  <FiMail size={16} className="flex-shrink-0" />
                  <a href={`mailto:${client.email}`} className="hover:text-accent transition-colors">
                    {client.email}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-text-secondary">
                  <FiPhone size={16} className="flex-shrink-0" />
                  <a href={`tel:${client.phone}`} className="hover:text-accent transition-colors">
                    {client.phone}
                  </a>
                </div>
                {client.website && (
                  <div className="flex items-center gap-3 text-text-secondary">
                    <FiGlobe size={16} className="flex-shrink-0" />
                    <a href={client.website} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                      {client.website}
                    </a>
                  </div>
                )}
                {client.address && (
                  <div className="flex items-start gap-3 text-text-secondary">
                    <FiMapPin size={16} className="flex-shrink-0 mt-1" />
                    <span>{client.address}</span>
                  </div>
                )}
              </div>
              
              {client.notes && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm font-medium text-text-primary mb-2">Notes</p>
                  <p className="text-sm text-text-secondary">{client.notes}</p>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card">
                <div className="flex items-center gap-2 mb-2">
                  <FiBriefcase size={16} className="text-blue-500" />
                  <p className="text-xs text-text-tertiary">Active Projects</p>
                </div>
                <p className="text-2xl font-semibold text-text-primary">{activeProjects}</p>
              </div>
              <div className="card">
                <div className="flex items-center gap-2 mb-2">
                  <FiFileText size={16} className="text-purple-500" />
                  <p className="text-xs text-text-tertiary">Total Projects</p>
                </div>
                <p className="text-2xl font-semibold text-text-primary">{totalProjects}</p>
              </div>
              <div className="card">
                <div className="flex items-center gap-2 mb-2">
                  <FiDollarSign size={16} className="text-yellow-500" />
                  <p className="text-xs text-text-tertiary">Outstanding</p>
                </div>
                <p className="text-2xl font-semibold text-yellow-500">${outstandingAmount.toLocaleString()}</p>
              </div>
              <div className="card">
                <div className="flex items-center gap-2 mb-2">
                  <FiDollarSign size={16} className="text-green-500" />
                  <p className="text-xs text-text-tertiary">Total Paid</p>
                </div>
                <p className="text-2xl font-semibold text-green-500">${totalPaid.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-border">
            <div className="flex gap-6">
              {['overview', 'projects', 'invoices', 'contracts', 'files'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-sm font-medium transition-colors relative ${
                    activeTab === tab
                      ? 'text-text-primary'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'overview' && (
              <>
                {/* Active Projects */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Active Projects</h3>
                  <div className="space-y-3">
                    {projects.length === 0 && (
                      <p className="text-sm text-text-tertiary">No projects yet for this client.</p>
                    )}
                    {projects.map(project => (
                      <div key={project.id} className="flex items-center justify-between p-3 rounded-lg bg-background-elevated hover:bg-background-tertiary transition-colors">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-text-primary">{project.name}</p>
                          <p className="text-xs text-text-tertiary">Due: {format(project.deadline, 'MMM dd, yyyy')}</p>
                        </div>
                        <span className={`badge ${project.status === 'In Progress' ? 'badge-info' : 'badge-warning'}`}>
                          {project.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Invoices */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Invoices</h3>
                  <div className="space-y-3">
                    {invoices.length === 0 && (
                      <p className="text-sm text-text-tertiary">No invoices yet for this client.</p>
                    )}
                    {invoices.map(invoice => (
                      <div key={invoice.id} className="flex items-center justify-between p-3 rounded-lg bg-background-elevated hover:bg-background-tertiary transition-colors">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-text-primary">{invoice.id}</p>
                          <p className="text-xs text-text-tertiary">
                            {invoice.status === 'Paid' 
                              ? `Paid on ${format(invoice.paidDate, 'MMM dd, yyyy')}`
                              : `Due: ${format(invoice.dueDate, 'MMM dd, yyyy')}`
                            }
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-text-primary">${invoice.amount.toLocaleString()}</p>
                          <span className={`badge ${invoice.status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                            {invoice.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'projects' && (
              <div className="card">
                <p className="text-text-secondary">Projects view - Coming soon</p>
              </div>
            )}

            {activeTab === 'invoices' && (
              <div className="card">
                <p className="text-text-secondary">Invoices view - Coming soon</p>
              </div>
            )}

            {activeTab === 'contracts' && (
              <div className="card">
                <p className="text-text-secondary">Contracts view - Coming soon</p>
              </div>
            )}

            {activeTab === 'files' && (
              <div className="card">
                <p className="text-text-secondary">Files view - Coming soon</p>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  )
}

