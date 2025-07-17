import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Slider } from '../ui/slider'
import { Heart, Plus, X } from 'lucide-react'

interface JournalEntryModalProps {
  trigger?: React.ReactNode
  onEntryAdd?: (entry: any) => void
}

export default function JournalEntryModal({ trigger, onEntryAdd }: JournalEntryModalProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    entryType: 'reflection',
    mood: [7],
    prayerIntentions: [''],
    gratitudeList: ['', '', ''],
    reflection: '',
    insights: ''
  })

  const entryTypes = [
    { value: 'morning-prayer', label: '🌅 Morning Prayer', color: 'text-yellow-400' },
    { value: 'gratitude', label: '🙏 Gratitude', color: 'text-green-400' },
    { value: 'reflection', label: '🤔 Reflection', color: 'text-blue-400' },
    { value: 'evening-prayer', label: '🌙 Evening Prayer', color: 'text-purple-400' },
    { value: 'dua', label: '🤲 Dua/Supplication', color: 'text-pink-400' },
    { value: 'quran-study', label: '📖 Quran Study', color: 'text-emerald-400' }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newEntry = {
      id: Date.now(),
      entryType: formData.entryType,
      mood: formData.mood[0],
      prayerIntentions: formData.prayerIntentions.filter(intention => intention.trim() !== ''),
      gratitudeList: formData.gratitudeList.filter(item => item.trim() !== ''),
      reflection: formData.reflection,
      insights: formData.insights,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    }

    onEntryAdd?.(newEntry)
    
    // Reset form
    setFormData({
      entryType: 'reflection',
      mood: [7],
      prayerIntentions: [''],
      gratitudeList: ['', '', ''],
      reflection: '',
      insights: ''
    })
    
    setOpen(false)
  }

  const getMoodLabel = (value: number) => {
    if (value <= 2) return '😞 Struggling'
    if (value <= 4) return '😕 Low'
    if (value <= 6) return '😐 Neutral'
    if (value <= 8) return '😊 Good'
    return '😇 Blessed'
  }

  const addPrayerIntention = () => {
    setFormData(prev => ({
      ...prev,
      prayerIntentions: [...prev.prayerIntentions, '']
    }))
  }

  const removePrayerIntention = (index: number) => {
    setFormData(prev => ({
      ...prev,
      prayerIntentions: prev.prayerIntentions.filter((_, i) => i !== index)
    }))
  }

  const updatePrayerIntention = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      prayerIntentions: prev.prayerIntentions.map((intention, i) => 
        i === index ? value : intention
      )
    }))
  }

  const updateGratitudeItem = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      gratitudeList: prev.gratitudeList.map((item, i) => 
        i === index ? value : item
      )
    }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            <Heart size={16} className="mr-2" />
            Journal Entry
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">New Spiritual Journal Entry</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-slate-300">Entry Type</Label>
            <Select value={formData.entryType} onValueChange={(value) => setFormData(prev => ({ ...prev, entryType: value }))}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {entryTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Spiritual Mood</Label>
            <div className="px-2">
              <Slider
                value={formData.mood}
                onValueChange={(value) => setFormData(prev => ({ ...prev, mood: value }))}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>1</span>
                <span className="text-slate-300">{getMoodLabel(formData.mood[0])}</span>
                <span>10</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-slate-300">Prayer Intentions</Label>
              <Button
                type="button"
                size="sm"
                onClick={addPrayerIntention}
                className="bg-slate-600 hover:bg-slate-500 text-white"
              >
                <Plus size={14} />
              </Button>
            </div>
            <div className="space-y-2">
              {formData.prayerIntentions.map((intention, index) => (
                <div key={index} className="flex space-x-2">
                  <Input
                    value={intention}
                    onChange={(e) => updatePrayerIntention(index, e.target.value)}
                    placeholder={`Prayer intention ${index + 1}...`}
                    className="bg-slate-700 border-slate-600 text-white flex-1"
                  />
                  {formData.prayerIntentions.length > 1 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => removePrayerIntention(index)}
                      className="bg-slate-600 border-slate-500 hover:bg-slate-500"
                    >
                      <X size={14} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Gratitude List (3 things)</Label>
            <div className="space-y-2">
              {formData.gratitudeList.map((item, index) => (
                <Input
                  key={index}
                  value={item}
                  onChange={(e) => updateGratitudeItem(index, e.target.value)}
                  placeholder={`I'm grateful for... ${index + 1}`}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reflection" className="text-slate-300">Reflection & Thoughts</Label>
            <Textarea
              id="reflection"
              value={formData.reflection}
              onChange={(e) => setFormData(prev => ({ ...prev, reflection: e.target.value }))}
              placeholder="How did I feel spiritually today? What challenged me? What brought me closer to Allah?"
              className="bg-slate-700 border-slate-600 text-white"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="insights" className="text-slate-300">Insights & Lessons</Label>
            <Textarea
              id="insights"
              value={formData.insights}
              onChange={(e) => setFormData(prev => ({ ...prev, insights: e.target.value }))}
              placeholder="What did I learn? How can I improve tomorrow? Verses or hadith that inspired me..."
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
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              Save Entry
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}