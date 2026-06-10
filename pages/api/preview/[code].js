// Public preview viewer endpoint.
//
// Runs server-side with the Supabase service-role key so we can:
//   - validate status / expiry / view-limit authoritatively,
//   - keep the stored password hash out of the browser, and
//   - increment the view counter (the anon RLS policy is read-only).
//
// GET  /api/preview/:code        -> link metadata; serves the URL if unprotected
// POST /api/preview/:code {password} -> verifies password, then serves the URL
import bcrypt from 'bcryptjs'
import { getSupabaseAdmin } from '../../../lib/supabaseAdmin'

// Decide whether a link is still viewable. Returns a reason string if not.
function expiryReason(link) {
  if (link.status === 'deleted') return 'This preview link has been deleted.'
  if (link.status === 'expired') return 'This preview link has expired.'
  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    return 'This preview link has expired.'
  }
  if (link.max_views != null && (link.views || 0) >= link.max_views) {
    return 'This preview link has reached its view limit.'
  }
  return null
}

// Public-safe view of a link (never includes the password hash).
function publicShape(link) {
  return {
    title: link.title,
    requiresPassword: !!link.password,
    expiresAt: link.expires_at,
    views: link.views || 0,
    maxViews: link.max_views,
  }
}

export default async function handler(req, res) {
  const { code } = req.query

  let admin
  try {
    admin = getSupabaseAdmin()
  } catch (err) {
    return res.status(500).json({ error: 'Preview service is not configured.' })
  }

  const { data: link, error } = await admin
    .from('preview_links')
    .select('*')
    .eq('short_code', code)
    .single()

  if (error || !link) {
    return res.status(404).json({ error: 'This preview link does not exist.' })
  }

  // If a time/view limit was crossed, persist the expired status once.
  const reason = expiryReason(link)
  if (reason) {
    if (link.status === 'active') {
      await admin.from('preview_links').update({ status: 'expired' }).eq('id', link.id)
    }
    return res.status(410).json({ error: reason })
  }

  // Count this as a view and hand back the URL.
  const serveUrl = async () => {
    const newViews = (link.views || 0) + 1
    const update = { views: newViews, last_accessed_at: new Date().toISOString() }
    if (link.max_views != null && newViews >= link.max_views) update.status = 'expired'
    await admin.from('preview_links').update(update).eq('id', link.id)
    return res.status(200).json({ ...publicShape({ ...link, views: newViews }), url: link.url })
  }

  if (req.method === 'GET') {
    if (link.password) {
      // Locked: reveal nothing but the fact that a password is needed.
      return res.status(200).json({ ...publicShape(link), url: null })
    }
    return serveUrl()
  }

  if (req.method === 'POST') {
    if (!link.password) return serveUrl() // not protected; nothing to verify
    const { password } = req.body || {}
    if (!password) return res.status(400).json({ error: 'Password is required.' })

    const ok = await bcrypt.compare(String(password), link.password)
    if (!ok) return res.status(401).json({ error: 'Incorrect password.' })
    return serveUrl()
  }

  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ error: 'Method not allowed' })
}
