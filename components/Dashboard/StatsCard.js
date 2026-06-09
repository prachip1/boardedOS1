import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi'

export default function StatsCard({ label, value, change, trend, icon: Icon, color }) {
  const colorClasses = {
    blue: 'bg-background-elevated text-text-primary',
    yellow: 'bg-background-elevated text-text-primary',
    green: 'bg-background-elevated text-text-primary',
    purple: 'bg-background-elevated text-text-primary',
  }

  const trendIcons = {
    up: <FiTrendingUp size={14} className="text-text-secondary" />,
    down: <FiTrendingDown size={14} className="text-text-secondary" />,
    neutral: <FiMinus size={14} className="text-text-tertiary" />,
  }

  return (
    <div className="card group cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon size={20} />
        </div>
        {trendIcons[trend]}
      </div>
      
      <div className="space-y-1">
        <p className="text-text-secondary text-sm">{label}</p>
        <p className="text-3xl font-semibold text-text-primary">{value}</p>
        <p className="text-xs text-text-tertiary">{change}</p>
      </div>
    </div>
  )
}

