import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect, useMemo } from 'react'
import { 
  Search, Plus, Zap, Target, 
  Bookmark, CheckCircle2,
} from 'lucide-react'
import { useAuth } from '../../lib/auth/AuthContext'
import { getClaimedVexations, getSavedVexations, getApprovedSolutionsBySolver, getVexationById } from '../../lib/db'
import type { Vexation, Solution } from '../../types'
import ClaimCard from '../../components/cards/ClaimCard'

export const Route = createFileRoute('/my/claimed')({
  component: ClaimedVexationsPage,
})

function ClaimedVexationsPage() {
  const { user, userProfile } = useAuth()
  const [claimedVexations, setClaimedVexations] = useState<Vexation[]>([])
  const [bookmarkedVexations, setBookmarkedVexations] = useState<Vexation[]>([])
  const [completedSolutions, setCompletedSolutions] = useState<(Solution & { vexation?: Vexation | null  })[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'Claimed' | 'Bookmarked' | 'Completed'>('Claimed')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'severity'>('newest')

  // Tab configurations corresponding to UI mocked tabs
  const tabs = [
    { id: 'Claimed', label: 'Claimed', count: claimedVexations.length, icon: <Zap size={14} /> },
    { id: 'Bookmarked', label: 'Bookmarked', count: bookmarkedVexations.length, icon: <Bookmark size={14} /> },
    { id: 'Completed', label: 'Completed', count: completedSolutions.length, icon: <CheckCircle2 size={14} /> },
  ]

  useEffect(() => {
    async function loadClaimed() {
      if (!user) return
      try {
        const [claimed, bookmarked, approved] = await Promise.all([
          getClaimedVexations(user.uid),
          getSavedVexations(user.uid),
          getApprovedSolutionsBySolver(user.uid)
        ])

        setClaimedVexations(claimed)
        setBookmarkedVexations(bookmarked)

        const withVexations = await Promise.all(
          approved.map(async (sol) => {
            const vexation = await getVexationById(sol.vexationId)
            return { ...sol, vexation }
          })
        )
        setCompletedSolutions(withVexations)
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
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">Your Vexations</h1>
            <p className="text-sm text-slate-400">
              You have <span className="text-[#553CFF] font-semibold">{claimedVexations.length || 12} active</span> challenges currently in progress.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full md:w-auto">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="text" 
                  placeholder="Search issues..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#1A1825] border border-white/5 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#553CFF] w-full sm:w-[200px] md:w-[260px] transition-colors placeholder:text-slate-500 font-medium"
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
        <div className="flex items-center gap-4 sm:gap-8 border-b border-white/10 mb-8 overflow-x-auto no-scrollbar">
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
        ) : activeTab === 'Completed' && completedSolutions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedSolutions
              .filter((sol) => {
                if (!searchQuery) return true
                const q = searchQuery.toLowerCase()
                return (
                  sol.title.toLowerCase().includes(q) ||
                  sol.description.toLowerCase().includes(q) ||
                  (sol.vexation?.title.toLowerCase().includes(q) ?? false)
                )
              })
              .map((sol) => (
                <Link
                  key={sol.id}
                  to="/solution/$id"
                  params={{ id: sol.id }}
                  className="block"
                >
                  <div className="bg-[#1A1825] border border-emerald-500/10 hover:border-emerald-500/30 transition-colors rounded-xl p-6 flex flex-col group h-full">
                    <div className="flex items-center justify-between mb-4 mt-1">
                      <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-emerald-400">
                        <CheckCircle2 size={12} />
                        APPROVED
                      </div>
                      <span className="text-[11px] font-medium text-slate-500">
                        {sol.approvedAt?.toDate?.().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) ?? ''}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-emerald-300 transition-colors line-clamp-2">
                      {sol.title}
                    </h3>
                    <p className="text-[13px] text-slate-400 mb-4 flex-1 line-clamp-2 leading-relaxed">
                      {sol.description}
                    </p>

                    {sol.vexation && (
                      <p className="text-[11px] text-slate-500 mb-5">
                        Solved <span className="text-slate-300 font-medium">{sol.vexation.title}</span>
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex flex-wrap items-center gap-2">
                        {sol.techStack?.slice(0, 3).map((tech) => (
                          <span key={tech} className="border border-white/10 px-2.5 py-1 rounded text-[9px] font-bold text-slate-400 tracking-widest uppercase">
                            {tech}
                          </span>
                        ))}
                      </div>
                      <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg text-[12px] font-bold">
                        View
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        ) : activeTab === 'Completed' ? (
          <div className="border border-white/5 bg-[#151320] rounded-2xl p-16 text-center flex flex-col items-center">
            <CheckCircle2 size={48} className="text-slate-700 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No completed solutions yet</h3>
            <p className="text-slate-400 max-w-sm mb-8 text-sm leading-relaxed">
              Solutions you submit that get approved by the poster will appear here.
            </p>
            <Link to="/browse" className="bg-[#553CFF] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#4A34DF] transition-colors">
              Find Problems
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  )
}
