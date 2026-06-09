import { useState, useEffect } from 'react'
import Head from 'next/head'
import { supabase } from '../../lib/supabase'
import { FiClock, FiCheck, FiAlertCircle, FiEye, FiDownload } from 'react-icons/fi'

export default function ClientPortal({ token }) {
  const [client, setClient] = useState(null)
  const [projects, setProjects] = useState([])
  const [timeEntries, setTimeEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        // Get client data from token
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('portal_token', token)
          .single()

        if (clientError) throw clientError

        setClient(clientData)

        // Get projects for this client
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .eq('client_id', clientData.id)

        if (projectsError) throw projectsError
        setProjects(projectsData || [])

        // Get recent time entries
        const { data: timeData, error: timeError } = await supabase
          .from('time_entries')
          .select('*, projects(name)')
          .eq('client_id', clientData.id)
          .order('created_at', { ascending: false })
          .limit(10)

        if (timeError) throw timeError
        setTimeEntries(timeData || [])

      } catch (err) {
        setError('Invalid or expired portal link')
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchClientData()
    }
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading your portal...</p>
        </div>
      </div>
    )
  }

  if (error || !client) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle className="text-red-500" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Portal Not Found</h1>
          <p className="text-text-secondary mb-6">
            This portal link is invalid or has expired. Please contact your service provider for a new link.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="btn btn-primary"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{client.name} - Client Portal | Boarded</title>
        <meta name="description" content={`Client portal for ${client.name}`} />
      </Head>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-background-secondary">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-text-primary">Client Portal</h1>
                  <p className="text-sm text-text-tertiary">Welcome, {client.name}</p>
                </div>
              </div>
              <div className="text-sm text-text-tertiary">
                Last updated: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-8">
          {/* Welcome Section */}
          <div className="bg-background-elevated border border-border rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              Welcome to your project portal
            </h2>
            <p className="text-text-secondary">
              Here you can track the progress of your projects, view time spent, and access deliverables.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-background-elevated border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <FiCheck className="text-green-500" size={20} />
                <h3 className="text-lg font-semibold text-text-primary">Active Projects</h3>
              </div>
              <p className="text-3xl font-bold text-text-primary">{projects.length}</p>
            </div>

            <div className="bg-background-elevated border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <FiClock className="text-blue-500" size={20} />
                <h3 className="text-lg font-semibold text-text-primary">Total Hours</h3>
              </div>
              <p className="text-3xl font-bold text-text-primary">
                {timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0).toFixed(1)}h
              </p>
            </div>

            <div className="bg-background-elevated border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <FiEye className="text-purple-500" size={20} />
                <h3 className="text-lg font-semibold text-text-primary">Last Activity</h3>
              </div>
              <p className="text-sm text-text-secondary">
                {timeEntries[0] ? new Date(timeEntries[0].created_at).toLocaleDateString() : 'No activity yet'}
              </p>
            </div>
          </div>

          {/* Projects Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-text-primary mb-4">Your Projects</h3>
            <div className="grid gap-4">
              {projects.map((project) => (
                <div key={project.id} className="bg-background-elevated border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-text-primary">{project.name}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      project.status === 'active' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  {project.description && (
                    <p className="text-text-secondary mb-3">{project.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-text-tertiary">
                    <span>Started: {new Date(project.created_at).toLocaleDateString()}</span>
                    {project.deadline && (
                      <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              ))}
              {projects.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-text-secondary">No projects yet. Your service provider will add them here.</p>
                </div>
              )}
            </div>
          </div>

          {/* Time Tracking Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-text-primary mb-4">Recent Activity</h3>
            <div className="bg-background-elevated border border-border rounded-xl overflow-hidden">
              {timeEntries.length > 0 ? (
                <div className="divide-y divide-border">
                  {timeEntries.map((entry) => (
                    <div key={entry.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-text-primary font-medium">
                          {entry.projects?.name || 'General work'}
                        </p>
                        <p className="text-sm text-text-secondary">{entry.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-text-primary font-medium">{entry.duration}h</p>
                        <p className="text-xs text-text-tertiary">
                          {new Date(entry.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-text-secondary">No time entries yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-background-elevated border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-3">Need Help?</h3>
            <p className="text-text-secondary mb-4">
              If you have any questions about your projects or need to get in touch with your service provider, 
              please contact them directly.
            </p>
            <div className="flex items-center gap-4">
              <button className="btn btn-secondary btn-sm">
                <FiDownload size={16} />
                Download Report
              </button>
              <button className="btn btn-ghost btn-sm">
                Contact Provider
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

export async function getServerSideProps({ params }) {
  return {
    props: {
      token: params.token,
    },
  }
}
