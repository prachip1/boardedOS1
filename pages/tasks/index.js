import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../../components/Layout'
import { FiPlus, FiTrello, FiLoader, FiUsers, FiCheckSquare, FiFolder, FiArrowRight } from 'react-icons/fi'
import { getProjects } from '../../lib/api/projects'

const STATUS_STYLES = {
  active: 'bg-green-500/10 text-green-500',
  completed: 'bg-blue-500/10 text-blue-500',
  on_hold: 'bg-yellow-500/10 text-yellow-500',
  cancelled: 'bg-red-500/10 text-red-500',
}

/**
 * Task Boards index — Trello-style "home". Each project is a board; clicking
 * one opens that project's Kanban at /tasks/[projectId].
 */
export default function TaskBoards() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProjects()
        setProjects(data)
      } catch (err) {
        console.error('Error loading boards:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const countOf = (rel) => (Array.isArray(rel) && rel[0]?.count) || 0

  return (
    <>
      <Head>
        <title>Task Boards - Boarded</title>
      </Head>
      <Layout>
        <div className="space-y-6 fade-in">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-text-primary mb-2">Task Boards</h1>
              <p className="text-text-secondary">
                Each project has its own Kanban board. Open one to manage its tasks.
              </p>
            </div>
            <Link href="/projects/new" className="btn btn-primary">
              <FiPlus size={18} />
              New Project
            </Link>
          </div>

          {loading && (
            <div className="text-center py-16">
              <FiLoader className="animate-spin text-accent mx-auto mb-4" size={32} />
              <p className="text-text-secondary">Loading boards…</p>
            </div>
          )}

          {!loading && projects.length === 0 && (
            <div className="card text-center py-16">
              <FiTrello className="mx-auto mb-4 text-text-tertiary" size={48} />
              <p className="text-text-secondary mb-4">No projects yet — a board is created with every project.</p>
              <Link href="/projects/new" className="btn btn-primary inline-flex">
                <FiPlus size={18} />
                Create Your First Project
              </Link>
            </div>
          )}

          {!loading && projects.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/tasks/${project.id}`}
                  className="card group hover:border-accent/50 transition-all flex flex-col"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <FiTrello className="text-accent" size={20} />
                    </div>
                    {project.status && (
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${STATUS_STYLES[project.status] || 'bg-gray-500/10 text-gray-400'}`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-semibold text-text-primary mb-1 truncate">
                    {project.name}
                  </h3>
                  <p className="text-xs text-text-tertiary mb-4 flex items-center gap-1 truncate">
                    <FiFolder size={12} />
                    {project.client?.name || 'No client'}
                  </p>

                  <div className="mt-auto flex items-center justify-between text-xs text-text-tertiary">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <FiCheckSquare size={13} /> {countOf(project.tasks)} tasks
                      </span>
                      <span className="flex items-center gap-1">
                        <FiUsers size={13} /> {countOf(project.members) + 1}
                      </span>
                    </div>
                    <FiArrowRight className="text-text-tertiary group-hover:text-accent transition-colors" size={16} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Layout>
    </>
  )
}
