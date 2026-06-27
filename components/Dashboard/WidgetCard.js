import { FiUsers, FiDollarSign, FiClock, FiCheckSquare, FiTrendingUp, FiX } from 'react-icons/fi'

export default function WidgetCard({ widget, data, onRemove }) {
  // Each widget gets a solid vibrant icon chip (dark glyph) from the
  // secondary palette, plus a soft same-hue glow — the color-ref look.
  const widgetConfig = {
    clients: {
      icon: FiUsers,
      chip: 'bg-accent-lavender',
      glow: 'rgba(184, 166, 255, 0.12)',
      getValue: (data) => data?.clients?.active || 0,
      getLabel: (data) => {
        const total = data?.clients?.total || 0
        return total === 0 ? 'No clients yet' : `${total} total`
      }
    },
    invoices: {
      icon: FiDollarSign,
      chip: 'bg-accent-lime',
      glow: 'rgba(199, 247, 81, 0.12)',
      getValue: (data) => data?.invoices?.pending || 0,
      getLabel: (data) => {
        const total = data?.invoices?.totalPending || 0
        return total === 0 ? 'All paid' : `$${total.toLocaleString()} pending`
      }
    },
    time: {
      icon: FiClock,
      chip: 'bg-accent-lavender',
      glow: 'rgba(184, 166, 255, 0.12)',
      getValue: (data) => (data?.time?.billableHours || 0).toFixed(1),
      getLabel: (data) => {
        const hours = data?.time?.billableHours || 0
        return hours === 0 ? 'No time tracked' : 'This month'
      }
    },
    revenue: {
      icon: FiDollarSign,
      chip: 'bg-accent-lime',
      glow: 'rgba(199, 247, 81, 0.12)',
      getValue: (data) => {
        const revenue = data?.invoices?.totalRevenue || 0
        return revenue === 0 ? '0' : `$${revenue.toLocaleString()}`
      },
      getLabel: () => 'Total revenue'
    },
    tasks: {
      icon: FiCheckSquare,
      chip: 'bg-accent-coral',
      glow: 'rgba(255, 122, 89, 0.12)',
      getValue: (data) => data?.tasks?.inProgress || 0,
      getLabel: (data) => {
        const total = data?.tasks?.total || 0
        const completed = data?.tasks?.completed || 0
        return total === 0 ? 'No tasks yet' : `${completed} completed`
      }
    },
    tasks_completed: {
      icon: FiCheckSquare,
      chip: 'bg-accent-lime',
      glow: 'rgba(199, 247, 81, 0.12)',
      getValue: (data) => data?.tasks?.completed || 0,
      getLabel: () => 'Completed tasks'
    },
    tasks_high_priority: {
      icon: FiTrendingUp,
      chip: 'bg-accent-coral',
      glow: 'rgba(255, 122, 89, 0.12)',
      getValue: (data) => data?.tasks?.highPriority || 0,
      getLabel: () => 'High priority'
    },
  }

  const config = widgetConfig[widget.type] || widgetConfig.clients
  const Icon = config.icon
  const value = config.getValue(data)
  const label = config.getLabel(data)

  return (
    <div
      className="card group relative overflow-hidden"
      style={{ boxShadow: `inset 0 0 60px ${config.glow}` }}
    >
      {onRemove && (
        <button
          onClick={() => onRemove(widget.id)}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-background-elevated rounded z-10"
        >
          <FiX className="text-text-tertiary hover:text-red-500" size={14} />
        </button>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${config.chip} text-black`}>
          <Icon size={22} />
        </div>
      </div>

      <h3 className="text-text-secondary text-sm mb-2 font-medium">
        {widget.title}
      </h3>

      <p className="text-3xl font-bold text-text-primary mb-1">
        {value}
      </p>

      <p className="text-xs text-text-tertiary">
        {label}
      </p>
    </div>
  )
}

