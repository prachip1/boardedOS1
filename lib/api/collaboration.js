import { supabase } from '../supabase'

/**
 * API functions for Collaboration/Feedback module
 */

// Get all feedback threads
export const getFeedbackThreads = async () => {
  const { data, error } = await supabase
    .from('feedback_threads')
    .select(`
      *,
      client:clients(id, name),
      project:projects(id, name),
      comments:feedback_comments(count)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Get a single feedback thread with comments
export const getFeedbackThread = async (id) => {
  const { data, error } = await supabase
    .from('feedback_threads')
    .select(`
      *,
      client:clients(id, name),
      project:projects(id, name),
      comments:feedback_comments(
        *,
        user:user_profiles(full_name, avatar_url)
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// Create a feedback thread
export const createFeedbackThread = async (threadData) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('feedback_threads')
    .insert([{
      ...threadData,
      user_id: user.id,
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

// Update a feedback thread
export const updateFeedbackThread = async (id, threadData) => {
  const { data, error } = await supabase
    .from('feedback_threads')
    .update(threadData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Delete a feedback thread
export const deleteFeedbackThread = async (id) => {
  const { error } = await supabase
    .from('feedback_threads')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Add a comment to a thread
export const addComment = async (threadId, comment) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('feedback_comments')
    .insert([{
      thread_id: threadId,
      user_id: user.id,
      comment,
    }])
    .select(`
      *,
      user:user_profiles(full_name, avatar_url)
    `)
    .single()

  if (error) throw error
  return data
}

// Update a comment
export const updateComment = async (id, comment) => {
  const { data, error } = await supabase
    .from('feedback_comments')
    .update({ comment })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Delete a comment
export const deleteComment = async (id) => {
  const { error } = await supabase
    .from('feedback_comments')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Get threads by status
export const getThreadsByStatus = async (status) => {
  const { data, error } = await supabase
    .from('feedback_threads')
    .select(`
      *,
      client:clients(id, name),
      project:projects(id, name),
      comments:feedback_comments(count)
    `)
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Get threads by priority
export const getThreadsByPriority = async (priority) => {
  const { data, error } = await supabase
    .from('feedback_threads')
    .select(`
      *,
      client:clients(id, name),
      project:projects(id, name),
      comments:feedback_comments(count)
    `)
    .eq('priority', priority)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Get open threads
export const getOpenThreads = async () => {
  const { data, error } = await supabase
    .from('feedback_threads')
    .select(`
      *,
      client:clients(id, name),
      project:projects(id, name),
      comments:feedback_comments(count)
    `)
    .in('status', ['open', 'in_review'])
    .order('priority', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

