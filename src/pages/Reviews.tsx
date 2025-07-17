import { useState, useEffect, useCallback } from 'react'
import { Plus, BarChart3, Calendar, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useDataStore } from '../store/dataStore'
import type { Review } from '../types'

export default function Reviews() {
  const { store, user } = useDataStore()
  const [reviews, setReviews] = useState<Review[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedType, setSelectedType] = useState<Review['reviewType']>('daily')

  const loadReviews = useCallback(async () => {
    try {
      const reviewsData = await store.getReviews()
      setReviews(reviewsData)
    } catch (error) {
      console.error('Error loading reviews:', error)
    }
  }, [store])

  useEffect(() => {
    if (!user) return
    loadReviews()
  }, [store, user, loadReviews])

  const handleCreateReview = async (reviewData: Omit<Review, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const habitCompletion = await store.getHabitCompletionRate(reviewData.date)
      await store.createReview({
        ...reviewData,
        habitsCompletedPercent: habitCompletion
      })
      await loadReviews()
      setShowAddForm(false)
    } catch (error) {
      console.error('Error creating review:', error)
    }
  }

  const getReviewIcon = (type: Review['reviewType']) => {
    const icons = {
      daily: '📅',
      weekly: '📊',
      monthly: '📈'
    }
    return icons[type] || '📝'
  }

  const filteredReviews = reviews.filter(review => review.reviewType === selectedType)

  const getReviewPrompts = (type: Review['reviewType']) => {
    switch (type) {
      case 'daily':
        return {
          title: 'Daily Review',
          prompts: [
            'What went well today?',
            'What could I improve tomorrow?',
            'Did I complete my spiritual practices?',
            'How was my energy and focus?'
          ]
        }
      case 'weekly':
        return {
          title: 'Weekly Review',
          prompts: [
            'What were my biggest wins this week?',
            'What challenges did I face?',
            'How did I progress toward my goals?',
            'What should I focus on next week?'
          ]
        }
      case 'monthly':
        return {
          title: 'Monthly Review',
          prompts: [
            'What major progress did I make this month?',
            'How is my life balance (academics, fitness, spirituality)?',
            'What patterns do I notice in my habits?',
            'What are my priorities for next month?'
          ]
        }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between pt-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              Reviews
            </h1>
            <p className="text-slate-400 text-sm">Reflect and improve continuously</p>
          </div>
          <Button onClick={() => setShowAddForm(true)} size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Review Type Selector */}
        <div className="flex bg-slate-800 rounded-lg p-1">
          {(['daily', 'weekly', 'monthly'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors capitalize ${
                selectedType === type ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {getReviewIcon(type)} {type}
            </button>
          ))}
        </div>

        {/* Review Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-white">
                {reviews.filter(r => r.reviewType === 'daily').length}
              </div>
              <div className="text-xs text-slate-400">Daily</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-white">
                {reviews.filter(r => r.reviewType === 'weekly').length}
              </div>
              <div className="text-xs text-slate-400">Weekly</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-white">
                {reviews.filter(r => r.reviewType === 'monthly').length}
              </div>
              <div className="text-xs text-slate-400">Monthly</div>
            </CardContent>
          </Card>
        </div>

        {/* Reviews List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getReviewIcon(selectedType)}
              {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredReviews.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">No {selectedType} reviews yet</p>
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Review
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReviews.slice(0, 5).map((review) => (
                  <div key={review.id} className="p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getReviewIcon(review.reviewType)}</span>
                        <span className="text-sm text-white capitalize">
                          {review.reviewType} Review
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(review.date).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {review.whatWentWell && (
                        <div>
                          <div className="text-xs text-emerald-400 mb-1">✅ What went well:</div>
                          <div className="text-sm text-slate-200">{review.whatWentWell}</div>
                        </div>
                      )}
                      
                      {review.whatToImprove && (
                        <div>
                          <div className="text-xs text-yellow-400 mb-1">🔄 To improve:</div>
                          <div className="text-sm text-slate-200">{review.whatToImprove}</div>
                        </div>
                      )}
                      
                      {review.notes && (
                        <div>
                          <div className="text-xs text-slate-400 mb-1">📝 Notes:</div>
                          <div className="text-sm text-slate-200">{review.notes}</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-600">
                      <span className="text-xs text-slate-400">
                        Habits: {Math.round(review.habitsCompletedPercent)}% completed
                      </span>
                      <div className="w-16 h-1 bg-slate-600 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 transition-all duration-300"
                          style={{ width: `${review.habitsCompletedPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {showAddForm && (
          <ReviewForm
            type={selectedType}
            onSubmit={handleCreateReview}
            onCancel={() => setShowAddForm(false)}
          />
        )}
      </div>
    </div>
  )
}

interface ReviewFormProps {
  type: Review['reviewType']
  onSubmit: (data: Omit<Review, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

function ReviewForm({ type, onSubmit, onCancel }: ReviewFormProps) {
  const [formData, setFormData] = useState({
    reviewType: type,
    date: new Date().toISOString().split('T')[0],
    whatWentWell: '',
    whatToImprove: '',
    notes: '',
    habitsCompletedPercent: 0
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const getReviewPrompts = (reviewType: Review['reviewType']) => {
    switch (reviewType) {
      case 'daily':
        return {
          title: 'Daily Review',
          wellPrompt: 'What went well today?',
          improvePrompt: 'What could I improve tomorrow?',
          notesPrompt: 'Additional thoughts about today...'
        }
      case 'weekly':
        return {
          title: 'Weekly Review',
          wellPrompt: 'What were my biggest wins this week?',
          improvePrompt: 'What should I focus on next week?',
          notesPrompt: 'Weekly insights and patterns...'
        }
      case 'monthly':
        return {
          title: 'Monthly Review',
          wellPrompt: 'What major progress did I make this month?',
          improvePrompt: 'What are my priorities for next month?',
          notesPrompt: 'Monthly reflection and planning...'
        }
    }
  }

  const prompts = getReviewPrompts(type)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{prompts.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              ✅ {prompts.wellPrompt}
            </label>
            <textarea
              value={formData.whatWentWell}
              onChange={(e) => setFormData({ ...formData, whatWentWell: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              rows={3}
              placeholder="List your wins and positive moments..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              🔄 {prompts.improvePrompt}
            </label>
            <textarea
              value={formData.whatToImprove}
              onChange={(e) => setFormData({ ...formData, whatToImprove: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              rows={3}
              placeholder="Areas for growth and improvement..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              📝 {prompts.notesPrompt}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              rows={3}
              placeholder="Additional thoughts and reflections..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Save Review
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