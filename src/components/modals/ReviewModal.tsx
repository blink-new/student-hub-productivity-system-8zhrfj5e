import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Slider } from '../ui/slider'
import { BarChart3, CheckCircle, X } from 'lucide-react'

interface ReviewModalProps {
  trigger?: React.ReactNode
  onReviewAdd?: (review: any) => void
}

export default function ReviewModal({ trigger, onReviewAdd }: ReviewModalProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    reviewType: 'daily',
    overallSatisfaction: [7],
    wins: '',
    improvements: '',
    habits: {
      prayer: false,
      study: false,
      workout: false,
      reflection: false,
      sleep: false
    },
    tasksCompleted: '',
    goalsProgress: '',
    nextSteps: ''
  })

  const reviewTypes = [
    { value: 'daily', label: '📅 Daily Review', color: 'text-blue-400' },
    { value: 'weekly', label: '📊 Weekly Review', color: 'text-green-400' },
    { value: 'monthly', label: '📈 Monthly Review', color: 'text-purple-400' }
  ]

  const habitLabels = {
    prayer: '🤲 Prayer/Spiritual Practice',
    study: '📚 Study Session',
    workout: '💪 Physical Exercise',
    reflection: '🧘 Self Reflection',
    sleep: '😴 Good Sleep (7+ hours)'
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const completedHabits = Object.values(formData.habits).filter(Boolean).length
    const totalHabits = Object.keys(formData.habits).length
    const habitPercentage = Math.round((completedHabits / totalHabits) * 100)

    const newReview = {
      id: Date.now(),
      reviewType: formData.reviewType,
      overallSatisfaction: formData.overallSatisfaction[0],
      wins: formData.wins,
      improvements: formData.improvements,
      habits: formData.habits,
      habitPercentage,
      tasksCompleted: formData.tasksCompleted,
      goalsProgress: formData.goalsProgress,
      nextSteps: formData.nextSteps,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    }

    onReviewAdd?.(newReview)
    
    // Reset form
    setFormData({
      reviewType: 'daily',
      overallSatisfaction: [7],
      wins: '',
      improvements: '',
      habits: {
        prayer: false,
        study: false,
        workout: false,
        reflection: false,
        sleep: false
      },
      tasksCompleted: '',
      goalsProgress: '',
      nextSteps: ''
    })
    
    setOpen(false)
  }

  const getSatisfactionLabel = (value: number) => {
    if (value <= 2) return '😞 Very Poor'
    if (value <= 4) return '😕 Poor'
    if (value <= 6) return '😐 Okay'
    if (value <= 8) return '😊 Good'
    return '😄 Excellent'
  }

  const toggleHabit = (habit: keyof typeof formData.habits) => {
    setFormData(prev => ({
      ...prev,
      habits: {
        ...prev.habits,
        [habit]: !prev.habits[habit]
      }
    }))
  }

  const getReviewPrompts = () => {
    switch (formData.reviewType) {
      case 'daily':
        return {
          wins: 'What went well today? What am I proud of?',
          improvements: 'What could I improve tomorrow? What challenges did I face?',
          tasks: 'How many tasks did I complete? What\'s left for tomorrow?',
          goals: 'Did I make progress on my goals today?',
          next: 'What are my top 3 priorities for tomorrow?'
        }
      case 'weekly':
        return {
          wins: 'What were my biggest wins this week? What achievements am I proud of?',
          improvements: 'What patterns need improvement? What held me back?',
          tasks: 'How was my task completion rate? What tasks are overdue?',
          goals: 'How much progress did I make on my goals this week?',
          next: 'What are my focus areas for next week?'
        }
      case 'monthly':
        return {
          wins: 'What were my major accomplishments this month? How have I grown?',
          improvements: 'What systems or habits need adjustment? What lessons did I learn?',
          tasks: 'How effective was my task management? What needs restructuring?',
          goals: 'Which goals are on track? Which need more attention?',
          next: 'What are my key objectives for next month?'
        }
      default:
        return {
          wins: 'What went well?',
          improvements: 'What could be improved?',
          tasks: 'Task completion status?',
          goals: 'Progress on goals?',
          next: 'Next steps?'
        }
    }
  }

  const prompts = getReviewPrompts()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <BarChart3 size={16} className="mr-2" />
            New Review
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Create Review</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-slate-300">Review Type</Label>
            <Select value={formData.reviewType} onValueChange={(value) => setFormData(prev => ({ ...prev, reviewType: value }))}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {reviewTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Overall Satisfaction</Label>
            <div className="px-2">
              <Slider
                value={formData.overallSatisfaction}
                onValueChange={(value) => setFormData(prev => ({ ...prev, overallSatisfaction: value }))}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>1</span>
                <span className="text-slate-300">{getSatisfactionLabel(formData.overallSatisfaction[0])}</span>
                <span>10</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Habits Completed</Label>
            <div className="space-y-2">
              {Object.entries(habitLabels).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between p-2 bg-slate-700 rounded">
                  <span className="text-sm text-slate-300">{label}</span>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => toggleHabit(key as keyof typeof formData.habits)}
                    className={`${
                      formData.habits[key as keyof typeof formData.habits]
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-slate-600 hover:bg-slate-500'
                    } text-white`}
                  >
                    {formData.habits[key as keyof typeof formData.habits] ? (
                      <CheckCircle size={14} />
                    ) : (
                      <X size={14} />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wins" className="text-slate-300">Wins & Achievements</Label>
            <Textarea
              id="wins"
              value={formData.wins}
              onChange={(e) => setFormData(prev => ({ ...prev, wins: e.target.value }))}
              placeholder={prompts.wins}
              className="bg-slate-700 border-slate-600 text-white"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="improvements" className="text-slate-300">Areas for Improvement</Label>
            <Textarea
              id="improvements"
              value={formData.improvements}
              onChange={(e) => setFormData(prev => ({ ...prev, improvements: e.target.value }))}
              placeholder={prompts.improvements}
              className="bg-slate-700 border-slate-600 text-white"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tasksCompleted" className="text-slate-300">Task Summary</Label>
            <Textarea
              id="tasksCompleted"
              value={formData.tasksCompleted}
              onChange={(e) => setFormData(prev => ({ ...prev, tasksCompleted: e.target.value }))}
              placeholder={prompts.tasks}
              className="bg-slate-700 border-slate-600 text-white"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goalsProgress" className="text-slate-300">Goals Progress</Label>
            <Textarea
              id="goalsProgress"
              value={formData.goalsProgress}
              onChange={(e) => setFormData(prev => ({ ...prev, goalsProgress: e.target.value }))}
              placeholder={prompts.goals}
              className="bg-slate-700 border-slate-600 text-white"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nextSteps" className="text-slate-300">Next Steps & Priorities</Label>
            <Textarea
              id="nextSteps"
              value={formData.nextSteps}
              onChange={(e) => setFormData(prev => ({ ...prev, nextSteps: e.target.value }))}
              placeholder={prompts.next}
              className="bg-slate-700 border-slate-600 text-white"
              rows={3}
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
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Save Review
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}