import { supabase } from '../supabase'

/**
 * API functions for Notifications module
 */

// Get all notifications
export const getNotifications = async () => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Get unread notifications
export const getUnreadNotifications = async () => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('read', false)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Get unread count
export const getUnreadCount = async () => {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('read', false)

  if (error) throw error
  return count || 0
}

// Create a notification
export const createNotification = async (type, title, message, link = null) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('notifications')
    .insert([{
      user_id: user.id,
      type,
      title,
      message,
      link,
      read: false,
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

// Mark notification as read
export const markAsRead = async (id) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Mark all notifications as read
export const markAllAsRead = async () => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('read', false)

  if (error) throw error
}

// Delete a notification
export const deleteNotification = async (id) => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Delete all read notifications
export const deleteAllRead = async () => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('read', true)

  if (error) throw error
}

// Helper functions to create specific notification types

export const notifyInvoicePaid = async (invoiceNumber, clientName) => {
  return createNotification(
    'payment',
    'Payment Received',
    `Invoice ${invoiceNumber} from ${clientName} has been paid`,
    `/invoices/${invoiceNumber}`
  )
}

export const notifyContractSigned = async (contractTitle, clientName) => {
  return createNotification(
    'contract',
    'Contract Signed',
    `${clientName} has signed the contract: ${contractTitle}`,
    `/contracts`
  )
}

export const notifyInvoiceOverdue = async (invoiceNumber, clientName) => {
  return createNotification(
    'invoice',
    'Invoice Overdue',
    `Invoice ${invoiceNumber} for ${clientName} is overdue`,
    `/invoices/${invoiceNumber}`
  )
}

export const notifyDeadline = async (projectName, deadline) => {
  return createNotification(
    'deadline',
    'Upcoming Deadline',
    `Project "${projectName}" deadline is ${deadline}`,
    `/projects`
  )
}

export const notifyNewComment = async (threadTitle, commenter) => {
  return createNotification(
    'comment',
    'New Comment',
    `${commenter} commented on "${threadTitle}"`,
    `/collaboration`
  )
}

