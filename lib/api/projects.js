import { supabase } from '../supabase'

/**
 * API functions for the Projects module.
 *
 * Visibility is enforced at the database level by RLS (see
 * supabase/projects-members.sql): a user sees a project if they own it OR they
 * were invited to it by email. That means a member's invited projects show up
 * here automatically without any extra client-side filtering.
 */

// Get every project the current user can see (owned + projects they're a member of)
export const getProjects = async () => {
  // Link any email invitations to this account (best-effort; ignore if the
  // claim function hasn't been installed yet).
  try {
    await supabase.rpc('claim_project_memberships')
  } catch (_) {
    /* no-op */
  }

  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      client:clients(id, name, company),
      members:project_members(count),
      tasks:tasks(count)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Get a single project, including its client and members
export const getProject = async (id) => {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      client:clients(id, name, company, email)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// Create a new project (the creator is the owner)
export const createProject = async (projectData) => {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('projects')
    .insert([{
      ...projectData,
      // empty strings from <select>/<input> would violate FK / date types
      client_id: projectData.client_id || null,
      budget: projectData.budget === '' ? null : projectData.budget,
      start_date: projectData.start_date || null,
      end_date: projectData.end_date || null,
      user_id: user.id,
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

// Update a project
export const updateProject = async (id, projectData) => {
  const payload = { ...projectData }
  if ('client_id' in payload) payload.client_id = payload.client_id || null
  if ('budget' in payload) payload.budget = payload.budget === '' ? null : payload.budget
  if ('start_date' in payload) payload.start_date = payload.start_date || null
  if ('end_date' in payload) payload.end_date = payload.end_date || null

  const { data, error } = await supabase
    .from('projects')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Delete a project
export const deleteProject = async (id) => {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ---------------------------------------------------------------------------
// MEMBERS
// ---------------------------------------------------------------------------

// List the members invited to a project
export const getProjectMembers = async (projectId) => {
  const { data, error } = await supabase
    .from('project_members')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

// Invite a person to a project by email. They'll see the project automatically
// once they sign in with that email.
export const addProjectMember = async (projectId, email, role = 'member') => {
  const { data: { user } } = await supabase.auth.getUser()
  const cleanEmail = email.trim().toLowerCase()

  const { data, error } = await supabase
    .from('project_members')
    .insert([{
      project_id: projectId,
      email: cleanEmail,
      role,
      invited_by: user.id,
    }])
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new Error('That person is already a member of this project.')
    }
    throw error
  }
  return data
}

// Fire-and-forget: ask the server to email a freshly invited member.
// Never throws — email is a nice-to-have and must not break the invite flow.
export const notifyMemberInvited = async ({ to, projectName, role, inviterEmail }) => {
  try {
    const res = await fetch('/api/projects/notify-member', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, projectName, role, inviterEmail }),
    })
    return await res.json()
  } catch (err) {
    console.error('Failed to send invite email:', err)
    return { sent: false, error: err.message }
  }
}

// Change a member's role
export const updateProjectMemberRole = async (memberId, role) => {
  const { data, error } = await supabase
    .from('project_members')
    .update({ role })
    .eq('id', memberId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Remove a member from a project
export const removeProjectMember = async (memberId) => {
  const { error } = await supabase
    .from('project_members')
    .delete()
    .eq('id', memberId)

  if (error) throw error
}
