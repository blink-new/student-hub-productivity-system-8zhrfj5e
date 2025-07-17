import { useState, useEffect } from 'react'
import { Plus, Calendar, CheckCircle, Clock, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Progress } from '../components/ui/Progress'
import { useDataStore } from '../store/dataStore'
import type { Task, Quote } from '../types'

export default function Dashboard() {
  const { store, user } = useDataStore()
  const [todayQuote, setTodayQuote] = useState<Quote | null>(null)
  const [todayTasks, setTodayTasks] = useState<Task[]>([])
  const [habitCompletion, setHabitCompletion] = useState(0)
  const [weeklyStudyHours, setWeeklyStudyHours] = useState(0)

  useEffect(() => {
    if (!user) return

    const loadDashboardData = async () => {
      try {
        const [quote, tasks, completion, studyHours] = await Promise.all([
          store.getTodayQuote(),
          store.getTodayTasks(),
          store.getHabitCompletionRate(),
          store.getWeeklyStudyHours()
        ])

        setTodayQuote(quote)
        setTodayTasks(tasks)
        setHabitCompletion(completion)
        setWeeklyStudyHours(studyHours)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      }
    }

    loadDashboardData()
  }, [store, user])

  const handleQuickAction = async (action: string) => {
    const today = new Date().toISOString().split('T')[0]
    
    try {
      switch (action) {
        case 'task':
          await store.createTask({
            title: 'New Task',
            description: '',
            status: 'not_started',
            priority: 'medium',
            dueDate: today,
            tags: []
          })
          break
        case 'study':
          await store.createStudySession({
            title: 'Study Session',
            subject: 'General',
            date: today,
            duration: 0,
            completed: false
          })
          break
        case 'workout':
          await store.createWorkout({
            title: 'Workout',
            type: 'gym',
            date: today,
            duration: 0,
            energyMood: 5,
            completed: false
          })
          break
        case 'journal':
          await store.createJournalEntry({
            date: today,
            entryType: 'general',
            mood: 5
          })
          break
      }
      
      // Refresh data
      const tasks = await store.getTodayTasks()
      setTodayTasks(tasks)
    } catch (error) {
      console.error('Error creating quick action:', error)
    }
  }

  const toggleTaskComplete = async (taskId: string, completed: boolean) => {
    try {
      await store.updateTask(taskId, { 
        status: completed ? 'completed' : 'not_started',
        completedAt: completed ? new Date().toISOString() : undefined
      })
      
      const tasks = await store.getTodayTasks()
      setTodayTasks(tasks)
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  const completedTasks = todayTasks.filter(task => task.status === 'completed').length
  const taskCompletionRate = todayTasks.length > 0 ? (completedTasks / todayTasks.length) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center pt-4">
          <h1 className="text-2xl font-bold text-white mb-1">Student Hub</h1>
          <p className="text-slate-400">{getGreeting()}, Champion! 💪</p>
        </div>

        {/* Daily Quote */}
        {todayQuote && (
          <Card className="bg-gradient-to-r from-blue-600/20 to-emerald-600/20 border-blue-500/30">
            <CardContent className="p-4">
              <blockquote className="text-sm text-slate-200 italic mb-2">
                "{todayQuote.text}"
              </blockquote>
              <cite className="text-xs text-slate-400">— {todayQuote.author}</cite>
            </CardContent>
          </Card>
        )}

        {/* Today's Progress */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Habits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress value={habitCompletion} />
                <p className="text-xs text-slate-400">{Math.round(habitCompletion)}% Complete</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-500" />
                Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress value={taskCompletionRate} />
                <p className="text-xs text-slate-400">{completedTasks}/{todayTasks.length} Done</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Study Hours */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-500" />
              This Week's Study
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-white">{Math.round(weeklyStudyHours / 60)}h</span>
              <span className="text-xs text-slate-400">{weeklyStudyHours % 60}m</span>
            </div>
          </CardContent>
        </Card>

        {/* Today's Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Today's Agenda
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayTasks.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">No tasks for today</p>
            ) : (
              <div className="space-y-2">
                {todayTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-700/30">
                    <button
                      onClick={() => toggleTaskComplete(task.id, task.status !== 'completed')}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        task.status === 'completed'
                          ? 'bg-emerald-500 border-emerald-500'
                          : 'border-slate-500 hover:border-emerald-500'
                      }`}
                    >
                      {task.status === 'completed' && (
                        <CheckCircle className="w-3 h-3 text-white" />
                      )}
                    </button>
                    <span className={`text-sm flex-1 ${
                      task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-200'
                    }`}>
                      {task.title}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                      task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => handleQuickAction('task')}
                className="flex items-center gap-2"
                variant="outline"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </Button>
              <Button 
                onClick={() => handleQuickAction('study')}
                className="flex items-center gap-2"
                variant="outline"
              >
                <Plus className="w-4 h-4" />
                Study
              </Button>
              <Button 
                onClick={() => handleQuickAction('workout')}
                className="flex items-center gap-2"
                variant="outline"
              >
                <Plus className="w-4 h-4" />
                Workout
              </Button>
              <Button 
                onClick={() => handleQuickAction('journal')}
                className="flex items-center gap-2"
                variant="outline"
              >
                <Plus className="w-4 h-4" />
                Journal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}