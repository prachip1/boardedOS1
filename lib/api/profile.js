import { supabase, uploadFile, getFileUrl } from '../supabase'
import { nanoid } from 'nanoid'

/**
 * API functions for the user's Business Profile
 * (company details + logo shown on invoices).
 *
 * Backed by the `user_profiles` table and the public `logos` storage bucket.
 * Run supabase/launch-migration.sql once to provision both.
 */

const LOGO_BUCKET = 'logos'

// Get the current user's business profile (null if not set up yet)
export const getBusinessProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (error) throw error
  return data
}

// Create or update the current user's business profile
export const upsertBusinessProfile = async (profileData) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('user_profiles')
    .upsert(
      { id: user.id, ...profileData, updated_at: new Date().toISOString() },
      { onConflict: 'id' }
    )
    .select()
    .single()

  if (error) throw error
  return data
}

// Upload a business logo to the public `logos` bucket and return its public URL
export const uploadBusinessLogo = async (file) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const fileExt = (file.name.split('.').pop() || 'png').toLowerCase()
  const filePath = `${user.id}/logo-${nanoid()}.${fileExt}`

  await uploadFile(LOGO_BUCKET, filePath, file)
  return getFileUrl(LOGO_BUCKET, filePath)
}
