import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../../components/Layout'
import TaskColumn from '../../components/Tasks/TaskColumn'
import {
  FiArrowLeft, FiPlus, FiX, FiSave, FiLoader, FiSearch, FiSend,
  FiTrash2, FiLock, FiMessageSquare,
} from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import { getProject, getProjectMembers } from '../../lib/api/projects'
import {
  getProjectColumns, getProjectTasks, createTask, updateTask, deleteTask,
  moveTask, createTaskColumn, getTaskComments, addTaskComment, deleteTaskComment,
} from '../../lib/api/tasks'
import { useAuth } from '../../contexts/AuthContext'

const EMPTY_FORM = {
  title: '', description: '', issue_type: 'task', priority: 'medium', assignee: '',
  start_date: '', due_date: '', story_points: '', estimated_hours: '', tags: '',
}

// Jira-style issue types — label + emoji glyph used in the form/select.
const ISSUE_TYPES = [
  { value: 'task', label: 'Task' },
  { value: 'bug', label: 'Bug' },
  { value: 'story', label: 'Story' },
  { value: 'epic', label: 'Epic' },
]

// Map a column name to a coarse status (kept consistent with the old board).
const statusFromColumn = (name = '') => {
  const n = name.toLowerCase()
  if (n.includes('progress')) return 'in_progress'
  if (n.includes('review')) return 'review'
  if (n.includes('done') || n.includes('complete')) return 'done'
  if (n.includes('blocked')) return 'blocked'
  return 'todo'
}

export default function ProjectBoard() {
  const router = useRouter()
  const { projectId } = router.query
  const { user } = useAuth()

  const [project, setProject] = useState(null)
  const [members, setMembers] = useState([])
  const [columns, setColumns] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Task modal
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [selectedColumn, setSelectedColumn] = useState(null)
  const [editingTask, setEditingTask] = useState(null)
  const [taskForm, setTaskForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  // Comments
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [commentBusy, setCommentBusy] = useState(false)

  // Column modal
  const [showColumnModal, setShowColumnModal] = useState(false)
  const [columnName, setColumnName] = useState('')

  // -------- permissions -----------------------------------------------------
  const myEmail = (user?.email || '').toLowerCase()
  const isOwner = project && user && project.user_id === user.id
  const myRole = isOwner
    ? 'owner'
    : members.find((m) => m.email?.toLowerCase() === myEmail)?.role || null
  const canManage = myRole === 'owner' || myRole === 'admin'
  const canContribute = canManage || myRole === 'member' // viewers are read-only

  const canEditTask = useCallback((task) => {
    if (canManage) return true
    if (task.user_id === user?.id) return true
    if (task.assignee && task.assignee.toLowerCase() === myEmail) return true
    return false
  }, [canManage, user, myEmail])

  const canDeleteTask = useCallback((task) => {
    return canManage || task.user_id === user?.id
  }, [canManage, user])

  // Candidate assignees: project owner (you, if owner) + invited members.
  const assigneeOptions = Array.from(
    new Map(
      [
        user?.email ? { email: user.email, you: true } : null,
        ...members.map((m) => ({ email: m.email })),
      ]
        .filter(Boolean)
        .map((o) => [o.email.toLowerCase(), o])
    ).values()
  )

  // -------- data ------------------------------------------------------------
  const load = useCallback(async () => {
    try {
      setLoading(true)
      const [proj, mem, cols, tks] = await Promise.all([
        getProject(projectId),
        getProjectMembers(projectId),
        getProjectColumns(projectId),
        getProjectTasks(projectId),
      ])
      setProject(proj)
      setMembers(mem)
      setColumns(cols)
      setTasks(tks)
    } catch (err) {
      console.error('Error loading board:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    if (projectId) load()
  }, [projectId, load])

  // -------- task create / edit ---------------------------------------------
  const openNewTask = (columnId) => {
    setSelectedColumn(columnId)
    setEditingTask(null)
    setTaskForm(EMPTY_FORM)
    setComments([])
    setShowTaskModal(true)
  }

  const openTask = async (task) => {
    setEditingTask(task)
    setSelectedColumn(task.column_id)
    setTaskForm({
      title: task.title,
      description: task.description || '',
      issue_type: task.issue_type || 'task',
      priority: task.priority,
      assignee: task.assignee || '',
      start_date: task.start_date || '',
      due_date: task.due_date || '',
      story_points: task.story_points ?? '',
      estimated_hours: task.estimated_hours ?? '',
      tags: task.tags ? task.tags.join(', ') : '',
    })
    setShowTaskModal(true)
    // Load the discussion thread.
    try {
      setComments(await getTaskComments(task.id))
    } catch (err) {
      console.error('Error loading comments:', err)
      setComments([])
    }
  }

  const editable = editingTask ? canEditTask(editingTask) : canContribute

  const handleSaveTask = async (e) => {
    e.preventDefault()
    if (!editable) return
    setSaving(true)
    try {
      const tags = taskForm.tags.split(',').map((t) => t.trim()).filter(Boolean)
      const col = columns.find((c) => c.id === selectedColumn)
      const payload = {
        title: taskForm.title,
        description: taskForm.description,
        issue_type: taskForm.issue_type || 'task',
        priority: taskForm.priority,
        start_date: taskForm.start_date || null,
        due_date: taskForm.due_date || null,
        story_points: taskForm.story_points === '' ? null : Number(taskForm.story_points),
        estimated_hours: taskForm.estimated_hours === '' ? null : Number(taskForm.estimated_hours),
        tags: tags.length ? tags : null,
        column_id: selectedColumn,
        project_id: projectId,
        status: col ? statusFromColumn(col.name) : 'todo',
      }
      // Only managers may set/change the assignee.
      if (canManage) payload.assignee = taskForm.assignee || null

      if (editingTask) {
        const updated = await updateTask(editingTask.id, payload)
        setTasks((prev) => prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)))
      } else {
        const created = await createTask(payload)
        setTasks((prev) => [...prev, created])
      }
      setShowTaskModal(false)
    } catch (err) {
      console.error('Error saving task:', err)
      alert(err.message || 'Could not save task. You may not have permission.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return
    try {
      await deleteTask(taskId)
      setTasks((prev) => prev.filter((t) => t.id !== taskId))
    } catch (err) {
      alert(err.message || 'Could not delete task.')
    }
  }

  // -------- drag & drop -----------------------------------------------------
  const handleDrop = async (taskId, newColumnId) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task || task.column_id === newColumnId) return
    if (!canEditTask(task)) {
      alert('You can only move cards assigned to you.')
      return
    }
    const newCol = columns.find((c) => c.id === newColumnId)
    const newStatus = newCol ? statusFromColumn(newCol.name) : task.status
    const prev = tasks
    setTasks((cur) =>
      cur.map((t) =>
        t.id === taskId
          ? { ...t, column_id: newColumnId, status: newStatus, completed_at: newStatus === 'done' ? new Date().toISOString() : null }
          : t
      )
    )
    try {
      await moveTask(taskId, newColumnId, 0, newStatus)
    } catch (err) {
      console.error('Error moving task:', err)
      setTasks(prev) // revert
    }
  }

  // -------- comments --------------------------------------------------------
  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || !editingTask) return
    setCommentBusy(true)
    try {
      const added = await addTaskComment(editingTask.id, newComment.trim())
      setComments((prev) => [...prev, added])
      setNewComment('')
      // bump the card's comment count locally
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id
            ? { ...t, comments: [{ count: ((t.comments?.[0]?.count) || 0) + 1 }] }
            : t
        )
      )
    } catch (err) {
      alert(err.message || 'Could not post comment.')
    } finally {
      setCommentBusy(false)
    }
  }

  const handleDeleteComment = async (id) => {
    try {
      await deleteTaskComment(id)
      setComments((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      alert(err.message || 'Could not delete comment.')
    }
  }

  // -------- columns ---------------------------------------------------------
  const handleAddColumn = async (e) => {
    e.preventDefault()
    if (!columnName.trim()) return
    try {
      const col = await createTaskColumn(projectId, columnName.trim())
      setColumns((prev) => [...prev, col])
      setColumnName('')
      setShowColumnModal(false)
    } catch (err) {
      alert(err.message || 'Could not add column.')
    }
  }

  // -------- derived ---------------------------------------------------------
  const filtered = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )
  const tasksByColumn = columns.reduce((acc, c) => {
    acc[c.id] = filtered.filter((t) => t.column_id === c.id)
    return acc
  }, {})

  // -------- render ----------------------------------------------------------
  if (loading) {
    return (
      <Layout>
        <div className="text-center py-20">
          <FiLoader className="animate-spin text-accent mx-auto mb-4" size={32} />
          <p className="text-text-secondary">Loading board…</p>
        </div>
      </Layout>
    )
  }

  if (error || !project) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto card bg-red-500/10 border border-red-500/20">
          <h3 className="text-red-500 font-medium mb-1">Couldn&apos;t load this board</h3>
          <p className="text-red-400 text-sm mb-4">{error || 'Project not found, or you don&apos;t have access.'}</p>
          <Link href="/tasks" className="btn btn-secondary inline-flex">
            <FiArrowLeft size={16} /> Back to Boards
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <>
      <Head>
        <title>{project.name} Board - Boarded</title>
      </Head>
      <Layout>
        <div className="space-y-6 fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <Link href="/tasks" className="text-text-secondary hover:text-text-primary mt-1">
                <FiArrowLeft size={20} />
              </Link>
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold text-text-primary truncate">{project.name}</h1>
                <p className="text-text-secondary text-sm">
                  {project.client?.name ? `${project.client.name} · ` : ''}
                  Your role: <span className="capitalize text-text-primary">{myRole || 'guest'}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/projects/${projectId}`} className="btn btn-secondary">Manage team</Link>
              {canManage && (
                <button onClick={() => setShowColumnModal(true)} className="btn btn-secondary">
                  <FiPlus size={16} /> Column
                </button>
              )}
            </div>
          </div>

          {/* Read-only banner for viewers */}
          {!canContribute && (
            <div className="card bg-blue-500/10 border border-blue-500/20 flex items-center gap-2 py-3">
              <FiLock className="text-blue-400" size={16} />
              <p className="text-sm text-blue-300">You have view-only access to this board.</p>
            </div>
          )}

          {/* Search */}
          <div className="max-w-md relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
            <input
              type="text"
              placeholder="Search tasks…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Board */}
          <div className="overflow-x-auto pb-6">
            <div className="flex gap-6 min-w-max pb-2">
              {columns.map((column) => (
                <TaskColumn
                  key={column.id}
                  column={column}
                  tasks={tasksByColumn[column.id] || []}
                  onAddTask={openNewTask}
                  onEditTask={openTask}
                  onDeleteTask={handleDeleteTask}
                  onDrop={handleDrop}
                  canAdd={canContribute}
                  canEditTask={canEditTask}
                  canDeleteTask={canDeleteTask}
                />
              ))}
              {columns.length === 0 && (
                <p className="text-text-tertiary text-sm">This board has no columns yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Task modal */}
        {showTaskModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-text-primary">
                  {editingTask ? (editable ? 'Edit Task' : 'Task') : 'New Task'}
                </h2>
                <button onClick={() => setShowTaskModal(false)} className="text-text-tertiary hover:text-text-primary">
                  <FiX size={24} />
                </button>
              </div>

              <form onSubmit={handleSaveTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Task Title *</label>
                  <input
                    type="text" value={taskForm.title} required disabled={!editable}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    className="input" placeholder="What needs to be done?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Description</label>
                  <textarea
                    value={taskForm.description} rows="3" disabled={!editable}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    className="textarea" placeholder="Add more details…"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Issue Type</label>
                    <select
                      value={taskForm.issue_type} disabled={!editable}
                      onChange={(e) => setTaskForm({ ...taskForm, issue_type: e.target.value })}
                      className="select"
                    >
                      {ISSUE_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Priority</label>
                    <select
                      value={taskForm.priority} disabled={!editable}
                      onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                      className="select"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Start Date</label>
                    <input
                      type="date" value={taskForm.start_date} disabled={!editable}
                      onChange={(e) => setTaskForm({ ...taskForm, start_date: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Due Date</label>
                    <input
                      type="date" value={taskForm.due_date} disabled={!editable}
                      onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Story Points</label>
                    <input
                      type="number" min="0" step="1" value={taskForm.story_points} disabled={!editable}
                      onChange={(e) => setTaskForm({ ...taskForm, story_points: e.target.value })}
                      className="input" placeholder="e.g. 3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Estimate (hours)</label>
                    <input
                      type="number" min="0" step="0.5" value={taskForm.estimated_hours} disabled={!editable}
                      onChange={(e) => setTaskForm({ ...taskForm, estimated_hours: e.target.value })}
                      className="input" placeholder="e.g. 8"
                    />
                  </div>
                </div>

                {/* Assignee — only managers can set it; others see it read-only */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Assignee</label>
                  {canManage ? (
                    <select
                      value={taskForm.assignee}
                      onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })}
                      className="select"
                    >
                      <option value="">Unassigned</option>
                      {assigneeOptions.map((o) => (
                        <option key={o.email} value={o.email}>
                          {o.email}{o.you ? ' (you)' : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="input flex items-center text-text-secondary">
                      {taskForm.assignee || 'Unassigned'}
                      <span className="text-xs text-text-tertiary ml-2">· only admins can change this</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Tags (comma separated)</label>
                  <input
                    type="text" value={taskForm.tags} disabled={!editable}
                    onChange={(e) => setTaskForm({ ...taskForm, tags: e.target.value })}
                    className="input" placeholder="design, urgent, review"
                  />
                </div>

                {editable && (
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                    <button type="button" onClick={() => setShowTaskModal(false)} className="btn btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? <FiLoader className="animate-spin" size={16} /> : <FiSave size={16} />}
                      {editingTask ? 'Update Task' : 'Create Task'}
                    </button>
                  </div>
                )}
              </form>

              {/* Discussion — only on existing tasks */}
              {editingTask && (
                <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <FiMessageSquare size={15} /> Discussion
                    <span className="text-text-tertiary font-normal">({comments.length})</span>
                  </h3>

                  <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                    {comments.length === 0 && (
                      <p className="text-sm text-text-tertiary">No comments yet. Start the discussion.</p>
                    )}
                    {comments.map((c) => (
                      <div key={c.id} className="flex gap-3 group">
                        <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-semibold uppercase flex-shrink-0">
                          {(c.author_email || '?').charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-text-primary truncate">{c.author_email || 'Member'}</span>
                            <span className="text-xs text-text-tertiary">
                              {c.created_at ? formatDistanceToNow(new Date(c.created_at), { addSuffix: true }) : ''}
                            </span>
                            {c.user_id === user?.id && (
                              <button
                                onClick={() => handleDeleteComment(c.id)}
                                className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-red-500 transition-all"
                              >
                                <FiTrash2 size={12} />
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-text-secondary whitespace-pre-wrap break-words">{c.comment}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {canContribute ? (
                    <form onSubmit={handleAddComment} className="flex gap-2">
                      <input
                        type="text" value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="input flex-1" placeholder="Write a comment…"
                      />
                      <button type="submit" className="btn btn-primary" disabled={commentBusy || !newComment.trim()}>
                        {commentBusy ? <FiLoader className="animate-spin" size={16} /> : <FiSend size={16} />}
                      </button>
                    </form>
                  ) : (
                    <p className="text-xs text-text-tertiary">View-only access — you can&apos;t comment.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add column modal */}
        {showColumnModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="card max-w-sm w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-text-primary">New Column</h2>
                <button onClick={() => setShowColumnModal(false)} className="text-text-tertiary hover:text-text-primary">
                  <FiX size={20} />
                </button>
              </div>
              <form onSubmit={handleAddColumn} className="space-y-4">
                <input
                  type="text" value={columnName} autoFocus required
                  onChange={(e) => setColumnName(e.target.value)}
                  className="input" placeholder="Column name (e.g. Testing)"
                />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowColumnModal(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary"><FiPlus size={16} /> Add</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Layout>
    </>
  )
}
