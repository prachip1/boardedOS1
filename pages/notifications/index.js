import { useState, useEffect } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import { FiCheckCircle, FiAlertCircle, FiDollarSign, FiMessageSquare, FiClock, FiCheck, FiTrash2, FiLoader, FiFileText, FiBell } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../../lib/api/notifications'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const data = await getNotifications()
      setNotifications(data)
    } catch (err) {
      console.error('Error loading notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id)
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ))
    } catch (err) {
      console.error('Error marking as read:', err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      setNotifications(notifications.map(n => ({ ...n, read: true })))
    } catch (err) {
      console.error('Error marking all as read:', err)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id)
      setNotifications(notifications.filter(n => n.id !== id))
    } catch (err) {
      console.error('Error deleting notification:', err)
    }
  }

  const typeConfig = {
    invoice: { icon: FiDollarSign, color: 'text-green-500', bg: 'bg-green-500/10' },
    contract: { icon: FiFileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    payment: { icon: FiCheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
    comment: { icon: FiMessageSquare, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    deadline: { icon: FiClock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    general: { icon: FiAlertCircle, color: 'text-text-tertiary', bg: 'bg-background-secondary' },
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read
    if (filter === 'read') return n.read
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <>
      <Head>
        <title>Notifications - Boarded</title>
      </Head>
      <Layout>
        <div className="space-y-6 fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-text-primary mb-2">
                Notifications
              </h1>
              <p className="text-text-secondary">
                Stay updated on your projects and clients
              </p>
            </div>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllAsRead} className="btn btn-secondary">
                <FiCheck size={18} />
                Mark All as Read
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="card">
              <p className="text-text-secondary text-sm mb-1">Total</p>
              <p className="text-2xl font-semibold text-text-primary">{notifications.length}</p>
            </div>
            <div className="card">
              <p className="text-text-secondary text-sm mb-1">Unread</p>
              <p className="text-2xl font-semibold text-accent">{unreadCount}</p>
            </div>
            <div className="card">
              <p className="text-text-secondary text-sm mb-1">Read</p>
              <p className="text-2xl font-semibold text-green-500">
                {notifications.length - unreadCount}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`btn btn-sm ${filter === 'unread' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`btn btn-sm ${filter === 'read' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Read
            </button>
          </div>

          {loading && (
            <div className="text-center py-12">
              <FiLoader className="animate-spin text-accent mx-auto mb-4" size={32} />
              <p className="text-text-secondary">Loading notifications...</p>
            </div>
          )}

          {!loading && filteredNotifications.length === 0 && (
            <div className="card text-center py-12">
              <FiBell className="mx-auto mb-4 text-text-tertiary" size={48} />
              <p className="text-text-secondary">No notifications to display</p>
            </div>
          )}

          {!loading && filteredNotifications.length > 0 && (
            <div className="space-y-2">
              {filteredNotifications.map(notification => {
                const config = typeConfig[notification.type] || typeConfig.general
                const Icon = config.icon

                return (
                  <div
                    key={notification.id}
                    className={`card group cursor-pointer hover:shadow-md transition-all ${
                      !notification.read ? 'border-l-4 border-accent' : ''
                    }`}
                    onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={config.color} size={20} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-sm font-medium mb-1 ${
                          notification.read ? 'text-text-secondary' : 'text-text-primary'
                        }`}>
                          {notification.title}
                        </h3>
                        <p className="text-xs text-text-tertiary mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-text-tertiary">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMarkAsRead(notification.id)
                            }}
                            className="p-1.5 text-accent hover:bg-accent/10 rounded transition-colors"
                            title="Mark as read"
                          >
                            <FiCheck size={16} />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(notification.id)
                          }}
                          className="p-1.5 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </Layout>
    </>
  )
}
