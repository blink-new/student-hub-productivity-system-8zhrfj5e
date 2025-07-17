import { useState, useEffect } from 'react'
import { blink } from '../blink/client'
import type { Goal, Task, StudySession, Workout, JournalEntry, Habit, HabitLog, Review, Quote } from '../types'

// Generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// Get current date in YYYY-MM-DD format
const getCurrentDate = () => new Date().toISOString().split('T')[0]

// Data store with local state management
export class DataStore {
  private static instance: DataStore
  private user: any = null

  // In-memory storage (will be replaced with database calls)
  private goals: Goal[] = []
  private tasks: Task[] = []
  private studySessions: StudySession[] = []
  private workouts: Workout[] = []
  private journalEntries: JournalEntry[] = []
  private habits: Habit[] = []
  private habitLogs: HabitLog[] = []
  private reviews: Review[] = []
  private quotes: Quote[] = []

  private constructor() {
    this.initializeDefaultData()
  }

  static getInstance(): DataStore {
    if (!DataStore.instance) {
      DataStore.instance = new DataStore()
    }
    return DataStore.instance
  }

  setUser(user: any) {
    this.user = user
    if (user) {
      this.loadUserData()
    }
  }

  private async loadUserData() {
    // In a real implementation, this would load from database
    // For now, we'll use localStorage as a fallback
    const savedData = localStorage.getItem(`studentHub_${this.user.id}`)
    if (savedData) {
      const data = JSON.parse(savedData)
      this.goals = data.goals || []
      this.tasks = data.tasks || []
      this.studySessions = data.studySessions || []
      this.workouts = data.workouts || []
      this.journalEntries = data.journalEntries || []
      this.habits = data.habits || []
      this.habitLogs = data.habitLogs || []
      this.reviews = data.reviews || []
      this.quotes = data.quotes || []
    }
  }

  private saveToLocalStorage() {
    if (!this.user) return
    const data = {
      goals: this.goals,
      tasks: this.tasks,
      studySessions: this.studySessions,
      workouts: this.workouts,
      journalEntries: this.journalEntries,
      habits: this.habits,
      habitLogs: this.habitLogs,
      reviews: this.reviews,
      quotes: this.quotes
    }
    localStorage.setItem(`studentHub_${this.user.id}`, JSON.stringify(data))
  }

  private initializeDefaultData() {
    // Default motivational quotes
    const defaultQuotes = [
      { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "motivation" },
      { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", category: "motivation" },
      { text: "And whoever relies upon Allah - then He is sufficient for him.", author: "Quran 65:3", category: "spiritual" },
      { text: "The best of people are those who benefit others.", author: "Prophet Muhammad (PBUH)", category: "spiritual" },
      { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela", category: "academic" }
    ]

    // Default habits for a student-athlete
    const defaultHabits = [
      { name: "Fajr Prayer", category: "spiritual", targetFrequency: 1 },
      { name: "Morning Workout", category: "fitness", targetFrequency: 1 },
      { name: "Study Session", category: "academic", targetFrequency: 2 },
      { name: "Gratitude Journal", category: "personal", targetFrequency: 1 },
      { name: "Evening Review", category: "personal", targetFrequency: 1 }
    ]

    this.quotes = defaultQuotes.map(quote => ({
      id: generateId(),
      userId: '',
      text: quote.text,
      author: quote.author,
      category: quote.category as any,
      isFavorite: false,
      createdAt: new Date().toISOString()
    }))

    this.habits = defaultHabits.map(habit => ({
      id: generateId(),
      userId: '',
      name: habit.name,
      category: habit.category as any,
      targetFrequency: habit.targetFrequency,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }))
  }

  // Goals CRUD
  async createGoal(goalData: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Goal> {
    const goal: Goal = {
      id: generateId(),
      userId: this.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...goalData
    }
    this.goals.push(goal)
    this.saveToLocalStorage()
    return goal
  }

  async getGoals(): Promise<Goal[]> {
    return this.goals.filter(goal => goal.userId === this.user?.id)
  }

  async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal | null> {
    const index = this.goals.findIndex(goal => goal.id === id && goal.userId === this.user?.id)
    if (index === -1) return null
    
    this.goals[index] = { ...this.goals[index], ...updates, updatedAt: new Date().toISOString() }
    this.saveToLocalStorage()
    return this.goals[index]
  }

  async deleteGoal(id: string): Promise<boolean> {
    const index = this.goals.findIndex(goal => goal.id === id && goal.userId === this.user?.id)
    if (index === -1) return false
    
    this.goals.splice(index, 1)
    this.saveToLocalStorage()
    return true
  }

  // Tasks CRUD
  async createTask(taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const task: Task = {
      id: generateId(),
      userId: this.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...taskData
    }
    this.tasks.push(task)
    this.saveToLocalStorage()
    return task
  }

  async getTasks(): Promise<Task[]> {
    return this.tasks.filter(task => task.userId === this.user?.id)
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    const index = this.tasks.findIndex(task => task.id === id && task.userId === this.user?.id)
    if (index === -1) return null
    
    this.tasks[index] = { ...this.tasks[index], ...updates, updatedAt: new Date().toISOString() }
    this.saveToLocalStorage()
    return this.tasks[index]
  }

  async deleteTask(id: string): Promise<boolean> {
    const index = this.tasks.findIndex(task => task.id === id && task.userId === this.user?.id)
    if (index === -1) return false
    
    this.tasks.splice(index, 1)
    this.saveToLocalStorage()
    return true
  }

  // Study Sessions CRUD
  async createStudySession(sessionData: Omit<StudySession, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<StudySession> {
    const session: StudySession = {
      id: generateId(),
      userId: this.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...sessionData
    }
    this.studySessions.push(session)
    this.saveToLocalStorage()
    return session
  }

  async getStudySessions(): Promise<StudySession[]> {
    return this.studySessions.filter(session => session.userId === this.user?.id)
  }

  // Workouts CRUD
  async createWorkout(workoutData: Omit<Workout, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Workout> {
    const workout: Workout = {
      id: generateId(),
      userId: this.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...workoutData
    }
    this.workouts.push(workout)
    this.saveToLocalStorage()
    return workout
  }

  async getWorkouts(): Promise<Workout[]> {
    return this.workouts.filter(workout => workout.userId === this.user?.id)
  }

  // Journal Entries CRUD
  async createJournalEntry(entryData: Omit<JournalEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<JournalEntry> {
    const entry: JournalEntry = {
      id: generateId(),
      userId: this.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...entryData
    }
    this.journalEntries.push(entry)
    this.saveToLocalStorage()
    return entry
  }

  async getJournalEntries(): Promise<JournalEntry[]> {
    return this.journalEntries.filter(entry => entry.userId === this.user?.id)
  }

  // Habits CRUD
  async getHabits(): Promise<Habit[]> {
    const userHabits = this.habits.filter(habit => habit.userId === this.user?.id || habit.userId === '')
    // Set userId for default habits
    return userHabits.map(habit => ({ ...habit, userId: this.user?.id || '' }))
  }

  async createHabit(habitData: Omit<Habit, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Habit> {
    const habit: Habit = {
      id: generateId(),
      userId: this.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...habitData
    }
    this.habits.push(habit)
    this.saveToLocalStorage()
    return habit
  }

  // Habit Logs CRUD
  async logHabit(habitId: string, completed: boolean, notes?: string): Promise<HabitLog> {
    const today = getCurrentDate()
    
    // Remove existing log for today if it exists
    this.habitLogs = this.habitLogs.filter(log => 
      !(log.habitId === habitId && log.date === today && log.userId === this.user?.id)
    )
    
    const log: HabitLog = {
      id: generateId(),
      userId: this.user.id,
      habitId,
      date: today,
      completed,
      notes,
      createdAt: new Date().toISOString()
    }
    
    this.habitLogs.push(log)
    this.saveToLocalStorage()
    return log
  }

  async getHabitLogs(date?: string): Promise<HabitLog[]> {
    let logs = this.habitLogs.filter(log => log.userId === this.user?.id)
    if (date) {
      logs = logs.filter(log => log.date === date)
    }
    return logs
  }

  // Reviews CRUD
  async createReview(reviewData: Omit<Review, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Review> {
    const review: Review = {
      id: generateId(),
      userId: this.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...reviewData
    }
    this.reviews.push(review)
    this.saveToLocalStorage()
    return review
  }

  async getReviews(): Promise<Review[]> {
    return this.reviews.filter(review => review.userId === this.user?.id)
  }

  // Quotes
  async getQuotes(): Promise<Quote[]> {
    return this.quotes
  }

  async getTodayQuote(): Promise<Quote> {
    const quotes = await this.getQuotes()
    const today = new Date().getDate()
    return quotes[today % quotes.length]
  }

  // Analytics and aggregations
  async getTodayTasks(): Promise<Task[]> {
    const today = getCurrentDate()
    const tasks = await this.getTasks()
    return tasks.filter(task => task.dueDate === today)
  }

  async getHabitCompletionRate(date: string = getCurrentDate()): Promise<number> {
    const habits = await this.getHabits()
    const logs = await this.getHabitLogs(date)
    
    if (habits.length === 0) return 0
    
    const completedCount = logs.filter(log => log.completed).length
    return (completedCount / habits.length) * 100
  }

  async getWeeklyStudyHours(): Promise<number> {
    const sessions = await this.getStudySessions()
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    return sessions
      .filter(session => new Date(session.date) >= oneWeekAgo && session.completed)
      .reduce((total, session) => total + session.duration, 0)
  }
}

// React hook for using the data store
export function useDataStore() {
  const [store] = useState(() => DataStore.getInstance())
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      store.setUser(state.user)
    })
    return unsubscribe
  }, [store])

  return { store, user }
}