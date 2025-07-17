import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Calendar } from '../ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { CalendarIcon, Target } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '../../lib/utils'

interface AddGoalModalProps {
  trigger?: React.ReactNode
  onGoalAdd?: (goal: any) => void
}

export default function AddGoalModal({ trigger, onGoalAdd }: AddGoalModalProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'academic',
    initialValue: '',
    targetValue: '',
    currentValue: '',
    unit: '',
    deadline: undefined as Date | undefined
  })

  const categories = [
    { value: 'academic', label: '📚 Academic', color: 'text-blue-400' },
    { value: 'fitness', label: '💪 Fitness', color: 'text-red-400' },
    { value: 'spiritual', label: '🤲 Spiritual', color: 'text-purple-400' },
    { value: 'personal', label: '👤 Personal', color: 'text-green-400' },
    { value: 'career', label: '💼 Career', color: 'text-orange-400' }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const initial = parseFloat(formData.initialValue) || 0
    const target = parseFloat(formData.targetValue) || 100
    const current = parseFloat(formData.currentValue) || initial
    
    const progress = target > initial 
      ? Math.min(100, Math.max(0, ((current - initial) / (target - initial)) * 100))
      : 0

    const newGoal = {
      id: Date.now(),
      title: formData.title,
      description: formData.description,
      category: formData.category,
      initialValue: initial,
      targetValue: target,
      currentValue: current,
      unit: formData.unit,
      progress: Math.round(progress),
      status: progress >= 100 ? 'Done' : progress > 0 ? 'In Progress' : 'Not Started',
      deadline: formData.deadline?.toISOString().split('T')[0] || null,
      createdAt: new Date().toISOString()
    }

    onGoalAdd?.(newGoal)
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      category: 'academic',
      initialValue: '',
      targetValue: '',
      currentValue: '',
      unit: '',
      deadline: undefined
    })
    
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Target size={16} className="mr-2" />
            Add Goal
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Goal</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-slate-300">Goal Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Achieve SAT Score 1600"
              className="bg-slate-700 border-slate-600 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-300">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your goal and why it's important..."
              className="bg-slate-700 border-slate-600 text-white"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {categories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="initialValue" className="text-slate-300">Initial Value</Label>
              <Input
                id="initialValue"
                type="number"
                step="0.1"
                value={formData.initialValue}
                onChange={(e) => setFormData(prev => ({ ...prev, initialValue: e.target.value }))}
                placeholder="0"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetValue" className="text-slate-300">Target Value</Label>
              <Input
                id="targetValue"
                type="number"
                step="0.1"
                value={formData.targetValue}
                onChange={(e) => setFormData(prev => ({ ...prev, targetValue: e.target.value }))}
                placeholder="100"
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentValue" className="text-slate-300">Current Value</Label>
              <Input
                id="currentValue"
                type="number"
                step="0.1"
                value={formData.currentValue}
                onChange={(e) => setFormData(prev => ({ ...prev, currentValue: e.target.value }))}
                placeholder="0"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit" className="text-slate-300">Unit</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                placeholder="points, kg, days..."
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Deadline</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-slate-700 border-slate-600 text-white hover:bg-slate-600",
                    !formData.deadline && "text-slate-400"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.deadline ? format(formData.deadline, "PPP") : "Pick a deadline"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700">
                <Calendar
                  mode="single"
                  selected={formData.deadline}
                  onSelect={(date) => setFormData(prev => ({ ...prev, deadline: date }))}
                  initialFocus
                  className="bg-slate-800 text-white"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="bg-slate-700 p-3 rounded-lg">
            <p className="text-sm text-slate-300 mb-1">Preview:</p>
            <p className="text-white">
              {formData.title || 'Goal Title'}: {formData.currentValue || formData.initialValue || '0'} → {formData.targetValue || '100'} {formData.unit}
            </p>
            {formData.deadline && (
              <p className="text-xs text-slate-400 mt-1">
                Due: {format(formData.deadline, "PPP")}
              </p>
            )}
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
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create Goal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}