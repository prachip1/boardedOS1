import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../../components/Layout'
import { FiArrowLeft, FiSave, FiX, FiLoader, FiAlertCircle } from 'react-icons/fi'
import { createClient } from '../../lib/api/clients'

export default function NewClient() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    website: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await createClient(formData)
      router.push('/clients')
    } catch (err) {
      setError(err.message)
      console.error('Error creating client:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>New Client - Boarded</title>
      </Head>
      <Layout>
        <div className="max-w-3xl mx-auto space-y-6 fade-in">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/clients" className="text-text-secondary hover:text-text-primary transition-colors">
                <FiArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-2xl font-semibold text-text-primary">
                  New Client
                </h1>
                <p className="text-text-secondary text-sm">
                  Add a new client to your workspace
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="card bg-red-500/10 border border-red-500/20">
              <div className="flex items-start gap-3">
                <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={20} />
                <div>
                  <h3 className="text-red-500 font-medium mb-1">Error creating client</h3>
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="card space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-text-primary mb-4">
                  Basic Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Client Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="input"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="input"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="input"
                      placeholder="Acme Corporation"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className="input"
                      placeholder="https://example.com"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="input"
                      placeholder="123 Main St, City, State, ZIP"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      className="textarea"
                      rows="4"
                      placeholder="Any additional notes about this client..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <Link href="/clients" className="btn btn-secondary" disabled={loading}>
                <FiX size={18} />
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <FiLoader className="animate-spin" size={18} />
                    Creating...
                  </>
                ) : (
                  <>
                    <FiSave size={18} />
                    Save Client
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </Layout>
    </>
  )
}

