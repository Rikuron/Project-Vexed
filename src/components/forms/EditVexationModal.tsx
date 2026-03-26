import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import type { Vexation } from '../../types'

interface EditVexationModalProps {
  isOpen: boolean
  onClose: () => void
  vexation: Vexation
  onSubmit: (updates: { title: string; description: string }) => Promise<void>
}

export default function EditVexationModal({ isOpen, onClose, vexation, onSubmit }: EditVexationModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: vexation.title,
    description: vexation.description,
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await onSubmit(formData)
      onClose()
    } catch (err) {
      console.error(err)
      alert("Failed to update vexation.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-vexed-bg2 border border-vexed-accent2 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
        <div className="p-6 border-b border-vexed-accent2 flex justify-between items-center bg-vexed-bg1">
          <h2 className="text-xl font-bold text-white">Edit Your Vexation</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-vexed-dim uppercase tracking-wider mb-2">Vexation Title *</label>
            <input 
              required
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-vexed-bg4 border border-vexed-accent2 rounded-lg px-4 py-2.5 text-sm text-white focus:border-vexed-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-vexed-dim uppercase tracking-wider mb-2">Description *</label>
            <textarea 
              required
              rows={6}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-vexed-bg4 border border-vexed-accent2 rounded-lg px-4 py-2.5 text-sm text-white focus:border-vexed-primary focus:outline-none"
            />
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
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}