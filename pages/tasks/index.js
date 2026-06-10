import { useState, useEffect } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import TaskColumn from '../../components/Tasks/TaskColumn'
import { FiPlus, FiFilter, FiSearch, FiX, FiLoader, FiSave } from 'react-icons/fi'
import { getTaskColumns, getTasks, createTask, updateTask, deleteTask, moveTask, syncTaskStatusWithColumns } from '../../lib/api/tasks'
import { getClients } from '../../lib/api/clients'
import { getProjects } from '../../lib/api/projects'
import { useTheme } from '../../contexts/ThemeContext'

export default function Tasks() {
  const { theme } = useTheme()
  const [columns, setColumns] = useState([])
  const [tasks, setTasks] = useState([])
  const [clients, setClients] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [selectedColumn, setSelectedColumn] = useState(null)
  const [editingTask, setEditingTask] = useState(null)
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    client_id: '',
    project_id: '',
    due_date: '',
    tags: '',
  })

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

  // Light mode color gradients (ultra light, barely visible pastel shades)
  const getLightGradientStyle = (colorType) => {
    const gradients = {
      purple: {
        background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
        boxShadow: '0 1px 4px rgba(250, 245, 255, 0.1)'
      },
      blue: {
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        boxShadow: '0 1px 4px rgba(240, 249, 255, 0.1)'
      },
      green: {
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        boxShadow: '0 1px 4px rgba(240, 253, 244, 0.1)'
      },
      red: {
        background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
        boxShadow: '0 1px 4px rgba(254, 242, 242, 0.1)'
      }
    }
    
    return gradients[colorType]
  }

  // Sync task status with columns
  const syncTaskStatus = async () => {
    try {
      const result = await syncTaskStatusWithColumns()
      console.log(result.message)
      
      // Reload tasks after sync
      const tasksData = await getTasks()
      setTasks(tasksData)
    } catch (error) {
      console.error('Error syncing task status:', error)
    }
  }

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [columnsData, tasksData, clientsData, projectsData] = await Promise.all([
          getTaskColumns(),
          getTasks(),
          getClients(),
          getProjects(),
        ])
        setColumns(columnsData)
        setTasks(tasksData)
        setClients(clientsData)
        setProjects(projectsData)
        
        // Sync task status with columns after loading
        await syncTaskStatus()
      } catch (error) {
        console.error('Error loading tasks:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Handle add task
  const handleAddTask = (columnId) => {
    setSelectedColumn(columnId)
    setEditingTask(null)
    setTaskForm({
      title: '',
      description: '',
      priority: 'medium',
      client_id: '',
      project_id: '',
      due_date: '',
      tags: '',
    })
    setShowTaskModal(true)
  }

  // Handle edit task
  const handleEditTask = (task) => {
    setEditingTask(task)
    setSelectedColumn(task.column_id)
    setTaskForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      client_id: task.client_id || '',
      project_id: task.project_id || '',
      due_date: task.due_date || '',
      tags: task.tags ? task.tags.join(', ') : '',
    })
    setShowTaskModal(true)
  }

  // Handle save task
  const handleSaveTask = async (e) => {
    e.preventDefault()
    
    try {
      const tagsArray = taskForm.tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0)

      // Determine status based on selected column
      const selectedColumnData = columns.find(c => c.id === selectedColumn)
      const taskStatus = selectedColumnData ? getStatusFromColumnName(selectedColumnData.name) : 'todo'

      const taskData = {
        title: taskForm.title,
        description: taskForm.description,
        priority: taskForm.priority,
        client_id: taskForm.client_id || null,
        project_id: taskForm.project_id || null,
        due_date: taskForm.due_date || null,
        tags: tagsArray.length > 0 ? tagsArray : null,
        column_id: selectedColumn,
        status: taskStatus,
      }

      if (editingTask) {
        // Update existing task
        const updated = await updateTask(editingTask.id, taskData)
        setTasks(tasks.map(t => t.id === updated.id ? updated : t))
      } else {
        // Create new task
        const newTask = await createTask(taskData)
        setTasks([...tasks, newTask])
      }

      setShowTaskModal(false)
    } catch (error) {
      console.error('Error saving task:', error)
      alert('Error saving task')
    }
  }

  // Handle delete task
  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      await deleteTask(taskId)
      setTasks(tasks.filter(t => t.id !== taskId))
    } catch (error) {
      console.error('Error deleting task:', error)
      alert('Error deleting task')
    }
  }

  // Handle drag and drop
  const handleDrop = async (taskId, newColumnId) => {
    try {
      const task = tasks.find(t => t.id === taskId)
      if (!task || task.column_id === newColumnId) return

      // Find the new column to get its name and determine status
      const newColumn = columns.find(c => c.id === newColumnId)
      const newStatus = newColumn ? getStatusFromColumnName(newColumn.name) : task.status

      // Optimistic update
      const updatedTasks = tasks.map(t =>
        t.id === taskId ? { 
          ...t, 
          column_id: newColumnId,
          status: newStatus,
          completed_at: newStatus === 'done' ? new Date().toISOString() : null
        } : t
      )
      setTasks(updatedTasks)

      // Update in database with status
      await moveTask(taskId, newColumnId, 0, newStatus)
    } catch (error) {
      console.error('Error moving task:', error)
      // Revert on error
      const [columnsData, tasksData] = await Promise.all([
        getTaskColumns(),
        getTasks(),
      ])
      setColumns(columnsData)
      setTasks(tasksData)
    }
  }

  // Filter tasks by search
  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Group tasks by column
  const tasksByColumn = columns.reduce((acc, column) => {
    acc[column.id] = filteredTasks.filter(task => task.column_id === column.id)
    return acc
  }, {})

  return (
    <>
      <Head>
        <title>Task Management - Boarded</title>
      </Head>
      <Layout>
        <div className="space-y-6 fade-in">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-text-primary mb-2">
                Task Management
              </h1>
              <p className="text-text-secondary">
                Organize and track your tasks with Kanban boards
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={syncTaskStatus}
                className="btn btn-secondary"
                title="Sync task status with columns"
              >
                🔄 Sync Status
              </button>
              <button
                onClick={() => {
                  // Add task widget to dashboard
                  alert('Task stats widget added to dashboard!')
                  // TODO: Implement actual widget addition
                }}
                className="btn btn-secondary"
              >
                📊 Add to Dashboard
              </button>
              <button
                onClick={() => {
                  if (columns.length > 0) {
                    handleAddTask(columns[0].id)
                  } else {
                    alert('Please wait for columns to load')
                  }
                }}
                className="btn btn-primary"
              >
                <FiPlus size={18} />
                Add Task
              </button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>
            <button className="btn btn-secondary">
              <FiFilter size={16} />
              Filter
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Tasks - Purple */}
            <div className="card stats-card-purple bg-gradient-to-br from-purple-500/20 to-purple-500/10 border-purple-500/30 hover:border-purple-500/50 transition-all"
              style={theme === 'light' ? getLightGradientStyle('purple') : {}}
            >
              <p className="stats-card-label text-purple-300 text-xs mb-1 font-medium">Total Tasks</p>
              <p className="stats-card-value text-3xl font-bold text-purple-200">{tasks.length}</p>
            </div>

            {/* In Progress - Blue */}
            <div className="card stats-card-blue bg-gradient-to-br from-blue-500/20 to-blue-500/10 border-blue-500/30 hover:border-blue-500/50 transition-all"
              style={theme === 'light' ? getLightGradientStyle('blue') : {}}
            >
              <p className="stats-card-label text-blue-300 text-xs mb-1 font-medium">In Progress</p>
              <p className="stats-card-value text-3xl font-bold text-blue-200">
                {tasks.filter(t => t.status === 'in_progress').length}
              </p>
            </div>

            {/* Completed - Green */}
            <div className="card stats-card-green bg-gradient-to-br from-green-500/20 to-green-500/10 border-green-500/30 hover:border-green-500/50 transition-all"
              style={theme === 'light' ? getLightGradientStyle('green') : {}}
            >
              <p className="stats-card-label text-green-300 text-xs mb-1 font-medium">Completed</p>
              <p className="stats-card-value text-3xl font-bold text-green-200">
                {tasks.filter(t => t.status === 'done').length}
              </p>
            </div>

            {/* High Priority - Red */}
            <div className="card stats-card-red bg-gradient-to-br from-red-500/20 to-red-500/10 border-red-500/30 hover:border-red-500/50 transition-all"
              style={theme === 'light' ? getLightGradientStyle('red') : {}}
            >
              <p className="stats-card-label text-red-300 text-xs mb-1 font-medium">High Priority</p>
              <p className="stats-card-value text-3xl font-bold text-red-200">
                {tasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length}
              </p>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <FiLoader className="animate-spin text-accent mx-auto mb-4" size={32} />
              <p className="text-text-secondary">Loading tasks...</p>
            </div>
          )}

          {/* Kanban Board - Horizontal Scrolling */}
          {!loading && (
            <div className="relative">
              <div className="overflow-x-auto pb-6" style={{ 
                scrollbarWidth: 'thin', 
                scrollbarColor: theme === 'light' ? '#d4d4d4 #fafafa' : '#333333 #0a0a0a',
                boxShadow: 'none'
              }}>
                <div className="flex gap-6 min-w-max pb-2">
                  {columns.map(column => (
                    <TaskColumn
                      key={column.id}
                      column={column}
                      tasks={tasksByColumn[column.id] || []}
                      onAddTask={handleAddTask}
                      onEditTask={handleEditTask}
                      onDeleteTask={handleDeleteTask}
                      onDrop={handleDrop}
                    />
                  ))}
                </div>
              </div>
              {/* Scroll Indicator */}
              <div className="absolute right-0 top-0 bottom-6 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
            </div>
          )}
        </div>

        {/* Task Modal */}
        {showTaskModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-text-primary">
                  {editingTask ? 'Edit Task' : 'New Task'}
                </h2>
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="text-text-tertiary hover:text-text-primary transition-colors"
                >
                  <FiX size={24} />
                </button>
              </div>

              <form onSubmit={handleSaveTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    className="input"
                    placeholder="What needs to be done?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Description
                  </label>
                  <textarea
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    className="textarea"
                    rows="4"
                    placeholder="Add more details..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Priority
                    </label>
                    <select
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                      className="select"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={taskForm.due_date}
                      onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Project (Optional)
                    </label>
                    <select
                      value={taskForm.project_id}
                      onChange={(e) => {
                        const projectId = e.target.value
                        // Picking a project auto-fills its client (a project
                        // already belongs to one), keeping the two consistent.
                        const proj = projects.find(p => p.id === projectId)
                        setTaskForm({
                          ...taskForm,
                          project_id: projectId,
                          client_id: proj?.client_id ?? taskForm.client_id,
                        })
                      }}
                      className="select"
                    >
                      <option value="">No project</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.name}{project.client?.name ? ` — ${project.client.name}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Client (Optional)
                    </label>
                    <select
                      value={taskForm.client_id}
                      onChange={(e) => setTaskForm({ ...taskForm, client_id: e.target.value })}
                      className="select"
                    >
                      <option value="">No client</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={taskForm.tags}
                    onChange={(e) => setTaskForm({ ...taskForm, tags: e.target.value })}
                    className="input"
                    placeholder="design, urgent, review"
                  />
                  <p className="text-xs text-text-tertiary mt-1">
                    Separate tags with commas
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowTaskModal(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <FiSave size={18} />
                    {editingTask ? 'Update Task' : 'Create Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Layout>
    </>
  )
}

