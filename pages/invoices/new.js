import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../../components/Layout'
import { FiArrowLeft, FiSave, FiX, FiPlus, FiTrash2, FiLoader, FiAlertCircle } from 'react-icons/fi'
import { nanoid } from 'nanoid'
import { getClients } from '../../lib/api/clients'
import { createInvoice, generateInvoiceNumber } from '../../lib/api/invoices'
import { CURRENCIES, DEFAULT_CURRENCY, getCurrencySymbol } from '../../lib/currencies'

export default function NewInvoice() {
  const router = useRouter()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    client_id: '',
    invoice_number: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: '',
    currency: DEFAULT_CURRENCY,
    tax_rate: 0,
    notes: '',
  })

  const currencySymbol = getCurrencySymbol(formData.currency)

  const [items, setItems] = useState([
    { id: nanoid(), description: '', quantity: 1, rate: 0 },
  ])

  // Load clients and generate invoice number
  useEffect(() => {
    const loadData = async () => {
      try {
        const [clientsData, nextInvoiceNumber] = await Promise.all([
          getClients(),
          generateInvoiceNumber()
        ])
        setClients(clientsData)
        setFormData(prev => ({ ...prev, invoice_number: nextInvoiceNumber }))
      } catch (err) {
        console.error('Error loading data:', err)
      }
    }
    loadData()
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const addItem = () => {
    setItems([...items, { id: nanoid(), description: '', quantity: 1, rate: 0 }])
  }

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id))
  }

  const updateItem = (id, field, value) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0)
  const taxAmount = subtotal * (parseFloat(formData.tax_rate) / 100)
  const total = subtotal + taxAmount

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Prepare line items with calculated amounts
      const lineItems = items.map(item => ({
        description: item.description,
        quantity: parseFloat(item.quantity),
        rate: parseFloat(item.rate),
        amount: parseFloat(item.quantity) * parseFloat(item.rate),
      }))

      // Create invoice
      await createInvoice({
        client_id: formData.client_id,
        invoice_number: formData.invoice_number,
        issue_date: formData.issue_date,
        due_date: formData.due_date,
        currency: formData.currency,
        tax_rate: parseFloat(formData.tax_rate),
        notes: formData.notes,
        status: 'draft',
      }, lineItems)

      router.push('/invoices')
    } catch (err) {
      setError(err.message)
      console.error('Error creating invoice:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>New Invoice - Boarded</title>
      </Head>
      <Layout>
        <div className="max-w-4xl mx-auto space-y-6 fade-in">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/invoices" className="text-text-secondary hover:text-text-primary transition-colors">
                <FiArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-2xl font-semibold text-text-primary">
                  New Invoice
                </h1>
                <p className="text-text-secondary text-sm">
                  Create a new invoice for your client
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
                  <h3 className="text-red-500 font-medium mb-1">Error creating invoice</h3>
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="card space-y-6">
              <h2 className="text-lg font-semibold text-text-primary">
                Invoice Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Client *
                  </label>
                  <select
                    name="client_id"
                    value={formData.client_id}
                    onChange={handleChange}
                    required
                    className="select"
                  >
                    <option value="">Select a client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Invoice Number *
                  </label>
                  <input
                    type="text"
                    name="invoice_number"
                    value={formData.invoice_number}
                    onChange={handleChange}
                    required
                    className="input bg-background-secondary"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Issue Date *
                  </label>
                  <input
                    type="date"
                    name="issue_date"
                    value={formData.issue_date}
                    onChange={handleChange}
                    required
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleChange}
                    required
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Currency *
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    required
                    className="select"
                  >
                    {CURRENCIES.map(currency => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code} ({currency.symbol}) - {currency.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="card space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-text-primary">
                  Line Items
                </h2>
                <button type="button" onClick={addItem} className="btn btn-secondary btn-sm">
                  <FiPlus size={16} />
                  Add Item
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-3 items-start p-3 bg-background-elevated rounded-lg">
                    <div className="col-span-12 md:col-span-5">
                      <input
                        type="text"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        className="input"
                        required
                      />
                    </div>
                    <div className="col-span-5 md:col-span-2">
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="input"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div className="col-span-5 md:col-span-2">
                      <input
                        type="number"
                        placeholder="Rate"
                        value={item.rate}
                        onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                        className="input"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div className="col-span-10 md:col-span-2 flex items-center">
                      <span className="text-sm font-semibold text-text-primary">
                        {currencySymbol}{(item.quantity * item.rate).toFixed(2)}
                      </span>
                    </div>
                    <div className="col-span-2 md:col-span-1 flex items-center justify-end">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-400 transition-colors"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="pt-4 border-t border-border space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Subtotal</span>
                  <span className="text-text-primary font-semibold">{currencySymbol}{subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-text-secondary">Tax</span>
                    <input
                      type="number"
                      name="tax_rate"
                      value={formData.tax_rate}
                      onChange={handleChange}
                      className="input w-20 h-7 px-2 text-xs"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <span className="text-text-tertiary text-xs">%</span>
                  </div>
                  <span className="text-text-primary font-semibold">{currencySymbol}{taxAmount.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between text-lg pt-2 border-t border-border">
                  <span className="text-text-primary font-semibold">Total</span>
                  <span className="text-accent font-bold">{currencySymbol}{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="card space-y-4">
              <h2 className="text-lg font-semibold text-text-primary">
                Additional Notes
              </h2>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="textarea"
                rows="4"
                placeholder="Payment terms, thank you message, etc..."
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <Link href="/invoices" className="btn btn-secondary">
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
                    Create Invoice
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
