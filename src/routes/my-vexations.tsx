import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect, useMemo } from 'react'
import { Loader2, Plus, FileText } from 'lucide-react'
import { getUserVexations } from '../lib/firestore'
import { useAuth } from '../lib/auth'
import type { Vexation, VexationStatus } from '../lib/types'

export const Route = createFileRoute('/my-vexations')({
  component: MyVexationsPage,
})

const STATUS_STYLES: Record<VexationStatus, string> = {
  pending: 'bg-gray-500/20 text-gray-400',
  analyzed: 'bg-emerald-500/20 text-emerald-400',
  claimed: 'bg-amber-500/20 text-amber-400',
  solved: 'bg-blue-500/20 text-blue-400',
  closed: 'bg-slate-500/20 text-slate-400',
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

  // Filter by status tab
  const filtered = useMemo(() => {
    if (activeTab === 'all') return vexations
    return vexations.filter((v) => v.status === activeTab)
  }, [vexations, activeTab])

  // Stats
  const totalCount = vexations.length
  const publishedCount = vexations.filter(
    (v) => v.status === 'analyzed' || v.status === 'claimed'
  ).length
  const draftCount = vexations.filter((v) => v.status === 'pending').length

  // Not signed in
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center px-6">
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

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All Problems' },
    { key: 'analyzed', label: 'Published' },
    { key: 'solved', label: 'Solved' },
    { key: 'closed', label: 'Closed' },
  ]

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">My Vexations</h1>
            <p className="text-gray-400">
              Manage, track, and refine the problems you've identified.
            </p>
          </div>

          {/* Stats cards */}
          <div className="flex gap-3">
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 px-4 py-2 text-center">
              <p className="text-xs uppercase tracking-wider text-indigo-400">Total</p>
              <p className="text-2xl font-bold text-white">{totalCount}</p>
            </div>
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 px-4 py-2 text-center">
              <p className="text-xs uppercase tracking-wider text-emerald-400">Published</p>
              <p className="text-2xl font-bold text-white">{publishedCount}</p>
            </div>
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 px-4 py-2 text-center">
              <p className="text-xs uppercase tracking-wider text-gray-400">Drafts</p>
              <p className="text-2xl font-bold text-white">{draftCount}</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-gray-400 hover:text-white border border-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-indigo-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg mb-2">No vexations found.</p>
            <Link
              to="/submit"
              search={{ prefill: '' }}
              className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <Plus size={16} /> Submit your first vexation
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-700/50 overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 bg-slate-800/50 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <span className="col-span-5">Problem Title</span>
              <span className="col-span-2">Status</span>
              <span className="col-span-2">Upvotes</span>
              <span className="col-span-3">Submitted</span>
            </div>

            {/* Table rows */}
            {filtered.map((vex) => (
              <Link
                key={vex.id}
                to="/vexation/$id"
                params={{ id: vex.id }}
                className="grid grid-cols-12 gap-4 items-center px-5 py-4 border-t border-slate-800 hover:bg-slate-800/30 transition-colors group"
              >
                <div className="col-span-5 flex items-center gap-3 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                  <span className="text-sm text-white font-medium truncate group-hover:text-indigo-300 transition-colors">
                    {vex.title}
                  </span>
                </div>
                <div className="col-span-2">
                  <span
                    className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold uppercase ${
                      STATUS_STYLES[vex.status] || STATUS_STYLES.pending
                    }`}
                  >
                    {vex.status}
                  </span>
                </div>
                <div className="col-span-2 text-sm text-gray-400">
                  {vex.upvotes}
                </div>
                <div className="col-span-3 text-sm text-gray-500">
                  {formatDate(vex.createdAt)}
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
