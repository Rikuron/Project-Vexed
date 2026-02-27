import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect, useMemo } from 'react'
import { Search, ThumbsUp, Eye, Loader2, LayoutGrid, List } from 'lucide-react'
import { getVexations } from '../lib/firestore'
import type { Vexation, Sector, Complexity, VexationFilters } from '../lib/types'
import { SECTORS } from '../lib/types'

export const Route = createFileRoute('/browse')({ component: BrowsePage })

// Severity colors for pain-level bars
const SEVERITY_COLORS: Record<string, string> = {
  low: 'bg-emerald-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
}

const SECTOR_BADGE_COLORS: Record<string, string> = {
  health: 'bg-emerald-500/20 text-emerald-400',
  finance: 'bg-blue-500/20 text-blue-400',
  logistics: 'bg-amber-500/20 text-amber-400',
  productivity: 'bg-cyan-500/20 text-cyan-400',
  education: 'bg-purple-500/20 text-purple-400',
  environment: 'bg-green-500/20 text-green-400',
  social: 'bg-pink-500/20 text-pink-400',
  technology: 'bg-indigo-500/20 text-indigo-400',
  'ai/ml': 'bg-violet-500/20 text-violet-400',
  other: 'bg-gray-500/20 text-gray-400',
}

type SortOption = 'trending' | 'newest' | 'upvotes'

function BrowsePage() {
  const [vexations, setVexations] = useState<Vexation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Filters
  const [sector, setSector] = useState<Sector | ''>('')
  const [complexity, setComplexity] = useState<Complexity | ''>('')
  const [sortBy, setSortBy] = useState<SortOption>('trending')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Fetch vexations when filters change
  useEffect(() => {
    setLoading(true)
    const filters: VexationFilters = {
      sortBy,
      limit: 20,
    }
    if (sector) filters.sector = sector
    if (complexity) filters.complexity = complexity

    getVexations(filters)
      .then(setVexations)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [sector, complexity, sortBy])

  // Client-side search filtering (Firestore doesn't support full-text search natively)
  const filteredVexations = useMemo(() => {
    if (!searchQuery.trim()) return vexations
    const q = searchQuery.toLowerCase()
    return vexations.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.summary.toLowerCase().includes(q) ||
        v.tags.some((t) => t.toLowerCase().includes(q))
    )
  }, [vexations, searchQuery])

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Top Bar: Search + Submit CTA */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              placeholder="Search problems, sectors, or pain levels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 pl-11 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
            />
          </div>
          <Link
            to="/submit"
            search={{ prefill: '' }}
            className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition-colors whitespace-nowrap"
          >
            Submit Problem
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Sector filter */}
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value as Sector | '')}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-indigo-500/60"
          >
            <option value="">Sector: All</option>
            {SECTORS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>

          {/* Complexity filter */}
          <select
            value={complexity}
            onChange={(e) => setComplexity(e.target.value as Complexity | '')}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-indigo-500/60"
          >
            <option value="">Complexity: Any</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Sort toggles */}
          <div className="flex items-center rounded-lg border border-slate-700 bg-slate-800 overflow-hidden">
            {(['trending', 'newest', 'upvotes'] as SortOption[]).map((opt) => (
              <button
                key={opt}
                onClick={() => setSortBy(opt)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  sortBy === opt
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </button>
            ))}
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 border border-slate-700 rounded-lg p-1 bg-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-slate-700 text-white' : 'text-gray-500'}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-slate-700 text-white' : 'text-gray-500'}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">
            Discovered Problems{' '}
            <span className="text-sm font-normal text-gray-500 ml-2">
              {filteredVexations.length} results
            </span>
          </h1>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-indigo-400" />
          </div>
        ) : filteredVexations.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg mb-2">No problems found.</p>
            <p className="text-sm">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'flex flex-col gap-3'
            }
          >
            {filteredVexations.map((vex) => (
              <VexationCard key={vex.id} vexation={vex} viewMode={viewMode} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Vexation Card Component
function VexationCard({
  vexation: vex,
  viewMode,
}: {
  vexation: Vexation
  viewMode: 'grid' | 'list'
}) {
  const sectorColor =
    SECTOR_BADGE_COLORS[vex.sector] || SECTOR_BADGE_COLORS.other
  const severityColor = SEVERITY_COLORS[vex.severity] || SEVERITY_COLORS.low

  // Severity percentage for the visual bar
  const severityPercent =
    vex.severity === 'critical'
      ? 98
      : vex.severity === 'high'
        ? 75
        : vex.severity === 'medium'
          ? 50
          : 25

  if (viewMode === 'list') {
    return (
      <Link
        to="/vexation/$id"
        params={{ id: vex.id }}
        className="group flex items-center gap-4 rounded-xl border border-slate-700/50 bg-slate-800/30 p-4 hover:border-indigo-500/40 hover:bg-slate-800/50 transition-all"
      >
        {/* Sector badge */}
        <span className={`rounded-md px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider shrink-0 ${sectorColor}`}>
          {vex.sector}
        </span>

        {/* Title + summary */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold group-hover:text-indigo-300 transition-colors truncate">
            {vex.title}
          </h3>
          <p className="text-sm text-gray-500 truncate">{vex.summary}</p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-500 shrink-0">
          <span className="flex items-center gap-1">
            <ThumbsUp size={12} /> {vex.upvotes}
          </span>
          <span className="flex items-center gap-1">
            <Eye size={12} /> {vex.viewCount}
          </span>
          <span className="capitalize">{vex.technicalComplexity}</span>
        </div>
      </Link>
    )
  }

  return (
    <Link
      to="/vexation/$id"
      params={{ id: vex.id }}
      className="group flex flex-col rounded-xl border border-slate-700/50 bg-slate-800/30 p-5 hover:border-indigo-500/40 hover:bg-slate-800/50 transition-all duration-200"
    >
      {/* Top: sector badge + overflow menu placeholder */}
      <div className="flex items-center justify-between mb-3">
        <span className={`rounded-md px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${sectorColor}`}>
          {vex.sector}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-white font-semibold mb-2 group-hover:text-indigo-300 transition-colors line-clamp-2">
        {vex.title}
      </h3>

      {/* Summary */}
      <p className="text-sm text-gray-400 mb-4 line-clamp-2 flex-1">
        {vex.summary}
      </p>

      {/* Pain level bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>Pain Level: {vex.severity.charAt(0).toUpperCase() + vex.severity.slice(1)}</span>
          <span>{severityPercent}% Intensity</span>
        </div>
        <div className="h-1 rounded-full bg-slate-700 overflow-hidden">
          <div
            className={`h-full rounded-full ${severityColor} transition-all`}
            style={{ width: `${severityPercent}%` }}
          />
        </div>
      </div>

      {/* Footer: upvotes, views, complexity */}
      <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-slate-700/50">
        <span className="flex items-center gap-1">
          <ThumbsUp size={12} /> {formatCount(vex.upvotes)}
        </span>
        <span className="flex items-center gap-1">
          <Eye size={12} /> {formatCount(vex.viewCount)}
        </span>
        <span className="ml-auto capitalize">{vex.technicalComplexity}</span>
      </div>
    </Link>
  )
}

// Helper: format large numbers
function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}
