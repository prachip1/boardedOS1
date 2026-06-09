import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../../components/Layout'
import { FiPlus, FiSearch, FiFilter, FiGrid, FiList, FiLoader, FiAlertCircle, FiUsers, FiCheckCircle, FiFolder, FiDollarSign } from 'react-icons/fi'
import ClientCard from '../../components/Clients/ClientCard'
import ClientList from '../../components/Clients/ClientList'
import { getClients } from '../../lib/api/clients'

export default function Clients() {
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState('')
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load clients on component mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true)
        const data = await getClients()
        setClients(data)
      } catch (err) {
        setError(err.message)
        console.error('Error fetching clients:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [])

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (client.company && client.company.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <>
      <Head>
        <title>Clients - Boarded</title>
      </Head>
      <Layout>
        <div className="space-y-6 fade-in">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-text-primary mb-2">
                Clients
              </h1>
              <p className="text-text-secondary">
                Manage your client relationships and projects
              </p>
            </div>
            <Link href="/clients/new" className="btn btn-primary">
              <FiPlus size={18} />
              Add Client
            </Link>
          </div>

          {/* Filters and View Controls */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 max-w-md relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>

            <div className="flex items-center gap-2">
              <button className="btn btn-secondary">
                <FiFilter size={16} />
                Filter
              </button>
              
              <div className="flex items-center bg-background-secondary border border-border rounded-md">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-background-elevated text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                >
                  <FiGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-background-elevated text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                >
                  <FiList size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <FiLoader className="animate-spin text-accent mx-auto mb-4" size={32} />
              <p className="text-text-secondary">Loading clients...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiAlertCircle className="text-red-500" size={32} />
              </div>
              <h3 className="text-lg font-medium text-text-primary mb-2">Error loading clients</h3>
              <p className="text-text-secondary mb-6">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="btn btn-primary"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Stats */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="card">
                <p className="text-text-secondary text-sm mb-1">Total Clients</p>
                <p className="text-2xl font-semibold text-text-primary">{clients.length}</p>
              </div>
              <div className="card">
                <p className="text-text-secondary text-sm mb-1">Active</p>
                <p className="text-2xl font-semibold text-green-500">
                  {clients.filter(c => c.status === 'active').length}
                </p>
              </div>
              <div className="card">
                <p className="text-text-secondary text-sm mb-1">Inactive</p>
                <p className="text-2xl font-semibold text-gray-500">
                  {clients.filter(c => c.status === 'inactive').length}
                </p>
              </div>
              <div className="card">
                <p className="text-text-secondary text-sm mb-1">This Month</p>
                <p className="text-2xl font-semibold text-blue-500">
                  {clients.filter(c => {
                    const created = new Date(c.created_at)
                    const now = new Date()
                    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
                  }).length}
                </p>
              </div>
            </div>
          )}

          {/* Clients Display */}
          {!loading && !error && filteredClients.length > 0 && (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredClients.map(client => (
                    <ClientCard key={client.id} client={client} />
                  ))}
                </div>
              ) : (
                <ClientList clients={filteredClients} />
              )}
            </>
          )}

          {/* Empty State */}
          {!loading && !error && filteredClients.length === 0 && (
            <div className="card text-center py-12">
              <p className="text-text-secondary mb-4">
                {searchQuery ? 'No clients found matching your search.' : 'No clients yet.'}
              </p>
              {!searchQuery && (
                <Link href="/clients/new" className="btn btn-primary inline-flex">
                  <FiPlus size={18} />
                  Add Your First Client
                </Link>
              )}
            </div>
          )}
        </div>
      </Layout>
    </>
  )
}