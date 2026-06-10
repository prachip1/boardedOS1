import { supabase } from '../supabase'
import { nanoid } from 'nanoid'
import bcrypt from 'bcryptjs'

/**
 * API functions for Preview Links module
 */

// Get all preview links
export const getPreviewLinks = async () => {
  const { data, error } = await supabase
    .from('preview_links')
    .select(`
      *,
      client:clients(id, name)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Get a single preview link by ID
export const getPreviewLink = async (id) => {
  const { data, error } = await supabase
    .from('preview_links')
    .select(`
      *,
      client:clients(id, name)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// Get preview link by short code (public access)
export const getPreviewLinkByCode = async (shortCode) => {
  const { data, error } = await supabase
    .from('preview_links')
    .select('*')
    .eq('short_code', shortCode)
    .single()

  if (error) throw error
  
  // Check if link is still valid
  if (data.status !== 'active') {
    throw new Error('This preview link has expired or been deleted')
  }

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    // Update status to expired
    await supabase
      .from('preview_links')
      .update({ status: 'expired' })
      .eq('id', data.id)
    
    throw new Error('This preview link has expired')
  }

  if (data.max_views && data.views >= data.max_views) {
    // Update status to expired
    await supabase
      .from('preview_links')
      .update({ status: 'expired' })
      .eq('id', data.id)
    
    throw new Error('This preview link has reached its view limit')
  }

  return data
}

// Create a preview link
export const createPreviewLink = async (linkData) => {
  const { data: { user } } = await supabase.auth.getUser()

  // Generate unique short code
  const shortCode = nanoid(10)

  // Never store the password in plaintext — hash it. The public viewer verifies
  // against this hash server-side (see pages/api/preview/[code].js).
  const { password, ...rest } = linkData
  const passwordHash = password ? await bcrypt.hash(String(password), 10) : null

  const { data, error } = await supabase
    .from('preview_links')
    .insert([{
      ...rest,
      password: passwordHash,
      user_id: user.id,
      short_code: shortCode,
      views: 0,
      status: 'active',
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

// Update a preview link
export const updatePreviewLink = async (id, linkData) => {
  const { data, error } = await supabase
    .from('preview_links')
    .update(linkData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Delete a preview link (soft delete - mark as deleted)
export const deletePreviewLink = async (id) => {
  const { data, error } = await supabase
    .from('preview_links')
    .update({ status: 'deleted' })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Increment view count
export const incrementPreviewViews = async (id) => {
  // Get current views
  const { data: link } = await supabase
    .from('preview_links')
    .select('views, max_views')
    .eq('id', id)
    .single()

  if (!link) throw new Error('Link not found')

  const newViews = (link.views || 0) + 1
  
  // Update views and last_accessed_at
  const updateData = {
    views: newViews,
    last_accessed_at: new Date().toISOString(),
  }

  // If max views reached, mark as expired
  if (link.max_views && newViews >= link.max_views) {
    updateData.status = 'expired'
  }

  const { data, error } = await supabase
    .from('preview_links')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Get active preview links
export const getActivePreviewLinks = async () => {
  const now = new Date().toISOString()
  
  const { data, error } = await supabase
    .from('preview_links')
    .select(`
      *,
      client:clients(id, name)
    `)
    .eq('status', 'active')
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Get expired preview links
export const getExpiredPreviewLinks = async () => {
  const now = new Date().toISOString()
  
  const { data, error } = await supabase
    .from('preview_links')
    .select(`
      *,
      client:clients(id, name)
    `)
    .or(`status.eq.expired,expires_at.lt.${now}`)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Generate shareable URL
export const generateShareableUrl = (shortCode) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
  return `${baseUrl}/preview/${shortCode}`
}

