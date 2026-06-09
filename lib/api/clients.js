import { supabase } from '../supabase'

/**
 * API functions for Clients module
 */

// Get all clients for the authenticated user
export const getClients = async () => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Get a single client by ID
export const getClient = async (id) => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// Create a new client
export const createClient = async (clientData) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('clients')
    .insert([{
      ...clientData,
      user_id: user.id,
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

// Update a client
export const updateClient = async (id, clientData) => {
  const { data, error } = await supabase
    .from('clients')
    .update(clientData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Delete a client
export const deleteClient = async (id) => {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Get clients with project counts
export const getClientsWithProjects = async () => {
  const { data, error } = await supabase
    .from('clients')
    .select(`
      *,
      projects:projects(count)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Search clients
export const searchClients = async (query) => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .or(`name.ilike.%${query}%,email.ilike.%${query}%,company.ilike.%${query}%`)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Get client stats
export const getClientStats = async (clientId) => {
  // Get total projects
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id, status')
    .eq('client_id', clientId)

  if (projectsError) throw projectsError

  // Get total invoices and amounts
  const { data: invoices, error: invoicesError } = await supabase
    .from('invoices')
    .select('total, status')
    .eq('client_id', clientId)

  if (invoicesError) throw invoicesError

  // Get total hours
  const { data: timeEntries, error: timeError } = await supabase
    .from('time_entries')
    .select('duration')
    .eq('client_id', clientId)

  if (timeError) throw timeError

  return {
    totalProjects: projects?.length || 0,
    activeProjects: projects?.filter(p => p.status === 'active')?.length || 0,
    totalInvoiced: invoices?.reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0) || 0,
    paidInvoices: invoices?.filter(inv => inv.status === 'paid')?.length || 0,
    totalHours: timeEntries?.reduce((sum, entry) => sum + (entry.duration || 0), 0) / 3600 || 0,
  }
}

