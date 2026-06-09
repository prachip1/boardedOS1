import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../../components/Layout'
import { FiArrowLeft, FiDownload, FiSend, FiCheck, FiLoader, FiAlertCircle } from 'react-icons/fi'
import { format } from 'date-fns'
import { getCurrencySymbol } from '../../lib/currencies'
import { getBusinessProfile } from '../../lib/api/profile'
import { getInvoice, markInvoiceAsPaid } from '../../lib/api/invoices'

const safeDate = (value, fmt) => {
  if (!value) return '—'
  const d = new Date(value)
  return isNaN(d.getTime()) ? '—' : format(d, fmt)
}

export default function InvoiceDetail() {
  const router = useRouter()
  const { id } = router.query

  const [invoice, setInvoice] = useState(null)
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [marking, setMarking] = useState(false)

  useEffect(() => {
    if (!id) return
    let active = true

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [invoiceData, profileData] = await Promise.all([
          getInvoice(id),
          getBusinessProfile().catch(() => null),
        ])
        if (!active) return
        setInvoice(invoiceData)
        setBusiness(profileData)
      } catch (err) {
        if (active) setError(err.message || 'Could not load this invoice.')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => { active = false }
  }, [id])

  const handleMarkPaid = async () => {
    setMarking(true)
    try {
      const updated = await markInvoiceAsPaid(invoice.id)
      setInvoice(prev => ({ ...prev, status: updated.status, paid_at: updated.paid_at }))
    } catch (err) {
      alert(err.message || 'Could not update the invoice.')
    } finally {
      setMarking(false)
    }
  }

  const handlePrint = () => window.print()

  const handleSend = () => {
    const email = invoice?.client?.email
    if (!email) {
      alert('This invoice has no client email on file.')
      return
    }
    const subject = encodeURIComponent(`Invoice ${invoice.invoice_number}`)
    const link = typeof window !== 'undefined' ? window.location.href : ''
    const body = encodeURIComponent(
      `Hi ${invoice.client?.name || ''},\n\n` +
      `Please find your invoice ${invoice.invoice_number} for a total of ` +
      `${getCurrencySymbol(invoice.currency)}${Number(invoice.total).toFixed(2)}.\n\n` +
      `${link ? `View it here: ${link}\n\n` : ''}` +
      `Thank you for your business.`
    )
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`
  }

  // ---- Loading / error / not-found states ----
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-24">
          <FiLoader className="animate-spin text-accent" size={28} />
        </div>
      </Layout>
    )
  }

  if (error || !invoice) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto card text-center py-12 space-y-4">
          <FiAlertCircle className="text-red-500 mx-auto" size={32} />
          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-1">Invoice not found</h2>
            <p className="text-text-secondary text-sm">{error || 'This invoice may have been deleted.'}</p>
          </div>
          <Link href="/invoices" className="btn btn-secondary inline-flex">
            <FiArrowLeft size={16} />
            Back to invoices
          </Link>
        </div>
      </Layout>
    )
  }

  const currencySymbol = getCurrencySymbol(invoice.currency)
  const items = invoice.items || []
  const subtotal = Number(invoice.subtotal) || 0
  const taxRate = Number(invoice.tax_rate) || 0
  const taxAmount = Number(invoice.tax_amount) || 0
  const total = Number(invoice.total) || 0
  const isPaid = invoice.status === 'paid'

  return (
    <>
      <Head>
        <title>{invoice.invoice_number} - Boarded</title>
      </Head>
      <Layout>
        <div className="max-w-4xl mx-auto space-y-6 fade-in">
          {/* Header (hidden in print) */}
          <div className="flex items-center justify-between no-print">
            <div className="flex items-center gap-4">
              <Link href="/invoices" className="text-text-secondary hover:text-text-primary transition-colors">
                <FiArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-2xl font-semibold text-text-primary">
                  {invoice.invoice_number}
                </h1>
                <p className="text-text-secondary text-sm">
                  {invoice.client?.name || 'No client'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handlePrint} className="btn btn-secondary">
                <FiDownload size={16} />
                Download / Print
              </button>
              <button onClick={handleSend} className="btn btn-secondary">
                <FiSend size={16} />
                Send
              </button>
              {!isPaid && (
                <button onClick={handleMarkPaid} className="btn btn-primary" disabled={marking}>
                  {marking ? <FiLoader className="animate-spin" size={16} /> : <FiCheck size={16} />}
                  Mark Paid
                </button>
              )}
            </div>
          </div>

          {/* Invoice Content */}
          <div className="card invoice-print">
            <div className="space-y-8">
              {/* Invoice Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    {business?.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={business.logo_url}
                        alt={business.company_name || 'Business logo'}
                        className="w-12 h-12 rounded-lg object-contain bg-background-elevated"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent-hover text-background rounded-lg flex items-center justify-center font-bold text-xl">
                        {(business?.company_name || 'B').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h2 className="text-xl font-bold text-text-primary">
                        {business?.company_name || 'Your Business Name'}
                      </h2>
                      {business?.website && (
                        <p className="text-sm text-text-tertiary">{business.website}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-text-secondary">
                    {business?.address && (
                      <p className="whitespace-pre-line">{business.address}</p>
                    )}
                    {business?.business_email && <p>{business.business_email}</p>}
                    {business?.phone && <p>{business.phone}</p>}
                    {!business && (
                      <p className="text-text-tertiary no-print">
                        Set up your details in Settings → Business Profile
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <h3 className="text-3xl font-bold text-text-primary mb-2">INVOICE</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-text-tertiary">Status:</span>
                      <span className={`badge ${isPaid ? 'badge-success' : 'badge-warning'}`}>
                        {invoice.status}
                      </span>
                    </div>
                    <p className="text-text-secondary">
                      <span className="text-text-tertiary">Invoice #:</span> {invoice.invoice_number}
                    </p>
                    <p className="text-text-secondary">
                      <span className="text-text-tertiary">Issue Date:</span> {safeDate(invoice.issue_date, 'MMM dd, yyyy')}
                    </p>
                    <p className="text-text-secondary">
                      <span className="text-text-tertiary">Due Date:</span> {safeDate(invoice.due_date, 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bill To */}
              <div>
                <h4 className="text-sm font-semibold text-text-tertiary mb-2">BILL TO:</h4>
                <div className="text-sm text-text-primary">
                  <p className="font-semibold mb-1">{invoice.client?.name || 'No client'}</p>
                  {invoice.client?.company && (
                    <p className="text-text-secondary">{invoice.client.company}</p>
                  )}
                  {invoice.client?.address && (
                    <p className="text-text-secondary whitespace-pre-line">{invoice.client.address}</p>
                  )}
                  {invoice.client?.email && (
                    <p className="text-text-secondary">{invoice.client.email}</p>
                  )}
                </div>
              </div>

              {/* Line Items */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b-2 border-border">
                    <tr>
                      <th className="text-left py-3 text-sm font-semibold text-text-tertiary">DESCRIPTION</th>
                      <th className="text-right py-3 text-sm font-semibold text-text-tertiary w-24">QTY</th>
                      <th className="text-right py-3 text-sm font-semibold text-text-tertiary w-32">RATE</th>
                      <th className="text-right py-3 text-sm font-semibold text-text-tertiary w-32">AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {items.map((item, idx) => {
                      const qty = Number(item.quantity) || 0
                      const rate = Number(item.rate) || 0
                      const amount = item.amount != null ? Number(item.amount) : qty * rate
                      return (
                        <tr key={item.id || idx}>
                          <td className="py-3 text-sm text-text-primary">{item.description}</td>
                          <td className="py-3 text-sm text-text-secondary text-right">{qty}</td>
                          <td className="py-3 text-sm text-text-secondary text-right">{currencySymbol}{rate.toFixed(2)}</td>
                          <td className="py-3 text-sm text-text-primary text-right font-semibold">
                            {currencySymbol}{amount.toFixed(2)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Subtotal</span>
                    <span className="text-text-primary font-semibold">{currencySymbol}{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Tax ({taxRate}%)</span>
                    <span className="text-text-primary font-semibold">{currencySymbol}{taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg pt-3 border-t-2 border-border">
                    <span className="text-text-primary font-bold">Total</span>
                    <span className="text-accent font-bold">{currencySymbol}{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div className="pt-6 border-t border-border">
                  <h4 className="text-sm font-semibold text-text-tertiary mb-2">NOTES:</h4>
                  <p className="text-sm text-text-secondary whitespace-pre-line">{invoice.notes}</p>
                </div>
              )}

              {/* Payment Status */}
              {isPaid && invoice.paid_at && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-500">
                    <FiCheck size={20} />
                    <span className="font-semibold">Paid on {safeDate(invoice.paid_at, 'MMMM dd, yyyy')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}
