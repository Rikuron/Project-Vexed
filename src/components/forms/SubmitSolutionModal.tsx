import { useState } from 'react'
import { X, Loader2, UploadCloud } from 'lucide-react'
import type { Solution } from '../../types/solution'
import { Timestamp } from 'firebase/firestore'
import { uploadSolutionImages } from '../../lib/db/storage'
import { updateSolution } from '../../lib/db'

interface SubmitSolutionModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  onSubmit: (data: Omit<Solution, 'id' | 'dateSubmitted' | 'vexationId' | 'solverId' | 'solverDisplayName'>) => Promise<string>
}

export default function SubmitSolutionModal({ isOpen, onClose, userId, onSubmit }: SubmitSolutionModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    repositoryUrl: '',
    liveUrl: '',
    dateStarted: '',
    techStack: ''
  })
  const [imageFiles, setImageFiles] = useState<File[]>([])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const parsedDate = new Date(formData.dateStarted)
      
      // 1. Create solution doc first (without images) to get the real ID
      const solutionData = {
        title: formData.title,
        description: formData.description,
        repositoryUrl: formData.repositoryUrl,
        liveUrl: formData.liveUrl,
        dateStarted: Timestamp.fromDate(parsedDate),
        techStack: formData.techStack.split(',').map(s => s.trim()).filter(Boolean),
        images: [] as string[]
      }
      
      const solutionId = await onSubmit(solutionData)

      // 2. Upload images under the real solution ID, then patch the doc
      if (imageFiles.length > 0) {
        const uploadedImageUrls = await uploadSolutionImages(imageFiles, solutionId)
        await updateSolution(solutionId, userId, { images: uploadedImageUrls })
      }

      onClose()
    } catch (err) {
      console.error(err)
      alert("Failed to submit solution.")
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setImageFiles(prev => [...prev, ...Array.from(e.target.files!)])
  }

  const removeFile = (index: number) => setImageFiles(prev => prev.filter((_, i) => i !== index))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-vexed-bg2 border border-vexed-accent2 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-vexed-accent2 flex justify-between items-center bg-vexed-bg1">
          <h2 className="text-xl font-bold text-white">Publish Your Solution</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          {/* Image Upload Section — pulled out of the grid */}
          <div>
            <label className="block text-xs font-semibold text-vexed-dim uppercase tracking-wider mb-2">Screenshots & Images</label>
            <label className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors text-sm font-semibold text-gray-300 w-full text-center">
              <UploadCloud size={18} />
              Select Images
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange} 
              />
            </label>

            {imageFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 p-4 border border-slate-800 bg-slate-900/50 rounded-lg">
                {imageFiles.map((file, idx) => (
                  <div key={idx} className="relative group rounded-md overflow-hidden bg-slate-800 shrink-0">
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt="Preview" 
                      className="h-16 w-16 object-cover opacity-80 group-hover:opacity-40 transition-opacity"
                    />
                    <button 
                      type="button" 
                      onClick={() => removeFile(idx)}
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white cursor-pointer"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
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