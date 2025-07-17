import { useState, useEffect, useCallback } from 'react'
import { Plus, Target, Calendar, TrendingUp, Edit, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Progress } from '../components/ui/Progress'
import { useDataStore } from '../store/dataStore'
import type { Goal } from '../types'

export default function Goals() {
  const { store, user } = useDataStore()
  const [goals, setGoals] = useState<Goal[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')

  useEffect(() => {
    if (!user) return
    loadGoals()
  }, [store, user, loadGoals])

  const loadGoals = useCallback(async () => {
    try {
      const goalsData = await store.getGoals()
      setGoals(goalsData)
    } catch (error) {
      console.error('Error loading goals:', error)
    }
  }, [store])

  const handleCreateGoal = async (goalData: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      await store.createGoal(goalData)
      await loadGoals()
      setShowAddForm(false)
    } catch (error) {
      console.error('Error creating goal:', error)
    }
  }

  const handleUpdateGoal = async (id: string, updates: Partial<Goal>) => {
    try {
      await store.updateGoal(id, updates)
      await loadGoals()
      setEditingGoal(null)
    } catch (error) {
      console.error('Error updating goal:', error)
    }
  }

  const handleDeleteGoal = async (id: string) => {
    try {
      await store.deleteGoal(id)
      await loadGoals()
    } catch (error) {
      console.error('Error deleting goal:', error)
    }
  }

  const calculateProgress = (goal: Goal) => {
    if (goal.targetValue === goal.initialValue) return 100
    return Math.min(100, Math.max(0, 
      ((goal.currentValue - goal.initialValue) / (goal.targetValue - goal.initialValue)) * 100
    ))
  }

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'completed': return 'text-emerald-400 bg-emerald-500/20'
      case 'in_progress': return 'text-blue-400 bg-blue-500/20'
      default: return 'text-slate-400 bg-slate-500/20'
    }
  }

  const getCategoryIcon = (category: Goal['category']) => {
    switch (category) {
      case 'academic': return '📚'
      case 'fitness': return '💪'
      case 'spiritual': return '🤲'
      default: return '🎯'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pt-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Target className="w-6 h-6" />
              Goals & Vision
            </h1>
            <p className="text-slate-400 text-sm">Track your journey to greatness</p>
          </div>
          <Button onClick={() => setShowAddForm(true)} size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* View Toggle */}
        <div className="flex bg-slate-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode('cards')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'cards' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Cards
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

        {/* Goals Display */}
        {goals.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Target className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">No goals yet. Create your first goal!</p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Goal
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'cards' ? 'space-y-4' : 'space-y-2'}>
            {goals.map((goal) => {
              const progress = calculateProgress(goal)
              
              if (viewMode === 'cards') {
                return (
                  <Card key={goal.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <span>{getCategoryIcon(goal.category)}</span>
                            {goal.title}
                          </CardTitle>
                          <p className="text-sm text-slate-400 mt-1">{goal.description}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setEditingGoal(goal)}
                            className="w-8 h-8"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="w-8 h-8 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">Progress</span>
                          <span className="text-white font-medium">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} />
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>{goal.initialValue} → {goal.currentValue} → {goal.targetValue}</span>
                          <span className={`px-2 py-1 rounded ${getStatusColor(goal.status)}`}>
                            {goal.status.replace('_', ' ')}
                          </span>
                        </div>
                        {goal.deadline && (
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <Calendar className="w-3 h-3" />
                            Due: {new Date(goal.deadline).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              } else {
                return (
                  <Card key={goal.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getCategoryIcon(goal.category)}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white truncate">{goal.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={progress} className="flex-1 h-1" />
                          <span className="text-xs text-slate-400 whitespace-nowrap">
                            {Math.round(progress)}%
                          </span>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(goal.status)}`}>
                        {goal.status.replace('_', ' ')}
                      </span>
                    </div>
                  </Card>
                )
              }
            })}
          </div>
        )}

        {/* Add/Edit Goal Form */}
        {(showAddForm || editingGoal) && (
          <GoalForm
            goal={editingGoal}
            onSubmit={editingGoal ? 
              (data) => handleUpdateGoal(editingGoal.id, data) : 
              handleCreateGoal
            }
            onCancel={() => {
              setShowAddForm(false)
              setEditingGoal(null)
            }}
          />
        )}
      </div>
    </div>
  )
}

interface GoalFormProps {
  goal?: Goal | null
  onSubmit: (data: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

function GoalForm({ goal, onSubmit, onCancel }: GoalFormProps) {
  const [formData, setFormData] = useState({
    title: goal?.title || '',
    category: goal?.category || 'academic' as Goal['category'],
    description: goal?.description || '',
    initialValue: goal?.initialValue || 0,
    targetValue: goal?.targetValue || 100,
    currentValue: goal?.currentValue || 0,
    status: goal?.status || 'not_started' as Goal['status'],
    deadline: goal?.deadline || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{goal ? 'Edit Goal' : 'New Goal'}</CardTitle>
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
            <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as Goal['category'] })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            >
              <option value="academic">📚 Academic</option>
              <option value="fitness">💪 Fitness</option>
              <option value="spiritual">🤲 Spiritual</option>
              <option value="personal">🎯 Personal</option>
            </select>
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

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Initial</label>
              <input
                type="number"
                value={formData.initialValue}
                onChange={(e) => setFormData({ ...formData, initialValue: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Current</label>
              <input
                type="number"
                value={formData.currentValue}
                onChange={(e) => setFormData({ ...formData, currentValue: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Target</label>
              <input
                type="number"
                value={formData.targetValue}
                onChange={(e) => setFormData({ ...formData, targetValue: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Goal['status'] })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            >
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Deadline</label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {goal ? 'Update' : 'Create'} Goal
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