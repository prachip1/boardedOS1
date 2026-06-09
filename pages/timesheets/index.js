import { useState, useEffect } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import { FiDownload, FiShare2, FiCalendar, FiClock, FiEye, FiEyeOff, FiChevronLeft, FiChevronRight, FiPlus, FiX, FiSave, FiLoader } from 'react-icons/fi'
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, isSameDay } from 'date-fns'
import { getWeekTimeEntries, createTimeEntry } from '../../lib/api/time-tracking'
import { getClients } from '../../lib/api/clients'

export default function Timesheets() {
  const [selectedWeek, setSelectedWeek] = useState(new Date())
  const [filterClient, setFilterClient] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [timeEntries, setTimeEntries] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    client_id: '',
    project: '',
    task: '',
    startTime: '',
    endTime: '',
    notes: '',
    billable: true,
    isPrivate: false,
  })

  // Load timesheet data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 })
        const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 })
        
        const [entriesData, clientsData] = await Promise.all([
          getWeekTimeEntries(
            format(weekStart, 'yyyy-MM-dd'),
            format(weekEnd, 'yyyy-MM-dd')
          ),
          getClients()
        ])
        
        setTimeEntries(entriesData)
        setClients(clientsData)
      } catch (err) {
        console.error('Error loading timesheet data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [selectedWeek])

  // Old mock data removed
  const oldMockEntries = [
    {
      id: '1',
      date: new Date('2025-10-15'),
      client: 'Acme Corporation',
      project: 'Website Redesign',
      task: 'Frontend Development - Hero Section',
      duration: 7200, // 2 hours in seconds
      startTime: '09:00 AM',
      endTime: '11:00 AM',
      billable: true,
      notes: 'Implemented responsive hero section with animations',
      isPrivate: false, // Can be shared with client
    },
    {
      id: '2',
      date: new Date('2025-10-15'),
      client: 'Acme Corporation',
      project: 'Website Redesign',
      task: 'Code Review & Bug Fixes',
      duration: 3600, // 1 hour
      startTime: '02:00 PM',
      endTime: '03:00 PM',
      billable: true,
      notes: 'Fixed responsive issues on mobile devices',
      isPrivate: false,
    },
    {
      id: '3',
      date: new Date('2025-10-16'),
      client: 'Tech Startup Inc',
      project: 'Mobile App',
      task: 'UI Design - Login Screen',
      duration: 5400, // 1.5 hours
      startTime: '10:00 AM',
      endTime: '11:30 AM',
      billable: true,
      notes: 'Created new login screen mockups in Figma',
      isPrivate: false,
    },
    {
      id: '4',
      date: new Date('2025-10-16'),
      client: 'Acme Corporation',
      project: 'Website Redesign',
      task: 'Team Meeting & Planning',
      duration: 1800, // 30 mins
      startTime: '03:00 PM',
      endTime: '03:30 PM',
      billable: false,
      notes: 'Weekly sync with client team',
      isPrivate: true, // Private, won't show to client
    },
    {
      id: '5',
      date: new Date('2025-10-17'),
      client: 'Design Co',
      project: 'Brand Identity',
      task: 'Logo Concepts - Iteration 2',
      duration: 10800, // 3 hours
      startTime: '09:00 AM',
      endTime: '12:00 PM',
      billable: true,
      notes: 'Developed 5 new logo variations based on feedback',
      isPrivate: false,
    },
  ]

  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 })

  const filteredEntries = timeEntries.filter(entry => {
    const matchesClient = filterClient === 'all' || entry.client?.name === filterClient
    return matchesClient
  })

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}:${minutes.toString().padStart(2, '0')}`
  }

  const totalHours = filteredEntries.reduce((sum, entry) => sum + entry.duration, 0)
  const billableHours = filteredEntries.filter(e => e.billable).reduce((sum, entry) => sum + entry.duration, 0)

  // Group entries by date
  const groupedByDate = filteredEntries.reduce((groups, entry) => {
    const dateKey = format(entry.date, 'yyyy-MM-dd')
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(entry)
    return groups
  }, {})

  const nextWeek = () => setSelectedWeek(addWeeks(selectedWeek, 1))
  const prevWeek = () => setSelectedWeek(subWeeks(selectedWeek, 1))
  const thisWeek = () => setSelectedWeek(new Date())

  const exportTimesheet = () => {
    console.log('Exporting timesheet as PDF...')
    // TODO: Implement PDF generation
  }

  const shareTimesheet = () => {
    console.log('Generating shareable link...')
    // TODO: Implement shareable link generation
  }

  const handleAddEntry = async (e) => {
    e.preventDefault()
    
    try {
      // Calculate duration from start and end time
      const [startHour, startMin] = newEntry.startTime.split(':').map(Number)
      const [endHour, endMin] = newEntry.endTime.split(':').map(Number)
      const durationSeconds = ((endHour * 60 + endMin) - (startHour * 60 + startMin)) * 60

      await createTimeEntry({
        client_id: newEntry.client_id,
        project_id: null,
        task: newEntry.task,
        notes: newEntry.notes,
        start_time: new Date(`${newEntry.date}T${newEntry.startTime}`).toISOString(),
        end_time: new Date(`${newEntry.date}T${newEntry.endTime}`).toISOString(),
        duration: durationSeconds,
        billable: newEntry.billable,
        is_private: newEntry.isPrivate,
        date: newEntry.date,
      })
      
      // Reload data
      const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 })
      const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 })
      const entriesData = await getWeekTimeEntries(
        format(weekStart, 'yyyy-MM-dd'),
        format(weekEnd, 'yyyy-MM-dd')
      )
      setTimeEntries(entriesData)
      
      // Reset form
      setNewEntry({
        date: new Date().toISOString().split('T')[0],
        client_id: '',
        project: '',
        task: '',
        startTime: '',
        endTime: '',
        notes: '',
        billable: true,
        isPrivate: false,
      })
      setShowAddForm(false)
    } catch (err) {
      console.error('Error adding time entry:', err)
      alert('Error adding time entry')
    }
  }

  return (
    <>
      <Head>
        <title>Timesheets - Boarded</title>
      </Head>
      <Layout>
        <div className="space-y-4 fade-in">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-text-primary">Timesheets</h1>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-ghost btn-sm">
                <FiPlus size={16} />
                Add Entry
              </button>
              <button onClick={exportTimesheet} className="btn btn-ghost btn-sm">
                <FiDownload size={16} />
              </button>
              <button onClick={shareTimesheet} className="btn btn-ghost btn-sm">
                <FiShare2 size={16} />
              </button>
            </div>
          </div>

          {/* Add Entry Form */}
          {showAddForm && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-text-primary">Add Time Entry</h3>
                <button onClick={() => setShowAddForm(false)} className="text-text-tertiary hover:text-text-primary">
                  <FiX size={16} />
                </button>
              </div>
              
              <form onSubmit={handleAddEntry} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-text-secondary mb-1">Date</label>
                    <input
                      type="date"
                      value={newEntry.date}
                      onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                      className="input h-8 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-text-secondary mb-1">Client</label>
                    <select
                      value={newEntry.client_id}
                      onChange={(e) => setNewEntry({ ...newEntry, client_id: e.target.value })}
                      className="select h-8 text-sm"
                      required
                    >
                      <option value="">Select client</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-text-secondary mb-1">Project</label>
                  <input
                    type="text"
                    value={newEntry.project}
                    onChange={(e) => setNewEntry({ ...newEntry, project: e.target.value })}
                    className="input h-8 text-sm"
                    placeholder="e.g., Website Redesign"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-text-secondary mb-1">Task Description</label>
                  <input
                    type="text"
                    value={newEntry.task}
                    onChange={(e) => setNewEntry({ ...newEntry, task: e.target.value })}
                    className="input h-8 text-sm"
                    placeholder="What did you work on?"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-text-secondary mb-1">Start Time</label>
                    <input
                      type="time"
                      value={newEntry.startTime}
                      onChange={(e) => setNewEntry({ ...newEntry, startTime: e.target.value })}
                      className="input h-8 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-text-secondary mb-1">End Time</label>
                    <input
                      type="time"
                      value={newEntry.endTime}
                      onChange={(e) => setNewEntry({ ...newEntry, endTime: e.target.value })}
                      className="input h-8 text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-text-secondary mb-1">Notes (optional)</label>
                  <textarea
                    value={newEntry.notes}
                    onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                    className="textarea text-sm"
                    rows="2"
                    placeholder="Additional details..."
                  />
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newEntry.billable}
                      onChange={(e) => setNewEntry({ ...newEntry, billable: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-text-primary">Billable</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newEntry.isPrivate}
                      onChange={(e) => setNewEntry({ ...newEntry, isPrivate: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-text-primary">Private (hide from client)</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-ghost btn-sm">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    <FiSave size={14} />
                    Save Entry
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Week Navigation & Stats */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <button onClick={prevWeek} className="btn btn-ghost btn-sm">
                <FiChevronLeft size={16} />
              </button>
              <div className="text-center min-w-[200px]">
                <div className="text-sm font-medium text-text-primary">
                  {format(weekStart, 'MMM dd')} - {format(weekEnd, 'MMM dd, yyyy')}
                </div>
              </div>
              <button onClick={nextWeek} className="btn btn-ghost btn-sm">
                <FiChevronRight size={16} />
              </button>
              <button onClick={thisWeek} className="btn btn-ghost btn-sm text-xs">
                Today
              </button>
            </div>

            <div className="flex items-center gap-6">
              <select 
                value={filterClient}
                onChange={(e) => setFilterClient(e.target.value)}
                className="select w-48 h-8 text-xs"
              >
                <option value="all">All Clients</option>
                {clients.map(client => (
                  <option key={client.id} value={client.name}>
                    {client.name}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-4 text-sm">
                <div className="text-text-secondary">
                  Total: <span className="text-text-primary font-medium">{formatDuration(totalHours)}</span>
                </div>
                <div className="text-text-secondary">
                  Billable: <span className="text-text-primary font-medium">{formatDuration(billableHours)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <FiLoader className="animate-spin text-accent mx-auto mb-4" size={32} />
              <p className="text-text-secondary">Loading timesheet...</p>
            </div>
          )}

          {/* Timesheet List - Clockify Style */}
          {!loading && (
            <div className="space-y-0 border border-border rounded-lg overflow-hidden">
              {Object.keys(groupedByDate).length === 0 ? (
                <div className="text-center py-12 text-text-tertiary text-sm">
                  No entries for this week
                </div>
              ) : (
              Object.keys(groupedByDate).sort().reverse().map(dateKey => {
                const entries = groupedByDate[dateKey]
                const dayTotal = entries.reduce((sum, e) => sum + e.duration, 0)
                
                return (
                  <div key={dateKey} className="border-b border-border last:border-b-0">
                    {/* Day Header */}
                    <div className="bg-background-secondary px-4 py-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-text-primary">
                        {format(new Date(dateKey), 'EEE, MMM dd')}
                      </span>
                      <span className="text-xs font-mono text-text-secondary">
                        {formatDuration(dayTotal)}
                      </span>
                    </div>
                    
                    {/* Entries */}
                    {entries.map(entry => (
                      <div 
                        key={entry.id}
                        className="px-4 py-3 hover:bg-background-secondary transition-colors flex items-center gap-4 border-b border-border last:border-b-0"
                      >
                        {/* Task & Client */}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-text-primary truncate mb-0.5">
                            {entry.task}
                          </div>
                          <div className="text-xs text-text-tertiary">
                            {entry.client?.name || 'No client'} • {entry.project?.name || 'No project'}
                          </div>
                        </div>
                        
                        {/* Time Range */}
                        <div className="text-xs text-text-secondary w-32 text-right">
                          {format(new Date(entry.start_time), 'h:mm a')} - {format(new Date(entry.end_time), 'h:mm a')}
                        </div>
                        
                        {/* Duration */}
                        <div className="text-sm font-mono font-medium text-text-primary w-16 text-right">
                          {formatDuration(entry.duration)}
                        </div>
                        
                        {/* Icons */}
                        <div className="flex items-center gap-2 w-16">
                          {entry.billable && (
                            <div className="w-1.5 h-1.5 rounded-full bg-accent-green" title="Billable"></div>
                          )}
                          {entry.isPrivate ? (
                            <FiEyeOff size={14} className="text-text-tertiary" title="Private" />
                          ) : (
                            <FiEye size={14} className="text-text-tertiary opacity-30" title="Shareable" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })
              )}
            </div>
          )}

          {/* Simple Footer Info */}
          <div className="text-xs text-text-tertiary flex items-center gap-4">
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-green"></div> Billable
            </span>
            <span className="flex items-center gap-1">
              <FiEye size={12} /> Shareable
            </span>
            <span className="flex items-center gap-1">
              <FiEyeOff size={12} /> Private
            </span>
          </div>
        </div>
      </Layout>
    </>
  )
}

