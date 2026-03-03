import { Send, Loader2, AlertCircle, Sparkles } from 'lucide-react'
import type { User } from 'firebase/auth'

type SubmitState = 'idle' | 'analyzing' | 'verifying' | 'saving' | 'success' | 'error'

interface SubmitFormProps {
  user: User | null
  title: string
  setTitle: (title: string) => void
  description: string
  setDescription: (desc: string) => void
  state: SubmitState
  errorMsg: string
  onSubmit: (e: React.FormEvent) => void
  canSubmit: boolean
}

export default function SubmitForm({
  user,
  title,
  setTitle,
  description,
  setDescription,
  state,
  errorMsg,
  onSubmit,
  canSubmit,
}: SubmitFormProps) {
  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Background Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[27.5%] left-[60%] -translate-x-1/2 -translate-y-1/2 w-[715px] h-[715px] rounded-full bg-vexed-highlight1/20 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Submit a Vexation</h1>
          <p className="text-gray-400">
            Describe a real-world problem you've encountered. Our AI will categorize it and make it
            discoverable for developers looking for project ideas.
          </p>
        </div>

        {/* Anonymous notice */}
        {!user && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-800/30 px-4 py-3 text-sm text-gray-400">
            <Sparkles size={16} className="text-indigo-400 shrink-0" />
            <span>
              You're posting anonymously.{' '}
              <span className="text-indigo-400">Sign in</span> to track your submissions.
            </span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              Title
            </label>
            <input
              id="title"
              type="text"
              placeholder="e.g. Real-time settlement lag in multi-currency transactions"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={state !== 'idle' && state !== 'error'}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-colors disabled:opacity-50"
            />
            <p className="mt-1 text-xs text-gray-500">{title.trim().length}/5 characters minimum</p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              rows={8}
              placeholder="Describe the problem in detail. What happens? What should happen? What have you tried?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={state !== 'idle' && state !== 'error'}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-colors resize-y disabled:opacity-50"
            />
            <p className="mt-1 text-xs text-gray-500">
              {description.trim().length}/20 characters minimum
            </p>
          </div>

          {/* Error message */}
          {state === 'error' && (
            <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Submission failed</p>
                <p className="text-red-400/80">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={!canSubmit || (state !== 'idle' && state !== 'error')}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-gray-500 px-6 py-3.5 text-sm font-semibold text-white transition-colors"
          >
            {state === 'analyzing' ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                AI is analyzing your problem...
              </>
            ) : state === 'saving' ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving to database...
              </>
            ) : (
              <>
                <Send size={18} />
                Submit Vexation
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
