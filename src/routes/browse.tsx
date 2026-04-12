import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useMemo } from 'react'
import {
  Search, LayoutGrid, List, ChevronDown,
  ChevronLeft, ChevronRight, Flame, Clock, ArrowUpRight,
} from 'lucide-react'
import { getVexations } from '../lib/db'
import { DUMMY_VEXATIONS } from '../lib/dummyData'
import { SECTORS } from '../types/vexation'
import type { Vexation, Sector, Complexity } from '../types'
import BrowseCard from '../components/cards/BrowseCard'
import TrendingSidebar from '../components/cards/TrendingSidebar'

export const Route = createFileRoute('/browse')({
  component: BrowsePage,
})

type SortOption = 'trending' | 'newest' | 'upvotes'

const ITEMS_PER_PAGE = 10

const SORT_OPTIONS: { key: SortOption; label: string; icon: React.ReactNode }[] = [
  { key: 'trending', label: 'Trending', icon: <Flame size={14} /> },
  { key: 'newest', label: 'Newest', icon: <Clock size={14} /> },
  { key: 'upvotes', label: 'Upvotes', icon: <ArrowUpRight size={14} /> },
]

function BrowsePage() {
  const [vexations, setVexations] = useState<Vexation[]>([])
  const [loading, setLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState('')
  const [sectorFilter, setSectorFilter] = useState<Sector | 'All'>('All')
  const [complexityFilter, setComplexityFilter] = useState<Complexity | 'Any'>('Any')
  const [sortOption, setSortOption] = useState<SortOption>('trending')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setLoading(true)
    getVexations({ sortBy: sortOption })
      .then((data) => setVexations(data.length > 0 ? data : DUMMY_VEXATIONS))
      .catch(() => setVexations(DUMMY_VEXATIONS))
      .finally(() => setLoading(false))
  }, [sortOption])

  const filteredVexations = useMemo(() => {
    return vexations.filter((vex) => {
      const matchQuery =
        vex.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vex.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchSector = sectorFilter === 'All' || vex.sector === sectorFilter
      const matchComplexity = complexityFilter === 'Any' || vex.technicalComplexity === complexityFilter
      return matchQuery && matchSector && matchComplexity
    })
  }, [vexations, searchQuery, sectorFilter, complexityFilter])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, sectorFilter, complexityFilter, sortOption])

  const totalPages = Math.max(1, Math.ceil(filteredVexations.length / ITEMS_PER_PAGE))
  const paginatedVexations = filteredVexations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <div className="min-h-screen bg-vexed-bg2 text-white font-sans overflow-hidden relative">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-vexed-highlight1/6 blur-[120px]" />
        <div className="absolute top-1/3 -right-32 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] rounded-full bg-vexed-primary/5 blur-[100px]" />
      </div>

      <div className="relative max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row">
          {/* Main content */}
          <div className="flex-1 min-w-0 px-4 sm:px-6 py-8 md:px-10 pb-24 lg:pb-8">

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 z-10 " size={18} />
                <input
                  type="text"
                  placeholder="Search problems, sectors, or pain levels..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-vexed-bg1/60 backdrop-blur-sm border border-white/5 focus:border-vexed-highlight1/50 rounded-xl pl-11 pr-4 py-3 text-sm w-full transition-colors placeholder:text-slate-500 font-medium outline-none"
                />
              </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="relative">
                <select
                  value={sectorFilter}
                  onChange={(e) => setSectorFilter(e.target.value as Sector | 'All')}
                  className="appearance-none bg-vexed-bg1/60 backdrop-blur-sm border border-white/10 text-white text-sm font-medium rounded-lg pl-4 pr-9 py-2 cursor-pointer focus:outline-none focus:border-vexed-highlight1/50 transition-colors"
                >
                  <option value="All">Sector: All</option>
                  {SECTORS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={complexityFilter}
                  onChange={(e) => setComplexityFilter(e.target.value as Complexity | 'Any')}
                  className="appearance-none bg-vexed-bg1/60 backdrop-blur-sm border border-white/10 text-white text-sm font-medium rounded-lg pl-4 pr-9 py-2 cursor-pointer focus:outline-none focus:border-vexed-highlight1/50 transition-colors"
                >
                  <option value="Any">Complexity: Any</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>

            {/* Sort Tabs (underline style) */}
            <div className="flex items-center gap-4 sm:gap-6 border-b border-white/10 mb-6 overflow-x-auto no-scrollbar">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSortOption(opt.key)}
                  className={`flex items-center gap-1.5 pb-3 px-1 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                    sortOption === opt.key
                      ? 'border-vexed-highlight1 text-vexed-highlight2'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {opt.icon}
                  <span className="text-sm font-semibold">{opt.label}</span>
                </button>
              ))}
            </div>

            {/* Title row + view toggle */}
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-baseline gap-2.5">
                <h2 className="text-lg sm:text-xl font-bold">Discovered Problems</h2>
                <span className="text-xs text-slate-500 font-medium bg-white/5 rounded-full px-2.5 py-0.5">
                  {filteredVexations.length} results
                </span>
              </div>
              <div className="flex items-center gap-1 bg-vexed-bg1/60 border border-white/10 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded transition-colors cursor-pointer ${
                    viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'
                  }`}
                  aria-label="Grid view"
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded transition-colors cursor-pointer ${
                    viewMode === 'list' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'
                  }`}
                  aria-label="List view"
                >
                  <List size={16} />
                </button>
              </div>
            </div>

            {/* Card Grid */}
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vexed-highlight1" />
              </div>
            ) : filteredVexations.length === 0 ? (
              <div className="border border-white/5 bg-vexed-bg1/40 rounded-2xl p-12 sm:p-16 text-center flex flex-col items-center">
                <Search size={48} className="text-slate-700 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">No problems found</h3>
                <p className="text-slate-400 max-w-sm text-sm leading-relaxed">
                  Try adjusting your filters or search query to find what you're looking for.
                </p>
              </div>
            ) : (
              <>
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'
                      : 'space-y-4'
                  }
                >
                  {paginatedVexations.map((vex) => (
                    <BrowseCard key={vex.id} vexation={vex} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-white/10 bg-vexed-bg1/60 text-slate-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      aria-label="Previous page"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {getPageNumbers(currentPage, totalPages).map((page, i) =>
                      page === '...' ? (
                        <span key={`ellipsis-${i}`} className="px-1 text-slate-600 text-sm">
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page as number)}
                          className={`min-w-[36px] h-9 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                            currentPage === page
                              ? 'bg-vexed-highlight1 text-white'
                              : 'border border-white/10 bg-vexed-bg1/60 text-slate-400 hover:text-white hover:border-white/20'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-white/10 bg-vexed-bg1/60 text-slate-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      aria-label="Next page"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="w-[25%] shrink-0 hidden lg:block border-l border-vexed-accent2 px-6 sticky top-0 h-screen overflow-hidden">
            <TrendingSidebar />
          </div>
        </div>
      </div>
    </div>
  )
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | '...')[] = [1]

  if (current > 3) pages.push('...')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push('...')

  pages.push(total)
  return pages
}