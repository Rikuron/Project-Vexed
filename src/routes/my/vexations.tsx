import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect, useMemo } from 'react'
import {
  Loader2, Plus, FileText, ChevronRight,
  BarChart3, Send, PenLine,
} from 'lucide-react'
import { getUserVexations } from '../../lib/db'
import { useAuth } from '../../lib/auth/AuthContext'
import type { Vexation, VexationStatus } from '../../types'

export const Route = createFileRoute('/my/vexations')({
  component: MyVexationsPage,
})

const STATUS_STYLES: Record<VexationStatus, string> = {
  Pending: 'bg-gray-500/15 text-gray-400 border border-gray-500/20',
  Analyzed: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  Claimed: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  Solved: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  Closed: 'bg-slate-500/15 text-slate-400 border border-slate-500/20',
}

type FilterTab = 'all' | VexationStatus

function MyVexationsPage() {
  const { user, loading: authLoading } = useAuth()
  const [vexations, setVexations] = useState<Vexation[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<FilterTab>('all')

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    setLoading(true)
    getUserVexations(user.uid)
      .then(setVexations)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  const filtered = useMemo(() => {
    if (activeTab === 'all') return vexations
    return vexations.filter((v) => v.status === activeTab)
  }, [vexations, activeTab])

  const totalCount = vexations.length
  const publishedCount = vexations.filter(
    (v) => v.status === 'Analyzed' || v.status === 'Claimed'
  ).length
  const draftCount = vexations.filter((v) => v.status === 'Pending').length

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-vexed-bg2 flex flex-col items-center justify-center text-center px-6">
        <FileText size={48} className="text-gray-600 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">
          Sign in to view your vexations
        </h1>
        <p className="text-gray-400 mb-6">
          Track and manage the problems you've submitted.
        </p>
      </div>
    )
  }

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: totalCount },
    { key: 'Analyzed', label: 'Published', count: vexations.filter((v) => v.status === 'Analyzed').length },
    { key: 'Claimed', label: 'Claimed', count: vexations.filter((v) => v.status === 'Claimed').length },
    { key: 'Solved', label: 'Solved', count: vexations.filter((v) => v.status === 'Solved').length },
    { key: 'Closed', label: 'Closed', count: vexations.filter((v) => v.status === 'Closed').length },
  ]

  return (
    <div className="min-h-screen bg-vexed-bg2 overflow-hidden relative">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-vexed-highlight1/8 blur-[120px]" />
        <div className="absolute top-1/2 -left-40 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] rounded-full bg-vexed-primary/6 blur-[100px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-24 lg:pb-8">
        {/* Header */}
        <div className="mb-8 mt-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-1">
            My Vexations
          </h1>
          <p className="text-sm text-slate-400">
            Manage, track, and refine the problems you've identified.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="rounded-xl border border-white/5 bg-vexed-bg1/60 backdrop-blur-sm px-4 py-3.5">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-vexed-highlight1/10 flex items-center justify-center">
                <BarChart3 size={14} className="text-vexed-highlight2" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total</span>
            </div>
            <p className="text-2xl font-bold text-white">{totalCount}</p>
          </div>

          <div className="rounded-xl border border-white/5 bg-vexed-bg1/60 backdrop-blur-sm px-4 py-3.5">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Send size={14} className="text-emerald-400" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Live</span>
            </div>
            <p className="text-2xl font-bold text-white">{publishedCount}</p>
          </div>

          <div className="rounded-xl border border-white/5 bg-vexed-bg1/60 backdrop-blur-sm px-4 py-3.5">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-slate-500/10 flex items-center justify-center">
                <PenLine size={14} className="text-slate-400" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Drafts</span>
            </div>
            <p className="text-2xl font-bold text-white">{draftCount}</p>
          </div>
        </div>

        {/* Underline Tabs */}
        <div className="flex items-center gap-4 sm:gap-6 border-b border-white/10 mb-6 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 pb-3 px-1 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.key
                  ? 'border-vexed-highlight1 text-vexed-highlight2'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className="text-sm font-semibold">{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  activeTab === tab.key
                    ? 'bg-vexed-highlight1/15 text-vexed-highlight2'
                    : 'bg-white/5 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-vexed-highlight2" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="border border-white/5 bg-vexed-bg1/40 rounded-2xl p-12 sm:p-16 text-center flex flex-col items-center">
            <FileText size={48} className="text-slate-700 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No vexations found</h3>
            <p className="text-slate-400 max-w-sm mb-6 text-sm leading-relaxed">
              You haven't submitted any problems yet. Share a challenge you're facing and let the community help.
            </p>
            <Link
              to="/submit"
              search={{ prefill: '' }}
              className="inline-flex items-center gap-2 bg-vexed-highlight1 hover:bg-vexed-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              <Plus size={16} /> Submit a Vexation
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((vex) => (
              <Link
                key={vex.id}
                to="/vexation/$id"
                params={{ id: vex.id }}
                className="block rounded-xl border border-white/5 bg-vexed-bg1/50 hover:bg-vexed-bg1/80 hover:border-vexed-highlight1/20 p-4 sm:p-5 transition-all group"
              >
                {/* Top row: title + chevron */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-[15px] font-semibold text-white group-hover:text-vexed-highlight2 transition-colors leading-snug">
                    {vex.title}
                  </h3>
                  <ChevronRight
                    size={16}
                    className="text-slate-600 group-hover:text-vexed-highlight2 shrink-0 mt-0.5 transition-colors"
                  />
                </div>

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span
                    className={`inline-flex rounded-md px-2 py-0.5 font-semibold uppercase tracking-wide ${
                      STATUS_STYLES[vex.status] || STATUS_STYLES.Pending
                    }`}
                  >
                    {vex.status}
                  </span>

                  {vex.sector && (
                    <span className="rounded-md bg-vexed-accent1 border border-white/5 px-2 py-0.5 text-slate-400">
                      {vex.sector}
                    </span>
                  )}

                  <span className="text-slate-500 ml-auto flex items-center gap-3">
                    <span>{vex.upvotes} upvotes</span>
                    <span>{formatDate(vex.createdAt)}</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function formatDate(timestamp: any): string {
  if (!timestamp?.toDate) return ''
  return timestamp.toDate().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}