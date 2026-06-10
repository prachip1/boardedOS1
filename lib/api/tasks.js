import { supabase } from '../supabase'

/**
 * API functions for Task Management (Kanban)
 */

// ============================================================================
// COLUMNS
// ============================================================================

// Get all task columns (legacy global — kept for compatibility)
export const getTaskColumns = async () => {
  const { data, error } = await supabase
    .from('task_columns')
    .select('*')
    .order('position', { ascending: true })

  if (error) throw error
  return data
}

// Get the columns for a single project's board
export const getProjectColumns = async (projectId) => {
  const { data, error } = await supabase
    .from('task_columns')
    .select('*')
    .eq('project_id', projectId)
    .order('position', { ascending: true })

  if (error) throw error
  return data
}

// Create a task column on a project's board (owner/admin only — enforced by RLS)
export const createTaskColumn = async (projectId, name, color = '#6b7280') => {
  const { data: { user } } = await supabase.auth.getUser()

  // Next position within THIS project's board
  const { data: columns } = await supabase
    .from('task_columns')
    .select('position')
    .eq('project_id', projectId)
    .order('position', { ascending: false })
    .limit(1)

  const nextPosition = columns && columns.length > 0 ? columns[0].position + 1 : 1

  const { data, error } = await supabase
    .from('task_columns')
    .insert([{
      user_id: user.id,
      project_id: projectId,
      name,
      color,
      position: nextPosition,
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

// Update task column
export const updateTaskColumn = async (id, updates) => {
  const { data, error } = await supabase
    .from('task_columns')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Delete task column
export const deleteTaskColumn = async (id) => {
  const { error } = await supabase
    .from('task_columns')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Reorder columns
export const reorderColumns = async (columnUpdates) => {
  // columnUpdates = [{ id, position }, ...]
  const promises = columnUpdates.map(({ id, position }) =>
    supabase
      .from('task_columns')
      .update({ position })
      .eq('id', id)
  )

  await Promise.all(promises)
}

// ============================================================================
// TASKS
// ============================================================================

// Get all tasks with their columns
export const getTasks = async () => {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      column:task_columns(id, name, color),
      client:clients(id, name),
      project:projects(id, name),
      comments:task_comments(count)
    `)
    .order('position', { ascending: true })

  if (error) throw error
  return data
}

// Get every task on a single project's board
export const getProjectTasks = async (projectId) => {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      client:clients(id, name),
      comments:task_comments(count)
    `)
    .eq('project_id', projectId)
    .order('position', { ascending: true })

  if (error) throw error
  return data
}

// Get tasks by column
export const getTasksByColumn = async (columnId) => {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      client:clients(id, name),
      project:projects(id, name),
      comments:task_comments(count)
    `)
    .eq('column_id', columnId)
    .order('position', { ascending: true })

  if (error) throw error
  return data
}

// Get a single task
export const getTask = async (id) => {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      column:task_columns(id, name, color),
      client:clients(id, name),
      project:projects(id, name),
      comments:task_comments(*, user:user_profiles(full_name))
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// Create a task
export const createTask = async (taskData) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get the next position in the column
  const { data: tasks } = await supabase
    .from('tasks')
    .select('position')
    .eq('column_id', taskData.column_id)
    .order('position', { ascending: false })
    .limit(1)

  const nextPosition = tasks && tasks.length > 0 ? tasks[0].position + 1 : 1

  const { data, error } = await supabase
    .from('tasks')
    .insert([{
      ...taskData,
      user_id: user.id,
      position: nextPosition,
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

// Update a task
export const updateTask = async (id, taskData) => {
  const { data, error } = await supabase
    .from('tasks')
    .update(taskData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Delete a task
export const deleteTask = async (id) => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Move task to different column
export const moveTask = async (taskId, newColumnId, newPosition, newStatus = null) => {
  const updateData = {
    column_id: newColumnId,
    position: newPosition,
  }
  
  // If status is provided, update it and set completed_at if done
  if (newStatus) {
    updateData.status = newStatus
    if (newStatus === 'done') {
      updateData.completed_at = new Date().toISOString()
    } else if (newStatus !== 'done') {
      updateData.completed_at = null
    }
  }

  const { data, error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', taskId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Reorder tasks within a column
export const reorderTasks = async (taskUpdates) => {
  // taskUpdates = [{ id, position, column_id }, ...]
  const promises = taskUpdates.map(({ id, position, column_id }) =>
    supabase
      .from('tasks')
      .update({ position, column_id })
      .eq('id', id)
  )

  await Promise.all(promises)
}

// ============================================================================
// TASK COMMENTS
// ============================================================================

// Add comment to task. Stores the author's email so the thread can show who
// said what without depending on user_profiles visibility across members.
export const addTaskComment = async (taskId, comment) => {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('task_comments')
    .insert([{
      task_id: taskId,
      user_id: user.id,
      author_email: user.email,
      comment,
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

// Get task comments (discussion thread)
export const getTaskComments = async (taskId) => {
  const { data, error } = await supabase
    .from('task_comments')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

// Delete a comment (author only — enforced by RLS)
export const deleteTaskComment = async (id) => {
  const { error } = await supabase
    .from('task_comments')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ============================================================================
// MIGRATION & SYNC
// ============================================================================

// Sync task status with their column positions
export const syncTaskStatusWithColumns = async () => {
  try {
    // Get all tasks with their columns
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select(`
        id,
        column_id,
        status,
        column:task_columns(id, name)
      `)

    if (tasksError) throw tasksError

    // Helper function to map column names to status values
    const getStatusFromColumnName = (columnName) => {
      const name = columnName.toLowerCase()
      if (name.includes('todo') || name.includes('to do')) {
        return 'todo'
      } else if (name.includes('progress') || name.includes('in progress')) {
        return 'in_progress'
      } else if (name.includes('review')) {
        return 'review'
      } else if (name.includes('done') || name.includes('completed')) {
        return 'done'
      } else if (name.includes('blocked')) {
        return 'blocked'
      }
      return 'todo' // Default fallback
    }

    // Find tasks that need status updates
    const tasksToUpdate = tasks.filter(task => {
      if (!task.column) return false
      const expectedStatus = getStatusFromColumnName(task.column.name)
      return task.status !== expectedStatus
    })

    // Update tasks that need status changes
    const updatePromises = tasksToUpdate.map(task => {
      const expectedStatus = getStatusFromColumnName(task.column.name)
      const updateData = { status: expectedStatus }
      
      // Set completed_at if moving to done
      if (expectedStatus === 'done' && task.status !== 'done') {
        updateData.completed_at = new Date().toISOString()
      } else if (expectedStatus !== 'done' && task.status === 'done') {
        updateData.completed_at = null
      }

      return supabase
        .from('tasks')
        .update(updateData)
        .eq('id', task.id)
    })

    await Promise.all(updatePromises)
    
    return {
      totalTasks: tasks.length,
      updatedTasks: tasksToUpdate.length,
      message: `Successfully synced ${tasksToUpdate.length} tasks with their column positions`
    }
  } catch (error) {
    console.error('Error syncing task status:', error)
    throw error
  }
}

// ============================================================================
// STATISTICS
// ============================================================================

// Get task statistics
export const getTaskStats = async () => {
  const { data, error } = await supabase
    .from('tasks')
    .select('status, priority, completed_at')

  if (error) throw error

  return {
    total: data.length,
    completed: data.filter(t => t.status === 'done').length,
    inProgress: data.filter(t => t.status === 'in_progress').length,
    todo: data.filter(t => t.status === 'todo').length,
    highPriority: data.filter(t => t.priority === 'high' || t.priority === 'urgent').length,
    completedThisWeek: data.filter(t => {
      if (!t.completed_at) return false
      const completed = new Date(t.completed_at)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return completed >= weekAgo
    }).length,
  }
}

