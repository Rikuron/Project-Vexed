import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Loader2, Bookmark, ThumbsUp, Eye } from 'lucide-react'
import { getSavedVexations } from '../../lib/firestore'
import { useAuth } from '../../lib/auth'
import type { Vexation } from '../../lib/types'

export const Route = createFileRoute('/my/saved')({
  component: SavedPage,
})

function SavedPage() {
  const { user, loading: authLoading } = useAuth()
  const [vexations, setVexations] = useState<Vexation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    setLoading(true)
    getSavedVexations(user.uid)
      .then(setVexations)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  // Not signed in
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center px-6">
        <Bookmark size={48} className="text-gray-600 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">
          Sign in to view saved vexations
        </h1>
        <p className="text-gray-400">
          Bookmark problems you're interested in solving.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-white mb-2">Saved Vexations</h1>
        <p className="text-gray-400 mb-8">
          Problems you've bookmarked for later.
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-indigo-400" />
          </div>
        ) : vexations.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg mb-2">No saved vexations yet.</p>
            <Link
              to="/browse"
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Browse problems to bookmark some
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vexations.map((vex) => (
              <Link
                key={vex.id}
                to="/vexation/$id"
                params={{ id: vex.id }}
                className="group flex flex-col rounded-xl border border-slate-700/50 bg-slate-800/30 p-5 hover:border-indigo-500/40 hover:bg-slate-800/50 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="rounded-md bg-indigo-600/20 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-indigo-400">
                    {vex.sector}
                  </span>
                  <Bookmark size={14} className="text-indigo-400" fill="currentColor" />
                </div>
                <h3 className="text-white font-semibold mb-2 group-hover:text-indigo-300 transition-colors line-clamp-2">
                  {vex.title}
                </h3>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2 flex-1">
                  {vex.summary}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-slate-700/50">
                  <span className="flex items-center gap-1">
                    <ThumbsUp size={12} /> {vex.upvotes}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye size={12} /> {vex.viewCount}
                  </span>
                  <span className="ml-auto capitalize">{vex.technicalComplexity}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
