import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../../components/Layout'
import { FiArrowLeft, FiDownload, FiSend, FiEdit2, FiCheckCircle, FiClock, FiLoader } from 'react-icons/fi'
import { format } from 'date-fns'
import SignatureCanvas from 'react-signature-canvas'
import { getContract, signContract } from '../../lib/api/contracts'

export default function ContractDetail() {
  const router = useRouter()
  const { id } = router.query
  const [contract, setContract] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showSignature, setShowSignature] = useState(false)
  const signatureRef = useRef(null)

  useEffect(() => {
    if (id) {
      loadContract()
    }
  }, [id, loadContract])

  const loadContract = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getContract(id)
      setContract(data)
    } catch (error) {
      console.error('Error loading contract:', error)
    } finally {
      setLoading(false)
    }
  }, [id])

  const clearSignature = () => {
    signatureRef.current?.clear()
  }

  const saveSignature = async () => {
    try {
      const signature = signatureRef.current?.toDataURL()
      await signContract(id, signature)
      setShowSignature(false)
      loadContract() // Reload to show signed status
    } catch (error) {
      console.error('Error saving signature:', error)
      alert('Failed to save signature')
    }
  }

  const downloadPDF = () => {
    // TODO: Generate PDF using jsPDF
    console.log('Downloading PDF...')
    alert('PDF generation coming soon!')
  }

  const sendForSignature = () => {
    // TODO: Send email to client
    console.log('Sending for signature...')
    alert('Email notification coming soon!')
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>Loading Contract - Boarded</title>
        </Head>
        <Layout>
          <div className="max-w-4xl mx-auto">
            <div className="card text-center py-12">
              <FiLoader className="animate-spin mx-auto mb-4 text-accent" size={48} />
              <p className="text-text-secondary">Loading contract...</p>
            </div>
          </div>
        </Layout>
      </>
    )
  }

  if (!contract) {
    return (
      <>
        <Head>
          <title>Contract Not Found - Boarded</title>
        </Head>
        <Layout>
          <div className="max-w-4xl mx-auto">
            <div className="card text-center py-12">
              <p className="text-text-secondary mb-4">Contract not found</p>
              <Link href="/contracts" className="btn btn-primary">
                Back to Contracts
              </Link>
            </div>
          </div>
        </Layout>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{contract.title} - Boarded</title>
      </Head>
      <Layout>
        <div className="max-w-4xl mx-auto space-y-6 fade-in">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/contracts" className="text-text-secondary hover:text-text-primary transition-colors">
                <FiArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-2xl font-semibold text-text-primary">
                  {contract.title}
                </h1>
                <p className="text-text-secondary text-sm capitalize">
                  {contract.type.replace(/-/g, ' ')} • {contract.client?.name || 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={downloadPDF} className="btn btn-secondary">
                <FiDownload size={16} />
                PDF
              </button>
              {contract.status === 'pending' && (
                <button onClick={sendForSignature} className="btn btn-primary">
                  <FiSend size={16} />
                  Send for Signature
                </button>
              )}
            </div>
          </div>

          {/* Status & Info */}
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-text-tertiary mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    {contract.status === 'signed' ? (
                      <>
                        <FiCheckCircle className="text-green-500" size={16} />
                        <span className="text-sm font-medium text-green-500">Signed</span>
                      </>
                    ) : (
                      <>
                        <FiClock className="text-yellow-500" size={16} />
                        <span className="text-sm font-medium text-yellow-500">Pending</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary mb-1">Amount</p>
                  <p className="text-sm font-semibold text-text-primary">{contract.amount != null ? `$${Number(contract.amount).toLocaleString()}` : '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary mb-1">Payment Terms</p>
                  <p className="text-sm text-text-primary">{contract.payment_terms || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary mb-1">Created</p>
                  <p className="text-sm text-text-primary">{format(new Date(contract.created_at), 'MMM dd, yyyy')}</p>
                </div>
              </div>
            </div>
            
            {(contract.start_date || contract.end_date) && (
              <div className="pt-4 border-t border-border flex items-center gap-6">
                {contract.start_date && (
                  <div>
                    <p className="text-xs text-text-tertiary mb-1">Start Date</p>
                    <p className="text-sm text-text-primary">{format(new Date(contract.start_date), 'MMM dd, yyyy')}</p>
                  </div>
                )}
                {contract.end_date && (
                  <div>
                    <p className="text-xs text-text-tertiary mb-1">End Date</p>
                    <p className="text-sm text-text-primary">{format(new Date(contract.end_date), 'MMM dd, yyyy')}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Contract Content */}
          <div className="card">
            <div className="prose prose-invert max-w-none">
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                {contract.title}
              </h2>
              
              <div className="mb-6">
                <p className="text-sm text-text-secondary mb-2">
                  <strong>Date:</strong> {format(new Date(contract.created_at), 'MMMM dd, yyyy')}
                </p>
                <p className="text-sm text-text-secondary mb-2">
                  <strong>Client:</strong> {contract.client?.name || 'N/A'}
                </p>
                <p className="text-sm text-text-secondary">
                  <strong>Email:</strong> {contract.client?.email || 'N/A'}
                </p>
              </div>

              {contract.content ? (
                <div className="mb-6">
                  <pre className="text-sm text-text-secondary whitespace-pre-wrap font-sans leading-relaxed">
                    {contract.content}
                  </pre>
                </div>
              ) : (
                <>
                  {contract.deliverables && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-text-primary mb-3">Deliverables</h3>
                      <pre className="text-sm text-text-secondary whitespace-pre-wrap font-sans">
                        {contract.deliverables}
                      </pre>
                    </div>
                  )}
                  {contract.terms && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-text-primary mb-3">Terms & Conditions</h3>
                      <pre className="text-sm text-text-secondary whitespace-pre-wrap font-sans leading-relaxed">
                        {contract.terms}
                      </pre>
                    </div>
                  )}
                </>
              )}

              {/* Signature Section */}
              <div className="mt-8 pt-6 border-t-2 border-border">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Signatures</h3>
                
                {contract.status === 'signed' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-background-elevated rounded-lg">
                      <p className="text-sm font-medium text-text-primary mb-2">Client Signature</p>
                      <div className="h-24 bg-background border border-border rounded flex items-center justify-center mb-2">
                        <span className="text-2xl font-signature text-text-primary">John Doe</span>
                      </div>
                      <p className="text-xs text-text-tertiary">
                        Signed on {contract.signed_at ? format(new Date(contract.signed_at), 'MMM dd, yyyy') : 'Unknown'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    {!showSignature ? (
                      <button
                        onClick={() => setShowSignature(true)}
                        className="btn btn-primary"
                      >
                        Sign Contract
                      </button>
                    ) : (
                      <div className="space-y-4">
                        <div className="border-2 border-border rounded-lg overflow-hidden">
                          <SignatureCanvas
                            ref={signatureRef}
                            canvasProps={{
                              className: 'w-full h-48 bg-background',
                            }}
                            penColor="white"
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={clearSignature} className="btn btn-secondary">
                            Clear
                          </button>
                          <button onClick={saveSignature} className="btn btn-primary">
                            <FiCheckCircle size={16} />
                            Save Signature
                          </button>
                          <button onClick={() => setShowSignature(false)} className="btn btn-ghost">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}

