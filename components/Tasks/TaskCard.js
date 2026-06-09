import { FiClock, FiMessageSquare, FiTrash2, FiEdit, FiAlertCircle } from 'react-icons/fi'
import { format } from 'date-fns'

export default function TaskCard({ task, onEdit, onDelete }) {
  const priorityColors = {
    low: 'bg-gray-100/80 text-gray-600 border border-gray-200',
    medium: 'bg-blue-100/80 text-blue-600 border border-blue-200',
    high: 'bg-orange-100/80 text-orange-600 border border-orange-200',
    urgent: 'bg-red-100/80 text-red-600 border border-red-200 shadow-sm shadow-red-200/50',
  }

  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('taskId', task.id)
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="task-card bg-background-elevated border border-border rounded-lg p-4 mb-3 cursor-move hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10 transition-all group hover:scale-[1.02]"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-medium text-text-primary flex-1 pr-2">
          {task.title}
        </h4>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <button
            onClick={() => onEdit(task)}
            className="p-1 text-text-tertiary hover:text-accent transition-colors"
          >
            <FiEdit size={14} />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 text-text-tertiary hover:text-red-500 transition-colors"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-text-secondary mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {task.tags.map((tag, index) => {
            const colors = ['#e9d5ff', '#dbeafe', '#d1fae5', '#fef3c7', '#fee2e2']
            const textColors = ['#8b5cf6', '#3b82f6', '#059669', '#d97706', '#dc2626']
            const tagColor = colors[index % colors.length]
            const textColor = textColors[index % textColors.length]
            return (
              <span
                key={index}
                className="text-xs px-2.5 py-1 rounded-md font-medium"
                style={{
                  backgroundColor: tagColor,
                  color: textColor,
                  border: `1px solid ${textColor}30`
                }}
              >
                {tag}
              </span>
            )
          })}
        </div>
      )}

      {/* Client/Project */}
      {(task.client || task.project) && (
        <div className="text-xs text-text-tertiary mb-3">
          {task.client?.name && <span>{task.client.name}</span>}
          {task.client?.name && task.project?.name && <span> • </span>}
          {task.project?.name && <span>{task.project.name}</span>}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {/* Priority */}
          <span className={`px-2 py-0.5 rounded ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>

          {/* Due Date */}
          {task.due_date && (
            <div className="flex items-center gap-1 text-text-tertiary">
              <FiClock size={12} />
              <span>{format(new Date(task.due_date), 'MMM dd')}</span>
            </div>
          )}
        </div>

        {/* Comments Count */}
        {task.comments && task.comments[0]?.count > 0 && (
          <div className="flex items-center gap-1 text-text-tertiary">
            <FiMessageSquare size={12} />
            <span>{task.comments[0].count}</span>
          </div>
        )}
      </div>

      {/* Overdue indicator */}
      {task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done' && (
        <div className="mt-2 pt-2 border-t border-border">
          <div className="flex items-center gap-1 text-xs text-red-500">
            <FiAlertCircle size={12} />
            <span>Overdue</span>
          </div>
        </div>
      )}
    </div>
  )
}

