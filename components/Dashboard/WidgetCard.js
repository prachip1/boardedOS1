import { FiUsers, FiDollarSign, FiClock, FiCheckSquare, FiTrendingUp, FiX } from 'react-icons/fi'

export default function WidgetCard({ widget, data, onRemove }) {
  const widgetConfig = {
    clients: {
      icon: FiUsers,
      color: 'text-blue-500',
      bg: 'from-blue-500/10 to-blue-500/5',
      border: 'border-blue-500/20',
      getValue: (data) => data?.clients?.active || 0,
      getLabel: (data) => {
        const total = data?.clients?.total || 0
        return total === 0 ? 'No clients yet' : `${total} total`
      }
    },
    invoices: {
      icon: FiDollarSign,
      color: 'text-green-500',
      bg: 'from-green-500/10 to-green-500/5',
      border: 'border-green-500/20',
      getValue: (data) => data?.invoices?.pending || 0,
      getLabel: (data) => {
        const total = data?.invoices?.totalPending || 0
        return total === 0 ? 'All paid' : `$${total.toLocaleString()} pending`
      }
    },
    time: {
      icon: FiClock,
      color: 'text-purple-500',
      bg: 'from-purple-500/10 to-purple-500/5',
      border: 'border-purple-500/20',
      getValue: (data) => (data?.time?.billableHours || 0).toFixed(1),
      getLabel: (data) => {
        const hours = data?.time?.billableHours || 0
        return hours === 0 ? 'No time tracked' : 'This month'
      }
    },
    revenue: {
      icon: FiDollarSign,
      color: 'text-yellow-500',
      bg: 'from-yellow-500/10 to-yellow-500/5',
      border: 'border-yellow-500/20',
      getValue: (data) => {
        const revenue = data?.invoices?.totalRevenue || 0
        return revenue === 0 ? '0' : `$${revenue.toLocaleString()}`
      },
      getLabel: () => 'Total revenue'
    },
    tasks: {
      icon: FiCheckSquare,
      color: 'text-cyan-500',
      bg: 'from-cyan-500/10 to-cyan-500/5',
      border: 'border-cyan-500/20',
      getValue: (data) => data?.tasks?.inProgress || 0,
      getLabel: (data) => {
        const total = data?.tasks?.total || 0
        const completed = data?.tasks?.completed || 0
        return total === 0 ? 'No tasks yet' : `${completed} completed`
      }
    },
    tasks_completed: {
      icon: FiCheckSquare,
      color: 'text-green-500',
      bg: 'from-green-500/10 to-green-500/5',
      border: 'border-green-500/20',
      getValue: (data) => data?.tasks?.completed || 0,
      getLabel: () => 'Completed tasks'
    },
    tasks_high_priority: {
      icon: FiTrendingUp,
      color: 'text-red-500',
      bg: 'from-red-500/10 to-red-500/5',
      border: 'border-red-500/20',
      getValue: (data) => data?.tasks?.highPriority || 0,
      getLabel: () => 'High priority'
    },
  }

  const config = widgetConfig[widget.type] || widgetConfig.clients
  const Icon = config.icon
  const value = config.getValue(data)
  const label = config.getLabel(data)

  return (
    <div className={`card bg-gradient-to-br ${config.bg} border ${config.border} group relative`}>
      {onRemove && (
        <button
          onClick={() => onRemove(widget.id)}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-background-elevated rounded"
        >
          <FiX className="text-text-tertiary hover:text-red-500" size={14} />
        </button>
      )}
      
      <div className="flex items-center justify-between mb-3">
        <Icon className={`${config.color}`} size={24} />
      </div>
      
      <h3 className="text-text-secondary text-sm mb-2 font-medium">
        {widget.title}
      </h3>
      
      <p className={`text-3xl font-bold ${config.color} mb-1`}>
        {value}
      </p>
      
      <p className="text-xs text-text-tertiary">
        {label}
      </p>
    </div>
  )
}

