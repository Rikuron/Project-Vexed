import { useState } from 'react'
import { X, Loader2, UploadCloud } from 'lucide-react'
import type { Solution } from '../../types'
import { uploadImages } from '../../lib/db/storage'

interface EditSolutionModalProps {
  isOpen: boolean
  onClose: () => void
  solution: Solution
  onSubmit: (updates: Partial<Solution>) => Promise<void>
}

export default function EditSolutionModal({ isOpen, onClose, solution, onSubmit }: EditSolutionModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: solution.title,
    description: solution.description,
    repositoryUrl: solution.repositoryUrl || '',
    liveUrl: solution.liveUrl || '',
    techStack: solution.techStack ? solution.techStack.join(', ') : ''
  })
  const [existingImages, setExistingImages] = useState<string[]>(solution.images || [])
  const [newImageFiles, setNewImageFiles] = useState<File[]>([])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      let uploadedImageUrls: string[] = []
      if (newImageFiles.length > 0) {
        uploadedImageUrls = await uploadImages(newImageFiles, 'solutions')
      }

      const finalImages = [...existingImages, ...uploadedImageUrls]

      const updates: Partial<Solution> = {
        title: formData.title,
        description: formData.description,
        repositoryUrl: formData.repositoryUrl,
        liveUrl: formData.liveUrl,
        techStack: formData.techStack.split(',').map(s => s.trim()).filter(Boolean),
        images: finalImages
      }
      
      await onSubmit(updates)
      onClose()
    } catch (err) {
      console.error(err)
      alert("Failed to update solution.")
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setNewImageFiles(prev => [...prev, ...Array.from(e.target.files!)])
  }
  const removeExistingImage = (index: number) => setExistingImages(prev => prev.filter((_, i) => i !== index))
  const removeNewFile = (index: number) => setNewImageFiles(prev => prev.filter((_, i) => i !== index))


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-vexed-bg2 border border-vexed-accent2 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-vexed-accent2 flex justify-between items-center bg-vexed-bg1">
          <h2 className="text-xl font-bold text-white">Edit Your Solution</h2>
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
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-vexed-dim uppercase tracking-wider mb-2">Live Demo URL</label>
              <input 
                type="url"
                value={formData.liveUrl}
                onChange={e => setFormData({ ...formData, liveUrl: e.target.value })}
                className="w-full bg-vexed-bg4 border border-vexed-accent2 rounded-lg px-4 py-2.5 text-sm text-white focus:border-vexed-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-vexed-dim uppercase tracking-wider mb-2">Tech Stack (comma separated)</label>
            <input 
              type="text"
              value={formData.techStack}
              onChange={e => setFormData({ ...formData, techStack: e.target.value })}
              className="w-full bg-vexed-bg4 border border-vexed-accent2 rounded-lg px-4 py-2.5 text-sm text-white focus:border-vexed-primary focus:outline-none"
              placeholder="e.g. React, Node.js, Redis"
            />
          </div>

          {/* Image Edit Section */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-vexed-dim uppercase tracking-wider mb-2">Screenshots & Images</label>
            <label className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors text-sm font-semibold text-gray-300 w-full text-center">
              <UploadCloud size={18} />
              Add More Images
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange} 
              />
            </label>

            {(existingImages.length > 0 || newImageFiles.length > 0) && (
              <div className="flex flex-wrap gap-2 mt-4 p-4 border border-slate-800 bg-slate-900/50 rounded-lg max-h-40 overflow-y-auto">
                {existingImages.map((url, idx) => (
                  <div key={`existing-${idx}`} className="relative group rounded-md overflow-hidden bg-slate-800 shrink-0">
                    <img src={url} alt="Existing" className="h-16 w-16 object-cover opacity-80 group-hover:opacity-40 transition-opacity" />
                    <button type="button" onClick={() => removeExistingImage(idx)} className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white cursor-pointer">
                      <X size={20} />
                    </button>
                  </div>
                ))}
                {newImageFiles.map((file, idx) => (
                  <div key={`new-${idx}`} className="relative group rounded-md overflow-hidden bg-slate-800 border border-emerald-500 shrink-0">
                    <img src={URL.createObjectURL(file)} alt="New" className="h-16 w-16 object-cover opacity-80 group-hover:opacity-40 transition-opacity" />
                    <button type="button" onClick={() => removeNewFile(idx)} className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white cursor-pointer">
                      <X size={20} />
                    </button>
                    <span className="absolute bottom-0 right-0 bg-emerald-500 text-white text-[8px] px-1 font-bold z-10">NEW</span>
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
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}