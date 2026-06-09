import { supabase } from '../supabase'

/**
 * Get all contracts for the current user
 */
export async function getContracts() {
  const { data, error } = await supabase
    .from('contracts')
    .select(`
      *,
      client:clients(id, name, email)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Get a single contract by ID
 */
export async function getContract(contractId) {
  const { data, error } = await supabase
    .from('contracts')
    .select(`
      *,
      client:clients(id, name, email, company)
    `)
    .eq('id', contractId)
    .single()

  if (error) throw error
  return data
}

/**
 * Create a new contract
 * type 'blank' is stored as 'custom'
 */
export async function createContract(contractData) {
  const dbType = contractData.type === 'blank' ? 'custom' : contractData.type
  const { data, error } = await supabase
    .from('contracts')
    .insert([{
      title: contractData.title,
      type: dbType,
      client_id: contractData.client_id || null,
      content: contractData.content || null,
      amount: contractData.amount || null,
      payment_terms: contractData.payment_terms || null,
      start_date: contractData.start_date || null,
      end_date: contractData.end_date || null,
      deliverables: contractData.deliverables || null,
      terms: contractData.terms || null,
      status: contractData.status || 'draft',
    }])
    .select(`
      *,
      client:clients(id, name, email)
    `)
    .single()

  if (error) throw error
  return data
}

/**
 * Update a contract
 */
export async function updateContract(contractId, updates) {
  const { data, error } = await supabase
    .from('contracts')
    .update(updates)
    .eq('id', contractId)
    .select(`
      *,
      client:clients(id, name, email)
    `)
    .single()

  if (error) throw error
  return data
}

/**
 * Delete a contract
 */
export async function deleteContract(contractId) {
  const { error } = await supabase
    .from('contracts')
    .delete()
    .eq('id', contractId)

  if (error) throw error
  return true
}

/**
 * Sign a contract (update status and add signature)
 */
export async function signContract(contractId, signatureData) {
  const { data, error } = await supabase
    .from('contracts')
    .update({
      status: 'signed',
      signed_at: new Date().toISOString(),
      signature_data: signatureData,
    })
    .eq('id', contractId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get contract statistics
 */
export async function getContractStats() {
  const { data, error } = await supabase
    .from('contracts')
    .select('status, amount')

  if (error) throw error

  const stats = {
    total: data.length,
    signed: data.filter(c => c.status === 'signed').length,
    pending: data.filter(c => c.status === 'pending').length,
    draft: data.filter(c => c.status === 'draft').length,
    totalValue: data.reduce((sum, c) => sum + (c.amount || 0), 0),
  }

  return stats
}
