import { supabase } from '../supabase'

/**
 * API functions for Time Tracking module
 */

// Get all time entries
export const getTimeEntries = async (filters = {}) => {
  let query = supabase
    .from('time_entries')
    .select(`
      *,
      client:clients(id, name),
      project:projects(id, name)
    `)

  // Apply filters
  if (filters.clientId) {
    query = query.eq('client_id', filters.clientId)
  }
  if (filters.projectId) {
    query = query.eq('project_id', filters.projectId)
  }
  if (filters.startDate) {
    query = query.gte('date', filters.startDate)
  }
  if (filters.endDate) {
    query = query.lte('date', filters.endDate)
  }
  if (filters.billable !== undefined) {
    query = query.eq('billable', filters.billable)
  }

  const { data, error } = await query.order('start_time', { ascending: false })

  if (error) throw error
  return data
}

// Get time entries for a specific week
export const getWeekTimeEntries = async (weekStart, weekEnd) => {
  const { data, error} = await supabase
    .from('time_entries')
    .select(`
      *,
      client:clients(id, name),
      project:projects(id, name)
    `)
    .gte('date', weekStart)
    .lte('date', weekEnd)
    .order('start_time', { ascending: false })

  if (error) throw error
  return data
}

// Get a single time entry
export const getTimeEntry = async (id) => {
  const { data, error } = await supabase
    .from('time_entries')
    .select(`
      *,
      client:clients(id, name),
      project:projects(id, name)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// Create a time entry
export const createTimeEntry = async (entryData) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('time_entries')
    .insert([{
      ...entryData,
      user_id: user.id,
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

// Update a time entry
export const updateTimeEntry = async (id, entryData) => {
  const { data, error } = await supabase
    .from('time_entries')
    .update(entryData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Delete a time entry
export const deleteTimeEntry = async (id) => {
  const { error } = await supabase
    .from('time_entries')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Start a timer (create entry with end_time null)
export const startTimer = async (clientId, projectId, task, notes = '') => {
  const { data: { user } } = await supabase.auth.getUser()
  const now = new Date()
  
  const { data, error } = await supabase
    .from('time_entries')
    .insert([{
      user_id: user.id,
      client_id: clientId,
      project_id: projectId,
      task,
      notes,
      start_time: now.toISOString(),
      end_time: null,
      date: now.toISOString().split('T')[0],
      billable: true,
      is_private: false,
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

// Stop a running timer
export const stopTimer = async (id) => {
  const now = new Date()
  
  // Get the entry to calculate duration
  const { data: entry } = await supabase
    .from('time_entries')
    .select('start_time')
    .eq('id', id)
    .single()

  if (!entry) throw new Error('Timer not found')

  const startTime = new Date(entry.start_time)
  const duration = Math.floor((now - startTime) / 1000) // in seconds

  const { data, error } = await supabase
    .from('time_entries')
    .update({
      end_time: now.toISOString(),
      duration,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Get active timer (if any)
export const getActiveTimer = async () => {
  const { data, error } = await supabase
    .from('time_entries')
    .select(`
      *,
      client:clients(id, name),
      project:projects(id, name)
    `)
    .is('end_time', null)
    .order('start_time', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
  return data || null
}

// Get time tracking statistics
export const getTimeStats = async (startDate, endDate) => {
  const { data, error } = await supabase
    .from('time_entries')
    .select('duration, billable, date')
    .gte('date', startDate)
    .lte('date', endDate)
    .not('duration', 'is', null)

  if (error) throw error

  const totalSeconds = data.reduce((sum, entry) => sum + (entry.duration || 0), 0)
  const billableSeconds = data.filter(e => e.billable).reduce((sum, entry) => sum + (entry.duration || 0), 0)

  return {
    totalHours: totalSeconds / 3600,
    billableHours: billableSeconds / 3600,
    nonBillableHours: (totalSeconds - billableSeconds) / 3600,
    totalEntries: data.length,
  }
}

// Get time by client
export const getTimeByClient = async (startDate, endDate) => {
  const { data, error } = await supabase
    .from('time_entries')
    .select(`
      duration,
      billable,
      client:clients(id, name)
    `)
    .gte('date', startDate)
    .lte('date', endDate)
    .not('duration', 'is', null)

  if (error) throw error

  // Group by client
  const grouped = data.reduce((acc, entry) => {
    const clientName = entry.client?.name || 'No Client'
    if (!acc[clientName]) {
      acc[clientName] = {
        totalSeconds: 0,
        billableSeconds: 0,
      }
    }
    acc[clientName].totalSeconds += entry.duration || 0
    if (entry.billable) {
      acc[clientName].billableSeconds += entry.duration || 0
    }
    return acc
  }, {})

  return Object.keys(grouped).map(clientName => ({
    clientName,
    totalHours: grouped[clientName].totalSeconds / 3600,
    billableHours: grouped[clientName].billableSeconds / 3600,
  }))
}

