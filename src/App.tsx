import { useState, useEffect } from 'react'
import { blink } from './blink/client'
import Dashboard from './pages/Dashboard'
import Goals from './pages/Goals'
import Study from './pages/Study'
import Gym from './pages/Gym'
import Spiritual from './pages/Spiritual'
import Tasks from './pages/Tasks'
import Reviews from './pages/Reviews'
import BottomNav from './components/BottomNav'


type Page = 'dashboard' | 'goals' | 'study' | 'gym' | 'spiritual' | 'tasks' | 'reviews'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading Student Hub...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Student Hub</h1>
          <p className="text-slate-300 mb-6">Your complete productivity system</p>
          <button 
            onClick={() => blink.auth.login()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Sign In to Continue
          </button>
        </div>
      </div>
    )
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />
      case 'goals': return <Goals />
      case 'study': return <Study />
      case 'gym': return <Gym />
      case 'spiritual': return <Spiritual />
      case 'tasks': return <Tasks />
      case 'reviews': return <Reviews />
      default: return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="pb-20">
        {renderPage()}
      </div>
      <BottomNav currentPage={currentPage} onPageChange={setCurrentPage} />
    </div>
  )
}

export default App