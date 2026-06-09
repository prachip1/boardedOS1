import { useState, useEffect } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import { FiMessageSquare, FiCheckCircle, FiClock, FiAlertCircle, FiFilter, FiLoader, FiPlus } from 'react-icons/fi'
import { format, formatDistanceToNow } from 'date-fns'
import { getFeedbackThreads } from '../../lib/api/collaboration'

export default function Collaboration() {
  const [filterStatus, setFilterStatus] = useState('all')
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadThreads = async () => {
      try {
        const data = await getFeedbackThreads()
        setThreads(data)
      } catch (err) {
        console.error('Error loading feedback threads:', err)
      } finally {
        setLoading(false)
      }
    }
    loadThreads()
  }, [])

  const statusConfig = {
    open: { label: 'Open', icon: FiMessageSquare, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    in_review: { label: 'In Review', icon: FiClock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    approved: { label: 'Approved', icon: FiCheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
    rejected: { label: 'Rejected', icon: FiAlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
    closed: { label: 'Closed', icon: FiCheckCircle, color: 'text-text-tertiary', bg: 'bg-background-secondary' },
  }

  const priorityColors = {
    urgent: 'text-red-500',
    high: 'text-orange-500',
    medium: 'text-yellow-500',
    low: 'text-text-tertiary',
  }

  const filteredThreads = threads.filter(thread => 
    filterStatus === 'all' || thread.status === filterStatus
  )

  return (
    <>
      <Head>
        <title>Collaboration - Boarded</title>
      </Head>
      <Layout>
        <div className="space-y-6 fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-text-primary mb-2">
                Collaboration & Feedback
              </h1>
              <p className="text-text-secondary">
                Manage client feedback and project discussions
              </p>
            </div>
            <button className="btn btn-primary">
              <FiPlus size={18} />
              New Thread
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card">
              <p className="text-text-secondary text-sm mb-1">Open Threads</p>
              <p className="text-2xl font-semibold text-blue-500">
                {threads.filter(t => t.status === 'open').length}
              </p>
            </div>
            <div className="card">
              <p className="text-text-secondary text-sm mb-1">In Review</p>
              <p className="text-2xl font-semibold text-yellow-500">
                {threads.filter(t => t.status === 'in_review').length}
              </p>
            </div>
            <div className="card">
              <p className="text-text-secondary text-sm mb-1">Approved</p>
              <p className="text-2xl font-semibold text-green-500">
                {threads.filter(t => t.status === 'approved').length}
              </p>
            </div>
            <div className="card">
              <p className="text-text-secondary text-sm mb-1">Total</p>
              <p className="text-2xl font-semibold text-text-primary">
                {threads.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`btn btn-sm ${filterStatus === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('open')}
              className={`btn btn-sm ${filterStatus === 'open' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Open
            </button>
            <button
              onClick={() => setFilterStatus('in_review')}
              className={`btn btn-sm ${filterStatus === 'in_review' ? 'btn-primary' : 'btn-secondary'}`}
            >
              In Review
            </button>
            <button
              onClick={() => setFilterStatus('approved')}
              className={`btn btn-sm ${filterStatus === 'approved' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Approved
            </button>
          </div>

          {loading && (
            <div className="text-center py-12">
              <FiLoader className="animate-spin text-accent mx-auto mb-4" size={32} />
              <p className="text-text-secondary">Loading feedback threads...</p>
            </div>
          )}

          {!loading && filteredThreads.length === 0 && (
            <div className="card text-center py-12">
              <FiMessageSquare className="mx-auto mb-4 text-text-tertiary" size={48} />
              <p className="text-text-secondary mb-4">No feedback threads yet</p>
              <button className="btn btn-primary inline-flex">
                <FiPlus size={18} />
                Create Your First Thread
              </button>
            </div>
          )}

          {!loading && filteredThreads.length > 0 && (
            <div className="space-y-3">
              {filteredThreads.map(thread => {
                const statusInfo = statusConfig[thread.status] || statusConfig.open
                const StatusIcon = statusInfo.icon

                return (
                  <div key={thread.id} className="card hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-text-primary mb-1 group-hover:text-white transition-colors">
                          {thread.title}
                        </h3>
                        <p className="text-sm text-text-secondary">
                          {thread.client?.name || 'No client'} {thread.project?.name && `• ${thread.project.name}`}
                        </p>
                      </div>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${statusInfo.bg}`}>
                        <StatusIcon className={statusInfo.color} size={14} />
                        <span className={`text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>

                    {thread.description && (
                      <p className="text-sm text-text-tertiary mb-3 line-clamp-2">
                        {thread.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-4">
                        <span className={`${priorityColors[thread.priority]}`}>
                          {thread.priority} priority
                        </span>
                        <span className="text-text-tertiary">
                          <FiMessageSquare className="inline mr-1" size={12} />
                          {thread.comments?.[0]?.count || 0} comments
                        </span>
                      </div>
                      <span className="text-text-tertiary">
                        {formatDistanceToNow(new Date(thread.updated_at || thread.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </Layout>
    </>
  )
}
