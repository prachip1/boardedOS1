import { FiClock, FiMessageSquare, FiTrash2, FiEdit, FiAlertCircle, FiCheckSquare, FiBookmark, FiZap, FiAlertOctagon } from 'react-icons/fi'
import { format } from 'date-fns'

// Jira-style issue type glyph + color (shown as a small chip on each card).
const ISSUE_TYPE_META = {
  task:  { icon: FiCheckSquare,  color: '#5e6ad2', label: 'Task' },
  bug:   { icon: FiAlertOctagon, color: '#ef4444', label: 'Bug' },
  story: { icon: FiBookmark,     color: '#34d399', label: 'Story' },
  epic:  { icon: FiZap,          color: '#b8a6ff', label: 'Epic' },
}

export default function TaskCard({ task, onEdit, onDelete, canEdit = true, canDelete = true }) {
  const priorityColors = {
    low: 'bg-background-tertiary text-text-secondary border border-border',
    medium: 'bg-accent-lavender text-black font-semibold',
    high: 'bg-accent-coral text-black font-semibold',
    urgent: 'bg-accent-red text-white font-semibold shadow-sm shadow-red-500/30',
  }

  const issueMeta = ISSUE_TYPE_META[task.issue_type] || ISSUE_TYPE_META.task
  const IssueIcon = issueMeta.icon

  const handleDragStart = (e) => {
    if (!canEdit) {
      // Members can't move cards that aren't theirs — block the drag.
      e.preventDefault()
      return
    }
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('taskId', task.id)
  }

  return (
    <div
      draggable={canEdit}
      onDragStart={handleDragStart}
      className={`task-card bg-background-elevated border border-border rounded-lg p-4 mb-3 transition-all group hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10 hover:scale-[1.02] ${canEdit ? 'cursor-move' : 'cursor-pointer'}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-2 flex-1 pr-2 min-w-0">
          <span
            className="mt-0.5 flex-shrink-0 inline-flex items-center justify-center w-5 h-5 rounded"
            style={{ backgroundColor: `${issueMeta.color}22`, color: issueMeta.color }}
            title={issueMeta.label}
          >
            <IssueIcon size={12} />
          </span>
          <h4 className="text-sm font-medium text-text-primary min-w-0">
            {task.title}
          </h4>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <button
            onClick={() => onEdit(task)}
            className="p-1 text-text-tertiary hover:text-accent transition-colors"
            title={canEdit ? 'Edit' : 'View'}
          >
            <FiEdit size={14} />
          </button>
          {canDelete && (
            <button
              onClick={() => onDelete(task.id)}
              className="p-1 text-text-tertiary hover:text-red-500 transition-colors"
              title="Delete"
            >
              <FiTrash2 size={14} />
            </button>
          )}
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

          {/* Story points */}
          {(task.story_points || task.story_points === 0) && (
            <span
              className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-background-tertiary text-text-secondary border border-border font-semibold"
              title={`${task.story_points} story point${task.story_points === 1 ? '' : 's'}`}
            >
              {task.story_points}
            </span>
          )}

          {/* Due Date */}
          {task.due_date && (
            <div className="flex items-center gap-1 text-text-tertiary">
              <FiClock size={12} />
              <span>{format(new Date(task.due_date), 'MMM dd')}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Comments Count */}
          {task.comments && task.comments[0]?.count > 0 && (
            <div className="flex items-center gap-1 text-text-tertiary">
              <FiMessageSquare size={12} />
              <span>{task.comments[0].count}</span>
            </div>
          )}

          {/* Assignee */}
          {task.assignee && (
            <div
              className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-[10px] font-semibold uppercase"
              title={`Assigned to ${task.assignee}`}
            >
              {task.assignee.charAt(0)}
            </div>
          )}
        </div>
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

