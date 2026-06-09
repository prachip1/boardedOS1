import Link from 'next/link'
import { FiMoreVertical } from 'react-icons/fi'
import { format } from 'date-fns'

export default function ClientList({ clients }) {
  return (
    <div className="card overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-background-elevated border-b border-border">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                Client
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                Email
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                Phone
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                Added
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {clients.map((client) => {
              const initials = client.name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)

              return (
                <tr key={client.id} className="hover:bg-background-elevated transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/clients/${client.id}`} className="flex items-center gap-3 group">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent-purple text-black flex items-center justify-center font-semibold text-sm flex-shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-text-primary group-hover:text-white transition-colors">
                          {client.name}
                        </div>
                        <div className="text-xs text-text-tertiary truncate">
                          {client.company || 'No company'}
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-text-secondary">{client.email || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-text-secondary">{client.phone || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${client.status === 'active' ? 'badge-success' : 'text-text-tertiary'}`}>
                      {client.status || 'active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-tertiary">
                    {format(new Date(client.created_at), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button className="text-text-secondary hover:text-text-primary transition-colors">
                      <FiMoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
