import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import { FiSave, FiLoader, FiUpload, FiImage, FiTrash2, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import { getBusinessProfile, upsertBusinessProfile, uploadBusinessLogo } from '../../lib/api/profile'
import { CURRENCIES } from '../../lib/currencies'

export default function Settings() {
  const fileInputRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    company_name: '',
    business_email: '',
    phone: '',
    address: '',
    website: '',
    currency: 'USD',
    logo_url: '',
  })

  useEffect(() => {
    const load = async () => {
      try {
        const profile = await getBusinessProfile()
        if (profile) {
          setForm(prev => ({
            ...prev,
            company_name: profile.company_name || '',
            business_email: profile.business_email || '',
            phone: profile.phone || '',
            address: profile.address || '',
            website: profile.website || '',
            currency: profile.currency || 'USD',
            logo_url: profile.logo_url || '',
          }))
        }
      } catch (err) {
        console.error('Error loading profile:', err)
      }
    }
    load()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setSaved(false)
  }

  const handleLogoSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (PNG, JPG, or SVG).')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Logo must be smaller than 2MB.')
      return
    }

    setUploading(true)
    setError(null)
    try {
      const url = await uploadBusinessLogo(file)
      setForm(prev => ({ ...prev, logo_url: url }))
      setSaved(false)
    } catch (err) {
      setError(err.message)
      console.error('Logo upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  const removeLogo = () => {
    setForm(prev => ({ ...prev, logo_url: '' }))
    setSaved(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSaved(false)
    try {
      await upsertBusinessProfile(form)
      setSaved(true)
    } catch (err) {
      setError(err.message)
      console.error('Error saving profile:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Business Profile - Boarded</title>
      </Head>
      <Layout>
        <div className="max-w-3xl mx-auto space-y-6 fade-in">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">Business Profile</h1>
            <p className="text-text-secondary text-sm">
              Your logo and details appear on every invoice you send.
            </p>
          </div>

          {error && (
            <div className="card bg-red-500/10 border border-red-500/20">
              <div className="flex items-start gap-3">
                <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={20} />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            </div>
          )}

          {saved && (
            <div className="card bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-3">
                <FiCheckCircle className="text-green-500 flex-shrink-0" size={20} />
                <p className="text-green-400 text-sm">Business profile saved.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Logo */}
            <div className="card space-y-4">
              <h2 className="text-lg font-semibold text-text-primary">Logo</h2>
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-lg bg-background-elevated border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                  {form.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.logo_url} alt="Business logo" className="w-full h-full object-contain" />
                  ) : (
                    <FiImage className="text-text-tertiary" size={28} />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-secondary btn-sm"
                    disabled={uploading}
                  >
                    {uploading ? <FiLoader className="animate-spin" size={16} /> : <FiUpload size={16} />}
                    {uploading ? 'Uploading...' : 'Upload logo'}
                  </button>
                  {form.logo_url && (
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="btn btn-secondary btn-sm text-red-500"
                    >
                      <FiTrash2 size={16} />
                      Remove
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-text-tertiary">PNG, JPG or SVG. Max 2MB.</p>
            </div>

            {/* Business details */}
            <div className="card space-y-6">
              <h2 className="text-lg font-semibold text-text-primary">Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Business name
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    value={form.company_name}
                    onChange={handleChange}
                    className="input"
                    placeholder="Your Business Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Business email
                  </label>
                  <input
                    type="email"
                    name="business_email"
                    value={form.business_email}
                    onChange={handleChange}
                    className="input"
                    placeholder="you@business.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="input"
                    placeholder="+1 555 000 0000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Website
                  </label>
                  <input
                    type="text"
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    className="input"
                    placeholder="www.yourbusiness.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Default currency
                  </label>
                  <select
                    name="currency"
                    value={form.currency}
                    onChange={handleChange}
                    className="select"
                  >
                    {CURRENCIES.map(currency => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code} ({currency.symbol}) - {currency.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className="textarea"
                    rows="3"
                    placeholder="123 Your Street&#10;City, State 12345"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <FiLoader className="animate-spin" size={18} />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave size={18} />
                    Save Profile
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
