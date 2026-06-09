import { createClient } from '@supabase/supabase-js'

// Supabase client configuration
// Get your credentials from: https://app.supabase.com/project/_/settings/api

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not found. Please set up your .env.local file.')
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  }
)

// Helper functions for common operations

/**
 * Get the current authenticated user
 */
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

/**
 * Sign up a new user
 */
export const signUp = async (email, password, metadata = {}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  })
  if (error) throw error
  return data
}

/**
 * Sign in with email and password
 */
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

/**
 * Sign out the current user
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/**
 * Send password reset email
 */
export const resetPassword = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  })
  if (error) throw error
}

/**
 * Update user password
 */
export const updatePassword = async (newPassword) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })
  if (error) throw error
}

/**
 * Sign in with OAuth provider (Google, GitHub, etc.)
 */
export const signInWithOAuth = async (provider) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    },
  })
  if (error) throw error
  return data
}

/**
 * Upload file to Supabase Storage
 */
export const uploadFile = async (bucket, path, file) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })
  if (error) throw error
  return data
}

/**
 * Get public URL for a file
 */
export const getFileUrl = (bucket, path) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)
  return data.publicUrl
}

/**
 * Delete file from storage
 */
export const deleteFile = async (bucket, path) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])
  if (error) throw error
}

export default supabase

