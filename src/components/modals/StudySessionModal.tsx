import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Book, Play, Pause, Square } from 'lucide-react'

interface StudySessionModalProps {
  trigger?: React.ReactNode
  onSessionAdd?: (session: any) => void
}

export default function StudySessionModal({ trigger, onSessionAdd }: StudySessionModalProps) {
  const [open, setOpen] = useState(false)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [formData, setFormData] = useState({
    title: '',
    subject: 'math',
    resource: '',
    notes: '',
    plannedDuration: '25'
  })

  const subjects = [
    { value: 'math', label: '📐 Mathematics', color: 'text-blue-400' },
    { value: 'biology', label: '🧬 Biology', color: 'text-green-400' },
    { value: 'english', label: '📝 English', color: 'text-purple-400' },
    { value: 'sat', label: '📊 SAT Prep', color: 'text-orange-400' },
    { value: 'ielts', label: '🗣️ IELTS', color: 'text-pink-400' },
    { value: 'other', label: '📚 Other', color: 'text-slate-400' }
  ]

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startTimer = () => {
    setIsTimerRunning(true)
    const interval = setInterval(() => {
      setTimerSeconds(prev => prev + 1)
    }, 1000)
    
    // Store interval ID for cleanup
    ;(window as any).studyTimerInterval = interval
  }

  const pauseTimer = () => {
    setIsTimerRunning(false)
    if ((window as any).studyTimerInterval) {
      clearInterval((window as any).studyTimerInterval)
    }
  }

  const stopTimer = () => {
    setIsTimerRunning(false)
    if ((window as any).studyTimerInterval) {
      clearInterval((window as any).studyTimerInterval)
    }
    setTimerSeconds(0)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const actualDuration = Math.max(timerSeconds / 60, 1) // At least 1 minute
    
    const newSession = {
      id: Date.now(),
      title: formData.title,
      subject: formData.subject,
      resource: formData.resource,
      notes: formData.notes,
      plannedDuration: parseInt(formData.plannedDuration),
      actualDuration: Math.round(actualDuration),
      date: new Date().toISOString().split('T')[0],
      completed: true,
      createdAt: new Date().toISOString()
    }

    onSessionAdd?.(newSession)
    
    // Cleanup timer
    if ((window as any).studyTimerInterval) {
      clearInterval((window as any).studyTimerInterval)
    }
    
    // Reset form
    setFormData({
      title: '',
      subject: 'math',
      resource: '',
      notes: '',
      plannedDuration: '25'
    })
    setTimerSeconds(0)
    setIsTimerRunning(false)
    
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            <Book size={16} className="mr-2" />
            Study Session
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Start Study Session</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Timer Display */}
          <div className="text-center py-4 bg-slate-700 rounded-lg">
            <div className="text-3xl font-mono font-bold text-white mb-2">
              {formatTime(timerSeconds)}
            </div>
            <div className="flex justify-center space-x-2">
              {!isTimerRunning ? (
                <Button
                  type="button"
                  onClick={startTimer}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play size={14} className="mr-1" />
                  Start
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={pauseTimer}
                  size="sm"
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  <Pause size={14} className="mr-1" />
                  Pause
                </Button>
              )}
              <Button
                type="button"
                onClick={stopTimer}
                size="sm"
                variant="outline"
                className="bg-slate-600 border-slate-500 hover:bg-slate-500"
              >
                <Square size={14} className="mr-1" />
                Reset
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-slate-300">Session Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., SAT Math Practice"
              className="bg-slate-700 border-slate-600 text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Subject</Label>
              <Select value={formData.subject} onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {subjects.map(subject => (
                    <SelectItem key={subject.value} value={subject.value}>
                      {subject.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration" className="text-slate-300">Planned (min)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.plannedDuration}
                onChange={(e) => setFormData(prev => ({ ...prev, plannedDuration: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
                min="1"
                max="300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resource" className="text-slate-300">Resource (Optional)</Label>
            <Input
              id="resource"
              value={formData.resource}
              onChange={(e) => setFormData(prev => ({ ...prev, resource: e.target.value }))}
              placeholder="e.g., Khan Academy, Textbook Ch. 5"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-slate-300">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="What did you learn? Key concepts..."
              className="bg-slate-700 border-slate-600 text-white"
              rows={3}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if ((window as any).studyTimerInterval) {
                  clearInterval((window as any).studyTimerInterval)
                }
                setOpen(false)
              }}
              className="flex-1 bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              disabled={timerSeconds === 0}
            >
              Save Session
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}