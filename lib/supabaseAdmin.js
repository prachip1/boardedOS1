import { createClient } from '@supabase/supabase-js'

/**
 * Server-only Supabase client using the service-role key.
 *
 * NEVER import this from client-side code — the service-role key bypasses
 * Row-Level Security. It is used by API routes to:
 *   - serve public preview links without exposing the stored password hash to
 *     the browser, and
 *   - increment the view counter (the anon RLS policy is read-only).
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let admin = null

export function getSupabaseAdmin() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Supabase admin client unavailable: set SUPABASE_SERVICE_ROLE_KEY (and NEXT_PUBLIC_SUPABASE_URL) in your environment.'
    )
  }
  if (!admin) {
    admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  return admin
}
