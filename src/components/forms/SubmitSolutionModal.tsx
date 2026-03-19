import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import type { Solution } from '../../types/solution'
import { Timestamp } from 'firebase/firestore'

interface SubmitSolutionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Omit<Solution, 'id' | 'dateSubmitted' | 'vexationId' | 'solverId' | 'solverDisplayName'>) => Promise<void>
}

export default function SubmitSolutionModal({ isOpen, onClose, onSubmit }: SubmitSolutionModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    repositoryUrl: '',
    liveUrl: '',
    dateStarted: '',
    techStack: ''
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const parsedDate = new Date(formData.dateStarted)
      
      const solutionData = {
        title: formData.title,
        description: formData.description,
        repositoryUrl: formData.repositoryUrl,
        liveUrl: formData.liveUrl,
        dateStarted: Timestamp.fromDate(parsedDate),
        techStack: formData.techStack.split(',').map(s => s.trim()).filter(Boolean)
      }
      
      await onSubmit(solutionData)
      onClose()
    } catch (err) {
      console.error(err)
      alert("Failed to submit solution.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-vexed-bg2 border border-vexed-accent2 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
        <div className="p-6 border-b border-vexed-accent2 flex justify-between items-center bg-vexed-bg1">
          <h2 className="text-xl font-bold text-white">Publish Your Solution</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-vexed-dim uppercase tracking-wider mb-2">Solution Title *</label>
            <input 
              required
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-vexed-bg4 border border-vexed-accent2 rounded-lg px-4 py-2.5 text-sm text-white focus:border-vexed-primary focus:outline-none"
              placeholder="e.g. Distributed Memory Cache System"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-vexed-dim uppercase tracking-wider mb-2">Description *</label>
            <textarea 
              required
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-vexed-bg4 border border-vexed-accent2 rounded-lg px-4 py-2.5 text-sm text-white focus:border-vexed-primary focus:outline-none"
              placeholder="Explain how this solves the problem..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-vexed-dim uppercase tracking-wider mb-2">Repository URL</label>
              <input 
                type="url"
                value={formData.repositoryUrl}
                onChange={e => setFormData({ ...formData, repositoryUrl: e.target.value })}
                className="w-full bg-vexed-bg4 border border-vexed-accent2 rounded-lg px-4 py-2.5 text-sm text-white focus:border-vexed-primary focus:outline-none"
                placeholder="https://github.com/..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-vexed-dim uppercase tracking-wider mb-2">Live Demo URL</label>
              <input 
                type="url"
                value={formData.liveUrl}
                onChange={e => setFormData({ ...formData, liveUrl: e.target.value })}
                className="w-full bg-vexed-bg4 border border-vexed-accent2 rounded-lg px-4 py-2.5 text-sm text-white focus:border-vexed-primary focus:outline-none"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-vexed-dim uppercase tracking-wider mb-2">Date Started *</label>
              <input 
                required
                type="date"
                value={formData.dateStarted}
                onChange={e => setFormData({ ...formData, dateStarted: e.target.value })}
                className="w-full bg-vexed-bg4 border border-vexed-accent2 rounded-lg px-4 py-2.5 text-sm text-white focus:border-vexed-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-vexed-dim uppercase tracking-wider mb-2">Tech Stack</label>
              <input 
                type="text"
                value={formData.techStack}
                onChange={e => setFormData({ ...formData, techStack: e.target.value })}
                className="w-full bg-vexed-bg4 border border-vexed-accent2 rounded-lg px-4 py-2.5 text-sm text-white focus:border-vexed-primary focus:outline-none"
                placeholder="e.g. React, Node.js, Redis"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-vexed-accent2 mt-6">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-vexed-dim hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="cursor-pointer px-5 py-2.5 rounded-lg bg-vexed-primary hover:bg-vexed-secondary text-sm font-semibold text-white transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Submitting...' : 'Upload Solution'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}