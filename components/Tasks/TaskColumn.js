import { useState } from 'react'
import { FiPlus, FiMoreVertical } from 'react-icons/fi'
import TaskCard from './TaskCard'

export default function TaskColumn({ column, tasks, onAddTask, onEditTask, onDeleteTask, onDrop }) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const taskId = e.dataTransfer.getData('taskId')
    onDrop(taskId, column.id)
  }

  return (
    <div className="flex-shrink-0 w-80">
      {/* Column Header */}
      <div className="task-column-header mb-4 flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <div 
            className="w-2 h-8 rounded-full shadow-lg" 
            style={{ backgroundColor: column.color, boxShadow: `0 0 15px ${column.color}60` }}
          />
          <h3 className="font-semibold text-text-primary text-base">
            {column.name}
          </h3>
          <span 
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ 
              backgroundColor: `${column.color}30`,
              color: column.color,
              border: `1px solid ${column.color}50`,
              boxShadow: `0 0 8px ${column.color}30`
            }}
          >
            {tasks.length}
          </span>
        </div>
        <button className="p-1.5 text-text-tertiary hover:text-text-primary hover:bg-background-elevated rounded transition-colors">
          <FiMoreVertical size={16} />
        </button>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`task-column-drop-zone min-h-[600px] rounded-xl p-4 transition-all border-2 ${
          isDragOver 
            ? 'border-dashed shadow-lg'
            : 'bg-background-secondary/30 border-border/30 hover:border-border/50'
        }`}
        style={isDragOver ? {
          backgroundColor: `${column.color}20`,
          borderColor: column.color,
          boxShadow: `0 0 25px ${column.color}50`
        } : {}}
      >
        {/* Tasks */}
        <div className="space-y-3">
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </div>

        {/* Add Task Button */}
        <button
          onClick={() => onAddTask(column.id)}
          className="w-full mt-3 py-3 px-4 border-2 border-dashed rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 hover:shadow-lg"
          style={{
            borderColor: `${column.color}50`,
            color: column.color,
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = `${column.color}20`
            e.currentTarget.style.borderColor = column.color
            e.currentTarget.style.boxShadow = `0 0 15px ${column.color}30`
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.borderColor = `${column.color}50`
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <FiPlus size={16} />
          Add Task
        </button>
      </div>
    </div>
  )
}

