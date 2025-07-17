export interface Goal {
  id: string
  userId: string
  title: string
  category: 'academic' | 'fitness' | 'spiritual' | 'personal'
  description?: string
  initialValue: number
  targetValue: number
  currentValue: number
  status: 'not_started' | 'in_progress' | 'completed'
  deadline?: string
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  userId: string
  title: string
  description?: string
  status: 'not_started' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  dueDate?: string
  tags: string[]
  goalId?: string
  estimatedDuration?: number
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface StudySession {
  id: string
  userId: string
  title: string
  subject: string
  date: string
  duration: number
  resource?: string
  notes?: string
  completed: boolean
  goalId?: string
  createdAt: string
  updatedAt: string
}

export interface Workout {
  id: string
  userId: string
  title: string
  type: 'boxing' | 'gym' | 'wrestling' | 'cardio' | 'other'
  date: string
  duration: number
  details?: string
  bodyWeight?: number
  energyMood: number
  completed: boolean
  goalId?: string
  createdAt: string
  updatedAt: string
}

export interface JournalEntry {
  id: string
  userId: string
  date: string
  entryType: 'morning_prayer' | 'gratitude' | 'reflection' | 'general'
  mood: number
  prayerIntentions?: string
  gratitudeList?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Habit {
  id: string
  userId: string
  name: string
  category: 'spiritual' | 'academic' | 'fitness' | 'personal'
  targetFrequency: number
  createdAt: string
  updatedAt: string
}

export interface HabitLog {
  id: string
  userId: string
  habitId: string
  date: string
  completed: boolean
  notes?: string
  createdAt: string
}

export interface Review {
  id: string
  userId: string
  reviewType: 'daily' | 'weekly' | 'monthly'
  date: string
  whatWentWell?: string
  whatToImprove?: string
  habitsCompletedPercent: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Quote {
  id: string
  userId: string
  text: string
  author?: string
  category: 'motivation' | 'spiritual' | 'academic' | 'fitness'
  isFavorite: boolean
  createdAt: string
}