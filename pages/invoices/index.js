import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../../components/Layout'
import { FiPlus, FiSearch, FiFilter, FiDollarSign, FiCheckCircle, FiClock, FiXCircle, FiAlertCircle, FiLoader } from 'react-icons/fi'
import { format, differenceInDays } from 'date-fns'
import { getInvoices } from '../../lib/api/invoices'
import { getCurrencySymbol, DEFAULT_CURRENCY } from '../../lib/currencies'

export default function Invoices() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load invoices
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true)
        const data = await getInvoices()
        setInvoices(data)
      } catch (err) {
        setError(err.message)
        console.error('Error fetching invoices:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchInvoices()
  }, [])

  const statusConfig = {
    paid: { label: 'Paid', icon: FiCheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
    sent: { label: 'Sent', icon: FiClock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    overdue: { label: 'Overdue', icon: FiAlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
    draft: { label: 'Draft', icon: FiDollarSign, color: 'text-text-tertiary', bg: 'bg-background-elevated' },
  }

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (invoice.client && invoice.client.name.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesFilter = filterStatus === 'all' || invoice.status === filterStatus

    return matchesSearch && matchesFilter
  })

  const stats = {
    total: invoices.reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0),
    paid: invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0),
    pending: invoices.filter(inv => inv.status === 'sent').reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0),
    overdue: invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0),
  }

  // Use the most common currency among invoices for the summary cards
  const statsCurrency = (() => {
    const counts = {}
    invoices.forEach(inv => {
      const code = inv.currency || DEFAULT_CURRENCY
      counts[code] = (counts[code] || 0) + 1
    })
    const sorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a])
    return sorted[0] || DEFAULT_CURRENCY
  })()
  const statsSymbol = getCurrencySymbol(statsCurrency)

  return (
    <>
      <Head>
        <title>Invoices - Boarded</title>
      </Head>
      <Layout>
        <div className="space-y-6 fade-in">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-text-primary mb-2">
                Invoices & Payments
              </h1>
              <p className="text-text-secondary">
                Create and track your invoices and payments
              </p>
            </div>
            <Link href="/invoices/new" className="btn btn-primary">
              <FiPlus size={18} />
              New Invoice
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <FiDollarSign className="text-accent" size={20} />
                <p className="text-text-secondary text-sm">Total</p>
              </div>
              <p className="text-2xl font-semibold text-text-primary">
                {statsSymbol}{stats.total.toFixed(2)}
              </p>
            </div>
            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <FiCheckCircle className="text-green-500" size={20} />
                <p className="text-text-secondary text-sm">Paid</p>
              </div>
              <p className="text-2xl font-semibold text-green-500">
                {statsSymbol}{stats.paid.toFixed(2)}
              </p>
            </div>
            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <FiClock className="text-yellow-500" size={20} />
                <p className="text-text-secondary text-sm">Pending</p>
              </div>
              <p className="text-2xl font-semibold text-yellow-500">
                {statsSymbol}{stats.pending.toFixed(2)}
              </p>
            </div>
            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <FiAlertCircle className="text-red-500" size={20} />
                <p className="text-text-secondary text-sm">Overdue</p>
              </div>
              <p className="text-2xl font-semibold text-red-500">
                {statsSymbol}{stats.overdue.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="select w-40"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <FiLoader className="animate-spin text-accent mx-auto mb-4" size={32} />
              <p className="text-text-secondary">Loading invoices...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiAlertCircle className="text-red-500" size={32} />
              </div>
              <h3 className="text-lg font-medium text-text-primary mb-2">Error loading invoices</h3>
              <p className="text-text-secondary mb-6">{error}</p>
            </div>
          )}

          {/* Invoice List */}
          {!loading && !error && filteredInvoices.length > 0 && (
            <div className="card overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-background-elevated border-b border-border">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase">Invoice</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase">Client</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase">Amount</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase">Due Date</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredInvoices.map(invoice => {
                      const StatusIcon = statusConfig[invoice.status]?.icon || FiDollarSign
                      const statusInfo = statusConfig[invoice.status] || statusConfig.draft
                      const daysUntilDue = differenceInDays(new Date(invoice.due_date), new Date())

                      return (
                        <tr key={invoice.id} className="hover:bg-background-elevated transition-colors">
                          <td className="px-6 py-4">
                            <Link href={`/invoices/${invoice.id}`} className="font-mono text-sm text-text-primary hover:text-white transition-colors">
                              {invoice.invoice_number}
                            </Link>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-text-primary">{invoice.client?.name || 'No client'}</div>
                            <div className="text-xs text-text-tertiary">{invoice.client?.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-semibold text-text-primary">
                              {getCurrencySymbol(invoice.currency)}{parseFloat(invoice.total).toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-text-secondary">
                              {format(new Date(invoice.due_date), 'MMM dd, yyyy')}
                            </div>
                            {daysUntilDue >= 0 && invoice.status !== 'paid' && (
                              <div className="text-xs text-text-tertiary">
                                {daysUntilDue === 0 ? 'Due today' : `${daysUntilDue} days left`}
                              </div>
                            )}
                            {daysUntilDue < 0 && invoice.status !== 'paid' && (
                              <div className="text-xs text-red-500">
                                {Math.abs(daysUntilDue)} days overdue
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${statusInfo.bg}`}>
                              <StatusIcon className={statusInfo.color} size={14} />
                              <span className={`text-xs font-medium ${statusInfo.color}`}>
                                {statusInfo.label}
                              </span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredInvoices.length === 0 && (
            <div className="card text-center py-12">
              <p className="text-text-secondary mb-4">
                {searchQuery || filterStatus !== 'all' ? 'No invoices found matching your criteria.' : 'No invoices yet.'}
              </p>
              {!searchQuery && filterStatus === 'all' && (
                <Link href="/invoices/new" className="btn btn-primary inline-flex">
                  <FiPlus size={18} />
                  Create Your First Invoice
                </Link>
              )}
            </div>
          )}
        </div>
      </Layout>
    </>
  )
}
