import { supabase } from '../supabase'

/**
 * API functions for Invoices module
 */

// Get all invoices
export const getInvoices = async () => {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      client:clients(id, name, email, company),
      items:invoice_items(*)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Get a single invoice with line items
export const getInvoice = async (id) => {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      client:clients(id, name, email, company, address),
      items:invoice_items(*)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// Create an invoice
export const createInvoice = async (invoiceData, lineItems = []) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0)
  const taxAmount = subtotal * ((invoiceData.tax_rate || 0) / 100)
  const total = subtotal + taxAmount - (invoiceData.discount || 0)

  // Insert invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert([{
      ...invoiceData,
      user_id: user.id,
      subtotal,
      tax_amount: taxAmount,
      total,
    }])
    .select()
    .single()

  if (invoiceError) throw invoiceError

  // Insert line items
  if (lineItems.length > 0) {
    const itemsToInsert = lineItems.map(item => ({
      ...item,
      invoice_id: invoice.id,
    }))

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(itemsToInsert)

    if (itemsError) throw itemsError
  }

  return invoice
}

// Update an invoice
export const updateInvoice = async (id, invoiceData, lineItems = null) => {
  // If line items are provided, recalculate totals
  let updateData = { ...invoiceData }
  
  if (lineItems !== null) {
    const subtotal = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0)
    const taxAmount = subtotal * ((invoiceData.tax_rate || 0) / 100)
    const total = subtotal + taxAmount - (invoiceData.discount || 0)
    
    updateData = {
      ...updateData,
      subtotal,
      tax_amount: taxAmount,
      total,
    }

    // Delete existing items and insert new ones
    await supabase
      .from('invoice_items')
      .delete()
      .eq('invoice_id', id)

    if (lineItems.length > 0) {
      const itemsToInsert = lineItems.map(item => ({
        ...item,
        invoice_id: id,
      }))

      await supabase
        .from('invoice_items')
        .insert(itemsToInsert)
    }
  }

  const { data, error } = await supabase
    .from('invoices')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Delete an invoice
export const deleteInvoice = async (id) => {
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Mark invoice as paid
export const markInvoiceAsPaid = async (id) => {
  const { data, error } = await supabase
    .from('invoices')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Get overdue invoices
export const getOverdueInvoices = async () => {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      client:clients(id, name, email)
    `)
    .lt('due_date', new Date().toISOString())
    .neq('status', 'paid')
    .order('due_date', { ascending: true })

  if (error) throw error
  return data
}

// Get invoice statistics
export const getInvoiceStats = async () => {
  const { data, error } = await supabase
    .from('invoices')
    .select('status, total')

  if (error) throw error

  return {
    total: data.length,
    paid: data.filter(inv => inv.status === 'paid').length,
    pending: data.filter(inv => inv.status === 'sent').length,
    overdue: data.filter(inv => inv.status === 'overdue').length,
    totalRevenue: data
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0),
    totalPending: data
      .filter(inv => inv.status !== 'paid')
      .reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0),
  }
}

// Generate next invoice number
export const generateInvoiceNumber = async () => {
  const { data, error } = await supabase
    .from('invoices')
    .select('invoice_number')
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) throw error

  if (!data || data.length === 0) {
    return 'INV-0001'
  }

  const lastNumber = data[0].invoice_number
  const match = lastNumber.match(/INV-(\d+)/)
  
  if (match) {
    const nextNum = parseInt(match[1]) + 1
    return `INV-${String(nextNum).padStart(4, '0')}`
  }

  return 'INV-0001'
}

