import { Link } from '@tanstack/react-router'
import { CheckCircle2 } from 'lucide-react'
import type { AIAnalysis } from '../../types'

interface SubmitSuccessProps {
  createdId: string
  aiResult: AIAnalysis | null
  onReset: () => void
}

export default function SubmitSuccess({ createdId, aiResult, onReset }: SubmitSuccessProps) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[27.5%] left-[60%] -translate-x-1/2 -translate-y-1/2 w-[715px] h-[715px] rounded-full bg-vexed-highlight1/20 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-lg w-full text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle2 size={40} className="text-emerald-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Vexation Submitted!</h1>
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
          <Link
            to="/vexation/$id"
            params={{ id: createdId }}
            className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 text-sm font-medium text-white transition-colors"
          >
            View Your Vexation
          </Link>
          <button
            onClick={onReset}
            className="rounded-lg border border-slate-700 px-6 py-2.5 text-sm font-medium text-gray-300 hover:border-slate-600 hover:text-white transition-colors"
          >
            Submit Another
          </button>
        </div>
      </div>
    </div>
  )
}
