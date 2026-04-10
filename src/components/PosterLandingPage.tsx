import { Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Sparkles, Plus } from 'lucide-react'
import { getVexations } from '../lib/db'
import { DUMMY_VEXATIONS } from '../lib/dummyData'
import type { Vexation } from '../types'
import RecentVexationCard from './cards/RecentVexationCard'

export default function PosterLandingPage() {
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

  const handleQuickSubmit = () => {
    if (quickInput.trim()) {
      navigate({ to: '/submit', search: { prefill: quickInput.trim() } })
    }
  }

  return (
    <div className="h-[calc(100dvh-3.5rem)] -mb-16 lg:h-screen lg:mb-0 flex flex-col bg-vexed-bg2 overflow-hidden relative">
      {/* Background Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[715px] h-[400px] sm:h-[715px] rounded-full bg-vexed-highlight1/20 blur-[120px]" />
      </div>

      {/* Hero — vertically centered */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-6 text-center">
        <h1 className="relative text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-2">
          What is{' '}
          <span className="bg-linear-to-r from-vexed-highlight1 to-vexed-highlight2 bg-clip-text text-transparent">
            broken
          </span>{' '}
          today?
        </h1>
        <p className="relative text-sm md:text-lg text-vexed-dim mb-4 md:mb-8 max-w-[80%]">
          Submit a real-world problem. Let the community build the fix.
        </p>

        {/* Input bar */}
        <div className="relative w-[85%] sm:w-[85%] md:w-[75%] max-w-2xl group">
          <div className="absolute -inset-[0.5px] rounded-xl bg-linear-to-r from-vexed-highlight1 via-vexed-highlight3 to-vexed-highlight1 blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
          <div className="relative rounded-xl bg-slate-800/90">
            <Plus size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Describe an issue, friction, or pain point..."
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleQuickSubmit()}
              className="relative w-full rounded-xl bg-transparent pl-11 pr-14 py-3 md:py-4 text-white text-base placeholder:text-gray-500 focus:outline-none transition-all"
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
      </section>

      {/* Recently Submitted — pinned to bottom */}
      <section className="shrink-0 pb-6 w-full">
        <div className="flex items-center justify-between px-6 mb-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Recently Submitted
          </h2>
          <Link to="/browse" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
            View all
          </Link>
        </div>

        {/* Horizontal scroll container with fade edges */}
        <div className="relative">
          {/* Left fade */}
          <div className="absolute left-0 top-0 bottom-0 w-10 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, #0b0c15, transparent)' }} />
          {/* Right fade */}
          <div className="absolute right-0 top-0 bottom-0 w-10 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, #0b0c15, transparent)' }} />

          {loading ? (
            <div className="flex gap-4 px-6 overflow-x-auto no-scrollbar md:grid md:grid-cols-3 md:max-w-6xl md:mx-auto">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 w-[280px] shrink-0 md:w-auto rounded-xl bg-slate-800/50 animate-pulse" />
              ))}
            </div>
          ) : recentVexations.length === 0 ? (
            <div className="text-center py-8 text-gray-500 px-6">
              <p className="text-sm mb-1">No vexations yet.</p>
              <Link to="/submit" search={{ prefill: '' }} className="text-indigo-400 hover:underline text-sm">
                Be the first to submit a problem
              </Link>
            </div>
          ) : (
            <div className="flex gap-4 px-6 overflow-x-auto no-scrollbar md:grid md:grid-cols-3 md:max-w-6xl md:mx-auto">
              {recentVexations.map((vex) => (
                <div key={vex.id} className="shrink-0 w-[280px] md:w-auto md:shrink">
                  <RecentVexationCard vexation={vex} />
                </div>
              ))}
            </div>
          )}

        </div>
      </section>
    </div>
  )

}
