import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../../components/Layout'
import { FiArrowLeft, FiSave, FiX, FiFileText, FiLoader, FiZap } from 'react-icons/fi'
import { createContract } from '../../lib/api/contracts'
import { getClients } from '../../lib/api/clients'
import {
  contractTemplates,
  CONTRACT_TYPES,
  getFieldsForType,
  getDefaultContent,
} from '../../lib/contract-templates'

const TAB_TEMPLATE = 'template'
const TAB_BLANK = 'blank'

const initialFormState = {
  title: '',
  type: CONTRACT_TYPES.service_agreement,
  client_id: '',
  amount: '',
  start_date: '',
  end_date: '',
  payment_terms: '',
  deliverables: '',
  terms: '',
  content: '',
  // NDA
  effective_date: '',
  term_months: '',
  confidential_scope: '',
  exclusions: '',
  // Retainer / SOW / Consulting
  scope_summary: '',
  objectives: '',
  timeline: '',
  rate_type: '',
}

export default function NewContract() {
  const router = useRouter()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState(TAB_TEMPLATE)
  const [formData, setFormData] = useState(initialFormState)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      const data = await getClients()
      setClients(data)
    } catch (error) {
      console.error('Error loading clients:', error)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const selectTemplate = (type) => {
    setFormData((prev) => ({ ...initialFormState, ...prev, type }))
  }

  const selectedClient = clients.find((c) => c.id === formData.client_id)
  const clientName = selectedClient?.name || ''

  const handleGenerateAI = async () => {
    setAiError('')
    const prompt = tab === TAB_BLANK ? aiPrompt : formData.terms || aiPrompt
    if (!prompt.trim()) {
      setAiError('Describe what you need (e.g. "NDA for a software client, 12 month term")')
      return
    }
    setAiLoading(true)
    try {
      const res = await fetch('/api/contracts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          templateType: formData.type,
          context: { clientName, title: formData.title },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      if (tab === TAB_BLANK) {
        setFormData((prev) => ({ ...prev, content: data.content }))
      } else {
        setFormData((prev) => ({ ...prev, terms: data.content }))
      }
    } catch (err) {
      setAiError(err.message || 'Failed to generate')
    } finally {
      setAiLoading(false)
    }
  }

  const buildContent = () => {
    if (tab === TAB_BLANK && formData.content) return formData.content
    const type = formData.type
    const values = {
      start_date: formData.start_date,
      end_date: formData.end_date,
      amount: formData.amount,
      payment_terms: formData.payment_terms,
      deliverables: formData.deliverables,
      terms: formData.terms,
      effective_date: formData.effective_date,
      term_months: formData.term_months,
      confidential_scope: formData.confidential_scope,
      exclusions: formData.exclusions,
      scope_summary: formData.scope_summary,
      objectives: formData.objectives,
      timeline: formData.timeline,
      rate_type: formData.rate_type,
    }
    return getDefaultContent(type, values, clientName) || formData.terms || ''
  }

  const handleSubmit = async (e, status = 'pending') => {
    e.preventDefault()
    setLoading(true)
    try {
      const content = buildContent()
      await createContract({
        title: formData.title,
        type: formData.type,
        client_id: formData.client_id || null,
        amount: formData.amount ? parseFloat(formData.amount) : null,
        payment_terms: formData.payment_terms || null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        deliverables: formData.deliverables || null,
        terms: formData.terms || null,
        content: content || null,
        status,
      })
      router.push('/contracts')
    } catch (error) {
      console.error('Error creating contract:', error)
      alert('Failed to create contract')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDraft = (e) => {
    e.preventDefault()
    handleSubmit(e, 'draft')
  }

  const fields = getFieldsForType(formData.type)
  const isBlank = tab === TAB_BLANK

  const renderField = (field) => {
    const common = {
      name: field.name,
      value: formData[field.name] ?? '',
      onChange: handleChange,
      disabled: loading,
      className: field.type === 'textarea' ? 'textarea' : 'input',
    }
    if (field.type === 'textarea') {
      return (
        <textarea
          {...common}
          rows={field.rows || 4}
          placeholder={field.placeholder}
          required={field.required}
        />
      )
    }
    if (field.type === 'select') {
      return (
        <select {...common} className="select">
          <option value="">Select...</option>
          {(field.options || []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )
    }
    if (field.type === 'currency') {
      return (
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">$</span>
          <input
            type="number"
            {...common}
            className="input pl-8"
            placeholder="0.00"
          />
        </div>
      )
    }
    if (field.type === 'date' || field.type === 'number') {
      return <input type={field.type} {...common} placeholder={field.placeholder} />
    }
    return <input type="text" {...common} placeholder={field.placeholder} required={field.required} />
  }

  return (
    <>
      <Head>
        <title>New Contract - Boarded</title>
      </Head>
      <Layout>
        <div className="max-w-4xl mx-auto space-y-6 fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/contracts" className="text-text-secondary hover:text-text-primary transition-colors">
                <FiArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-2xl font-semibold text-text-primary">New Contract</h1>
                <p className="text-text-secondary text-sm">Create from a template or from blank with AI</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="card">
            <div className="flex gap-2 border-b border-border pb-2 mb-4">
              <button
                type="button"
                onClick={() => { setTab(TAB_TEMPLATE); setFormData((p) => ({ ...initialFormState, ...p, type: p.type === CONTRACT_TYPES.blank ? CONTRACT_TYPES.service_agreement : p.type })); setAiError('') }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === TAB_TEMPLATE ? 'bg-accent/20 text-accent' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                From template
              </button>
              <button
                type="button"
                onClick={() => { setTab(TAB_BLANK); setFormData((p) => ({ ...initialFormState, ...p, type: CONTRACT_TYPES.blank })); setAiError('') }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === TAB_BLANK ? 'bg-accent/20 text-accent' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Create from blank
              </button>
            </div>

            {tab === TAB_TEMPLATE && (
              <>
                <h2 className="text-lg font-semibold text-text-primary mb-3">Choose a template</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {contractTemplates.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => selectTemplate(t.value)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        formData.type === t.value ? 'border-accent bg-accent/5' : 'border-border hover:border-border-hover'
                      }`}
                    >
                      <FiFileText size={20} className={formData.type === t.value ? 'text-accent' : 'text-text-secondary'} />
                      <p className="text-sm font-medium text-text-primary mt-2">{t.label}</p>
                      <p className="text-xs text-text-tertiary mt-1">{t.description}</p>
                    </button>
                  ))}
                </div>
              </>
            )}

            {tab === TAB_BLANK && (
              <div className="rounded-lg bg-background-elevated/50 border border-border p-4">
                <p className="text-sm text-text-secondary">
                  Start from scratch. Describe what you need in the box below and use <strong>Generate with AI</strong> to create the contract, or paste your own draft.
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Common: Title & Client */}
            <div className="card space-y-4">
              <h2 className="text-lg font-semibold text-text-primary">Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-2">Contract Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="input"
                    placeholder={isBlank ? 'e.g., NDA with Acme Inc' : 'e.g., Website Development Agreement'}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-2">Client</label>
                  <select name="client_id" value={formData.client_id} onChange={handleChange} className="select">
                    <option value="">Select a client (optional)</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Template-specific fields (or blank content) */}
            {tab === TAB_TEMPLATE && formData.type !== CONTRACT_TYPES.blank && (
              <div className="card space-y-4">
                <h2 className="text-lg font-semibold text-text-primary">
                  {contractTemplates.find((t) => t.value === formData.type)?.label || formData.type} – Fields
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fields.map((field) => (
                    <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                      <label className="block text-sm font-medium text-text-primary mb-2">{field.label}</label>
                      {renderField(field)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === TAB_BLANK && (
              <div className="card space-y-4">
                <h2 className="text-lg font-semibold text-text-primary">Contract content</h2>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Generate with AI</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      className="input flex-1"
                      placeholder="e.g., Standard NDA for a 12-month consulting engagement, include termination clause"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateAI}
                      disabled={aiLoading}
                      className="btn btn-primary whitespace-nowrap"
                    >
                      {aiLoading ? <FiLoader className="animate-spin" size={18} /> : <FiZap size={18} />}
                      Generate
                    </button>
                  </div>
                  {aiError && <p className="text-sm text-red-500 mb-2">{aiError}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Content (edit or paste)</label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    className="textarea w-full"
                    rows={12}
                    placeholder="Generated content will appear here, or paste your own contract..."
                  />
                </div>
              </div>
            )}

            {/* AI assist for template flow */}
            {tab === TAB_TEMPLATE && formData.type !== CONTRACT_TYPES.blank && (
              <div className="card space-y-3">
                <h2 className="text-lg font-semibold text-text-primary">AI assist (optional)</h2>
                <p className="text-sm text-text-secondary">
                  Describe any extra clauses or changes; we’ll generate text and put it in Terms.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="input flex-1"
                    placeholder="e.g., Add a 30-day termination notice and liability cap"
                  />
                  <button type="button" onClick={handleGenerateAI} disabled={aiLoading} className="btn btn-secondary whitespace-nowrap">
                    {aiLoading ? <FiLoader className="animate-spin" size={18} /> : <FiZap size={18} />}
                    Generate
                  </button>
                </div>
                {aiError && <p className="text-sm text-red-500">{aiError}</p>}
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <Link href="/contracts" className="btn btn-secondary">
                <FiX size={18} />
                Cancel
              </Link>
              <button type="button" onClick={handleSaveDraft} disabled={loading} className="btn btn-secondary">
                {loading ? <FiLoader className="animate-spin" size={18} /> : <FiSave size={18} />}
                Save as Draft
              </button>
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? <FiLoader className="animate-spin" size={18} /> : <FiFileText size={18} />}
                Generate & Send
              </button>
            </div>
          </form>
        </div>
      </Layout>
    </>
  )
}
