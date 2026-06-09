import { supabase } from '../supabase'
import { getClients } from './clients'
import { getInvoiceStats } from './invoices'
import { getTimeStats } from './time-tracking'
import { getTaskStats } from './tasks'

/**
 * API functions for Dashboard
 */

// Dashboard Widgets Table
export const getDashboardWidgets = async () => {
  const { data, error } = await supabase
    .from('dashboard_widgets')
    .select('*')
    .order('position', { ascending: true })

  if (error) {
    // Table might not exist yet, return defaults
    return getDefaultWidgets()
  }
  return data.length > 0 ? data : getDefaultWidgets()
}

// Get default widgets for new users
export const getDefaultWidgets = () => {
  return [
    { id: 'clients', type: 'clients', title: 'Active Clients', enabled: true, position: 1 },
    { id: 'invoices', type: 'invoices', title: 'Pending Invoices', enabled: true, position: 2 },
    { id: 'time', type: 'time', title: 'Hours This Month', enabled: true, position: 3 },
    { id: 'revenue', type: 'revenue', title: 'Revenue', enabled: true, position: 4 },
  ]
}

// Save widget preferences
export const saveWidgetPreferences = async (widgets) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  try {
    // Delete existing widgets
    await supabase
      .from('dashboard_widgets')
      .delete()
      .eq('user_id', user.id)

    // Insert new configuration
    const widgetsToInsert = widgets.map((widget, index) => ({
      user_id: user.id,
      widget_id: widget.id,
      type: widget.type,
      title: widget.title,
      enabled: widget.enabled,
      position: index + 1,
    }))

    const { error } = await supabase
      .from('dashboard_widgets')
      .insert(widgetsToInsert)

    if (error) throw error
  } catch (error) {
    console.error('Error saving widget preferences:', error)
  }
}

// Add widget to dashboard
export const addWidgetToDashboard = async (widgetType, widgetTitle) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  try {
    // Get current widgets
    const { data: widgets } = await supabase
      .from('dashboard_widgets')
      .select('position')
      .eq('user_id', user.id)
      .order('position', { ascending: false })
      .limit(1)

    const nextPosition = widgets && widgets.length > 0 ? widgets[0].position + 1 : 1

    const { data, error } = await supabase
      .from('dashboard_widgets')
      .insert([{
        user_id: user.id,
        widget_id: `${widgetType}-${Date.now()}`,
        type: widgetType,
        title: widgetTitle,
        enabled: true,
        position: nextPosition,
      }])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error adding widget:', error)
    throw error
  }
}

// Remove widget from dashboard
export const removeWidgetFromDashboard = async (widgetId) => {
  const { error } = await supabase
    .from('dashboard_widgets')
    .delete()
    .eq('widget_id', widgetId)

  if (error) throw error
}

// Get all dashboard data
export const getDashboardData = async () => {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const [clients, invoiceStats, timeStats, taskStats] = await Promise.all([
      getClients(),
      getInvoiceStats(),
      getTimeStats(
        startOfMonth.toISOString().split('T')[0],
        endOfMonth.toISOString().split('T')[0]
      ),
      getTaskStats()
    ])

    return {
      clients: {
        total: clients.length,
        active: clients.filter(c => c.status === 'active').length,
        inactive: clients.filter(c => c.status === 'inactive').length,
        newThisMonth: clients.filter(c => {
          const created = new Date(c.created_at)
          return created >= startOfMonth && created <= endOfMonth
        }).length,
      },
      invoices: {
        total: invoiceStats.total,
        totalRevenue: invoiceStats.totalRevenue,
        paid: invoiceStats.paid,
        pending: invoiceStats.pending,
        overdue: invoiceStats.overdue,
        totalPending: invoiceStats.totalPending || 0,
      },
      time: {
        totalHours: timeStats.totalHours || 0,
        billableHours: timeStats.billableHours || 0,
        entries: timeStats.totalEntries || 0,
      },
      tasks: {
        total: taskStats.total || 0,
        completed: taskStats.completed || 0,
        inProgress: taskStats.inProgress || 0,
        todo: taskStats.todo || 0,
        highPriority: taskStats.highPriority || 0,
      },
    }
  } catch (error) {
    console.error('Error getting dashboard data:', error)
    // Return empty data structure
    return {
      clients: { total: 0, active: 0, inactive: 0, newThisMonth: 0 },
      invoices: { total: 0, totalRevenue: 0, paid: 0, pending: 0, overdue: 0, totalPending: 0 },
      time: { totalHours: 0, billableHours: 0, entries: 0 },
      tasks: { total: 0, completed: 0, inProgress: 0, todo: 0, highPriority: 0 },
    }
  }
}

