import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../../components/Layout'
import { FiPlus, FiSearch, FiFilter, FiFileText, FiCheckCircle, FiClock, FiXCircle, FiLoader } from 'react-icons/fi'
import { format } from 'date-fns'
import { getContracts, getContractStats } from '../../lib/api/contracts'

export default function Contracts() {
  const [contracts, setContracts] = useState([])
  const [stats, setStats] = useState({ total: 0, signed: 0, pending: 0, draft: 0, totalValue: 0 })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    loadContracts()
  }, [])

  const loadContracts = async () => {
    try {
      setLoading(true)
      const [contractsData, statsData] = await Promise.all([
        getContracts(),
        getContractStats()
      ])
      setContracts(contractsData)
      setStats(statsData)
    } catch (error) {
      console.error('Error loading contracts:', error)
    } finally {
      setLoading(false)
    }
  }

  const statusConfig = {
    signed: { label: 'Signed', icon: FiCheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
    pending: { label: 'Pending Signature', icon: FiClock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    draft: { label: 'Draft', icon: FiFileText, color: 'text-text-tertiary', bg: 'bg-background-elevated' },
    rejected: { label: 'Rejected', icon: FiXCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
  }

  const filteredContracts = contracts.filter(contract => {
    const clientName = contract.client?.name || ''
    const matchesSearch = 
      contract.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.type.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || contract.status === filterStatus

    return matchesSearch && matchesFilter
  })

  return (
    <>
      <Head>
        <title>Contracts - Boarded</title>
      </Head>
      <Layout>
        <div className="space-y-6 fade-in">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-text-primary mb-2">
                Contracts & Legal Docs
              </h1>
              <p className="text-text-secondary">
                Manage contracts, NDAs, and legal agreements
              </p>
            </div>
            <Link href="/contracts/new" className="btn btn-primary">
              <FiPlus size={18} />
              New Contract
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="card">
              <p className="text-text-secondary text-sm mb-1">Total Contracts</p>
              <p className="text-2xl font-semibold text-text-primary">{stats.total}</p>
            </div>
            <div className="card">
              <p className="text-text-secondary text-sm mb-1">Signed</p>
              <p className="text-2xl font-semibold text-green-500">{stats.signed}</p>
            </div>
            <div className="card">
              <p className="text-text-secondary text-sm mb-1">Pending</p>
              <p className="text-2xl font-semibold text-yellow-500">{stats.pending}</p>
            </div>
            <div className="card">
              <p className="text-text-secondary text-sm mb-1">Drafts</p>
              <p className="text-2xl font-semibold text-text-tertiary">{stats.draft}</p>
            </div>
            <div className="card">
              <p className="text-text-secondary text-sm mb-1">Total Value</p>
              <p className="text-2xl font-semibold text-accent">${stats.totalValue.toLocaleString()}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 max-w-md relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
              <input
                type="text"
                placeholder="Search contracts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>

            <div className="flex items-center gap-2">
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="select"
              >
                <option value="all">All Status</option>
                <option value="signed">Signed</option>
                <option value="pending">Pending</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="card text-center py-12">
              <FiLoader className="animate-spin mx-auto mb-4 text-accent" size={48} />
              <p className="text-text-secondary">Loading contracts...</p>
            </div>
          ) : filteredContracts.length === 0 && !searchQuery && filterStatus === 'all' ? (
            <div className="card text-center py-12">
              <FiFileText className="mx-auto mb-4 text-text-tertiary" size={48} />
              <p className="text-text-secondary mb-4">No contracts yet</p>
              <Link href="/contracts/new" className="btn btn-primary inline-flex">
                <FiPlus size={18} />
                Create Your First Contract
              </Link>
            </div>
          ) : (
            <>
              {/* Contracts List */}
              <div className="card overflow-hidden p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-background-elevated border-b border-border">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                          Contract
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                          Type
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                          Client
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                          Status
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                          Created
                        </th>
                        <th className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredContracts.map((contract) => {
                        const statusInfo = statusConfig[contract.status]
                        const StatusIcon = statusInfo.icon

                        return (
                          <tr key={contract.id} className="hover:bg-background-elevated transition-colors">
                            <td className="px-6 py-4">
                              <Link href={`/contracts/${contract.id}`} className="text-sm font-medium text-text-primary hover:text-accent transition-colors">
                                {contract.title}
                              </Link>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-text-secondary capitalize">{contract.type.replace(/-/g, ' ')}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-text-primary">{contract.client?.name || 'N/A'}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {contract.amount ? (
                                <span className="text-sm font-semibold text-text-primary">
                                  ${contract.amount.toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-sm text-text-tertiary">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-md ${statusInfo.bg}`}>
                                <StatusIcon size={14} className={statusInfo.color} />
                                <span className={`text-xs font-medium ${statusInfo.color}`}>
                                  {statusInfo.label}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-tertiary">
                              {format(new Date(contract.created_at), 'MMM dd, yyyy')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                              <Link href={`/contracts/${contract.id}`} className="text-text-secondary hover:text-text-primary transition-colors">
                                View
                              </Link>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {filteredContracts.length === 0 && (
                <div className="card text-center py-12">
                  <FiSearch className="mx-auto mb-4 text-text-tertiary" size={48} />
                  <p className="text-text-secondary mb-4">No contracts match your search</p>
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setFilterStatus('all')
                    }}
                    className="btn btn-secondary"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </Layout>
    </>
  )
}

