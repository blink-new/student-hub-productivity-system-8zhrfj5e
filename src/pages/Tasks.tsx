import { useState, useEffect, useCallback } from 'react'
import { Plus, CheckSquare, Calendar, Clock, Tag } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useDataStore } from '../store/dataStore'
import type { Task } from '../types'

export default function Tasks() {
  const { store, user } = useDataStore()
  const [tasks, setTasks] = useState<Task[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board')

  const loadTasks = useCallback(async () => {
    try {
      const tasksData = await store.getTasks()
      setTasks(tasksData)
    } catch (error) {
      console.error('Error loading tasks:', error)
    }
  }, [store])

  useEffect(() => {
    if (!user) return
    loadTasks()
  }, [store, user, loadTasks])

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      await store.createTask(taskData)
      await loadTasks()
      setShowAddForm(false)
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    try {
      await store.updateTask(id, updates)
      await loadTasks()
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default: return 'bg-green-500/20 text-green-400 border-green-500/30'
    }
  }

  const getStatusTasks = (status: Task['status']) => {
    return tasks.filter(task => task.status === status)
  }

  const TaskCard = ({ task }: { task: Task }) => (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="font-medium text-white">{task.title}</h3>
            <span className={`text-xs px-2 py-1 rounded border ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
          </div>
          
          {task.description && (
            <p className="text-sm text-slate-400">{task.description}</p>
          )}
          
          <div className="flex items-center gap-4 text-xs text-slate-400">
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(task.dueDate).toLocaleDateString()}
              </div>
            )}
            {task.estimatedDuration && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {task.estimatedDuration}m
              </div>
            )}
          </div>
          
          {task.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              <Tag className="w-3 h-3 text-slate-500" />
              {task.tags.map((tag, index) => (
                <span key={index} className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleUpdateTask(task.id, { 
                status: task.status === 'completed' ? 'not_started' : 'completed',
                completedAt: task.status === 'completed' ? undefined : new Date().toISOString()
              })}
            >
              {task.status === 'completed' ? 'Undo' : 'Complete'}
            </Button>
            {task.status === 'not_started' && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleUpdateTask(task.id, { status: 'in_progress' })}
              >
                Start
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pt-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <CheckSquare className="w-6 h-6" />
              Task Manager
            </h1>
            <p className="text-slate-400 text-sm">Stay organized and productive</p>
          </div>
          <Button onClick={() => setShowAddForm(true)} size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* View Toggle */}
        <div className="flex bg-slate-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode('board')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'board' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Board
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            List
          </button>
        </div>

        {/* Tasks Display */}
        {viewMode === 'board' ? (
          <div className="space-y-6">
            {/* To Do */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                📋 To Do ({getStatusTasks('not_started').length})
              </h2>
              {getStatusTasks('not_started').map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>

            {/* In Progress */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                🔄 In Progress ({getStatusTasks('in_progress').length})
              </h2>
              {getStatusTasks('in_progress').map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>

            {/* Completed */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                ✅ Completed ({getStatusTasks('completed').length})
              </h2>
              {getStatusTasks('completed').map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}

        {/* Add Task Form */}
        {showAddForm && (
          <TaskForm
            onSubmit={handleCreateTask}
            onCancel={() => setShowAddForm(false)}
          />
        )}
      </div>
    </div>
  )
}

interface TaskFormProps {
  onSubmit: (data: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

function TaskForm({ onSubmit, onCancel }: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'not_started' as Task['status'],
    priority: 'medium' as Task['priority'],
    dueDate: '',
    tags: [] as string[],
    estimatedDuration: 30
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
    setFormData({ ...formData, tags })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Task</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Duration (min)</label>
              <input
                type="number"
                value={formData.estimatedDuration}
                onChange={(e) => setFormData({ ...formData, estimatedDuration: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Tags (comma separated)</label>
            <input
              type="text"
              placeholder="study, urgent, personal"
              onChange={handleTagsChange}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Create Task
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}