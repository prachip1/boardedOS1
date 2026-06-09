import { useState, useEffect } from 'react'
import { FiDollarSign, FiFileText, FiUsers, FiClock, FiMessageSquare, FiCheckSquare } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import { supabase } from '../../lib/supabase'

export default function RecentActivity() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRecentActivity = async () => {
      try {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        
        // Get recent items from different tables
        const [clients, invoices, timeEntries, tasks] = await Promise.all([
          supabase.from('clients').select('id, name, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
          supabase.from('invoices').select('id, invoice_number, created_at, client:clients(name)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
          supabase.from('time_entries').select('id, task, created_at, client:clients(name)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
          supabase.from('tasks').select('id, title, created_at, status').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
        ])

        // Combine and format activities
        const combined = []

        clients.data?.forEach(item => {
          combined.push({
            id: `client-${item.id}`,
            type: 'client',
            icon: FiUsers,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            title: 'New client added',
            description: item.name,
            time: new Date(item.created_at),
          })
        })

        invoices.data?.forEach(item => {
          combined.push({
            id: `invoice-${item.id}`,
            type: 'invoice',
            icon: FiDollarSign,
            color: 'text-green-500',
            bg: 'bg-green-500/10',
            title: 'Invoice created',
            description: `${item.invoice_number} • ${item.client?.name || 'No client'}`,
            time: new Date(item.created_at),
          })
        })

        timeEntries.data?.forEach(item => {
          combined.push({
            id: `time-${item.id}`,
            type: 'time',
            icon: FiClock,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10',
            title: 'Time logged',
            description: `${item.task} • ${item.client?.name || 'No client'}`,
            time: new Date(item.created_at),
          })
        })

        tasks.data?.forEach(item => {
          combined.push({
            id: `task-${item.id}`,
            type: 'task',
            icon: FiCheckSquare,
            color: 'text-cyan-500',
            bg: 'bg-cyan-500/10',
            title: item.status === 'done' ? 'Task completed' : 'Task created',
            description: item.title,
            time: new Date(item.created_at),
          })
        })

        // Sort by time and take top 10
        combined.sort((a, b) => b.time - a.time)
        setActivities(combined.slice(0, 10))
      } catch (error) {
        console.error('Error loading recent activity:', error)
        setActivities([])
      } finally {
        setLoading(false)
      }
    }

    loadRecentActivity()
  }, [])

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-text-primary mb-4">
        Recent Activity
      </h2>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-text-secondary text-sm">Loading activity...</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8">
          <FiMessageSquare className="mx-auto mb-3 text-text-tertiary" size={32} />
          <p className="text-text-secondary text-sm">No recent activity</p>
          <p className="text-text-tertiary text-xs mt-1">Start creating clients, invoices, or tasks!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map(activity => {
            const Icon = activity.icon

            return (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-background-secondary transition-colors">
                <div className={`w-10 h-10 rounded-lg ${activity.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={activity.color} size={18} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary mb-0.5">
                    {activity.title}
                  </p>
                  <p className="text-xs text-text-secondary truncate">
                    {activity.description}
                  </p>
                  <p className="text-xs text-text-tertiary mt-1">
                    {formatDistanceToNow(activity.time, { addSuffix: true })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
