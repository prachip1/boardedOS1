import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../../components/Layout'
import { FiArrowLeft, FiSave, FiX, FiLoader, FiAlertCircle } from 'react-icons/fi'
import { createProject } from '../../lib/api/projects'
import { getClients } from '../../lib/api/clients'

export default function NewProject() {
  const router = useRouter()
  const [clients, setClients] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    client_id: '',
    description: '',
    status: 'active',
    budget: '',
    start_date: '',
    end_date: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    getClients()
      .then(setClients)
      .catch(err => console.error('Error loading clients:', err))
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const project = await createProject(formData)
      router.push(`/projects/${project.id}`)
    } catch (err) {
      setError(err.message)
      console.error('Error creating project:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>New Project - Boarded</title>
      </Head>
      <Layout>
        <div className="max-w-3xl mx-auto space-y-6 fade-in">
          <div className="flex items-center gap-4">
            <Link href="/projects" className="text-text-secondary hover:text-text-primary transition-colors">
              <FiArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-text-primary">New Project</h1>
              <p className="text-text-secondary text-sm">Set up a project and invite collaborators after</p>
            </div>
          </div>

          {error && (
            <div className="card bg-red-500/10 border border-red-500/20">
              <div className="flex items-start gap-3">
                <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={20} />
                <div>
                  <h3 className="text-red-500 font-medium mb-1">Error creating project</h3>
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="card space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-2">Project Name *</label>
                  <input
                    type="text" name="name" value={formData.name} onChange={handleChange}
                    required className="input" placeholder="Website Redesign"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Client</label>
                  <select name="client_id" value={formData.client_id} onChange={handleChange} className="input">
                    <option value="">No client</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}{c.company ? ` — ${c.company}` : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Status</label>
                  <select name="status" value={formData.status} onChange={handleChange} className="input">
                    <option value="active">Active</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Budget</label>
                  <input
                    type="number" name="budget" value={formData.budget} onChange={handleChange}
                    min="0" step="0.01" className="input" placeholder="5000"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Start Date</label>
                    <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} className="input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">End Date</label>
                    <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} className="input" />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-2">Description</label>
                  <textarea
                    name="description" value={formData.description} onChange={handleChange}
                    className="textarea" rows="4" placeholder="What is this project about?"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Link href="/projects" className="btn btn-secondary">
                <FiX size={18} />
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <><FiLoader className="animate-spin" size={18} /> Creating...</>
                ) : (
                  <><FiSave size={18} /> Create Project</>
                )}
              </button>
            </div>
          </form>
        </div>
      </Layout>
    </>
  )
}
