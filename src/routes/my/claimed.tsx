import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect, useMemo } from 'react'
import { 
  Search, Plus, Zap, Target, Bookmark, 
  CheckCircle2, Trophy 
} from 'lucide-react'
import { useAuth } from '../../lib/auth/AuthContext'
import { getClaimedVexations, getSavedVexations } from '../../lib/db'
import type { Vexation } from '../../types'
import ClaimCard from '../../components/cards/ClaimCard'

export const Route = createFileRoute('/my/claimed')({
  component: ClaimedVexationsPage,
})

function ClaimedVexationsPage() {
  const { user, userProfile } = useAuth()
  const [claimedVexations, setClaimedVexations] = useState<Vexation[]>([])
  const [bookmarkedVexations, setBookmarkedVexations] = useState<Vexation[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'Claimed' | 'Bookmarked' | 'Completed'>('Claimed')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'severity'>('newest')

  // Tab configurations corresponding to UI mocked tabs
  const tabs = [
    { id: 'Claimed', label: 'Claimed', count: claimedVexations.length || 12, icon: <Zap size={14} /> },
    { id: 'Bookmarked', label: 'Bookmarked', count: bookmarkedVexations.length || 24, icon: <Bookmark size={14} /> },
    { id: 'Completed', label: 'Completed', count: 142, icon: <CheckCircle2 size={14} /> },
  ]

  useEffect(() => {
    async function loadClaimed() {
      if (!user) return
      try {
        const [claimed, bookmarked] = await Promise.all([
          getClaimedVexations(user.uid),
          getSavedVexations(user.uid)
        ])

        setClaimedVexations(claimed)
        setBookmarkedVexations(bookmarked)
      } catch (err) {
        console.error('Failed to load active workspace data: ', err)
      } finally {
        setLoading(false)
      }
    }
    loadClaimed()
  }, [user])

  // Filter & Sort Logic
  const filteredAndSorted = useMemo(() => {
    const sourceVexations = activeTab === 'Claimed' ? claimedVexations :
                            activeTab === 'Bookmarked' ? bookmarkedVexations :
                            []

    return sourceVexations
      .filter((vex) => {
        const query = searchQuery.toLowerCase()

        return (
          vex.title.toLowerCase().includes(query) ||
          vex.description.toLowerCase().includes(query) ||
          vex.sector.toLowerCase().includes(query)
        )
      })
      .sort((a, b) => {
        if (sortBy === 'oldest') return a.createdAt.toMillis() - b.createdAt.toMillis()
        if (sortBy === 'severity') {
          const severities: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 }
          const sa = severities[a.severity] || 0
          const sb = severities[b.severity] || 0

          return sb - sa
        }

        return b.createdAt.toMillis() - a.createdAt.toMillis()
      })
  }, [claimedVexations, bookmarkedVexations, searchQuery, sortBy, activeTab])

  // Security layer check
  if (!user || userProfile?.role !== 'Solver') {
    return (
      <div className="min-h-screen bg-[#0D0C15] flex flex-col items-center justify-center p-6 text-center text-white">
        <Target size={48} className="text-gray-600 mb-4" />
        <h2 className="text-xl font-bold mb-2">Unauthorized Access</h2>
        <p className="text-gray-400 max-w-sm">
          You must be signed in as a Developer to view the workspace.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0D0C15] text-white px-6 py-8 md:px-10 lg:px-12 font-sans">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 mt-2">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">Your Vexations</h1>
            <p className="text-sm text-slate-400">
              You have <span className="text-[#553CFF] font-semibold">{claimedVexations.length || 12} active</span> challenges currently in progress.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="text" 
                  placeholder="Search issues..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#1A1825] border border-white/5 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#553CFF] w-[200px] md:w-[260px] transition-colors placeholder:text-slate-500 font-medium"
                />
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#1A1825] border border-white/5 disabled:opacity-50 text-slate-400 text-sm font-medium rounded-lg px-3 py-2 cursor-pointer focus:outline-none focus:border-[#553CFF] transition-colors outline-none"
              >
                <option value="newest">Sort: Newest</option>
                <option value="oldest">Sort: Oldest</option>
                <option value="severity">Sort: Severity</option>
              </select>
            </div>

            <Link to="/browse" className="bg-[#553CFF] hover:bg-[#4A34DF] text-white px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shrink-0">
              <Plus size={16} />
              New Issue
            </Link>
          </div>

        </div>

        {/* Tabs */}
        <div className="flex items-center gap-8 border-b border-white/10 mb-8 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2.5 pb-3.5 px-1 border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'border-[#553CFF] text-[#553CFF]' 
                  : 'border-transparent text-slate-400 hover:text-slate-300 cursor-pointer'
              }`}
            >
              {tab.icon}
              <span className="text-sm font-semibold">{tab.label}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                activeTab === tab.id ? 'bg-[#553CFF]/15 text-[#553CFF]' : 'bg-white/5 text-slate-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Grid of Cards */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#553CFF]"></div>
          </div>
        ) : (activeTab === 'Claimed' || activeTab === 'Bookmarked') && filteredAndSorted.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSorted.map((vex) => (
              <Link
                key={vex.id}
                to='/vexation/$id'
                params={{ id: vex.id }}
              >
                <ClaimCard
                  vexation={vex}
                  variant={activeTab === 'Claimed' ? 'claimed' : 'bookmarked'}
                />
              </Link>
            ))}
          </div>
        ) : (activeTab === 'Claimed' || activeTab === 'Bookmarked') ? (
          <div className="border border-white/5 bg-[#151320] rounded-2xl p-16 text-center flex flex-col items-center">
            {activeTab === 'Claimed' ? <Zap size={48} className="text-slate-700 mb-4" /> : <Bookmark size={48} className="text-slate-700 mb-4" />}
            <h3 className="text-xl font-bold text-white mb-2">No active {activeTab.toLowerCase()}</h3>
            <p className="text-slate-400 max-w-sm mb-8 text-sm leading-relaxed">
              You don't have any vexations in this section. Head to the Browse page to find a new challenge.
            </p>
            <Link to="/browse" className="bg-[#553CFF] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#4A34DF] transition-colors">
              Find Problems
            </Link>
          </div>
        ) : (
          <div className="border border-white/5 bg-[#151320] rounded-xl p-12 text-center text-slate-500 font-medium">
            [ Placeholder for {activeTab} Tab — Connect Data Later! ]
          </div>
        )}

        {/* Bottom Streak Box */}
        <div className="mt-8 bg-[#151320] border border-white/5 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-[#553CFF]/10 rounded-2xl flex items-center justify-center border border-[#553CFF]/20 shadow-[inset_0_0_15px_rgba(85,60,255,0.1)]">
              <Trophy className="text-[#553CFF]" size={26} />
            </div>
            <div>
              <h4 className="text-white text-[17px] font-bold mb-1">Claimed streak: 5 days</h4>
              <p className="text-sm text-slate-400 font-medium">Solve 2 more today to reach your goal.</p>
            </div>
          </div>
          
          {/* Avatar stack mock */}
          <div className="flex -space-x-3 sm:flex">
             <div className="w-9 h-9 rounded-full bg-slate-800 border-2 border-[#151320] flex items-center justify-center text-[10px] font-bold text-slate-400 z-30">KD</div>
             <div className="w-9 h-9 rounded-full bg-indigo-800 border-2 border-[#151320] flex items-center justify-center text-[10px] font-bold text-indigo-300 z-20">AL</div>
             <div className="w-9 h-9 rounded-full bg-emerald-800 border-2 border-[#151320] flex items-center justify-center text-[10px] font-bold text-emerald-300 z-10">JS</div>
             <div className="w-9 h-9 rounded-full bg-[#2A263D] border-2 border-[#151320] flex items-center justify-center text-[10px] font-bold text-white z-0">+12</div>
          </div>
        </div>

      </div>
    </div>
  )
}
