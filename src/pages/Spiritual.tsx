import { useState, useEffect, useCallback } from 'react'
import { Plus, Heart, Moon, Sun } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useDataStore } from '../store/dataStore'
import type { JournalEntry } from '../types'

export default function Spiritual() {
  const { store, user } = useDataStore()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [showAddForm, setShowAddForm] = useState(false)

  const loadEntries = useCallback(async () => {
    try {
      const entriesData = await store.getJournalEntries()
      setEntries(entriesData)
    } catch (error) {
      console.error('Error loading entries:', error)
    }
  }, [store])

  useEffect(() => {
    if (!user) return
    loadEntries()
  }, [store, user, loadEntries])

  const handleCreateEntry = async (entryData: Omit<JournalEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      await store.createJournalEntry(entryData)
      await loadEntries()
      setShowAddForm(false)
    } catch (error) {
      console.error('Error creating entry:', error)
    }
  }

  const getEntryIcon = (type: JournalEntry['entryType']) => {
    const icons = {
      morning_prayer: '🌅',
      gratitude: '🙏',
      reflection: '💭',
      general: '📝'
    }
    return icons[type] || '📝'
  }

  const getMoodColor = (mood: number) => {
    if (mood >= 8) return 'text-emerald-400'
    if (mood >= 6) return 'text-yellow-400'
    if (mood >= 4) return 'text-orange-400'
    return 'text-red-400'
  }

  const todayEntries = entries.filter(entry => 
    entry.date === new Date().toISOString().split('T')[0]
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between pt-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Heart className="w-6 h-6" />
              Spiritual Journal
            </h1>
            <p className="text-slate-400 text-sm">Strengthen your faith and gratitude</p>
          </div>
          <Button onClick={() => setShowAddForm(true)} size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Today's Spiritual Practice */}
        <Card className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="w-5 h-5" />
              Today's Practice
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayEntries.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-slate-300 mb-3">Start your spiritual journey today</p>
                <Button onClick={() => setShowAddForm(true)} size="sm">
                  Add Entry
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {todayEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center gap-3 p-2 bg-slate-700/30 rounded">
                    <span className="text-lg">{getEntryIcon(entry.entryType)}</span>
                    <div className="flex-1">
                      <div className="text-sm text-white capitalize">
                        {entry.entryType.replace('_', ' ')}
                      </div>
                      <div className="text-xs text-slate-400">
                        Mood: <span className={getMoodColor(entry.mood)}>{entry.mood}/10</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Entries */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Entries</CardTitle>
          </CardHeader>
          <CardContent>
            {entries.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">No journal entries yet</p>
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Start Journaling
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {entries.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getEntryIcon(entry.entryType)}</span>
                        <span className="text-sm text-white capitalize">
                          {entry.entryType.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(entry.date).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {entry.gratitudeList && (
                      <div className="mb-2">
                        <div className="text-xs text-slate-400 mb-1">Gratitude:</div>
                        <div className="text-sm text-slate-200">{entry.gratitudeList}</div>
                      </div>
                    )}
                    
                    {entry.prayerIntentions && (
                      <div className="mb-2">
                        <div className="text-xs text-slate-400 mb-1">Prayer Intentions:</div>
                        <div className="text-sm text-slate-200">{entry.prayerIntentions}</div>
                      </div>
                    )}
                    
                    {entry.notes && (
                      <div className="mb-2">
                        <div className="text-xs text-slate-400 mb-1">Notes:</div>
                        <div className="text-sm text-slate-200">{entry.notes}</div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">
                        Mood: <span className={getMoodColor(entry.mood)}>{entry.mood}/10</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {showAddForm && (
          <JournalForm
            onSubmit={handleCreateEntry}
            onCancel={() => setShowAddForm(false)}
          />
        )}
      </div>
    </div>
  )
}

interface JournalFormProps {
  onSubmit: (data: Omit<JournalEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

function JournalForm({ onSubmit, onCancel }: JournalFormProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    entryType: 'general' as JournalEntry['entryType'],
    mood: 7,
    prayerIntentions: '',
    gratitudeList: '',
    notes: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Journal Entry</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
              <select
                value={formData.entryType}
                onChange={(e) => setFormData({ ...formData, entryType: e.target.value as JournalEntry['entryType'] })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              >
                <option value="morning_prayer">🌅 Morning Prayer</option>
                <option value="gratitude">🙏 Gratitude</option>
                <option value="reflection">💭 Reflection</option>
                <option value="general">📝 General</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Mood (1-10)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.mood}
                onChange={(e) => setFormData({ ...formData, mood: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Prayer Intentions</label>
            <textarea
              value={formData.prayerIntentions}
              onChange={(e) => setFormData({ ...formData, prayerIntentions: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              rows={2}
              placeholder="What are you praying for today?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Gratitude List</label>
            <textarea
              value={formData.gratitudeList}
              onChange={(e) => setFormData({ ...formData, gratitudeList: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              rows={2}
              placeholder="What are you grateful for?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Notes & Reflections</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              rows={3}
              placeholder="Your thoughts and reflections..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Save Entry
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