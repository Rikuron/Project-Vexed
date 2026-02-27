import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Sparkles, ThumbsUp, MessageSquare } from 'lucide-react'
import { getVexations } from '../lib/firestore'
import type { Vexation } from '../lib/types'

export const Route = createFileRoute('/')({ component: LandingPage })

function LandingPage() {
  const navigate = useNavigate()
  const [quickInput, setQuickInput] = useState('')
  const [recentVexations, setRecentVexations] = useState<Vexation[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch recently submitted vexations for the bottom section
  useEffect(() => {
    getVexations({ sortBy: 'newest', limit: 3 })
      .then(setRecentVexations)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const suggestions = [
    'Slow loading on checkout...',
    'Color contrast accessibility...',
    'Mobile menu glitch...',
    'Broken user flow...',
  ]

  // Quick-submit redirects to /submit with the query pre-filled
  const handleQuickSubmit = () => {
    if (quickInput.trim()) {
      navigate({ to: '/submit', search: { prefill: quickInput.trim() } })
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* ── Hero Section ── */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-32 pb-20 text-center">
        {/* Subtle gradient glow behind the headline */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[600px] rounded-full bg-indigo-600/10 blur-[120px]" />
        </div>

        <h1 className="relative text-5xl md:text-7xl font-extrabold text-white leading-tight mb-4">
          What is{' '}
          <span className="bg-linear-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            broken
          </span>{' '}
          today?
        </h1>
        <p className="relative text-lg md:text-xl text-gray-400 mb-10 max-w-2xl">
          Submit a real-world problem. Let the community build the fix.
        </p>

        {/* ── Quick Submit Search Bar ── */}
        <div className="relative w-full max-w-2xl mb-6">
          <input
            type="text"
            placeholder="Describe an issue, friction, or pain point..."
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleQuickSubmit()}
            className="w-full rounded-xl border border-slate-700 bg-slate-800/60 backdrop-blur-sm px-5 py-4 pr-14 text-white text-lg placeholder:text-gray-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all"
          />
          <button
            onClick={handleQuickSubmit}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-indigo-600 hover:bg-indigo-500 p-2.5 text-white transition-colors"
            aria-label="Submit with AI"
          >
            <Sparkles size={20} />
          </button>
        </div>

        {/* ── Suggestion Chips ── */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
          <span className="text-gray-500">Try asking:</span>
          {suggestions.map((text) => (
            <button
              key={text}
              onClick={() => {
                setQuickInput(text)
                navigate({ to: '/submit', search: { prefill: text } })
              }}
              className="rounded-full border border-slate-700 bg-slate-800/50 px-4 py-1.5 text-gray-300 hover:border-indigo-500/50 hover:text-white transition-colors"
            >
              "{text}"
            </button>
          ))}
        </div>
      </section>

      {/* ── Recently Submitted Section ── */}
      <section className="px-6 pb-20 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-indigo-400">
            Recently Submitted
          </h2>
          <Link
            to="/browse"
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            View all
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-xl bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        ) : recentVexations.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg mb-2">No vexations yet.</p>
            <p>Be the first to <Link to="/submit" search={{ prefill: '' }} className="text-indigo-400 hover:underline">submit a problem</Link>!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentVexations.map((vex) => (
              <Link
                key={vex.id}
                to="/vexation/$id"
                params={{ id: vex.id }}
                className="group rounded-xl border border-slate-700/50 bg-slate-800/30 p-5 hover:border-indigo-500/40 hover:bg-slate-800/50 transition-all duration-200"
              >
                {/* Sector badge + time */}
                <div className="flex items-center justify-between mb-3">
                  <span className="rounded-md bg-indigo-600/20 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-indigo-400">
                    {vex.sector}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(vex.createdAt)}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-white font-semibold mb-2 group-hover:text-indigo-300 transition-colors line-clamp-2">
                  {vex.title}
                </h3>

                {/* Summary */}
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                  {vex.summary}
                </p>

                {/* Footer stats */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <ThumbsUp size={12} /> {vex.upvotes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare size={12} /> {vex.commentCount}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

// ── Helper: relative time display ──
function formatTimeAgo(timestamp: any): string {
  if (!timestamp?.toDate) return ''
  const now = Date.now()
  const then = timestamp.toDate().getTime()
  const diffMs = now - then
  const diffMins = Math.floor(diffMs / 60_000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}
