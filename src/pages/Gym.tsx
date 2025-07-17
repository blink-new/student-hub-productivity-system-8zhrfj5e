import { useState, useEffect, useCallback } from 'react'
import { Plus, Dumbbell, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useDataStore } from '../store/dataStore'
import type { Workout } from '../types'

export default function Gym() {
  const { store, user } = useDataStore()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [showAddForm, setShowAddForm] = useState(false)

  const loadWorkouts = useCallback(async () => {
    try {
      const workoutsData = await store.getWorkouts()
      setWorkouts(workoutsData)
    } catch (error) {
      console.error('Error loading workouts:', error)
    }
  }, [store])

  useEffect(() => {
    if (!user) return
    loadWorkouts()
  }, [store, user, loadWorkouts])

  const handleCreateWorkout = async (workoutData: Omit<Workout, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      await store.createWorkout(workoutData)
      await loadWorkouts()
      setShowAddForm(false)
    } catch (error) {
      console.error('Error creating workout:', error)
    }
  }

  const getTypeIcon = (type: Workout['type']) => {
    const icons = {
      boxing: '🥊',
      gym: '🏋️',
      wrestling: '🤼',
      cardio: '🏃',
      other: '💪'
    }
    return icons[type] || '💪'
  }

  const thisWeekWorkouts = workouts.filter(workout => {
    const workoutDate = new Date(workout.date)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return workoutDate >= weekAgo
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between pt-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Dumbbell className="w-6 h-6" />
              Gym & Fight Log
            </h1>
            <p className="text-slate-400 text-sm">Track your physical training</p>
          </div>
          <Button onClick={() => setShowAddForm(true)} size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white">{thisWeekWorkouts.length}</div>
              <div className="text-xs text-slate-400">This Week</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white">
                {Math.floor(thisWeekWorkouts.reduce((sum, w) => sum + w.duration, 0) / 60)}h
              </div>
              <div className="text-xs text-slate-400">Total Time</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Workouts</CardTitle>
          </CardHeader>
          <CardContent>
            {workouts.length === 0 ? (
              <div className="text-center py-8">
                <Dumbbell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">No workouts logged yet</p>
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Log Workout
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {workouts.slice(0, 10).map((workout) => (
                  <div key={workout.id} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-2xl">{getTypeIcon(workout.type)}</span>
                    <div className="flex-1">
                      <h3 className="font-medium text-white">{workout.title}</h3>
                      <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                        <span>{new Date(workout.date).toLocaleDateString()}</span>
                        <span>{workout.duration}m</span>
                        {workout.bodyWeight && <span>{workout.bodyWeight}kg</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-white">Energy: {workout.energyMood}/10</div>
                      {workout.completed && <div className="text-emerald-400 text-xs">✓ Done</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {showAddForm && (
          <WorkoutForm
            onSubmit={handleCreateWorkout}
            onCancel={() => setShowAddForm(false)}
          />
        )}
      </div>
    </div>
  )
}

interface WorkoutFormProps {
  onSubmit: (data: Omit<Workout, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

function WorkoutForm({ onSubmit, onCancel }: WorkoutFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'gym' as Workout['type'],
    date: new Date().toISOString().split('T')[0],
    duration: 60,
    details: '',
    bodyWeight: 0,
    energyMood: 5,
    completed: true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Workout</CardTitle>
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
              placeholder="e.g., Upper Body Strength"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Workout['type'] })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              >
                <option value="gym">🏋️ Gym</option>
                <option value="boxing">🥊 Boxing</option>
                <option value="wrestling">🤼 Wrestling</option>
                <option value="cardio">🏃 Cardio</option>
                <option value="other">💪 Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Duration (min)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Body Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={formData.bodyWeight}
                onChange={(e) => setFormData({ ...formData, bodyWeight: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Energy/Mood (1-10)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.energyMood}
                onChange={(e) => setFormData({ ...formData, energyMood: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Details</label>
            <textarea
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              rows={3}
              placeholder="Sets, reps, weights, notes..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Log Workout
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