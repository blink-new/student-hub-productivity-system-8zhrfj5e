import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Slider } from '../ui/slider'
import { Dumbbell } from 'lucide-react'

interface WorkoutLogModalProps {
  trigger?: React.ReactNode
  onWorkoutAdd?: (workout: any) => void
}

export default function WorkoutLogModal({ trigger, onWorkoutAdd }: WorkoutLogModalProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    type: 'gym',
    duration: '60',
    bodyWeight: '',
    energy: [7],
    mood: [7],
    details: ''
  })

  const workoutTypes = [
    { value: 'gym', label: '🏋️ Gym/Weights', color: 'text-red-400' },
    { value: 'boxing', label: '🥊 Boxing', color: 'text-orange-400' },
    { value: 'wrestling', label: '🤼 Wrestling', color: 'text-yellow-400' },
    { value: 'cardio', label: '🏃 Cardio', color: 'text-blue-400' },
    { value: 'martial-arts', label: '🥋 Martial Arts', color: 'text-purple-400' },
    { value: 'other', label: '💪 Other', color: 'text-slate-400' }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newWorkout = {
      id: Date.now(),
      title: formData.title,
      type: formData.type,
      duration: parseInt(formData.duration),
      bodyWeight: formData.bodyWeight ? parseFloat(formData.bodyWeight) : null,
      energy: formData.energy[0],
      mood: formData.mood[0],
      details: formData.details,
      date: new Date().toISOString().split('T')[0],
      completed: true,
      createdAt: new Date().toISOString()
    }

    onWorkoutAdd?.(newWorkout)
    
    // Reset form
    setFormData({
      title: '',
      type: 'gym',
      duration: '60',
      bodyWeight: '',
      energy: [7],
      mood: [7],
      details: ''
    })
    
    setOpen(false)
  }

  const getEnergyLabel = (value: number) => {
    if (value <= 2) return '😴 Very Low'
    if (value <= 4) return '😐 Low'
    if (value <= 6) return '🙂 Moderate'
    if (value <= 8) return '😊 High'
    return '🔥 Very High'
  }

  const getMoodLabel = (value: number) => {
    if (value <= 2) return '😞 Poor'
    if (value <= 4) return '😕 Low'
    if (value <= 6) return '😐 Okay'
    if (value <= 8) return '😊 Good'
    return '😄 Excellent'
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-red-600 hover:bg-red-700 text-white">
            <Dumbbell size={16} className="mr-2" />
            Log Workout
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Log Workout Session</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-slate-300">Workout Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Upper Body Strength"
              className="bg-slate-700 border-slate-600 text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Workout Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {workoutTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration" className="text-slate-300">Duration (min)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
                min="1"
                max="300"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bodyWeight" className="text-slate-300">Body Weight (kg) - Optional</Label>
            <Input
              id="bodyWeight"
              type="number"
              step="0.1"
              value={formData.bodyWeight}
              onChange={(e) => setFormData(prev => ({ ...prev, bodyWeight: e.target.value }))}
              placeholder="e.g., 75.5"
              className="bg-slate-700 border-slate-600 text-white"
              min="30"
              max="200"
            />
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-slate-300">Energy Level</Label>
              <div className="px-2">
                <Slider
                  value={formData.energy}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, energy: value }))}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>1</span>
                  <span className="text-slate-300">{getEnergyLabel(formData.energy[0])}</span>
                  <span>10</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Mood After Workout</Label>
              <div className="px-2">
                <Slider
                  value={formData.mood}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, mood: value }))}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>1</span>
                  <span className="text-slate-300">{getMoodLabel(formData.mood[0])}</span>
                  <span>10</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details" className="text-slate-300">Workout Details</Label>
            <Textarea
              id="details"
              value={formData.details}
              onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
              placeholder="Sets, reps, weights, sparring notes, achievements..."
              className="bg-slate-700 border-slate-600 text-white"
              rows={4}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              Log Workout
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}