import { supabase, uploadFile, getFileUrl, deleteFile as deleteFromStorage } from '../supabase'
import { nanoid } from 'nanoid'

/**
 * API functions for Files module
 */

// Get all files
export const getFiles = async (filters = {}) => {
  let query = supabase
    .from('files')
    .select(`
      *,
      client:clients(id, name),
      project:projects(id, name)
    `)

  // Apply filters
  if (filters.clientId) {
    query = query.eq('client_id', filters.clientId)
  }
  if (filters.projectId) {
    query = query.eq('project_id', filters.projectId)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Get a single file
export const getFile = async (id) => {
  const { data, error } = await supabase
    .from('files')
    .select(`
      *,
      client:clients(id, name),
      project:projects(id, name)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// Upload and create file record
export const uploadAndCreateFile = async (file, metadata = {}) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  // Generate unique file path
  const fileExt = file.name.split('.').pop()
  const fileName = `${nanoid()}.${fileExt}`
  const filePath = `${user.id}/${fileName}`

  try {
    // Upload to Supabase Storage
    const uploadData = await uploadFile('files', filePath, file)
    
    // Get public URL
    const publicUrl = getFileUrl('files', filePath)

    // Create database record
    const { data, error } = await supabase
      .from('files')
      .insert([{
        user_id: user.id,
        client_id: metadata.clientId || null,
        project_id: metadata.projectId || null,
        name: file.name,
        file_type: file.type,
        size: file.size,
        storage_path: filePath,
        public_url: publicUrl,
      }])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Upload error:', error)
    throw error
  }
}

// Update file metadata
export const updateFile = async (id, fileData) => {
  const { data, error } = await supabase
    .from('files')
    .update(fileData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Delete file (from storage and database)
export const deleteFileComplete = async (id) => {
  // Get file record
  const { data: file } = await supabase
    .from('files')
    .select('storage_path')
    .eq('id', id)
    .single()

  if (!file) throw new Error('File not found')

  try {
    // Delete from storage
    await deleteFromStorage('files', file.storage_path)
    
    // Delete from database
    const { error } = await supabase
      .from('files')
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Delete error:', error)
    throw error
  }
}

// Generate shareable link
export const generateShareableLink = async (id, expiresInHours = 24) => {
  const shareCode = nanoid(16)
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + expiresInHours)

  const { data, error } = await supabase
    .from('files')
    .update({
      shared_link: shareCode,
      link_expires_at: expiresAt.toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
  return {
    ...data,
    shareUrl: `${baseUrl}/files/shared/${shareCode}`,
  }
}

// Get file by share code
export const getFileByShareCode = async (shareCode) => {
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('shared_link', shareCode)
    .single()

  if (error) throw error

  // Check if link has expired
  if (data.link_expires_at && new Date(data.link_expires_at) < new Date()) {
    throw new Error('This share link has expired')
  }

  // Increment download count
  await supabase
    .from('files')
    .update({
      download_count: (data.download_count || 0) + 1,
    })
    .eq('id', data.id)

  return data
}

// Remove shareable link
export const removeShareableLink = async (id) => {
  const { data, error } = await supabase
    .from('files')
    .update({
      shared_link: null,
      link_expires_at: null,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Get storage usage statistics
export const getStorageStats = async () => {
  const { data, error } = await supabase
    .from('files')
    .select('size')

  if (error) throw error

  const totalBytes = data.reduce((sum, file) => sum + (file.size || 0), 0)
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(2)
  const totalGB = (totalBytes / (1024 * 1024 * 1024)).toFixed(2)

  return {
    totalFiles: data.length,
    totalBytes,
    totalMB,
    totalGB,
  }
}

