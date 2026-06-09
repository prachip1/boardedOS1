import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../../components/Layout'
import { FiPlus, FiSearch, FiLoader, FiAlertCircle, FiFolder, FiUsers, FiCalendar, FiDollarSign } from 'react-icons/fi'
import { getProjects } from '../../lib/api/projects'
import { useAuth } from '../../contexts/AuthContext'

const STATUS_STYLES = {
  active: 'bg-green-500/10 text-green-500',
  completed: 'bg-blue-500/10 text-blue-500',
  on_hold: 'bg-yellow-500/10 text-yellow-500',
  cancelled: 'bg-red-500/10 text-red-500',
}

export default function Projects() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        const data = await getProjects()
        setProjects(data)
      } catch (err) {
        setError(err.message)
        console.error('Error fetching projects:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (p.client?.name && p.client.name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const ownedCount = projects.filter(p => p.user_id === user?.id).length
  const sharedCount = projects.length - ownedCount

  return (
    <>
      <Head>
        <title>Projects - Boarded</title>
      </Head>
      <Layout>
        <div className="space-y-6 fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-text-primary mb-2">Projects</h1>
              <p className="text-text-secondary">
                Your projects and the ones you&apos;ve been invited to collaborate on
              </p>
            </div>
            <Link href="/projects/new" className="btn btn-primary shrink-0">
              <FiPlus size={18} />
              New Project
            </Link>
          </div>

          {/* Search */}
          <div className="max-w-md relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-12">
              <FiLoader className="animate-spin text-accent mx-auto mb-4" size={32} />
              <p className="text-text-secondary">Loading projects...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="card bg-red-500/10 border border-red-500/20">
              <div className="flex items-start gap-3">
                <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={20} />
                <div>
                  <h3 className="text-red-500 font-medium mb-1">Couldn&apos;t load projects</h3>
                  <p className="text-red-400 text-sm">{error}</p>
                  <p className="text-text-tertiary text-xs mt-2">
                    If this mentions <code>project_members</code>, run{' '}
                    <code>supabase/projects-members.sql</code> in your Supabase SQL editor.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="card">
                <p className="text-text-secondary text-sm mb-1">Total Projects</p>
                <p className="text-2xl font-semibold text-text-primary">{projects.length}</p>
              </div>
              <div className="card">
                <p className="text-text-secondary text-sm mb-1">Owned by you</p>
                <p className="text-2xl font-semibold text-accent">{ownedCount}</p>
              </div>
              <div className="card">
                <p className="text-text-secondary text-sm mb-1">Shared with you</p>
                <p className="text-2xl font-semibold text-blue-500">{sharedCount}</p>
              </div>
            </div>
          )}

          {/* Grid */}
          {!loading && !error && filtered.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(project => {
                const isShared = project.user_id !== user?.id
                const memberCount = project.members?.[0]?.count ?? 0
                return (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="card hover:border-accent transition-colors flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-md bg-accent/10 text-accent flex items-center justify-center flex-shrink-0">
                          <FiFolder size={18} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium text-text-primary truncate">{project.name}</h3>
                          {project.client?.name && (
                            <p className="text-xs text-text-tertiary truncate">{project.client.name}</p>
                          )}
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full capitalize whitespace-nowrap ${STATUS_STYLES[project.status] || 'bg-gray-500/10 text-gray-400'}`}>
                        {project.status?.replace('_', ' ')}
                      </span>
                    </div>

                    {project.description && (
                      <p className="text-sm text-text-secondary line-clamp-2">{project.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-text-tertiary mt-auto pt-2">
                      <span className="flex items-center gap-1"><FiUsers size={13} /> {memberCount}</span>
                      {project.budget != null && (
                        <span className="flex items-center gap-1"><FiDollarSign size={13} /> {Number(project.budget).toLocaleString()}</span>
                      )}
                      {project.end_date && (
                        <span className="flex items-center gap-1"><FiCalendar size={13} /> {new Date(project.end_date).toLocaleDateString()}</span>
                      )}
                      {isShared && (
                        <span className="ml-auto text-blue-500 font-medium">Shared</span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filtered.length === 0 && (
            <div className="card text-center py-12">
              <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto mb-4">
                <FiFolder size={22} />
              </div>
              <p className="text-text-secondary mb-4">
                {searchQuery ? 'No projects match your search.' : 'No projects yet.'}
              </p>
              {!searchQuery && (
                <Link href="/projects/new" className="btn btn-primary inline-flex">
                  <FiPlus size={18} />
                  Create Your First Project
                </Link>
              )}
            </div>
          )}
        </div>
      </Layout>
    </>
  )
}
