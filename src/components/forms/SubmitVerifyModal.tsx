import { useState } from 'react'
import { X, Check, Loader2 } from 'lucide-react'
import type { AIAnalysis, Sector, Severity, Complexity } from '../../lib/types'
import { SECTORS } from '../../lib/types'

interface SubmitVerifyModalProps {
  initialTitle: string
  initialDescription: string
  initialAiResult: AIAnalysis
  isSaving: boolean
  onCancel: () => void
  onConfirm: (data: { title: string; description: string; aiResult: AIAnalysis }) => void
}

export default function SubmitVerifyModal({
  initialTitle,
  initialDescription,
  initialAiResult,
  isSaving,
  onCancel,
  onConfirm,
}: SubmitVerifyModalProps) {
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const [summary, setSummary] = useState(initialAiResult.summary)
  const [sector, setSector] = useState<Sector>(initialAiResult.sector)
  const [severity, setSeverity] = useState<Severity>(initialAiResult.severity)
  const [complexity, setComplexity] = useState<Complexity>(initialAiResult.technicalComplexity)

  const handleSave = () => {
    onConfirm({
      title,
      description,
      aiResult: {
        ...initialAiResult,
        summary,
        sector,
        severity,
        technicalComplexity: complexity,
      },
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/50 px-6 py-4 sticky top-0 bg-slate-900/95 backdrop-blur-md z-10">
          <div>
            <h2 className="text-xl font-bold text-white">Review your Vexation</h2>
            <p className="text-sm text-gray-400">Review and edit the AI analysis before submitting.</p>
          </div>
          <button 
            onClick={onCancel}
            disabled={isSaving}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Original Content */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-white resize-y focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="w-full h-px bg-slate-700/50" />

          {/* AI Analyzed Content */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">AI Summary</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-white resize-y focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Sector */}
              <div>
                <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">Sector</label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value as Sector)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 appearance-none"
                >
                  {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Severity */}
              <div>
                <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as Severity)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 appearance-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              {/* Complexity */}
              <div>
                <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">Complexity</label>
                <select
                  value={complexity}
                  onChange={(e) => setComplexity(e.target.value as Complexity)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 appearance-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-700/50 px-6 py-4 bg-slate-800/30 rounded-b-xl">
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-gray-500 px-6 py-2.5 text-sm font-medium text-white transition-colors"
          >
            {isSaving ? (
              <><Loader2 size={16} className="animate-spin" /> Saving...</>
            ) : (
              <><Check size={16} /> Confirm & Submit</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
