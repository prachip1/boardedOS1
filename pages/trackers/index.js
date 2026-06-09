import { useEffect, useMemo, useState } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiLoader,
  FiCalendar,
  FiClock,
  FiTag,
  FiTrendingUp,
} from 'react-icons/fi'
import { format } from 'date-fns'
import {
  getTrackers,
  createTracker,
  updateTracker,
  deleteTracker,
  getTrackerEntries,
  createTrackerEntry,
  updateTrackerEntry,
  deleteTrackerEntry,
} from '../../lib/api/trackers'

const cadenceOptions = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'daily', label: 'Daily' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'ad_hoc', label: 'Ad-hoc' },
  { value: 'custom', label: 'Custom' },
]

const trackerTemplates = [
  {
    name: 'Weekly Shipping Log',
    cadence: 'weekly',
    description: 'Summarise what shipped, what slipped, and what is blocked every week.',
    default_unit: 'Wins',
    tags: ['delivery', 'product'],
  },
  {
    name: 'Monthly Learning Retro',
    cadence: 'monthly',
    description: 'Capture books, courses, experiments, and breakthroughs each month.',
    default_unit: 'Highlights',
    tags: ['growth', 'learning'],
  },
  {
    name: 'Custom Tracker',
    cadence: 'custom',
    custom_cadence: 'Every other Friday',
    description: 'Roll your own cadence to track clients, releases, or personal goals.',
  },
]

const getEntryTimestamp = (entry) => {
  const candidates = [entry.entry_date, entry.period_end, entry.period_start, entry.created_at, entry.updated_at]
  for (const candidate of candidates) {
    if (!candidate) continue
    const date = new Date(candidate)
    if (!Number.isNaN(date.getTime())) {
      return date
    }
  }
  return new Date(0)
}

const sortEntriesDesc = (entries) =>
  [...entries].sort((a, b) => getEntryTimestamp(b) - getEntryTimestamp(a))

const computeLastEntryAt = (entries) => {
  if (!entries || entries.length === 0) return null
  const [latest] = sortEntriesDesc(entries)
  const latestDate = getEntryTimestamp(latest)
  return latestDate ? latestDate.toISOString() : null
}

const formatDate = (date) => {
  if (!date) return '—'
  const value = typeof date === 'string' ? new Date(date) : date
  if (!value || Number.isNaN(value.getTime())) return '—'
  return format(value, 'MMM dd, yyyy')
}

const formatCadence = (tracker) => {
  if (!tracker) return '—'
  if (tracker.cadence === 'custom') {
    return tracker.custom_cadence || 'Custom cadence'
  }
  const option = cadenceOptions.find((opt) => opt.value === tracker.cadence)
  return option ? option.label : 'Ad-hoc'
}

const defaultTrackerForm = {
  name: '',
  description: '',
  cadence: 'weekly',
  custom_cadence: '',
  default_unit: '',
  color: '#6366f1',
  tags: '',
}

const defaultEntryForm = {
  title: '',
  entry_date: new Date().toISOString().slice(0, 10),
  period_start: '',
  period_end: '',
  value: '',
  unit: '',
  notes: '',
}

export default function TrackerHub() {
  const [loading, setLoading] = useState(true)
  const [trackers, setTrackers] = useState([])
  const [selectedTrackerId, setSelectedTrackerId] = useState(null)
  const [entries, setEntries] = useState([])
  const [entriesLoading, setEntriesLoading] = useState(false)
  const [error, setError] = useState(null)

  const [showTrackerModal, setShowTrackerModal] = useState(false)
  const [trackerForm, setTrackerForm] = useState(defaultTrackerForm)
  const [editingTrackerId, setEditingTrackerId] = useState(null)
  const [trackerSaving, setTrackerSaving] = useState(false)

  const [showEntryModal, setShowEntryModal] = useState(false)
  const [entryForm, setEntryForm] = useState(defaultEntryForm)
  const [editingEntryId, setEditingEntryId] = useState(null)
  const [entrySaving, setEntrySaving] = useState(false)

  const selectedTracker = useMemo(
    () => trackers.find((tracker) => tracker.id === selectedTrackerId) || null,
    [trackers, selectedTrackerId]
  )

  useEffect(() => {
    const loadTrackers = async () => {
      try {
        setLoading(true)
        const data = await getTrackers()
        setTrackers(data)
        if (data.length > 0) {
          setSelectedTrackerId((prev) => {
            if (prev && data.some((tracker) => tracker.id === prev)) {
              return prev
            }
            return data[0].id
          })
        } else {
          setSelectedTrackerId(null)
          setEntries([])
        }
        setError(null)
      } catch (err) {
        console.error('Error loading trackers', err)
        setError('Unable to load trackers. Check your Supabase setup or try again later.')
      } finally {
        setLoading(false)
      }
    }

    loadTrackers()
  }, [])

  useEffect(() => {
    const loadEntries = async () => {
      if (!selectedTrackerId) {
        setEntries([])
        return
      }
      try {
        setEntriesLoading(true)
        const trackerEntries = await getTrackerEntries(selectedTrackerId)
        setEntries(sortEntriesDesc(trackerEntries))
      } catch (err) {
        console.error('Error loading tracker entries', err)
        setError('Unable to load entries for this tracker.')
      } finally {
        setEntriesLoading(false)
      }
    }

    loadEntries()
  }, [selectedTrackerId])

  const openTrackerModal = (template = null, tracker = null) => {
    if (tracker) {
      setTrackerForm({
        name: tracker.name || '',
        description: tracker.description || '',
        cadence: tracker.cadence || 'ad_hoc',
        custom_cadence: tracker.custom_cadence || '',
        default_unit: tracker.default_unit || '',
        color: tracker.color || '#6366f1',
        tags: (tracker.tags || []).join(', '),
      })
      setEditingTrackerId(tracker.id)
    } else if (template) {
      setTrackerForm({
        name: template.name,
        description: template.description || '',
        cadence: template.cadence || 'ad_hoc',
        custom_cadence: template.custom_cadence || '',
        default_unit: template.default_unit || '',
        color: '#6366f1',
        tags: template.tags ? template.tags.join(', ') : '',
      })
      setEditingTrackerId(null)
    } else {
      setTrackerForm(defaultTrackerForm)
      setEditingTrackerId(null)
    }
    setShowTrackerModal(true)
  }

  const closeTrackerModal = () => {
    setShowTrackerModal(false)
    setTrackerForm(defaultTrackerForm)
    setEditingTrackerId(null)
  }

  const handleTrackerSubmit = async (event) => {
    event.preventDefault()
    if (!trackerForm.name.trim()) {
      alert('Please add a name for the tracker')
      return
    }

    const payload = {
      ...trackerForm,
      tags: trackerForm.tags
        ? trackerForm.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0)
        : [],
    }

    try {
      setTrackerSaving(true)
      if (editingTrackerId) {
        const updated = await updateTracker(editingTrackerId, payload)
        setTrackers((prev) =>
          prev.map((tracker) =>
            tracker.id === editingTrackerId
              ? {
                  ...tracker,
                  ...updated,
                  entries_count: tracker.entries_count,
                  last_entry_at: tracker.last_entry_at,
                }
              : tracker
          )
        )
      } else {
        const created = await createTracker(payload)
        setTrackers((prev) => [created, ...prev])
        setSelectedTrackerId(created.id)
      }
      closeTrackerModal()
    } catch (err) {
      console.error('Error saving tracker', err)
      alert('Unable to save tracker. Please try again.')
    } finally {
      setTrackerSaving(false)
    }
  }

  const handleDeleteTracker = async (tracker) => {
    if (!tracker) return
    const confirmed = confirm(`Delete tracker "${tracker.name}" and all its entries?`)
    if (!confirmed) return

    try {
      await deleteTracker(tracker.id)
      setTrackers((prev) => prev.filter((item) => item.id !== tracker.id))
      if (selectedTrackerId === tracker.id) {
        setSelectedTrackerId((prev) => {
          if (prev !== tracker.id) return prev
          const remaining = trackers.filter((item) => item.id !== tracker.id)
          return remaining.length > 0 ? remaining[0].id : null
        })
        setEntries([])
      }
    } catch (err) {
      console.error('Error deleting tracker', err)
      alert('Unable to delete tracker. Please try again.')
    }
  }

  const openEntryModal = (entry = null) => {
    if (entry) {
      setEntryForm({
        title: entry.title || '',
        entry_date: entry.entry_date || new Date().toISOString().slice(0, 10),
        period_start: entry.period_start || '',
        period_end: entry.period_end || '',
        value: entry.value ?? '',
        unit: entry.unit || selectedTracker?.default_unit || '',
        notes: entry.notes || '',
      })
      setEditingEntryId(entry.id)
    } else {
      setEntryForm({
        ...defaultEntryForm,
        unit: selectedTracker?.default_unit || '',
      })
      setEditingEntryId(null)
    }
    setShowEntryModal(true)
  }

  const closeEntryModal = () => {
    setShowEntryModal(false)
    setEntryForm(defaultEntryForm)
    setEditingEntryId(null)
  }

  const syncTrackerMeta = (trackerId, updatedEntries) => {
    const sorted = sortEntriesDesc(updatedEntries)
    const lastEntryAt = computeLastEntryAt(sorted)
    setTrackers((prev) =>
      prev.map((tracker) =>
        tracker.id === trackerId
          ? {
              ...tracker,
              entries_count: sorted.length,
              last_entry_at: lastEntryAt,
            }
          : tracker
      )
    )
  }

  const handleEntrySubmit = async (event) => {
    event.preventDefault()
    if (!selectedTracker) {
      alert('Select a tracker before adding entries')
      return
    }

    if (!entryForm.title.trim() && !entryForm.notes.trim()) {
      alert('Please add at least a title or notes for this entry')
      return
    }

    try {
      setEntrySaving(true)
      const payload = {
        ...entryForm,
        value: entryForm.value === '' ? null : entryForm.value,
      }

      if (editingEntryId) {
        const updated = await updateTrackerEntry(editingEntryId, payload)
        const updatedEntries = sortEntriesDesc(
          entries.map((entry) => (entry.id === editingEntryId ? updated : entry))
        )
        setEntries(updatedEntries)
        syncTrackerMeta(selectedTracker.id, updatedEntries)
      } else {
        const created = await createTrackerEntry(selectedTracker.id, payload)
        const updatedEntries = sortEntriesDesc([created, ...entries])
        setEntries(updatedEntries)
        syncTrackerMeta(selectedTracker.id, updatedEntries)
      }

      closeEntryModal()
    } catch (err) {
      console.error('Error saving tracker entry', err)
      alert('Unable to save entry. Please try again.')
    } finally {
      setEntrySaving(false)
    }
  }

  const handleDeleteEntry = async (entryId) => {
    if (!selectedTracker) return
    const confirmed = confirm('Delete this entry?')
    if (!confirmed) return

    try {
      await deleteTrackerEntry(entryId)
      const updatedEntries = entries.filter((entry) => entry.id !== entryId)
      setEntries(updatedEntries)
      syncTrackerMeta(selectedTracker.id, updatedEntries)
    } catch (err) {
      console.error('Error deleting tracker entry', err)
      alert('Unable to delete entry. Please try again.')
    }
  }

  const trackerStats = useMemo(() => {
    if (!trackers || trackers.length === 0) {
      return { total: 0, cadenceMap: {} }
    }
    const cadenceMap = trackers.reduce((acc, tracker) => {
      const key = tracker.cadence || 'ad_hoc'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})
    return {
      total: trackers.length,
      cadenceMap,
    }
  }, [trackers])

  return (
    <>
      <Head>
        <title>Tracker Hub - Boarded</title>
      </Head>
      <Layout>
        <div className="space-y-6 fade-in">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-text-primary">Tracker Hub</h1>
              <p className="text-text-secondary max-w-2xl">
                Spin up recurring logs for anything—weekly shipping notes, monthly retros, client updates, or team wins—and keep your narrative fresh without leaving Boarded.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn btn-secondary" onClick={() => openTrackerModal(trackerTemplates[0])}>
                <FiTrendingUp size={18} />
                Use Template
              </button>
              <button className="btn btn-primary" onClick={() => openTrackerModal()}>
                <FiPlus size={18} />
                New Tracker
              </button>
            </div>
          </div>

          {error && (
            <div className="card border border-red-500/40 bg-red-500/10 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-text-primary">Your trackers</h2>
                <span className="text-xs uppercase tracking-wide text-text-tertiary">{trackerStats.total} total</span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12 text-text-tertiary">
                  <FiLoader className="animate-spin mr-2" /> Loading trackers...
                </div>
              ) : trackers.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-text-secondary">
                  No trackers yet. Start with a template or create your own.
                </div>
              ) : (
                <div className="space-y-2">
                  {trackers.map((tracker) => (
                    <button
                      key={tracker.id}
                      onClick={() => setSelectedTrackerId(tracker.id)}
                      className={`w-full rounded-lg border p-4 text-left transition-all duration-200 ${
                        tracker.id === selectedTrackerId
                          ? 'border-accent bg-accent/10 shadow-sm'
                          : 'border-border hover:bg-background-tertiary'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-text-primary">{tracker.name}</p>
                          <p className="text-xs text-text-tertiary">{formatCadence(tracker)}</p>
                        </div>
                        <span className="rounded-full bg-background-tertiary px-2 py-1 text-xs text-text-secondary">
                          {tracker.entries_count || 0} entries
                        </span>
                      </div>
                      {tracker.tags && tracker.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {tracker.tags.map((tag) => (
                            <span key={tag} className="badge badge-muted text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {tracker.last_entry_at && (
                        <p className="mt-3 flex items-center gap-1 text-xs text-text-tertiary">
                          <FiClock size={12} /> Last update {formatDate(tracker.last_entry_at)}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {Object.keys(trackerStats.cadenceMap).length > 0 && (
                <div className="mt-6 rounded-lg bg-background-tertiary p-4 text-xs text-text-secondary space-y-1">
                  <p className="font-medium text-text-primary text-sm">Cadences in play</p>
                  {Object.entries(trackerStats.cadenceMap).map(([cadence, count]) => (
                    <p key={cadence} className="flex justify-between">
                      <span>{formatCadence({ cadence })}</span>
                      <span>{count}</span>
                    </p>
                  ))}
                </div>
              )}
            </div>

            <div className="md:col-span-2 space-y-4">
              <div className="card p-6 min-h-[320px]">
                {selectedTracker ? (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-1">
                        <h2 className="text-xl font-semibold text-text-primary">{selectedTracker.name}</h2>
                        <p className="text-sm text-text-secondary max-w-2xl">
                          {selectedTracker.description || 'No description yet. Add context so everyone knows what to log.'}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-text-tertiary">
                          <span className="flex items-center gap-1">
                            <FiCalendar size={12} /> {formatCadence(selectedTracker)}
                          </span>
                          {selectedTracker.default_unit && (
                            <span className="flex items-center gap-1">
                              <FiTag size={12} /> Default unit {selectedTracker.default_unit}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <FiClock size={12} /> {selectedTracker.entries_count || 0} logged
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button className="btn btn-secondary btn-sm" onClick={() => openTrackerModal(null, selectedTracker)}>
                          <FiEdit2 size={16} /> Edit tracker
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEntryModal()}>
                          <FiPlus size={16} /> Add entry
                        </button>
                        <button
                          className="btn btn-tertiary btn-sm text-red-400 hover:text-red-300"
                          onClick={() => handleDeleteTracker(selectedTracker)}
                        >
                          <FiTrash2 size={16} /> Delete
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-border pt-4">
                      {entriesLoading ? (
                        <div className="flex items-center justify-center py-12 text-text-tertiary">
                          <FiLoader className="mr-2 animate-spin" /> Loading entries...
                        </div>
                      ) : entries.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-text-secondary">
                          Nothing logged yet. Add your first entry to kick this tracker off.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {entries.map((entry) => (
                            <div
                              key={entry.id}
                              className="rounded-lg bg-background-elevated p-4 transition-all duration-200 hover:bg-background-tertiary"
                            >
                              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-text-primary">
                                      {entry.title || 'Untitled entry'}
                                    </p>
                                    {entry.unit && entry.value !== null && entry.value !== undefined && (
                                      <span className="badge badge-muted text-xs">
                                        {entry.value} {entry.unit}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-text-tertiary mt-1 flex items-center gap-1">
                                    <FiCalendar size={12} /> Logged {formatDate(entry.entry_date)}
                                    {entry.period_start && entry.period_end && (
                                      <span className="ml-3">
                                        Span {formatDate(entry.period_start)} – {formatDate(entry.period_end)}
                                      </span>
                                    )}
                                  </p>
                                  {entry.notes && (
                                    <p className="mt-3 whitespace-pre-wrap text-sm text-text-secondary">
                                      {entry.notes}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <button className="btn btn-tertiary btn-xs" onClick={() => openEntryModal(entry)}>
                                    <FiEdit2 size={14} />
                                  </button>
                                  <button
                                    className="btn btn-tertiary btn-xs text-red-400 hover:text-red-300"
                                    onClick={() => handleDeleteEntry(entry.id)}
                                  >
                                    <FiTrash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-text-secondary">
                    <p className="text-lg font-medium text-text-primary">Create your first tracker</p>
                    <p className="max-w-md text-sm">
                      Capture weekly shipping logs, monthly retros, or any other recurring update. Templates help you start fast, and entries stay alongside the rest of your workspace.
                    </p>
                    <button className="btn btn-primary" onClick={() => openTrackerModal(trackerTemplates[0])}>
                      Get started
                    </button>
                  </div>
                )}
              </div>

              <div className="card p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-3">Templates</h3>
                <div className="grid gap-3 md:grid-cols-3">
                  {trackerTemplates.map((template) => (
                    <div key={template.name} className="rounded-xl border border-border bg-background-elevated p-4">
                      <p className="text-sm font-semibold text-text-primary">{template.name}</p>
                      <p className="mt-1 text-xs uppercase tracking-wide text-accent">
                        {formatCadence(template)}
                      </p>
                      <p className="mt-2 text-sm text-text-secondary">
                        {template.description}
                      </p>
                      <button className="btn btn-tertiary btn-sm mt-4" onClick={() => openTrackerModal(template)}>
                        Use template
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>

      {/* Tracker Modal */}
      {showTrackerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-text-primary">
                {editingTrackerId ? 'Edit tracker' : 'New tracker'}
              </h2>
              <button className="btn btn-tertiary btn-sm" onClick={closeTrackerModal}>
                Close
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleTrackerSubmit}>
              <div>
                <label className="form-label">Tracker name</label>
                <input
                  type="text"
                  className="input"
                  value={trackerForm.name}
                  onChange={(event) => setTrackerForm({ ...trackerForm, name: event.target.value })}
                  placeholder="Weekly shipping log"
                />
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea
                  className="input resize-none"
                  rows={3}
                  value={trackerForm.description}
                  onChange={(event) => setTrackerForm({ ...trackerForm, description: event.target.value })}
                  placeholder="What should contributors capture each cycle?"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="form-label">Cadence</label>
                  <select
                    className="select"
                    value={trackerForm.cadence}
                    onChange={(event) => setTrackerForm({ ...trackerForm, cadence: event.target.value })}
                  >
                    {cadenceOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                {trackerForm.cadence === 'custom' && (
                  <div>
                    <label className="form-label">Custom cadence</label>
                    <input
                      type="text"
                      className="input"
                      value={trackerForm.custom_cadence}
                      onChange={(event) => setTrackerForm({ ...trackerForm, custom_cadence: event.target.value })}
                      placeholder="e.g. Every other Friday"
                    />
                  </div>
                )}
                <div>
                  <label className="form-label">Default unit</label>
                  <input
                    type="text"
                    className="input"
                    value={trackerForm.default_unit}
                    onChange={(event) => setTrackerForm({ ...trackerForm, default_unit: event.target.value })}
                    placeholder="e.g. Wins, Highlights, Hours"
                  />
                </div>
                <div>
                  <label className="form-label">Tags</label>
                  <input
                    type="text"
                    className="input"
                    value={trackerForm.tags}
                    onChange={(event) => setTrackerForm({ ...trackerForm, tags: event.target.value })}
                    placeholder="Comma separated: delivery, sharing"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button type="button" className="btn btn-tertiary" onClick={closeTrackerModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={trackerSaving}>
                  {trackerSaving ? 'Saving…' : editingTrackerId ? 'Save changes' : 'Create tracker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Entry Modal */}
      {showEntryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-text-primary">
                {editingEntryId ? 'Edit entry' : 'New entry'}
              </h2>
              <button className="btn btn-tertiary btn-sm" onClick={closeEntryModal}>
                Close
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleEntrySubmit}>
              <div>
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="input"
                  value={entryForm.title}
                  onChange={(event) => setEntryForm({ ...entryForm, title: event.target.value })}
                  placeholder="What happened this cycle?"
                />
              </div>
              <div>
                <label className="form-label">Summary / Notes</label>
                <textarea
                  className="input resize-none"
                  rows={4}
                  value={entryForm.notes}
                  onChange={(event) => setEntryForm({ ...entryForm, notes: event.target.value })}
                  placeholder="Wins, blockers, metrics, next steps…"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="form-label">Entry date</label>
                  <input
                    type="date"
                    className="input"
                    value={entryForm.entry_date}
                    onChange={(event) => setEntryForm({ ...entryForm, entry_date: event.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Value</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="any"
                      className="input"
                      value={entryForm.value}
                      onChange={(event) => setEntryForm({ ...entryForm, value: event.target.value })}
                      placeholder="e.g. 5"
                    />
                    <input
                      type="text"
                      className="input"
                      value={entryForm.unit}
                      onChange={(event) => setEntryForm({ ...entryForm, unit: event.target.value })}
                      placeholder="Unit"
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label">Period start (optional)</label>
                  <input
                    type="date"
                    className="input"
                    value={entryForm.period_start}
                    onChange={(event) => setEntryForm({ ...entryForm, period_start: event.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Period end (optional)</label>
                  <input
                    type="date"
                    className="input"
                    value={entryForm.period_end}
                    onChange={(event) => setEntryForm({ ...entryForm, period_end: event.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button type="button" className="btn btn-tertiary" onClick={closeEntryModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={entrySaving}>
                  {entrySaving ? 'Saving…' : editingEntryId ? 'Save changes' : 'Add entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}


