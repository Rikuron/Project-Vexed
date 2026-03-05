import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Sparkles, Plus } from 'lucide-react'
import { getVexations } from '../lib/db'
import { DUMMY_VEXATIONS } from '../lib/dummyData'
import type { Vexation } from '../types'
import AuthButton from '../components/auth/AuthButton'
import RecentVexationCard from '../components/cards/RecentVexationCard'

export const Route = createFileRoute('/')({ component: LandingPage })

function LandingPage() {
  const navigate = useNavigate()
  const [quickInput, setQuickInput] = useState('')
  const [recentVexations, setRecentVexations] = useState<Vexation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getVexations({ sortBy: 'newest', limit: 3 })
      .then((data) => setRecentVexations(data.length > 0 ? data : DUMMY_VEXATIONS))
      .catch(() => setRecentVexations(DUMMY_VEXATIONS))
      .finally(() => setLoading(false))
  }, [])

  const suggestions = [
    'Slow loading on checkout...',
    'Color contrast accessibility...',
    'Mobile menu glitch...',
    'Broken user flow...',
  ]

  const handleQuickSubmit = () => {
    if (quickInput.trim()) {
      navigate({ to: '/submit', search: { prefill: quickInput.trim() } })
    }
  }

  return (
    <div className="h-screen flex flex-col bg-vexed-bg2 overflow-hidden">
      {/* Background Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[27.5%] left-[60%] -translate-x-1/2 -translate-y-1/2 w-[715px] h-[715px] rounded-full bg-vexed-highlight1/20 blur-[120px]" />
      </div>

      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 px-3 py-1 text-xs font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E] animate-pulse" />
            System Operational
          </span>
          <span className="text-xs text-gray-500">v0.0.1</span>
        </div>
        <AuthButton />
      </header>

      {/* Hero */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-6 text-center">
        <h1 className="relative text-4xl md:text-5xl font-extrabold text-white mb-1">
          What is{' '}
          <span className="bg-linear-to-r from-vexed-highlight1 to-vexed-highlight2 bg-clip-text text-transparent">
            broken
          </span>{' '}
          today?
        </h1>
        <p className="relative text-base md:text-lg text-vexed-dim mb-8 max-w-2xl">
          Submit a real-world problem. Let the community build the fix.
        </p>

        {/* Search bar with gradient border glow on focus */}
        <div className="relative w-[75%] mb-6 group">
          {/* Gradient border wrapper */}
          <div className="absolute -inset-[0.5px] rounded-xl bg-linear-to-r from-vexed-highlight1 via-vexed-highlight3 to-vexed-highlight1 blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />

          {/* Inner container (masks the gradient, leaving only the border visible) */}
          <div className="relative rounded-xl bg-slate-800/90">
            <Plus size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Describe an issue, friction, or pain point..."
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleQuickSubmit()}
              className="relative w-full rounded-xl bg-transparent pl-11 pr-14 py-4 text-white text-base placeholder:text-gray-500 focus:outline-none transition-all"
            />
            <button
              onClick={handleQuickSubmit}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-indigo-600 hover:bg-indigo-500 p-2.5 text-white transition-colors"
              aria-label="Submit with AI"
            >
              <Sparkles size={20} />
            </button>
          </div>
        </div>

        {/* Suggestion chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-[13px]">
          <span className="text-gray-500">Try asking:</span>
          {suggestions.map((text) => (
            <button
              key={text}
              onClick={() => navigate({ to: '/submit', search: { prefill: text } })}
              className="rounded-full border border-slate-700 bg-slate-800/50 px-4 py-1.5 text-gray-300 hover:border-indigo-500/50 hover:text-white transition-colors"
            >
              "{text}"
            </button>
          ))}
        </div>
      </section>

      {/* Recently Submitted */}
      <section className="px-6 pb-8 max-w-6xl mx-auto w-full shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Recently Submitted
          </h2>
          <Link to="/browse" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
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
            <p>Be the first to{' '}
              <Link to="/submit" search={{ prefill: '' }} className="text-indigo-400 hover:underline">
                submit a problem
              </Link>!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentVexations.map((vex) => (
              <RecentVexationCard key={vex.id} vexation={vex} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}