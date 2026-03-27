import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import type { Vexation, Sector, Severity, Complexity } from '../../types'
import { validateProblemEdit } from '../../lib/ai.server'

interface EditVexationModalProps {
  isOpen: boolean
  onClose: () => void
  vexation: Vexation
  onSubmit: (updates: Partial<Vexation>) => Promise<void>
}

export default function EditVexationModal({ isOpen, onClose, vexation, onSubmit }: EditVexationModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: vexation.title,
    description: vexation.description,
    sector: vexation.sector || '',
    category: vexation.category || '',
    severity: vexation.severity || '',
    technicalComplexity: vexation.technicalComplexity || '',
    summary: vexation.summary || '',
    tags: vexation.tags ? vexation.tags.join(', ') : '',
    keyChallenges: vexation.keyChallenges ? vexation.keyChallenges.join(', ') : '',
    suggestedTechStack: vexation.suggestedTechStack ? vexation.suggestedTechStack.join(', ') : '',
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const validation = await validateProblemEdit({
        data: {
          title: formData.title,
          description: formData.description
        }
      })

      if (validation.isViolatingPolicies) {
        alert(validation.violationReason || 'This content violates platform policies.')
        setFormData({
          title: vexation.title,
          description: vexation.description,
          sector: (vexation.sector || '') as Sector,
          category: vexation.category || '',
          severity: (vexation.severity || '') as Severity,
          technicalComplexity: (vexation.technicalComplexity || '') as Complexity,
          summary: vexation.summary || '',
          tags: vexation.tags ? vexation.tags.join(', ') : '',
          keyChallenges: vexation.keyChallenges ? vexation.keyChallenges.join(', ') : '',
          suggestedTechStack: vexation.suggestedTechStack ? vexation.suggestedTechStack.join(', ') : '',
        })
        
        setLoading(false)
        return
      }

      const updates: Partial<Vexation> = {
        title: formData.title,
        description: formData.description,
        sector: formData.sector as Sector,
        category: formData.category,
        severity: formData.severity as Severity,
        technicalComplexity: formData.technicalComplexity as Complexity,
        summary: formData.summary,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        keyChallenges: formData.keyChallenges.split(',').map(challenge => challenge.trim()).filter(Boolean),
        suggestedTechStack: formData.suggestedTechStack.split(',').map(tech => tech.trim()).filter(Boolean),
      }

      await onSubmit(updates)
      onClose()
    } catch (err: any) {
      console.error(err)
      alert(err.message || "Failed to update vexation.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-vexed-bg2 border border-vexed-accent2 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-vexed-accent2 flex justify-between items-center bg-vexed-bg1 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">Edit Your Vexation</h2>
            <p className="text-sm text-vexed-dim mt-1">Changes to title and description will be reviewed by AI moderation.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors cursor-pointer self-start">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          {/* Core Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-vexed-dim uppercase tracking-widest border-b border-vexed-accent2 pb-2">Core Content</h3>
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
                rows={4}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-vexed-bg4 border border-vexed-accent2 rounded-lg px-4 py-2.5 text-sm text-white focus:border-vexed-primary focus:outline-none min-h-[100px]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-vexed-dim uppercase tracking-wider mb-2">Short Summary</label>
              <textarea 
                rows={2}
                value={formData.summary}
                onChange={e => setFormData({ ...formData, summary: e.target.value })}
                className="w-full bg-vexed-bg4 border border-vexed-accent2 rounded-lg px-4 py-2.5 text-sm text-white focus:border-vexed-primary focus:outline-none"
              />
            </div>
          </div>
          {/* Classification */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-vexed-dim uppercase tracking-widest border-b border-vexed-accent2 pb-2">Classification</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-vexed-dim uppercase tracking-wider mb-2">Sector</label>
                <input 
                  type="text"
                  value={formData.sector}
                  onChange={e => setFormData({ ...formData, sector: e.target.value as Sector })}
                  className="w-full bg-vexed-bg4 border border-vexed-accent2 rounded-lg px-4 py-2.5 text-sm text-white focus:border-vexed-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-vexed-dim uppercase tracking-wider mb-2">Category</label>
                <input 
                  type="text"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-vexed-bg4 border border-vexed-accent2 rounded-lg px-4 py-2.5 text-sm text-white focus:border-vexed-primary focus:outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-vexed-dim uppercase tracking-wider mb-2">Severity</label>
                <select 
                  value={formData.severity}
                  onChange={e => setFormData({ ...formData, severity: e.target.value as Severity })}
                  className="w-full bg-vexed-bg4 border border-vexed-accent2 rounded-lg px-4 py-2.5 text-sm text-white focus:border-vexed-primary focus:outline-none appearance-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-vexed-dim uppercase tracking-wider mb-2">Technical Complexity</label>
                <select 
                  value={formData.technicalComplexity}
                  onChange={e => setFormData({ ...formData, technicalComplexity: e.target.value as Complexity })}
                  className="w-full bg-vexed-bg4 border border-vexed-accent2 rounded-lg px-4 py-2.5 text-sm text-white focus:border-vexed-primary focus:outline-none appearance-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>
          {/* AI Insights & Tags */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-vexed-dim uppercase tracking-widest border-b border-vexed-accent2 pb-2">Insights & Tags</h3>
            <div>
              <label className="block text-xs font-semibold text-vexed-dim uppercase tracking-wider mb-2">Tags (comma separated)</label>
              <input 
                type="text"
                value={formData.tags}
                onChange={e => setFormData({ ...formData, tags: e.target.value })}
                className="w-full bg-vexed-bg4 border border-vexed-accent2 rounded-lg px-4 py-2.5 text-sm text-white focus:border-vexed-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-vexed-dim uppercase tracking-wider mb-2">Key Challenges (comma separated)</label>
              <textarea 
                rows={2}
                value={formData.keyChallenges}
                onChange={e => setFormData({ ...formData, keyChallenges: e.target.value })}
                className="w-full bg-vexed-bg4 border border-vexed-accent2 rounded-lg px-4 py-2.5 text-sm text-white focus:border-vexed-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-vexed-dim uppercase tracking-wider mb-2">Suggested Tech Stack (comma separated)</label>
              <textarea 
                rows={2}
                value={formData.suggestedTechStack}
                onChange={e => setFormData({ ...formData, suggestedTechStack: e.target.value })}
                className="w-full bg-vexed-bg4 border border-vexed-accent2 rounded-lg px-4 py-2.5 text-sm text-white focus:border-vexed-primary focus:outline-none"
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
              {loading ? 'Validating & Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}