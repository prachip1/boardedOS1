import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi'

export default function StatsCard({ label, value, change, trend, icon: Icon, color }) {
  // Solid vibrant icon tiles with dark glyph — the color-ref pill look.
  const colorClasses = {
    blue: 'bg-accent-lavender text-black',
    yellow: 'bg-accent-yellow text-black',
    green: 'bg-accent-lime text-black',
    purple: 'bg-accent-lavender text-black',
    lime: 'bg-accent-lime text-black',
    coral: 'bg-accent-coral text-black',
    lavender: 'bg-accent-lavender text-black',
  }

  const trendIcons = {
    up: <FiTrendingUp size={14} className="text-text-secondary" />,
    down: <FiTrendingDown size={14} className="text-text-secondary" />,
    neutral: <FiMinus size={14} className="text-text-tertiary" />,
  }

  return (
    <div className="card group cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color] || colorClasses.lime}`}>
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

