import { supabase } from '../supabase'

const STORAGE_KEY = 'boarded_tracker_hub_v1'
const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const generateId = (prefix = 'id') => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 11)}`
}

const getLocalState = () => {
  if (typeof window === 'undefined') {
    return { trackers: [], entries: [] }
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return { trackers: [], entries: [] }
    }
    const parsed = JSON.parse(raw)
    return {
      trackers: Array.isArray(parsed.trackers) ? parsed.trackers : [],
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
    }
  } catch (error) {
    console.warn('Failed to parse tracker hub storage', error)
    return { trackers: [], entries: [] }
  }
}

const setLocalState = (state) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

const normalizeTracker = (tracker, meta) => ({
  ...tracker,
  entries_count: meta?.count ?? tracker?.entries_count ?? 0,
  last_entry_at: meta?.last_entry_at ?? tracker?.last_entry_at ?? null,
})

const buildMetaMap = (entries) => {
  const meta = {}
  entries.forEach((entry) => {
    const trackerId = entry.tracker_id
    if (!meta[trackerId]) {
      meta[trackerId] = {
        count: 0,
        last_entry_at: null,
      }
    }
    meta[trackerId].count += 1
    const timestamp = entry.created_at || entry.entry_date
    if (!meta[trackerId].last_entry_at) {
      meta[trackerId].last_entry_at = timestamp
    } else {
      const current = new Date(meta[trackerId].last_entry_at)
      const next = new Date(timestamp)
      if (next > current) {
        meta[trackerId].last_entry_at = timestamp
      }
    }
  })
  return meta
}

export const getTrackers = async () => {
  if (!supabaseConfigured) {
    const state = getLocalState()
    const meta = buildMetaMap(state.entries)
    return state.trackers
      .map((tracker) => normalizeTracker(tracker, meta[tracker.id]))
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
  }

  const { data, error } = await supabase
    .from('trackers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error

  if (!data || data.length === 0) {
    return []
  }

  const trackerIds = data.map((tracker) => tracker.id)
  const { data: entryMeta, error: entryError } = await supabase
    .from('tracker_entries')
    .select('tracker_id, created_at, entry_date')
    .in('tracker_id', trackerIds)
    .order('created_at', { ascending: false })

  if (entryError) throw entryError

  const meta = buildMetaMap(entryMeta || [])

  return data.map((tracker) => normalizeTracker(tracker, meta[tracker.id]))
}

export const getTracker = async (trackerId) => {
  if (!supabaseConfigured) {
    const state = getLocalState()
    const tracker = state.trackers.find((t) => t.id === trackerId)
    if (!tracker) return null
    const meta = buildMetaMap(state.entries.filter((entry) => entry.tracker_id === trackerId))
    return normalizeTracker(tracker, meta[trackerId])
  }

  const { data, error } = await supabase
    .from('trackers')
    .select('*')
    .eq('id', trackerId)
    .single()

  if (error) throw error
  if (!data) return null

  const { data: entryMeta, error: entryError } = await supabase
    .from('tracker_entries')
    .select('tracker_id, created_at, entry_date')
    .eq('tracker_id', trackerId)
    .order('created_at', { ascending: false })

  if (entryError) throw entryError

  const meta = buildMetaMap(entryMeta || [])
  return normalizeTracker(data, meta[trackerId])
}

export const createTracker = async (trackerData) => {
  const payload = {
    name: trackerData.name,
    description: trackerData.description || null,
    cadence: trackerData.cadence || 'ad_hoc',
    custom_cadence: trackerData.custom_cadence || null,
    default_unit: trackerData.default_unit || null,
    color: trackerData.color || '#6366f1',
    icon: trackerData.icon || 'FiBarChart2',
    tags: trackerData.tags && trackerData.tags.length > 0 ? trackerData.tags : null,
  }

  if (!supabaseConfigured) {
    const state = getLocalState()
    const tracker = {
      id: generateId('tracker'),
      ...payload,
      user_id: 'local-user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    state.trackers.push(tracker)
    setLocalState(state)
    return normalizeTracker(tracker, { count: 0, last_entry_at: null })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('trackers')
    .insert([{ ...payload, user_id: user.id }])
    .select()
    .single()

  if (error) throw error

  return normalizeTracker(data, { count: 0, last_entry_at: null })
}

export const updateTracker = async (trackerId, updates) => {
  const payload = {
    name: updates.name,
    description: updates.description || null,
    cadence: updates.cadence || 'ad_hoc',
    custom_cadence: updates.custom_cadence || null,
    default_unit: updates.default_unit || null,
    color: updates.color || '#6366f1',
    icon: updates.icon || 'FiBarChart2',
    tags: updates.tags && updates.tags.length > 0 ? updates.tags : null,
  }

  if (!supabaseConfigured) {
    const state = getLocalState()
    const index = state.trackers.findIndex((t) => t.id === trackerId)
    if (index === -1) throw new Error('Tracker not found')
    const updated = {
      ...state.trackers[index],
      ...payload,
      updated_at: new Date().toISOString(),
    }
    state.trackers[index] = updated
    setLocalState(state)
    const meta = buildMetaMap(state.entries.filter((entry) => entry.tracker_id === trackerId))
    return normalizeTracker(updated, meta[trackerId])
  }

  const { data, error } = await supabase
    .from('trackers')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', trackerId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteTracker = async (trackerId) => {
  if (!supabaseConfigured) {
    const state = getLocalState()
    state.trackers = state.trackers.filter((tracker) => tracker.id !== trackerId)
    state.entries = state.entries.filter((entry) => entry.tracker_id !== trackerId)
    setLocalState(state)
    return
  }

  const { error } = await supabase
    .from('trackers')
    .delete()
    .eq('id', trackerId)

  if (error) throw error
}

export const getTrackerEntries = async (trackerId) => {
  if (!supabaseConfigured) {
    const state = getLocalState()
    return state.entries
      .filter((entry) => entry.tracker_id === trackerId)
      .sort((a, b) => new Date(b.entry_date || b.created_at || 0) - new Date(a.entry_date || a.created_at || 0))
  }

  const { data, error } = await supabase
    .from('tracker_entries')
    .select('*')
    .eq('tracker_id', trackerId)
    .order('entry_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const createTrackerEntry = async (trackerId, entryData) => {
  const payload = {
    tracker_id: trackerId,
    title: entryData.title || null,
    notes: entryData.notes || null,
    entry_date: entryData.entry_date || new Date().toISOString().slice(0, 10),
    period_start: entryData.period_start || null,
    period_end: entryData.period_end || null,
    value: entryData.value !== undefined && entryData.value !== null && entryData.value !== '' ? Number(entryData.value) : null,
    unit: entryData.unit || null,
    metadata: entryData.metadata || null,
  }

  if (!supabaseConfigured) {
    const state = getLocalState()
    const entry = {
      id: generateId('entry'),
      ...payload,
      user_id: 'local-user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    state.entries.push(entry)
    setLocalState(state)
    return entry
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('tracker_entries')
    .insert([{ ...payload, user_id: user.id }])
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateTrackerEntry = async (entryId, updates) => {
  const payload = {
    title: updates.title || null,
    notes: updates.notes || null,
    entry_date: updates.entry_date || new Date().toISOString().slice(0, 10),
    period_start: updates.period_start || null,
    period_end: updates.period_end || null,
    value: updates.value !== undefined && updates.value !== null && updates.value !== '' ? Number(updates.value) : null,
    unit: updates.unit || null,
    metadata: updates.metadata || null,
  }

  if (!supabaseConfigured) {
    const state = getLocalState()
    const index = state.entries.findIndex((entry) => entry.id === entryId)
    if (index === -1) throw new Error('Entry not found')
    const updated = {
      ...state.entries[index],
      ...payload,
      updated_at: new Date().toISOString(),
    }
    state.entries[index] = updated
    setLocalState(state)
    return updated
  }

  const { data, error } = await supabase
    .from('tracker_entries')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', entryId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteTrackerEntry = async (entryId) => {
  if (!supabaseConfigured) {
    const state = getLocalState()
    state.entries = state.entries.filter((entry) => entry.id !== entryId)
    setLocalState(state)
    return
  }

  const { error } = await supabase
    .from('tracker_entries')
    .delete()
    .eq('id', entryId)

  if (error) throw error
}


