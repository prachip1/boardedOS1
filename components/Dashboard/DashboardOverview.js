import { useState, useEffect } from 'react'
import { FiPlus, FiSettings, FiLoader } from 'react-icons/fi'
import WidgetCard from './WidgetCard'
import RecentActivity from './RecentActivity'
import QuickActions from './QuickActions'
import UpcomingDeadlines from './UpcomingDeadlines'
import { getDashboardData, getDashboardWidgets, saveWidgetPreferences } from '../../lib/api/dashboard'

export default function DashboardOverview() {
  const [data, setData] = useState(null)
  const [widgets, setWidgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showWidgetSelector, setShowWidgetSelector] = useState(false)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true)
        const [dashboardData, userWidgets] = await Promise.all([
          getDashboardData(),
          getDashboardWidgets()
        ])
        setData(dashboardData)
        setWidgets(userWidgets)
      } catch (error) {
        console.error('Error loading dashboard:', error)
        setData({
          clients: { total: 0, active: 0, inactive: 0, newThisMonth: 0 },
          invoices: { total: 0, totalRevenue: 0, paid: 0, pending: 0, overdue: 0, totalPending: 0 },
          time: { totalHours: 0, billableHours: 0, entries: 0 },
          tasks: { total: 0, completed: 0, inProgress: 0, todo: 0, highPriority: 0 },
        })
        setWidgets([
          { id: 'clients', type: 'clients', title: 'Active Clients', enabled: true, position: 1 },
          { id: 'invoices', type: 'invoices', title: 'Pending Invoices', enabled: true, position: 2 },
          { id: 'time', type: 'time', title: 'Hours This Month', enabled: true, position: 3 },
          { id: 'revenue', type: 'revenue', title: 'Revenue', enabled: true, position: 4 },
        ])
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const availableWidgets = [
    { type: 'clients', title: 'Active Clients' },
    { type: 'invoices', title: 'Pending Invoices' },
    { type: 'time', title: 'Hours This Month' },
    { type: 'revenue', title: 'Total Revenue' },
    { type: 'tasks', title: 'Tasks In Progress' },
    { type: 'tasks_completed', title: 'Completed Tasks' },
    { type: 'tasks_high_priority', title: 'High Priority Tasks' },
  ]

  const addWidget = async (widgetType) => {
    const widgetInfo = availableWidgets.find(w => w.type === widgetType)
    if (!widgetInfo) return

    const newWidget = {
      id: `${widgetType}-${Date.now()}`,
      type: widgetType,
      title: widgetInfo.title,
      enabled: true,
      position: widgets.length + 1,
    }

    const updatedWidgets = [...widgets, newWidget]
    setWidgets(updatedWidgets)
    setShowWidgetSelector(false)
    
    // Save to database if table exists
    try {
      await saveWidgetPreferences(updatedWidgets)
    } catch (error) {
      console.log('Widget preferences not saved (table may not exist)')
    }
  }

  const removeWidget = async (widgetId) => {
    const updatedWidgets = widgets.filter(w => w.id !== widgetId)
    setWidgets(updatedWidgets)
    
    try {
      await saveWidgetPreferences(updatedWidgets)
    } catch (error) {
      console.log('Widget preferences not saved')
    }
  }

  const enabledWidgets = widgets.filter(w => w.enabled)

  return (
    <div className="space-y-8 fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary mb-2">
            Dashboard
          </h1>
          <p className="text-text-secondary">
            Welcome back! Here&apos;s what&apos;s happening with your projects.
          </p>
        </div>
        <button
          onClick={() => setShowWidgetSelector(!showWidgetSelector)}
          className="btn btn-secondary"
        >
          <FiPlus size={18} />
          Add Widget
        </button>
      </div>

      {/* Widget Selector */}
      {showWidgetSelector && (
        <div className="card bg-background-elevated border-accent/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary">Add Widget to Dashboard</h3>
            <button
              onClick={() => setShowWidgetSelector(false)}
              className="text-text-tertiary hover:text-text-primary"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {availableWidgets.map(widget => (
              <button
                key={widget.type}
                onClick={() => addWidget(widget.type)}
                className="p-3 text-sm bg-background-secondary hover:bg-background-elevated border border-border hover:border-accent/50 rounded-lg transition-all text-text-primary hover:text-accent"
                disabled={widgets.some(w => w.type === widget.type && w.enabled)}
              >
                {widget.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {loading ? (
        <div className="text-center py-12">
          <FiLoader className="animate-spin text-accent mx-auto mb-4" size={32} />
          <p className="text-text-secondary">Loading dashboard...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {enabledWidgets.map(widget => (
              <WidgetCard
                key={widget.id}
                widget={widget}
                data={data}
                onRemove={enabledWidgets.length > 1 ? removeWidget : null}
              />
            ))}
          </div>

          {enabledWidgets.length === 0 && (
            <div className="card text-center py-12">
              <p className="text-text-secondary mb-4">No widgets on your dashboard</p>
              <button
                onClick={() => setShowWidgetSelector(true)}
                className="btn btn-primary inline-flex"
              >
                <FiPlus size={18} />
                Add Your First Widget
              </button>
            </div>
          )}
        </>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity - Takes 2 columns */}
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>

        {/* Quick Actions and Deadlines */}
        <div className="space-y-6">
          <QuickActions />
          <UpcomingDeadlines />
        </div>
      </div>
    </div>
  )
}
