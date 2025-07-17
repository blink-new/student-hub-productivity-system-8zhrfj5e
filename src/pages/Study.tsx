import { useState, useEffect, useCallback } from 'react'
import { Plus, BookOpen, Clock, Play, Pause, Square } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useDataStore } from '../store/dataStore'
import type { StudySession } from '../types'

export default function Study() {
  const { store, user } = useDataStore()
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [activeTimer, setActiveTimer] = useState<string | null>(null)
  const [timerSeconds, setTimerSeconds] = useState(0)

  const loadSessions = useCallback(async () => {
    try {
      const sessionsData = await store.getStudySessions()
      setSessions(sessionsData)
    } catch (error) {
      console.error('Error loading sessions:', error)
    }
  }, [store])

  useEffect(() => {
    if (!user) return
    loadSessions()
  }, [store, user, loadSessions])

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (activeTimer) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [activeTimer])

  const handleCreateSession = async (sessionData: Omit<StudySession, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      await store.createStudySession(sessionData)
      await loadSessions()
      setShowAddForm(false)
    } catch (error) {
      console.error('Error creating session:', error)
    }
  }

  const startTimer = (sessionId: string) => {
    setActiveTimer(sessionId)
    setTimerSeconds(0)
  }

  const pauseTimer = () => {
    setActiveTimer(null)
  }

  const stopTimer = async (sessionId: string) => {
    if (activeTimer === sessionId) {
      // Update session with duration
      const session = sessions.find(s => s.id === sessionId)
      if (session) {
        const updatedSession = {
          ...session,
          duration: session.duration + Math.floor(timerSeconds / 60),
          completed: true
        }
        // In a real app, you'd call store.updateStudySession
        setSessions(prev => prev.map(s => s.id === sessionId ? updatedSession : s))
      }
      setActiveTimer(null)
      setTimerSeconds(0)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getSubjectColor = (subject: string) => {
    const colors = {
      'Math': 'bg-blue-500/20 text-blue-400',
      'Science': 'bg-green-500/20 text-green-400',
      'English': 'bg-purple-500/20 text-purple-400',
      'History': 'bg-yellow-500/20 text-yellow-400',
      'SAT': 'bg-red-500/20 text-red-400',
      'IELTS': 'bg-indigo-500/20 text-indigo-400'
    }
    return colors[subject as keyof typeof colors] || 'bg-slate-500/20 text-slate-400'
  }

  const todaySessions = sessions.filter(session => 
    session.date === new Date().toISOString().split('T')[0]
  )

  const totalStudyTime = sessions
    .filter(session => session.completed)
    .reduce((total, session) => total + session.duration, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pt-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6" />
              Study & Learning
            </h1>
            <p className="text-slate-400 text-sm">Track your academic progress</p>
          </div>
          <Button onClick={() => setShowAddForm(true)} size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Study Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white">{Math.floor(totalStudyTime / 60)}h</div>
              <div className="text-xs text-slate-400">Total Hours</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white">{todaySessions.length}</div>
              <div className="text-xs text-slate-400">Today's Sessions</div>
            </CardContent>
          </Card>
        </div>

        {/* Active Timer */}
        {activeTimer && (
          <Card className="bg-gradient-to-r from-blue-600/20 to-emerald-600/20 border-blue-500/30">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {formatTime(timerSeconds)}
              </div>
              <div className="flex gap-2 justify-center">
                <Button size="sm" onClick={pauseTimer}>
                  <Pause className="w-4 h-4" />
                </Button>
                <Button size="sm" onClick={() => stopTimer(activeTimer)} variant="destructive">
                  <Square className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Today's Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {todaySessions.length === 0 ? (
              <p className="text-slate-400 text-center py-4">No sessions today</p>
            ) : (
              <div className="space-y-3">
                {todaySessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-white">{session.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded ${getSubjectColor(session.subject)}`}>
                          {session.subject}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {session.duration}m
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!session.completed && activeTimer !== session.id && (
                        <Button size="sm" onClick={() => startTimer(session.id)}>
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                      {session.completed && (
                        <div className="text-emerald-400 text-sm">✓ Done</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">No study sessions yet</p>
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Session
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.slice(0, 5).map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-2 hover:bg-slate-700/30 rounded">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${getSubjectColor(session.subject)}`}>
                          {session.subject}
                        </span>
                        <span className="text-sm text-white">{session.title}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {new Date(session.date).toLocaleDateString()} • {session.duration}m
                      </div>
                    </div>
                    {session.completed && (
                      <div className="text-emerald-400 text-xs">✓</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Session Form */}
        {showAddForm && (
          <StudySessionForm
            onSubmit={handleCreateSession}
            onCancel={() => setShowAddForm(false)}
          />
        )}
      </div>
    </div>
  )
}

interface StudySessionFormProps {
  onSubmit: (data: Omit<StudySession, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

function StudySessionForm({ onSubmit, onCancel }: StudySessionFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    subject: 'Math',
    date: new Date().toISOString().split('T')[0],
    duration: 0,
    resource: '',
    notes: '',
    completed: false
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const subjects = ['Math', 'Science', 'English', 'History', 'SAT', 'IELTS', 'Other']

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Study Session</CardTitle>
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
              placeholder="e.g., Algebra Practice"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Subject</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              >
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Resource</label>
            <input
              type="text"
              value={formData.resource}
              onChange={(e) => setFormData({ ...formData, resource: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              placeholder="e.g., Khan Academy, Textbook Chapter 5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              rows={2}
              placeholder="What did you learn?"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Create Session
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