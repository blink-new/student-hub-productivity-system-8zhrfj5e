import { Home, Target, BookOpen, Dumbbell, Heart, CheckSquare, BarChart3 } from 'lucide-react'

type Page = 'dashboard' | 'goals' | 'study' | 'gym' | 'spiritual' | 'tasks' | 'reviews'

interface BottomNavProps {
  currentPage: Page
  onPageChange: (page: Page) => void
}

const navItems = [
  { id: 'dashboard' as Page, icon: Home, label: '🏠 Home', emoji: '🏠' },
  { id: 'goals' as Page, icon: Target, label: '🎯 Goals', emoji: '🎯' },
  { id: 'study' as Page, icon: BookOpen, label: '📚 Study', emoji: '📚' },
  { id: 'gym' as Page, icon: Dumbbell, label: '💪 Gym', emoji: '💪' },
  { id: 'spiritual' as Page, icon: Heart, label: '🤲 Spirit', emoji: '🤲' },
  { id: 'tasks' as Page, icon: CheckSquare, label: '✅ Tasks', emoji: '✅' },
  { id: 'reviews' as Page, icon: BarChart3, label: '📊 Review', emoji: '📊' }
]

export default function BottomNav({ currentPage, onPageChange }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-800/95 backdrop-blur-md border-t border-slate-700">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
                isActive 
                  ? 'bg-blue-600/20 text-blue-400' 
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium truncate">{item.emoji}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}