import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useMemo } from 'react'
import { Search, LayoutGrid, List, ChevronDown } from 'lucide-react'
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

function BrowsePage() {
  const [vexations, setVexations] = useState<Vexation[]>([])
  const [loading, setLoading] = useState(true)

  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [sectorFilter, setSectorFilter] = useState<Sector | 'All'>('All')
  const [complexityFilter, setComplexityFilter] = useState<Complexity | 'Any'>('Any')
  const [sortOption, setSortOption] = useState<SortOption>('trending')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    const sortMap: Record<SortOption, 'trending' | 'newest' | 'upvotes'> = {
      trending: 'trending',
      newest: 'newest',
      upvotes: 'upvotes',
    }
    getVexations({ sortBy: sortMap[sortOption] })
      .then((data) => setVexations(data.length > 0 ? data : DUMMY_VEXATIONS))
      .catch(() => setVexations(DUMMY_VEXATIONS))
      .finally(() => setLoading(false))
  }, [sortOption])

  // Client-side filtering
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

  return (
    <div className="min-h-screen bg-[#0D0C15] text-white font-sans">
      <div className="max-w-[1400px] mx-auto">

        {/* Full-width 2-column layout: main + sidebar */}
        <div className="flex flex-col lg:flex-row">

          {/* Left: main content area */}
          <div className="flex-1 min-w-0 px-6 py-8 md:px-10">

            {/* Search Bar + Submit */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="text"
                  placeholder="Search problems, sectors, or pain levels..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#1A1825] border border-white/5 rounded-lg pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[#553CFF] w-full transition-colors placeholder:text-slate-500 font-medium"
                />
              </div>
            </div>

            {/* Filters + Sort Row */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              {/* Sector dropdown */}
              <div className="relative">
                <select
                  value={sectorFilter}
                  onChange={(e) => setSectorFilter(e.target.value as Sector | 'All')}
                  className="appearance-none bg-[#1A1825] border border-white/10 text-white text-sm font-medium rounded-lg pl-4 pr-9 py-2 cursor-pointer focus:outline-none focus:border-[#553CFF] transition-colors"
                >
                  <option value="All">Sector: All</option>
                  {SECTORS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>

              {/* Complexity dropdown */}
              <div className="relative">
                <select
                  value={complexityFilter}
                  onChange={(e) => setComplexityFilter(e.target.value as Complexity | 'Any')}
                  className="appearance-none bg-[#1A1825] border border-white/10 text-white text-sm font-medium rounded-lg pl-4 pr-9 py-2 cursor-pointer focus:outline-none focus:border-[#553CFF] transition-colors"
                >
                  <option value="Any">Complexity: Any</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>

              <div className="flex-1" />

              {/* Sort tabs */}
              <div className="flex items-center bg-[#1A1825] border border-white/10 rounded-lg overflow-hidden">
                {(['trending', 'newest', 'upvotes'] as SortOption[]).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSortOption(opt)}
                    className={`px-4 py-2 text-sm font-semibold capitalize transition-colors ${
                      sortOption === opt
                        ? 'bg-[#553CFF] text-white'
                        : 'text-slate-400 hover:text-white cursor-pointer'
                    }`}
                  >
                    {opt === 'upvotes' ? 'Upvotes' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Title row + view toggle */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-baseline gap-3">
                <h2 className="text-xl font-bold">Discovered Problems</h2>
                <div className="flex items-center bg-[#1A1825] border border-white/10 rounded-full px-2 py-1">
                  <span className="text-xs text-slate-500 font-medium">{filteredVexations.length} results</span>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-[#1A1825] border border-white/10 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white cursor-pointer'} transition-colors`}
                  aria-label="Grid view"
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white cursor-pointer'} transition-colors`}
                  aria-label="List view"
                >
                  <List size={16} />
                </button>
              </div>
            </div>

            {/* Card grid */}
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#553CFF]" />
              </div>
            ) : filteredVexations.length === 0 ? (
              <div className="border border-white/5 bg-[#1A1825] rounded-xl p-12 text-center text-slate-500 font-medium">
                No vexations found matching your criteria.
              </div>
            ) : (
              <>
                <div className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'
                    : 'space-y-4'
                }>
                  {filteredVexations.map((vex) => (
                    <BrowseCard key={vex.id} vexation={vex} />
                  ))}
                </div>

                <div className="flex justify-center mt-10">
                  <button className="flex items-center gap-2 px-8 py-3 bg-[#1A1825] border border-white/10 rounded-lg text-sm font-semibold text-slate-300 cursor-pointer hover:text-white hover:border-white/20 transition-colors">
                    Load more problems <ChevronDown size={16} />
                  </button>
                </div>
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