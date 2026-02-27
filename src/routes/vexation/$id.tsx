import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { ThumbsUp, Bookmark, Share2, MessageSquare, Loader2, Shield, Cpu, AlertTriangle, } from 'lucide-react'
import { 
  getVexationById,
  upvoteVexation,
  toggleSaveVexation,
  hasUserVoted,
  incrementViewCount,
} from '../../lib/firestore'
import { useAuth } from '../../lib/auth'
import type { Vexation } from '../../lib/types'

export const Route = createFileRoute('/vexation/$id')({
  component: VexationDetailPage,
})

// ── Severity badge styling ──
const SEVERITY_STYLES: Record<string, string> = {
  low: 'bg-emerald-500/20 text-emerald-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  high: 'bg-orange-500/20 text-orange-400',
  critical: 'bg-red-500/20 text-red-400',
}

function VexationDetailPage() {
  const { id } = Route.useParams()
  const { user } = useAuth()

  const [vexation, setVexation] = useState<Vexation | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasVoted, setHasVoted] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [voteLoading, setVoteLoading] = useState(false)
  const [localUpvotes, setLocalUpvotes] = useState(0)
  const [shareTooltip, setShareTooltip] = useState(false)

  // Fetch vexation data
  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await getVexationById(id)
        if (data) {
          setVexation(data)
          setLocalUpvotes(data.upvotes)
          setIsSaved(user ? data.savedBy.includes(user.uid) : false)

          // Increment view count (fire and forget)
          incrementViewCount(id).catch(() => {})

          // Check if user has voted
          if (user) {
            const voted = await hasUserVoted(id, user.uid)
            setHasVoted(voted)
          }
        }
      } catch (err) {
        console.error('Failed to load vexation:', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id, user])

  // ── Upvote handler ──
  async function handleUpvote() {
    if (!user || voteLoading) return
    setVoteLoading(true)
    try {
      const added = await upvoteVexation(id, user.uid)
      setHasVoted(added)
      setLocalUpvotes((prev) => (added ? prev + 1 : prev - 1))
    } catch (err) {
      console.error('Upvote failed:', err)
    } finally {
      setVoteLoading(false)
    }
  }

  // ── Save/bookmark handler ──
  async function handleSave() {
    if (!user) return
    try {
      await toggleSaveVexation(id, user.uid, isSaved)
      setIsSaved(!isSaved)
    } catch (err) {
      console.error('Save failed:', err)
    }
  }

  // ── Share handler ──
  function handleShare() {
    navigator.clipboard.writeText(window.location.href)
    setShareTooltip(true)
    setTimeout(() => setShareTooltip(false), 2000)
  }

  // ── Loading state ──
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-indigo-400" />
      </div>
    )
  }

  // ── Not found ──
  if (!vexation) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-2xl font-bold text-white mb-2">Vexation not found</h1>
        <p className="text-gray-400 mb-6">
          This problem may have been removed or doesn't exist.
        </p>
        <Link
          to="/browse"
          className="text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          ← Back to Browse
        </Link>
      </div>
    )
  }

  const severityStyle =
    SEVERITY_STYLES[vexation.severity] || SEVERITY_STYLES.low

  // ── Complexity score visual (map to number for the visual) ──
  const complexityScore =
    vexation.technicalComplexity === 'advanced'
      ? 8.5
      : vexation.technicalComplexity === 'intermediate'
        ? 5.5
        : 3.0

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* ── Breadcrumb + actions bar ── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Link to="/browse" className="hover:text-white transition-colors">
              Vexations
            </Link>
            <span>›</span>
            <span className="text-gray-300 truncate max-w-xs">
              {vexation.title}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Share */}
            <div className="relative">
              <button
                onClick={handleShare}
                className="p-2 rounded-lg border border-slate-700 text-gray-400 hover:text-white hover:border-slate-600 transition-colors"
                aria-label="Share"
              >
                <Share2 size={18} />
              </button>
              {shareTooltip && (
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-emerald-400 whitespace-nowrap">
                  Link copied!
                </span>
              )}
            </div>

            {/* Bookmark */}
            <button
              onClick={handleSave}
              disabled={!user}
              className={`p-2 rounded-lg border transition-colors ${
                isSaved
                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                  : 'border-slate-700 text-gray-400 hover:text-white hover:border-slate-600'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
              aria-label={isSaved ? 'Remove bookmark' : 'Bookmark'}
              title={!user ? 'Sign in to bookmark' : ''}
            >
              <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── LEFT COLUMN (2/3 width) ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-indigo-600/20 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-indigo-400">
                {vexation.sector}
              </span>
              <span className={`rounded-md px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${severityStyle}`}>
                {vexation.severity} impact
              </span>
              <span className="text-xs text-gray-500">
                • Reported by {vexation.authorDisplayName} • {formatTimeAgo(vexation.createdAt)}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
              {vexation.title}
            </h1>

            {/* Description / "The Natural Language Vent" */}
            <div className="relative rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
              <span className="absolute top-4 right-6 text-6xl font-serif text-slate-700/50 leading-none select-none">
                "
              </span>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-4">
                The Natural Language Vent
              </h3>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {vexation.description}
              </p>
            </div>

            {/* Footer: upvotes, comments, contact */}
            <div className="flex items-center gap-4 border-t border-slate-700/50 pt-4">
              <button
                onClick={handleUpvote}
                disabled={!user || voteLoading}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  hasVoted
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'bg-slate-800 text-gray-400 border border-slate-700 hover:text-white hover:border-slate-600'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
                title={!user ? 'Sign in to upvote' : ''}
              >
                <ThumbsUp size={16} fill={hasVoted ? 'currentColor' : 'none'} />
                {localUpvotes}
              </button>

              <span className="flex items-center gap-2 text-sm text-gray-500">
                <MessageSquare size={16} />
                {vexation.commentCount} Comments
              </span>
            </div>

            {/* Tags */}
            {vexation.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {vexation.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-slate-800 border border-slate-700/50 px-3 py-1 text-xs text-gray-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN — AI Technical Insights (1/3 width) ── */}
          <div className="space-y-6">
            {/* AI Insights Card */}
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-2 px-5 py-4 bg-slate-800/50 border-b border-slate-700/50">
                <Shield size={18} className="text-indigo-400" />
                <span className="text-sm font-semibold text-white">
                  AI Technical Insights
                </span>
              </div>

              <div className="p-5 space-y-5">
                {/* Complexity Score */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">
                      Complexity Score
                    </span>
                    <span className="text-2xl font-bold text-white">
                      {complexityScore}
                      <span className="text-sm font-normal text-gray-500">
                        /10
                      </span>
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all"
                      style={{ width: `${complexityScore * 10}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {vexation.technicalComplexity.charAt(0).toUpperCase() +
                      vexation.technicalComplexity.slice(1)}{' '}
                    level difficulty
                  </p>
                </div>

                {/* Suggested Tech Stack */}
                {vexation.suggestedTechStack.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                      Suggested Tech Stack
                    </h4>
                    <div className="space-y-2">
                      {vexation.suggestedTechStack.map((tech) => (
                        <div
                          key={tech}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Cpu size={14} className="text-gray-500 shrink-0" />
                          <span className="text-gray-300">{tech}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Challenges */}
                {vexation.keyChallenges.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                      Key Challenges
                    </h4>
                    <ul className="space-y-2">
                      {vexation.keyChallenges.map((challenge, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-gray-400"
                        >
                          <AlertTriangle
                            size={14}
                            className="text-amber-500 shrink-0 mt-0.5"
                          />
                          <span>{challenge}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* AI Summary Card */}
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                AI Summary
              </h4>
              <p className="text-sm text-gray-300 leading-relaxed">
                {vexation.summary}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Helper: relative time ──
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
