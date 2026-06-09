import { FiPlus, FiUserPlus, FiFileText, FiDollarSign, FiClock } from 'react-icons/fi'
import Link from 'next/link'

export default function QuickActions() {
  const actions = [
    { label: 'New Client', icon: FiUserPlus, href: '/clients/new', color: 'blue' },
    { label: 'Create Invoice', icon: FiDollarSign, href: '/invoices/new', color: 'yellow' },
    { label: 'New Contract', icon: FiFileText, href: '/contracts/new', color: 'purple' },
    { label: 'Start Timer', icon: FiClock, href: '/time-tracking', color: 'green' },
  ]

  const colorClasses = {
    blue: 'hover:bg-background-elevated hover:text-text-primary hover:border-border-hover',
    yellow: 'hover:bg-background-elevated hover:text-text-primary hover:border-border-hover',
    green: 'hover:bg-background-elevated hover:text-text-primary hover:border-border-hover',
    purple: 'hover:bg-background-elevated hover:text-text-primary hover:border-border-hover',
  }

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h2>
      
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon
          return (
            <Link
              key={index}
              href={action.href}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-border text-text-secondary transition-all ${colorClasses[action.color]}`}
            >
              <Icon size={20} />
              <span className="text-xs font-medium">{action.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

