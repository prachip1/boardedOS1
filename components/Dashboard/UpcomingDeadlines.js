import { useState, useEffect } from 'react'
import { FiCalendar, FiAlertCircle, FiCheckCircle } from 'react-icons/fi'
import { format, differenceInDays } from 'date-fns'
import { supabase } from '../../lib/supabase'

export default function UpcomingDeadlines() {
  const [deadlines, setDeadlines] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDeadlines = async () => {
      try {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        
        const now = new Date().toISOString().split('T')[0]
        
        // Get upcoming invoices, tasks, and contracts
        const [invoices, tasks, contracts] = await Promise.all([
          supabase
            .from('invoices')
            .select('id, invoice_number, due_date, status, client:clients(name)')
            .eq('user_id', user.id)
            .gte('due_date', now)
            .neq('status', 'paid')
            .order('due_date', { ascending: true })
            .limit(5),
          supabase
            .from('tasks')
            .select('id, title, due_date, status')
            .eq('user_id', user.id)
            .not('due_date', 'is', null)
            .gte('due_date', now)
            .neq('status', 'done')
            .order('due_date', { ascending: true })
            .limit(5),
          supabase
            .from('contracts')
            .select('id, title, expires_at, status, client:clients(name)')
            .eq('user_id', user.id)
            .not('expires_at', 'is', null)
            .gte('expires_at', now)
            .neq('status', 'signed')
            .order('expires_at', { ascending: true })
            .limit(5),
        ])

        const combined = []

        invoices.data?.forEach(item => {
          combined.push({
            id: `invoice-${item.id}`,
            type: 'invoice',
            title: `Invoice ${item.invoice_number}`,
            subtitle: item.client?.name || 'No client',
            date: new Date(item.due_date),
            icon: FiAlertCircle,
            color: 'text-yellow-500',
          })
        })

        tasks.data?.forEach(item => {
          combined.push({
            id: `task-${item.id}`,
            type: 'task',
            title: item.title,
            subtitle: 'Task deadline',
            date: new Date(item.due_date),
            icon: FiCheckCircle,
            color: 'text-blue-500',
          })
        })

        contracts.data?.forEach(item => {
          combined.push({
            id: `contract-${item.id}`,
            type: 'contract',
            title: item.title,
            subtitle: item.client?.name || 'No client',
            date: new Date(item.expires_at),
            icon: FiAlertCircle,
            color: 'text-orange-500',
          })
        })

        // Sort by date
        combined.sort((a, b) => a.date - b.date)
        setDeadlines(combined.slice(0, 8))
      } catch (error) {
        console.error('Error loading deadlines:', error)
        setDeadlines([])
      } finally {
        setLoading(false)
      }
    }

    loadDeadlines()
  }, [])

  const getDaysUntil = (date) => {
    const days = differenceInDays(date, new Date())
    if (days === 0) return { text: 'Today', color: 'text-red-500' }
    if (days === 1) return { text: 'Tomorrow', color: 'text-orange-500' }
    if (days <= 7) return { text: `${days} days`, color: 'text-yellow-500' }
    return { text: `${days} days`, color: 'text-text-tertiary' }
  }

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-text-primary mb-4">
        Upcoming Deadlines
      </h2>

      {loading ? (
        <div className="text-center py-6">
          <p className="text-text-secondary text-sm">Loading...</p>
        </div>
      ) : deadlines.length === 0 ? (
        <div className="text-center py-6">
          <FiCalendar className="mx-auto mb-3 text-text-tertiary" size={32} />
          <p className="text-text-secondary text-sm">No upcoming deadlines</p>
          <p className="text-text-tertiary text-xs mt-1">You&apos;re all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {deadlines.map(deadline => {
            const Icon = deadline.icon
            const daysInfo = getDaysUntil(deadline.date)

            return (
              <div key={deadline.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-background-secondary transition-colors">
                <Icon className={deadline.color} size={16} />
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {deadline.title}
                  </p>
                  <p className="text-xs text-text-tertiary truncate">
                    {deadline.subtitle}
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className={`text-xs font-medium ${daysInfo.color}`}>
                    {daysInfo.text}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {format(deadline.date, 'MMM dd')}
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
