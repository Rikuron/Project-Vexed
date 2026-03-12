import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect, useMemo } from 'react'
import { Search, Compass, ExternalLink } from 'lucide-react'
import { getVexations } from '../lib/db'
import { DUMMY_VEXATIONS } from '../lib/dummyData'
import type { Vexation } from '../types'

export const Route = createFileRoute('/browse')({
  component: BrowsePage,
})

type SortOption = 'newest' | 'trending' | 'upvotes'

function BrowsePage() {
  const [vexations, setVexations] = useState<Vexation[]>([])
  const [loading, setLoading] = useState(true)

  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'All' | 'High Priority' | 'Unclaimed'>('All')
  const [sortOption, setSortOption] = useState<SortOption>('newest')

  useEffect(() => {
    getVexations({ sortBy: sortOption })
      .then((data) => setVexations(data.length > 0 ? data : DUMMY_VEXATIONS))
      .catch(() => setVexations(DUMMY_VEXATIONS))
      .finally(() => setLoading(false))
  }, [sortOption])

  // Simple memory filtering logic to power Tabs and Search
  const filteredVexations = useMemo(() => {
    return vexations.filter((vex) => {
      const matchQuery = vex.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vex.description.toLowerCase().includes(searchQuery.toLowerCase())

      let matchTab = true
      // Types use capital letters (Severity: 'High' | 'Critical')
      if (activeTab === 'High Priority') matchTab = vex.severity === 'High' || vex.severity === 'Critical'
      // Wait for someone to claim it
      if (activeTab === 'Unclaimed') matchTab = vex.status === 'Analyzed' || vex.status === 'Pending'

      return matchQuery && matchTab
    })
  }, [vexations, searchQuery, activeTab])

  // Mocking tag color lookup based on new design constraints
  const getSectorStyle = (sector: string) => {
    const s = sector.toLowerCase()
    if (s.includes('tech') || s.includes('engineering')) return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
    if (s.includes('design') || s.includes('creative')) return 'bg-pink-500/10 text-pink-400 border-pink-500/20'
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  }

  return (
    <div className="min-h-screen bg-[#0D0C15] text-white px-6 py-8 md:px-10 font-sans">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2 flex items-center gap-3">
               <Compass className="text-[#553CFF]" size={28} /> Discover Problems
            </h1>
            <p className="text-slate-400 text-sm">
              Search the Vexed index of real-world frustrations looking for a <span className="text-[#553CFF] font-semibold">technical solution</span>.
            </p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-[280px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="Search issues, technologies, or tags..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#1A1825] border border-white/5 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#553CFF] w-full transition-colors placeholder:text-slate-500 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Tab / Filter Bar */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5 overflow-x-auto no-scrollbar gap-6">
          <div className="flex items-center gap-6 shrink-0">
             {['All', 'High Priority', 'Unclaimed'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`text-sm font-semibold transition-colors pb-4 -mb-4 border-b-2 ${
                    activeTab === tab 
                     ? 'border-[#553CFF] text-white' 
                     : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {tab}
                </button>
             ))}
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Sort By:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="bg-[#151320] border border-white/5 disabled:opacity-50 text-white text-sm font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#553CFF] appearance-none cursor-pointer hover:bg-[#1A1825] transition-colors"
            >
              <option value="newest">Featured</option>
              <option value="trending">Most Popular</option>
              <option value="upvotes">Most Upvoted</option>
            </select>
          </div>
        </div>

        {/* Dynamic Vexation Stack Map */}
        {loading ? (
          <div className="flex justify-center py-20">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#553CFF]"></div>
          </div>
        ) : filteredVexations.length === 0 ? (
          <div className="border border-white/5 bg-[#1A1825] rounded-xl p-12 text-center text-slate-500 font-medium">
             No vexations found matching your criteria.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVexations.map((vex) => (
              <div key={vex.id} className="bg-[#151320] hover:bg-[#1A1825] border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all group flex flex-col md:flex-row gap-6 justify-between">
                   
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-2.5 py-0.5 border rounded text-[10px] font-bold tracking-widest uppercase ${getSectorStyle(vex.sector)}`}>
                      {vex.sector}
                    </span>
                    {vex.severity === 'High' && (
                      <span className="px-2.5 py-0.5 border border-rose-500/20 bg-rose-500/10 rounded text-[10px] font-bold tracking-widest uppercase text-rose-400">
                        High Priority
                      </span>
                    )}
                    {vex.severity === 'Critical' && (
                      <span className="px-2.5 py-0.5 border border-red-500/20 bg-red-500/10 rounded text-[10px] font-bold tracking-widest uppercase text-red-400">
                        Critical
                      </span>
                    )}
                    <span className="text-slate-500 text-xs font-medium">• {vex.viewCount} views</span>
                  </div>

                      
                  <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-indigo-300 transition-colors line-clamp-2">
                    {vex.title}
                  </h3>
                      
                  <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 mb-4">
                        {vex.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-2">
                         <span className="bg-[#0D0C15] border border-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-300 rounded-md">Status: {vex.status}</span>
                         <span className="bg-[#0D0C15] border border-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-300 rounded-md">Complexity: {vex.technicalComplexity || 'Unknown'}</span>
                      </div>
                   </div>

                   <div className="w-full md:w-[220px] shrink-0 flex flex-col items-start md:items-end justify-between border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6">
                      <div className="w-full">
                         <div className="text-left md:text-right mb-4">
                            <span className="text-xs font-bold tracking-wider text-slate-500 uppercase block mb-1">Current Bounty</span>
                            <span className="text-2xl font-black text-white flex items-center md:justify-end gap-1.5">
                               <span className="text-[#553CFF]">₿</span> 1.50
                            </span>
                         </div>
                         <div className="flex -space-x-3 justify-start md:justify-end mb-5">
                             <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-[#151320] flex items-center justify-center text-[9px] font-bold text-slate-300 z-30">US</div>
                             <div className="w-8 h-8 rounded-full bg-indigo-800 border-2 border-[#151320] flex items-center justify-center text-[9px] font-bold text-indigo-200 z-20">ER</div>
                             <div className="w-8 h-8 rounded-full bg-[#2A263D] border-2 border-[#151320] flex items-center justify-center text-[9px] font-bold text-white z-10 text-center leading-none">+4<br/>Watch</div>
                         </div>
                      </div>
                      
                      <Link 
                        to={`/vexation/$id`}
                        params={{ id: vex.id }}
                        className="w-full bg-[#553CFF]/10 hover:bg-[#553CFF] text-[#553CFF] hover:text-white border border-[#553CFF]/20 px-4 py-2.5 rounded-lg text-[13px] font-bold flex items-center justify-center gap-2 transition-all group-hover:shadow-[0_0_15px_rgba(85,60,255,0.2)]"
                      >
                         View Details <ExternalLink size={14} className="opacity-70 group-hover:opacity-100" />
                      </Link>
                   </div>

                </div>
             ))}
          </div>
        )}

      </div>
    </div>
  )
}