import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Send, Loader2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react'
import { analyzeProblem } from '../lib/ai.server'
import { createVexation } from '../lib/firestore'
import { useAuth } from '../lib/auth'
import type { AIAnalysis } from '../lib/types'

// Accept optional `prefill` search param from the landing page quick-submit
export const Route = createFileRoute('/submit')({
  validateSearch: (search: Record<string, unknown>) => ({
    prefill: (search.prefill as string) || '',
  }),
  component: SubmitPage,
})

type SubmitState = 'idle' | 'analyzing' | 'saving' | 'success' | 'error'

function SubmitPage() {
  const { prefill } = Route.useSearch()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [title, setTitle] = useState(prefill)
  const [description, setDescription] = useState('')
  const [state, setState] = useState<SubmitState>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [aiResult, setAiResult] = useState<AIAnalysis | null>(null)
  const [createdId, setCreatedId] = useState('')

  const canSubmit = title.trim().length >= 5 && description.trim().length >= 20

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    setErrorMsg('')

    try {
      // Step 1: AI analysis via server function
      setState('analyzing')
      const analysis = await analyzeProblem({
        data: { title: title.trim(), description: description.trim() },
      })
      setAiResult(analysis)

      // Step 2: Save to Firestore
      setState('saving')
      const docId = await createVexation(
        { title: title.trim(), description: description.trim() },
        analysis,
        user?.uid,
        user?.displayName ?? undefined,
      )
      setCreatedId(docId)

      setState('success')
    } catch (err) {
      setState('error')
      setErrorMsg(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      )
    }
  }

  // ── Success State ──
  if (state === 'success') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
        <div className="max-w-lg w-full text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 size={40} className="text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            Vexation Submitted!
          </h1>
          <p className="text-gray-400 mb-8">
            Your problem has been analyzed by AI and is now live for developers to discover.
          </p>

          {/* AI Summary Preview */}
          {aiResult && (
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-5 mb-8 text-left">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-indigo-400 mb-3">
                AI Analysis
              </h3>
              <p className="text-sm text-gray-300 mb-3">{aiResult.summary}</p>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-md bg-indigo-600/20 px-2 py-0.5 text-xs font-medium text-indigo-400 uppercase">
                  {aiResult.sector}
                </span>
                {aiResult.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-slate-700/50 px-2 py-0.5 text-xs text-gray-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate({ to: '/vexation/$id', params: { id: createdId } })}
              className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 text-sm font-medium text-white transition-colors"
            >
              View Your Vexation
            </button>
            <button
              onClick={() => {
                setTitle('')
                setDescription('')
                setAiResult(null)
                setCreatedId('')
                setState('idle')
              }}
              className="rounded-lg border border-slate-700 px-6 py-2.5 text-sm font-medium text-gray-300 hover:border-slate-600 hover:text-white transition-colors"
            >
              Submit Another
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Form State ──
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">
            Submit a Vexation
          </h1>
          <p className="text-gray-400">
            Describe a real-world problem you've encountered. Our AI will categorize
            it and make it discoverable for developers looking for project ideas.
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

        <form onSubmit={handleSubmit} className="space-y-6">
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
            <p className="mt-1 text-xs text-gray-500">
              {title.trim().length}/5 characters minimum
            </p>
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
