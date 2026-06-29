import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../../components/Layout'
import TaskColumn from '../../components/Tasks/TaskColumn'
import { linkify } from '../../components/Tasks/linkify'
import { LABEL_COLORS, contrastText } from '../../components/Tasks/labels'
import {
  FiArrowLeft, FiPlus, FiX, FiSave, FiLoader, FiSearch, FiSend,
  FiTrash2, FiLock, FiMessageSquare, FiTag, FiCalendar, FiUsers,
  FiCheckSquare, FiAlignLeft, FiPaperclip, FiDownload,
} from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import { getProject, getProjectMembers } from '../../lib/api/projects'
import {
  getProjectColumns, getProjectTasks, createTask, updateTask, deleteTask,
  moveTask, createTaskColumn, getTaskComments, addTaskComment, deleteTaskComment,
  getTaskAttachments, uploadTaskAttachment, deleteTaskAttachment,
} from '../../lib/api/tasks'
import { notifyProject } from '../../lib/api/notifications'
import { useAuth } from '../../contexts/AuthContext'

const EMPTY_FORM = {
  title: '', description: '', issue_type: 'task', priority: 'medium', assignee: '',
  start_date: '', due_date: '', story_points: '', estimated_hours: '', tags: '',
  label_color: '', label_text: '', checklist: [],
}

// Jira-style issue types — label + emoji glyph used in the form/select.
const ISSUE_TYPES = [
  { value: 'task', label: 'Task' },
  { value: 'bug', label: 'Bug' },
  { value: 'story', label: 'Story' },
  { value: 'epic', label: 'Epic' },
]

// Human-readable file size for attachment rows.
const formatBytes = (bytes) => {
  if (!bytes && bytes !== 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

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
  // Which click-to-add panel is open in the modal: 'labels' | 'dates' | 'members' | 'checklist'
  const [activePanel, setActivePanel] = useState(null)
  const [newChecklistItem, setNewChecklistItem] = useState('')

  // Comments
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [commentBusy, setCommentBusy] = useState(false)

  // Attachments
  const [attachments, setAttachments] = useState([])
  const [attachBusy, setAttachBusy] = useState(false)

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

  // Short actor name + a best-effort fan-out so every project member sees the
  // activity. Never throws — a failed notification must not break the action.
  const actorName = (user?.email || 'Someone').split('@')[0]
  const notifyBoard = (type, title, message) => {
    notifyProject(projectId, type, title, message, `/tasks/${projectId}`)
      .catch((err) => console.error('Notification failed:', err))
  }

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
    setAttachments([])
    setActivePanel(null)
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
      label_color: task.label_color || '',
      label_text: task.label_text || '',
      checklist: Array.isArray(task.checklist) ? task.checklist : [],
    })
    setActivePanel(null)
    setShowTaskModal(true)
    // Load the discussion thread + attachments.
    try {
      setComments(await getTaskComments(task.id))
    } catch (err) {
      console.error('Error loading comments:', err)
      setComments([])
    }
    try {
      setAttachments(await getTaskAttachments(task.id))
    } catch (err) {
      console.error('Error loading attachments:', err)
      setAttachments([])
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
        label_color: taskForm.label_color || null,
        label_text: taskForm.label_text || null,
        checklist: taskForm.checklist || [],
        column_id: selectedColumn,
        project_id: projectId,
        status: col ? statusFromColumn(col.name) : 'todo',
      }
      // Only managers may set/change the assignee.
      if (canManage) payload.assignee = taskForm.assignee || null

      if (editingTask) {
        const updated = await updateTask(editingTask.id, payload)
        setTasks((prev) => prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)))
        notifyBoard('task', 'Task updated', `${actorName} updated "${payload.title}"`)
      } else {
        const created = await createTask(payload)
        setTasks((prev) => [...prev, created])
        notifyBoard('task', 'Task created', `${actorName} added "${payload.title}"`)
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
    const removed = tasks.find((t) => t.id === taskId)
    try {
      await deleteTask(taskId)
      setTasks((prev) => prev.filter((t) => t.id !== taskId))
      notifyBoard('task', 'Task deleted', `${actorName} deleted "${removed?.title || 'a task'}"`)
    } catch (err) {
      alert(err.message || 'Could not delete task.')
    }
  }

  // -------- checklist (inline, stored on the task) --------------------------
  const addChecklistItem = (text) => {
    const value = text.trim()
    if (!value) return
    const item = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, text: value, done: false }
    setTaskForm((f) => ({ ...f, checklist: [...(f.checklist || []), item] }))
    setNewChecklistItem('')
  }
  const toggleChecklistItem = (id) =>
    setTaskForm((f) => ({
      ...f,
      checklist: (f.checklist || []).map((i) => (i.id === id ? { ...i, done: !i.done } : i)),
    }))
  const removeChecklistItem = (id) =>
    setTaskForm((f) => ({ ...f, checklist: (f.checklist || []).filter((i) => i.id !== id) }))

  // -------- attachments -----------------------------------------------------
  const bumpAttachmentCount = (taskId, delta) =>
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, attachments: [{ count: Math.max(0, ((t.attachments?.[0]?.count) || 0) + delta) }] }
          : t
      )
    )

  const handleUploadAttachment = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file later
    if (!file || !editingTask) return
    setAttachBusy(true)
    try {
      const added = await uploadTaskAttachment(editingTask.id, projectId, file)
      setAttachments((prev) => [added, ...prev])
      bumpAttachmentCount(editingTask.id, 1)
      notifyBoard('task', 'Attachment added', `${actorName} attached "${file.name}" to "${editingTask.title}"`)
    } catch (err) {
      alert(err.message || 'Could not upload attachment.')
    } finally {
      setAttachBusy(false)
    }
  }

  const handleDeleteAttachment = async (id) => {
    if (!confirm('Remove this attachment?')) return
    try {
      await deleteTaskAttachment(id)
      setAttachments((prev) => prev.filter((a) => a.id !== id))
      if (editingTask) bumpAttachmentCount(editingTask.id, -1)
    } catch (err) {
      alert(err.message || 'Could not remove attachment.')
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
      notifyBoard('task', 'Task moved', `${actorName} moved "${task.title}" to ${newCol?.name || 'another column'}`)
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
      notifyBoard('comment', 'New comment', `${actorName} commented on "${editingTask.title}"`)
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

        {/* Task modal — Trello-style two-pane layout */}
        {showTaskModal && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowTaskModal(false)}
          >
            <div
              className="bg-background-elevated border border-border rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top bar: column chip + close */}
              <div className="flex items-center justify-between px-6 py-3.5 border-b border-border">
                <span className="inline-flex items-center gap-2 text-xs font-medium text-text-secondary bg-background-tertiary border border-border rounded-md px-3 py-1.5">
                  {columns.find((c) => c.id === selectedColumn)?.name || 'Board'}
                </span>
                <button onClick={() => setShowTaskModal(false)} className="text-text-tertiary hover:text-text-primary">
                  <FiX size={22} />
                </button>
              </div>

              <div className="flex flex-1 min-h-0 flex-col md:flex-row">
                {/* LEFT — main content */}
                <div className="flex-1 min-w-0 overflow-y-auto p-6">
                  <form onSubmit={handleSaveTask} className="space-y-5">
                    {/* Title */}
                    {editable ? (
                      <input
                        type="text" value={taskForm.title} required
                        onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                        className="w-full bg-transparent text-2xl font-semibold text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-0 border-0 px-0"
                        placeholder="Task title…"
                      />
                    ) : (
                      <h2 className="text-2xl font-semibold text-text-primary break-words">{taskForm.title}</h2>
                    )}

                    {/* Click-to-add action buttons */}
                    {editable && (
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => setActivePanel((p) => (p === 'labels' ? null : 'labels'))}
                          className="inline-flex items-center gap-2 text-sm text-text-secondary bg-background-tertiary hover:bg-border-hover border border-border rounded-md px-3 py-1.5 transition-colors">
                          <FiTag size={14} /> Labels
                        </button>
                        <button type="button" onClick={() => setActivePanel((p) => (p === 'dates' ? null : 'dates'))}
                          className="inline-flex items-center gap-2 text-sm text-text-secondary bg-background-tertiary hover:bg-border-hover border border-border rounded-md px-3 py-1.5 transition-colors">
                          <FiCalendar size={14} /> Dates
                        </button>
                        <button type="button" onClick={() => setActivePanel((p) => (p === 'checklist' ? null : 'checklist'))}
                          className="inline-flex items-center gap-2 text-sm text-text-secondary bg-background-tertiary hover:bg-border-hover border border-border rounded-md px-3 py-1.5 transition-colors">
                          <FiCheckSquare size={14} /> Checklist
                        </button>
                        {canManage && (
                          <button type="button" onClick={() => setActivePanel((p) => (p === 'members' ? null : 'members'))}
                            className="inline-flex items-center gap-2 text-sm text-text-secondary bg-background-tertiary hover:bg-border-hover border border-border rounded-md px-3 py-1.5 transition-colors">
                            <FiUsers size={14} /> Members
                          </button>
                        )}
                        <button type="button" onClick={() => setActivePanel((p) => (p === 'attachments' ? null : 'attachments'))}
                          className="inline-flex items-center gap-2 text-sm text-text-secondary bg-background-tertiary hover:bg-border-hover border border-border rounded-md px-3 py-1.5 transition-colors">
                          <FiPaperclip size={14} /> Attachment
                        </button>
                      </div>
                    )}

                    {/* Labels */}
                    {(taskForm.label_color || (editable && activePanel === 'labels')) && (
                      <div>
                        <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                          <FiTag size={13} /> Labels
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {taskForm.label_color ? (
                            <span className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium"
                              style={{ backgroundColor: taskForm.label_color, color: contrastText(taskForm.label_color) }}>
                              {taskForm.label_text || 'Label'}
                              {editable && (
                                <button type="button" onClick={() => setTaskForm({ ...taskForm, label_color: '', label_text: '' })} className="opacity-70 hover:opacity-100">
                                  <FiX size={13} />
                                </button>
                              )}
                            </span>
                          ) : (
                            <span className="text-sm text-text-tertiary">No label</span>
                          )}
                        </div>

                        {editable && activePanel === 'labels' && (
                          <div className="mt-3 p-3 bg-background-tertiary border border-border rounded-lg max-w-sm">
                            <div className="grid grid-cols-5 gap-2 mb-3">
                              {LABEL_COLORS.map((c) => (
                                <button key={c.hex} type="button" title={c.name}
                                  onClick={() => setTaskForm({ ...taskForm, label_color: c.hex })}
                                  className={`h-8 rounded-md transition-transform hover:scale-105 ${taskForm.label_color === c.hex ? 'ring-2 ring-white ring-offset-2 ring-offset-background-tertiary' : ''}`}
                                  style={{ backgroundColor: c.hex }}
                                />
                              ))}
                            </div>
                            <input type="text" value={taskForm.label_text} placeholder="Label text (optional)"
                              onChange={(e) => setTaskForm({ ...taskForm, label_text: e.target.value })}
                              className="input mb-2" />
                            <button type="button" onClick={() => setTaskForm({ ...taskForm, label_color: '', label_text: '' })}
                              className="text-xs text-text-tertiary hover:text-text-primary">Clear label</button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Dates */}
                    {((taskForm.start_date || taskForm.due_date) || (editable && activePanel === 'dates')) && (
                      <div>
                        <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                          <FiCalendar size={13} /> Dates
                        </div>
                        {editable && activePanel === 'dates' ? (
                          <div className="grid grid-cols-2 gap-3 max-w-md">
                            <div>
                              <label className="block text-xs text-text-tertiary mb-1">Start</label>
                              <input type="date" value={taskForm.start_date}
                                onChange={(e) => setTaskForm({ ...taskForm, start_date: e.target.value })} className="input" />
                            </div>
                            <div>
                              <label className="block text-xs text-text-tertiary mb-1">Due</label>
                              <input type="date" value={taskForm.due_date}
                                onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })} className="input" />
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-text-secondary">
                            {taskForm.start_date && <span>{taskForm.start_date}</span>}
                            {taskForm.start_date && taskForm.due_date && <span> → </span>}
                            {taskForm.due_date && <span>{taskForm.due_date}</span>}
                            {!taskForm.start_date && !taskForm.due_date && <span className="text-text-tertiary">No dates set</span>}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Members / Assignee */}
                    {((taskForm.assignee) || (editable && activePanel === 'members')) && (
                      <div>
                        <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                          <FiUsers size={13} /> Members
                        </div>
                        {canManage && activePanel === 'members' ? (
                          <select value={taskForm.assignee}
                            onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })}
                            className="select max-w-md">
                            <option value="">Unassigned</option>
                            {assigneeOptions.map((o) => (
                              <option key={o.email} value={o.email}>{o.email}{o.you ? ' (you)' : ''}</option>
                            ))}
                          </select>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-text-secondary">
                            {taskForm.assignee ? (
                              <>
                                <span className="w-7 h-7 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-semibold uppercase">
                                  {taskForm.assignee.charAt(0)}
                                </span>
                                {taskForm.assignee}
                              </>
                            ) : (
                              <span className="text-text-tertiary">Unassigned</span>
                            )}
                            {!canManage && <span className="text-xs text-text-tertiary ml-1">· only admins can change this</span>}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Description */}
                    <div>
                      <label className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                        <FiAlignLeft size={13} /> Description
                      </label>
                      {editable ? (
                        <textarea
                          value={taskForm.description} rows="4"
                          onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                          className="textarea" placeholder="Add a more detailed description…"
                        />
                      ) : (
                        <div className="textarea whitespace-pre-wrap min-h-[80px]">
                          {taskForm.description
                            ? linkify(taskForm.description)
                            : <span className="text-text-tertiary">No description</span>}
                        </div>
                      )}
                    </div>

                    {/* Checklist */}
                    {(taskForm.checklist.length > 0 || (editable && activePanel === 'checklist')) && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                            <FiCheckSquare size={13} /> Checklist
                          </span>
                          {taskForm.checklist.length > 0 && (
                            <span className="text-xs text-text-tertiary">
                              {taskForm.checklist.filter((i) => i.done).length}/{taskForm.checklist.length}
                            </span>
                          )}
                        </div>

                        {taskForm.checklist.length > 0 && (
                          <div className="h-1.5 rounded-full bg-background-tertiary mb-3 overflow-hidden">
                            <div className="h-full bg-accent-green transition-all"
                              style={{ width: `${Math.round((taskForm.checklist.filter((i) => i.done).length / taskForm.checklist.length) * 100)}%` }} />
                          </div>
                        )}

                        <div className="space-y-1.5">
                          {taskForm.checklist.map((item) => (
                            <div key={item.id} className="flex items-center gap-2 group">
                              <input type="checkbox" checked={item.done} disabled={!editable}
                                onChange={() => toggleChecklistItem(item.id)}
                                className="w-4 h-4 rounded accent-accent-green cursor-pointer flex-shrink-0" />
                              <span className={`flex-1 text-sm ${item.done ? 'line-through text-text-tertiary' : 'text-text-secondary'}`}>
                                {item.text}
                              </span>
                              {editable && (
                                <button type="button" onClick={() => removeChecklistItem(item.id)}
                                  className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-red-500 transition-all">
                                  <FiTrash2 size={13} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        {editable && (
                          <div className="flex gap-2 mt-2">
                            <input type="text" value={newChecklistItem}
                              onChange={(e) => setNewChecklistItem(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addChecklistItem(newChecklistItem) } }}
                              className="input flex-1" placeholder="Add an item…" />
                            <button type="button" onClick={() => addChecklistItem(newChecklistItem)}
                              className="btn btn-secondary" disabled={!newChecklistItem.trim()}>
                              <FiPlus size={15} /> Add
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Attachments */}
                    {(attachments.length > 0 || (editable && activePanel === 'attachments')) && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                            <FiPaperclip size={13} /> Attachments
                          </span>
                          {editable && editingTask && (
                            <label className={`inline-flex items-center gap-2 text-xs cursor-pointer text-text-secondary hover:text-text-primary ${attachBusy ? 'opacity-50 pointer-events-none' : ''}`}>
                              {attachBusy ? <FiLoader className="animate-spin" size={13} /> : <FiPlus size={13} />} Add file
                              <input type="file" className="hidden" onChange={handleUploadAttachment} disabled={attachBusy} />
                            </label>
                          )}
                        </div>

                        {!editingTask ? (
                          <p className="text-sm text-text-tertiary">Save the task first, then you can attach files.</p>
                        ) : attachments.length === 0 ? (
                          <p className="text-sm text-text-tertiary">No attachments yet.</p>
                        ) : (
                          <div className="space-y-1.5">
                            {attachments.map((a) => (
                              <div key={a.id} className="flex items-center gap-3 p-2 rounded-md bg-background-tertiary border border-border group">
                                <FiPaperclip size={14} className="text-text-tertiary flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <a href={a.public_url} target="_blank" rel="noopener noreferrer"
                                    className="block text-sm text-text-primary truncate hover:text-accent">
                                    {a.name}
                                  </a>
                                  <span className="text-xs text-text-tertiary">{formatBytes(a.size)}</span>
                                </div>
                                <a href={a.public_url} target="_blank" rel="noopener noreferrer"
                                  className="p-1 text-text-tertiary hover:text-accent" title="Open / download">
                                  <FiDownload size={14} />
                                </a>
                                {(a.user_id === user?.id || canManage) && (
                                  <button type="button" onClick={() => handleDeleteAttachment(a.id)}
                                    className="p-1 text-text-tertiary hover:text-red-500" title="Remove">
                                    <FiTrash2 size={14} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Details — issue type / priority / points / estimate / tags */}
                    <div className="pt-4 border-t border-border space-y-4">
                      <div className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Details</div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-text-tertiary mb-1">Issue Type</label>
                          <select value={taskForm.issue_type} disabled={!editable}
                            onChange={(e) => setTaskForm({ ...taskForm, issue_type: e.target.value })} className="select">
                            {ISSUE_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-text-tertiary mb-1">Priority</label>
                          <select value={taskForm.priority} disabled={!editable}
                            onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })} className="select">
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-text-tertiary mb-1">Story Points</label>
                          <input type="number" min="0" step="1" value={taskForm.story_points} disabled={!editable}
                            onChange={(e) => setTaskForm({ ...taskForm, story_points: e.target.value })} className="input" placeholder="e.g. 3" />
                        </div>
                        <div>
                          <label className="block text-xs text-text-tertiary mb-1">Estimate (hours)</label>
                          <input type="number" min="0" step="0.5" value={taskForm.estimated_hours} disabled={!editable}
                            onChange={(e) => setTaskForm({ ...taskForm, estimated_hours: e.target.value })} className="input" placeholder="e.g. 8" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-text-tertiary mb-1">Tags (comma separated)</label>
                        <input type="text" value={taskForm.tags} disabled={!editable}
                          onChange={(e) => setTaskForm({ ...taskForm, tags: e.target.value })} className="input" placeholder="design, urgent, review" />
                      </div>
                    </div>

                    {editable && (
                      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                        <button type="button" onClick={() => setShowTaskModal(false)} className="btn btn-secondary">Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                          {saving ? <FiLoader className="animate-spin" size={16} /> : <FiSave size={16} />}
                          {editingTask ? 'Update Task' : 'Create Task'}
                        </button>
                      </div>
                    )}
                  </form>
                </div>

                {/* RIGHT — comments & activity */}
                <div className="w-full md:w-80 flex-shrink-0 border-t md:border-t-0 md:border-l border-border bg-background-secondary p-5 overflow-y-auto">
                  <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <FiMessageSquare size={15} /> Comments and activity
                    {editingTask && <span className="text-text-tertiary font-normal">({comments.length})</span>}
                  </h3>

                  {!editingTask ? (
                    <p className="text-sm text-text-tertiary">Comments become available once you create the task.</p>
                  ) : (
                    <>
                      {canContribute && (
                        <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
                          <input type="text" value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="input flex-1" placeholder="Write a comment…" />
                          <button type="submit" className="btn btn-primary" disabled={commentBusy || !newComment.trim()}>
                            {commentBusy ? <FiLoader className="animate-spin" size={16} /> : <FiSend size={16} />}
                          </button>
                        </form>
                      )}

                      <div className="space-y-3">
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
                                  <button onClick={() => handleDeleteComment(c.id)}
                                    className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-red-500 transition-all">
                                    <FiTrash2 size={12} />
                                  </button>
                                )}
                              </div>
                              <p className="text-sm text-text-secondary whitespace-pre-wrap break-words">{c.comment}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {!canContribute && (
                        <p className="text-xs text-text-tertiary mt-3">View-only access — you can&apos;t comment.</p>
                      )}
                    </>
                  )}
                </div>
              </div>
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
